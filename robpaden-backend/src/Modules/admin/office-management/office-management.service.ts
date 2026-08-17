import { AppLogger } from "@/core/logging/logger";
import { PrismaClient } from "@prisma/client";
import { ConflictError, NotFoundError } from "@/core/errors/AppError";
import { UpdateOfficeSettingsBodyDTO } from "./OfficeManagementDTO";

export class OfficeManagementService {
  private logger = new AppLogger("OfficeManagementService");

  constructor(private readonly prisma: PrismaClient) {}

  public async createOffice(payload: { name: string; logoUrl?: string; timeZone?: string; officeStartTime?: string; officeCloseTime?: string; monthlyGoal?: number }) {
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
            monthlyGoal: payload.monthlyGoal
          }
        }
      },
      include: {
        settings: true
      }
    });

    this.logger.info("Company created successfully", { companyId: company.id });
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
          select: { users: true, teams: true }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return offices.map(office => {
      const managers = office.users.filter(u => u.role === 'MANAGER');
      const agents = office.users.filter(u => u.role === 'AGENT');
      const { users, ...rest } = office;
      return {
        ...rest,
        managers,
        agents
      };
    });
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
    return updatedSettings;
  }

  public async deleteOffice(id: number) {
    this.logger.info("Deleting company", { companyId: id });

    const company = await this.prisma.company.findUnique({ where: { id } });
    if (!company) {
      throw new NotFoundError("Company not found");
    }

    await this.prisma.company.delete({ where: { id } });
    
    this.logger.info("Company deleted successfully", { companyId: id });
  }

  public async getOfficeStats() {
    this.logger.info("Fetching office statistics");
    
    const totalOffices = await this.prisma.company.count();
    
    return {
      totalOffices
    };
  }
}
