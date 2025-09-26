import React, { useState } from "react";
import { Button, Box } from "@mui/material";
import DataTable from "../components/DataTable";
import { fetchData, uploadFile } from "../api/uploadService";
import { apiModules } from "../config/modules";
import { useNavigate } from "react-router-dom";

function ProfitLossPage() {
  const profit_lossConfig = apiModules.find((m) => m.name === "Profit & Loss");
  const [tableData, setTableData] = useState([]);
  const [file, setFile] = useState(null); // ✅ for upload

  const navigate = useNavigate();

  // Fetch data (all or filtered)
    const handleFetch = async (withFilter = false) => {
      try {
        let path = profit_lossConfig.get;
        const data = await fetchData(path);
        setTableData(data);
      } catch (err) {
        alert("❌ Error fetching Profit & Loss: " + err.message);
      }
    };

  // Upload file
  const handleUpload = async () => {
    if (!file) {
      alert("⚠ Please select a file first!");
      return;
    }
    try {
      await uploadFile(profit_lossConfig.upload, file);
      alert("✅ Profit Loss file uploaded successfully!");
      setFile(null); // clear file after success
    } catch (err) {
      alert("❌ Upload failed: " + (err.response?.data || err.message));
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <h2> Profit & Loss </h2>

      {/* 🔼 Upload Section */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 3,
          flexWrap: "wrap",
        }}
      >
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

      {/* Buttons: View All & Back */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Button variant="contained" onClick={() => handleFetch(false)}>
          📄 View All Data
        </Button>
        <Button variant="outlined" color="secondary" onClick={() => navigate("/DashboardHome")}>
          ⬅ Back to Home
        </Button>
      </Box>

      {/* Table */}
      <DataTable data={tableData} title="Profit & Loss" />
    </Box>
  );
}

export default ProfitLossPage;
