import { BaseModule } from "@/core/BaseModule";
import { AppLogger } from "@/core/logging/logger";
import { TVService } from "./tv.service";
import { TVController } from "./tv.controller";

export class TVModule extends BaseModule {
  public name: string = "TVModule";
  public version: string = "1.0.0";
  public basePath: string = "/tv";
  public dependencies?: string[] | undefined;

  private logger = new AppLogger("TVModule");

  protected async setupUseCases(): Promise<void> {
    const prisma = this.context.getService("prisma");
    this.registerService("TVService", new TVService(prisma));
  }

  protected async setupControllers(): Promise<void> {
    const tvService = this.getService<TVService>("TVService");
    this.registerController("TVController", new TVController(tvService));
  }

  protected async setupRoutes(): Promise<void> {
    const controller = this.getController<TVController>("TVController");

    // Public Route (No authenticate middleware)
    this.router.get(
      "/board/:companyId",
      controller.getBoard.bind(controller)
    );
  }
}
