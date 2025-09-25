import { useEffect, useState } from "react";
import axios from "axios";

function AdminLogin() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8080/api/auth/users")
      .then(res => setUsers(res.data));
  }, []);

  const approveUser = async (id) => {
    await axios.put(`http://localhost:8080/api/auth/approve/${id}`);
    setUsers(users.map(u => u.id === id ? { ...u, status: "APPROVED" } : u));
  };

  return (
    <div>
      <h2>Admin Panel</h2>
      <table>
        <thead>
          <tr><th>ID</th><th>Username</th><th>Status</th><th>Action</th></tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.username}</td>
              <td>{u.status}</td>
              <td>
                {u.status === "PENDING" && (
                  <button onClick={() => approveUser(u.id)}>Approve</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default AdminLogin;
