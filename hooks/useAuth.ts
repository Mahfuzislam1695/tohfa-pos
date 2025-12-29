import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { authService } from "@/services/auth";
import { IGenericErrorResponse } from "@/types";
import { accessTokenCreate, refreshCreate } from "@/actions/cookiesAction";
// import { storeUserInfo } from "@/services/auth.service";

export const useAuth = (onSuccess?: () => void) => {
  return useMutation({
    mutationFn: authService.login,
    onSuccess: async (data) => {
      try {
        // Store user info and refresh token
        await Promise.all([
          refreshCreate(data.refresh_token),
          accessTokenCreate(data.access_token),
          // storeUserInfo({ accessToken: data.access_token }),
        ]);

        // Show success message
        toast.success(data.message);

        // Execute the onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
      } catch (error) {
        console.error("Error in onSuccess:", error);
        toast.error("An error occurred while processing your request.");
      }
    },
    onError: (error: IGenericErrorResponse) => {
      toast.error(error.message);
    },
  });
};