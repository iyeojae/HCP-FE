// src/api/axios.js
import axios from "axios";
import { storage } from "../utils/storage";
import { globalLoaderStore } from "../utils/globalLoaderStore";

// ✅ .env 없으면 배포 서버로 기본 연결되게
const DEFAULT_BASE_URL = "https://api.likelionhsu.kr";
const BASE_URL = process.env.REACT_APP_API_BASE_URL || DEFAULT_BASE_URL;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  withCredentials: false,
});

// ✅ refresh 전용(인터셉터 없는) 클라이언트
const refreshClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  withCredentials: true,
});

/** 전역 로더 helper */
function trackStart(config) {
  if (!config) return;
  if (config.skipLoader) return; // 필요하면 호출부에서 { skipLoader:true }로 제외 가능
  if (config.__loaderTracked) return;
  config.__loaderTracked = true;
  globalLoaderStore.inc();
}

function trackEnd(config) {
  if (!config) return;
  if (config.skipLoader) return;
  if (!config.__loaderTracked) return;
  config.__loaderTracked = false;
  globalLoaderStore.dec();
}

/**
 * AccessToken 첨부 + 전역 로더 시작
 */
api.interceptors.request.use(
  (config) => {
    trackStart(config);

    const token = storage.getAccessToken?.();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // request 단계에서 튕긴 것도 종료 처리
    trackEnd(error?.config);
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let refreshQueue = [];

function processQueue(error, newAccessToken = null) {
  refreshQueue.forEach((p) => {
    if (error) {
      // ✅ refresh 실패로 큐가 reject될 때도 로더 종료
      trackEnd(p.config);
      p.reject(error);
    } else {
      p.resolve(newAccessToken);
    }
  });
  refreshQueue = [];
}

function clearAuthFallback() {
  if (storage.clearAuth) {
    storage.clearAuth();
    return;
  }

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

/** ✅ public endpoint면 refresh 금지 (안전장치) */
function isPublicEndpoint(url) {
  if (!url) return false;
  return url.startsWith("/common") || url.includes("/common/");
}

/** ✅ 관리자일 때만 refresh 시도 */
function canAttemptRefresh() {
  return !!storage.isAdmin?.();
}

/**
 * ✅ 응답 성공: 로더 종료
 */
api.interceptors.response.use(
  (res) => {
    trackEnd(res?.config);
    return res;
  },
  async (error) => {
    const original = error?.config;

    // config가 없으면 종료할 것도 없음
    if (!original) return Promise.reject(error);

    // 네트워크 에러 등 response가 없는 경우 -> 최종 실패로 처리(로더 종료)
    if (!error?.response) {
      trackEnd(original);
      return Promise.reject(error);
    }

    const status = error.response.status;
    const url = original?.url || "";

    // ✅ refresh 자체가 401이면 더 이상 재시도 금지
    if (url.includes("/auth/refresh")) {
      clearAuthFallback();
      trackEnd(original);
      return Promise.reject(error);
    }

    // ✅ public endpoint는 refresh 금지
    if (isPublicEndpoint(url)) {
      trackEnd(original);
      return Promise.reject(error);
    }

    // ✅ 관리자 아니면 refresh 금지
    if (!canAttemptRefresh()) {
      trackEnd(original);
      return Promise.reject(error);
    }

    // 401이 아니거나, 이미 재시도면 종료
    if (status !== 401 || original._retry) {
      trackEnd(original);
      return Promise.reject(error);
    }
    original._retry = true;

    // refresh 중이면 큐 대기
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({
          config: original,
          resolve: (newToken) => {
            original.headers = original.headers || {};
            original.headers.Authorization = `Bearer ${newToken}`;
            // ✅ 재요청(이 config는 이미 __loaderTracked=true 이므로 중복 inc 없음)
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
      trackEnd(original);
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;