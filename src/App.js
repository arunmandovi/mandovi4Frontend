import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import BatteryTyrePage from "./pages/BatteryTyrePage";
import BRConversionPage from "./pages/BRConversionPage";
import LabourPage from "./pages/LabourPage";
import LoaddPage from "./pages/LoaddPage";
import MCPPage from "./pages/MCPPage";
import MGAPage from "./pages/MGAPage";
import MSGPPage from "./pages/MSGPPage";
import MSGPProfitPage from "./pages/MSGPProfitPage";
import OilPage from "./pages/OilPage";
import PMSPartsPage from "./pages/PMSPartsPage";
import ProfitLossPage from "./pages/ProfitLossPage";
import ReferenceePage from "./pages/ReferenceePage";
import RevenuePage from "./pages/RevenuePage";
import SparesPage from "./pages/SparesPage";
import TATPage from "./pages/TATPage";
import VasPage from "./pages/VasPage";
import "./styles/App.css";
import "./styles/Home.css";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} /> {/* default page */}
          <Route path="/battery_tyre" element={<BatteryTyrePage />} />
          <Route path="/br_conversion" element={<BRConversionPage />}/>
          <Route path="/labour" element={<LabourPage />} />
          <Route path="/loadd" element={<LoaddPage />} />
          <Route path="/mcp" element={<MCPPage />} />
          <Route path="/mga" element={<MGAPage />} />
          <Route path="/msgp" element={<MSGPPage />} />
          <Route path="/msgp_profit" element={<MSGPProfitPage />} />
          <Route path="/oil" element={<OilPage />} />
          <Route path="/pms_parts" element={<PMSPartsPage />} />
          <Route path="/profit_loss" element={<ProfitLossPage />} />
          <Route path="/referencee" element={<ReferenceePage />} />
          <Route path="/revenue" element={<RevenuePage />} />
          <Route path="/spares" element={<SparesPage />} />
          <Route path="/tat" element={<TATPage />} />
          <Route path="/vas" element={<VasPage />} />
        </Routes>
      </div>
    </Router>
  );
}

// Home page with styled module links
function Home() {
  return (
    <div className="home-container">
      <h2 className="title"> <u>Mandovi Excel Upload & Viewer</u></h2>
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
    </div>
  );
}

export default App;
