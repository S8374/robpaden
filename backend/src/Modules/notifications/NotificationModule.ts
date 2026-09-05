import { BaseModule } from "@/core/BaseModule";
import { AppLogger } from "@/core/logging/logger";
import { NotificationService } from "./notification.service";
import { NotificationController } from "./notification.controller";
import { authenticate } from "@/middleware/auth";

export class NotificationModule extends BaseModule {
  public name: string = "NotificationModule";
  public version: string = "1.0.0";
  public basePath: string = "/api/v1/notifications";
  public dependencies?: string[] | undefined;

  private logger = new AppLogger("NotificationModule");

  protected async setupUseCases(): Promise<void> {
    const prisma = this.context.getService("prisma");
    this.registerService("NotificationService", new NotificationService(prisma));
  }
  
  protected async setupControllers(): Promise<void> {
    const notificationService = this.getService<NotificationService>("NotificationService");
    this.registerController("NotificationController", new NotificationController(notificationService));
  }

  protected async setupRoutes(): Promise<void> {
    const controller = this.getController<NotificationController>("NotificationController");
    
    // Protect all notification routes with generic authentication
    this.router.use(authenticate);

    // GET /api/v1/notifications
    this.router.get(
      "/",
      controller.getUnreadNotifications.bind(controller)
    );

    // PATCH /api/v1/notifications/:id/read
    this.router.patch(
      "/:id/read",
      controller.markAsRead.bind(controller)
    );
  }
}
