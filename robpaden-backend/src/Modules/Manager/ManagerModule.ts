import { BaseModule } from "@/core/BaseModule";
import { AppLogger } from "@/core/logging/logger";
import { ManagerAgentService } from "./agent-management/manager-agent.service";
import { ManagerAgentController } from "./agent-management/manager-agent.controller";

import { ManagerPerformanceService } from "./performance/manager-performance.service";
import { ManagerPerformanceController } from "./performance/manager-performance.controller";
import { validateRequest } from "@/middleware/validation";
import { authenticate } from "@/middleware/auth";
import { inviteAgentSchema } from "./agent-management/ManagerAgentDTO";

import { addDailySalesSchema } from "./performance/ManagerPerformanceDTO";
import { Request, Response, NextFunction } from "express";
import { AuthorizationError } from "@/core/errors/AppError";
import { uploadSingleFile } from "@/middleware/fileUpload";
import { uploadFileToRustFS } from "@/lib/rustfs";
// Role guard specifically for MANAGER
const requireManager = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== "MANAGER") {
    return next(new AuthorizationError("Only managers can perform this action"));
  }
  next();
};

export class ManagerModule extends BaseModule {
  public name: string = "ManagerModule";
  public version: string = "1.0.0";
  public basePath: string = "/manager/";
  public dependencies?: string[] | undefined;

  private logger = new AppLogger("ManagerModule");

  protected async setupUseCases(): Promise<void> {
    const prisma = this.context.getService("prisma");
    this.registerService("ManagerAgentService", new ManagerAgentService(prisma));

    this.registerService("ManagerPerformanceService", new ManagerPerformanceService(prisma));
  }

  protected async setupControllers(): Promise<void> {
    const managerAgentService = this.getService<ManagerAgentService>("ManagerAgentService");
    this.registerController("ManagerAgentController", new ManagerAgentController(managerAgentService));


    const managerPerformanceService = this.getService<ManagerPerformanceService>("ManagerPerformanceService");
    this.registerController("ManagerPerformanceController", new ManagerPerformanceController(managerPerformanceService));
  }

  protected async setupRoutes(): Promise<void> {
    const agentController = this.getController<ManagerAgentController>("ManagerAgentController");

    const perfController = this.getController<ManagerPerformanceController>("ManagerPerformanceController");
    
    // Apply authenticate and requireManager to ALL routes in this module router
    this.router.use(authenticate, requireManager);

    // POST /manager/upload
    this.router.post(
      "/upload",
      uploadSingleFile("file"),
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          if (!req.file) {
            return res.status(400).json({ status: "error", message: "No file uploaded" });
          }
          const url = await uploadFileToRustFS(req.file.buffer, req.file.originalname, req.file.mimetype);
          return res.status(200).json({ status: "success", data: { url } });
        } catch (error) {
          next(error);
        }
      }
    );

    // POST /manager/agents/invite
    this.router.post(
      "/agents/invite",
      validateRequest(inviteAgentSchema),
      agentController.inviteAgent.bind(agentController)
    );

    // GET /manager/agents
    this.router.get(
      "/agents",
      agentController.getMyAgents.bind(agentController)
    );

    // POST /manager/agents/:id/assign
    this.router.post(
      "/agents/:id/assign",
      agentController.assignAgent.bind(agentController)
    );

    // PUT /manager/agents/:id
    this.router.put(
      "/agents/:id",
      agentController.updateAgent.bind(agentController)
    );

    // DELETE /manager/agents/:id
    this.router.delete(
      "/agents/:id",
      agentController.deleteAgent.bind(agentController)
    );


    // POST /manager/performance/daily-sales
    this.router.post(
      "/performance/daily-sales",
      validateRequest(addDailySalesSchema),
      perfController.addOrUpdateDailySales.bind(perfController)
    );

    // GET /manager/performance/history
    this.router.get(
      "/performance/history",
      perfController.getPerformanceHistory.bind(perfController)
    );

    // GET /manager/performance/agent/:agentId
    this.router.get(
      "/performance/agent/:agentId",
      perfController.getAgentPerformance.bind(perfController)
    );
  }
}
