import { AppLogger } from "@/core/logging/logger";
import { PrismaClient } from "@prisma/client";
import { ConflictError, NotFoundError } from "@/core/errors/AppError";
import { UpdateOfficeSettingsBodyDTO } from "./OfficeManagementDTO";

export class OfficeManagementService {
  private logger = new AppLogger("OfficeManagementService");

  constructor(private readonly prisma: PrismaClient) {}

  public async createOffice(payload: { name: string; logoUrl?: string; timeZone?: string; officeStartTime?: string; officeCloseTime?: string; monthlyGoal?: number; celebrationSoundUrl?: string; }) {
    this.logger.info("Creating new company (office)", { name: payload.name });

    const existing = await this.prisma.company.findUnique({
      where: { name: payload.name }
    });

    if (existing) {
      throw new ConflictError(`A company with the name '${payload.name}' already exists.`);
    }

    const company = await this.prisma.company.create({
      data: {
        name: payload.name,
        settings: {
          create: {
            companyName: payload.name,
            timeZone: payload.timeZone || "UTC",
            officeStartTime: payload.officeStartTime || "09:00",
            officeCloseTime: payload.officeCloseTime || "17:00",
            logoUrl: payload.logoUrl || null,
            celebrationSoundUrl: payload.celebrationSoundUrl || null,
            monthlyGoal: payload.monthlyGoal
          }
        }
      },
      include: {
        settings: true
      }
    });

    this.logger.info("Company created successfully", { companyId: company.id });
    
    await this.prisma.systemActivity.create({
      data: {
        action: "New Office Created",
        entityName: company.name,
        iconType: "Building2"
      }
    });

    return company;
  }

  public async getOffices() {
    this.logger.info("Fetching all offices");

    const offices = await this.prisma.company.findMany({
      include: {
        settings: true,
        users: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        _count: {
          select: { users: true }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

    return Promise.all(offices.map(async office => {
      const managers = office.users.filter(u => u.role === 'MANAGER');
      const agents = office.users.filter(u => u.role === 'AGENT');
      const { users, ...rest } = office;

      // Calculate current month's sales
      const aggregate = await this.prisma.performanceRecord.aggregate({
        where: {
          companyId: office.id,
          period: 'MONTHLY',
          startDate: startOfMonth
        },
        _sum: {
          salesCount: true
        }
      });
      const currentMonthSales = aggregate._sum.salesCount || 0;

      return {
        ...rest,
        managers,
        agents,
        currentMonthSales
      };
    }));
  }

  public async updateOfficeSettings(id: number, settings: UpdateOfficeSettingsBodyDTO) {
    this.logger.info("Updating company settings", { companyId: id });

    // Verify company exists
    const company = await this.prisma.company.findUnique({ where: { id } });
    if (!company) {
      throw new NotFoundError("Company not found");
    }

    // Update settings (use upsert in case settings somehow don't exist yet)
    const updatedSettings = await this.prisma.companySettings.upsert({
      where: { companyId: id },
      update: settings,
      create: {
        companyId: id,
        ...settings
      }
    });
    
    // Also update company root name if companyName was passed
    if (settings.companyName) {
      await this.prisma.company.update({
        where: { id },
        data: { name: settings.companyName }
      });
    }

    this.logger.info("Company settings updated successfully", { companyId: id });
    
    if (settings.tvTheme) {
      await this.prisma.systemActivity.create({
        data: {
          action: "TV Theme Updated",
          entityName: settings.companyName || company.name,
          iconType: "MonitorPlay"
        }
      });
    } else {
      await this.prisma.systemActivity.create({
        data: {
          action: "Office Settings Updated",
          entityName: settings.companyName || company.name,
          iconType: "Building2"
        }
      });
    }

    return updatedSettings;
  }

  public async deleteOffice(id: number) {
    this.logger.info("Deleting company", { companyId: id });

    const company = await this.prisma.company.findUnique({ where: { id } });
    if (!company) {
      throw new NotFoundError("Company not found");
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.performanceRecord.deleteMany({ where: { companyId: id } });
      await tx.invitation.deleteMany({ where: { companyId: id } });
      await tx.companySettings.deleteMany({ where: { companyId: id } });
      
      // Detach users from the office
      await tx.user.updateMany({ where: { companyId: id }, data: { companyId: null } });

      await tx.company.delete({ where: { id } });
    });
    
    this.logger.info("Company deleted successfully", { companyId: id });
  }

  public async getTvDevices(officeId: number) {
    this.logger.info("Fetching TV devices for office", { officeId });
    return this.prisma.tvDevice.findMany({
      where: { companyId: officeId },
      orderBy: { lastSeenAt: 'desc' }
    });
  }

  public async deleteTvDevice(id: string) {
    this.logger.info("Deleting TV device", { deviceId: id });
    const device = await this.prisma.tvDevice.findUnique({ where: { id } });
    if (!device) throw new NotFoundError("Device not found");
    
    await this.prisma.tvDevice.delete({ where: { id } });
  }

  public async blockTvDevice(id: string, isBlocked: boolean) {
    this.logger.info(`Setting device blocked status to ${isBlocked}`, { deviceId: id });
    const device = await this.prisma.tvDevice.findUnique({ where: { id } });
    if (!device) throw new NotFoundError("Device not found");

    return this.prisma.tvDevice.update({
      where: { id },
      data: { isBlocked }
    });
  }

}
