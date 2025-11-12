import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname.toLowerCase();

  const handleLogout = () => {
    navigate("/EmployeeLogin");
  };

  // ✅ Determine view mode (normal / bar-chart / branches-bar-chart)
  let viewMode = "default";
  if (currentPath.includes("branches-bar-chart")) viewMode = "branches-bar-chart";
  else if (currentPath.includes("bar-chart")) viewMode = "bar-chart";

  // ✅ All dashboard modules
  const modules = [
    "loadd",
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

  // ✅ Build dynamic link
  const buildLink = (module) => {
    if (viewMode === "bar-chart") return `/DashboardHome/${module}-bar-chart`;
    if (viewMode === "branches-bar-chart")
      return `/DashboardHome/${module}_branches-bar-chart`;
    return `/DashboardHome/${module}`;
  };

  return (
    <div className="layout-container">
      <nav className="navbar">
        {modules.map((module) => (
          <Link key={module} to={buildLink(module)}>
            {formatLabel(module)}
          </Link>
        ))}

        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </nav>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

// ✅ Label formatter with readable titles
function formatLabel(name) {
  const specialCases = {
    loadd: "Load",
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
