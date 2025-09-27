import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();

  const [newAdmin, setNewAdmin] = useState({ username: "", password: "" });
  const [newEmployee, setNewEmployee] = useState({
    employeeName: "",
    employeeId: "",
    designation: "",
    employeePassword: "",
  });
  const [employees, setEmployees] = useState([]);
  const [showEmployees, setShowEmployees] = useState(false);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/adminn/getallemployee");
      setEmployees(res.data);
    } catch (err) {
      handleError(err, "Failed to fetch employees");
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // 🔹 Helper to handle error messages properly
  const handleError = (err, fallbackMsg) => {
    if (err.response?.data) {
      const data = err.response.data;
      if (typeof data === "string") {
        alert(data);
      } else if (data.message) {
        alert(data.message);
      } else {
        alert(JSON.stringify(data));
      }
    } else {
      alert(fallbackMsg);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:8080/api/adminn/new_adminn_registration",
        newAdmin
      );
      alert("New admin created successfully!");
      setNewAdmin({ username: "", password: "" });
    } catch (err) {
      handleError(err, "Failed to create admin");
    }
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:8080/api/employee/new_emp_registration",
        newEmployee
      );
      alert("Employee created successfully!");
      setNewEmployee({
        employeeName: "",
        employeeId: "",
        designation: "",
        employeePassword: "",
      });
      fetchEmployees();
    } catch (err) {
      handleError(err, "Failed to create employee");
    }
  };

  const approveEmployee = async (employeeId) => {
    try {
      await axios.put(`http://localhost:8080/api/employee/approve/${employeeId}`);
      alert("Employee approved!");
      fetchEmployees();
    } catch (err) {
      handleError(err, "Failed to approve employee");
    }
  };

  const disableEmployee = async (employeeId) => {
    try {
      await axios.put(`http://localhost:8080/api/adminn/approve_employee/${employeeId}`);
      alert("Employee disabled!");
      fetchEmployees();
    } catch (err) {
      handleError(err, "Failed to disable employee");
    }
  };

  const enableEmployee = async (employeeId) => {
    try {
      await axios.put(`http://localhost:8080/api/adminn//approve_employee/${employeeId}`);
      alert("Employee enabled!");
      fetchEmployees();
    } catch (err) {
      handleError(err, "Failed to enable employee");
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
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, employeePassword: e.target.value })
            }
            required
          />
          <button type="submit">Create Employee</button>
        </form>

        <div style={{ marginTop: "10px" }}>
          <button onClick={() => navigate("/EmployeeLogin")}>
            Go to Employee Login
          </button>
          <button onClick={() => navigate(-1)} style={{ marginLeft: "10px" }}>
            Go Back
          </button>
        </div>
      </div>

      <hr />

      {/* Toggle Employee List */}
      <button
        className="toggle-btn"
        onClick={() => setShowEmployees(!showEmployees)}
      >
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
                    {emp.employeeStatus === "PENDING" && (
                      <button onClick={() => approveEmployee(emp.employeeId)}>
                        Approve
                      </button>
                    )}
                    {emp.employeeStatus === "APPROVED" && (
                      <button onClick={() => disableEmployee(emp.employeeId)}>
                        Disable
                      </button>
                    )}
                    {emp.employeeStatus === "REJECTED" && (
                      <button onClick={() => enableEmployee(emp.employeeId)}>
                        Enable
                      </button>
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
