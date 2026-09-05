import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "@/core/config";
import { AuthenticationError } from "@/core/errors/AppError";
import { AppLogger } from "@/core/logging/logger";

const logger = new AppLogger("AuthMiddleware");

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    logger.warn("Missing or invalid token in header/cookies");
    return next(new AuthenticationError("Authentication token is missing"));
  }

  if (!config.security.jwt.secret) {
    logger.error("JWT_SECRET is not configured");
    return next(new Error("Internal server error"));
  }

  try {
    const decoded = jwt.verify(token, config.security.jwt.secret, {
      issuer: config.security.jwt.issuer
    }) as any;

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      email: decoded.email,
      companyId: decoded.companyId
    };

    next();
  } catch (error) {
    logger.warn("Token verification failed", error);
    return next(new AuthenticationError("Invalid or expired authentication token"));
  }
};
