import React, { useState } from "react";
import { TextField, Button, Box } from "@mui/material";
import DataTable from "../components/DataTable";
import { fetchData, uploadFile } from "../api/uploadService"; // ✅ import upload
import { apiModules } from "../config/modules";
import { useNavigate } from "react-router-dom";

function PMSPartsPage() {
  const pms_partsConfig = apiModules.find((m) => m.name === "PMS Parts");
  const [tableData, setTableData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(""); 
  const [file, setFile] = useState(null); // ✅ for upload

  const navigate = useNavigate();

  // Fetch data (all or filtered)
  const handleFetch = async (withFilter = false) => {
    try {
      let path = pms_partsConfig.get;
      if (withFilter && selectedDate) { 
        path = pms_partsConfig.getPMSPartsByPMSDate.replace("{pmsDate}", selectedDate); 
      }
      const data = await fetchData(path);
      setTableData(data);
    } catch (err) {
      alert("❌ Error fetching PMS PARTS: " + err.message);
    }
  };

  // Upload file
  const handleUpload = async () => {
    if (!file) {
      alert("⚠ Please select a file first!");
      return;
    }
    try {
      await uploadFile(pms_partsConfig.upload, file);
      alert("✅ PMS Parts file uploaded successfully!");
      setFile(null); // clear file after success
    } catch (err) {
      alert("❌ Upload failed: " + (err.response?.data || err.message));
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <h2> PMS Parts </h2>

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

      {/* Date filter */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField
          type="date" 
          size="small"
          value={selectedDate} 
          onChange={(e) => setSelectedDate(e.target.value)} 
          InputLabelProps={{ shrink: true }} 
        />
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleFetch(true)}
        >
          🔎 Apply Filter
        </Button>
      </Box>

      {/* Table */}
      <DataTable data={tableData} title="PMS Parts" />
    </Box>
  );
}

export default PMSPartsPage;
