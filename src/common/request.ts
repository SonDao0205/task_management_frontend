import axios, {
  AxiosHeaders,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import type { ApiResponseData } from "../types/response.types";
import { LocalStorageService } from "../utils/localStorage.service";
import { API, BASE_URL } from "./api";

export const AUTH_SESSION_EXPIRED_EVENT = "auth:session-expired";

type RetryRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

type RefreshResponse = {
  access_token: string;
};

const httpClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

let refreshPromise: Promise<string> | null = null;

function clearSession(notify = false) {
  LocalStorageService.remove("accessToken");
  if (notify && typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT));
  }
}

async function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = axios
      .post<ApiResponseData<RefreshResponse>>(
        `${BASE_URL}${API.AUTH.REFRESH}`,
        undefined,
        { withCredentials: true },
      )
      .then(({ data }) => {
        const accessToken = data.data.access_token;
        LocalStorageService.set("accessToken", accessToken);
        return accessToken;
      })
      .catch((error: unknown) => {
        clearSession();
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

httpClient.interceptors.request.use((config) => {
  const accessToken = LocalStorageService.get<string>("accessToken");
  if (accessToken) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  }
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || !error.config) {
      return Promise.reject(error);
    }

    const config = error.config as RetryRequestConfig;
    const isPublicAuthRequest = [
      API.AUTH.LOGIN,
      API.AUTH.REGISTER,
      API.AUTH.REFRESH,
    ].some((path) => config.url?.endsWith(path));

    if (
      error.response?.status !== 401 ||
      config._retry ||
      isPublicAuthRequest
    ) {
      return Promise.reject(error);
    }

    config._retry = true;
    try {
      const accessToken = await refreshAccessToken();
      config.headers = AxiosHeaders.from(config.headers);
      config.headers.set("Authorization", `Bearer ${accessToken}`);
      return httpClient(config);
    } catch (refreshError) {
      clearSession(true);
      return Promise.reject(refreshError);
    }
  },
);

class Request {
  get = async <T>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponseData<T>> => {
    const response = await httpClient.get<ApiResponseData<T>>(url, config);
    return response.data;
  };

  post = async <TResponse, TBody = unknown>(
    url: string,
    body?: TBody,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponseData<TResponse>> => {
    const response = await httpClient.post<ApiResponseData<TResponse>>(
      url,
      body,
      config,
    );
    return response.data;
  };

  patch = async <TResponse, TBody = unknown>(
    url: string,
    body: TBody,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponseData<TResponse>> => {
    const response = await httpClient.patch<ApiResponseData<TResponse>>(
      url,
      body,
      config,
    );
    return response.data;
  };

  delete = async <TResponse, TBody = unknown>(
    url: string,
    body?: TBody,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponseData<TResponse>> => {
    const response = await httpClient.delete<ApiResponseData<TResponse>>(url, {
      ...config,
      data: body,
    });
    return response.data;
  };

  refreshSession = refreshAccessToken;
}

export const request = new Request();
