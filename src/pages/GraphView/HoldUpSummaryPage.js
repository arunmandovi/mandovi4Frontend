import React, { useState, useEffect } from "react";
import { Button, Box, Typography } from "@mui/material";
import DataTable from "../../components/DataTable";
import { fetchData } from "../../api/uploadService";
import { useNavigate } from "react-router-dom";

function HoldUpSummaryPage() {
  const [citySummary, setCitySummary] = useState([]);
  const [branchSummary, setBranchSummary] = useState([]);
  const [selectedCity, setSelectedCity] = useState("ALL");
  const navigate = useNavigate();

  const formatNumber = (value) => {
    if (value === null || value === undefined || value === "-" || value === "") return "-";
    const num = Number(value);
    if (isNaN(num)) return value;
    return Number(num || 0).toFixed(0);
  };

  const CITY_FILTERS = [
    { code: "BANGALORE", label: "BANGALORE" },
    { code: "MYSORE", label: "MYSORE" },
    { code: "MANGALORE", label: "MANGALORE" },
  ];

  const CITY_ORDER = ["BANGALORE", "MYSORE", "MANGALORE"];

  // ---------- GRAND TOTAL UTILITY ----------
  const addGrandTotalRow = (rows) => {
    if (!rows || rows.length === 0) return rows;

    const totalRow = { ...Object.fromEntries(Object.keys(rows[0]).map(k => [k, "-"])) };
    totalRow[Object.keys(rows[0])[0]] = "GRAND TOTAL"; // First column label

    rows.forEach(row => {
      Object.keys(row).forEach(key => {
        if (key !== Object.keys(rows[0])[0]) {
          const num = Number(row[key]);
          if (!isNaN(num)) {
            totalRow[key] = (Number(totalRow[key] === "-" ? 0 : totalRow[key]) + num).toFixed(0);
          }
        }
      });
    });

    return [...rows, totalRow];
  };

  const loadCitySummary = async () => {
    try {
      const data = await fetchData("/api/hold_up/hold_up_table_summary");
      if (!Array.isArray(data)) {
        setCitySummary([]);
        return;
      }

      let formatted = data.map((row) => ({
        City: row.city || "-",
        PMS: formatNumber(row.countPMS),
        "Sr 1": formatNumber(row.count1Service),
        "Sr 1-2": formatNumber(row.count1to2Service),
        "Sr 3-5": formatNumber(row.count3to5Service),
        "Sr 6-7": formatNumber(row.count6to7Service),
        "Sr 8-15": formatNumber(row.count8to15Service),
        "Sr 16-30": formatNumber(row.count16to30Service),
        "Sr >30": formatNumber(row.countAbove30Service),
        Service: formatNumber(row.countService),
        "Br 1": formatNumber(row.count1BodyShop),
        "Br 1-2": formatNumber(row.count1to2BodyShop),
        "Br 3-5": formatNumber(row.count3to5BodyShop),
        "Br 6-7": formatNumber(row.count6to7BodyShop),
        "Br 8-15": formatNumber(row.count8to15BodyShop),
        "Br 16-30": formatNumber(row.count16to30BodyShop),
        "Br >30": formatNumber(row.countAbove30BodyShop),
        BodyShop: formatNumber(row.countBodyShop),
        "Sr Total": formatNumber(row.countService1),
        "Br Total": formatNumber(row.countBodyShop1),
        Total: formatNumber(row.countTotal),
      }));

      formatted.sort((a, b) => CITY_ORDER.indexOf(a.City) - CITY_ORDER.indexOf(b.City));

      setCitySummary(addGrandTotalRow(formatted));
    } catch (err) {
      console.error("City Summary Fetch Error:", err);
      alert("❌ Error fetching City Summary");
      setCitySummary([]);
    }
  };

  const BRANCH_ORDER = [
    "Wilson Garden", "Vijayanagar", "JP Nagar", "Yeshwanthpur WS", "Basaveshwarnagar",
    "Hennur", "Sarjapura", "NS Palya", "Kolar", "Gowribidanur", "Uttarahali Kengeri",
    "Vidyarannapura", "Yelahanka", "Malur SOW", "Basavangudi", "Basavanagudi-SOW",
    "Kolar Nexa", "Maluru WS", "BANGALORE",

    "KRS Road", "Hunsur Road", "Bannur", "Mandya", "Gonikoppa", "Kushalnagar",
    "ChamrajNagar", "Krishnarajapet", "Somvarpet", "Maddur", "Nagamangala",
    "Narasipura", "Mysore Nexa", "Kollegal","Mandya Nexa", "MYSORE",

    "Balmatta", "Sujith Bagh Lane", "Nexa Service", "Yeyyadi BR", "Adyar",
    "Surathkal", "Bantwal", "Uppinangady", "Sullia", "Kadaba", "Vittla",
    "Naravi", "MANGALORE"
  ];

  const loadBranchSummary = async (cityFilter = null) => {
    try {
      let url = "/api/hold_up/hold_up_table_branch_summary";
      if (cityFilter && cityFilter !== "ALL") url += `?cities=${cityFilter}`;

      const data = await fetchData(url);

      const formatted = Array.isArray(data)
        ? data
            .filter((row) => !["BANGALORE", "MYSORE", "MANGALORE"].includes(row.branch))
            .map((row) => ({
              Branch: row.branch || "-",
              PMS: formatNumber(row.countPMS),
              "Sr 1": formatNumber(row.count1Service),
              "Sr 1-2": formatNumber(row.count1to2Service),
              "Sr 3-5": formatNumber(row.count3to5Service),
              "Sr 6-7": formatNumber(row.count6to7Service),
              "Sr 8-15": formatNumber(row.count8to15Service),
              "Sr 16-30": formatNumber(row.count16to30Service),
              "Sr >30": formatNumber(row.countAbove30Service),
              Service: formatNumber(row.countService),
              "Br 1": formatNumber(row.count1BodyShop),
              "Br 1-2": formatNumber(row.count1to2BodyShop),
              "Br 3-5": formatNumber(row.count3to5BodyShop),
              "Br 6-7": formatNumber(row.count6to7BodyShop),
              "Br 8-15": formatNumber(row.count8to15BodyShop),
              "Br 16-30": formatNumber(row.count16to30BodyShop),
              "Br >30": formatNumber(row.countAbove30BodyShop),
              BodyShop: formatNumber(row.countBodyShop),
              "Sr Total": formatNumber(row.countService1),
              "Br Total": formatNumber(row.countBodyShop1),
              Total: formatNumber(row.countTotal),
            }))
            .sort((a, b) => BRANCH_ORDER.indexOf(a.Branch) - BRANCH_ORDER.indexOf(b.Branch))
        : [];

      setBranchSummary(addGrandTotalRow(formatted));
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
          Hold Up Summary
        </Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/hold_up_table")}>HoldUp Summary</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/hold_up_day_table")}>HoldUp DayWise Summary</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/hold_up")}>Graph-CityWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/hold_up_branches")}>Graph-BranchWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/hold_up-bar-chart")}>Bar Chart-CityWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/hold_up_branches-bar-chart")}>Bar Chart-BranchWise</Button>
        </Box>
      </Box>

      <DataTable data={citySummary} title="City Wise Summary" />

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

      <DataTable data={branchSummary} title="Branch Wise Summary" />
    </Box>
  );
}

export default HoldUpSummaryPage;
