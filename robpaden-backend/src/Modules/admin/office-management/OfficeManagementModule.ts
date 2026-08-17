import { BaseModule } from "@/core/BaseModule";
import { AppLogger } from "@/core/logging/logger";
import { OfficeManagementService } from "./office-management.service";
import { OfficeManagementController } from "./office-management.controller";
import { validateRequest } from "@/middleware/validation";
import { createOfficeSchema, updateOfficeSettingsSchema } from "./OfficeManagementDTO";
import { uploadSingleFile } from "@/middleware/fileUpload";

export class OfficeManagementModule extends BaseModule {
  public name: string = "OfficeManagementModule";
  public version: string = "1.0.0";
  public basePath: string = "/admin/v1/offices/";
  public dependencies?: string[] | undefined;

  private logger = new AppLogger("OfficeManagementModule");

  protected async setupUseCases(): Promise<void> {
    const prisma = this.context.getService("prisma");
    this.registerService("OfficeManagementService", new OfficeManagementService(prisma));
  }
  
  protected async setupControllers(): Promise<void> {
    const officeService = this.getService<OfficeManagementService>("OfficeManagementService");
    this.registerController("OfficeManagementController", new OfficeManagementController(officeService));
  }

  protected async setupRoutes(): Promise<void> {
    const controller = this.getController<OfficeManagementController>("OfficeManagementController");
    
    // POST /admin/v1/offices
    this.router.post(
      "/",
      uploadSingleFile("logoUrl"),
      validateRequest(createOfficeSchema),
      controller.createOffice.bind(controller)
    );

    // GET /admin/v1/offices
    this.router.get(
      "/",
      controller.getOffices.bind(controller)
    );

    // GET /admin/v1/offices/stats
    this.router.get(
      "/stats",
      controller.getOfficeStats.bind(controller)
    );

    // PATCH /admin/v1/offices/:id
    this.router.patch(
      "/:id",
      uploadSingleFile("logoUrl"),
      validateRequest(updateOfficeSettingsSchema),
      controller.updateOfficeSettings.bind(controller)
    );

    // DELETE /admin/v1/offices/:id
    this.router.delete(
      "/:id",
      controller.deleteOffice.bind(controller)
    );
  }
}
