// src/Modules/Auth/AuthController.ts
import { Request, Response } from "express";
import { BaseController } from "@/core/BaseController";
import { AppLogger } from "@/core/logging/logger";
import { CreateUserDTO } from "./AuthDTO";
import { AuthServices } from "./auth.service";

export class AuthController extends BaseController {
  // Initialize the contextual logger
  private logger = new AppLogger("AuthController");

  // Inject the service via the constructor
  constructor(private readonly authService: AuthServices) {
    super();
  }

  /**
   * Endpoint: POST /auth/v1/users
   */
  public async createUser(req: Request, res: Response) {
    this.logger.info("Received request to create a new user");

    // 1. Extract the validated body (populated by your validateRequest middleware)
    const { email, firstName, lastName, password } =
      req.validatedBody as CreateUserDTO;

    // 2. Pass the data to the Service Layer (Business Logic)
    const newUser = await this.authService.register(
      email,
      `${firstName} ${lastName}`.trim(),
      password,
    );

    // 3. Remove sensitive information before sending it back to the client
    // (Alternatively, you can use Prisma's `omit` feature if you configure it)
    const { password: _, ...userWithoutPassword } = newUser;

    return this.sendCreatedResponse(
      req,
      res,
      userWithoutPassword,
      "User registered successfully",
    );
  }

  public async login(req: Request, res: Response) {
    this.logger.info("Received request for user login");

    const { email, password } = req.validatedBody as any;

    const result = await this.authService.login(email, password);

    // Removed global HTTP-Only Cookie to allow strictly tab-wise isolated sessions
    
    return this.sendResponse(
      req,
      res,
      "Logged in successfully",
      200,
      result,
    );
  }

  public async getMe(req: Request, res: Response) {
    this.logger.info("Received request to fetch my profile");

    // req.user is guaranteed to be populated here because this route is protected by `authenticate` middleware
    const userId = req.user!.userId;

    const profile = await this.authService.getMe(userId);

    return this.sendResponse(
      req,
      res,
      "Profile retrieved successfully",
      200,
      profile,
    );
  }

  public async getOfficeBranding(req: Request, res: Response) {
    const id = parseInt(req.params.id as string, 10);
    this.logger.info("Received request for office branding", { officeId: id });
    const result = await this.authService.getOfficeBranding(id);
    return this.sendResponse(req, res, "Branding retrieved", 200, result);
  }

  public async updateProfile(req: Request, res: Response) {
    this.logger.info("Received request to update profile");
    const userId = req.user!.userId;
    const { name, password, avatarUrl } = req.body;
    
    const updatedProfile = await this.authService.updateProfile(userId, { name, password, avatarUrl });
    
    return this.sendResponse(req, res, "Profile updated successfully", 200, updatedProfile);
  }

  public async uploadAvatar(req: Request, res: Response) {
    this.logger.info("Received request to upload avatar");
    try {
      if (!req.file) {
        return res.status(400).json({ status: "error", message: "No file uploaded" });
      }
      const { uploadFileToRustFS } = require("@/lib/rustfs");
      const url = await uploadFileToRustFS(req.file.buffer, req.file.originalname, req.file.mimetype);
      res.json({ success: true, url });
    } catch (error) {
      this.logger.error("Failed to upload avatar", error as Error);
      res.status(500).json({ status: "error", message: "Failed to upload avatar" });
    }
  }

  public async forgotPassword(req: Request, res: Response) {
    this.logger.info("Received request for forgot password");
    const { email } = req.validatedBody as any;
    await this.authService.forgotPassword(email);
    return this.sendResponse(req, res, "If that email exists, an OTP has been sent.", 200, null);
  }

  public async verifyOtp(req: Request, res: Response) {
    this.logger.info("Received request to verify OTP");
    const { email, otp } = req.validatedBody as any;
    const token = await this.authService.verifyOtp(email, otp);
    return this.sendResponse(req, res, "OTP verified successfully.", 200, { token });
  }

  public async resetPassword(req: Request, res: Response) {
    this.logger.info("Received request to reset password");
    const { token, password } = req.validatedBody as any;
    await this.authService.resetPassword(token, password);
    return this.sendResponse(req, res, "Password has been successfully reset.", 200, null);
  }
}
