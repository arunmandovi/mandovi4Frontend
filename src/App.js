import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import EmployeeLogin from "./pages/EmployeeLogin";
import AdminLogin from "./pages/AdminPages/AdminLogin";
import AdminDashboard from "./pages/AdminPages/AdminDashboard";
import Layout from "./components/Layout"; // ✅ Navbar + Outlet

// Employee dashboard graph pages
import BatteryTyrePage from "./pages/GraphView/BatteryTyrePage";
import BRConversionPage from "./pages/GraphView/BRConversionPage";
import LabourPage from "./pages/GraphView/LabourPage";
import LoaddPage from "./pages/GraphView/LoaddPage";
import MCPPage from "./pages/GraphView/MCPPage";
import MGAPage from "./pages/GraphView/MGAPage";
import MSGPPage from "./pages/GraphView/MSGPPage";
import MSGPProfitPage from "./pages/GraphView/MSGPProfitPage";
import OilPage from "./pages/GraphView/OilPage";
import PMSPartsPage from "./pages/GraphView/PMSPartsPage";
import ProfitLossPage from "./pages/GraphView/ProfitLossPage";
import ReferenceePage from "./pages/GraphView/ReferenceePage";
import RevenuePage from "./pages/GraphView/RevenuePage";
import SparesPage from "./pages/GraphView/SparesPage";
import TATPage from "./pages/GraphView/TATPage";
import VASPage from "./pages/GraphView/VASPage";

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

// Employee Dashboard BarChart Pages
import BatteryTyreBarChartPage from "./pages/BarChartView/BatteryTyreBarChartPage";
import BRConversionBarChartPage from "./pages/BarChartView/BRConversionBarChartPage";
import LabourBarChartPage from "./pages/BarChartView/LabourBarChartPage";
import LoaddBarChartPage from "./pages/BarChartView/LoaddBarChartPage";
import MCPBarChartPage from "./pages/BarChartView/MCPBarChartPage";
import MGABarChartPage from "./pages/BarChartView/MGABarChartPage";
import MSGPBarChartPage from "./pages/BarChartView/MSGPBarChartPage";
import MSGPProfitBarChartPage from "./pages/BarChartView/MSGPProfitBarChartPage";
import OilBarChartPage from "./pages/BarChartView/OilBarChartPage";
import PMSPartsBarChartPage from "./pages/BarChartView/PMSPartsBarChartPage";
import ReferenceeBarChartPage from "./pages/BarChartView/ReferenceeBarChartPage";
import RevenueBarChartPage from "./pages/BarChartView/RevenueBarChartPage";
import SparesBarChartPage from "./pages/BarChartView/SparesBarChartPage";
import TATBarChartPage from "./pages/BarChartView/TATBarChartPage";
import VASBarChartPage from "./pages/BarChartView/VASBarChartPage";


// BranchWise BarChart Pages
import BatteryTyreBranchesBarChartPage from "./pages/BranchWiseBarChartView/BatteryTyreBranchesBarChartPage";
import BRConversionBranchesBarChartPage from "./pages/BranchWiseBarChartView/BRConversionBranchesBarChartPage";
import LabourBranchesBarChartPage from "./pages/BranchWiseBarChartView/LabourBranchesBarChartPage";
import LoaddBranchesBarChartPage from "./pages/BranchWiseBarChartView/LoaddBranchesBarChartPage";
import MSGPBranchesBarChartPage from "./pages/BranchWiseBarChartView/MSGPBranchesBarChartPage";
import MSGPProfitBranchesBarChartPage from "./pages/BranchWiseBarChartView/MSGPProfitBranchesBarChartPage";
import OilBranchesBarChartPage from "./pages/BranchWiseBarChartView/OilBranchesBarChartPage";
import PMSPartsBranchesBarChartPage from "./pages/BranchWiseBarChartView/PMSPartsBranchesBarChartPage";
import ReferenceeeBranchesBarChartPage from "./pages/BranchWiseBarChartView/ReferenceeBranchesBarChartPage";
import RevenueBranchesBarChartPage from "./pages/BranchWiseBarChartView/RevenueBranchesBarChartPage";
import SparesBranchesBarChartPage from "./pages/BranchWiseBarChartView/SparesBranchesBarChartPage";
import TATBranchesBarChartPage from "./pages/BranchWiseBarChartView/TATBranchesBarChartPage";
import VASBranchesBarChartPage from "./pages/BranchWiseBarChartView/VASBranchesBarChartPage";

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

        {/* ✅ BranchWise GraphView Page */}

        {/* 🧭 Employee Dashboard Layout */}
        <Route path="/DashboardHome" element={<Layout />}>
          {/* Default route → Battery & Tyre */}
          <Route index element={<Navigate to="battery_tyre" replace />} />

          {/* 🧭 Employee Dashboard Pages */}
          <Route path="battery_tyre" element={<BatteryTyrePage />} />
          <Route path="br_conversion" element={<BRConversionPage />} />
          <Route path="labour" element={<LabourPage />} />
          <Route path="loadd" element={<LoaddPage />} />
          <Route path="mcp" element={<MCPPage />} />
          <Route path="mga" element={<MGAPage />} />
          <Route path="msgp" element={<MSGPPage />} />
          <Route path="msgp_profit" element={<MSGPProfitPage />} />
          <Route path="oil" element={<OilPage />} />
          <Route path="pms_parts" element={<PMSPartsPage />} />
          <Route path="profit_loss" element={<ProfitLossPage />} />
          <Route path="referencee" element={<ReferenceePage />} />
          <Route path="revenue" element={<RevenuePage />} />
          <Route path="spares" element={<SparesPage />} />
          <Route path="tat" element={<TATPage />} />
          <Route path="vas" element={<VASPage />} />

          {/* 🧭 Employee Dashboard BarChart Pages */}
          <Route path="battery_tyre-bar-chart" element={<BatteryTyreBarChartPage />} />
          <Route path="br_conversion-bar-chart" element={<BRConversionBarChartPage />} />
          <Route path="labour-bar-chart" element={<LabourBarChartPage />} />
          <Route path="loadd-bar-chart" element={<LoaddBarChartPage />} />
          <Route path="mcp-bar-chart" element={<MCPBarChartPage />} />
          <Route path="mga-bar-chart" element={<MGABarChartPage />} />          
          <Route path="msgp-bar-chart" element={<MSGPBarChartPage />} />
          <Route path="msgp_profit-bar-chart" element={<MSGPProfitBarChartPage />} />
          <Route path="oil-bar-chart" element={<OilBarChartPage />} />
          <Route path="pms_parts-bar-chart" element={<PMSPartsBarChartPage />} />
          <Route path="referencee-bar-chart" element={<ReferenceeBarChartPage />} />
          <Route path="revenue-bar-chart" element={<RevenueBarChartPage />} />
          <Route path="spares-bar-chart" element={<SparesBarChartPage />} />
          <Route path="tat-bar-chart" element={<TATBarChartPage />} />
          <Route path="vas-bar-chart" element={<VASBarChartPage />} />

          {/* 🧭 BranchWise Graph Pages */}
          <Route path="battery_tyre_branches-bar-chart" element={<BatteryTyreBranchesBarChartPage />} />
          <Route path="br_conversion_branches-bar-chart" element={<BRConversionBranchesBarChartPage />} />
          <Route path="labour_branches-bar-chart" element={<LabourBranchesBarChartPage />} />
          <Route path="loadd_branches-bar-chart" element={<LoaddBranchesBarChartPage />} />
          <Route path="msgp_branches-bar-chart" element={<MSGPBranchesBarChartPage />} />
          <Route path="msgp_profit_branches-bar-chart" element={<MSGPProfitBranchesBarChartPage />} />
          <Route path="oil_branches-bar-chart" element={<OilBranchesBarChartPage />} />
          <Route path="pms_parts_branches-bar-chart" element={<PMSPartsBranchesBarChartPage />} />
          <Route path="referencee_branches-bar-chart" element={<ReferenceeeBranchesBarChartPage />} />
          <Route path="revenue_branches-bar-chart" element={<RevenueBranchesBarChartPage />} />
          <Route path="spares_branches-bar-chart" element={<SparesBranchesBarChartPage />} />
          <Route path="tat_branches-bar-chart" element={<TATBranchesBarChartPage />} />
          <Route path="vas_branches-bar-chart" element={<VASBranchesBarChartPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
