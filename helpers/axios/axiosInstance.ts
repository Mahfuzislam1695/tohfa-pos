import axios from "axios";
import { getNewAccessToken, logout } from "@/services/auth.service";
import { authKey } from "@/constants/auth/storageKey";
import { IGenericErrorResponse, ResponseSuccessType } from "@/types";
import { getBaseUrl } from "@/config/envConfig";
import { toast } from "react-toastify";
import { getCookie } from "@/utils/local-storage";
import { accessTokenCreate } from "@/actions/cookiesAction";
import { useRouter } from "next/navigation";

const instance = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
});

instance.defaults.headers.post["Content-Type"] = "application/json";
instance.defaults.headers["Accept"] = "application/json";
instance.defaults.timeout = 60000;

// Track refresh token requests to prevent loops
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// Server connectivity tracking
let isServerOffline = false;
let serverCheckInterval: NodeJS.Timeout | null = null;
let originalPath = "";

function onRefreshed(token: string) {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

// Function to redirect to error page
function redirectToErrorPage() {
  if (typeof window !== "undefined") {
    // Save current path for later redirect back
    originalPath = window.location.pathname;
    localStorage.setItem("originalPath", originalPath);
    // Redirect to server error page
    window.location.href = "/server-error";
  }
}

// Function to check if server is back online
function startServerCheck() {
  if (serverCheckInterval) return;
  
  serverCheckInterval = setInterval(() => {
    if (!isServerOffline) {
      clearServerCheck();
      return;
    }
    
    // Ping the server to check if it's back online
    fetch(getBaseUrl() + "/api/health", { 
      method: "HEAD",
      cache: "no-store"
    })
      .then(() => {
        if (isServerOffline && typeof window !== "undefined") {
          isServerOffline = false;
          clearServerCheck();
          
          // Redirect back to original page
          if (originalPath) {
            window.location.href = originalPath;
          }
        }
      })
      .catch(() => {
        // Server still offline, continue checking
      });
  }, 5000); // Check every 5 seconds
}

// Function to clear server check interval
function clearServerCheck() {
  if (serverCheckInterval) {
    clearInterval(serverCheckInterval);
    serverCheckInterval = null;
  }
}

// Request interceptor
instance.interceptors.request.use(
  function (config) {
    // Skip adding Authorization header for login and refresh endpoints
    if (!config.url?.includes("/auth/login") && !config.url?.includes("/auth/refresh")) {
      const accessToken = getCookie(authKey);
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// Response interceptor
instance.interceptors.response.use(
  //@ts-expect-error: response type is not always consistent
  function (response) {
    // Reset server offline flag if we get a successful response
    if (isServerOffline) {
      isServerOffline = false;
      clearServerCheck();
    }
    
    const responseObject: ResponseSuccessType = {
      statusCode: response?.data?.statusCode,
      success: response?.data?.success,
      message: response?.data?.message,
      data: response?.data?.data,
      meta: response?.data?.meta,
    };
    return responseObject;
  },
  async function (error) {
    const originalRequest = error.config;

    // Network error or no response - likely server is down
    if (!error.response) {
      // Mark server as offline
      if (!isServerOffline) {
        isServerOffline = true;
        redirectToErrorPage();
        startServerCheck();
      }
      
      const responseObject: IGenericErrorResponse = {
        statusCode: 503,
        message: "Server is currently unavailable. You'll be redirected when it's back online.",
        errorMessages: "Server offline. Redirecting to error page.",
      };
      return Promise.reject(responseObject);
    }

    const status = error.response?.status;
    const errorMessage = error.response?.data?.message || "An error occurred";

    // Handle 401 Unauthorized
    if (status === 401) {
      // Prevent infinite retry loops
      if (originalRequest._retry || originalRequest.url?.includes('/auth/refresh')) {
        console.log("Logging out due to auth failure");
        logout();
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      // Token expired - try to refresh
      if (errorMessage.includes("jwt expired") || errorMessage.includes("Token expired")) {
        if (!isRefreshing) {
          isRefreshing = true;

          try {
            console.log("Attempting to refresh token...");
            const response = await getNewAccessToken();
            const newAccessToken = response.data.access_token;

            console.log("New access token received");

            // Update token in cookies/storage
            accessTokenCreate(newAccessToken);
            document.cookie = `accessToken=${newAccessToken}; path=/; secure; samesite=lax`;

            // Update Authorization header
            instance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

            // Notify all waiting requests
            onRefreshed(newAccessToken);

            // Retry the original request
            return instance(originalRequest);
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
            // Clear all subscribers and logout
            refreshSubscribers = [];
            logout();
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        } else {
          // If already refreshing, wait for the new token
          return new Promise((resolve) => {
            addRefreshSubscriber((token: string) => {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              resolve(instance(originalRequest));
            });
          });
        }
      }
      // Invalid refresh token or other auth issues
      else if (errorMessage.includes("Invalid refresh token") ||
        errorMessage.includes("Invalid token") ||
        errorMessage.includes("Unauthorized")) {
        console.error("Authentication invalid, logging out");
        logout();
        return Promise.reject(error);
      }
    }

    // Handle 403 Forbidden
    else if (status === 403) {
      console.error("403: Forbidden");
      toast.error("You do not have permission to access this resource");

      const responseObject: IGenericErrorResponse = {
        statusCode: 403,
        message: errorMessage,
        errorMessages: errorMessage,
      };
      return Promise.reject(responseObject);
    }

    // Handle 400 Bad Request
    else if (status === 400) {
      if (errorMessage.includes("Invalid refresh token")) {
        console.log("Invalid refresh token detected");
        logout();
        return Promise.reject(error);
      }
    }

    // Handle 502, 503, 504 - Server unavailable errors
    else if (status === 502 || status === 503 || status === 504) {
      if (!isServerOffline) {
        isServerOffline = true;
        redirectToErrorPage();
        startServerCheck();
      }
      
      const responseObject: IGenericErrorResponse = {
        statusCode: status,
        message: "Server is currently unavailable. You'll be redirected when it's back online.",
        errorMessages: "Server unavailable. Redirecting to error page.",
      };
      return Promise.reject(responseObject);
    }

    // Handle other errors
    const responseObject: IGenericErrorResponse = {
      statusCode: error.response?.data?.statusCode || status || 500,
      message: error.response?.data?.message || "Something went wrong",
      errorMessages: error.response?.data?.error || errorMessage,
    };

    return Promise.reject(responseObject);
  }
);

export { instance as axiosInstance };