import { Request, Response } from "express";
import { BaseController } from "@/core/BaseController";
import { AppLogger } from "@/core/logging/logger";
import { LoginAdminDTO } from "./AdminLoginDTO";
import { AdminLoginService } from "./admin-login.service";

export class AdminLoginController extends BaseController {
  private logger = new AppLogger("AdminLoginController");

  constructor(private readonly adminLoginService: AdminLoginService) {
    super();
  }

  public async loginAdmin(req: Request, res: Response) {
    this.logger.info("Received admin login request");

    const { email, password } = req.validatedBody as LoginAdminDTO;

    const result = await this.adminLoginService.loginAdmin(email, password);

    // Removed global HTTP-Only Cookie to allow strictly tab-wise isolated sessions


    return this.sendResponse(req, res, "Admin logged in successfully", 200, result);
  }

  public async logoutAdmin(req: Request, res: Response) {
    this.logger.info("Received admin logout request");
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    return this.sendResponse(req, res, "Admin logged out successfully", 200, {});
  }
}
