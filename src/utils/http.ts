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
  // Nếu có BE riêng: set NEXT_PUBLIC_API_URL=http://localhost:3001 trong .env.local
  // Nếu chỉ dùng Next.js API Routes nội bộ: để trống hoặc xóa dòng này (fallback về "/")
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "/api",
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================
// ------ TYPES ---------------
// ============================

// Cấu trúc API refresh-token trả về
interface RefreshTokenResponse {
  status: string;
  data: {
    access_token: string;
    refresh_token: string;
  };
}

// Request bị queue lại khi đang refresh token
interface FailedQueueItem {
  resolve: () => void;
  reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: FailedQueueItem[] = [];

// ============================
// --- QUEUE HANDLER ----------
// ============================

const processQueue = (error: unknown | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  failedQueue = [];
};

// ============================
// --- LOGOUT HANDLER ---------
// ============================

const forceLogout = () => {
  console.log("Force logout: refresh token failed with 401");
  localStorage.clear();
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

// ============================
// --- REFRESH TOKEN API ------
// ============================

const refreshToken = async (): Promise<void> => {
  try {
    console.log("Refreshing token...");

    const result = await axios.post<RefreshTokenResponse>(
      "/api/auth/refresh",
      {},
      { withCredentials: true },
    );

    if ((result.data as any).success !== true) {
      console.log("Refresh token failed");
      forceLogout();
      throw new Error("Refresh token failed");
    }

    processQueue(null);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      forceLogout();
    }
    processQueue(error);
    throw error;
  }
};

// ============================
// --- GET NEW TOKEN ----------
// ============================

const getNewToken = async (): Promise<void> => {
  if (!isRefreshing) {
    isRefreshing = true;
    try {
      await refreshToken();
    } finally {
      isRefreshing = false;
    }
    return;
  }

  return new Promise((resolve, reject) => {
    failedQueue.push({ resolve, reject });
  });
};

// ============================
// --- REQUEST INTERCEPTOR ----
// ============================

httpClient.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error),
);

// ============================
// --- RESPONSE INTERCEPTOR ---
// ============================

// httpClient.interceptors.response.use(
//   (response: AxiosResponse) => response,
//   async (error: AxiosError) => {
//     const originalRequest = error.config as any & {
//       _retry?: boolean;
//     };

//     if (!originalRequest) {
//       return Promise.reject(error);
//     }

//     const isAuthEndpoint =
//       originalRequest?.url?.includes("/api/auth/login") ||
//       originalRequest?.url?.includes("/api/auth/register") ||
//       originalRequest?.url?.includes("/api/auth/refresh");

//     const shouldRenewToken =
//       error.response?.status === 401 &&
//       !originalRequest._retry &&
//       !isAuthEndpoint;

//     if (shouldRenewToken) {
//       originalRequest._retry = true;
//       try {
//         await getNewToken();
//         return httpClient(originalRequest);
//       } catch (e) {
//         return Promise.reject(e);
//       }
//     }

//     return Promise.reject(error);
//   },
// );

// ============================
// ---- HTTP METHODS ----------
// ============================

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
