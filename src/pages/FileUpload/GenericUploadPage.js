import React, { useEffect, useState } from "react";
import { Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import {
  fetchAllRecords,
  filterByMonthYear,
  uploadExcelFile,
  deleteAllRecords,
} from "../../services/uploadPageService";
import UploadNavbar from "../../components/UploadNavbar";
import { uploadNavbarButtons } from "../../config/uploadNavBarButtons";
import { apiModules } from "../../config/modules";
import TitleBar from "../../components/common/TitleBar";
import UploadSection from "../../components/common/UploadSection";
import MonthYearFilter from "../../components/common/MonthYearFilter";
import DataTable from "../../components/common/DataTable";
import LoadingAnimation from "../../components/LoadingAnimation";


function GenericUploadPage({ moduleName, tableName }) {
  const config = apiModules.find((m) => m.name === moduleName);


  const [tableData, setTableData] = useState([]);
  const [months, setMonths] = useState([]);
  const [years, setYears] = useState([]);
  const [financialYears, setFinancialYears] = useState(["2026-2027"]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);


  const navigate = useNavigate();


  const handleFetch = async () => {
    setLoading(true);
    try {
      const data = await fetchAllRecords(config.get);
      setTableData(data || []);
    } catch (err) {
      console.error("Fetch failed:", err);
    }
    setLoading(false);
  };


  const handleFilter = async () => {
    if (
      months.length === 0 &&
      years.length === 0 &&
      financialYears.length === 0
    ) {
      alert("⚠ Please select Month, Year or Financial Year!");
      return;
    }

    setLoading(true);
    try {
      const data = await filterByMonthYear(
        config.getByMonthYear,
        months,
        years,
        financialYears
      );
      setTableData(data || []);
    } catch (err) {
      console.error("Filter failed:", err);
      alert(
        "❌ Filter failed: " +
          (err.response?.data?.message || err.message)
      );
    }
    setLoading(false);
  };


  const handleDownloadExcel = () => {
    if (tableData.length === 0) return;

    try {
      const exportData = tableData.map((row) => {
        const rowKeys = Object.keys(row);
        const cleanRow = {};
        for (let i = 1; i < rowKeys.length; i++) {
          const key = rowKeys[i];
          cleanRow[key] = row[key];
        }
        return cleanRow;
      });

      const ws = XLSX.utils.json_to_sheet(exportData);
      const colWidths = Object.keys(exportData[0]).map(() => ({ wch: 18 }));
      ws["!cols"] = colWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Data");

      const filename = `${tableName}_report.xlsx`;
      XLSX.writeFile(wb, filename);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };


  const handleUpload = async () => {
    if (!file) return alert("⚠ Select a file first!");

    setLoading(true);
    try {
      await uploadExcelFile(config.upload, file);
      alert("✅ File uploaded successfully!");
      setFile(null);
      handleFetch();
    } catch (err) {
      alert(
        "❌ Upload failed: " +
          (err.response?.data?.message || err.message)
      );
    }
    setLoading(false);
  };


  const handleDeleteAll = async () => {
    if (!window.confirm(`⚠ Delete ALL ${moduleName} data?`)) return;

    setLoading(true);
    try {
      await deleteAllRecords(config.deleteAll);
      alert(`🗑 All ${moduleName} data deleted!`);
      setTableData([]);
    } catch (err) {
      alert(
        "❌ Delete failed: " +
          (err.response?.data?.message || err.message)
      );
    }
    setLoading(false);
  };


  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const data = await filterByMonthYear(
          config.getByMonthYear,
          [],
          [],
          ["2026-2027"]
        );
        setTableData(data || []);
      } catch (err) {
        console.error("Initial filter failed:", err);
      }
      setLoading(false);
    };

    loadInitialData();
  }, []);


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
          <TitleBar title={`${moduleName} Upload File`} />
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              color="success"
              onClick={handleDownloadExcel}
              sx={{ minWidth: 140 }}
            >
              📥 Download Excel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDeleteAll}
            >
              Delete All
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate("/AdminDashboard")}
            >
              Back
            </Button>
          </Box>
        </Box>


        <Box sx={{ p: 3 }}>
          <UploadSection file={file} setFile={setFile} onUpload={handleUpload} />

          <MonthYearFilter
            months={months}
            years={years}
            financialYears={financialYears}
            setMonths={setMonths}
            setYears={setYears}
            setFinancialYears={setFinancialYears}
            onFilter={handleFilter}
            onViewAll={handleFetch}
          />

          <DataTable tableData={tableData} />
        </Box>
      </Box>
    </Box>
  );
}


export default GenericUploadPage;