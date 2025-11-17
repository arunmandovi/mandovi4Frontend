import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import "../../styles/AdminLogin.css";

function AdminLogin() {
  const [form, setForm] = useState({ adminnId: "", adminnPassword: "" });
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      navigate("/AdminDashboard");
    }
  }, [navigate]);

  const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const res = await axiosInstance.post(
      "/api/adminn/login_adminn",
      null,
      {
        params: {
          adminnId: form.adminnId,
          adminnPassword: form.adminnPassword,
        },
      }
    );

    // 🔥 Save admin token
    if (res?.data?.adminnId) {
      localStorage.setItem("adminToken", res.data.adminnId);

      // ⏳ Save last activity timestamp for auto-logout
      localStorage.setItem("adminLastActive", Date.now());
    }

    navigate("/AdminDashboard");
  } catch (err) {
    alert(err?.response?.data || "Admin login failed");
  }
};

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>Admin Login</h2>

        <input
          type="text"
          placeholder="Admin ID"
          value={form.adminnId}
          onChange={(e) => setForm({ ...form, adminnId: e.target.value })}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={form.adminnPassword}
          onChange={(e) => setForm({ ...form, adminnPassword: e.target.value })}
          required
        />

        <button type="submit">Login</button>

        <div className="extra-buttons">
          <button type="button" className="back-btn" onClick={() => navigate("/")}>
            Go Back
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminLogin;
