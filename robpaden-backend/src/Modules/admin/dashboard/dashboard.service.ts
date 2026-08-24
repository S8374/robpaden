import { AppLogger } from "@/core/logging/logger";
import { PrismaClient } from "@prisma/client";

export class DashboardService {
  private logger = new AppLogger("DashboardService");

  constructor(private readonly prisma: PrismaClient) {}

  public async getDashboardOverview() {
    this.logger.info("Fetching dashboard overview statistics");
    
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

    const totalOffices = await this.prisma.company.count();
    const newOfficesThisMonth = await this.prisma.company.count({
      where: { createdAt: { gte: startOfMonth } }
    });

    const activeManagers = await this.prisma.user.count({
      where: { role: 'MANAGER', isActive: true }
    });
    const newManagersThisMonth = await this.prisma.user.count({
      where: { role: 'MANAGER', createdAt: { gte: startOfMonth } }
    });

    const totalAgents = await this.prisma.user.count({
      where: { role: 'AGENT' }
    });
    const newAgentsThisMonth = await this.prisma.user.count({
      where: { role: 'AGENT', createdAt: { gte: startOfMonth } }
    });
    
    // For now, assume every company has an active TV board
    const activeTVBoards = totalOffices;

    // Fetch recent 10 activities
    const activities = await this.prisma.systemActivity.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' }
    });
    
    // Top Office calculation (Current Month)
    const companyPerformances = await this.prisma.performanceRecord.groupBy({
      by: ['companyId'],
      where: {
        period: 'MONTHLY',
        startDate: startOfMonth
      },
      _sum: {
        salesCount: true
      },
      orderBy: {
        _sum: {
          salesCount: 'desc'
        }
      },
      take: 1
    });

    let topOffice = null;
    if (companyPerformances.length > 0) {
      const bestCompanyId = companyPerformances[0].companyId;
      const bestCompanySales = companyPerformances[0]._sum.salesCount || 0;
      const companyInfo = await this.prisma.company.findUnique({
        where: { id: bestCompanyId },
        include: { settings: true }
      });
      if (companyInfo) {
        topOffice = {
          name: companyInfo.name,
          sales: bestCompanySales,
          goal: companyInfo.settings?.monthlyGoal || 0
        };
      }
    }

    // Top Managers calculation (Current Month)
    const monthPerformances = await this.prisma.performanceRecord.findMany({
      where: {
        period: 'MONTHLY',
        startDate: startOfMonth,
        agentId: { not: null }
      },
      include: {
        agent: {
          include: {
            manager: true
          }
        }
      }
    });

    const managerSalesMap = new Map<number, { name: string, sales: number }>();
    monthPerformances.forEach(record => {
      const manager = record.agent?.manager;
      if (manager) {
        const current = managerSalesMap.get(manager.id) || { name: manager.name, sales: 0 };
        current.sales += record.salesCount || 0;
        managerSalesMap.set(manager.id, current);
      }
    });

    const topManagers = Array.from(managerSalesMap.values())
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 3); // top 3 managers
    
    return {
      totalOffices,
      newOfficesThisMonth,
      activeManagers,
      newManagersThisMonth,
      totalAgents,
      newAgentsThisMonth,
      activeTVBoards,
      activities,
      topOffice,
      topManagers
    };
  }
}
