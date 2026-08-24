import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import { ReportService } from "./report.service";
import { AppLogger } from "@/core/logging/logger";

const logger = new AppLogger("ReportCron");

export function initReportCron(prisma: PrismaClient, reportService: ReportService) {
  // Run every day at 11:55 PM (or dynamically check timezone in a full implementation)
  // For simplicity, we run at a fixed time or hourly and check company settings.
  // Here we schedule it to run daily at 23:55 to finalize the day's reports.
  cron.schedule("55 23 * * *", async () => {
    logger.info("Running daily report generation cron job...");
    
    try {
      // Find all managers who are active
      const managers = await prisma.user.findMany({
        where: { role: "MANAGER", isActive: true },
        include: {
          company: {
            include: { settings: true }
          }
        }
      });

      for (const manager of managers) {
        if (!manager.company || !manager.company.settings) continue;

        const isReportActive = manager.company.settings.isReportGenerationActive;

        if (isReportActive) {
          try {
            // Check if report was already sent today (e.g., if manager closed the day manually earlier)
            const startOfToday = new Date();
            startOfToday.setHours(0, 0, 0, 0);
            
            const endOfToday = new Date();
            endOfToday.setHours(23, 59, 59, 999);

            const alreadySent = await prisma.reportHistory.findFirst({
              where: {
                managerId: manager.id,
                status: "Sent",
                date: {
                  gte: startOfToday,
                  lte: endOfToday
                }
              }
            });

            if (alreadySent) {
              logger.info(`Report already sent today for manager ${manager.id}. Skipping cron execution.`);
              continue;
            }

            await reportService.generateAndEmailReport(manager.id);
            logger.info(`Successfully generated and emailed report for manager ${manager.id}`);
          } catch (e: any) {
            logger.error(`Failed to generate report for manager ${manager.id}`, { error: e.message });
          }
        } else {
          // Report generation is disabled by the manager
          try {
            await reportService.logFailedOrSkippedReport(manager.id, "Manager turned off report generation.");
          } catch (e: any) {
            logger.error(`Failed to log skipped report for manager ${manager.id}`, { error: e.message });
          }
        }
      }
    } catch (e: any) {
      logger.error("Error in report cron job", { error: e.message });
    }
  });

  logger.info("Report cron job initialized.");
}
