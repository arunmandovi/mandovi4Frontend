import React, { useState, useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";
import { fetchData } from "../../api/uploadService";
import { useNavigate } from "react-router-dom";
import SlicerFilters from "../../components/SlicerFilters";
import GrowthButtons from "../../components/GrowthButtons";
import BranchBarChart from "../../components/BranchBarChart";

function LabourBranchesBarChartPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState([]);
  const [months, setMonths] = useState([]);
  const [cities, setCities] = useState([]);
  const [channels, setChannels] = useState([]);
  const [qtrWise, setQtrWise] = useState([]);
  const [halfYear, setHalfYear] = useState([]);
  const [selectedGrowth, setSelectedGrowth] = useState(null);

  // Filter options
  const monthOptions = [
    "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct",
    "Nov", "Dec", "Jan", "Feb", "Mar",
  ];
  const cityOptions = ["Bangalore", "Mysore", "Mangalore"];
  const channelOptions = ["ARENA", "NEXA"];
  const qtrWiseOptions = ["Qtr1", "Qtr2", "Qtr3", "Qtr4"];
  const halfYearOptions = ["H1", "H2"];

  // Growth button labels
  const growthOptions = [
    "Service Growth %",
    "BodyShop Growth %",
    "SR&BR Growth %",
    "Free Service Growth %",
    "PMS Growth %",
    "FPR Growth %",
    "RR Growth %",
    "Others Growth %",
  ];

  const growthKeyMap = {
    "Service Growth %": "growthService",
    "BodyShop Growth %": "growthBodyShop",
    "SR&BR Growth %": "growthSrBr",
    "Free Service Growth %": "growthFreeService",
    "PMS Growth %": "growthPMS",
    "FPR Growth %": "growthFPR",
    "RR Growth %": "growthRunningRepair",
    "Others Growth %": "growthOthers",
  };

  // Fetch data when filters change
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const params = new URLSearchParams();
        if (months.length > 0) params.append("months", months.join(","));
        if (cities.length > 0) params.append("cities", cities.join(","));
        if (channels.length > 0) params.append("channels", channels.join(","));
        if (qtrWise.length > 0) params.append("qtrWise", qtrWise.join(","));
        if (halfYear.length > 0) params.append("halfYear", halfYear.join(","));

        const endpoint = `/api/labour/labour_branch_summary${
          params.toString() ? "?" + params.toString() : ""
        }`;

        const data = await fetchData(endpoint);
        setSummary(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching labour branch summary:", error);
        setSummary([]);
      }
    };

    fetchSummary();
  }, [months, cities, channels, qtrWise, halfYear]);

  // Helper functions to read branch and city names
  const readBranchName = (row) =>
    row?.branch ||
    row?.Branch ||
    row?.branchName ||
    row?.BranchName ||
    row?.name ||
    row?.Name ||
    "";

  const readCityName = (row) =>
    row?.city || row?.City || row?.cityName || row?.CityName || "";

  // ✅ Updated: return null for missing/invalid growth values
  const readGrowthValue = (row, apiKey) => {
    if (!apiKey) return null;

    const candidates = [
      apiKey,
      apiKey?.toLowerCase(),
      apiKey?.toUpperCase(),
      apiKey?.replace(/([A-Z])/g, "_$1").toLowerCase(),
    ];

    for (const key of candidates) {
      if (Object.prototype.hasOwnProperty.call(row, key)) {
        const val = row[key];
        if (val === null || val === undefined || val === "") {
          return null; // ✅ skip missing values
        }
        const num = parseFloat(String(val).replace("%", "").trim());
        return !isNaN(num) ? num : null; // ✅ skip invalid numeric values
      }
    }

    return null; // ✅ skip if key not found
  };

  // Build chart data (averages)
  const buildCombinedAverageData = (dataArr) => {
    const apiKey = growthKeyMap[selectedGrowth];
    const totals = {};
    const counts = {};
    const cityMap = {};

    (dataArr || []).forEach((row) => {
      const branch = readBranchName(row);
      const city = readCityName(row);
      const val = readGrowthValue(row, apiKey);

      if (val === null) return; // ✅ skip branches with no valid growth

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

  // Prepare chart data
  const chartData =
    selectedGrowth && summary.length > 0
      ? buildCombinedAverageData(summary)
      : [];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">LABOUR REPORT (Branch-wise)</Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate("/DashboardHome/labour")}
          >
            Graph
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate("/DashboardHome/labour-bar-chart")}
          >
            CityWise
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate("/DashboardHome/labour_branches-bar-chart")}
          >
            BranchWise
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <SlicerFilters
        monthOptions={monthOptions}
        cityOptions={cityOptions}
        channelOptions={channelOptions}
        qtrWiseOptions={qtrWiseOptions}
        halfYearOptions={halfYearOptions}
        months={months}
        setMonths={setMonths}
        cities={cities}
        setCities={setCities}
        channels={channels}
        setChannels={setChannels}
        qtrWise={qtrWise}
        setQtrWise={setQtrWise}
        halfYear={halfYear}
        setHalfYear={setHalfYear}
      />

      {/* Growth selection buttons */}
      <GrowthButtons
        growthOptions={growthOptions}
        selectedGrowth={selectedGrowth}
        setSelectedGrowth={setSelectedGrowth}
      />

      {/* Chart */}
      {!selectedGrowth ? (
        <Typography sx={{ mt: 2 }}>
          👆 Select a growth type to view the chart below
        </Typography>
      ) : (
        <BranchBarChart
          chartData={chartData}
          selectedGrowth={selectedGrowth}
        />
      )}
    </Box>
  );
}

export default LabourBranchesBarChartPage;
