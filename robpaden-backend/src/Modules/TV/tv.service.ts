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
    const formattedAgents = agents.map(agent => {
      const daily = agent.performanceRecords.find(p => p.period === PerformancePeriod.DAILY);
      const weekly = agent.performanceRecords.find(p => p.period === PerformancePeriod.WEEKLY);
      const monthly = agent.performanceRecords.find(p => p.period === PerformancePeriod.MONTHLY);

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



    return {
      company: {
        id: company.id,
        name: company.name,
        logoUrl: company.settings?.logoUrl || null,
        tvTheme: company.settings?.tvTheme || "default",
        timeZone: company.settings?.timeZone || "UTC"
      },
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
