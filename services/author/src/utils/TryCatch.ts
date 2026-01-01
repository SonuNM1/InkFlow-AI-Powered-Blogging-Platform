import type { NextFunction, Request, RequestHandler, Response } from "express";
import chalk from "chalk";

export const TryCatch = (handler: RequestHandler): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res, next);
    } catch (error: any) {
      console.log("🔥 AI ERROR FULL:", error);
      console.log("🔥 AI ERROR MESSAGE:", error?.message);
      console.log("🔥 AI ERROR RESPONSE:", error?.response?.data);

      const message = error?.message || "";

      // OpenAI quota / rate limit
      if (
        message.includes("quota") ||
        message.includes("Quota exceeded") ||
        message.includes("RESOURCE_EXHAUSTED") ||
        error?.status === 429
      ) {
        return res.status(429).json({
          message: "AI quota exceeded. Please try again later.",
          aiDisabled: true,
        });
      }

      // OpenAI auth issues
      if (message.includes("API key") || message.includes("authentication")) {
        return res.status(401).json({
          message: "AI authentication failed. Check API key.",
        });
      }

      return res.status(500).json({
        message: error?.message || "AI service error",
      });
    }
  };
};
