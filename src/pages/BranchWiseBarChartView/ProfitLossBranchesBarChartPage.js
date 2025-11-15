import React, { useState, useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";
import { fetchData } from "../../api/uploadService";
import { useNavigate } from "react-router-dom";
import SlicerFilters from "../../components/SlicerFilters";
import GrowthButtons from "../../components/GrowthButtons";
import BranchBarChart from "../../components/BranchBarChart";
import { getSelectedGrowth, setSelectedGrowth } from "../../utils/growthSelection";

function ProfitLossBranchesBarChartPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState([]);
  const [cities, setCities] = useState(["BLR"]);
    const [selectedGrowth, setSelectedGrowthState] = useState(null);

  const cityOptions = [
    "Bangalore",
    "Mysore",
    "Mangalore",
  ];

  // ✅ Mapping UI → API code
  const cityCodeMap = {
    Bangalore: "BLR",
    Mysore: "MYS",
    Mangalore: "MLR",
  };

  // ✅ Read city name from backend code
  const cityDisplayMap = {
    BLR: "Bangalore",
    MYS: "Mysore",
    MLR: "Mangalore",
  };

  // ✅ Override setter → Always 1 city selected + convert UI → Code
  const handleCitySelect = (arr) => {
    if (!Array.isArray(arr)) return;
    const latestUI = arr[arr.length - 1]; // ex: Bangalore
    const apiCode = cityCodeMap[latestUI]; // ex: BLR
    setCities(apiCode ? [apiCode] : []);
  };

  const growthOptions = [
    "Apr 24",
    "May 24",
    "Jun 24",
    "Jul 24",
    "2024 - 25",
    "Apr 25",
    "May 25",
    "Jun 25",
    "Jul 25",
    "Aug 25",
    "2025 - 26",
    "SR&BR Apr 25",
    "SR&BR May 25",
    "SR&BR Jun 25",
    "SR&BR Jul 25",
    "SR&BR Aug 25",
    "SR&BR 2025 - 26",
  ];

  const growthKeyMap = {
    "Apr 24": "apr_24",
    "May 24": "may_24",
    "Jun 24": "jun_24",
    "Jul 24": "jul_24",
    "2024 - 25":"total_24",
    "Apr 25": "apr_25",
    "May 25": "may_25",
    "Jun 25": "jun_25",
    "Jul 25": "jul_25",
    "Aug 25": "aug_25",
    "2025 - 26": "fy_2025_26",
    "SR&BR Apr 25": "apr25_per_100k",
    "SR&BR May 25": "may25_per_100k",
    "SR&BR Jun 25": "jun25_per_100k",
    "SR&BR Jul 25": "jul25_per_100k",
    "SR&BR Aug 25": "aug25_per_100k",
    "SR&BR 2025 - 26": "total25_per_100k",
  };

  const twoDecimalGrowthOptions = [
  "Apr 24", "May 24", "Jun 24", "Jul 24",
  "2024 - 25", "Apr 25", "May 25",  "Jun 25",
  "Jul 25", "Aug 25", "2025 - 26",
];

  useEffect(() => {
      const savedGrowth = getSelectedGrowth("profit_loss");
      if (savedGrowth) setSelectedGrowthState(savedGrowth);
    }, []);
  

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const params = new URLSearchParams();
        if (cities.length > 0) params.append("cities", cities.join(","));

        const endpoint = `/api/profit_loss/profit_loss_branch_summary${
          params.toString() ? "?" + params.toString() : ""
        }`;

        const data = await fetchData(endpoint);
        setSummary(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching profit loss branch summary:", error);
        setSummary([]);
      }
    };
    fetchSummary();
  }, [cities]);

  const readBranchName = (row) =>
    row?.branch || row?.Branch || row?.branchName || row?.BranchName || row?.name || row?.Name || "";

  const readCityName = (row) =>
    cityDisplayMap[row?.city] || cityDisplayMap[row?.City] || row?.city || "";

  const readGrowthValue = (row, apiKey) => {
    const candidates = [
      apiKey,
      apiKey?.toLowerCase(),
      apiKey?.toUpperCase(),
      apiKey?.replace(/([A-Z])/g, "_$1").toLowerCase(),
      "value",
      "growth",
      "val",
    ];
    for (const key of candidates) {
      if (Object.prototype.hasOwnProperty.call(row, key) && row[key] != null)
        return row[key];
    }
    for (const key of Object.keys(row)) {
      const v = row[key];
      if (typeof v === "number") return v;
      if (typeof v === "string" && v.trim().match(/^-?\d+(\.\d+)?%?$/)) return v;
    }
    return undefined;
  };

  const buildCombinedAverageData = (dataArr) => {
    const apiKey = growthKeyMap[selectedGrowth];
    const totals = {};
    const counts = {};
    const cityMap = {};

    (dataArr || []).forEach((row) => {
      const branch = readBranchName(row);
      const city = readCityName(row);
      const val = readGrowthValue(row, apiKey);
      const parsed = parseFloat(String(val).replace("%", "").trim());
      if (!isNaN(parsed)) {
        totals[branch] = (totals[branch] || 0) + parsed;
        counts[branch] = (counts[branch] || 0) + 1;
        cityMap[branch] = city;
      }
    });

    return Object.keys(totals)
      .map((b) => ({
        name: b,
        city: cityMap[b],
        value: counts[b] ? totals[b] / counts[b] : 0,
      }))
      .sort((a, b) => b.value - a.value);
  };

  const chartData =
    selectedGrowth && summary.length > 0 ? buildCombinedAverageData(summary) : [];

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
          <Typography variant="h4">PROFIT & LOSS REPORT (Branch-wise)</Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button variant="contained" onClick={() => navigate("/DashboardHome/profit_loss_monthly")}>P&L Monthly Graph</Button>
            <Button variant="contained" onClick={() => navigate("/DashboardHome/profit_loss_per_vehicle")}>P&L PerVehicle Graph</Button>
            <Button variant="contained" onClick={() => navigate("/DashboardHome/profit_loss")}>P&L Table</Button>
            <Button variant="contained" onClick={() => navigate("/DashboardHome/profit_loss_srbr")}>SR&BR Table</Button>
            <Button variant="contained" onClick={() => navigate("/DashboardHome/profit_loss-bar-chart")}>CityWise Chart</Button>
            <Button variant="contained" onClick={() => navigate("/DashboardHome/profit_loss_branches-bar-chart")}>BranchWise Chart</Button>
          </Box>
        </Box>

      <SlicerFilters
        cityOptions={cityOptions}
        cities={cities.map((c) => cityDisplayMap[c])}
        setCities={handleCitySelect} 
      />

      <GrowthButtons
        growthOptions={growthOptions}
        selectedGrowth={selectedGrowth}
        setSelectedGrowth={(value)=>{
          setSelectedGrowthState(value);
          setSelectedGrowth(value,"profit_loss");
        }}
      />

      {!selectedGrowth ? (
        <Typography>👆 Select a growth type to view the chart below</Typography>
      ) : (
        <BranchBarChart
          chartData={chartData}
          selectedGrowth={selectedGrowth}
          decimalPlaces={twoDecimalGrowthOptions.includes(selectedGrowth) ? 2 : 0}
          chartType="MGABranchesBarChart"
        />
      )}
    </Box>
  );
}

export default ProfitLossBranchesBarChartPage;
