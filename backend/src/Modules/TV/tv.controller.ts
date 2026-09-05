import { Request, Response } from "express";
import { BaseController } from "@/core/BaseController";
import { AppLogger } from "@/core/logging/logger";
import { TVService } from "./tv.service";
import { BadRequestError, AuthenticationError, AuthorizationError } from "@/core/errors/AppError";
import { prisma } from "@/lib/prisma";

export class TVController extends BaseController {
  private logger = new AppLogger("TVController");
  private tvService = new TVService(prisma);

  constructor() {
    super();
  }

  public async getBoard(req: Request, res: Response) {
    this.logger.info("Received request for TV Board");

    const password = req.query.password as string | undefined;
    
    if (!password) {
      throw new AuthenticationError("TV Access Password is required");
    }

    const settings = await prisma.companySettings.findFirst({
      where: { tvPassword: password }
    });

    if (!settings) {
      throw new AuthenticationError("Invalid TV Board password");
    }

    const deviceId = req.headers["x-device-id"] as string | undefined;
    const deviceName = req.headers["x-device-name"] as string | undefined;

    if (deviceId) {
      const device = await prisma.tvDevice.findUnique({
        where: {
          companyId_deviceId: {
            companyId: settings.companyId,
            deviceId: deviceId,
          }
        }
      });

      if (!device) {
        throw new AuthenticationError("This device has been removed. Please log in again.");
      }

      if (device.isBlocked) {
        throw new AuthorizationError("This device has been blocked from accessing the TV board.");
      }

      // Update last seen
      await prisma.tvDevice.update({
        where: { id: device.id },
        data: {
          lastSeenAt: new Date(),
          ...(deviceName && { deviceName })
        }
      });
    }

    const boardData = await this.tvService.getTVBoardData(settings.companyId);

    return this.sendResponse(req, res, "TV Board data retrieved successfully", 200, boardData);
  }

  public async loginDevice(req: Request, res: Response) {
    this.logger.info("Received request to login TV device");
    
    const { password, deviceId, deviceName } = req.body;
    
    if (!password) {
      throw new AuthenticationError("TV Access Password is required");
    }

    const settings = await prisma.companySettings.findFirst({
      where: { tvPassword: password }
    });

    if (!settings) {
      throw new AuthenticationError("Invalid TV Board password");
    }

    if (deviceId && deviceName) {
      const existing = await prisma.tvDevice.findUnique({
        where: {
          companyId_deviceId: {
            companyId: settings.companyId,
            deviceId: deviceId,
          }
        }
      });

      if (existing && existing.isBlocked) {
        throw new AuthorizationError("This device has been blocked from accessing the TV board.");
      }

      await prisma.tvDevice.upsert({
        where: {
          companyId_deviceId: {
            companyId: settings.companyId,
            deviceId: deviceId,
          }
        },
        update: {
          lastSeenAt: new Date(),
          deviceName: deviceName,
        },
        create: {
          companyId: settings.companyId,
          deviceId: deviceId,
          deviceName: deviceName,
          lastSeenAt: new Date(),
        }
      });
    }

    return this.sendResponse(req, res, "Logged in successfully", 200, { success: true });
  }
}
