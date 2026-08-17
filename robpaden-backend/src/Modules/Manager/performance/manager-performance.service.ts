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
    this.logger.info("Manager adding/updating daily sales", { managerId, agentId, salesCount });

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


    const date = new Date(dateString);
    const startOfWeek = this.getStartOfWeek(date);
    const startOfMonth = this.getStartOfMonth(date);

    return this.prisma.$transaction(async (tx) => {
      // 2. Fetch existing daily record (if any) to calculate the difference
      const existingDaily = await tx.performanceRecord.findUnique({
        where: {
          agentId_period_startDate: {
            agentId,
            period: PerformancePeriod.DAILY,
            startDate: date,
          }
        }
      });

      const previousAmount = existingDaily ? existingDaily.salesCount : 0;
      const difference = salesCount - previousAmount;

      if (difference === 0) {
        return existingDaily; // No change needed
      }

      // 3. Upsert Agent Daily Record
      const agentDaily = await tx.performanceRecord.upsert({
        where: {
          agentId_period_startDate: {
            agentId, period: PerformancePeriod.DAILY, startDate: date
          }
        },
        update: { salesCount },
        create: {
          agentId, companyId, period: PerformancePeriod.DAILY, startDate: date, salesCount
        }
      });

      // 4. Upsert Agent Weekly Record
      const agentWeekly = await tx.performanceRecord.upsert({
        where: {
          agentId_period_startDate: {
            agentId, period: PerformancePeriod.WEEKLY, startDate: startOfWeek
          }
        },
        update: { salesCount: { increment: difference } },
        create: {
          agentId, companyId, period: PerformancePeriod.WEEKLY, startDate: startOfWeek, salesCount: difference
        }
      });

      // 5. Upsert Agent Monthly Record
      const agentMonthly = await tx.performanceRecord.upsert({
        where: {
          agentId_period_startDate: {
            agentId, period: PerformancePeriod.MONTHLY, startDate: startOfMonth
          }
        },
        update: { salesCount: { increment: difference } },
        create: {
          agentId, companyId, period: PerformancePeriod.MONTHLY, startDate: startOfMonth, salesCount: difference
        }
      });



      // 7. Create Audit Log
      const auditLog = await tx.salesAuditLog.create({
        data: {
          action: existingDaily ? AuditAction.UPDATED : AuditAction.ADDED,
          previousAmount,
          newAmount: salesCount,
          date,
          agentId,
          managerId
        }
      });

      return {
        auditLog,
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
    return this.prisma.salesAuditLog.findMany({
      where: { manager: { companyId } },
      include: {
        agent: { select: { name: true, email: true } },
        manager: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 100
    });
  }

  public async getAgentPerformance(agentId: number, companyId: number) {
    return this.prisma.performanceRecord.findMany({
      where: { agentId, companyId },
      orderBy: { startDate: "desc" }
    });
  }
}
