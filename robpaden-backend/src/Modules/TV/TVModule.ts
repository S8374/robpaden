import { BaseModule } from "@/core/BaseModule";
import { TVController } from "./tv.controller";

export class TVModule extends BaseModule {
  public name: string = "TVModule";
  public version: string = "1.0.0";
  public basePath: string = "/tv/";
  public dependencies?: string[] = [];

  protected async setupUseCases(): Promise<void> {}
  protected async setupControllers(): Promise<void> {}

  protected async setupRoutes(): Promise<void> {
    const controller = new TVController();

    // Public Route (No authenticate middleware)
    this.router.post(
      "/login",
      controller.loginDevice.bind(controller)
    );

    this.router.get(
      "/board",
      controller.getBoard.bind(controller)
    );
  }
}
