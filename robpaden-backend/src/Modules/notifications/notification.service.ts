import { PrismaClient } from "@prisma/client";
import { AppLogger } from "@/core/logging/logger";

export class NotificationService {
  private logger = new AppLogger("NotificationService");

  constructor(private readonly prisma: PrismaClient) {}

  public async getUnreadNotifications(role: string) {
    this.logger.info(`Fetching unread notifications for role: ${role}`);
    
    // For now, if role is ADMIN, fetch MANAGER activities
    // In future, if role is MANAGER, we can fetch ADMIN activities, etc.
    let targetCreatorRole = "MANAGER";
    if (role === "MANAGER") {
      targetCreatorRole = "ADMIN";
    }

    const notifications = await this.prisma.systemActivity.findMany({
      where: {
        creatorRole: targetCreatorRole,
        isRead: false
      },
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
