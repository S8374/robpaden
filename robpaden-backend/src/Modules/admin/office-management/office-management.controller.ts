import { Request, Response } from "express";
import { BaseController } from "@/core/BaseController";
import { AppLogger } from "@/core/logging/logger";
import { CreateOfficeDTO, UpdateOfficeSettingsBodyDTO, UpdateOfficeSettingsParamsDTO } from "./OfficeManagementDTO";
import { OfficeManagementService } from "./office-management.service";
import { uploadFileToRustFS } from "@/lib/rustfs";
import { BadRequestError } from "@/core/errors/AppError";

export class OfficeManagementController extends BaseController {
  private logger = new AppLogger("OfficeManagementController");

  constructor(private readonly officeService: OfficeManagementService) {
    super();
  }

  public async createOffice(req: Request, res: Response) {
    this.logger.info("Received request to create office");
    
    const { name, timeZone, officeStartTime, officeCloseTime, monthlyGoal } = req.validatedBody as CreateOfficeDTO;
    
    let logoUrl: string | undefined;
    if (req.file) {
      logoUrl = await uploadFileToRustFS(req.file.buffer, req.file.originalname, req.file.mimetype);
    }
    
    const result = await this.officeService.createOffice({
      name,
      logoUrl,
      timeZone,
      officeStartTime,
      officeCloseTime,
      monthlyGoal
    });
    
    return this.sendCreatedResponse(req, res, result, "Office (Company) created successfully");
  }

  public async getOffices(req: Request, res: Response) {
    this.logger.info("Received request to fetch offices");
    
    const result = await this.officeService.getOffices();
    
    return this.sendResponse(req, res, "Offices retrieved successfully", 200, result);
  }

  public async updateOfficeSettings(req: Request, res: Response) {
    this.logger.info("Received request to update office settings");
    
    const { id } = req.validatedParams as UpdateOfficeSettingsParamsDTO;
    const body = req.validatedBody as UpdateOfficeSettingsBodyDTO;
    
    if (req.file) {
      body.logoUrl = await uploadFileToRustFS(req.file.buffer, req.file.originalname, req.file.mimetype);
    } else if (typeof body.logoUrl !== 'string') {
      delete body.logoUrl;
    }
    
    const result = await this.officeService.updateOfficeSettings(id, body);
    
    return this.sendResponse(req, res, "Office settings updated successfully", 200, result);
  }

  public async deleteOffice(req: Request, res: Response) {
    this.logger.info("Received request to delete office");
    
    const officeId = Number(req.params.id);
    
    await this.officeService.deleteOffice(officeId);
    
    return this.sendResponse(req, res, "Office deleted successfully", 200, null);
  }


}
