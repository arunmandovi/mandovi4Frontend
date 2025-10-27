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
      // backend expects @RequestParam style, so we send params and no body
      await axiosInstance.post(
        "/api/employee/login_employee",
        null, // no body
        {
          params: {
            employeeId: form.employeeId,
            employeePassword: form.employeePassword,
          },
        }
      );

      // navigate to dashboard on success
      navigate("/DashboardHome");
    } catch (err) {
      // prefer safe error access
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
          placeholder="EmployeeId"
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
