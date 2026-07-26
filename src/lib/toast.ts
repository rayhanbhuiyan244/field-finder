// Standardized toast helpers on top of sonner.
// Import { notify } from "@/lib/toast" and use notify.success / .error / .warning / .info / .promise.
import { toast } from "sonner";

export const notify = {
  success: (message: string, description?: string) => toast.success(message, { description }),
  error: (message: string, description?: string) => toast.error(message, { description }),
  warning: (message: string, description?: string) => toast.warning(message, { description }),
  info: (message: string, description?: string) => toast(message, { description }),
  promise: <T>(p: Promise<T>, msgs: { loading: string; success: string; error: string }) =>
    toast.promise(p, msgs),
  fromError: (err: unknown, fallback = "Something went wrong") =>
    toast.error(err instanceof Error ? err.message : fallback),
};

export { toast };
