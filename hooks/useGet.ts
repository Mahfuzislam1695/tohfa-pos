import { QueryKey, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { IGenericErrorResponse } from "@/types";
import { axiosInstance } from "@/helpers/axios/axiosInstance";
import { AxiosResponse } from "axios";

type CustomQueryOptions<T> = Omit<
  UseQueryOptions<T, IGenericErrorResponse, T, QueryKey>,
  "queryKey" | "queryFn"
>;

export const useGet1 = <T>(
  endpoint: string | undefined, // Allow undefined
  queryKey: string[],
  queryParams?: Record<string, unknown>,
  options?: CustomQueryOptions<T>
) => {
  return useQuery<T, IGenericErrorResponse>({
    queryKey: queryKey,
    queryFn: async () => {
      if (!endpoint) {
        // Return empty data or throw error if endpoint is not provided
        return {} as T;
      }

      try {
        const response = await axiosInstance.get(endpoint, {
          params: queryParams,
        });
        return response.data;
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message || "Failed to fetch data.");
        } else {
          toast.error("Failed to fetch data.");
        }
        throw error;
      }
    },
    enabled: !!endpoint, // Only enable the query if endpoint is provided
    ...options,
  });
};

export const useGet = <T>(
  endpoint: string,
  queryKey: string[],
  queryParams?: Record<string, unknown>,
  options?: CustomQueryOptions<T>
) => {
  return useQuery<T, IGenericErrorResponse>({
    queryKey: queryKey,
    queryFn: async () => {
      try {
        const response = await axiosInstance.get(endpoint, {
          params: queryParams,
        });
        return response.data;
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message || "Failed to fetch data.");
        } else {
          toast.error("Failed to fetch data.");
        }
        throw error;
      }
    },
    ...options,
  });
};

export const useGetAll = <T>(
  endpoint: string,
  queryKey: string[],
  queryParams?: Record<string, unknown>,
  options?: CustomQueryOptions<AxiosResponse<T>>
) => {
  return useQuery<AxiosResponse<T>, IGenericErrorResponse>({
    queryKey: queryKey,
    queryFn: async (): Promise<AxiosResponse<T>> => {
      try {
        const response = await axiosInstance.get<T>(endpoint, {
          params: queryParams,
        });
        return response;
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message || "Failed to fetch data.");
        } else {
          toast.error("Failed to fetch data.");
        }
        throw error;
      }
    },
    ...options,
  });
};
