import { BaseModule } from "@/core/BaseModule";
import { ReportService } from "./report.service";
import { ReportController } from "./report.controller";
import { authenticate } from "@/middleware/auth";
import { Request, Response, NextFunction } from "express";
import { AuthorizationError } from "@/core/errors/AppError";
import { initReportCron } from "./report.cron";

const requireManager = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== "MANAGER") {
    return next(new AuthorizationError("Only managers can perform this action"));
  }
  next();
};

export class ReportModule extends BaseModule {
  public name: string = "ReportModule";
  public version: string = "1.0.0";
  public basePath: string = "/manager/reports";
  public dependencies?: string[] | undefined;

  protected async setupUseCases(): Promise<void> {
    const prisma = this.context.getService("prisma");
    const reportService = new ReportService(prisma);
    this.registerService("ReportService", reportService);
    
    // Initialize the background cron job for daily reports
    initReportCron(prisma, reportService);
  }

  protected async setupControllers(): Promise<void> {
    const reportService = this.getService<ReportService>("ReportService");
    this.registerController("ReportController", new ReportController(reportService));
  }

  protected async setupRoutes(): Promise<void> {
    const controller = this.getController<ReportController>("ReportController");

    this.router.use(authenticate, requireManager);

    this.router.get("/summary", controller.getReportSummary.bind(controller));
    this.router.get("/sales-by-agent", controller.getSalesByAgent.bind(controller));
    this.router.get("/sales-entry-history", controller.getSalesEntryHistory.bind(controller));
    this.router.get("/recipients", controller.getRecipients.bind(controller));
    this.router.post("/recipients", controller.addRecipient.bind(controller));
    this.router.delete("/recipients", controller.removeRecipient.bind(controller));
    this.router.get("/history", controller.getReportHistory.bind(controller));
    this.router.post("/generate", controller.generateAndEmailReport.bind(controller));
    this.router.post("/toggle", controller.toggleReportGeneration.bind(controller));
  }
}
