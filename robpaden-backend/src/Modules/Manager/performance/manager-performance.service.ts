import { AppLogger } from "@/core/logging/logger";
import { PrismaClient, PerformancePeriod, AuditAction } from "@prisma/client";
import { ConflictError, NotFoundError } from "@/core/errors/AppError";

export class ManagerPerformanceService {
  private logger = new AppLogger("ManagerPerformanceService");

  constructor(private readonly prisma: PrismaClient) {}

  private getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  }

  private getStartOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
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

    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0); // Normalize to midnight for DAILY records
    const startOfWeek = this.getStartOfWeek(date);
    const startOfMonth = this.getStartOfMonth(date);

    return this.prisma.$transaction(async (tx) => {
      // 2. Upsert Agent Daily Record (Increment by salesCount)
      const agentDaily = await tx.performanceRecord.upsert({
        where: {
          agentId_period_startDate: {
            agentId, period: PerformancePeriod.DAILY, startDate: date
          }
        },
        update: { salesCount: { increment: salesCount } },
        create: {
          agentId, companyId, period: PerformancePeriod.DAILY, startDate: date, salesCount
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
        }
      });

      // 6. Log the addition
      await tx.salesAuditLog.create({
        data: {
          action: "ADDED",
          previousAmount: 0,
          newAmount: salesCount,
          date: new Date(),
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

    const startHour = parseInt(officeStartTime.split(":")[0], 10);
    const endHour = parseInt(officeCloseTime.split(":")[0], 10);

    const today = dateString ? new Date(dateString) : new Date();
    today.setHours(0, 0, 0, 0);

    const startOfWeek = this.getStartOfWeek(today);

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
      const d = new Date(s.createdAt);
      return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    });

    const activeTodaysSales = todaysSales.filter(s => s.status !== "REVERSED");
    const activeWeeklySales = weeklySales.filter(s => s.status !== "REVERSED");

    const totalToday = activeTodaysSales.reduce((sum, s) => sum + s.amount, 0);
    
    // Group Today by Hour
    const dailyChart = [];
    const minSalesHour = activeTodaysSales.length > 0 ? Math.min(...activeTodaysSales.map(s => new Date(s.createdAt).getHours())) : startHour;
    const maxSalesHour = activeTodaysSales.length > 0 ? Math.max(...activeTodaysSales.map(s => new Date(s.createdAt).getHours())) : endHour;
    
    let chartStartHour = Math.min(startHour, minSalesHour);
    let chartEndHour = Math.max(endHour, maxSalesHour);

    if (chartEndHour < chartStartHour) chartEndHour += 24; // Handle overnight shifts roughly
    
    for (let h = chartStartHour; h <= chartEndHour; h++) {
      const displayHour = h % 24;
      const hourSales = activeTodaysSales.filter(s => new Date(s.createdAt).getHours() === displayHour)
                                   .reduce((sum, s) => sum + s.amount, 0);
      
      const ampm = displayHour >= 12 ? 'PM' : 'AM';
      const label = `${displayHour % 12 || 12} ${ampm}`;
      
      dailyChart.push({ label, sales: hourSales });
    }

    // 4. Aggregate This Week's Sales
    const totalWeek = activeWeeklySales.reduce((sum, s) => sum + s.amount, 0);
    const weeklyChart = [];
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    
    for (let i = 0; i < 7; i++) {
      const dayTarget = new Date(startOfWeek);
      dayTarget.setDate(dayTarget.getDate() + i);
      
      const daySales = activeWeeklySales.filter(s => {
        const d = new Date(s.createdAt);
        return d.getDate() === dayTarget.getDate() && d.getMonth() === dayTarget.getMonth() && d.getFullYear() === dayTarget.getFullYear();
      }).reduce((sum, s) => sum + s.amount, 0);

      weeklyChart.push({ label: days[i], sales: daySales });
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

    const monthlyGoal = company?.settings?.monthlyGoal || 2000;
    const dailyGoal = Math.ceil(monthlyGoal / 30);
    const weeklyGoal = Math.ceil(monthlyGoal / 4);

    return {
      today: { 
        total: totalToday, 
        chart: dailyChart, 
        startTime: `${chartStartHour % 12 || 12} ${chartStartHour >= 12 && chartStartHour < 24 ? 'PM' : 'AM'}`, 
        endTime: `${chartEndHour % 12 || 12} ${chartEndHour >= 12 && chartEndHour < 24 ? 'PM' : 'AM'}` 
      },
      week: { total: totalWeek, chart: weeklyChart },
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
    const today = dateStr ? new Date(dateStr) : new Date();
    if (dateStr && dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        today.setFullYear(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      }
    }
    today.setHours(0, 0, 0, 0);

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    return this.prisma.sale.findMany({
      where: { 
        agentId, 
        agent: { companyId }, 
        createdAt: { gte: today, lte: endOfDay } 
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

      const date = new Date(sale.createdAt);
      date.setHours(0, 0, 0, 0);
      const startOfWeek = this.getStartOfWeek(date);
      const startOfMonth = this.getStartOfMonth(date);

      // Deduct from Daily
      await tx.performanceRecord.update({
        where: {
          agentId_period_startDate: { agentId: sale.agentId, period: PerformancePeriod.DAILY, startDate: date }
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
          date: new Date(),
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

      const date = new Date(sale.createdAt);
      date.setHours(0, 0, 0, 0);
      const startOfWeek = this.getStartOfWeek(date);
      const startOfMonth = this.getStartOfMonth(date);

      // Adjust Daily
      await tx.performanceRecord.update({
        where: {
          agentId_period_startDate: { agentId: sale.agentId, period: PerformancePeriod.DAILY, startDate: date }
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
          date: new Date(),
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
