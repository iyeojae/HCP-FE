// src/utils/storage.js
const ACCESS_TOKEN_KEY = "accessToken";
const USER_KEY = "user";

const ROLE_KEY = "role";
const LOGIN_ID_KEY = "loginId";
const USER_ID_KEY = "userId";
const ADMIN_NAME_KEY = "adminName";
const ADMIN_DEPT_KEY = "adminDept";
const HAS_NEW_APPLICANTS_KEY = "hasNewApplicants";

export const storage = {
  // ===== Token =====
  getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  setAccessToken(token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },
  removeAccessToken() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  },

  // ===== User(JSON) =====
  getUser() {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  removeUser() {
    localStorage.removeItem(USER_KEY);
  },

  // ===== Admin/Auth meta =====
  getRole() {
    return localStorage.getItem(ROLE_KEY);
  },
  setRole(role) {
    localStorage.setItem(ROLE_KEY, role);
  },
  removeRole() {
    localStorage.removeItem(ROLE_KEY);
  },

  getLoginId() {
    return localStorage.getItem(LOGIN_ID_KEY);
  },
  setLoginId(loginId) {
    localStorage.setItem(LOGIN_ID_KEY, loginId);
  },
  removeLoginId() {
    localStorage.removeItem(LOGIN_ID_KEY);
  },

  getUserId() {
    return localStorage.getItem(USER_ID_KEY);
  },
  setUserId(userId) {
    localStorage.setItem(USER_ID_KEY, String(userId));
  },
  removeUserId() {
    localStorage.removeItem(USER_ID_KEY);
  },

  getAdminName() {
    return localStorage.getItem(ADMIN_NAME_KEY);
  },
  setAdminName(name) {
    localStorage.setItem(ADMIN_NAME_KEY, name);
  },
  removeAdminName() {
    localStorage.removeItem(ADMIN_NAME_KEY);
  },

  getAdminDept() {
    return localStorage.getItem(ADMIN_DEPT_KEY);
  },
  setAdminDept(dept) {
    localStorage.setItem(ADMIN_DEPT_KEY, dept);
  },
  removeAdminDept() {
    localStorage.removeItem(ADMIN_DEPT_KEY);
  },

  // ===== Applicants badge =====
  getHasNewApplicants() {
    return localStorage.getItem(HAS_NEW_APPLICANTS_KEY) === "true";
  },
  setHasNewApplicants(v) {
    localStorage.setItem(HAS_NEW_APPLICANTS_KEY, v ? "true" : "false");
  },
  removeHasNewApplicants() {
    localStorage.removeItem(HAS_NEW_APPLICANTS_KEY);
  },

  // ===== Helpers =====
  isAdmin() {
    const role = (this.getRole() || "").toUpperCase().trim();
    const token = this.getAccessToken();
    return role === "ADMIN" && !!token;
  },

  clearAuth() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(LOGIN_ID_KEY);
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(ADMIN_NAME_KEY);
    localStorage.removeItem(ADMIN_DEPT_KEY);
    localStorage.removeItem(HAS_NEW_APPLICANTS_KEY);
  },
};
