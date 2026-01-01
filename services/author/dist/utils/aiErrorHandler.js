export const handleAIError = (error, res) => {
    const message = error?.response?.error?.message || error?.message || "AI service error";
    if (message.includes("Quota exceeded") || message.includes("RESOURCE_EXHAUSTED")) {
        return res.status(429).json({
            message: "AI quota exceeded. Please try agaiin later"
        });
    }
    return res.status(500).json({
        message: "AI service temporarily unavailable"
    });
};
//# sourceMappingURL=aiErrorHandler.js.map