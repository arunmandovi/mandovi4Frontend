import React, { useState, useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";
import { fetchData } from "../../api/uploadService";
import { useNavigate } from "react-router-dom";
import GrowthButtons from "../../components/GrowthButtons";
import CityBarChart from "../../components/CityBarChart";
import { getSelectedGrowth, setSelectedGrowth } from "../../utils/growthSelection";

function ProfitLossBarChartPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState([]);
  const [selectedGrowth, setSelectedGrowthState] = useState(getSelectedGrowth("profit_loss"));

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
    const fetchCitySummary = async () => {
      try {
        const params = new URLSearchParams();
        const query = params.toString() ? `?${params.toString()}` : "";
        const data = await fetchData(`/api/profit_loss/profit_loss_summary${query}`);
        setSummary(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("fetchCitySummary error:", err);
      }
    };
    fetchCitySummary();
  }, []);

  const readCityName = (row) =>
    row?.city || row?.City || row?.cityName || row?.CityName || row?.name || row?.Name || "";

  const readGrowthValue = (row, apiKey) => {
    const candidates = [
      apiKey, apiKey?.toLowerCase(), apiKey?.toUpperCase(),
      apiKey?.replace(/([A-Z])/g, "_$1").toLowerCase(), "value","growth","val",
    ];
    for (const key of candidates) {
      if (Object.prototype.hasOwnProperty.call(row, key) && row[key] != null) return row[key];
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
    (dataArr || []).forEach((row) => {
      const city = readCityName(row);
      const val = readGrowthValue(row, apiKey);
      const parsed = parseFloat(String(val).replace("%", "").trim());
      if (!isNaN(parsed)) {
        totals[city] = (totals[city] || 0) + parsed;
        counts[city] = (counts[city] || 0) + 1;
      }
    });
    const preferredOrder = ["Bangalore", "Mysore", "Mangalore"];
    const allCities = Object.keys(totals);
    const sortedCities = [
      ...preferredOrder.filter((c) =>
        allCities.some((x) => x.toLowerCase() === c.toLowerCase())
      ),
      ...allCities
        .filter(
          (c) => !preferredOrder.some((p) => p.toLowerCase() === c.toLowerCase())
        )
        .sort((a, b) => a.localeCompare(b)),
    ];
    return sortedCities.map((city) => ({
      city,
      value: parseFloat(((totals[city] || 0) / (counts[city] || 1)).toFixed(1)),
    }));
  };

  const chartData =
    selectedGrowth && summary.length > 0 ? buildCombinedAverageData(summary) : [];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">PROFIT & LOSS REPORT (City-wise)</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/profit_loss_monthly")}>P&L Monthly Graph</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/profit_loss_per_vehicle")}>P&L PerVehicle Graph</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/profit_loss")}>P&L Table</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/profit_loss_srbr")}>SR&BR Table</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/profit_loss-bar-chart")}>Bar Chart-CityWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/profit_loss_branches-bar-chart")}>Bar Chart-BranchWise</Button>
        </Box>
      </Box>

      <GrowthButtons
        growthOptions={growthOptions}
        selectedGrowth={selectedGrowth}
        setSelectedGrowth={(value) => {
          setSelectedGrowthState(value);
          setSelectedGrowth(value, "profit_loss");
        }}
      />

      {!selectedGrowth ? (
        <Typography>👆 Select a growth type to view the chart below</Typography>
      ) : summary.length === 0 ? (
        <Typography>No data available for the selected criteria.</Typography>
      ) : (
        <CityBarChart chartData={chartData} 
        selectedGrowth={selectedGrowth} 
        decimalPlaces={twoDecimalGrowthOptions.includes(selectedGrowth) ? 2 : 0}
        showPercent={false} />
      )}
    </Box>
  );
}

export default ProfitLossBarChartPage;
