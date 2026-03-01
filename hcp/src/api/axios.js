// src/api/axios.js
import axios from "axios";
import { storage } from "../utils/storage";

// ✅ .env 없으면 배포 서버로 기본 연결되게
const DEFAULT_BASE_URL = "https://api.likelionhsu.kr";
const BASE_URL = process.env.REACT_APP_API_BASE_URL || DEFAULT_BASE_URL;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  withCredentials: false, // refreshToken을 HttpOnly Cookie로 쓰는 경우에만 필요
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
  // ✅ storage 확장 버전이 있으면 그걸 우선 사용
  if (storage.clearAuth) {
    storage.clearAuth();
    return;
  }

  // ✅ fallback: 프로젝트에서 쓰는 키까지 같이 제거
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
  localStorage.removeItem("role");
  localStorage.removeItem("loginId");
  localStorage.removeItem("userId");
  localStorage.removeItem("adminName");
  localStorage.removeItem("adminDept");
  localStorage.removeItem("hasNewApplicants");
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
    const original = error?.config;

    // 네트워크 에러 등
    if (!error?.response || !original) return Promise.reject(error);

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
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;