import { Link, Outlet, useLocation } from "react-router-dom";
import { Button } from "@mui/material";
import { useState, useEffect } from "react";
import "../styles/Navbar.css";

function Layout() {
  const location = useLocation();
  const currentPath = location.pathname.toLowerCase();

  const [menuOpen, setMenuOpen] = useState(false);

  /* ---------- ACTIVITY TRACKING ---------- */
  useEffect(() => {
    localStorage.setItem("employeeLastActive", Date.now());
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("employeeToken");
    localStorage.removeItem("employeeLastActive");
    window.location.href = "/EmployeeLogin";
  };

  /* ---------- CURRENT VIEW MODE ---------- */
  const VIEW_MODES = {
    "branches-bar-chart": "branches-bar-chart",
    "branches": "branches",
    "bar-chart": "bar-chart",
  };

  const viewMode =
    Object.entries(VIEW_MODES).find(([key]) =>
      currentPath.includes(key)
    )?.[1] || null;

  /* ---------- ALL MODULES ---------- */
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
    "cc_conversion",
    "sa_conversion",
    "sales",
    "servicee",
    "sales_servicee_growth",
    "total_branch_outstanding",
  ];

  /* ---------- MODULE → SUPPORTED VIEW MODES ---------- */
  /* THIS MUST MATCH YOUR App.js ROUTES */
  const MODULE_VIEW_SUPPORT = {
    loadd: ["bar-chart", "branches", "branches-bar-chart"],
    hold_up: ["bar-chart", "branches", "branches-bar-chart"],
    productivity: ["bar-chart", "branches"],
    due_done: ["bar-chart"],
    per_vehicle: ["bar-chart"],
    br_conversion: ["bar-chart", "branches"],
    labour: ["bar-chart"],
    spares: ["bar-chart"],
    vas: ["bar-chart"],
    msgp: ["bar-chart"],
    msgp_profit: ["bar-chart"],
    revenue: ["bar-chart"],
    oil: ["bar-chart"],
    battery_tyre: ["bar-chart"],
    pms_parts: ["bar-chart"],
    mga: ["bar-chart"],
    mga_profit: ["bar-chart"],
    tat: ["bar-chart"],
    mcp: ["bar-chart"],
    referencee: ["bar-chart"],
    profit_loss: ["bar-chart"],
    cc_conversion: ["bar-chart"],
    sa_conversion: ["bar-chart"],
    sales: ["bar-chart"],
    servicee: ["bar-chart"],
    sales_servicee_growth: ["bar-chart"], // ❗ NO branches-bar-chart
  };

  /* ---------- LINK BUILDERS ---------- */
  const linkMap = {
    "bar-chart": (m) => `/DashboardHome/${m}-bar-chart`,
    "branches": (m) => `/DashboardHome/${m}_branches`,
    "branches-bar-chart": (m) =>
      `/DashboardHome/${m}_branches-bar-chart`,
  };

  /* ---------- SAFE LINK RESOLUTION ---------- */
  const buildLink = (module) => {
    if (!viewMode) {
      return `/DashboardHome/${module}`;
    }

    const supportedModes = MODULE_VIEW_SUPPORT[module] || [];

    // ❌ If module does NOT support current view → fallback
    if (!supportedModes.includes(viewMode)) {
      return `/DashboardHome/${module}`;
    }

    // ✅ Supported view
    return linkMap[viewMode]?.(module) || `/DashboardHome/${module}`;
  };

  return (
    <div className="layout-container">
      <nav className="navbar">
        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
        >
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

/* ---------- LABEL FORMATTER ---------- */
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
    mga_profit: "MGA Profit",
    profit_loss: "Profit & Loss",
    cc_conversion: "CC Conversion",
    sa_conversion: "SA Conversion",
    vas: "VAS",
    msgp: "MSGP",
    pms_parts: "PMS Parts",
    mga: "MGA",
    tat: "TAT",
    mcp: "MCP",
    sales: "Sales",
    servicee: "Service",
    sales_servicee_growth: "Sales & Service",
    total_branch_outstanding: "Outstanding",
  };

  if (specialCases[name]) return specialCases[name];

  return name
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

export default Layout;
