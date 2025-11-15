// src/utils/AdminProtectedRoute.js
import { Navigate } from "react-router-dom";

export default function AdminProtectedRoute({ children }) {
  // Check if admin is logged in
  const isLoggedIn = localStorage.getItem("adminToken");

  if (!isLoggedIn) {
    return <Navigate to="/AdminLogin" replace />;
  }

  return children;
}
