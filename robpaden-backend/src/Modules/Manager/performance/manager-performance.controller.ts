import { Request, Response } from "express";
import { BaseController } from "@/core/BaseController";
import { AppLogger } from "@/core/logging/logger";
import { ManagerPerformanceService } from "./manager-performance.service";
import { AddDailySalesDTO } from "./ManagerPerformanceDTO";
import { AuthorizationError, BadRequestError } from "@/core/errors/AppError";

export class ManagerPerformanceController extends BaseController {
  private logger = new AppLogger("ManagerPerformanceController");

  constructor(private readonly managerPerformanceService: ManagerPerformanceService) {
    super();
  }

  public async addOrUpdateDailySales(req: Request, res: Response) {
    this.logger.info("Received request to add/update daily sales");

    const managerId = req.user?.userId;
    const companyId = req.user?.companyId;

    if (!managerId || !companyId) {
      throw new AuthorizationError("Invalid user context");
    }

    const { agentId, date, salesCount } = req.validatedBody as AddDailySalesDTO;

    const record = await this.managerPerformanceService.addOrUpdateDailySales(
      managerId,
      companyId,
      agentId,
      date,
      salesCount
    );

    return this.sendResponse(req, res, "Daily sales recorded and cascaded successfully", 200, record);
  }

  public async getPerformanceHistory(req: Request, res: Response) {
    const companyId = req.user?.companyId;
    if (!companyId) throw new AuthorizationError("Invalid user context");

    const history = await this.managerPerformanceService.getPerformanceHistory(companyId);
    return this.sendResponse(req, res, "Performance history retrieved", 200, history);
  }

  public async getAgentPerformance(req: Request, res: Response) {
    const companyId = req.user?.companyId;
    if (!companyId) throw new AuthorizationError("Invalid user context");

    const agentId = parseInt(String(req.params.agentId), 10);
    if (isNaN(agentId)) throw new BadRequestError("Invalid agent ID");

    const performance = await this.managerPerformanceService.getAgentPerformance(agentId, companyId);
    return this.sendResponse(req, res, "Agent performance retrieved", 200, performance);
  }
}
