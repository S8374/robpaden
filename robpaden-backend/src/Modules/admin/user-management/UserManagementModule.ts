import { BaseModule } from "@/core/BaseModule";
import { AppLogger } from "@/core/logging/logger";
import { UserManagementController } from "./user-management.controller";
import { UserManagementService } from "./user-management.service";
import { validateRequest } from "@/middleware/validation";
import { inviteUserSchema, updateUserSchema, updateUserStatusSchema } from "./UserManagementDTO";

export class UserManagementModule extends BaseModule {
  public name: string = "UserManagementModule";
  public version: string = "1.0.0";
  public basePath: string = "/admin/v1/users/";
  public dependencies?: string[] | undefined;

  private logger = new AppLogger("UserManagementModule");

  protected async setupUseCases(): Promise<void> {
    const prisma = this.context.getService("prisma");
    this.registerService("UserManagementService", new UserManagementService(prisma));
  }
  
  protected async setupControllers(): Promise<void> {
    const userManagementService = this.getService<UserManagementService>("UserManagementService");
    this.registerController("UserManagementController", new UserManagementController(userManagementService));
  }

  protected async setupRoutes(): Promise<void> {
    const controller = this.getController<UserManagementController>("UserManagementController");
    
    // POST /admin/v1/users/invite
    this.router.post(
      "/invite",
      validateRequest(inviteUserSchema),
      controller.inviteUser.bind(controller)
    );

    // GET /admin/v1/users
    this.router.get(
      "/",
      controller.getUsers.bind(controller)
    );

    // GET /admin/v1/users/:id/details
    this.router.get(
      "/:id/details",
      controller.getUserDetails.bind(controller)
    );

    // GET /admin/v1/users/:id/activity
    this.router.get(
      "/:id/activity",
      controller.getManagerActivityTimeline.bind(controller)
    );

    // GET /admin/v1/users/:id/agent-activity
    this.router.get(
      "/:id/agent-activity",
      controller.getAgentActivityTimeline.bind(controller)
    );

    // PUT /admin/v1/users/:id
    this.router.put(
      "/:id",
      validateRequest(updateUserSchema),
      controller.updateUser.bind(controller)
    );

    // DELETE /admin/v1/users/:id
    this.router.delete(
      "/:id",
      controller.deleteUser.bind(controller)
    );

    // PATCH /admin/v1/users/:id/status
    this.router.patch(
      "/:id/status",
      validateRequest(updateUserStatusSchema),
      controller.updateUserStatus.bind(controller)
    );

    // GET /admin/v1/users/invitations
    this.router.get(
      "/invitations",
      controller.getInvitations.bind(controller)
    );

    // GET /admin/v1/users/stats
    this.router.get(
      "/stats",
      controller.getUserStats.bind(controller)
    );
  }
}
