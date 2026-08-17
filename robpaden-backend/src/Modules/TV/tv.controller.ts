import { Request, Response } from "express";
import { BaseController } from "@/core/BaseController";
import { AppLogger } from "@/core/logging/logger";
import { TVService } from "./tv.service";
import { BadRequestError } from "@/core/errors/AppError";

export class TVController extends BaseController {
  private logger = new AppLogger("TVController");

  constructor(private readonly tvService: TVService) {
    super();
  }

  public async getBoard(req: Request, res: Response) {
    this.logger.info("Received public request for TV Board");

    const companyId = parseInt(String(req.params.companyId), 10);
    if (isNaN(companyId)) {
      throw new BadRequestError("Valid company ID is required in the path");
    }

    const boardData = await this.tvService.getTVBoardData(companyId);

    return this.sendResponse(req, res, "TV Board data retrieved successfully", 200, boardData);
  }
}
