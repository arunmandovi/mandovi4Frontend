import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import EmployeeLogin from "./pages/EmployeeLogin";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Layout from "./components/Layout"; // ✅ Navbar + Outlet

// Employee dashboard pages
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

// Admin upload pages
import BatteryTyreUploadPage from "./pages/FileUpload/BatteryTyreUploadPage";
import BRConversionUploadPage from "./pages/FileUpload/BRConversionUploadPage";
import LabourUploadPage from "./pages/FileUpload/LabourUpload";
import LoaddUploadPage from "./pages/FileUpload/LoaddUpload";
import MGAUploadPage from "./pages/FileUpload/MGAUploadPage";
import MCPUploadPage from "./pages/FileUpload/MCPUploadPage";
import MSGPUploadPage from "./pages/FileUpload/MSGPUploadPage";
import MSGPProfitUploadPage from "./pages/FileUpload/MSGPProfitUploadPage";
import OilUploadPage from "./pages/FileUpload/OilUploadPage";
import PMSPartsUploadPage from "./pages/FileUpload/PMSPartsUploadPage";
import ProfitLossUploadPage from "./pages/FileUpload/ProfitLossUploadPage";
import ReferenceeUploadPage from "./pages/FileUpload/ReferenceeUploadPage";
import RevenueUploadPage from "./pages/FileUpload/RevenueUploadPage";
import SparesUploadPage from "./pages/FileUpload/SparesUploadPage";
import TATUploadPage from "./pages/FileUpload/TATUploadPage";
import VASUploadPage from "./pages/FileUpload/VASUploadPage";

import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        {/* 🌐 Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/EmployeeLogin" element={<EmployeeLogin />} />
        <Route path="/AdminLogin" element={<AdminLogin />} />
        <Route path="/AdminDashboard" element={<AdminDashboard />} />

        {/* ✅ Upload Page (accessible from Admin Dashboard) */}
        <Route path="/batterytyre-upload" element={<BatteryTyreUploadPage />} />
        <Route path="/brconversion-upload" element={<BRConversionUploadPage />} />
        <Route path="/labour-upload" element={<LabourUploadPage />} />
        <Route path="/loadd-upload" element ={<LoaddUploadPage />} />
        <Route path="/mcp-upload" element ={<MCPUploadPage />} />
        <Route path="/mga-upload" element ={<MGAUploadPage />} />
        <Route path="/msgp-upload" element={<MSGPUploadPage />} />
        <Route path="/msgp_profit-upload" element={<MSGPProfitUploadPage />} />
        <Route path="/oil-upload" element={<OilUploadPage />} />
        <Route path="/pms_parts-upload" element={<PMSPartsUploadPage />} />
        <Route path="/profit_loss-upload" element={<ProfitLossUploadPage />} />
        <Route path="/referencee-upload" element={<ReferenceeUploadPage />} />
        <Route path="/revenue-upload" element={<RevenueUploadPage />} />
        <Route path="/spares-upload" element={<SparesUploadPage />} />
        <Route path="/tat-upload" element={<TATUploadPage />} />
        <Route path="/vas-upload" element={<VASUploadPage />} />

        {/* 🧭 Employee Dashboard Layout */}
        <Route path="/DashboardHome" element={<Layout />}>
          {/* Default route → Battery & Tyre */}
          <Route index element={<Navigate to="battery_tyre" replace />} />

          <Route path="battery_tyre" element={<BatteryTyrePage />} />
          <Route path="br_conversion" element={<BRConversionPage />} />
          <Route path="labour" element={<LabourPage />} />
          <Route path="loadd" element={<LoaddPage />} />
          <Route path="mcp" element={<MCPPage />} />
          <Route path="mga" element={<MGAPAGE />} />
          <Route path="msgp" element={<MSGPPAge />} />
          <Route path="msgp_profit" element={<MSGPProfitPage />} />
          <Route path="oil" element={<OilPage />} />
          <Route path="pms_parts" element={<PMSPartsPage />} />
          <Route path="profit_loss" element={<ProfitLossPage />} />
          <Route path="referencee" element={<ReferenceePage />} />
          <Route path="revenue" element={<RevenuePage />} />
          <Route path="spares" element={<SparesPage />} />
          <Route path="tat" element={<TATPage />} />
          <Route path="vas" element={<VasPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
