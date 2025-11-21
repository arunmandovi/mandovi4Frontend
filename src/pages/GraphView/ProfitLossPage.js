import React, { useState, useEffect } from "react";
import { Button, Box, Typography } from "@mui/material";
import DataTable from "../../components/DataTable";
import { fetchData } from "../../api/uploadService";
import { useNavigate } from "react-router-dom";

function ProfitLossPage() {
  const [citySummary, setCitySummary] = useState([]);
  const [branchSummary, setBranchSummary] = useState([]);
  const [selectedCity, setSelectedCity] = useState("ALL");
  const navigate = useNavigate();

  // ✅ City filter mapping UI label → API code
  const CITY_FILTERS = [
    { code: "BLR", label: "Bangalore" },
    { code: "MYS", label: "Mysore" },
    { code: "MLR", label: "Mangalore" },
  ];

  const CITY_ORDER = [ "Bangalore", "Mysore", "Mangalore" ];

  const loadCitySummary = async () => {
    try {
      const data = await fetchData("/api/profit_loss/profit_loss_summary");
  
      if (!Array.isArray(data)) {
        setCitySummary([]);
        return;
      }
  
      let formatted = data.map((row) => ({
        City: row.city || "-",
        "Apr 2024": row.apr_24 ?? "-",
        "May 2024": row.may_24 ?? "-",
        "Jun 2024": row.jun_24 ?? "-",
        "Jul 2024": row.jul_24 ?? "-",
        "2024-25": row.total_24 ?? "-",
        "Apr 2025": row.apr_25 ?? "-",
        "May 2025": row.may_25 ?? "-",
        "Jun 2025": row.jun_25 ?? "-",
        "Jul 2025": row.jul_25 ?? "-",
        "Aug 2025": row.aug_25 ?? "-",
        "Sep 2025": row.sep_25 ?? "-",
        "2025-26": row.fy_2025_26 ?? "-",
      }));
  
      formatted.sort(
        (a, b) => CITY_ORDER.indexOf(a.City) - CITY_ORDER.indexOf(b.City)
      );
  
      const totalRow = { City: "Grand Total" };
  
      const columns = Object.keys(formatted[0]).filter((col) => col !== "City");
  
      columns.forEach((col) => {
        let sum = 0;
  
        formatted.forEach((row) => {
          const value = Number(row[col]);
          if (!isNaN(value)) sum += value;
        });
  
        totalRow[col] = sum.toFixed(2);
      });
  
      formatted.push(totalRow);
  
      setCitySummary(formatted);
    } catch (err) {
      console.error("City Summary Fetch Error:", err);
      alert("❌ Error fetching City Summary");
      setCitySummary([]);
    }
  };

  const BRANCH_ORDER = [
  "Wilson Garden", "Vijayanagar", "JP Nagar", "Yeshwanthpur WS", "Basaveshwarnagar", "Hennur", "Sarjapura",
  "NS Palya", "Kolar","Gowribidanur", "Uttarahali Kengeri", "Vidyarannapura", "Yelahanka", "Malur SOW",
  "Basavangudi", "Basavanagudi-SOW", "Kolar Nexa", "Maluru WS", "BANGALORE",

  "KRS Road", "Hunsur Road", "Bannur", "Mandya", "Gonikoppa", "Kushalnagar", "ChamrajNagar",
  "Krishnarajapet","Somvarpet", "Maddur", "Nagamangala", "Narasipura", "Mysore Nexa", "Kollegal", "MYSORE",
   
  "Balmatta", "Sujith Bagh Lane", "Nexa Service", "Yeyyadi BR", "Adyar", "Surathkal", "Bantwal",
  "Uppinangady", "Sullia", "Kadaba", "Vittla", "Naravi", "MANGALORE"
  ];

  const loadBranchSummary = async (cityFilter = null) => {
    try {
      let url = "/api/profit_loss/profit_loss_branch_summary";

      if (cityFilter && cityFilter !== "ALL") {
        url += `?cities=${cityFilter}`;
      }

      const data = await fetchData(url);

      const formatted = Array.isArray(data)
        ? data.map((row) => ({
            Branch: row.branch || "-",
            "Apr 2024": row.apr_24 ?? "-",
            "May 2024": row.may_24 ?? "-",
            "Jun 2024": row.jun_24 ?? "-",
            "Jul 2024": row.jul_24 ?? "-",
            "2024-25": row.total_24 ?? "-",
            "Apr 2025": row.apr_25 ?? "-",
            "May 2025": row.may_25 ?? "-",
            "Jun 2025": row.jun_25 ?? "-",
            "Jul 2025": row.jul_25 ?? "-",
            "Aug 2025": row.aug_25 ?? "-",
            "Sep 2025": row.sep_25 ?? "-",
            "2025-26": row.fy_2025_26 ?? "-",
          }))
          .sort((a, b) => {
            return (
              BRANCH_ORDER.indexOf(a.Branch) - BRANCH_ORDER.indexOf(b.Branch)
            );
          })
        : [];

      setBranchSummary(formatted);
    } catch (err) {
      console.error("Branch Summary Fetch Error:", err);
      alert("❌ Error fetching Branch Summary");
      setBranchSummary([]);
    }
  };

  useEffect(() => {
    loadCitySummary();
    loadBranchSummary();
  }, []);

  const handleFilterClick = (cityCode) => {
    setSelectedCity(cityCode);
    loadBranchSummary(cityCode);
  };

  return (
  <Box sx={{ p: 3 }}>
    {/* Title + Buttons in same row */}
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 3,
      }}
    >
      <Typography variant="h4" sx={{ fontWeight: 600 }}>
        Profit & Loss Summary
      </Typography>

      <Box sx={{ display: "flex", gap: 1 }}>
        <Button variant="contained" onClick={() => navigate("/DashboardHome/profit_loss_monthly")}>P&L Monthly Graph</Button>
        <Button variant="contained" onClick={() => navigate("/DashboardHome/profit_loss_per_vehicle")}>P&L PerVehicle Graph</Button>
        <Button variant="contained" onClick={() => navigate("/DashboardHome/profit_loss")}>P&L Table</Button>
        <Button variant="contained" onClick={() => navigate("/DashboardHome/profit_loss_srbr")}>SR&BR Table</Button>
        <Button variant="contained" onClick={() => navigate("/DashboardHome/profit_loss-bar-chart")}>Bar Chart-CityWise</Button>
        <Button variant="contained" onClick={() => navigate("/DashboardHome/profit_loss_branches-bar-chart")}>Bar Chart-BranchWise</Button>
      </Box>
    </Box>

      <DataTable 
      data={citySummary} 
      title="📍 City Wise P&L Summary"
      decimalPlaces={2}
      />

      <Box sx={{ mt: 5, mb: 2, display: "flex", gap: 1 }}>
        <Button
          variant={selectedCity === "ALL" ? "contained" : "outlined"}
          onClick={() => handleFilterClick("ALL")}
        >
          All Branches
        </Button>

        {CITY_FILTERS.map(({ code, label }) => (
          <Button
            key={code}
            variant={selectedCity === code ? "contained" : "outlined"}
            onClick={() => handleFilterClick(code)}
          >
            {label}
          </Button>
        ))}
      </Box>

      <DataTable 
      data={branchSummary} 
      title="🏢 Branch Wise P&L Summary"
      decimalPlaces={2}
      />
    </Box>
  );
}

export default ProfitLossPage;
