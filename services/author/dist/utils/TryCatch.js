import { sql } from "./db.js";
export const TryCatch = (handler) => {
    return async (req, res, next) => {
        try {
            await handler(req, res, next);
        }
        catch (error) {
            console.log("🔥 AI ERROR:", error?.message);
            // ❌ LOG FAILURE (CENTRAL)
            if (req.user && req.originalUrl.includes("/ai/")) {
                await sql `
          INSERT INTO ai_usage (user_id, feature, status, error_message)
          VALUES (
            ${req.user.id},
            ${req.originalUrl.toUpperCase()},
            'FAILED',
            ${error.message}
          )
        `;
            }
            // AI quota
            if (error?.status === 429 || error?.message?.includes("quota")) {
                return res.status(429).json({
                    message: "AI usage limit reached. This feature is intentionally limited due to real API costs.",
                });
            }
            return res.status(500).json({
                message: "AI service error. Please try again later.",
            });
        }
    };
};
//# sourceMappingURL=TryCatch.js.map