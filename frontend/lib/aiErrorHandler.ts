import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";

interface AIErrorResponse {
  message?: string;
}

export const handleAIClientError = (
  error: unknown,
  onQuotaExceeded?: () => void
) => {
  if (!axios.isAxiosError(error)) {
    toast.error("Unexpected error occurred");
    return;
  }

  // Tell TS that response.data is of type AIErrorResponse
  const axiosError = error as AxiosError<AIErrorResponse>;
  const status = axiosError.response?.status;
  const message = axiosError.response?.data?.message || "AI request failed";

  if (status === 429) {
    toast.error("⚠️ AI usage limit reached due to real API costs.");
    onQuotaExceeded?.();
    return;
  }

  toast.error(message);
};
