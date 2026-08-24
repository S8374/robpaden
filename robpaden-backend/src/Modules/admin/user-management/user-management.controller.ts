import { Request, Response } from "express";
import { BaseController } from "@/core/BaseController";
import { AppLogger } from "@/core/logging/logger";
import { UserManagementService } from "./user-management.service";
import { InviteUserDTO, UpdateUserDTO, UpdateUserStatusDTO } from "./UserManagementDTO";

export class UserManagementController extends BaseController {
  private logger = new AppLogger("UserManagementController");

  constructor(private readonly userManagementService: UserManagementService) {
    super();
  }

  public async inviteUser(req: Request, res: Response) {
    this.logger.info("Received request to invite user");
    
    const body = req.validatedBody as InviteUserDTO;
    
    // For now we will assume the request contains a valid Super Admin ID
    const invitedById = 1; 
    
    const result = await this.userManagementService.inviteUser(body, invitedById);
    
    return this.sendCreatedResponse(req, res, result, "User created successfully");
  }

  public async getUsers(req: Request, res: Response) {
    this.logger.info("Received request to fetch users");
    
    const result = await this.userManagementService.getUsers();
    
    return this.sendResponse(req, res, "Users retrieved successfully", 200, result);
  }

  public async getInvitations(req: Request, res: Response) {
    this.logger.info("Received request to fetch pending invitations");
    
    const result = await this.userManagementService.getInvitations();
    
    return this.sendResponse(req, res, "Invitations retrieved successfully", 200, result);
  }

  public async getUserStats(req: Request, res: Response) {
    this.logger.info("Received request to fetch user stats");
    const stats = await this.userManagementService.getUserStats();
    return this.sendResponse(req, res, "User stats retrieved successfully", 200, stats);
  }

  public async getUserDetails(req: Request, res: Response) {
    const id = parseInt(req.params.id as string, 10);
    this.logger.info("Received request to fetch user details", { userId: id });
    const result = await this.userManagementService.getUserDetails(id);
    return this.sendResponse(req, res, "User details retrieved successfully", 200, result);
  }

  public async getManagerActivityTimeline(req: Request, res: Response) {
    const id = parseInt(req.params.id as string, 10);
    this.logger.info("Received request to fetch manager activity timeline", { managerId: id });
    const result = await this.userManagementService.getManagerActivityTimeline(id);
    return this.sendResponse(req, res, "Activity timeline retrieved successfully", 200, result);
  }
  public async getAgentActivityTimeline(req: Request, res: Response) {
    const id = parseInt(req.params.id as string, 10);
    this.logger.info("Received request to fetch agent activity timeline", { agentId: id });

    const result = await this.userManagementService.getAgentActivityTimeline(id);
    return this.sendResponse(req, res, "Agent activity timeline retrieved successfully", 200, result);
  }

  public async updateUser(req: Request, res: Response) {
    const id = parseInt(req.params.id as  string, 10);
    this.logger.info("Received request to update user", { userId: id });
    const body = req.validatedBody as UpdateUserDTO;
    
    const result = await this.userManagementService.updateUser(id, body);
    return this.sendResponse(req, res, "User updated successfully", 200, result);
  }

  public async deleteUser(req: Request, res: Response) {
    const id = parseInt(req.params.id as string, 10);
    this.logger.info("Received request to delete user", { userId: id });
    
    await this.userManagementService.deleteUser(id);
    return this.sendResponse(req, res, "User deleted successfully", 200, null);
  }

  public async updateUserStatus(req: Request, res: Response) {
    const id = parseInt(req.params.id as string, 10);
    const body = req.validatedBody as UpdateUserStatusDTO;
    this.logger.info("Received request to update user status", { userId: id, isActive: body.isActive });
    
    const result = await this.userManagementService.updateUserStatus(id, body.isActive);
    return this.sendResponse(req, res, "User status updated successfully", 200, result);
  }
}
