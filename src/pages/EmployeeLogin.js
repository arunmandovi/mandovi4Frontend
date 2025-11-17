// src/pages/EmployeeLogin.js
import { useState } from "react";
import axiosInstance from "../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import "../styles/EmployeeLogin.css";

function EmployeeLogin() {
  const [form, setForm] = useState({ employeeId: "", employeePassword: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post(
        "/api/employee/login_employee",
        null,
        {
          params: {
            employeeId: form.employeeId,
            employeePassword: form.employeePassword,
          },
        }
      );
  
      // Save login status
      localStorage.setItem("employeeToken", "true");
  
      // ⏳ save last activity timestamp
      localStorage.setItem("employeeLastActive", Date.now());
  
      // redirect to dashboard
      navigate("/DashboardHome/loadd");
    } catch (err) {
      const msg = err?.response?.data || err.message || "Login failed";
      alert(msg);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>

        <input
          type="text"
          placeholder="Employee ID"
          value={form.employeeId}
          onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={form.employeePassword}
          onChange={(e) =>
            setForm({ ...form, employeePassword: e.target.value })
          }
          required
        />

        <button type="submit">Login</button>

        {/* Extra Buttons */}
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

export default EmployeeLogin;
