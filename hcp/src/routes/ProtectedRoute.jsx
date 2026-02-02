import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { storage } from "../utils/storage";

export default function ProtectedRoute() {
  const location = useLocation();

  const token = storage.getAccessToken?.() || localStorage.getItem("accessToken");
  const user = storage.getUser?.() || localStorage.getItem("user");

  const isAuthed = !!token && !!user;

  if (!isAuthed) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}
