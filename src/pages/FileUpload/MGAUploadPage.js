import React, { useState } from "react";
import { Box } from "@mui/material";
import { fetchData, uploadFile } from "../../api/uploadService";
import { apiModules } from "../../config/modules";
import { useNavigate } from "react-router-dom";

// ✅ Import Navbar Component & Button List
import UploadNavbar from "../../components/UploadNavbar";
import { uploadNavbarButtons } from "../../config/uploadNavBarButtons";

// ✅ Reusable components
import TitleBar from "../../components/common/TitleBar";
import UploadSection from "../../components/common/UploadSection";
import FilterByDate from "../../components/common/FilterByDate";
import DataTable from "../../components/common/DataTable";

function MGAUploadPage() {
  const mgaConfig = apiModules.find((m) => m.name === "MGA");
  const [tableData, setTableData] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [file, setFile] = useState(null);

  const navigate = useNavigate();

  const handleFetch = async (withFilter = false) => {
    try {
      let path = mgaConfig.get;
      if (withFilter && selectedDate) {
        path = mgaConfig.getMgaByMGADate.replace("{mgaDate}", selectedDate);
      }
      const data = await fetchData(path);
      setTableData(data);
    } catch (err) {
      alert("❌ Error fetching MGA: " + err.message);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("⚠ Please select a file!");

    try {
      await uploadFile(mgaConfig.upload, file);
      alert("✅ File Uploaded Successfully!");
      setFile(null);
    } catch (err) {
      alert("❌ Upload Failed: " + err.message);
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* ✅ Reusable Navbar with imported button config */}
      <UploadNavbar buttons={uploadNavbarButtons} />

      <TitleBar
        title="MGA Upload File"
        onBack={() => navigate("/AdminDashboard")}
      />

      <Box sx={{ p: 3 }}>
        <UploadSection file={file} setFile={setFile} onUpload={handleUpload} />

        <FilterByDate
          selectedDate={selectedDate}
          handleDateChange={setSelectedDate}
          handleFilter={() => handleFetch(true)}
          handleViewAll={() => handleFetch(false)}
        />

        <DataTable tableData={tableData} />
      </Box>
    </Box>
  );
}

export default MGAUploadPage;
