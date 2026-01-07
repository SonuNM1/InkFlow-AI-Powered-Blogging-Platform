import chalk from "chalk";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

// Extend Express Request to attach authenticated user info

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    name: string;
    image?: string;
  };
}

// Exact JWT payload shape signed by User Service

interface JwtUserPayload {
  userId: string;
  name: string;
  image?: string;
}

/*
  Authentication middleware for BLOG SERVICE

  - Reads JWT from Authorization header
  - Verifies token signature
  - Extracts user info from JWT payload
  - Attaches user info to req.user
  - DOES NOT query database (microservice-safe)
*/

export const isAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1️⃣ Read Authorization header

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - No token",
      });
    }

    // 2️⃣ Extract token safely

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Token missing",
      });
    }

    const jwtToken: string = token;

    // 3️⃣ Read and validate JWT secret

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET not defined");
    }

    const jwtSecret: string = secret;

    // 4️⃣ Verify JWT

    const decodedRaw = jwt.verify(jwtToken, jwtSecret);

    // 5️⃣ Type guard: jsonwebtoken may return string | object

    if (!decodedRaw || typeof decodedRaw !== "object") {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    // 6️⃣ Validate required fields exist

    if (
      !("userId" in decodedRaw) ||
      !("name" in decodedRaw)
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    const decoded = decodedRaw as JwtUserPayload;

    // 7️⃣ Attach user info to request

    req.user = {
      userId: decoded.userId,
      name: decoded.name,
      ...(decoded.image ? { image: decoded.image } : {}),
    };

    next();
  } catch (error) {
    console.log(chalk.red.bold("Auth middleware error:", error));

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
