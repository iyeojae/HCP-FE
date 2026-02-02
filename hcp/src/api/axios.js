// src/api/axios.js
import axios from "axios";
import { storage } from "../utils/storage";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  withCredentials: true, // refreshToken을 HttpOnly Cookie로 쓰는 경우 필수
});

// ✅ refresh 전용(인터셉터 없는) 클라이언트
const refreshClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  withCredentials: true,
});

/**
 * AccessToken 첨부
 */
api.interceptors.request.use(
  (config) => {
    const token = storage.getAccessToken?.();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let refreshQueue = [];

function processQueue(error, newAccessToken = null) {
  refreshQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(newAccessToken);
  });
  refreshQueue = [];
}

function clearAuthFallback() {
  if (storage.clearAuth) storage.clearAuth();
  else if (storage.clearAll) storage.clearAll();
  else {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  }
}

function extractAccessToken(res) {
  const data = res?.data ?? {};
  let token =
    data.accessToken ||
    data.token ||
    data.access_token ||
    data?.data?.accessToken ||
    data?.result?.accessToken ||
    null;

  const authHeader = res?.headers?.authorization || res?.headers?.Authorization || null;
  if (!token && typeof authHeader === "string") {
    token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
  }
  return token;
}

/**
 * 401 처리 (쿠키 기반 refresh)
 */
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (!error.response) return Promise.reject(error);

    const status = error.response.status;
    const url = original?.url || "";

    // ✅ refresh 자체가 401이면 더 이상 재시도 금지
    if (url.includes("/auth/refresh")) {
      clearAuthFallback();
      return Promise.reject(error);
    }

    // 401이 아니거나, 이미 재시도면 종료
    if (status !== 401 || original._retry) return Promise.reject(error);
    original._retry = true;

    // refresh 중이면 큐 대기
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({
          resolve: (newToken) => {
            original.headers = original.headers || {};
            original.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(original));
          },
          reject,
        });
      });
    }

    isRefreshing = true;

    try {
      // ✅ refresh는 refreshClient로 호출(인터셉터 루프 방지)
      const refreshRes = await refreshClient.post("/auth/refresh");
      const newToken = extractAccessToken(refreshRes);

      if (!newToken) throw new Error("No accessToken in refresh response");

      storage.setAccessToken?.(newToken);
      processQueue(null, newToken);

      original.headers = original.headers || {};
      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch (e) {
      processQueue(e, null);
      clearAuthFallback();
      // 필요하면 강제 이동:
      // window.location.href = "/login";
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
