import { AppLogger } from "@/core/logging/logger";
import { ConflictError, NotFoundError, AuthenticationError } from "@/core/errors/AppError";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import config from "@/core/config";
import { decryptPassword } from "@/core/utils/encryption";

export class AdminLoginService {
  private logger = new AppLogger("AdminLoginService");

  constructor(private readonly prisma: PrismaClient) {}

  public async loginAdmin(email: string, passwordString: string) {
    this.logger.info("Attempting admin login", { email });

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { permissions: true },
    });

    if (!user) {
      throw new NotFoundError("Invalid email or password");
    }

    if (user.role !== "SUPER_ADMIN") {
      throw new ConflictError("Access denied: Not an Admin");
    }

    if (!user.isActive) {
      throw new AuthenticationError("Account has been disabled");
    }

    if (!user.password) {
      throw new AuthenticationError("Invalid email or password");
    }

    const decryptedPassword = decryptPassword(user.password);
    
    if (decryptedPassword !== passwordString) {
      this.logger.warn("Admin login failed: Invalid password", { email });
      throw new AuthenticationError("Invalid email or password");
    }

    if (!config.security.jwt.secret) {
      throw new Error("JWT_SECRET is not configured");
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      config.security.jwt.secret,
      { expiresIn: config.security.jwt.expiresIn as any, issuer: config.security.jwt.issuer }
    );

    this.logger.info("Admin logged in successfully", { userId: user.id });

    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }
}
