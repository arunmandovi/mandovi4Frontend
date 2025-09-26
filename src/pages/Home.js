import { Link } from "react-router-dom";
import "../styles/Home.css";

function Home() {
  return (
    <div className="home-container">
      <div className="home-card">
        <h2>Welcome to Mandovi Portal</h2>
        <ul>
          <li><Link to="/EmployeeLogin">Login</Link></li>
          <li><Link to="/AdminLogin">Admin Login</Link></li>
        </ul>
      </div>
    </div>
  );
}

export default Home;
