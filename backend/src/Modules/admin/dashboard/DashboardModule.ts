import { BaseModule } from "@/core/BaseModule";
import { AppLogger } from "@/core/logging/logger";
import { DashboardService } from "./dashboard.service";
import { DashboardController } from "./dashboard.controller";


export class DashboardModule extends BaseModule {
  public name: string = "DashboardModule";
  public version: string = "1.0.0";
  public basePath: string = "/admin/v1/dashboard/";
  public dependencies?: string[] | undefined;

  private logger = new AppLogger("DashboardModule");

  protected async setupUseCases(): Promise<void> {
    const prisma = this.context.getService("prisma");
    this.registerService("DashboardService", new DashboardService(prisma));
  }
  
  protected async setupControllers(): Promise<void> {
    const dashboardService = this.getService<DashboardService>("DashboardService");
    this.registerController("DashboardController", new DashboardController(dashboardService));
  }

  protected async setupRoutes(): Promise<void> {
    const controller = this.getController<DashboardController>("DashboardController");
    
    // GET /admin/v1/dashboard/overview
    this.router.get(
      "/overview",
      controller.getDashboardOverview.bind(controller)
    );
  }
}
