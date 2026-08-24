import { Request, Response } from "express";
import { BaseController } from "@/core/BaseController";
import { AppLogger } from "@/core/logging/logger";
import { DashboardService } from "./dashboard.service";

export class DashboardController extends BaseController {
  private logger = new AppLogger("DashboardController");

  constructor(private readonly dashboardService: DashboardService) {
    super();
  }

  public async getDashboardOverview(req: Request, res: Response) {
    this.logger.info("Received request to fetch dashboard overview");
    
    const stats = await this.dashboardService.getDashboardOverview();
    
    return this.sendResponse(req, res, "Dashboard overview retrieved successfully", 200, stats);
  }
}
