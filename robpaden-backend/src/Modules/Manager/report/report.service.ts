import { AppLogger } from "@/core/logging/logger";
import { PrismaClient } from "@prisma/client";
import { parseISO, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isValid, format, subDays, differenceInDays } from "date-fns";
import { EmailService } from "@/core/services/email.service";

export class ReportService {
  private logger = new AppLogger("ReportService");
  private emailService = new EmailService();

  constructor(private readonly prisma: PrismaClient) {}



  private getDateRange(range: string, customStart?: string, customEnd?: string) {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = endOfDay(now);

    switch (range) {
      case 'today':
        startDate = startOfDay(now);
        break;
      case 'week':
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        break;
      case 'month':
        startDate = startOfMonth(now);
        break;
      case 'custom':
        if (customStart && isValid(parseISO(customStart))) {
          startDate = startOfDay(parseISO(customStart));
        } else {
          startDate = startOfDay(now);
        }
        if (customEnd && isValid(parseISO(customEnd))) {
          endDate = endOfDay(parseISO(customEnd));
        }
        break;
      default:
        startDate = startOfDay(now);
    }
    return { startDate, endDate };
  }

  public async getReportSummary(managerId: number, range: string, customStart?: string, customEnd?: string) {
    const { startDate, endDate } = this.getDateRange(range, customStart, customEnd);
    
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

    let daysCount = differenceInDays(endDate, startDate) + 1;
    if (daysCount < 1) daysCount = 1;
    
    const averageDaily = Math.round(teamTotal / daysCount);

    // Best Day
    const salesByDay: Record<string, number> = {};
    sales.forEach(s => {
      const day = format(s.createdAt, 'yyyy-MM-dd');
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
    const { startDate, endDate } = this.getDateRange(range, customStart, customEnd);
    
    // Shift "Today" and "This Week" to be relative to the requested startDate
    const referenceDate = startDate;
    const startOfTargetDay = startOfDay(referenceDate);
    const endOfTargetDay = endOfDay(referenceDate);
    
    // If range is explicitly multiple days (like 'week' or 'month' or a long custom range),
    // we use the full range for the "Daily" column (which really means "Period Total" in that context).
    // If it's a single day, startOfTargetDay and endOfTargetDay will just be that day.
    const periodStart = startDate;
    const periodEnd = endDate;

    const startOfTargetWeek = startOfWeek(referenceDate, { weekStartsOn: 1 });
    const endOfTargetWeek = endOfWeek(referenceDate, { weekStartsOn: 1 });

    // We fetch ALL active agents for this manager
    const agents = await this.prisma.user.findMany({
      where: { managerId, role: "AGENT", isActive: true },
      select: { id: true, name: true, avatarUrl: true }
    });

    // Fetch sales for daily and weekly rankings
    // We need to fetch from the earliest of periodStart and startOfTargetWeek, to the latest.
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
        date: { gte: startDate, lte: endDate }
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
        corrections = `${agentReversals.length} reversed (${format(latest.date, 'h:mm a')})`;
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
    const { startDate, endDate } = this.getDateRange(range, customStart, customEnd);
    
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

    const { startDate, endDate } = this.getDateRange(range, customStart, customEnd);
    
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
    
    const recipients = await this.getRecipients(managerId);
    if (recipients.length === 0) {
      throw new Error("No recipients configured for reports.");
    }
    const emails = recipients.map(r => r.email);

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
      ["Date", format(new Date(), 'yyyy-MM-dd')],
      ["Team Total", summary.teamTotal],
      ["Active Agents", summary.activeAgents],
      [],
      ["Agent Name", "Daily Sales", "Weekly Sales", "Daily Rank", "Corrections"]
    ];

    agentSales.forEach(ag => {
      csvRows.push([ag.name, ag.daily, ag.weekly, ag.dailyRank, ag.corrections]);
    });

    const csvContent = csvRows.map(row => row.join(',')).join('\n');

    // Send the stunning HTML email with CSV attachment
    const emailSent = await this.emailService.sendDailyReportEmail(
      emails,
      companyName,
      managerName,
      summary,
      agentSales,
      companyLogo,
      csvContent
    );
    
    const report = await this.prisma.reportHistory.create({
      data: {
        managerId,
        date: new Date(),
        sentTo: JSON.stringify(emails),
        status: emailSent ? "Sent" : "Failed"
      }
    });

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
