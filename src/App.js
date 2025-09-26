import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import EmployeeLogin from "./pages/EmployeeLogin";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import DashboardHome from "./pages/DashboardHome";
import BatteryTyrePage from "./pages/BatteryTyrePage";
import BRConversionPage from "./pages/BRConversionPage";
import LabourPage from "./pages/LabourPage";
import LoaddPage from "./pages/LoaddPage";
import MCPPage from "./pages/MCPPage";
import MGAPAGE from "./pages/MGAPage";
import MSGPPAge from "./pages/MSGPPage";
import MSGPProfitPage from "./pages/MSGPProfitPage";
import OilPage from "./pages/OilPage";
import PMSPartsPage from "./pages/PMSPartsPage";
import ProfitLossPage from "./pages/ProfitLossPage";
import ReferenceePage from "./pages/ReferenceePage";
import RevenuePage from "./pages/RevenuePage";
import SparesPage from "./pages/SparesPage";
import TATPage from "./pages/TATPage";
import VasPage from "./pages/VasPage";
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} /> 
        <Route path="/EmployeeLogin" element={<EmployeeLogin />} />
        <Route path="/AdminLogin" element={<AdminLogin />} />
        <Route path="/AdminDashboard" element={<AdminDashboard />} />
        <Route path="/DashboardHome" element={<DashboardHome />} />
        <Route path="/battery_tyre" element={<BatteryTyrePage />} />
        <Route path="/br_conversion" element={<BRConversionPage />} />
        <Route path="/labour" element={<LabourPage />} />
        <Route path="/loadd" element={<LoaddPage />} />
        <Route path="/mcp" element={<MCPPage />} />
        <Route path="/mga" element={<MGAPAGE />} />
        <Route path="/msgp" element={<MSGPPAge />} />
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
    </Router>
  );
}

export default App;
