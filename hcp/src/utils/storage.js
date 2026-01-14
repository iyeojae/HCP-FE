// src/utils/storage.js
const ACCESS_TOKEN_KEY = "accessToken";
const USER_KEY = "user";

export const storage = {
  getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  setAccessToken(token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },
  removeAccessToken() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  },

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

  clearAuth() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};
