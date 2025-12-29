/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { IGenericErrorResponse } from "@/types";
import { postService } from "@/services/auth";

export const usePatch = <T>(
  endpoint: string,
  onSuccess?: (data: T) => void,
  onError?: (error: IGenericErrorResponse) => void
) => {
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      postService.patch(endpoint, data),
    onSuccess: (data: any) => {
      console.log("toast message", data);

      if (data.statusCode >= 200 && data.statusCode < 300) {
        toast.success(data.message ?? "Update successful!");
      } else if (data.statusCode >= 400 && data.statusCode < 500) {
        if (Array.isArray(data.message)) {
          data.message.forEach((message: string) => {
            toast.error(message);
          });
        } else {
          toast.error(data.message ?? "Update failed");
        }
      } else {
        toast.error("Something went wrong. Please try again later.");
      }
      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: (error: IGenericErrorResponse) => {
      toast.error(error.message || "Failed to update.");
      if (onError) onError(error);
    },
  });
};
