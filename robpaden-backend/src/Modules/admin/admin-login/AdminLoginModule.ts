import { BaseModule } from "@/core/BaseModule";
import { AppLogger } from "@/core/logging/logger";
import { AdminLoginService } from "./admin-login.service";
import { AdminLoginController } from "./admin-login.controller";
import { validateRequest } from "@/middleware/validation";
import { loginAdminSchema } from "./AdminLoginDTO";

export class AdminLoginModule extends BaseModule {
  public name: string = "AdminLoginModule";
  public version: string = "1.0.0";
  public basePath: string = "/admin";
  public dependencies?: string[] | undefined;

  private logger = new AppLogger("AdminLoginModule");

  protected async setupUseCases(): Promise<void> {
    const prisma = this.context.getService("prisma");
    this.registerService("AdminLoginService", new AdminLoginService(prisma));
  }
  
  protected async setupControllers(): Promise<void> {
    const adminLoginService = this.getService<AdminLoginService>("AdminLoginService");
    this.registerController("AdminLoginController", new AdminLoginController(adminLoginService));
  }

  protected async setupRoutes(): Promise<void> {
    const controller = this.getController<AdminLoginController>("AdminLoginController");
    
    // POST /admin/login
    this.router.post(
      "/login",
      validateRequest(loginAdminSchema),
      controller.loginAdmin.bind(controller)
    );

    // POST /admin/logout
    this.router.post(
      "/logout",
      controller.logoutAdmin.bind(controller)
    );
  }
}
