// src/api/axios.js
import axios from "axios";
import { storage } from "../utils/storage";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/api",
  timeout: 15000,
  withCredentials: true, // refreshToken을 HttpOnly Cookie로 쓰는 경우 필수
});

/**
 * AccessToken 첨부
 */
api.interceptors.request.use(
  (config) => {
    const token = storage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * 401 처리(옵션):
 * - refreshToken은 프론트에 저장하지 않고, 서버 쿠키 기반으로 재발급만 호출하는 형태를 가정
 * - 백엔드 스펙이 정해지면 refresh endpoint만 맞추면 됨
 *
 * 만약 "서버가 알아서 재발급하고 401이 안 난다"면 아래 로직은 꺼도 됩니다.
 */
let isRefreshing = false;
let refreshQueue = [];

function processQueue(error, newAccessToken = null) {
  refreshQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(newAccessToken);
  });
  refreshQueue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    // 네트워크/타임아웃 등
    if (!error.response) return Promise.reject(error);

    const status = error.response.status;

    // 이미 재시도 했으면 종료
    if (status !== 401 || original._retry) return Promise.reject(error);

    // refresh를 아예 쓰지 않을 계획이면 아래 401 처리에서 바로 storage.clearAuth() 후 라우팅만 하세요.
    // 여기서는 "쿠키 기반 refresh endpoint 호출"을 기본 템플릿으로 둡니다.
    original._retry = true;

    if (isRefreshing) {
      // refresh 중이면 큐에 쌓아 대기 후 재시도
      return new Promise((resolve, reject) => {
        refreshQueue.push({
          resolve: (newToken) => {
            original.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(original));
          },
          reject,
        });
      });
    }

    isRefreshing = true;

    try {
      // 예시) 서버가 refresh 쿠키를 보고 새 accessToken을 반환한다고 가정
      // 실제 경로/응답 포맷은 백엔드에 맞게 수정
      const refreshRes = await api.post("/auth/refresh");
      const newToken = refreshRes.data?.accessToken;

      if (!newToken) throw new Error("No accessToken in refresh response");

      storage.setAccessToken(newToken);

      processQueue(null, newToken);

      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch (e) {
      processQueue(e, null);
      storage.clearAuth();
      // 여기서 window.location.href = "/login"; 같은 강제 이동도 가능
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
