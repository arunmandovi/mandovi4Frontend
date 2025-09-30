import { Link, useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

function AdminnHome() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/EmployeeLogin"); 
  };

  return (
    <div className="home-container">

      <h2 className="title">
        <u>MANDOVI SERVICE REPORT</u>
      </h2>

      {/* Row 1 */}
      <ul className="module-list">
        <li>
          <Link to="/battery_tyre" className="module-link">
            Battery & Tyre
          </Link>
        </li>
        <li>
          <Link to="/br_conversion" className="module-link">
            BR Conversion
          </Link>
        </li>
        <li>
          <Link to="/labour" className="module-link">
            Labour
          </Link>
        </li>
        <li>
          <Link to="/loadd" className="module-link">
            Load
          </Link>
        </li>
      </ul>

      {/* Row 2 */}
      <ul className="module-list">
        <li>
          <Link to="/mcp" className="module-link">
            MCP
          </Link>
        </li>
        <li>
          <Link to="/mga" className="module-link">
            MGA
          </Link>
        </li>
        <li>
          <Link to="/msgp" className="module-link">
            MSGP
          </Link>
        </li>
        <li>
          <Link to="/msgp_profit" className="module-link">
            MSGP Profit
          </Link>
        </li>
      </ul>

      {/* Row 3 */}
      <ul className="module-list">
        <li>
          <Link to="/oil" className="module-link">
            Oil
          </Link>
        </li>
        <li>
          <Link to="/pms_parts" className="module-link">
            PMS Parts
          </Link>
        </li>
        <li>
          <Link to="/profit_loss" className="module-link">
            Profit & Loss
          </Link>
        </li>
        <li>
          <Link to="/referencee" className="module-link">
            Reference
          </Link>
        </li>
      </ul>

      {/* Row 4 */}
      <ul className="module-list">
        <li>
          <Link to="/revenue" className="module-link">
            Revenue
          </Link>
        </li>
        <li>
          <Link to="/spares" className="module-link">
            Spares
          </Link>
        </li>
        <li>
          <Link to="/tat" className="module-link">
            TAT
          </Link>
        </li>
        <li>
          <Link to="/vas" className="module-link">
            VAS
          </Link>
        </li>
      </ul>
      {/* Logout button */}
      <div className="logout-container">
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default AdminnHome;
