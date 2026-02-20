/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  AxiosError,
} from "axios";

// ============================
// --- AXIOS INSTANCE ---------
// ============================

export const httpClient: AxiosInstance = axios.create({
  baseURL: "/api",
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

httpClient.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error),
);

httpClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<{ error?: string; message?: string }>) => {
    const serverMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message;

    throw new Error(serverMessage);
  },
);

const _send = async <T>(
  method: string,
  pathname: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> => {
  const response = await httpClient.request<T>({
    method,
    url: pathname,
    data,
    ...config,
  });

  return response.data;
};

const get = <T>(pathname: string, config?: AxiosRequestConfig) =>
  _send<T>("get", pathname, null, config);

const post = <T>(
  pathname: string,
  data?: unknown,
  config?: AxiosRequestConfig,
) => _send<T>("post", pathname, data, config);

const put = <T>(
  pathname: string,
  data?: unknown,
  config?: AxiosRequestConfig,
) => _send<T>("put", pathname, data, config);

const del = <T>(pathname: string, config?: AxiosRequestConfig) =>
  _send<T>("delete", pathname, null, config);

const patch = <T>(
  pathname: string,
  data?: unknown,
  config?: AxiosRequestConfig,
) => _send<T>("patch", pathname, data, config);

const http = { get, post, put, del, patch };

export default http;
