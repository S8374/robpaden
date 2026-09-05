import { AppLogger } from "@/core/logging/logger";
import { PrismaClient, PerformancePeriod } from "@prisma/client";
import { NotFoundError } from "@/core/errors/AppError";
import { toZonedTime } from "date-fns-tz";
import { format } from "date-fns";

export class TVService {
  private logger = new AppLogger("TVService");

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
    
    const timeZone = company.settings?.timeZone || 'UTC';
    const officeStartTime = company.settings?.officeStartTime || '00:00';
    const weeklyResetDay = company.settings?.weeklyResetDay ?? 1;

    const bucketDate = this.getWorkingDayBucket(today, timeZone, officeStartTime);
    const startOfWeek = this.getStartOfWeek(bucketDate, weeklyResetDay);
    const startOfMonth = this.getStartOfMonth(bucketDate);

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
            startDate: { in: [bucketDate, startOfWeek, startOfMonth] }
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
    // Define the UTC bounds of the current working day for accurate querying
    const [startH, startM] = officeStartTime.split(':').map(Number);
    
    const localStart = new Date(bucketDate);
    localStart.setHours(startH, startM, 0, 0);
    
    const offsetMs = new Date().getTimezoneOffset() * 60000;
    // Just use a simpler bounds approach: working day is approx 24h from officeStartTime in timezone.
    // We can also just fetch sales from today and check if they belong to bucketDate.
    // For simplicity, let's just fetch all sales from the last 48 hours and filter.
    const approxStart = new Date();
    approxStart.setHours(approxStart.getHours() - 48);

    const recentSalesAll = await this.prisma.sale.findMany({
      where: { 
        agent: { companyId }, 
        status: "CONFIRMED", 
        createdAt: { gte: approxStart } 
      },
      orderBy: { createdAt: 'asc' },
      include: { agent: true }
    });

    const todaysSalesRaw = recentSalesAll.filter(s => {
      const sBucket = this.getWorkingDayBucket(new Date(s.createdAt), timeZone, officeStartTime);
      return sBucket.getTime() === bucketDate.getTime();
    });

    const firstSale = todaysSalesRaw.length > 0 ? todaysSalesRaw[0] : null;

    const recentSales = todaysSalesRaw.slice(-10).map(s => ({
      id: s.id,
      name: s.agent.name,
      avatarUrl: s.agent.avatarUrl
    }));

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
        celebrationSoundStartTime: company.settings?.celebrationSoundStartTime || 0,
        celebrationSoundDuration: company.settings?.celebrationSoundDuration || 10,
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
      recentSales,
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
