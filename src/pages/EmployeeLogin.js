import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/EmployeeLogin.css";

function EmployeeLogin() {
  const [form, setForm] = useState({ employeeId: "", employeePassword: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // send as query params since backend expects @RequestParam
      await axios.post(
        "http://localhost:8080/api/employee/login_employee",
        null, // no body
        {
          params: {
            employeeId: form.employeeId,
            employeePassword: form.employeePassword,
          },
        }
      );
      // ✅ Go to DashboardHome (which defaults to Battery & Tyre)
      navigate("/DashboardHome");
    } catch (err) {
      alert(err.response?.data || "Login failed");
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
        />
        <input
          type="password"
          placeholder="Password"
          value={form.employeePassword}
          onChange={(e) =>
            setForm({ ...form, employeePassword: e.target.value })
          }
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
