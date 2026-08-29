import { AppLogger } from "@/core/logging/logger";
import { PrismaClient, PerformancePeriod } from "@prisma/client";
import { NotFoundError } from "@/core/errors/AppError";

export class TVService {
  private logger = new AppLogger("TVService");

  constructor(private readonly prisma: PrismaClient) {}

  private getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  private getStartOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  public async getTVBoardData(companyId: number) {
    this.logger.info("Fetching public TV board data", { companyId });

    // 1. Fetch Company Settings
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: { settings: true }
    });

    if (!company) {
      throw new NotFoundError("Company not found");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day in UTC roughly
    
    const startOfWeek = this.getStartOfWeek(today);
    const startOfMonth = this.getStartOfMonth(today);

    // 2. Fetch Agents in this company with their goals and performance records
    const agents = await this.prisma.user.findMany({
      where: { companyId, role: "AGENT", isActive: true },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        dailyGoal: true,
        weeklyGoal: true,
        performanceRecords: {
          where: {
            startDate: { in: [today, startOfWeek, startOfMonth] }
          }
        }
      }
    });



    // 4. Transform Agent Data (Extracting only the most recent DAILY, WEEKLY, MONTHLY records)
    let totalMonthlySales = 0;

    const formattedAgents = agents.map(agent => {
      const daily = agent.performanceRecords.find(p => p.period === PerformancePeriod.DAILY);
      const weekly = agent.performanceRecords.find(p => p.period === PerformancePeriod.WEEKLY);
      const monthly = agent.performanceRecords.find(p => p.period === PerformancePeriod.MONTHLY);

      if (monthly) {
        totalMonthlySales += monthly.salesCount;
      }

      return {
        id: agent.id,
        name: agent.name,
        avatarUrl: agent.avatarUrl,
        goals: {
          daily: agent.dailyGoal || 0,
          weekly: agent.weeklyGoal || 0,
        },
        sales: {
          daily: daily?.salesCount || 0,
          weekly: weekly?.salesCount || 0,
          monthly: monthly?.salesCount || 0,
        },
        progress: {
          daily: agent.dailyGoal ? Math.min(100, Math.round(((daily?.salesCount || 0) / agent.dailyGoal) * 100)) : 0,
          weekly: agent.weeklyGoal ? Math.min(100, Math.round(((weekly?.salesCount || 0) / agent.weeklyGoal) * 100)) : 0,
        }
      };
    });



    // 6. Sort by top performers
    const topAgentsDaily = [...formattedAgents].sort((a, b) => b.sales.daily - a.sales.daily);
    const topAgentsWeekly = [...formattedAgents].sort((a, b) => b.sales.weekly - a.sales.weekly);
    const topAgentsMonthly = [...formattedAgents].sort((a, b) => b.sales.monthly - a.sales.monthly);

    // 7. Team Goal Calculation
    const monthlyGoal = company.settings?.monthlyGoal || 1; // Prevent division by zero
    const goalProgress = Math.min(100, Math.round((totalMonthlySales / monthlyGoal) * 100));

    // 8. Daily Recognition & Bell Ringer
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const firstSale = await this.prisma.sale.findFirst({
      where: { 
        agent: { companyId }, 
        status: "CONFIRMED", 
        createdAt: { gte: today, lte: todayEnd } 
      },
      orderBy: { createdAt: 'asc' },
      include: { agent: true }
    });

    const latestSale = await this.prisma.sale.findFirst({
      where: { 
        agent: { companyId }, 
        status: "CONFIRMED", 
        createdAt: { gte: today, lte: todayEnd } 
      },
      orderBy: { createdAt: 'desc' },
      include: { agent: true }
    });

    const mostSaleAgent = topAgentsDaily.length > 0 && topAgentsDaily[0].sales.daily > 0 ? topAgentsDaily[0].name : null;

    // Closest to goal (highest progress < 100)
    const agentsWithDailyGoals = formattedAgents.filter(a => a.goals.daily > 0 && a.progress.daily < 100 && a.sales.daily > 0);
    const closestToGoalAgent = agentsWithDailyGoals.sort((a, b) => b.progress.daily - a.progress.daily)[0]?.name || null;

    return {
      company: {
        id: company.id,
        name: company.name,
        logoUrl: company.settings?.logoUrl || null,
        celebrationSoundUrl: company.settings?.celebrationSoundUrl || null,
        tvTheme: company.settings?.tvTheme || "default",
        timeZone: company.settings?.timeZone || "UTC"
      },
      teamGoal: {
        monthlyGoal: company.settings?.monthlyGoal || 0,
        currentSales: totalMonthlySales,
        progress: goalProgress
      },
      dailyRecognition: {
        firstSale: firstSale?.agent?.name || null,
        mostSale: mostSaleAgent,
        closestToGoal: closestToGoalAgent
      },
      bellRinger: latestSale ? { id: latestSale.id, name: latestSale.agent.name } : null,
      leaderboards: {
        agents: {
          daily: topAgentsDaily,
          weekly: topAgentsWeekly,
          monthly: topAgentsMonthly
        }
      }
    };
  }
}
