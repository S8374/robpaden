import { AppLogger } from "@/core/logging/logger";
import { PrismaClient, PerformancePeriod, AuditAction } from "@prisma/client";
import { ConflictError, NotFoundError } from "@/core/errors/AppError";
import { toZonedTime } from "date-fns-tz";
import { format } from "date-fns";

export class ManagerPerformanceService {
  private logger = new AppLogger("ManagerPerformanceService");

  constructor(private readonly prisma: PrismaClient) {}

  private getWorkingDayBucket(dateUtc: Date, timeZone: string = 'UTC', officeStartTime: string = '00:00'): Date {
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

  private getStartOfWeek(bucketDateUtc: Date, weeklyResetDay: number = 1): Date {
    const day = bucketDateUtc.getUTCDay();
    const diff = (day < weeklyResetDay ? 7 : 0) + day - weeklyResetDay;
    
    const startOfWeek = new Date(bucketDateUtc);
    startOfWeek.setUTCDate(bucketDateUtc.getUTCDate() - diff);
    return startOfWeek;
  }

  private getStartOfMonth(bucketDateUtc: Date): Date {
    const startOfMonth = new Date(bucketDateUtc);
    startOfMonth.setUTCDate(1);
    return startOfMonth;
  }

  public async addOrUpdateDailySales(
    managerId: number,
    companyId: number,
    agentId: number,
    dateString: string,
    salesCount: number
  ) {
    this.logger.info("Manager adding daily sales", { managerId, agentId, salesCount });

    // 1. Verify agent belongs to this manager and company
    const agent = await this.prisma.user.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      throw new NotFoundError("Agent not found");
    }

    if (agent.companyId !== companyId || agent.managerId !== managerId) {
      throw new ConflictError("You can only manage sales for agents directly assigned to you");
    }

    if (salesCount <= 0) {
      throw new ConflictError("Sales count must be greater than 0");
    }

    const companySettings = await this.prisma.companySettings.findUnique({ where: { companyId } });
    const weeklyResetDay = companySettings?.weeklyResetDay ?? 1;
    const timeZone = companySettings?.timeZone || 'UTC';
    const officeStartTime = companySettings?.officeStartTime || '00:00';

    let bucketDate: Date;
    let safeCreatedAt = new Date();
    
    if (dateString.endsWith('T00:00:00.000Z')) {
      bucketDate = new Date(dateString);
      // Find a safe UTC time that maps exactly to this bucketDate in the target timezone
      for (let i = 0; i < 48; i++) {
        const testDate = new Date(bucketDate);
        testDate.setUTCHours(i);
        if (this.getWorkingDayBucket(testDate, timeZone, officeStartTime).getTime() === bucketDate.getTime()) {
          safeCreatedAt = testDate;
          // Add 4 hours to push it safely into the middle of the working day
          safeCreatedAt.setUTCHours(safeCreatedAt.getUTCHours() + 4);
          break;
        }
      }
    } else {
      const date = new Date(dateString);
      bucketDate = this.getWorkingDayBucket(date, timeZone, officeStartTime);
      safeCreatedAt = date;
    }
    
    const startOfWeek = this.getStartOfWeek(bucketDate, weeklyResetDay);
    const startOfMonth = this.getStartOfMonth(bucketDate);

    return this.prisma.$transaction(async (tx) => {
      // 2. Upsert Agent Daily Record (Increment by salesCount)
      const agentDaily = await tx.performanceRecord.upsert({
        where: {
          agentId_period_startDate: {
            agentId, period: PerformancePeriod.DAILY, startDate: bucketDate
          }
        },
        update: { salesCount: { increment: salesCount } },
        create: {
          agentId, companyId, period: PerformancePeriod.DAILY, startDate: bucketDate, salesCount
        }
      });

      // 3. Upsert Agent Weekly Record
      const agentWeekly = await tx.performanceRecord.upsert({
        where: {
          agentId_period_startDate: {
            agentId, period: PerformancePeriod.WEEKLY, startDate: startOfWeek
          }
        },
        update: { salesCount: { increment: salesCount } },
        create: {
          agentId, companyId, period: PerformancePeriod.WEEKLY, startDate: startOfWeek, salesCount
        }
      });

      // 4. Upsert Agent Monthly Record
      const agentMonthly = await tx.performanceRecord.upsert({
        where: {
          agentId_period_startDate: {
            agentId, period: PerformancePeriod.MONTHLY, startDate: startOfMonth
          }
        },
        update: { salesCount: { increment: salesCount } },
        create: {
          agentId, companyId, period: PerformancePeriod.MONTHLY, startDate: startOfMonth, salesCount
        }
      });

      // 5. Create Sale Record
      const saleRecord = await tx.sale.create({
        data: {
          amount: salesCount,
          agentId,
          managerId,
          createdAt: safeCreatedAt
        }
      });

      // 6. Log the addition
      await tx.salesAuditLog.create({
        data: {
          action: "ADDED",
          previousAmount: 0,
          newAmount: salesCount,
          date: safeCreatedAt,
          agentId: agentId,
          managerId: managerId,
          saleId: saleRecord.id,
        }
      });

      return {
        sale: saleRecord,
        agent: {
          daily: agentDaily,
          weekly: agentWeekly,
          monthly: agentMonthly
        }
      };
    });
  }

  public async getPerformanceHistory(companyId: number) {
    this.logger.info("Fetching performance history for company", { companyId });
    return this.prisma.sale.findMany({
      where: { manager: { companyId } },
      include: {
        agent: { select: { name: true, email: true } },
        manager: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 100
    });
  }

  public async getManagerDashboard(managerId: number, companyId: number, dateString?: string) {
    this.logger.info("Fetching manager dashboard", { managerId, companyId });

    // 1. Get Company Settings
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: { settings: true }
    });

    const officeStartTime = company?.settings?.officeStartTime || "09:00";
    const officeCloseTime = company?.settings?.officeCloseTime || "17:00";
    const timeZone = company?.settings?.timeZone || "UTC";

    const startHour = parseInt(officeStartTime.split(":")[0], 10);
    const endHour = parseInt(officeCloseTime.split(":")[0], 10);

    let bucketDate: Date;
    if (dateString && dateString.includes('-')) {
      bucketDate = new Date(`${dateString}T00:00:00.000Z`);
    } else {
      bucketDate = this.getWorkingDayBucket(new Date(), timeZone, officeStartTime);
    }

    const weeklyResetDay = company?.settings?.weeklyResetDay ?? 1;
    const workWeekEndDay = company?.settings?.workWeekEndDay ?? 0;

    const startOfWeek = this.getStartOfWeek(bucketDate, weeklyResetDay);

    // 2. Fetch all sales for this manager's team for THIS WEEK
    const weeklySales = await this.prisma.sale.findMany({
      where: {
        agent: { managerId },
        createdAt: { gte: startOfWeek }
      },
      include: { agent: { select: { name: true, dailyGoal: true } } }
    });

    // 3. Aggregate Today's Sales
    const todaysSales = weeklySales.filter(s => {
      const sBucket = this.getWorkingDayBucket(new Date(s.createdAt), timeZone, officeStartTime);
      return sBucket.getTime() === bucketDate.getTime();
    });

    const activeTodaysSales = todaysSales.filter(s => s.status !== "REVERSED");
    const activeWeeklySales = weeklySales.filter(s => s.status !== "REVERSED");

    const totalToday = activeTodaysSales.reduce((sum, s) => sum + s.amount, 0);
    
    // Group Today by Hour
    const dailyChart = [];
    const minSalesHour = activeTodaysSales.length > 0 ? Math.min(...activeTodaysSales.map(s => toZonedTime(new Date(s.createdAt), timeZone).getHours())) : startHour;
    const maxSalesHour = activeTodaysSales.length > 0 ? Math.max(...activeTodaysSales.map(s => toZonedTime(new Date(s.createdAt), timeZone).getHours())) : endHour;
    
    let chartStartHour = Math.min(startHour, minSalesHour);
    let chartEndHour = Math.max(endHour, maxSalesHour);

    if (chartEndHour < chartStartHour) chartEndHour += 24; // Handle overnight shifts roughly
    
    for (let h = chartStartHour; h <= chartEndHour; h++) {
      const displayHour = h % 24;
      const hourSales = activeTodaysSales.filter(s => toZonedTime(new Date(s.createdAt), timeZone).getHours() === displayHour)
                                   .reduce((sum, s) => sum + s.amount, 0);
      
      const ampm = displayHour >= 12 ? 'PM' : 'AM';
      const label = `${displayHour % 12 || 12} ${ampm}`;
      
      dailyChart.push({ label, sales: hourSales });
    }

    // 4. Aggregate This Week's Sales
    const totalWeek = activeWeeklySales.reduce((sum, s) => sum + s.amount, 0);
    const weeklyChart = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    let daysToDisplay = 1;
    let currDay = weeklyResetDay;
    while(currDay !== workWeekEndDay && daysToDisplay <= 7) {
      currDay = (currDay + 1) % 7;
      daysToDisplay++;
    }
    
    for (let i = 0; i < daysToDisplay; i++) {
      const dayTarget = new Date(startOfWeek);
      dayTarget.setDate(dayTarget.getDate() + i);
      
      const daySales = activeWeeklySales.filter(s => {
        const sBucket = this.getWorkingDayBucket(new Date(s.createdAt), timeZone, officeStartTime);
        return sBucket.getTime() === dayTarget.getTime();
      }).reduce((sum, s) => sum + s.amount, 0);

      const dayIndex = dayTarget.getDay();
      weeklyChart.push({ label: dayNames[dayIndex], sales: daySales });
    }

    // 5. Today's Ranking
    const agentTotals = new Map<number, { name: string; total: number; dailyGoal: number }>();
    activeTodaysSales.forEach(s => {
      if (!agentTotals.has(s.agentId)) {
        agentTotals.set(s.agentId, { name: s.agent.name, total: 0, dailyGoal: s.agent.dailyGoal || 10 });
      }
      agentTotals.get(s.agentId)!.total += s.amount;
    });

    const ranking = Array.from(agentTotals.values())
      .sort((a, b) => b.total - a.total)
      .map((r, index) => ({
        rank: index + 1,
        name: r.name,
        initials: r.name.substring(0, 2).toUpperCase(),
        sales: r.total,
        dailyGoal: r.dailyGoal
      }));

    // 6. Recent Sales
    const recentSales = todaysSales.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5).map(s => ({
      id: s.id,
      name: s.agent.name,
      initials: s.agent.name.substring(0, 2).toUpperCase(),
      time: new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      count: s.amount,
      status: s.status === "REVERSED" ? "Reversed" : "Confirmed"
    }));

    const managerCount = await this.prisma.user.count({
      where: { companyId, role: "MANAGER", isActive: true }
    });
    const activeManagers = Math.max(1, managerCount);
    
    const officeMonthlyGoal = company?.settings?.monthlyGoal || 2000;
    const monthlyGoal = Math.ceil(officeMonthlyGoal / activeManagers);
    const dailyGoal = Math.ceil(monthlyGoal / 30);
    const weeklyGoal = Math.ceil(monthlyGoal / 4);

    return {
      today: { 
        total: totalToday, 
        chart: dailyChart, 
        startTime: `${chartStartHour % 12 || 12} ${chartStartHour >= 12 && chartStartHour < 24 ? 'PM' : 'AM'}`, 
        endTime: `${chartEndHour % 12 || 12} ${chartEndHour >= 12 && chartEndHour < 24 ? 'PM' : 'AM'}` 
      },
      week: { 
        total: totalWeek, 
        chart: weeklyChart,
        startTime: dayNames[weeklyResetDay],
        endTime: dayNames[workWeekEndDay]
      },
      goals: {
        daily: { target: dailyGoal, progress: Math.min(Math.round((totalToday / dailyGoal) * 100), 100) },
        weekly: { target: weeklyGoal, progress: Math.min(Math.round((totalWeek / weeklyGoal) * 100), 100) },
        monthly: { target: monthlyGoal } // Just in case it's needed
      },
      ranking,
      recent: recentSales
    };
  }

  public async getAgentPerformance(agentId: number, companyId: number) {
    return this.prisma.performanceRecord.findMany({
      where: { agentId, companyId },
      orderBy: { startDate: "desc" }
    });
  }

  public async getAgentTodayAudit(agentId: number, companyId: number, dateStr?: string) {
    const companySettings = await this.prisma.companySettings.findUnique({ where: { companyId } });
    const timeZone = companySettings?.timeZone || 'UTC';
    const officeStartTime = companySettings?.officeStartTime || '00:00';

    let bucketDate: Date;
    if (dateStr && dateStr.includes('-')) {
      bucketDate = new Date(`${dateStr}T00:00:00.000Z`);
    } else {
      bucketDate = this.getWorkingDayBucket(new Date(), timeZone, officeStartTime);
    }

    // The query should technically fetch sales that fall INTO this bucket.
    // That means we need the actual UTC start and end bounds of this working day.
    
    // The start of the working day in UTC is:
    const [startHourStr, startMinuteStr] = officeStartTime.split(':');
    const startHour = parseInt(startHourStr, 10);
    const startMinute = parseInt(startMinuteStr || '0', 10);
    
    // Create the start date in the company timezone
    const bucketStr = format(bucketDate, 'yyyy-MM-dd');
    const isoString = `${bucketStr}T${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}:00`;
    
    // Wait, date-fns-tz allows parsing with timezone, but we don't have it imported.
    // It's safer to just fetch ALL sales for this agent, then filter by bucket in memory 
    // if the list is reasonably small (which it is for a single agent's recent history).
    // Or we can approximate the 48-hour window and filter in memory.
    
    const approxStart = new Date(bucketDate);
    approxStart.setDate(approxStart.getDate() - 1);
    const approxEnd = new Date(bucketDate);
    approxEnd.setDate(approxEnd.getDate() + 2);

    const recentSales = await this.prisma.sale.findMany({
      where: { 
        agentId, 
        agent: { companyId },
        createdAt: { gte: approxStart, lte: approxEnd }
      },
      include: {
        manager: { select: { name: true } },
        auditLogs: {
          orderBy: { date: "desc" },
          include: { manager: { select: { name: true } } }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return recentSales.filter(s => {
      const sBucket = this.getWorkingDayBucket(new Date(s.createdAt), timeZone, officeStartTime);
      return sBucket.getTime() === bucketDate.getTime();
    });
  }

  public async reverseSale(saleId: number, managerId: number, companyId: number) {
    return this.prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({
        where: { id: saleId },
        include: { agent: true }
      });

      if (!sale) throw new NotFoundError("Sale not found");
      if (sale.agent.companyId !== companyId) throw new ConflictError("Unauthorized");
      if (sale.status === "REVERSED") throw new ConflictError("Sale already reversed");

      const difference = sale.amount;

      const companySettings = await tx.companySettings.findUnique({ where: { companyId } });
      const weeklyResetDay = companySettings?.weeklyResetDay ?? 1;
      const timeZone = companySettings?.timeZone || 'UTC';
      const officeStartTime = companySettings?.officeStartTime || '00:00';

      const date = new Date(sale.createdAt);
      const bucketDate = this.getWorkingDayBucket(date, timeZone, officeStartTime);
      const startOfWeek = this.getStartOfWeek(bucketDate, weeklyResetDay);
      const startOfMonth = this.getStartOfMonth(bucketDate);

      // Deduct from Daily
      await tx.performanceRecord.update({
        where: {
          agentId_period_startDate: { agentId: sale.agentId, period: PerformancePeriod.DAILY, startDate: bucketDate }
        },
        data: { salesCount: { decrement: difference } }
      });

      // Deduct from Weekly
      await tx.performanceRecord.update({
        where: {
          agentId_period_startDate: { agentId: sale.agentId, period: PerformancePeriod.WEEKLY, startDate: startOfWeek }
        },
        data: { salesCount: { decrement: difference } }
      });

      // Deduct from Monthly
      await tx.performanceRecord.update({
        where: {
          agentId_period_startDate: { agentId: sale.agentId, period: PerformancePeriod.MONTHLY, startDate: startOfMonth }
        },
        data: { salesCount: { decrement: difference } }
      });

      // Log the reversal
      await tx.salesAuditLog.create({
        data: {
          action: "UPDATED",
          previousAmount: sale.amount,
          newAmount: 0,
          date: new Date(sale.createdAt),
          agentId: sale.agentId,
          managerId: managerId,
          saleId: saleId,
          isReversed: true,
        }
      });

      // Mark as reversed
      return tx.sale.update({
        where: { id: saleId },
        data: { status: "REVERSED" }
      });
    });
  }

  public async editSale(saleId: number, newCount: number, managerId: number, companyId: number) {
    return this.prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({
        where: { id: saleId },
        include: { agent: true }
      });

      if (!sale) throw new NotFoundError("Sale not found");
      if (sale.agent.companyId !== companyId) throw new ConflictError("Unauthorized");
      if (sale.status === "REVERSED") throw new ConflictError("Cannot edit a reversed sale");

      const countDifference = newCount - sale.amount;

      if (countDifference === 0) return sale;

      const companySettings = await tx.companySettings.findUnique({ where: { companyId } });
      const weeklyResetDay = companySettings?.weeklyResetDay ?? 1;
      const timeZone = companySettings?.timeZone || 'UTC';
      const officeStartTime = companySettings?.officeStartTime || '00:00';

      const date = new Date(sale.createdAt);
      const bucketDate = this.getWorkingDayBucket(date, timeZone, officeStartTime);
      const startOfWeek = this.getStartOfWeek(bucketDate, weeklyResetDay);
      const startOfMonth = this.getStartOfMonth(bucketDate);

      // Adjust Daily
      await tx.performanceRecord.update({
        where: {
          agentId_period_startDate: { agentId: sale.agentId, period: PerformancePeriod.DAILY, startDate: bucketDate }
        },
        data: { salesCount: { increment: countDifference } }
      });

      // Adjust Weekly
      await tx.performanceRecord.update({
        where: {
          agentId_period_startDate: { agentId: sale.agentId, period: PerformancePeriod.WEEKLY, startDate: startOfWeek }
        },
        data: { salesCount: { increment: countDifference } }
      });

      // Adjust Monthly
      await tx.performanceRecord.update({
        where: {
          agentId_period_startDate: { agentId: sale.agentId, period: PerformancePeriod.MONTHLY, startDate: startOfMonth }
        },
        data: { salesCount: { increment: countDifference } }
      });

      // Log the edit
      await tx.salesAuditLog.create({
        data: {
          action: "UPDATED",
          previousAmount: sale.amount,
          newAmount: newCount,
          date: new Date(sale.createdAt),
          agentId: sale.agentId,
          managerId: managerId,
          saleId: saleId,
        }
      });

      return tx.sale.update({
        where: { id: saleId },
        data: { amount: newCount }
      });
    });
  }
}
