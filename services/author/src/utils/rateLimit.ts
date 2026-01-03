import rateLimit from "express-rate-limit";

export const aiRateLimiter = rateLimit({
    windowMs: 60*1000, // 1 min
    max: 3, 
    message: {
        message: "AI usage limit reached. This feature is intentionally rate-limited due to real API costs."
    }
})