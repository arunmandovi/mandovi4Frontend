import { useState } from "react";
import axios from "axios";

function Register() {
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
      await axios.post("http://localhost:8080/api/auth/register", form);
      alert("Registered successfully! Wait for admin approval.");
      setForm({ employeeId: "", employeeName: "", designation: "", employeePassword: "" });
    } catch (err) {
      console.error(err);
      alert("Registration failed!");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto" }}>
      <h2>Employee Registration</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Employee ID</label>
          <input
            type="text"
            name="employeeId"
            value={form.employeeId}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Employee Name</label>
          <input
            type="text"
            name="employeeName"
            value={form.employeeName}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Designation</label>
          <input
            type="text"
            name="designation"
            value={form.designation}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            name="employeePassword"
            value={form.employeePassword}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;
