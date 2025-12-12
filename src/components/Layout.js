import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import { useState, useEffect } from "react";
import "../styles/Navbar.css";

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname.toLowerCase();

  const [menuOpen, setMenuOpen] = useState(false);

  // 🔥 Reset activity timestamp when user navigates to another page
  useEffect(() => {
    localStorage.setItem("employeeLastActive", Date.now());
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("employeeToken");
    localStorage.removeItem("employeeLastActive");

    // Hard redirect so route protection always runs
    window.location.href = "/EmployeeLogin";
  };

  const modeMap = {
    "branches-bar-chart": "branches-bar-chart",
    "branches": "branches",
    "bar-chart": "bar-chart",
  };

  const viewMode =
    Object.entries(modeMap).find(([key]) => currentPath.includes(key))?.[1] ||
    "default";

  const modules = [
    "loadd",
    "hold_up",
    "productivity",
    "due_done",
    "per_vehicle",
    "br_conversion",
    "labour",
    "spares",
    "vas",
    "msgp",
    "msgp_profit",
    "revenue",
    "oil",
    "battery_tyre",
    "pms_parts",
    "mga",
    "mga_profit",
    "tat",
    "mcp",
    "referencee",
    "profit_loss",
  ];

  const linkMap = {
    "bar-chart": (m) => `/DashboardHome/${m}-bar-chart`,
    "branches-bar-chart": (m) => `/DashboardHome/${m}_branches-bar-chart`,
    "branches": (m) => `/DashboardHome/${m}_branches`,
  };
  
  const buildLink = (module) =>
    (linkMap[viewMode] ? linkMap[viewMode](module) : `/DashboardHome/${module}`);

  return (
    <div className="layout-container">
      <nav className="navbar">

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>

        <div className={`nav-links ${menuOpen ? "show" : ""}`}>
          {modules.map((module) => (
            <Link
              key={module}
              to={buildLink(module)}
              onClick={() => setMenuOpen(false)}
            >
              {formatLabel(module)}
            </Link>
          ))}
        </div>

        <Button
          variant="contained"
          color="error"
          onClick={handleLogout}
          sx={{ ml: 2 }}
        >
          Logout
        </Button>
      </nav>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

function formatLabel(name) {
  const specialCases = {
    loadd: "Load",
    hold_up: "Hold UP",
    productivity: "Productivity",
    due_done: "Due VS Done",
    per_vehicle: "Per Vehicle",
    br_conversion: "BR Conversion",
    battery_tyre: "Battery & Tyre",
    msgp_profit: "MSGP Profit",
    mga_profit: "MGA PROFIT",
    profit_loss: "Profit & Loss",
    vas: "VAS",
    msgp: "MSGP",
    pms_parts: "PMS Parts",
    mga: "MGA",
    tat: "TAT",
    mcp: "MCP",
  };

  if (specialCases[name]) return specialCases[name];

  return name
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

export default Layout;
