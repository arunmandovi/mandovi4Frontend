import React, { useEffect, useState } from "react";
import { Box, Button } from "@mui/material";
import { apiModules } from "../../config/modules";
import { useNavigate } from "react-router-dom";

import {
  fetchAllRecords,
  filterByMonthYear,
  uploadExcelFile,
  deleteAllRecords,
} from "../../services/uploadPageService";

import UploadNavbar from "../../components/UploadNavbar";
import { uploadNavbarButtons } from "../../config/uploadNavBarButtons";
import TitleBar from "../../components/common/TitleBar";
import UploadSection from "../../components/common/UploadSection";
import MonthYearFilter from "../../components/common/MonthYearFilter";
import DataTable from "../../components/common/DataTable";
import LoadingAnimation from "../../components/LoadingAnimation";

function VASUploadPage() {
  const config = apiModules.find((m) => m.name === "VAS");

  const [tableData, setTableData] = useState([]);
  const [months, setMonths] = useState([]);
  const [years, setYears] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // 🔹 Fetch all data
  const handleFetch = async () => {
    setLoading(true);
    const data = await fetchAllRecords(config.get);
    setTableData(data);
    setLoading(false);
  };

  // 🔹 Apply filter
  const handleFilter = async () => {
    if (months.length === 0 && years.length === 0) {
      alert("⚠ Please select Month or Year!");
      return;
    }

    setLoading(true);
    const data = await filterByMonthYear(config.getByMonthYear, months, years);
    setTableData(data);
    setLoading(false);
  };

  // 🔹 Upload file
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

  // 🔹 Delete all
  const handleDeleteAll = async () => {
    if (!window.confirm("⚠ Delete ALL VAS data?")) return;

    setLoading(true);
    try {
      await deleteAllRecords(config.deleteAll);
      alert("🗑 All VAS data deleted!");
      setTableData([]);
    } catch (err) {
      alert("❌ Delete failed: " + (err.response?.data?.message || err.message));
    }
    setLoading(false);
  };

  useEffect(() => {
    handleFetch();
  }, []);

  // 🔹 Show loader when loading
  if (loading) return <LoadingAnimation />;

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1200 }}>
        <UploadNavbar buttons={uploadNavbarButtons} />
      </Box>

      <Box sx={{ pt: "140px" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 3,
            mb: 2,
          }}
        >
          <TitleBar title="VAS Upload File" />
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button variant="contained" color="error" onClick={handleDeleteAll}>
              Delete All
            </Button>
            <Button variant="outlined" onClick={() => navigate("/AdminDashboard")}>
              Back
            </Button>
          </Box>
        </Box>

        <Box sx={{ p: 3 }}>
          <UploadSection file={file} setFile={setFile} onUpload={handleUpload} />

          <MonthYearFilter
            months={months}
            years={years}
            setMonths={setMonths}
            setYears={setYears}
            onFilter={handleFilter}
            onViewAll={handleFetch}
          />

          <DataTable tableData={tableData} />
        </Box>
      </Box>
    </Box>
  );
}

export default VASUploadPage;
