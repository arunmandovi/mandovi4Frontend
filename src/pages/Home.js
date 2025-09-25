import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home-container">
      <h2>Welcome to Mandovi Portal</h2>
      <ul>
        <li><Link to="/register">Register</Link></li>
        <li><Link to="/login">Login</Link></li>
        <li><Link to="/admin">Admin Login</Link></li>
      </ul>
    </div>
  );
}
export default Home;
