import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const isAuth = localStorage.getItem("user");
  return isAuth ? children : <Navigate to="/login" />;
}
export default ProtectedRoute;
