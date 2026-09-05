import { AppLogger } from "@/core/logging/logger";
import { PrismaClient } from "@prisma/client";
import { ConflictError, NotFoundError } from "@/core/errors/AppError";
import { EmailService } from "@/core/services/email.service";
import { encryptPassword, decryptPassword } from "@/core/utils/encryption";
import { InviteAgentDTO } from "./ManagerAgentDTO";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

export class ManagerAgentService {
  private logger = new AppLogger("ManagerAgentService");
  private emailService = new EmailService();

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

  public async inviteAgent(data: InviteAgentDTO, managerId: number, companyId: number) {
    this.logger.info("Manager creating new agent", { email: data.email, managerId });

    // Check manager's agent limit
    const manager = await this.prisma.user.findUnique({
      where: { id: managerId },
      include: { _count: { select: { agents: true } } }
    });

    if (manager?.agentLimit !== null && manager?.agentLimit !== undefined) {
      if (manager._count.agents >= manager.agentLimit) {
        throw new ConflictError(`You have reached your agent limit of ${manager.agentLimit}. Please contact an administrator to increase it.`);
      }
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new ConflictError("A user with this email already exists");
    }

    let companyName = "Robpaden";
    let companyLogoUrl = "";
    if (companyId) {
      const company = await this.prisma.company.findUnique({ 
        where: { id: companyId },
        include: { settings: true }
      });
      if (company) {
        companyName = company.name;
        companyLogoUrl = company.settings?.logoUrl || "";
      }
    }

    // Agents don't need a login password for the dashboard anymore.
    // They access a tokenized "Add Sales" page. We'll generate a random password for Prisma constraint.
    const rawPassword = data.password || Math.random().toString(36).slice(-10);
    const hashedPassword = encryptPassword(rawPassword);

    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: "AGENT",
        companyId,
        managerId,
        avatarUrl: data.avatarUrl,
        dailyGoal: data.dailyGoal,
        weeklyGoal: data.weeklyGoal,
        monthlyGoal: data.monthlyGoal,
      }
    });

    await this.prisma.agentActivityLog.create({
      data: {
        action: "AGENT_ADDED",
        agentId: user.id,
        managerId,
        details: JSON.stringify({ name: data.name })
      }
    });

    await this.prisma.systemActivity.create({
      data: {
        action: "Agent Added",
        entityName: `${data.name} (${manager?.name || 'Unknown'})`,
        iconType: "UsersRound",
        creatorRole: "MANAGER",
        link: "/dashboard/agent-management"
      }
    });

    const emailSent = await this.emailService.sendWelcomeEmail(
      data.email, 
      data.name,
      "AGENT", 
      rawPassword,
      companyId,
      companyName,
      companyLogoUrl
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        managerId: user.managerId,
      },
      emailSent
    };
  }

  public async getMyAgents(managerId: number, dateStr?: string) {
    this.logger.info("Fetching agents for manager", { managerId, dateStr });
    
    const manager = await this.prisma.user.findUnique({
      where: { id: managerId },
      include: { company: { include: { settings: true } } }
    });

    const companySettings = manager?.company?.settings;
    const timeZone = companySettings?.timeZone || 'UTC';
    const officeStartTime = companySettings?.officeStartTime || '00:00';
    const weeklyResetDay = companySettings?.weeklyResetDay ?? 1;

    let bucketDate: Date;
    if (dateStr && dateStr.includes('-')) {
      bucketDate = new Date(`${dateStr}T00:00:00.000Z`);
    } else {
      bucketDate = this.getWorkingDayBucket(new Date(), timeZone, officeStartTime);
    }

    const startOfWeek = this.getStartOfWeek(bucketDate, weeklyResetDay);

    const sevenDaysAgo = new Date(bucketDate);
    sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 6);

    const agents = await this.prisma.user.findMany({
      where: {
        managerId,
        role: "AGENT"
      },
      include: {
        performanceRecords: {
          where: {
            OR: [
              { period: 'DAILY', startDate: { gte: sevenDaysAgo } },
              { period: 'WEEKLY', startDate: startOfWeek }
            ]
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return agents.map(agent => {
      if (agent.password) {
        agent.password = decryptPassword(agent.password);
        if (agent.password.startsWith("$2b$") || agent.password.startsWith("$2a$")) {
          agent.password = ""; // Do not send bcrypt hashes to frontend
        }
      }
      
      const bucketDateStr = format(bucketDate, 'yyyy-MM-dd');
      const startOfWeekStr = format(startOfWeek, 'yyyy-MM-dd');

      const dailyRecord = (agent as any).performanceRecords?.find((r: any) => 
        r.period === 'DAILY' && (
          new Date(r.startDate).getTime() === bucketDate.getTime() ||
          format(new Date(r.startDate), 'yyyy-MM-dd') === bucketDateStr
        )
      );
      
      const weeklyRecord = (agent as any).performanceRecords?.find((r: any) => 
        r.period === 'WEEKLY' && (
          new Date(r.startDate).getTime() === startOfWeek.getTime() ||
          format(new Date(r.startDate), 'yyyy-MM-dd') === startOfWeekStr
        )
      );
      
      const trend = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(bucketDate);
        d.setUTCDate(d.getUTCDate() - i);
        const dStr = format(d, 'yyyy-MM-dd');
        const record = (agent as any).performanceRecords?.find((r: any) => 
          r.period === 'DAILY' && (
            new Date(r.startDate).getTime() === d.getTime() ||
            format(new Date(r.startDate), 'yyyy-MM-dd') === dStr
          )
        );
        trend.push(record?.salesCount || 0);
      }
      
      const { performanceRecords, ...agentWithoutRecords } = agent as any;

      return {
        ...agentWithoutRecords,
        salesToday: dailyRecord?.salesCount || 0,
        salesWeek: weeklyRecord?.salesCount || 0,
        trend
      };
    });
  }

  public async assignAgent(agentId: number, managerId: number, companyId: number) {
    this.logger.info("Manager assigning an agent", { agentId, managerId });

    // Check manager's agent limit
    const manager = await this.prisma.user.findUnique({
      where: { id: managerId },
      include: { _count: { select: { agents: true } } }
    });

    if (manager?.agentLimit !== null && manager?.agentLimit !== undefined) {
      if (manager._count.agents >= manager.agentLimit) {
        throw new ConflictError(`You have reached your agent limit of ${manager.agentLimit}. Please contact an administrator to increase it.`);
      }
    }

    const agent = await this.prisma.user.findUnique({
      where: { id: agentId }
    });

    if (!agent) {
      throw new NotFoundError("Agent not found");
    }

    if (agent.role !== "AGENT") {
      throw new ConflictError("Can only assign users with the AGENT role");
    }

    if (agent.companyId !== companyId) {
      throw new ConflictError("Agent must belong to your company to be assigned");
    }

    if (agent.managerId && agent.managerId !== managerId) {
      throw new ConflictError("This agent is already assigned to another manager");
    }

    const updatedAgent = await this.prisma.user.update({
      where: { id: agentId },
      data: { managerId }
    });

    await this.prisma.agentActivityLog.create({
      data: {
        action: "AGENT_ADDED", // Treat assign as added to this manager's team
        agentId,
        managerId,
        details: JSON.stringify({ name: agent.name, note: "Assigned to manager" })
      }
    });

    return updatedAgent;
  }

  public async updateAgent(agentId: number, data: any, managerId: number) {
    this.logger.info("Manager updating an agent", { agentId, managerId });

    const agent = await this.prisma.user.findUnique({
      where: { id: agentId }
    });

    if (!agent || agent.managerId !== managerId) {
      throw new NotFoundError("Agent not found or you do not have permission to manage this agent");
    }

    const updateData: any = {
      name: data.name,
      avatarUrl: data.avatarUrl,
      dailyGoal: data.dailyGoal,
      weeklyGoal: data.weeklyGoal,
      monthlyGoal: data.monthlyGoal,
    };

    if (data.email && data.email !== agent.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: data.email }
      });
      if (existingUser) {
        throw new ConflictError("A user with this email already exists");
      }
      updateData.email = data.email;
    }

    if (data.password) {
      updateData.password = encryptPassword(data.password);
    }

    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive;
    }

    let action: any = "AGENT_UPDATED";
    let actionDetails = "Updated agent profile";

    if (data.isActive !== undefined && data.isActive !== agent.isActive) {
      action = data.isActive ? "AGENT_ACTIVATED" : "AGENT_DEACTIVATED";
      actionDetails = data.isActive ? "Activated agent" : "Deactivated agent";
    }

    const updated = await this.prisma.user.update({
      where: { id: agentId },
      data: updateData
    });

    await this.prisma.agentActivityLog.create({
      data: {
        action,
        agentId,
        managerId,
        details: JSON.stringify({ note: actionDetails })
      }
    });

    if (data.isActive !== undefined && data.isActive !== agent.isActive) {
      await this.prisma.systemActivity.create({
        data: {
          action: data.isActive ? "Agent Activated" : "Agent Deactivated",
          entityName: `${agent.name}`,
          iconType: "UsersRound",
          creatorRole: "MANAGER",
          link: "/dashboard/agent-management"
        }
      });
    }

    return updated;
  }

  public async deleteAgent(agentId: number, managerId: number) {
    this.logger.info("Manager deleting an agent", { agentId, managerId });

    const agent = await this.prisma.user.findUnique({
      where: { id: agentId }
    });

    if (!agent || agent.managerId !== managerId) {
      throw new NotFoundError("Agent not found or you do not have permission to manage this agent");
    }

    await this.prisma.user.delete({
      where: { id: agentId }
    });

    await this.prisma.agentActivityLog.create({
      data: {
        action: "AGENT_DEACTIVATED",
        agentId,
        managerId,
        details: JSON.stringify({ note: "Deleted agent completely" })
      }
    });

    await this.prisma.systemActivity.create({
      data: {
        action: "Agent Deleted",
        entityName: `${agent.name}`,
        iconType: "UsersRound",
        creatorRole: "MANAGER",
        link: "/dashboard/agent-management"
      }
    });

    return { message: "Agent successfully deleted" };
  }
}
