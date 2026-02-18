import React, { useEffect, useState } from "react";
import { Box, Button } from "@mui/material";
import { apiModules } from "../../config/modules";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

import {
  fetchAllRecords,
  filterByTypes,
  uploadExcelFile,
  deleteAllRecords,
} from "../../services/uploadPageService";

import UploadNavbar from "../../components/UploadNavbar";
import { uploadNavbarButtons } from "../../config/uploadNavBarButtons";
import TitleBar from "../../components/common/TitleBar";
import UploadSection from "../../components/common/UploadSection";
import TypeFilter from "../../components/common/TypeFilter";
import DataTable from "../../components/common/DataTable";
import LoadingAnimation from "../../components/LoadingAnimation";

function OutstandingUploadPage() {
  const config = apiModules.find((m) => m.name === "Outstanding");

  const [allData, setAllData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [types, setTypes] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [idData, setIdData] = useState([]);

  const navigate = useNavigate();

  // 🔹 Fetch ALL data (Outstanding table)
  const handleFetch = async () => {
    setLoading(true);
    const data = await fetchAllRecords(config.get);
    setAllData(data);
    setTableData(data);
    setLoading(false);
  };

  // 🔹 Fetch ID data separately (Insurance Difference table)
  const fetchIdData = async () => {
    try {
      const data = await fetchAllRecords(config.getInsuranceDifference);
      setIdData(data);
    } catch (error) {
      console.error("Failed to fetch ID data:", error);
      setIdData([]);
    }
  };

  // 🔹 Updated Filter Handler - Handles ID + other types
  const handleFilter = async () => {
    if (!types.length) {
      alert("⚠ Please select Type");
      return;
    }

    setLoading(true);
    
    // 🔹 Check if ID is selected
    const hasIdType = types.includes("ID");
    
    if (hasIdType) {
      // ✅ When ID is clicked, show ID data from getInsuranceDifference API
      setTableData(idData);
    } else {
      // 🔹 Filter Outstanding data for other types (CASH, INVOICE, etc.)
      const data = await filterByTypes(config.getByType, types);
      setTableData(data);
    }
    
    setLoading(false);
  };

  // 🔹 View All - Reset to Outstanding data
  const handleViewAll = () => {
    setTypes([]);
    handleFetch();
  };

  // 🔹 Upload
  const handleUpload = async () => {
    if (!file) return alert("⚠ Select a file first!");
    setLoading(true);
    try {
      await uploadExcelFile(config.upload, file);
      alert("✅ File uploaded successfully!");
      setFile(null);
      handleFetch();
    } catch {
      alert("❌ Upload failed");
    }
    setLoading(false);
  };

  // 🔹 DOWNLOAD — Separate handling for ID data
  const handleDownload = () => {
    if (!allData.length && !idData.length) {
      alert("⚠ No data available");
      return;
    }

    const getBillNo = (row) => (row.bill_no || row.billNo || "");

    // ❗ REMOVE outstandingSINo ONLY FOR EXCEL (Outstanding data)
    const sanitizeOutstanding = (rows) =>
      rows.map(({ outstandingSINo, ...rest }) => rest);

    // ✅ ID data uses different sanitize (no outstandingSINo column)
    const sanitizeIdData = (rows) => rows;

    const cash = sanitizeOutstanding(allData.filter(r => getBillNo(r).includes("BC")));
    const invoice = sanitizeOutstanding(allData.filter(r => getBillNo(r).includes("BR")));
    const insurance = sanitizeOutstanding(allData.filter(r => getBillNo(r).includes("BI")));
    const others = sanitizeOutstanding(
      allData.filter(r => {
        const bill = getBillNo(r);
        return (
          !bill.includes("BC") &&
          !bill.includes("BR") &&
          !bill.includes("BI")
        );
      })
    );
    
    // 🔹 ID DATA - From separate table/API
    const idRecords = sanitizeIdData(idData);
    const total = sanitizeOutstanding(allData);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(total),
      "TOTAL"
    );
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(cash),
      "CASH"
    );
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(invoice),
      "INVOICE"
    );
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(insurance),
      "INSURANCE"
    );
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(others),
      "OTHERS"
    );
    // 🔹 ID SHEET
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(idRecords),
      "ID"
    );

    XLSX.writeFile(workbook, "Outstanding_Report.xlsx");
  };

  // 🔹 Delete all (Outstanding table only)
  const handleDeleteAll = async () => {
    if (!window.confirm("⚠ Delete ALL Outstanding data?")) return;
    setLoading(true);
    try {
      await deleteAllRecords(config.deleteAll);
      setAllData([]);
      setTableData([]);
      alert("🗑 Deleted");
    } catch {
      alert("❌ Delete failed");
    }
    setLoading(false);
  };

  useEffect(() => {
    handleFetch();
    fetchIdData(); // Load ID data on mount
  }, []);

  if (loading) return <LoadingAnimation />;

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ position: "fixed", top: 0, left: 0, right: 0 }}>
        <UploadNavbar buttons={uploadNavbarButtons} />
      </Box>

      <Box sx={{ pt: "140px" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", px: 3 }}>
          <TitleBar title="Outstanding Upload File" />
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button color="success" variant="contained" onClick={handleDownload}>
              Download
            </Button>
            <Button color="error" variant="contained" onClick={handleDeleteAll}>
              Delete All
            </Button>
            <Button variant="outlined" onClick={() => navigate("/AdminDashboard")}>
              Back
            </Button>
          </Box>
        </Box>

        <Box sx={{ p: 3 }}>
          <UploadSection file={file} setFile={setFile} onUpload={handleUpload} />
          <TypeFilter
            types={types}
            setTypes={setTypes}
            onFilter={handleFilter}
            onViewAll={handleViewAll} // ✅ Pass updated handler
          />
          <DataTable tableData={tableData} />
        </Box>
      </Box>
    </Box>
  );
}

export default OutstandingUploadPage;
