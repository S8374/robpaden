import { AppLogger } from "@/core/logging/logger";
import { PrismaClient } from "@prisma/client";
import { ConflictError, NotFoundError } from "@/core/errors/AppError";
import { EmailService } from "@/core/services/email.service";
import { encryptPassword, decryptPassword } from "@/core/utils/encryption";
import { InviteUserDTO, UpdateUserDTO } from "./UserManagementDTO";

export class UserManagementService {
  private logger = new AppLogger("UserManagementService");
  private emailService = new EmailService();

  constructor(private readonly prisma: PrismaClient) {}

  public async inviteUser(data: InviteUserDTO, invitedById: number) {
    this.logger.info("Creating new user", { email: data.email, role: data.role });

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new ConflictError("A user with this email already exists");
    }

    let companyName = "Robpaden";
    let companyLogoUrl = "";

    // Check if company exists if provided
    if (data.companyId) {
      const company = await this.prisma.company.findUnique({ 
        where: { id: data.companyId },
        include: { settings: true }
      });
      if (!company) throw new NotFoundError("Company not found");
      
      companyName = company.name;
      companyLogoUrl = company.settings?.logoUrl || "";
    }

    // Check if manager exists if provided
    if (data.managerId) {
      const manager = await this.prisma.user.findUnique({ where: { id: data.managerId } });
      if (!manager || manager.role !== "MANAGER") {
        throw new NotFoundError("Manager not found or invalid role");
      }
    }

    // Encrypt the provided password
    const encryptedPassword = encryptPassword(data.password);

    const userName = data.name && data.name.trim() !== "" ? data.name : data.email.split('@')[0];

    // Create User directly
    const user = await this.prisma.user.create({
      data: {
        name: userName,
        email: data.email,
        password: encryptedPassword,
        role: data.role,
        companyId: data.companyId,
        managerId: data.managerId,
        agentLimit: data.agentLimit,
      }
    });

    await this.prisma.systemActivity.create({
      data: {
        action: data.role === 'MANAGER' ? 'Manager Added' : 'Agent Added',
        entityName: `${userName} (${companyName})`,
        iconType: data.role === 'MANAGER' ? 'Users' : 'UsersRound'
      }
    });

    // Send welcome email in background without blocking
    this.emailService.sendWelcomeEmail(
      data.email, 
      userName,
      data.role, 
      data.password,
      data.companyId,
      companyName,
      companyLogoUrl
    ).then(sent => {
      if (!sent) this.logger.error(`Failed to send welcome email to ${data.email}`);
    }).catch(e => {
      this.logger.error(`Error sending welcome email in background`, e);
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        managerId: user.managerId
      },
      emailSent: true // optimistic
    };
  }

  public async getUsers() {
    this.logger.info("Fetching all users");
    const users = await this.prisma.user.findMany({
      where: {
        role: "MANAGER"
      },
      include: {
        company: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    return users.map(user => {
      if (user.password) {
        user.password = decryptPassword(user.password);
        if (user.password.startsWith("$2b$") || user.password.startsWith("$2a$")) {
          user.password = ""; // Do not send bcrypt hashes to frontend
        }
      }
      return user;
    });
  }

  public async getUserDetails(id: number) {
    this.logger.info("Fetching user details", { userId: id });
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        company: true,
        manager: { select: { id: true, name: true, email: true } },
        performanceRecords: {
          orderBy: { startDate: 'desc' }
        },
        agents: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true,
            dailyGoal: true,
            weeklyGoal: true,
            monthlyGoal: true,
            performanceRecords: true // Fetch all records to calculate on the fly
          }
        },
      }
    });

    if (!user) throw new NotFoundError("User not found");

    if (user.password) {
      user.password = decryptPassword(user.password);
      if (user.password.startsWith("$2b$") || user.password.startsWith("$2a$")) {
        user.password = ""; // Do not send bcrypt hashes to frontend
      }
    }
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const todayTime = now.getTime();
    
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeekDate = new Date(now);
    startOfWeekDate.setDate(diff);
    const startOfWeekTime = startOfWeekDate.getTime();
    
    const startOfMonthDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfMonthTime = startOfMonthDate.getTime();

    if (user.agents && user.agents.length > 0) {
      user.agents = user.agents.map((agent: any) => {
        let dailySales = 0;
        let weeklySales = 0;
        let monthlySales = 0;

        agent.performanceRecords.forEach((record: any) => {
          const recordTime = new Date(record.startDate).getTime();

          if (record.period === 'DAILY' && recordTime === todayTime) {
            dailySales = record.salesCount;
          }
          if (record.period === 'WEEKLY' && recordTime === startOfWeekTime) {
            weeklySales = record.salesCount;
          }
          if (record.period === 'MONTHLY' && recordTime === startOfMonthTime) {
            monthlySales = record.salesCount;
          }
        });

        return {
          ...agent,
          performance: {
            daily: dailySales,
            weekly: weeklySales,
            monthly: monthlySales
          },
          performanceRecords: undefined // exclude from payload
        };
      }) as any;
    }

    if (user.role === "AGENT" && (user as any).performanceRecords) {
      let dailySales = 0;
      let weeklySales = 0;
      let monthlySales = 0;

      (user as any).performanceRecords.forEach((record: any) => {
        const recordTime = new Date(record.startDate).getTime();

        if (record.period === 'DAILY' && recordTime === todayTime) {
          dailySales = record.salesCount;
        }
        if (record.period === 'WEEKLY' && recordTime === startOfWeekTime) {
          weeklySales = record.salesCount;
        }
        if (record.period === 'MONTHLY' && recordTime === startOfMonthTime) {
          monthlySales = record.salesCount;
        }
      });

      (user as any).performance = {
        daily: dailySales,
        weekly: weeklySales,
        monthly: monthlySales
      };
      
      // Filter performance records to only show DAILY history in the UI
      (user as any).performanceRecords = (user as any).performanceRecords.filter(
        (r: any) => r.period === 'DAILY'
      );
    }

    return user;
  }

  public async updateUser(id: number, data: UpdateUserDTO) {
    this.logger.info("Updating user", { userId: id });
    
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundError("User not found");

    if (data.email && data.email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({ where: { email: data.email } });
      if (existingUser) throw new ConflictError("Email already in use");
    }

    const updateData: any = { ...data };
    if (data.password) {
      updateData.password = encryptPassword(data.password);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData
    });

    if (updatedUser.password) {
      updatedUser.password = decryptPassword(updatedUser.password);
    }
    return updatedUser;
  }

  public async deleteUser(id: number) {
    this.logger.info("Deleting user", { userId: id });
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundError("User not found");

    await this.prisma.$transaction(async (tx) => {
      // Delete child records manually to avoid foreign key constraint errors
      await tx.sale.deleteMany({ where: { OR: [{ agentId: id }, { managerId: id }] } });
      await tx.performanceRecord.deleteMany({ where: { agentId: id } });
      await tx.salesAuditLog.deleteMany({ where: { OR: [{ agentId: id }, { managerId: id }] } });
      await tx.agentActivityLog.deleteMany({ where: { OR: [{ agentId: id }, { managerId: id }] } });
      await tx.reportHistory.deleteMany({ where: { managerId: id } });
      await tx.reportRecipient.deleteMany({ where: { managerId: id } });
      await tx.invitation.deleteMany({ where: { invitedById: id } });
      
      // Detach agents from this manager if user is a manager
      await tx.user.updateMany({ where: { managerId: id }, data: { managerId: null } });

      await tx.user.delete({ where: { id } });
    });
    
    return { success: true };
  }

  public async updateUserStatus(id: number, isActive: boolean) {
    this.logger.info("Updating user status", { userId: id, isActive });
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundError("User not found");

    return this.prisma.user.update({
      where: { id },
      data: { isActive }
    });
  }

  public async getInvitations() {
    this.logger.info("Fetching all pending invitations");
    return this.prisma.invitation.findMany({
      where: { status: "PENDING" },
      include: {
        invitedBy: { select: { id: true, name: true, email: true } },
        company: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  public async getUserStats() {
    this.logger.info("Fetching user statistics");
    
    const [totalUsers, totalManagers, totalAgents, pendingInvitations] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'MANAGER' } }),
      this.prisma.user.count({ where: { role: 'AGENT' } }),
      this.prisma.invitation.count({ where: { status: 'PENDING' } })
    ]);
    
    return {
      totalUsers,
      totalManagers,
      totalAgents,
      pendingInvitations
    };
  }

  public async getManagerActivityTimeline(managerId: number) {
    this.logger.info("Fetching activity timeline for manager", { managerId });

    // 1. Fetch Sales Audit Logs
    const salesLogs = await this.prisma.salesAuditLog.findMany({
      where: { managerId },
      include: { agent: { select: { name: true } } }
    });

    // 2. Fetch Agent Activity Logs
    const agentLogs = await this.prisma.agentActivityLog.findMany({
      where: { managerId },
      include: { agent: { select: { name: true } } }
    });

    // 3. Map and unify the timeline
    const timeline: any[] = [];

    salesLogs.forEach(log => {
      timeline.push({
        type: 'SALE',
        action: log.isReversed ? 'REVERSED' : log.action,
        date: log.date,
        agentId: log.agentId,
        agentName: log.agent.name,
        details: {
          previousAmount: log.previousAmount,
          newAmount: log.newAmount
        }
      });
    });

    agentLogs.forEach(log => {
      let parsedDetails = {};
      try {
        if (log.details) parsedDetails = JSON.parse(log.details);
      } catch (e) {}

      timeline.push({
        type: 'AGENT',
        action: log.action,
        date: log.date,
        agentId: log.agentId,
        agentName: log.agent.name,
        details: parsedDetails
      });
    });

    // 4. Sort chronologically (newest first)
    timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return timeline;
  }

  public async getAgentActivityTimeline(agentId: number) {
    this.logger.info("Fetching activity timeline for agent", { agentId });

    // 1. Fetch Sales Audit Logs
    const salesLogs = await this.prisma.salesAuditLog.findMany({
      where: { agentId },
      include: { manager: { select: { name: true } } }
    });

    // 2. Fetch Agent Activity Logs
    const agentLogs = await this.prisma.agentActivityLog.findMany({
      where: { agentId },
      include: { manager: { select: { name: true } } }
    });

    // 3. Map and unify the timeline
    const timeline: any[] = [];

    salesLogs.forEach(log => {
      timeline.push({
        type: 'SALE',
        action: log.isReversed ? 'REVERSED' : log.action,
        date: log.date,
        managerName: log.manager.name,
        details: {
          previousAmount: log.previousAmount,
          newAmount: log.newAmount
        }
      });
    });

    agentLogs.forEach(log => {
      let parsedDetails = {};
      try {
        if (log.details) parsedDetails = JSON.parse(log.details);
      } catch (e) {}

      timeline.push({
        type: 'AGENT',
        action: log.action,
        date: log.date,
        managerName: log.manager.name,
        details: parsedDetails
      });
    });

    // 4. Sort chronologically (newest first)
    timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return timeline;
  }
}
