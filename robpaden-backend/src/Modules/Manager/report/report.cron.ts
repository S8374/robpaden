import cron from "node-cron";

import { PrismaClient } from "@prisma/client";
import { ReportService } from "./report.service";
import { AppLogger } from "@/core/logging/logger";
import { formatInTimeZone } from "date-fns-tz";

const logger = new AppLogger("ReportCron");

export function initReportCron(prisma: PrismaClient, reportService: ReportService) {
  // Run every 15 minutes to check different timezones
  cron.schedule("*/15 * * * *", async () => {
    logger.info("Running daily report generation cron job check...");
    
    try {
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
        // Use the company timezone, fallback to UTC
        const timeZone = manager.company.settings.timeZone || "UTC";

        if (isReportActive) {
          try {
            // Get current time in manager's timezone
            const nowInTz = new Date();
            const currentHourTz = parseInt(formatInTimeZone(nowInTz, timeZone, "HH"), 10);
            const currentMinuteTz = parseInt(formatInTimeZone(nowInTz, timeZone, "mm"), 10);

            // We want to generate the report around 23:45 - 23:59 in THEIR timezone.
            // Since this runs every 15 mins (e.g. 23:45), we check if it's the 23rd hour and past 40 mins.
            if (currentHourTz === 23 && currentMinuteTz >= 40) {
              
              // Check if report was already sent today (in UTC context to avoid duplicates)
              const startOfToday = new Date();
              startOfToday.setUTCHours(0, 0, 0, 0);
              
              const endOfToday = new Date();
              endOfToday.setUTCHours(23, 59, 59, 999);

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
                // Already sent today
                continue;
              }

              logger.info(`Time is ${currentHourTz}:${currentMinuteTz} in ${timeZone}. Sending report for manager ${manager.id}...`);
              await reportService.generateAndEmailReport(manager.id);
              logger.info(`Successfully generated and emailed report for manager ${manager.id}`);
            }
          } catch (e: any) {
            logger.error(`Failed to generate report for manager ${manager.id}`, { error: e.message });
          }
        }
      }
    } catch (e: any) {
      logger.error("Error in report cron job", { error: e.message });
    }
  });

  logger.info("Report cron job initialized (Running every 15 minutes).");
}
