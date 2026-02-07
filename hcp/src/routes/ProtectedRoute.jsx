import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { storage } from "../utils/storage";

export default function ProtectedRoute() {
  const location = useLocation();

  const token = storage.getAccessToken?.() || localStorage.getItem("accessToken");
  const user = storage.getUser?.() || localStorage.getItem("user");
  const isAuthed = !!token && !!user;

  // ✅ 로그인 없이 허용할 경로(게스트)
  const guestAllowedPrefixes = ["/main", "/clubs"];
  const isGuestAllowed = guestAllowedPrefixes.some((p) =>
    location.pathname === p || location.pathname.startsWith(`${p}/`)
  );

  if (isAuthed || isGuestAllowed) return <Outlet />;

  // ✅ 그 외(예: /mypage)는 로그인 화면(시작 화면)으로
  return <Navigate to="/login" replace state={{ from: location }} />;
}
