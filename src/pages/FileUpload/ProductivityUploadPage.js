import React, { useEffect, useState } from "react";
import { Box, Button, TextField, MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import { apiModules } from "../../config/modules";
import { useNavigate } from "react-router-dom";

import {
  fetchAllRecords,
  uploadExcelFile,
} from "../../services/uploadPageService";

import UploadNavbar from "../../components/UploadNavbar";
import { uploadNavbarButtons } from "../../config/uploadNavBarButtons";
import TitleBar from "../../components/common/TitleBar";
import UploadSection from "../../components/common/UploadSection";
import DataTable from "../../components/common/DataTable";
import LoadingAnimation from "../../components/LoadingAnimation";
import axios from "axios";

function ProductivityUploadPage() {
  const config = apiModules.find((m) => m.name === "Productivity");

  const [tableData, setTableData] = useState([]);
  const [branch, setBranch] = useState("");
  const [newUtilizedBay, setNewUtilizedBay] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [branchesList, setBranchesList] = useState([]);

  // NEW FOR WORKING DAYS
  const [selectedMonth, setSelectedMonth] = useState("");
  const [workingDays, setWorkingDays] = useState("");
  const monthList = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const navigate = useNavigate();

  // Fetch All Records
  const handleFetch = async () => {
    setLoading(true);
    const data = await fetchAllRecords(config.get);
    setTableData(data);

    const uniqueBranches = [...new Set(data.map(item => item.branch))];
    setBranchesList(uniqueBranches);

    setLoading(false);
  };

  // Upload Excel File
  const handleUpload = async () => {
    if (!file) return alert("⚠ Select a file first!");
    setLoading(true);

    try {
      await uploadExcelFile(config.upload, file);
      alert("✅ File uploaded successfully!");
      setFile(null);
      handleFetch();
    } catch (err) {
      alert("❌ Upload failed: " + (err.response?.data?.message || err.message));
    }

    setLoading(false);
  };

  // Update SERVICE Utilized Bay
  const handleUpdateServiceBay = async () => {
    if (!branch || !newUtilizedBay) {
      alert("⚠ Please select a branch and fill Utilized Bay value!");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.put(
        `http://localhost:8080${config.updateServiceUtilizedBay}?branch=${branch}&newServiceUtilizedBay=${newUtilizedBay}`
      );
      alert("✅ " + res.data);
      handleFetch();
    } catch (err) {
      alert("❌ Service Update failed: " + (err.response?.data || err.message));
    }

    setLoading(false);
  };

  // Update BODYSHOP Utilized Bay
  const handleUpdateBodyshopBay = async () => {
    if (!branch || !newUtilizedBay) {
      alert("⚠ Please select a branch and fill Utilized Bay value!");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.put(
        `http://localhost:8080${config.updateBodyShopUtilizedBay}?branch=${branch}&newBodyShopUtilizedBay=${newUtilizedBay}`
      );
      alert("✅ " + res.data);
      handleFetch();
    } catch (err) {
      alert("❌ BodyShop Update failed: " + (err.response?.data || err.message));
    }

    setLoading(false);
  };

  const handleUpdateWorkingDays = async () => {
    if (!selectedMonth || !workingDays) {
      alert("⚠ Please select a month and enter working days!");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.put(
        `http://localhost:8080${config.updateWorkingDays}?month=${selectedMonth}&workingDays=${workingDays}`
      );

      alert("✅ " + res.data);
      handleFetch();
    } catch (err) {
      alert("❌ Working Days Update failed: " + (err.response?.data || err.message));
    }

    setLoading(false);
  };

  useEffect(() => {
    handleFetch();
  }, []);

  if (loading) return <LoadingAnimation />;

  return (
    <Box sx={{ width: "100%" }}>
      
      {/* NAVBAR */}
      <Box sx={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1200 }}>
        <UploadNavbar buttons={uploadNavbarButtons} />
      </Box>

      <Box sx={{ pt: "140px" }}>

        {/* HEADER */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 3,
            mb: 2,
          }}
        >
          <TitleBar title="Productivity Upload File" />
          <Button variant="outlined" onClick={() => navigate("/AdminDashboard")}>
            Back
          </Button>
        </Box>

        <Box sx={{ p: 3 }}>

          <UploadSection file={file} setFile={setFile} onUpload={handleUpload} />

          <Box
            sx={{
              mt: 4,
              p: 3,
              border: "1px solid #ccc",
              borderRadius: 2,
              background: "hsla(209, 78%, 80%, 1.00)",
            }}
          >
            <h3>Update Utilized Bay</h3>

            <Box sx={{ display: "flex", gap: 2, mt: 2, alignItems: "center" }}>
              
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Branch</InputLabel>
                <Select
                  value={branch}
                  label="Branch"
                  onChange={(e) => setBranch(e.target.value)}
                >
                  {branchesList.map((b) => (
                    <MenuItem key={b} value={b}>{b}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Utilized Bay Value"
                type="number"
                variant="outlined"
                value={newUtilizedBay}
                onChange={(e) => setNewUtilizedBay(e.target.value)}
              />

              <Button
                variant="contained"
                color="primary"
                sx={{ height: "55px" }}
                onClick={handleUpdateServiceBay}
              >
                Update Service Bay
              </Button>

              <Button
                variant="contained"
                color="secondary"
                sx={{ height: "55px" }}
                onClick={handleUpdateBodyshopBay}
              >
                Update BodyShop Bay
              </Button>
            </Box>
          </Box>

          <Box
            sx={{
              mt: 4,
              p: 3,
              border: "1px solid #ccc",
              borderRadius: 2,
              background: "hsla(208, 56%, 62%, 1.00)",
            }}
          >
            <h3>Update Working Days</h3>

            <Box sx={{ display: "flex", gap: 2, mt: 2, alignItems: "center" }}>
              
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Month</InputLabel>
                <Select
                  value={selectedMonth}
                  label="Month"
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  {monthList.map((m) => (
                    <MenuItem key={m} value={m}>{m}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Working Days"
                type="number"
                variant="outlined"
                value={workingDays}
                onChange={(e) => setWorkingDays(e.target.value)}
              />

              <Button
                variant="contained"
                color="success"
                sx={{ height: "55px" }}
                onClick={handleUpdateWorkingDays}
              >
                Update Working Days
              </Button>
            </Box>
          </Box>

          {/* TABLE */}
          <DataTable tableData={tableData} />

        </Box>
      </Box>
    </Box>
  );
}

export default ProductivityUploadPage;
