import rateLimit from "express-rate-limit";
export const aiRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 min
    max: 5,
    message: {
        message: "Too many AI requests. Please wait a moment."
    }
});
//# sourceMappingURL=rateLimit.js.map