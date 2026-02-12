// src/routes/AdminRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function AdminRoute({
  children,
  guestFallbackPath = "/mypage/locked", // ✅ 게스트는 잠김 페이지로
}) {
  const location = useLocation();

  const role = (localStorage.getItem("role") || "").toUpperCase().trim();
  const token = localStorage.getItem("accessToken");
  const isAdmin = role === "ADMIN" && !!token;

  if (!isAdmin) {
    return (
      <Navigate
        to={guestFallbackPath}
        replace
        state={{ from: location }} // ✅ 어디서 왔는지 잠김 페이지에서 활용 가능
      />
    );
  }

  return children;
}
