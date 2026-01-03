import axios from "axios";
import toast from "react-hot-toast";

/**
 * handleAIClientError
 * -------------------
 * Centralized AI error handler for frontend.
 * - No React imports
 * - No hooks
 * - Pure logic only
 */
export const handleAIClientError = (
  error: unknown,
  onQuotaExceeded?: () => void // callback injected from React
) => {
  if (!axios.isAxiosError(error)) {
    toast.error("Unexpected error occurred");
    return;
  }

  const status = error.response?.status;
  const message =
    error.response?.data?.message || "AI request failed";

  // AI quota / pricing-based limitation
  if (status === 429) {
    // Short toast (optional feedback)
    toast.error(
      "⚠️ AI usage limit reached due to real API costs."
    );

    // Trigger modal via callback (React-controlled)
    onQuotaExceeded?.();
    return;
  }

  // Default error
  toast.error(message);
};
