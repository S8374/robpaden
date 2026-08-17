import { AppLogger } from "@/core/logging/logger";
import { PrismaClient } from "@prisma/client";
import { ConflictError, NotFoundError } from "@/core/errors/AppError";
import { EmailService } from "@/core/services/email.service";
import bcrypt from "bcrypt";
import { InviteAgentDTO } from "./ManagerAgentDTO";

export class ManagerAgentService {
  private logger = new AppLogger("ManagerAgentService");
  private emailService = new EmailService();

  constructor(private readonly prisma: PrismaClient) {}

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
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

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

  public async getMyAgents(managerId: number) {
    this.logger.info("Fetching agents for manager", { managerId });
    return this.prisma.user.findMany({
      where: {
        managerId,
        role: "AGENT"
      },
      orderBy: { createdAt: 'desc' }
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

    return this.prisma.user.update({
      where: { id: agentId },
      data: { managerId }
    });
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

    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive;
    }

    return this.prisma.user.update({
      where: { id: agentId },
      data: updateData
    });
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

    return { message: "Agent successfully deleted" };
  }
}
