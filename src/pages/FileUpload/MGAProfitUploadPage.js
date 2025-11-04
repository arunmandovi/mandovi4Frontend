import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { fetchData, uploadFile } from "../../api/uploadService";
import { apiModules } from "../../config/modules";
import { useNavigate } from "react-router-dom";

import UploadNavbar from "../../components/UploadNavbar";
import { uploadNavbarButtons } from "../../config/uploadNavBarButtons";
import TitleBar from "../../components/common/TitleBar";
import UploadSection from "../../components/common/UploadSection";
import MonthYearFilter from "../../components/common/MonthYearFilter";
import DataTable from "../../components/common/DataTable";

function MGAProfitUploadPage() {
  const mgaProfitConfig = apiModules.find((m) => m.name === "MGA Profit");
  const [tableData, setTableData] = useState([]);
  const [months, setMonths] = useState([]); 
  const [years, setYears] = useState([]);
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  // Fetch all data
  const handleFetch = async () => {
    try {
      const data = await fetchData(mgaProfitConfig.get);
      setTableData(Array.isArray(data) ? data : []);
      // Reset slicer selections if you want:
      // setMonths([]); setYears([]);
    } catch (err) {
      console.error("Fetch all error:", err);
      setTableData([]);
    }
  };

  // Apply filter (builds query string supporting multiple months/years)
  const handleFilter = async () => {
    // Validation behavior A: show message if nothing selected
    if ((!months || months.length === 0) && (!years || years.length === 0)) {
      alert("⚠ Please select at least one Month and/or Year before applying the filter.");
      return;
    }

    try {
      const params = new URLSearchParams();
      if (Array.isArray(months)) months.forEach((m) => params.append("months", m));
      if (Array.isArray(years)) years.forEach((y) => params.append("years", y));

      const url = `${mgaProfitConfig.getMgaProfitByMonthYear}?${params.toString()}`;
      // fetchData expects a path; pass the full url string we constructed
      const data = await fetchData(url);
      setTableData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Filter error:", err);
      setTableData([]);
    }
  };

  // Upload file
  const handleUpload = async () => {
    if (!file) {
      alert("⚠ Please select a file first!");
      return;
    }

    try {
      await uploadFile(mgaProfitConfig.upload, file);
      alert("✅ File uploaded successfully!");
      setFile(null);
      handleFetch();
    } catch (err) {
      alert("❌ Upload failed: " + (err.response?.data || err.message));
    }
  };

  useEffect(() => {
    handleFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fixed-top navbar: render it as position fixed and add top padding to content
  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1200 }}>
        <UploadNavbar buttons={uploadNavbarButtons} />
      </Box>

      {/* Add padding top so page content doesn't hide under fixed navbar */}
      <Box sx={{ pt: "72px" }}>
        <TitleBar
          title="MGA Profit Upload File"
          onBack={() => navigate("/AdminDashboard")}
        />

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
