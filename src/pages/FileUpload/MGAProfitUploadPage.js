import React, { useEffect, useState } from "react";
import { Box, Button } from "@mui/material";
import { fetchData, uploadFile } from "../../api/uploadService"; // ✅ Only for fetch & upload
import { deleteData } from "../../api/deleteService"; // ✅ NEW SEPARATE FILE
import { apiModules } from "../../config/modules";
import { useNavigate } from "react-router-dom";

import UploadNavbar from "../../components/UploadNavbar";
import { uploadNavbarButtons } from "../../config/uploadNavBarButtons";
import TitleBar from "../../components/common/TitleBar";
import UploadSection from "../../components/common/UploadSection";
import MonthYearFilter from "../../components/common/MonthYearFilter";
import DataTable from "../../components/common/DataTable";

function MGAProfitUploadPage() {
  const config = apiModules.find((m) => m.name === "MGA Profit");
  const [tableData, setTableData] = useState([]);
  const [months, setMonths] = useState([]);
  const [years, setYears] = useState([]);
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  // 🔹 Fetch all data
  const handleFetch = async () => {
    try {
      const data = await fetchData(config.get);
      setTableData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch all error:", err);
      setTableData([]);
    }
  };

  // 🔹 Apply filter (multiple month/year support)
  const handleFilter = async () => {
    if ((!months || months.length === 0) && (!years || years.length === 0)) {
      alert("⚠ Please select at least one Month and/or Year before applying the filter.");
      return;
    }

    try {
      const params = new URLSearchParams();
      if (Array.isArray(months)) months.forEach((m) => params.append("months", m));
      if (Array.isArray(years)) years.forEach((y) => params.append("years", y));

      const url = `${config.getByMonthYear}?${params.toString()}`;
      const data = await fetchData(url);
      setTableData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Filter error:", err);
      setTableData([]);
    }
  };

  // 🔹 Upload file
  const handleUpload = async () => {
    if (!file) {
      alert("⚠ Please select a file first!");
      return;
    }

    try {
      await uploadFile(config.upload, file);
      alert("✅ File uploaded successfully!");
      setFile(null);
      handleFetch();
    } catch (err) {
      alert("❌ Upload failed: " + (err.response?.data?.message || err.message));
    }
  };

  // 🔹 Delete all data (using separate deleteService)
  const handleDeleteAll = async () => {
    if (!window.confirm("⚠ Are you sure you want to delete ALL MGA Profit data? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await deleteData(config.deleteAll);
      alert("🗑️ All MGA Profit data deleted successfully!");
      setTableData([]);
    } catch (err) {
      console.error("Delete all error:", err);
      alert("❌ Failed to delete all data: " + (err.response?.data?.message || err.message));
    }
  };

  useEffect(() => {
    handleFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box sx={{ width: "100%" }}>
      {/* Fixed Upload Navbar */}
      <Box sx={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1200 }}>
        <UploadNavbar buttons={uploadNavbarButtons} />
      </Box>

      {/* Add top padding for fixed navbar */}
      <Box sx={{ pt: "140px" }}>
        {/* TitleBar Row with Delete All + Back Button */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 3,
            mb: 2,
          }}
        >
          <TitleBar title="MGA Profit Upload File" />
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button variant="contained" color="error" onClick={handleDeleteAll}>
              Delete All
            </Button>
            <Button variant="outlined" color="primary" onClick={() => navigate("/AdminDashboard")}>
              Back
            </Button>
          </Box>
        </Box>

        {/* Main Content */}
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

          <DataTable tableData={Array.isArray(tableData) ? tableData : []} />
        </Box>
      </Box>
    </Box>
  );
}

export default MGAProfitUploadPage;
