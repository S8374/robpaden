import { BaseModule } from "@/core/BaseModule";
import { AppLogger } from "@/core/logging/logger";
import { AuthServices } from "./auth.service";
import { AuthController } from "./auth.controller";
import { validateRequest } from "@/middleware/validation";
import { authenticate } from "@/middleware/auth";
import { createUserSchema, loginSchema, forgotPasswordSchema, verifyOtpSchema, resetPasswordSchema } from "./AuthDTO";

export class AuthModule extends BaseModule {
  public name: string = "AuthModule";
  public version: string = "1.0.0";
  public basePath: string = "/auth/";
  public dependencies?: string[] | undefined;

  private logger = new AppLogger("AuthModule");

  protected async setupUseCases(): Promise<void> {
    const prisma = this.context.getService("prisma");
    this.registerService("AuthService", new AuthServices(prisma));
  }
  protected async setupControllers(): Promise<void> {
    const authService = this.getService<AuthServices>("AuthService");
    this.registerController("AuthController", new AuthController(authService));
  }

  protected async setupRoutes(): Promise<void> {
    const controller = this.getController<AuthController>("AuthController");
    // POST /auth/v1/register
    this.router.post(
      "/register",
      validateRequest(createUserSchema),
      controller.createUser.bind(controller),
    );

    // POST /auth/v1/login
    this.router.post(
      "/login",
      validateRequest(loginSchema),
      controller.login.bind(controller),
    );

    // GET /auth/v1/me
    this.router.get(
      "/me",
      authenticate,
      controller.getMe.bind(controller),
    );

    // GET /auth/v1/branding/:id
    this.router.get(
      "/branding/:id",
      controller.getOfficeBranding.bind(controller)
    );

    // POST /auth/forgot-password
    this.router.post(
      "/forgot-password",
      validateRequest(forgotPasswordSchema),
      controller.forgotPassword.bind(controller)
    );

    // POST /auth/verify-otp
    this.router.post(
      "/verify-otp",
      validateRequest(verifyOtpSchema),
      controller.verifyOtp.bind(controller)
    );

    // POST /auth/reset-password
    this.router.post(
      "/reset-password",
      validateRequest(resetPasswordSchema),
      controller.resetPassword.bind(controller)
    );
  }
}
