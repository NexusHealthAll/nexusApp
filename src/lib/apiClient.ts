// ── Axios API Client ─────────────────────────────────────────────────────────
//
// A single pre-configured axios instance for all Nexus backend calls.
//
// Features:
//  • baseURL from VITE_API_BASE_URL
//  • Automatic `Authorization: Bearer <token>` injection
//  • Silent 401 token-refresh with one automatic retry
//  • All non-2xx responses converted to a typed `ApiError`
//
// Usage:
//   import apiClient from "@/lib/apiClient";
//   const data = await apiClient.get<MyType>("/api/v1/something");

import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";
import { ApiError, parseFieldErrors } from "./apiError";
import { useAuthStore } from "@/shared/auth/store/authStore";

// ── Instance ─────────────────────────────────────────────────────────────────

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "http://0.0.0.0:8080",
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor – attach auth token ──────────────────────────────────

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor – error mapping + token refresh ────────────────────

// Internal flag to prevent infinite refresh loops
let isRefreshing = false;
// Queue of requests waiting for the refreshed token
let refreshQueue: Array<{
  resolve: (value: string) => void;
  reject: (reason: unknown) => void;
}> = [];

function drainQueue(token: string | null, error?: unknown) {
  refreshQueue.forEach(({ resolve, reject }) =>
    token ? resolve(token) : reject(error),
  );
  refreshQueue = [];
}

apiClient.interceptors.response.use(
  // ── Success passthrough ────────────────────────────────────────────────────
  (response) => response,

  // ── Error handler ──────────────────────────────────────────────────────────
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retried?: boolean;
    };

    // ── 401 – attempt token refresh ──────────────────────────────────────────
    if (error.response?.status === 401 && !originalRequest._retried) {
      originalRequest._retried = true;

      const { refreshToken, setAuthSession, clearAuthSession } =
        useAuthStore.getState();

      if (!refreshToken) {
        clearAuthSession();
        return Promise.reject(buildApiError(error));
      }

      // If a refresh is already in flight, queue this request
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then((newToken) => {
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${newToken}`,
          };
          return apiClient(originalRequest);
        });
      }

      isRefreshing = true;

      try {
        // Use a fresh axios call (not apiClient) to avoid the interceptor loop
        const refreshResponse: AxiosResponse<{
          access_token: string;
          refresh_token: string;
        }> = await axios.post(
          `${apiClient.defaults.baseURL}/api/v1/auth/refresh`,
          { refresh_token: refreshToken },
          { headers: { "Content-Type": "application/json" } },
        );

        const { access_token, refresh_token } = refreshResponse.data;

        // Persist the new tokens
        setAuthSession({
          accessToken: access_token,
          refreshToken: refresh_token,
          user: useAuthStore.getState().user!,
        });

        drainQueue(access_token);

        // Retry the original request with the new token
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${access_token}`,
        };
        return apiClient(originalRequest);
      } catch (refreshError) {
        drainQueue(null, refreshError);
        clearAuthSession();
        return Promise.reject(buildApiError(error));
      } finally {
        isRefreshing = false;
      }
    }

    // ── All other errors – map to ApiError ───────────────────────────────────
    return Promise.reject(buildApiError(error));
  },
);

// ── Error builder ────────────────────────────────────────────────────────────

/** Safely coerce any backend "message" value to a human-readable string. */
function coerceMessage(raw: unknown): string | undefined {
  if (raw === null || raw === undefined) return undefined;
  if (typeof raw === "string") return raw || undefined;
  // Array of strings or FastAPI-style detail objects: [{loc, msg, type}]
  if (Array.isArray(raw)) {
    const parts = raw.map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object") {
        const o = item as Record<string, unknown>;
        return (o.msg ?? o.message ?? o.detail ?? JSON.stringify(item)) as string;
      }
      return String(item);
    });
    return parts.join("; ") || undefined;
  }
  // Plain object with a nested message/detail
  if (typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    return coerceMessage(o.detail ?? o.msg ?? o.message) ?? JSON.stringify(raw);
  }
  return String(raw);
}

function buildApiError(error: unknown): ApiError {
  if (!axios.isAxiosError(error)) {
    return new ApiError(
      error instanceof Error ? error.message : "Unexpected error",
      0,
    );
  }

  const status = error.response?.status ?? 0;
  const body = error.response?.data as
    | Record<string, unknown>
    | undefined;

  // Backend error shape: { error: { message: string, status: number } }
  // Check the nested error.message first, then fall back to other common shapes.
  const nested = body?.error;
  const nestedMessage =
    nested && typeof nested === "object"
      ? (nested as Record<string, unknown>).message
      : undefined;

  const message =
    coerceMessage(nestedMessage) ??
    coerceMessage(body?.message) ??
    coerceMessage(body?.detail) ??
    error.message ??
    `Request failed (${status})`;

  const fieldErrors = parseFieldErrors(body);

  return new ApiError(message, status, fieldErrors);
}

export default apiClient;
