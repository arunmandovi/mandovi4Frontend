import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();

  const [newAdmin, setNewAdmin] = useState({
    adminnName: "",
    adminnId: "",
    branch: "",
    adminnPassword: "",
  });

  const [newEmployee, setNewEmployee] = useState({
    employeeName: "",
    employeeId: "",
    designation: "",
    employeePassword: "",
  });

  const [employees, setEmployees] = useState([]);
  const [showEmployees, setShowEmployees] = useState(false);
  const [adminn, setAdminn] = useState([]);
  const [showAdminn, setShowAdminn] = useState(false);

  // ✅ Common error handler
  const handleError = (err, fallbackMsg) => {
    if (err.response?.data) {
      const data = err.response.data;
      if (typeof data === "string") alert(data);
      else if (data.message) alert(data.message);
      else alert(JSON.stringify(data));
    } else {
      alert(fallbackMsg);
    }
  };

  // ✅ Fetch Employees
  const fetchEmployees = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/adminn/getallemployee");
      console.log("Employee API Response:", res.data);

      if (Array.isArray(res.data)) setEmployees(res.data);
      else setEmployees([]);
    } catch (err) {
      handleError(err, "Failed to fetch employees");
      setEmployees([]);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // ✅ Fetch Admins
  const fetchAdminns = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/adminn/getalladminn");
      console.log("Admin API Response:", res.data);

      if (Array.isArray(res.data)) setAdminn(res.data);
      else setAdminn([]);
    } catch (err) {
      handleError(err, "Failed to fetch admins");
      setAdminn([]);
    }
  };

  useEffect(() => {
    fetchAdminns();
  }, []);

  // ✅ Create Admin
  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8080/api/adminn/new_adminn_registration", newAdmin);
      alert("New admin created successfully!");
      setNewAdmin({ adminnName: "", adminnId: "", branch: "", adminnPassword: "" });
      fetchAdminns();
    } catch (err) {
      handleError(err, "Failed to create admin");
    }
  };

  // ✅ Create Employee
  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8080/api/employee/new_emp_registration", newEmployee);
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

  // ✅ Enable / Disable functions
  const disableEmployee = async (employeeId) => {
    try {
      await axios.put(`http://localhost:8080/api/adminn/disable_employee/${employeeId}`);
      alert("Employee disabled!");
      fetchEmployees();
    } catch (err) {
      handleError(err, "Failed to disable employee");
    }
  };

  const enableEmployee = async (employeeId) => {
    try {
      await axios.put(`http://localhost:8080/api/adminn/enable_employee/${employeeId}`);
      alert("Employee enabled!");
      fetchEmployees();
    } catch (err) {
      handleError(err, "Failed to enable employee");
    }
  };

  const disableAdminn = async (adminnId) => {
    try {
      await axios.put(`http://localhost:8080/api/adminn/disable_adminn/${adminnId}`);
      alert("Admin disabled!");
      fetchAdminns();
    } catch (err) {
      handleError(err, "Failed to disable admin");
    }
  };

  const enableAdminn = async (adminnId) => {
    try {
      await axios.put(`http://localhost:8080/api/adminn/enable_adminn/${adminnId}`);
      alert("Admin enabled!");
      fetchAdminns();
    } catch (err) {
      handleError(err, "Failed to enable admin");
    }
  };

  return (
    <div className="admin-dashboard">
      {/* ✅ Top bar with Upload Files button */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2>Admin Dashboard</h2>
        <button
          style={{
            backgroundColor: "#1976d2",
            color: "white",
            padding: "8px 16px",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
          onClick={() => navigate("/batterytyre-upload")}
        >
          📁 Upload Files
        </button>
      </div>

      {/* Admin Form */}
      <div className="form-section">
        <h3>Create Admin Account</h3>
        <form onSubmit={handleCreateAdmin}>
          <input
            type="text"
            placeholder="Admin Name"
            value={newAdmin.adminnName}
            onChange={(e) => setNewAdmin({ ...newAdmin, adminnName: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Admin ID"
            value={newAdmin.adminnId}
            onChange={(e) => setNewAdmin({ ...newAdmin, adminnId: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Branch"
            value={newAdmin.branch}
            onChange={(e) => setNewAdmin({ ...newAdmin, branch: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Admin Password"
            value={newAdmin.adminnPassword}
            onChange={(e) =>
              setNewAdmin({ ...newAdmin, adminnPassword: e.target.value })
            }
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
      <button className="toggle-btn" onClick={() => setShowEmployees(!showEmployees)}>
        {showEmployees ? "Hide Employees" : "View Employees"}
      </button>

      {showEmployees && (
        <div className="employee-list">
          {employees.length === 0 ? (
            <p>No employees found.</p>
          ) : (
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
                      {emp.employeeStatus === "APPROVED" ? (
                        <button onClick={() => disableEmployee(emp.employeeId)}>
                          Disable
                        </button>
                      ) : (
                        <button onClick={() => enableEmployee(emp.employeeId)}>
                          Enable
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Toggle Admin List */}
      <button className="toggle-btn" onClick={() => setShowAdminn(!showAdminn)}>
        {showAdminn ? "Hide Admins" : "View Admins"}
      </button>

      {showAdminn && (
        <div className="employee-list">
          {adminn.length === 0 ? (
            <p>No admins found.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>ID</th>
                  <th>Branch</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {adminn.map((adm) => (
                  <tr key={adm.adminnId}>
                    <td>{adm.adminnName}</td>
                    <td>{adm.adminnId}</td>
                    <td>{adm.branch}</td>
                    <td>{adm.adminnStatus}</td>
                    <td>
                      {adm.adminnStatus === "APPROVED" ? (
                        <button onClick={() => disableAdminn(adm.adminnId)}>
                          Disable
                        </button>
                      ) : (
                        <button onClick={() => enableAdminn(adm.adminnId)}>
                          Enable
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
