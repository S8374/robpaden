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

    // Send welcome email with the raw password
    const emailSent = await this.emailService.sendWelcomeEmail(
      data.email, 
      userName,
      data.role, 
      data.password,
      data.companyId,
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
        managerId: user.managerId
      },
      emailSent
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
        team: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return users.map(user => {
      if (user.password) {
        user.password = decryptPassword(user.password);
      }
      return user;
    });
  }

  public async getUserDetails(id: number) {
    this.logger.info("Fetching user details", { userId: id });
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        company: {
          include: {
            teams: {
              include: {
                members: { select: { id: true, name: true, email: true, teamRole: true, isActive: true } }
              }
            }
          }
        },
        team: true,
        manager: { select: { id: true, name: true, email: true } },
        agents: { select: { id: true, name: true, email: true, isActive: true, teamId: true } },
      }
    });

    if (!user) throw new NotFoundError("User not found");

    if (user.password) {
      user.password = decryptPassword(user.password);
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

    // Check if user is MANAGER and has associated offices or agents
    if (user.role === 'MANAGER') {
       // Depending on business logic, we might need to detach or reassign
       // Prisma will handle constraints, but we can just let it cascade or fail
    }

    await this.prisma.user.delete({ where: { id } });
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
}
