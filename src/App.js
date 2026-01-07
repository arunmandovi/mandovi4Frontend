import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import ProtectedRoute from "./utils/ProtectedRoute";
import AdminProtectedRoute from "./utils/AdminProtectedRoute";
import EmployeeLogin from "./pages/EmployeeLogin";
import AdminLogin from "./pages/AdminPages/AdminLogin";
import AdminDashboard from "./pages/AdminPages/AdminDashboard";
import Layout from "./components/Layout"; // ✅ Navbar + Outlet

// Graph pages
import BatteryTyrePage from "./pages/GraphView/BatteryTyrePage";
import BRConversionPage from "./pages/GraphView/BRConversionPage";
import CCConversionPage from "./pages/GraphView/CCConversionPage";
import CCConversionTablePage from "./pages/GraphView/CCConversionTablePage";
import HoldUpPage from "./pages/GraphView/HoldUpPage";
import HoldUpSummaryPage from "./pages/GraphView/HoldUpSummaryPage";
import HoldUpDayWiseSummaryPage from "./pages/GraphView/HoldUpDayWiseSummaryPage";
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
import ProductivityPage from "./pages/GraphView/ProductivityPage";
import ProductivityTablePage from "./pages/GraphView/ProductivityTablePage";
import ProfitLossPage from "./pages/GraphView/ProfitLossPage";
import ProfitLossSRBRLoaddPage from "./pages/GraphView/ProfitLossSRBRLoadd";
import ProfitLossMonthlyGraphPage from "./pages/GraphView/ProfitLossMonthlyGraphPage";
import ProfitLossPerVehicleGraphPage from "./pages/GraphView/ProfitLossPerVehicleGraphPage";
import ReferenceePage from "./pages/GraphView/ReferenceePage";
import ReferenceeTablePage from "./pages/GraphView/ReferenceeTablePage";
import RevenuePage from "./pages/GraphView/RevenuePage";
import SalesPage from "./pages/GraphView/SalesPage.js";
import SalesTablePage from "./pages/GraphView/SalesTablePage";
import SAConversionPage from "./pages/GraphView/SAConversionPage";
import SAConversionTablePage from "./pages/GraphView/SAConversionTablePage.js";
import SparesPage from "./pages/GraphView/SparesPage";
import TATPage from "./pages/GraphView/TATPage";
import VASPage from "./pages/GraphView/VASPage";

// BranchWise Graph pages
import BatteryTyreBranchWisePage from "./pages/BranchWiseGraph/BatteryTyreBranchWisePage";
import BRConversionBranchWisePage from "./pages/BranchWiseGraph/BRConversionBranchWisePage";
import DueDoneBranchWisePage from "./pages/BranchWiseGraph/DueDoneBranchWisePage";
import HoldUpBranchWisePage from "./pages/BranchWiseGraph/HoldUpBranchWisePage";
import LabourBranchWisePage from "./pages/BranchWiseGraph/LabourBranchWisePage";
import LoaddBranchWisePage from "./pages/BranchWiseGraph/LoaddBranchWisePage";
import MCPBranchWisePage from "./pages/BranchWiseGraph/MCPBranchWisePage";
import MGABranchWisePage from "./pages/BranchWiseGraph/MGABranchWisePage";
import MGAProfitBranchWisePage from "./pages/BranchWiseGraph/MGAProfitBranchWisePage";
import MSGPBranchWisePage from "./pages/BranchWiseGraph/MSGPBranchWisePage";
import MSGPProfitBranchWisePage from "./pages/BranchWiseGraph/MSGPProfitBranchWisePage";
import OilBranchWisePage from "./pages/BranchWiseGraph/OilBranchWisePage";
import PerVehicleBranchWisePage from "./pages/BranchWiseGraph/PerVehicleBranchWisePage";
import PMSPartsBranchWisePage from "./pages/BranchWiseGraph/PMSPartsBranchWisePage";
import ProductivityBranchWisePage from "./pages/BranchWiseGraph/ProductivityBranchWisePage";
import ProfitLossMonthlyBranchWisePage from "./pages/BranchWiseGraph/ProfitLossMonthlyBranchWisePage";
import ProfitLossPerVehicleBranchWisePage from "./pages/BranchWiseGraph/ProfitLossPerVehicleBranchWisePage";
import ReferenceeBranchWisePage from "./pages/BranchWiseGraph/ReferenceeBranchWisePage";
import RevenueBranchWisePage from "./pages/BranchWiseGraph/RevenueBranchWisePage";
import SparesBranchWisePage from "./pages/BranchWiseGraph/SparesBranchWisePage";
import TATBranchWisePage from "./pages/BranchWiseGraph/TATBranchWisePage";
import VASBranchWisePage from "./pages/BranchWiseGraph/VASBranchWisePage";


// File upload pages
import BatteryTyreUploadPage from "./pages/FileUpload/BatteryTyreUploadPage";
import BRConversionUploadPage from "./pages/FileUpload/BRConversionUploadPage";
import CCConversionUploadPage from "./pages/FileUpload/CCConversionUploadPage";
import DueDoneUploadPage from "./pages/FileUpload/DueDoneUploadPage";
import HoldUpUploadPage from "./pages/FileUpload/HoldUpUploadPage";
import LabourUploadPage from "./pages/FileUpload/LabourUpload";
import LoaddUploadPage from "./pages/FileUpload/LoaddUploadPage";
import MGAUploadPage from "./pages/FileUpload/MGAUploadPage";
import MGAProfitUploadPage from "./pages/FileUpload/MGAProfitUploadPage";
import MCPUploadPage from "./pages/FileUpload/MCPUploadPage";
import MSGPUploadPage from "./pages/FileUpload/MSGPUploadPage";
import MSGPProfitUploadPage from "./pages/FileUpload/MSGPProfitUploadPage";
import OilUploadPage from "./pages/FileUpload/OilUploadPage";
import OutstandingUploadPage from "./pages/FileUpload/OutstandingUploadPage";
import PMSPartsUploadPage from "./pages/FileUpload/PMSPartsUploadPage";
import ProductivityUploadPage from "./pages/FileUpload/ProductivityUploadPage";
import ProfitLossUploadPage from "./pages/FileUpload/ProfitLossUploadPage";
import ReferenceeUploadPage from "./pages/FileUpload/ReferenceeUploadPage";
import RevenueUploadPage from "./pages/FileUpload/RevenueUploadPage";
import SAConversionUploadPage from "./pages/FileUpload/SAConversionUploadPage";
import SparesUploadPage from "./pages/FileUpload/SparesUploadPage";
import TATUploadPage from "./pages/FileUpload/TATUploadPage";
import VASUploadPage from "./pages/FileUpload/VASUploadPage";

// BarChart Pages
import BatteryTyreBarChartPage from "./pages/BarChartView/BatteryTyreBarChartPage";
import BRConversionBarChartPage from "./pages/BarChartView/BRConversionBarChartPage";
import CCConversionBarChartPage from "./pages/BarChartView/CCConversionBarChartPage";
import DueDoneBarChartPage from "./pages/BarChartView/DueDoneBarChartPage";
import HoldUpBarChartPage from "./pages/BarChartView/HoldUpBarChartPage";
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
import ProductivityBarChartPage from "./pages/BarChartView/ProductivityBarChartPage";
import ProfitLossBarChartPage from "./pages/BarChartView/ProfitLossBarChartPage";
import ReferenceeBarChartPage from "./pages/BarChartView/ReferenceeBarChartPage";
import RevenueBarChartPage from "./pages/BarChartView/RevenueBarChartPage";
import SalesBarChartPage from "./pages/BarChartView/SalesBarChartPage.js";
import SparesBarChartPage from "./pages/BarChartView/SparesBarChartPage";
import SAConversionBarChartPage from "./pages/BarChartView/SAConversionBarChartPage";
import TATBarChartPage from "./pages/BarChartView/TATBarChartPage";
import VASBarChartPage from "./pages/BarChartView/VASBarChartPage";


// BranchWise BarChart Pages
import BatteryTyreBranchesBarChartPage from "./pages/BranchWiseBarChartView/BatteryTyreBranchesBarChartPage";
import BRConversionBranchesBarChartPage from "./pages/BranchWiseBarChartView/BRConversionBranchesBarChartPage";
import DueDoneBranchesBarChartPage from "./pages/BranchWiseBarChartView/DueDoneBranchesBarChartPage";
import HoldUpBranchesBarChartPage from "./pages/BranchWiseBarChartView/HoldUpBranchesBarChartPage";
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
import ProductivityBranchesBarChartPage from "./pages/BranchWiseBarChartView/ProductivityBranchesBarChartPage";
import ProfitLossBranchesBarChartPage from "./pages/BranchWiseBarChartView/ProfitLossBranchesBarChartPage";
import ReferenceeeBranchesBarChartPage from "./pages/BranchWiseBarChartView/ReferenceeBranchesBarChartPage";
import RevenueBranchesBarChartPage from "./pages/BranchWiseBarChartView/RevenueBranchesBarChartPage";
import SparesBranchesBarChartPage from "./pages/BranchWiseBarChartView/SparesBranchesBarChartPage";
import TATBranchesBarChartPage from "./pages/BranchWiseBarChartView/TATBranchesBarChartPage";
import VASBranchesBarChartPage from "./pages/BranchWiseBarChartView/VASBranchesBarChartPage";

import "./App.css";
import DueDonePage from "./pages/GraphView/DueDonePage";

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
        <Route path="/cc_conversion-upload" element={ <AdminProtectedRoute> <CCConversionUploadPage /> </AdminProtectedRoute> } />
        <Route path="/sa_conversion-upload" element={ <AdminProtectedRoute> <SAConversionUploadPage /> </AdminProtectedRoute> } />
        <Route path="/due_done-upload" element={ <AdminProtectedRoute> <DueDoneUploadPage /> </AdminProtectedRoute>} />
        <Route path="/hold_up-upload" element={ <AdminProtectedRoute> <HoldUpUploadPage /> </AdminProtectedRoute>} />
        <Route path="/labour-upload" element={ <AdminProtectedRoute><LabourUploadPage /></AdminProtectedRoute> } />
        <Route path="/loadd-upload" element={ <AdminProtectedRoute><LoaddUploadPage /></AdminProtectedRoute> } />
        <Route path="/mcp-upload" element={ <AdminProtectedRoute><MCPUploadPage /></AdminProtectedRoute> } />
        <Route path="/mga-upload" element={ <AdminProtectedRoute><MGAUploadPage /></AdminProtectedRoute> } />
        <Route path="/mga_profit-upload" element={ <AdminProtectedRoute><MGAProfitUploadPage /></AdminProtectedRoute> } />
        <Route path="/msgp-upload" element={ <AdminProtectedRoute><MSGPUploadPage /></AdminProtectedRoute> } />
        <Route path="/msgp_profit-upload" element={ <AdminProtectedRoute><MSGPProfitUploadPage /></AdminProtectedRoute> } />
        <Route path="/oil-upload" element={ <AdminProtectedRoute><OilUploadPage /></AdminProtectedRoute> } />
        <Route path="/outstanding-upload" element={ <AdminProtectedRoute><OutstandingUploadPage /></AdminProtectedRoute> } />
        <Route path="/pms_parts-upload" element={ <AdminProtectedRoute><PMSPartsUploadPage /></AdminProtectedRoute> } />
        <Route path="/productivity-upload" element={ <AdminProtectedRoute><ProductivityUploadPage /></AdminProtectedRoute> } />
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

          {/* 🧭 CityWise Graph Pages */}
          <Route path="battery_tyre" element={<BatteryTyrePage />} />
          <Route path="br_conversion" element={<BRConversionPage />} />
          <Route path="cc_conversion" element={<CCConversionPage />} />
          <Route path="sa_conversion" element={<SAConversionPage />} />
          <Route path="cc_conversion_table" element={<CCConversionTablePage />} />
          <Route path="sa_conversion_table" element={<SAConversionTablePage />} />
          <Route path="hold_up" element={<HoldUpPage />} />
          <Route path="hold_up_table" element={<HoldUpSummaryPage />} />
          <Route path="hold_up_day_table" element={<HoldUpDayWiseSummaryPage />} />
          <Route path="due_done" element={<DueDonePage />} />
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
          <Route path="productivity" element={<ProductivityPage />} />
          <Route path="productivity_table" element={<ProductivityTablePage />} />
          <Route path="profit_loss" element={<ProfitLossPage />} />
          <Route path="profit_loss_srbr" element={<ProfitLossSRBRLoaddPage />} />
          <Route path="profit_loss_monthly" element={<ProfitLossMonthlyGraphPage />} />
          <Route path="profit_loss_per_vehicle" element={<ProfitLossPerVehicleGraphPage />} />
          <Route path="referencee" element={<ReferenceePage />} />
          <Route path="referencee_table" element={<ReferenceeTablePage />} />
          <Route path="revenue" element={<RevenuePage />} />
          <Route path="sales" element={<SalesPage />} />
          <Route path="sales_table" element={<SalesTablePage />} />
          <Route path="spares" element={<SparesPage />} />
          <Route path="tat" element={<TATPage />} />
          <Route path="vas" element={<VASPage />} />

          {/* BranchWise Graph Pages */}
          <Route path="battery_tyre_branches" element={<BatteryTyreBranchWisePage />} />
          <Route path="br_conversion_branches" element={<BRConversionBranchWisePage />} />
          <Route path="cc_conversion_branches" element={<CCConversionPage />} />
          <Route path="due_done_branches" element={<DueDoneBranchWisePage />} />
          <Route path="hold_up_branches" element={<HoldUpBranchWisePage />} />
          <Route path="labour_branches" element={<LabourBranchWisePage />} />
          <Route path="loadd_branches" element={<LoaddBranchWisePage />} />
          <Route path="mcp_branches" element={<MCPBranchWisePage />} />
          <Route path="mga_branches" element={<MGABranchWisePage />} />
          <Route path="mga_profit_branches" element={<MGAProfitBranchWisePage />} />
          <Route path="msgp_branches" element={<MSGPBranchWisePage />} />
          <Route path="msgp_profit_branches" element={<MSGPProfitBranchWisePage />} />
          <Route path="oil_branches" element={<OilBranchWisePage />} />
          <Route path="per_vehicle_branches" element={<PerVehicleBranchWisePage />} />
          <Route path="pms_parts_branches" element={<PMSPartsBranchWisePage />} />
          <Route path="productivity_branches" element={<ProductivityBranchWisePage />} />
          <Route path="profit_loss_branches" element={<ProfitLossMonthlyBranchWisePage />} />
          <Route path="profit_loss_per_vehicle_branch" element={<ProfitLossPerVehicleBranchWisePage />} />
          <Route path="referencee_branches" element={<ReferenceeBranchWisePage />} />
          <Route path="revenue_branches" element={<RevenueBranchWisePage />} />
          <Route path="spares_branches" element={<SparesBranchWisePage />} />
          <Route path="tat_branches" element={<TATBranchWisePage />} />
          <Route path="vas_branches" element={<VASBranchWisePage />} />


          {/* 🧭 CityWise BarChart Pages */}
          <Route path="battery_tyre-bar-chart" element={<BatteryTyreBarChartPage />} />
          <Route path="br_conversion-bar-chart" element={<BRConversionBarChartPage />} />
          <Route path="cc_conversion-bar-chart" element={<CCConversionBarChartPage />} />
          <Route path="sa_conversion-bar-chart" element={<SAConversionBarChartPage />} />
          <Route path="due_done-bar-chart" element={<DueDoneBarChartPage />} />
          <Route path="hold_up-bar-chart" element={<HoldUpBarChartPage />} />
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
          <Route path="productivity-bar-chart" element={<ProductivityBarChartPage />} />
          <Route path="profit_loss-bar-chart" element={<ProfitLossBarChartPage />} />
          <Route path="referencee-bar-chart" element={<ReferenceeBarChartPage />} />
          <Route path="revenue-bar-chart" element={<RevenueBarChartPage />} />
          <Route path="sales-bar-chart" element={<SalesBarChartPage />} />
          <Route path="spares-bar-chart" element={<SparesBarChartPage />} />
          <Route path="tat-bar-chart" element={<TATBarChartPage />} />
          <Route path="vas-bar-chart" element={<VASBarChartPage />} />

          {/* 🧭 BranchWise BarChart Pages */}
          <Route path="battery_tyre_branches-bar-chart" element={<BatteryTyreBranchesBarChartPage />} />
          <Route path="br_conversion_branches-bar-chart" element={<BRConversionBranchesBarChartPage />} />
          <Route path="cc_conversion_branches-bar-chart" element={<CCConversionBarChartPage />} />
          <Route path="due_done_branches-bar-chart" element={<DueDoneBranchesBarChartPage />} />
          <Route path="hold_up_branches-bar-chart" element={<HoldUpBranchesBarChartPage />} />
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
          <Route path="productivity_branches-bar-chart" element={<ProductivityBranchesBarChartPage />} />
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
