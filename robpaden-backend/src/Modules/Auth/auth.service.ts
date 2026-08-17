// src/Modules/Auth/AuthServices.ts
import { AppLogger } from "@/core/logging/logger";
import { ConflictError, NotFoundError } from "@/core/errors/AppError";
import { PrismaClient } from "@prisma/client";
import { decryptPassword } from "@/core/utils/encryption";
import jwt from "jsonwebtoken";
import config from "@/core/config";

export class AuthServices {
  private logger = new AppLogger("AuthServices");

  constructor(private readonly prisma: PrismaClient) {}

  public async register(
    email: string,
    name: string,
    passwordHash: string,
  ) {
    this.logger.info("Attempting to register user", { email });

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      this.logger.warn("Registration failed: User already exists", { email });
      throw new ConflictError("A user with this email already exists");
    }

    const newUser = await this.prisma.user.create({
      data: {
        email,
        name,
        password: passwordHash,
      },
    });

    this.logger.info("User registered successfully", { userId: newUser.id });
    return newUser;
  }

  public async login(email: string, passwordString: string) {
    this.logger.info("Attempting user login", { email });

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { permissions: true, company: true },
    });

    if (!user) {
      throw new NotFoundError("Invalid email or password");
    }

    if (!user.password) {
      throw new ConflictError("Invalid account state");
    }
    
    if (!user.isActive) {
      throw new ConflictError("Account is disabled");
    }

    const decryptedPassword = decryptPassword(user.password);
    if (decryptedPassword !== passwordString) {
      throw new NotFoundError("Invalid email or password");
    }

    if (!config.security.jwt.secret) {
      throw new Error("JWT_SECRET is not configured");
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email, companyId: user.companyId },
      config.security.jwt.secret,
      { expiresIn: config.security.jwt.expiresIn as any, issuer: config.security.jwt.issuer }
    );

    this.logger.info("User logged in successfully", { userId: user.id });

    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  public async getMe(userId: number) {
    this.logger.info("Fetching profile for currently logged in user", { userId });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        permissions: true,
        company: {
          include: {
            settings: true
          }
        },

        manager: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (!user.isActive) {
      throw new ConflictError("Account is disabled");
    }

    const { password, ...userWithoutPassword } = user;
    
    return userWithoutPassword;
  }

  public async getOfficeBranding(officeId: number) {
    this.logger.info("Fetching public office branding", { officeId });
    const company = await this.prisma.company.findUnique({
      where: { id: officeId },
      include: { settings: true }
    });

    if (!company) throw new NotFoundError("Office not found");

    return {
      name: company.name,
      logoUrl: company.settings?.logoUrl || null,
    };
  }
}
