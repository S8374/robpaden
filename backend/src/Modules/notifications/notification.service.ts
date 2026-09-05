import { PrismaClient } from "@prisma/client";
import { AppLogger } from "@/core/logging/logger";

export class NotificationService {
  private logger = new AppLogger("NotificationService");

  constructor(private readonly prisma: PrismaClient) {}

  public async getUnreadNotifications(role: string, userId?: number) {
    this.logger.info(`Fetching unread notifications for role: ${role}`);
    
    let whereClause: any = { isRead: false };

    if (role === "ADMIN") {
      whereClause.targetUserId = null; // Global notifications for admins
      whereClause.creatorRole = { not: "ADMIN" }; // Admin shouldn't get notified of their own actions
    } else if (role === "MANAGER" && userId) {
      whereClause.targetUserId = userId; // Targeted notifications for this manager
    } else {
      return []; // Other roles or missing userId get no notifications currently
    }

    const notifications = await this.prisma.systemActivity.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc"
      }
    });

    return notifications;
  }

  public async markAsRead(id: number) {
    this.logger.info(`Marking notification ${id} as read`);
    
    // Ensure it exists
    const activity = await this.prisma.systemActivity.findUnique({
      where: { id }
    });

    if (!activity) {
      throw new Error("Notification not found");
    }

    const updated = await this.prisma.systemActivity.update({
      where: { id },
      data: { isRead: true }
    });

    return updated;
  }
}
