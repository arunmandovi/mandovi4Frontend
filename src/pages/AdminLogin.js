import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/AdminLogin.css";

function AdminLogin() {
  const [form, setForm] = useState({ adminnId: "", adminnPassword: "" });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:8080/api/adminn/login_adminn",
        null, // backend expects RequestParams
        {
          params: {
            adminnId: form.adminnId,
            adminnPassword: form.adminnPassword,
          },
        }
      );

      // Save admin info if needed
      localStorage.setItem("adminnId", res.data.adminnId);

      // Redirect to AdminDashboard
      navigate("/AdminDashboard");
    } catch (err) {
      console.error(err.response?.data || err);
      alert(err.response?.data || "Admin login failed");
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
          <button
            type="button"
            className="back-btn"
            onClick={() => navigate("/")}
          >
            Go Back
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminLogin;
