import React, { useState, useEffect } from "react";
import { Button, Box, Typography } from "@mui/material";
import DataTable from "../../components/DataTable";
import { fetchData } from "../../api/uploadService";
import { useNavigate } from "react-router-dom";

function ProfitLossSRBRLoaddPage() {
  const [citySummary, setCitySummary] = useState([]);
  const [branchSummary, setBranchSummary] = useState([]);
  const [selectedCity, setSelectedCity] = useState("ALL");
  const navigate = useNavigate();

  const formatNumber = (value) => {
    if (value === null || value === undefined || value === "-" || value === "")
      return "-";

    const num = Number(value);
    if (isNaN(num)) return value;

    return Number(num || 0).toFixed(0); 
  };

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
            "Apr 2025": formatNumber(row.apr25_per_100k),
            "May 2025": formatNumber(row.may25_per_100k),
            "Jun 2025": formatNumber(row.jun25_per_100k),
            "Jul 2025": formatNumber(row.jul25_per_100k),
            "Aug 2025": formatNumber(row.aug25_per_100k),
            "Sep 2025": formatNumber(row.sep25_per_100k),
            "2025-26": formatNumber(row.total25_per_100k),
          }));
          formatted.sort(
        (a, b) => CITY_ORDER.indexOf(a.City) - CITY_ORDER.indexOf(b.City)
      );

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
        ? data.filter((row) => !["BANGALORE", "MYSORE", "MANGALORE"].includes(row.branch)).map((row) => ({
            Branch: row.branch || "-",
            "Apr 2025": formatNumber(row.apr25_per_100k),
            "May 2025": formatNumber(row.may25_per_100k),
            "Jun 2025": formatNumber(row.jun25_per_100k),
            "Jul 2025": formatNumber(row.jul25_per_100k),
            "Aug 2025": formatNumber(row.aug25_per_100k),
            "Sep 2025": formatNumber(row.sep25_per_100k),
            "2025-26": formatNumber(row.total25_per_100k),
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
          <Button variant="contained" onClick={() => navigate("/DashboardHome/profit_loss_monthly")}>
            P&L Monthly Graph
          </Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/profit_loss_monthly")}>P&L Monthly Graph(CityWise)</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/profit_loss_branches")}>P&L Monthly Graph(BranchWise)</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/profit_loss_per_vehicle")}>P&L PerVehicle Graph(CityWise)</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/profit_loss_per_vehicle_branch")}>P&L PerVehicle Graph(BranchWise)</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/profit_loss")}>P&L Table</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/profit_loss_srbr")}>SR&BR Table</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/profit_loss-bar-chart")}>Bar Chart-CityWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/profit_loss_branches-bar-chart")}>Bar Chart-BranchWise</Button>
        </Box>
      </Box>

      <DataTable data={citySummary} title="📍 City Wise P&L Per SR&Br Summary" />

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
        title="🏢 Branch Wise P&L Per SR&BR Summary"
      />
    </Box>
  );
}

export default ProfitLossSRBRLoaddPage;
