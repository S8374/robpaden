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
    let celebrationSoundUrl: string | undefined;

    if (req.files) {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (files['logoUrl'] && files['logoUrl'][0]) {
        const file = files['logoUrl'][0];
        logoUrl = await uploadFileToRustFS(file.buffer, file.originalname, file.mimetype);
      }
      if (files['celebrationSoundUrl'] && files['celebrationSoundUrl'][0]) {
        const file = files['celebrationSoundUrl'][0];
        celebrationSoundUrl = await uploadFileToRustFS(file.buffer, file.originalname, file.mimetype);
      }
    }
    
    const result = await this.officeService.createOffice({
      name,
      logoUrl,
      celebrationSoundUrl,
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
    
    if (req.files) {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (files['logoUrl'] && files['logoUrl'][0]) {
        const file = files['logoUrl'][0];
        body.logoUrl = await uploadFileToRustFS(file.buffer, file.originalname, file.mimetype);
      }
      if (files['celebrationSoundUrl'] && files['celebrationSoundUrl'][0]) {
        const file = files['celebrationSoundUrl'][0];
        body.celebrationSoundUrl = await uploadFileToRustFS(file.buffer, file.originalname, file.mimetype);
      }
    }
    
    if (typeof body.logoUrl !== 'string') {
      delete body.logoUrl;
    }
    if (typeof body.celebrationSoundUrl !== 'string') {
      delete body.celebrationSoundUrl;
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

  public async getTvDevices(req: Request, res: Response) {
    this.logger.info("Received request to fetch TV devices for office");
    const officeId = Number(req.params.id);
    const result = await this.officeService.getTvDevices(officeId);
    return this.sendResponse(req, res, "TV Devices retrieved successfully", 200, result);
  }

  public async deleteTvDevice(req: Request, res: Response) {
    this.logger.info("Received request to delete TV device");
    const deviceId = req.params.deviceId;
    await this.officeService.deleteTvDevice(deviceId as string);
    return this.sendResponse(req, res, "TV Device deleted successfully", 200, null);
  }

  public async blockTvDevice(req: Request, res: Response) {
    this.logger.info("Received request to block/unblock TV device");
    const deviceId = req.params.deviceId;
    const { isBlocked } = req.body;
    const result = await this.officeService.blockTvDevice(deviceId as string, isBlocked);
    return this.sendResponse(req, res, "TV Device block status updated", 200, result);
  }

}
