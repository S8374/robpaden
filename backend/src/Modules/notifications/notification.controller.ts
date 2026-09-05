import { Request, Response } from "express";
import { NotificationService } from "./notification.service";
import { BaseController } from "@/core/BaseController";

export class NotificationController extends BaseController {
  constructor(private readonly notificationsService: NotificationService) {
    super();
  }

  public getUnreadNotifications = async (req: Request, res: Response) => {
    try {
      // req.user is set by authenticate middleware
      const role = (req as any).user?.role || "ADMIN"; 
      const userId = (req as any).user?.userId;
      const notifications = await this.notificationsService.getUnreadNotifications(role, userId);
      return this.sendResponse(req, res, "Fetched unread notifications successfully", 200, notifications);
    } catch (error: any) {
      return this.sendResponse(req, res, error.message || "Failed to fetch notifications", 500);
    }
  };

  public markAsRead = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id as string);
      if (isNaN(id)) {
        return this.sendResponse(req, res, "Invalid notification ID", 400);
      }

      const updated = await this.notificationsService.markAsRead(id);
      return this.sendResponse(req, res, "Notification marked as read successfully", 200, updated);
    } catch (error: any) {
      return this.sendResponse(req, res, error.message || "Failed to mark notification as read", 500);
    }
  };
}
