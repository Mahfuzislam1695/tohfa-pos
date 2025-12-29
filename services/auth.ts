import { axiosInstance } from "@/helpers/axios/axiosInstance";

export const authService = {
  login: async (credentials: { email: string; password: string }) => {
    // console.log("login function called", credentials);
    const response = await axiosInstance.post("/auth/login", credentials);
    // console.log("response", response);

    return response.data;
  },
};

export const postService = {
  request: async (endpoint: string, data: Record<string, unknown>) => {
    // console.log(`Requesting ${endpoint} with data:`, data);

    try {
      const response = await axiosInstance.post(endpoint, data);
      // console.log("Response:", response);
      return response;
    } catch (error) {
      // console.log("error", error);
      return error;
    }
  },

  requestForm: async (
    endpoint: string,
    data: Record<string, unknown> | FormData
  ) => {
    const config =
      data instanceof FormData
        ? {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
        : {};

    try {
      const response = await axiosInstance.post(endpoint, data, config);
      // console.log("response ::", response);
      return response;
    } catch (error) {
      // console.log("error", error);
      return error;
    }
  },

  requestFormPatch: async (
    endpoint: string,
    data: Record<string, unknown> | FormData
  ) => {
    const config =
      data instanceof FormData
        ? {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
        : {};

    try {
      const response = await axiosInstance.patch(endpoint, data, config);
      // console.log("response ::", response);
      return response;
    } catch (error) {
      // console.log("error", error);
      return error;
    }
  },

  patch: async (endpoint: string, data: Record<string, unknown>) => {
    // console.log(`PATCH Request to ${endpoint} with data:`, data);
    try {
      const response = await axiosInstance.patch(endpoint, data);
      // console.log("Response:", response);
      return response;
    } catch (error) {
      // console.log("error", error);
      return error;
    }
  },
  // patch: async (endpoint: string, data: Record<string, unknown>) => {
  //   console.log(`PATCH Request to ${endpoint} with data:`, data);
  //   const response = await axiosInstance.patch(endpoint, data);
  //   console.log("Response:", response);
  //   return response.data;
  // },
};
