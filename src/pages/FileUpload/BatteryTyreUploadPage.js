import React, { useState } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { fetchData, uploadFile } from "../../api/uploadService";
import { apiModules } from "../../config/modules";
import { useNavigate } from "react-router-dom";
import UploadNavbar from "../../components/UploadNavbar";

function BatteryTyreUploadPage() {
  const batteryConfig = apiModules.find((m) => m.name === "Battery & Tyre");
  const [tableData, setTableData] = useState([]);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  const handleFetch = async (withFilter = false) => {
    try {
      let path = batteryConfig.get;
      if (withFilter && month && year) {
        path = batteryConfig.getBatteryTyreByMonthYear
          .replace("{month}", month.toString())
          .replace("{year}", year.toString());
      }
      const data = await fetchData(path);
      setTableData(data);
    } catch (err) {
      alert("❌ Error fetching Battery & Tyre: " + err.message);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("⚠ Please select a file first!");
      return;
    }
    try {
      await uploadFile(batteryConfig.upload, file);
      alert("✅ Battery & Tyre file uploaded successfully!");
      setFile(null);
    } catch (err) {
      alert("❌ Upload failed: " + (err.response?.data || err.message));
    }
  };

  // Column mapping
  const columnMapping = {
    batteryType: "Battery Type",
    tyreSize: "Tyre Size",
    quantity: "Quantity",
    location: "Location",
  };

  const columns = tableData[0]
    ? Object.keys(tableData[0])
        .filter((key) => key !== "batteryTyreSINo")
        .map((key) => ({
          field: key,
          headerName: columnMapping[key] || key.replace(/_/g, " "),
          flex: 1,
        }))
    : [];

  return (
    <Box sx={{ width: "100%" }}>
      {/* Reusable Navbar */}
      <UploadNavbar
        buttons={[
          { label: "Battery Tyre", path: "/batterytyre-upload"},
          {label: "BR Conversion", path: "/brconversion-upload"},
          {label: "Labour", path: "/labour-upload"},
          {label: "Load", path: "/loadd-upload"},
          { label: "MCP", path: "/mcp-upload" },
          { label: "MGA", path: "/mga-upload"},
          {label: "MSGP", path: "/msgp-upload"},
          {label: "MSGP Profit", path: "/msgp_profit-upload"},
          { label: "Oil", path: "/oil-upload" },
          { label: "PMS Parts", path: "/pms_parts-upload"},
          { label: "Profit & Loss", path: "/profit_loss-upload"},
          { label: "Reference", path: "/referencee-upload"},
          { label: "Revenue", path: "/revenue-upload"},
          { label: "Spares", path: "/spares-upload"},
          { label: "TAT", path: "/tat-upload"},
          { label: "VAS", path: "/vas-upload"},
        ]}
      />

      {/* ✅ Title and Back Button Row (below navbar) */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
          mb: 2,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: "bold",
            color: "#1976d2",
            textAlign: "center",
            flexGrow: 1,
          }}
        >
          Battery Tyre Upload File
        </Typography>

        <Button
          variant="contained"
          color="secondary"
          onClick={() => navigate("/AdminDashboard")}
          sx={{ ml: "auto" }}
        >
          🔙 Back
        </Button>
      </Box>

      <Box sx={{ p: 3 }}>
        {/* Upload Section */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3, flexWrap: "wrap" }}>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => setFile(e.target.files[0])}
            style={{ border: "1px solid #ccc", padding: "6px", borderRadius: "6px" }}
          />
          <Button variant="contained" color="success" onClick={handleUpload}>
            ⬆ Upload Excel
          </Button>
        </Box>

        {/* View All & Filter Buttons */}
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <Button variant="contained" onClick={() => handleFetch(false)}>
            📄 View All Data
          </Button>
        </Box>

        {/* Month-Year filter */}
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <TextField label="Month" size="small" value={month} onChange={(e) => setMonth(e.target.value)} />
          <TextField label="Year" size="small" value={year} onChange={(e) => setYear(e.target.value)} />
          <Button variant="contained" color="primary" onClick={() => handleFetch(true)}>
            🔎 Apply Filter
          </Button>
        </Box>

        {/* Data Table */}
        <Box sx={{ height: "600px", width: "100%" }}>
          <DataGrid
            rows={tableData.map((row, idx) => ({ id: idx, ...row }))}
            columns={columns}
            pageSize={tableData.length}
            rowsPerPageOptions={[tableData.length]}
            disableSelectionOnClick
            autoHeight
          />
        </Box>
      </Box>
    </Box>
  );
}

export default BatteryTyreUploadPage;