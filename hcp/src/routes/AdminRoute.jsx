import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function AdminRoute({ children }) {
  const location = useLocation();

  const role = (localStorage.getItem("role") || "").toUpperCase().trim();
  const token = localStorage.getItem("accessToken");

  const isAdmin = role === "ADMIN" && !!token;

  if (!isAdmin) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return children;
}
