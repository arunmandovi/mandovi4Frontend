import { Link, Outlet, useLocation } from "react-router-dom";
import { Button } from "@mui/material";
import { useState, useEffect } from "react";
import "../styles/Navbar.css";

function Layout() {
  const location = useLocation();
  const currentPath = location.pathname.toLowerCase();

  const [menuOpen, setMenuOpen] = useState(false);

  /* ---------- ACTIVITY TRACK ---------- */
  useEffect(() => {
    localStorage.setItem("employeeLastActive", Date.now());
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("employeeToken");
    localStorage.removeItem("employeeLastActive");
    window.location.href = "/EmployeeLogin";
  };

  /* ---------- CURRENT VIEW MODE ---------- */
  const modeMap = {
    "branches-bar-chart": "branches-bar-chart",
    "_branches": "branches",
    "-bar-chart": "bar-chart",
  };

  const viewMode =
    Object.entries(modeMap).find(([key]) => currentPath.includes(key))?.[1] ||
    "default";

  /* ---------- MODULE LIST ---------- */
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
    "outstanding",
    "cc_conversion",
  ];

  /* ---------- MODULE → SUPPORTED MODES ---------- */
  const moduleModes = {
    // full support
    spares: ["default", "bar-chart", "branches", "branches-bar-chart"],
    labour: ["default", "bar-chart", "branches", "branches-bar-chart"],
    vas: ["default", "bar-chart", "branches"],
    msgp: ["default", "bar-chart"],
    revenue: ["default", "bar-chart"],
    outstanding: ["default", "bar-chart"],

    // only base page
    cc_conversion: ["default"],
    profit_loss: ["default"],
    tat: ["default"],
    mcp: ["default"],

    // fallback: if not listed → default only
  };

  /* ---------- LINK BUILDERS ---------- */
  const linkBuilders = {
    "bar-chart": (m) => `/DashboardHome/${m}-bar-chart`,
    branches: (m) => `/DashboardHome/${m}_branches`,
    "branches-bar-chart": (m) => `/DashboardHome/${m}_branches-bar-chart`,
    default: (m) => `/DashboardHome/${m}`,
  };

  /* ---------- SMART LINK RESOLUTION ---------- */
  const buildLink = (module) => {
    const supportedModes = moduleModes[module] || ["default"];

    // keep current mode ONLY if module supports it
    if (supportedModes.includes(viewMode)) {
      return linkBuilders[viewMode](module);
    }

    // otherwise fallback to base page
    return linkBuilders.default(module);
  };

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

/* ---------- LABEL FORMAT ---------- */
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
    outstanding: "OutStanding",
    cc_conversion: "CC Conversion",
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
