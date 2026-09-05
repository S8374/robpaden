import { AppLogger } from "@/core/logging/logger";
import { PrismaClient } from "@prisma/client";
import { parseISO, isValid, format, differenceInDays } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { EmailService } from "@/core/services/email.service";
import { uploadFileToRustFS } from "@/lib/rustfs";
import { generateReportPdfBuffer } from "@/lib/pdfGenerator";

export class ReportService {
  private logger = new AppLogger("ReportService");
  private emailService = new EmailService();

  constructor(private readonly prisma: PrismaClient) {}

  private async getManagerSettings(managerId: number) {
    const manager = await this.prisma.user.findUnique({
      where: { id: managerId },
      include: { company: { include: { settings: true } } }
    });
    return {
      timeZone: manager?.company?.settings?.timeZone || "UTC",
      officeStartTime: manager?.company?.settings?.officeStartTime || "00:00",
      weeklyResetDay: manager?.company?.settings?.weeklyResetDay || 1
    };
  }

  private getWorkingDayBucket(dateUtc: Date, timeZone: string, officeStartTime: string): Date {
    const localDate = toZonedTime(dateUtc, timeZone);
    const localHour = localDate.getHours();
    const localMinute = localDate.getMinutes();
    
    const [startHourStr, startMinuteStr] = officeStartTime.split(':');
    const startHour = parseInt(startHourStr, 10);
    const startMinute = parseInt(startMinuteStr || '0', 10);
    
    const isPreviousDay = localHour < startHour || (localHour === startHour && localMinute < startMinute);
    
    const workingDayLocal = new Date(localDate);
    if (isPreviousDay) {
      workingDayLocal.setDate(workingDayLocal.getDate() - 1);
    }
    
    const bucketStr = format(workingDayLocal, 'yyyy-MM-dd');
    return new Date(`${bucketStr}T00:00:00.000Z`);
  }

  private getWorkingDayBounds(bucketDateUtc: Date, timeZone: string, officeStartTime: string) {
    const bucketStr = format(bucketDateUtc, 'yyyy-MM-dd');
    const startLocal = `${bucketStr}T${officeStartTime}:00`;
    const fetchStart = fromZonedTime(startLocal, timeZone);
    
    const nextDay = new Date(bucketDateUtc);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);
    const nextDayStr = format(nextDay, 'yyyy-MM-dd');
    const endLocal = `${nextDayStr}T${officeStartTime}:00`;
    const fetchEnd = new Date(fromZonedTime(endLocal, timeZone).getTime() - 1);
    
    return { fetchStart, fetchEnd };
  }

  private getStartOfWeek(bucketDateUtc: Date, weeklyResetDay: number): Date {
    const day = bucketDateUtc.getUTCDay();
    const diff = (day < weeklyResetDay ? 7 : 0) + day - weeklyResetDay;
    const startOfWeek = new Date(bucketDateUtc);
    startOfWeek.setUTCDate(bucketDateUtc.getUTCDate() - diff);
    return startOfWeek;
  }

  private async getDateRange(managerId: number, range: string, customStart?: string, customEnd?: string) {
    const settings = await this.getManagerSettings(managerId);
    const { timeZone, officeStartTime, weeklyResetDay } = settings;

    const currentBucket = this.getWorkingDayBucket(new Date(), timeZone, officeStartTime);

    let startBucket = currentBucket;
    let endBucket = currentBucket;

    switch (range) {
      case 'today':
        startBucket = currentBucket;
        endBucket = currentBucket;
        break;
      case 'week':
        startBucket = this.getStartOfWeek(currentBucket, weeklyResetDay);
        endBucket = currentBucket;
        break;
      case 'month':
        startBucket = new Date(currentBucket);
        startBucket.setUTCDate(1);
        endBucket = currentBucket;
        break;
      case 'custom':
        if (customStart && isValid(parseISO(customStart))) {
          startBucket = new Date(`${customStart}T00:00:00.000Z`);
        }
        if (customEnd && isValid(parseISO(customEnd))) {
          endBucket = new Date(`${customEnd}T00:00:00.000Z`);
        }
        break;
    }

    const { fetchStart: startDate } = this.getWorkingDayBounds(startBucket, timeZone, officeStartTime);
    const { fetchEnd: endDate } = this.getWorkingDayBounds(endBucket, timeZone, officeStartTime);

    return { startDate, endDate, startBucket, endBucket, settings };
  }

  public async getReportSummary(managerId: number, range: string, customStart?: string, customEnd?: string) {
    const { startDate, endDate, startBucket, endBucket, settings } = await this.getDateRange(managerId, range, customStart, customEnd);
    
    // Fetch all confirmed sales for this manager's agents in the range
    const sales = await this.prisma.sale.findMany({
      where: {
        agent: { managerId },
        status: "CONFIRMED",
        createdAt: { gte: startDate, lte: endDate }
      },
      include: {
        agent: { select: { id: true, name: true, avatarUrl: true } }
      }
    });

    const uniqueAgents = new Set(sales.map(s => s.agentId)).size;
    const teamTotal = sales.reduce((sum, s) => sum + s.amount, 0);

    let daysCount = differenceInDays(endBucket, startBucket) + 1;
    if (daysCount < 1) daysCount = 1;
    
    const averageDaily = Math.round(teamTotal / daysCount);

    // Best Day
    const salesByDay: Record<string, number> = {};
    sales.forEach(s => {
      const sBucket = this.getWorkingDayBucket(s.createdAt, settings.timeZone, settings.officeStartTime);
      const day = format(sBucket, 'yyyy-MM-dd');
      salesByDay[day] = (salesByDay[day] || 0) + s.amount;
    });

    let bestDayObj = { count: 0, date: "" };
    Object.entries(salesByDay).forEach(([day, count]) => {
      if (count > bestDayObj.count) {
        bestDayObj = { count, date: day };
      }
    });

    // Top Agent
    const salesByAgent: Record<number, { name: string, count: number }> = {};
    sales.forEach(s => {
      if (!salesByAgent[s.agentId]) {
        salesByAgent[s.agentId] = { name: s.agent.name, count: 0 };
      }
      salesByAgent[s.agentId].count += s.amount;
    });

    let topAgentObj = { name: "", count: 0 };
    Object.values(salesByAgent).forEach(ag => {
      if (ag.count > topAgentObj.count) {
        topAgentObj = ag;
      }
    });

    return {
      teamTotal,
      activeAgents: uniqueAgents,
      averageDaily,
      daysCount,
      bestDay: bestDayObj.count > 0 ? {
        count: bestDayObj.count,
        date: format(parseISO(bestDayObj.date), 'EEE, MMM d')
      } : null,
      topAgent: topAgentObj.count > 0 ? topAgentObj : null
    };
  }

  public async getSalesByAgent(managerId: number, range: string, customStart?: string, customEnd?: string) {
    const { startDate: periodStart, endDate: periodEnd, startBucket, settings } = await this.getDateRange(managerId, range, customStart, customEnd);
    
    // Shift "This Week" to be relative to the requested startBucket
    const targetWeekStartBucket = this.getStartOfWeek(startBucket, settings.weeklyResetDay);
    const targetWeekEndBucket = new Date(targetWeekStartBucket);
    targetWeekEndBucket.setUTCDate(targetWeekEndBucket.getUTCDate() + 6);

    const { fetchStart: startOfTargetWeek } = this.getWorkingDayBounds(targetWeekStartBucket, settings.timeZone, settings.officeStartTime);
    const { fetchEnd: endOfTargetWeek } = this.getWorkingDayBounds(targetWeekEndBucket, settings.timeZone, settings.officeStartTime);

    // We fetch ALL active agents for this manager
    const agents = await this.prisma.user.findMany({
      where: { managerId, role: "AGENT", isActive: true },
      select: { id: true, name: true, avatarUrl: true }
    });

    // Fetch sales for daily and weekly rankings
    const fetchStart = periodStart < startOfTargetWeek ? periodStart : startOfTargetWeek;
    const fetchEnd = periodEnd > endOfTargetWeek ? periodEnd : endOfTargetWeek;

    const allRecentSales = await this.prisma.sale.findMany({
      where: {
        agent: { managerId },
        status: "CONFIRMED",
        createdAt: { gte: fetchStart, lte: fetchEnd }
      }
    });

    // Calculate period and weekly totals for all agents to determine rank
    const agentStats = agents.map(agent => {
      const periodSales = allRecentSales.filter(s => s.agentId === agent.id && s.createdAt >= periodStart && s.createdAt <= periodEnd).reduce((sum, s) => sum + s.amount, 0);
      const weeklySales = allRecentSales.filter(s => s.agentId === agent.id && s.createdAt >= startOfTargetWeek && s.createdAt <= endOfTargetWeek).reduce((sum, s) => sum + s.amount, 0);
      return { ...agent, dailySales: periodSales, weeklySales: weeklySales };
    });

    // Sort to determine ranks
    const sortedByDaily = [...agentStats].sort((a, b) => b.dailySales - a.dailySales);
    const sortedByWeekly = [...agentStats].sort((a, b) => b.weeklySales - a.weeklySales);

    // Fetch corrections (reversals) for the specific range
    const reversals = await this.prisma.salesAuditLog.findMany({
      where: {
        managerId,
        isReversed: true,
        date: { gte: periodStart, lte: periodEnd }
      },
      orderBy: { date: "desc" }
    });

    // Map the results
    return agentStats.map(agent => {
      const dailyRank = sortedByDaily.findIndex(a => a.id === agent.id) + 1;
      const weeklyRank = sortedByWeekly.findIndex(a => a.id === agent.id) + 1;
      
      const agentReversals = reversals.filter(r => r.agentId === agent.id);
      
      let corrections = "None";
      if (agentReversals.length > 0) {
        const latest = agentReversals[0];
        // Time format based on their timezone would be ideal, but for now we fallback to standard
        const localLatestDate = toZonedTime(latest.date, settings.timeZone);
        corrections = `${agentReversals.length} reversed (${format(localLatestDate, 'h:mm a')})`;
      }

      return {
        id: agent.id,
        name: agent.name,
        avatarUrl: agent.avatarUrl,
        daily: agent.dailySales,
        weekly: agent.weeklySales,
        dailyRank,
        weeklyRank,
        corrections
      };
    }).sort((a, b) => b.daily - a.daily); // Default sort by daily
  }

  public async getSalesEntryHistory(managerId: number, range: string, customStart?: string, customEnd?: string) {
    const { startDate, endDate } = await this.getDateRange(managerId, range, customStart, customEnd);
    
    // We combine confirmed sales and reversed sales to show the timeline
    const sales = await this.prisma.sale.findMany({
      where: {
        agent: { managerId },
        createdAt: { gte: startDate, lte: endDate }
      },
      include: {
        agent: { select: { name: true, avatarUrl: true } },
        manager: { select: { name: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return sales.map(s => ({
      id: s.id,
      time: s.createdAt,
      agentName: s.agent.name,
      avatarUrl: s.agent.avatarUrl,
      count: s.amount,
      enteredBy: s.manager.name,
      status: s.status // CONFIRMED or REVERSED
    }));
  }
  
  public async getRecipients(managerId: number) {
    return this.prisma.reportRecipient.findMany({
      where: { managerId },
      orderBy: { createdAt: "asc" }
    });
  }

  public async addRecipient(managerId: number, email: string) {
    const exists = await this.prisma.reportRecipient.findUnique({
      where: { managerId_email: { managerId, email } }
    });
    if (exists) return exists;
    
    return this.prisma.reportRecipient.create({
      data: { managerId, email }
    });
  }

  public async removeRecipient(managerId: number, email: string) {
    return this.prisma.reportRecipient.deleteMany({
      where: { managerId, email }
    });
  }

  public async getReportHistory(managerId: number, range?: string, customStart?: string, customEnd?: string) {
    if (!range) {
      return this.prisma.reportHistory.findMany({
        where: { managerId },
        orderBy: { date: "desc" }
      });
    }

    const { startDate, endDate } = await this.getDateRange(managerId, range, customStart, customEnd);
    
    return this.prisma.reportHistory.findMany({
      where: { 
        managerId,
        date: { gte: startDate, lte: endDate }
      },
      orderBy: { date: "desc" }
    });
  }

  public async generateAndEmailReport(managerId: number) {
    this.logger.info("Generating End of Day Report", { managerId });
    
    // Determine the working day boundaries for "today"
    const settings = await this.getManagerSettings(managerId);
    const { timeZone, officeStartTime } = settings;
    const currentBucket = this.getWorkingDayBucket(new Date(), timeZone, officeStartTime);
    const { fetchStart: startOfToday, fetchEnd: endOfToday } = this.getWorkingDayBounds(currentBucket, timeZone, officeStartTime);

    const existingReport = await this.prisma.reportHistory.findFirst({
      where: {
        managerId: managerId,
        date: { gte: startOfToday, lte: endOfToday }
      }
    });

    let alreadySentEmails: string[] = [];
    if (existingReport && existingReport.status === "Sent" && existingReport.sentTo) {
      try {
        alreadySentEmails = JSON.parse(existingReport.sentTo);
      } catch (e) {}
    }

    const recipients = await this.getRecipients(managerId);
    if (recipients.length === 0) {
      throw new Error("No recipients configured for reports.");
    }
    const allConfiguredEmails = recipients.map(r => r.email);
    const emailsToSend = allConfiguredEmails.filter(email => !alreadySentEmails.includes(email));

    const summary = await this.getReportSummary(managerId, 'today');
    const agentSales = await this.getSalesByAgent(managerId, 'today');
    
    const manager = await this.prisma.user.findUnique({
      where: { id: managerId },
      include: { company: { include: { settings: true } } }
    });

    const companyName = manager?.company?.settings?.companyName || manager?.company?.name || "Robpaden";
    const managerName = manager?.name || "Manager";
    const companyLogo = manager?.company?.settings?.logoUrl || undefined;

    // Generate CSV attachment
    const csvRows = [
      ["Robpaden End of Day Report"],
      ["Date", format(currentBucket, 'yyyy-MM-dd')],
      ["Team Total", summary.teamTotal],
      ["Active Agents", summary.activeAgents],
      [],
      ["Agent Name", "Daily Sales", "Weekly Sales", "Daily Rank", "Corrections"]
    ];

    agentSales.forEach(ag => {
      csvRows.push([ag.name, ag.daily, ag.weekly, ag.dailyRank, ag.corrections]);
    });

    const csvContent = csvRows.map(row => row.join(',')).join('\n');

    // Send the stunning HTML email with CSV attachment ONLY if there are new emails
    let emailSent = false;
    if (emailsToSend.length > 0) {
      emailSent = await this.emailService.sendDailyReportEmail(
        emailsToSend,
        companyName,
        managerName,
        summary,
        agentSales,
        companyLogo,
        csvContent
      );
    }
    
    // Generate PDF and Upload to S3
    let pdfUrl: string | null = null;
    try {
      const managerCount = await this.prisma.user.count({
        where: { companyId: manager?.companyId, role: "MANAGER", isActive: true }
      });
      const activeManagers = Math.max(1, managerCount);
      const officeMonthlyGoal = manager?.company?.settings?.monthlyGoal || 0;
      const distributedMonthlyGoal = Math.ceil(officeMonthlyGoal / activeManagers);

      const pdfBuffer = generateReportPdfBuffer({
        agents: agentSales,
        summary: summary,
        monthlyGoal: distributedMonthlyGoal,
        companyName: companyName,
        managerName: managerName,
        activeTab: "Today"
      });
      const fileName = `robpaden_report_today_${Date.now()}.pdf`;
      pdfUrl = await uploadFileToRustFS(pdfBuffer, fileName, "application/pdf");
      this.logger.info("PDF generated and uploaded to RustFS", { pdfUrl });
    } catch (e: any) {
      this.logger.error("Failed to generate or upload PDF report", { error: e.message });
    }

    // Determine the combined sentTo list and final status
    let finalSentTo = alreadySentEmails;
    if (emailSent) {
      finalSentTo = [...alreadySentEmails, ...emailsToSend];
    }
    const finalStatus = finalSentTo.length > 0 ? "Sent" : (existingReport?.status || "Generated Only");

    let report;
    if (existingReport) {
      report = await this.prisma.reportHistory.update({
        where: { id: existingReport.id },
        data: {
          sentTo: JSON.stringify(finalSentTo),
          status: finalStatus,
          pdfUrl: pdfUrl || existingReport.pdfUrl
        }
      });
    } else {
      report = await this.prisma.reportHistory.create({
        data: {
          managerId,
          date: new Date(),
          sentTo: JSON.stringify(finalSentTo),
          status: finalStatus,
          pdfUrl
        }
      });
    }

    return report;
  }

  public async toggleReportGeneration(managerId: number, isActive: boolean) {
    const manager = await this.prisma.user.findUnique({ where: { id: managerId } });
    if (!manager || !manager.companyId) {
      throw new Error("Manager not found or not associated with a company.");
    }

    await this.prisma.companySettings.update({
      where: { companyId: manager.companyId },
      data: { isReportGenerationActive: isActive }
    });

    return { success: true, isActive };
  }

  public async logFailedOrSkippedReport(managerId: number, reason: string) {
    const recipients = await this.getRecipients(managerId);
    const emails = recipients.map(r => r.email);
    
    if (emails.length > 0) {
      // Simulate sending email that the report was skipped
      this.logger.info(`Sending skipped report email: ${reason}`);
      
      return this.prisma.reportHistory.create({
        data: {
          managerId,
          date: new Date(),
          sentTo: JSON.stringify(emails),
          status: "Skipped - Manager Disabled"
        }
      });
    }
  }
}
