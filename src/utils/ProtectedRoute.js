// src/utils/ProtectedRoute.js
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const isLoggedIn = localStorage.getItem("employeeToken"); 
  // or whatever token you set after login

  if (!isLoggedIn) {
    return <Navigate to="/EmployeeLogin" replace />;
  }

  return children;
}
