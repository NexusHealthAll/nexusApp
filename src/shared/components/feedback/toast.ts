import { toast } from "sonner";
import { ApiError } from "@/lib/apiError";

export const appToast = {
  success: (message: string, description?: string) =>
    toast.success(message, { description }),

  error: (message: string, description?: string) =>
    toast.error(message, { description }),

  warning: (message: string, description?: string) =>
    toast.warning(message, { description }),

  info: (message: string, description?: string) =>
    toast.info(message, { description }),

  /** Automatically extract a human-readable message from an ApiError or any Error. */
  fromError: (err: unknown, fallback = "Something went wrong") => {
    const message =
      err instanceof ApiError
        ? err.message
        : err instanceof Error
          ? err.message
          : fallback;
    toast.error(message);
  },
};
