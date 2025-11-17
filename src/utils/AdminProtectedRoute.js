import { Navigate } from "react-router-dom";
import { useEffect } from "react";

export default function AdminProtectedRoute({ children }) {
  const adminToken = localStorage.getItem("adminToken");
  const lastActive = localStorage.getItem("adminLastActive");

  const MAX_IDLE_TIME = 30 * 60 * 1000; // 30 minutes

  // 🔥 Run hook ALWAYS (cannot be inside condition)
  useEffect(() => {
    const updateActivity = () => {
      localStorage.setItem("adminLastActive", Date.now());
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

  // ❌ If no token → block access
  if (!adminToken) {
    return <Navigate to="/AdminLogin" replace />;
  }

  // ⏳ Idle timeout check
  const now = Date.now();
  if (!lastActive || now - Number(lastActive) > MAX_IDLE_TIME) {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminLastActive");
    return <Navigate to="/AdminLogin" replace />;
  }

  // ✅ User allowed
  return children;
}
