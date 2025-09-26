import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();

  // Admin form
  const [newAdmin, setNewAdmin] = useState({ username: "", password: "" });

  // Employee form
  const [newEmployee, setNewEmployee] = useState({
    employeeName: "",
    employeeId: "",
    designation: "",
    employeePassword: "",
  });

  // Employee list
  const [employees, setEmployees] = useState([]);

  // Toggle employee table visibility
  const [showEmployees, setShowEmployees] = useState(false);

  // Fetch all employees
  const fetchEmployees = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/employee/all"); // Make sure endpoint exists
      setEmployees(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch employees");
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Create Admin
  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:8080/admin/create",
        null,
        { params: { username: newAdmin.username, password: newAdmin.password } }
      );
      alert("New admin created successfully!");
      setNewAdmin({ username: "", password: "" });
    } catch (err) {
      alert(err.response?.data || "Failed to create admin");
    }
  };

  // Create Employee
  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    try {
      const empData = {
        employeeName: newEmployee.employeeName,
        employeeId: newEmployee.employeeId,
        designation: newEmployee.designation,
        employeePassword: newEmployee.employeePassword,
      };
      await axios.post("http://localhost:8080/api/employee/new_emp_registration", empData);
      alert("Employee created successfully!");
      setNewEmployee({ employeeName: "", employeeId: "", designation: "", employeePassword: "" });
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data || "Failed to create employee");
    }
  };

  // Approve Employee
  const approveEmployee = async (employeeId) => {
    try {
      await axios.put(`http://localhost:8080/api/employee/approve/${employeeId}`);
      alert("Employee approved!");
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data || "Failed to approve employee");
    }
  };

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>

      {/* Admin Form */}
      <div className="form-section">
        <h3>Create Admin Account</h3>
        <form onSubmit={handleCreateAdmin}>
          <input
            type="text"
            placeholder="Admin Username"
            value={newAdmin.username}
            onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Admin Password"
            value={newAdmin.password}
            onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
            required
          />
          <button type="submit">Create Admin</button>
        </form>
      </div>

      <hr />

      {/* Employee Form */}
      <div className="form-section">
        <h3>Create Employee Account</h3>
        <form onSubmit={handleCreateEmployee}>
          <input
            type="text"
            placeholder="Employee Name"
            value={newEmployee.employeeName}
            onChange={(e) => setNewEmployee({ ...newEmployee, employeeName: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Employee ID"
            value={newEmployee.employeeId}
            onChange={(e) => setNewEmployee({ ...newEmployee, employeeId: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Designation"
            value={newEmployee.designation}
            onChange={(e) => setNewEmployee({ ...newEmployee, designation: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Employee Password"
            value={newEmployee.employeePassword}
            onChange={(e) => setNewEmployee({ ...newEmployee, employeePassword: e.target.value })}
            required
          />
          <button type="submit">Create Employee</button>
        </form>

        <div style={{ marginTop: "10px" }}>
          <button onClick={() => navigate("/EmployeeLogin")}>Go to Employee Login</button>
          <button onClick={() => navigate(-1)} style={{ marginLeft: "10px" }}>Go Back</button>
        </div>
      </div>

      <hr />

      {/* Toggle Employee List */}
      <button className="toggle-btn" onClick={() => setShowEmployees(!showEmployees)}>
        {showEmployees ? "Hide Employees" : "View Employees"}
      </button>

      {/* Employee Table */}
      {showEmployees && (
        <div className="employee-list">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>ID</th>
                <th>Designation</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.employeeId}>
                  <td>{emp.employeeName}</td>
                  <td>{emp.employeeId}</td>
                  <td>{emp.designation}</td>
                  <td>{emp.employeeStatus}</td>
                  <td>
                    {emp.employeeStatus !== "APPROVED" && (
                      <button onClick={() => approveEmployee(emp.employeeId)}>Approve</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
