import { Request, Response } from "express";
import { BaseController } from "@/core/BaseController";
import { AppLogger } from "@/core/logging/logger";
import { ManagerAgentService } from "./manager-agent.service";
import { InviteAgentDTO } from "./ManagerAgentDTO";
import { AuthorizationError, BadRequestError } from "@/core/errors/AppError";

export class ManagerAgentController extends BaseController {
  private logger = new AppLogger("ManagerAgentController");

  constructor(private readonly managerAgentService: ManagerAgentService) {
    super();
  }

  public async inviteAgent(req: Request, res: Response) {
    this.logger.info("Received request from manager to invite an agent");

    const managerId = req.user?.userId;
    const companyId = req.user?.companyId;

    if (!managerId || !companyId) {
      throw new AuthorizationError("You must be assigned to a company to invite agents");
    }

    const body = req.validatedBody as InviteAgentDTO;

    const result = await this.managerAgentService.inviteAgent(body, managerId, companyId);

    return this.sendCreatedResponse(req, res, result, "Agent created successfully");
  }

  public async getMyAgents(req: Request, res: Response) {
    this.logger.info("Received request to fetch manager's agents");

    const managerId = req.user?.userId;
    if (!managerId) {
      throw new AuthorizationError("Invalid user context");
    }

    const { date } = req.query;
    const agents = await this.managerAgentService.getMyAgents(managerId, date as string);

    return this.sendResponse(req, res, "Agents retrieved successfully", 200, agents);
  }

  public async assignAgent(req: Request, res: Response) {
    this.logger.info("Received request to assign an agent");

    const agentId = parseInt(String(req.params.id), 10);
    if (isNaN(agentId)) {
      throw new BadRequestError("Invalid agent ID");
    }

    const managerId = req.user?.userId;
    const companyId = req.user?.companyId;

    if (!managerId || !companyId) {
      throw new AuthorizationError("You must be assigned to a company to assign agents");
    }

    const assignedAgent = await this.managerAgentService.assignAgent(agentId, managerId, companyId);

    return this.sendResponse(req, res, "Agent assigned successfully", 200, assignedAgent);
  }

  public async updateAgent(req: Request, res: Response) {
    this.logger.info("Received request to update an agent");

    const agentId = parseInt(String(req.params.id), 10);
    if (isNaN(agentId)) {
      throw new BadRequestError("Invalid agent ID");
    }

    const managerId = req.user?.userId;
    if (!managerId) throw new AuthorizationError("Invalid user context");

    const body = req.body;

    const updatedAgent = await this.managerAgentService.updateAgent(agentId, body, managerId);
    return this.sendResponse(req, res, "Agent updated successfully", 200, updatedAgent);
  }

  public async deleteAgent(req: Request, res: Response) {
    this.logger.info("Received request to delete an agent");

    const agentId = parseInt(String(req.params.id), 10);
    if (isNaN(agentId)) {
      throw new BadRequestError("Invalid agent ID");
    }

    const managerId = req.user?.userId;
    if (!managerId) throw new AuthorizationError("Invalid user context");

    const result = await this.managerAgentService.deleteAgent(agentId, managerId);
    return this.sendResponse(req, res, "Agent deleted successfully", 200, result);
  }
}
