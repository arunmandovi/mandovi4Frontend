import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import ProtectedRoute from "./utils/ProtectedRoute";
import AdminProtectedRoute from "./utils/AdminProtectedRoute";
import EmployeeLogin from "./pages/EmployeeLogin";
import AdminLogin from "./pages/AdminPages/AdminLogin";
import AdminDashboard from "./pages/AdminPages/AdminDashboard";
import Layout from "./components/Layout"; // ✅ Navbar + Outlet

// Employee dashboard graph pages
import BatteryTyrePage from "./pages/GraphView/BatteryTyrePage";
import BRConversionPage from "./pages/GraphView/BRConversionPage";
import LabourPage from "./pages/GraphView/LabourPage";
import PerVehiclePage from "./pages/GraphView/PerVehiclePage";
import LoaddPage from "./pages/GraphView/LoaddPage";
import MCPPage from "./pages/GraphView/MCPPage";
import MGAPage from "./pages/GraphView/MGAPage";
import MGAProfitPage from "./pages/GraphView/MGAProfitPage";
import MSGPPage from "./pages/GraphView/MSGPPage";
import MSGPProfitPage from "./pages/GraphView/MSGPProfitPage";
import OilPage from "./pages/GraphView/OilPage";
import PMSPartsPage from "./pages/GraphView/PMSPartsPage";
import ProfitLossPage from "./pages/GraphView/ProfitLossPage";
import ProfitLossSRBRLoaddPage from "./pages/GraphView/ProfitLossSRBRLoadd";
import ProfitLossMonthlyGraphPage from "./pages/GraphView/ProfitLossMonthlyGraphPage";
import ProfitLossPerVehicleGraphPage from "./pages/GraphView/ProfitLossPerVehicleGraphPage";
import ReferenceePage from "./pages/GraphView/ReferenceePage";
import RevenuePage from "./pages/GraphView/RevenuePage";
import SparesPage from "./pages/GraphView/SparesPage";
import TATPage from "./pages/GraphView/TATPage";
import VASPage from "./pages/GraphView/VASPage";

// Admin upload pages
import BatteryTyreUploadPage from "./pages/FileUpload/BatteryTyreUploadPage";
import BRConversionUploadPage from "./pages/FileUpload/BRConversionUploadPage";
import LabourUploadPage from "./pages/FileUpload/LabourUpload";
import LoaddUploadPage from "./pages/FileUpload/LoaddUploadPage";
import MGAUploadPage from "./pages/FileUpload/MGAUploadPage";
import MGAProfitUploadPage from "./pages/FileUpload/MGAProfitUploadPage";
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
import PerVehicleBarChartPage from "./pages/BarChartView/PerVehicleBarChartPage";
import LoaddBarChartPage from "./pages/BarChartView/LoaddBarChartPage";
import MCPBarChartPage from "./pages/BarChartView/MCPBarChartPage";
import MGABarChartPage from "./pages/BarChartView/MGABarChartPage";
import MGAProfitBarChartPage from "./pages/BarChartView/MGAProfitBarChartPage";
import MSGPBarChartPage from "./pages/BarChartView/MSGPBarChartPage";
import MSGPProfitBarChartPage from "./pages/BarChartView/MSGPProfitBarChartPage";
import OilBarChartPage from "./pages/BarChartView/OilBarChartPage";
import PMSPartsBarChartPage from "./pages/BarChartView/PMSPartsBarChartPage";
import ProfitLossBarChartPage from "./pages/BarChartView/ProfitLossBarChartPage";
import ReferenceeBarChartPage from "./pages/BarChartView/ReferenceeBarChartPage";
import RevenueBarChartPage from "./pages/BarChartView/RevenueBarChartPage";
import SparesBarChartPage from "./pages/BarChartView/SparesBarChartPage";
import TATBarChartPage from "./pages/BarChartView/TATBarChartPage";
import VASBarChartPage from "./pages/BarChartView/VASBarChartPage";


// BranchWise BarChart Pages
import BatteryTyreBranchesBarChartPage from "./pages/BranchWiseBarChartView/BatteryTyreBranchesBarChartPage";
import BRConversionBranchesBarChartPage from "./pages/BranchWiseBarChartView/BRConversionBranchesBarChartPage";
import LabourBranchesBarChartPage from "./pages/BranchWiseBarChartView/LabourBranchesBarChartPage";
import PerVehicleBranchesBarChartPage from "./pages/BranchWiseBarChartView/PerVehicleBranchesBarChartPage";
import LoaddBranchesBarChartPage from "./pages/BranchWiseBarChartView/LoaddBranchesBarChartPage";
import MCPBranchesBarChartPage from "./pages/BranchWiseBarChartView/MCPBranchesBarChartPage";
import MGABranchesBarChartPage from "./pages/BranchWiseBarChartView/MGABranchesBarChartPage";
import MGAProfitBranchesBarChartPage from "./pages/BranchWiseBarChartView/MGAProfitBranchesBarChartPage";
import MSGPBranchesBarChartPage from "./pages/BranchWiseBarChartView/MSGPBranchesBarChartPage";
import MSGPProfitBranchesBarChartPage from "./pages/BranchWiseBarChartView/MSGPProfitBranchesBarChartPage";
import OilBranchesBarChartPage from "./pages/BranchWiseBarChartView/OilBranchesBarChartPage";
import PMSPartsBranchesBarChartPage from "./pages/BranchWiseBarChartView/PMSPartsBranchesBarChartPage";
import ProfitLossBranchesBarChartPage from "./pages/BranchWiseBarChartView/ProfitLossBranchesBarChartPage";
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
        <Route 
          path="/AdminDashboard" 
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          } 
        />

        {/* ✅ Upload Page (accessible from Admin Dashboard) */}
        <Route path="/batterytyre-upload" element={ <AdminProtectedRoute> <BatteryTyreUploadPage /> </AdminProtectedRoute> } />
        <Route path="/brconversion-upload" element={ <AdminProtectedRoute> <BRConversionUploadPage /> </AdminProtectedRoute> } />
        <Route path="/labour-upload" element={ <AdminProtectedRoute><LabourUploadPage /></AdminProtectedRoute> } />
        <Route path="/loadd-upload" element={ <AdminProtectedRoute><LoaddUploadPage /></AdminProtectedRoute> } />
        <Route path="/mcp-upload" element={ <AdminProtectedRoute><MCPUploadPage /></AdminProtectedRoute> } />
        <Route path="/mga-upload" element={ <AdminProtectedRoute><MGAUploadPage /></AdminProtectedRoute> } />
        <Route path="/mga_profit-upload" element={ <AdminProtectedRoute><MGAProfitUploadPage /></AdminProtectedRoute> } />
        <Route path="/msgp-upload" element={ <AdminProtectedRoute><MSGPUploadPage /></AdminProtectedRoute> } />
        <Route path="/msgp_profit-upload" element={ <AdminProtectedRoute><MSGPProfitUploadPage /></AdminProtectedRoute> } />
        <Route path="/oil-upload" element={ <AdminProtectedRoute><OilUploadPage /></AdminProtectedRoute> } />
        <Route path="/pms_parts-upload" element={ <AdminProtectedRoute><PMSPartsUploadPage /></AdminProtectedRoute> } />
        <Route path="/profit_loss-upload" element={ <AdminProtectedRoute><ProfitLossUploadPage /></AdminProtectedRoute> } />
        <Route path="/referencee-upload" element={ <AdminProtectedRoute><ReferenceeUploadPage /></AdminProtectedRoute> } />
        <Route path="/revenue-upload" element={ <AdminProtectedRoute><RevenueUploadPage /></AdminProtectedRoute> } />
        <Route path="/spares-upload" element={ <AdminProtectedRoute><SparesUploadPage /></AdminProtectedRoute> } />
        <Route path="/tat-upload" element={ <AdminProtectedRoute><TATUploadPage /></AdminProtectedRoute> } />
        <Route path="/vas-upload" element={ <AdminProtectedRoute><VASUploadPage /></AdminProtectedRoute> } />

        {/* 🧭 Employee Dashboard Layout */}
        <Route 
          path="/DashboardHome" 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Default route → Battery & Tyre */}
          <Route index element={<Navigate to="battery_tyre" replace />} />

          {/* 🧭 Employee Dashboard Pages */}
          <Route path="battery_tyre" element={<BatteryTyrePage />} />
          <Route path="br_conversion" element={<BRConversionPage />} />
          <Route path="labour" element={<LabourPage />} />
          <Route path="per_vehicle" element={<PerVehiclePage />} />
          <Route path="loadd" element={<LoaddPage />} />
          <Route path="mcp" element={<MCPPage />} />
          <Route path="mga" element={<MGAPage />} />
          <Route path="mga_profit" element={<MGAProfitPage />} />
          <Route path="msgp" element={<MSGPPage />} />
          <Route path="msgp_profit" element={<MSGPProfitPage />} />
          <Route path="oil" element={<OilPage />} />
          <Route path="pms_parts" element={<PMSPartsPage />} />
          <Route path="profit_loss" element={<ProfitLossPage />} />
          <Route path="profit_loss_srbr" element={<ProfitLossSRBRLoaddPage />} />
          <Route path="profit_loss_monthly" element={<ProfitLossMonthlyGraphPage />} />
          <Route path="profit_loss_per_vehicle" element={<ProfitLossPerVehicleGraphPage />} />
          <Route path="referencee" element={<ReferenceePage />} />
          <Route path="revenue" element={<RevenuePage />} />
          <Route path="spares" element={<SparesPage />} />
          <Route path="tat" element={<TATPage />} />
          <Route path="vas" element={<VASPage />} />

          {/* 🧭 Employee Dashboard BarChart Pages */}
          <Route path="battery_tyre-bar-chart" element={<BatteryTyreBarChartPage />} />
          <Route path="br_conversion-bar-chart" element={<BRConversionBarChartPage />} />
          <Route path="labour-bar-chart" element={<LabourBarChartPage />} />
          <Route path="per_vehicle-bar-chart" element={<PerVehicleBarChartPage />} />
          <Route path="loadd-bar-chart" element={<LoaddBarChartPage />} />
          <Route path="mcp-bar-chart" element={<MCPBarChartPage />} />
          <Route path="mga-bar-chart" element={<MGABarChartPage />} />
          <Route path="mga_profit-bar-chart" element={<MGAProfitBarChartPage />} />        
          <Route path="msgp-bar-chart" element={<MSGPBarChartPage />} />
          <Route path="msgp_profit-bar-chart" element={<MSGPProfitBarChartPage />} />
          <Route path="oil-bar-chart" element={<OilBarChartPage />} />
          <Route path="pms_parts-bar-chart" element={<PMSPartsBarChartPage />} />
          <Route path="profit_loss-bar-chart" element={<ProfitLossBarChartPage />} />
          <Route path="referencee-bar-chart" element={<ReferenceeBarChartPage />} />
          <Route path="revenue-bar-chart" element={<RevenueBarChartPage />} />
          <Route path="spares-bar-chart" element={<SparesBarChartPage />} />
          <Route path="tat-bar-chart" element={<TATBarChartPage />} />
          <Route path="vas-bar-chart" element={<VASBarChartPage />} />

          {/* 🧭 BranchWise BarChart Pages */}
          <Route path="battery_tyre_branches-bar-chart" element={<BatteryTyreBranchesBarChartPage />} />
          <Route path="br_conversion_branches-bar-chart" element={<BRConversionBranchesBarChartPage />} />
          <Route path="labour_branches-bar-chart" element={<LabourBranchesBarChartPage />} />
          <Route path="per_vehicle_branches-bar-chart" element={<PerVehicleBranchesBarChartPage />} />
          <Route path="loadd_branches-bar-chart" element={<LoaddBranchesBarChartPage />} />
          <Route path="mcp_branches-bar-chart" element={<MCPBranchesBarChartPage />} />
          <Route path="mga_branches-bar-chart" element={<MGABranchesBarChartPage />} />
          <Route path="mga_profit_branches-bar-chart" element={<MGAProfitBranchesBarChartPage />} />
          <Route path="msgp_branches-bar-chart" element={<MSGPBranchesBarChartPage />} />
          <Route path="msgp_profit_branches-bar-chart" element={<MSGPProfitBranchesBarChartPage />} />
          <Route path="oil_branches-bar-chart" element={<OilBranchesBarChartPage />} />
          <Route path="pms_parts_branches-bar-chart" element={<PMSPartsBranchesBarChartPage />} />
          <Route path="profit_loss_branches-bar-chart" element={<ProfitLossBranchesBarChartPage />} />
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
