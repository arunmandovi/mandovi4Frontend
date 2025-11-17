import { Navigate } from "react-router-dom";
import { useEffect } from "react";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("employeeToken");
  const lastActive = localStorage.getItem("employeeLastActive");

  const MAX_IDLE_TIME = 30 * 60 * 1000; // 30 minutes

  // Must run before any return (avoid hook errors)
  useEffect(() => {
    const updateActivity = () => {
      localStorage.setItem("employeeLastActive", Date.now());
    };

    window.addEventListener("mousemove", updateActivity);
    window.addEventListener("keydown", updateActivity);
    window.addEventListener("click", updateActivity);
    window.addEventListener("scroll", updateActivity);

    return () => {
      window.removeEventListener("mousemove", updateActivity);
      window.removeEventListener("keydown", updateActivity);
      window.removeEventListener("click", updateActivity);
      window.removeEventListener("scroll", updateActivity);
    };
  }, []);

  // 💥 Block if no token
  if (!token) {
    return <Navigate to="/EmployeeLogin" replace />;
  }

  // 💥 Block if idle timeout passed
  const now = Date.now();
  if (!lastActive || now - Number(lastActive) > MAX_IDLE_TIME) {
    localStorage.removeItem("employeeToken");
    localStorage.removeItem("employeeLastActive");
    return <Navigate to="/EmployeeLogin" replace />;
  }

  return children;
}
