// src/index.ts
import { IgnitorApp } from "./core/IgnitorApp";
import { AppLogger } from "./core/logging/logger";
import { config } from "./core/config";

// Providers (Infrastructure)
import { PrismaProvider } from "./providers/PrismaProvider";
import { prisma } from "./lib/prisma";
import { AuthModule } from "./Modules/Auth/AuthModule";
import { AdminLoginModule } from "./Modules/admin/admin-login/AdminLoginModule";
import { OfficeManagementModule } from "./Modules/admin/office-management/OfficeManagementModule";
import { DashboardModule } from "./Modules/admin/dashboard/DashboardModule";
import { UserManagementModule } from "./Modules/admin/user-management/UserManagementModule";
import { ManagerModule } from "./Modules/Manager/ManagerModule";
import { ReportModule } from "./Modules/Manager/report/ReportModule";
import { TVModule } from "./Modules/TV/TVModule";
import { NotificationModule } from "./Modules/notifications/NotificationModule";

// Modules (Business Logic)

async function bootstrap() {
  try {
    AppLogger.info("🗹 Starting application bootstrap");

    // 1. Initialize the Ignitor Engine
    const app = new IgnitorApp();

    // 2. Register Infrastructure Providers
    AppLogger.info("⚙ Registering infrastructure...");
    app.getContext().registerProvider("prisma", new PrismaProvider(prisma));

    // 3. Register Application Modules
    AppLogger.info("⚙ Registering modules...");
    const authModule = new AuthModule();
    const adminLoginModule = new AdminLoginModule();
    const officeManagementModule = new OfficeManagementModule();
    const userManagementModule = new UserManagementModule();
    const managerModule = new ManagerModule();

    app.registerModule(authModule);
    app.registerModule(adminLoginModule);
    app.registerModule(officeManagementModule);
    app.registerModule(new DashboardModule());
    app.registerModule(userManagementModule);
    app.registerModule(managerModule);
    app.registerModule(new NotificationModule());
    
    const prismaService = app.getContext().getService("prisma");
    app.registerModule(new ReportModule());
    
    app.registerModule(new TVModule());

    AppLogger.info("✔ All modules registered successfully");

    // 4. Spark the server!
    await app.spark(config.server.port);

    AppLogger.info("✷ Ignitor sparked successfully");
  } catch (error) {
    // Centralized Bootstrap Error Handling
    AppLogger.error("⬤ Failed to initialize application:", {
      error: error instanceof Error ? error : new Error(String(error)),
      context: "application-bootstrap",
      stack: error instanceof Error ? error.stack : undefined,
    });
    process.exit(1);
  }
}

// Start the application
bootstrap().catch((err) => {
  AppLogger.error("❌ Unhandled bootstrap error:", { error: err });
  process.exit(1);
});
