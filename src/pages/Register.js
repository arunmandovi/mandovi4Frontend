import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Register.css"; // Import CSS

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    employeeId: "",
    employeeName: "",
    designation: "",
    employeePassword: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8080/api/employee/new_emp_registration",
        form
      );

      if (response.status === 200) {
        alert("Registered successfully! Wait for admin approval.");
        setForm({
          employeeName: "",
          employeeId: "",
          designation: "",
          employeePassword: "",
        });
        navigate("/login"); // Redirect to login after successful registration
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        alert(err.response.data); // Show backend error message
      } else {
        alert("Registration failed!");
      }
    }
  };

  return (
    <div className="register-container">
      <div className="form-box">
        <h2>Employee Registration</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Employee Name</label>
            <input
              type="text"
              name="employeeName"
              value={form.employeeName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-group">
            <label>Employee ID</label>
            <input
              type="text"
              name="employeeId"
              value={form.employeeId}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-group">
            <label>Designation</label>
            <input
              type="text"
              name="designation"
              value={form.designation}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              name="employeePassword"
              value={form.employeePassword}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="submit-btn">Register</button>
        </form>
        <div className="extra-buttons">
          <button className="back-btn" onClick={() => navigate(-1)}>Go Back</button>
          <button className="login-btn" onClick={() => navigate("/login")}>Already Logged In?</button>
        </div>
      </div>
    </div>
  );
}

export default Register;
