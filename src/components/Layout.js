import { Link, Outlet, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

function Layout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/EmployeeLogin");
  };

  return (
    <div className="layout-container">
      {/* Navbar */}
      <nav className="navbar">
        <Link to="/DashboardHome/br_conversion">BR Conversion</Link>
        <Link to="/DashboardHome/battery_tyre">Battery & Tyre</Link>
        <Link to="/DashboardHome/labour">Labour</Link>
        <Link to="/DashboardHome/loadd">Load</Link>
        <Link to="/DashboardHome/mcp">MCP</Link>
        <Link to="/DashboardHome/mga">MGA</Link>
        <Link to="/DashboardHome/msgp">MSGP</Link>
        <Link to="/DashboardHome/msgp_profit">MSGP Profit</Link>
        <Link to="/DashboardHome/oil">Oil</Link>
        <Link to="/DashboardHome/pms_parts">PMS Parts</Link>
        <Link to="/DashboardHome/profit_loss">Profit & Loss</Link>
        <Link to="/DashboardHome/referencee">Reference</Link>
        <Link to="/DashboardHome/revenue">Revenue</Link>
        <Link to="/DashboardHome/spares">Spares</Link>
        <Link to="/DashboardHome/tat">TAT</Link>
        <Link to="/DashboardHome/vas">VAS</Link>

        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </nav>

      {/* Page Content */}
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
