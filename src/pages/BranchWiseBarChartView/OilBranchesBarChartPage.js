import React, { useState, useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";
import { fetchData } from "../../api/uploadService";
import { useNavigate } from "react-router-dom";
import SlicerFilters from "../../components/SlicerFilters";
import GrowthButtons from "../../components/GrowthButtons";
import BranchBarChart from "../../components/BranchBarChart";

function OilBranchesBarChartPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState([]);
  const [months, setMonths] = useState([]);
  const [cities, setCities] = useState([]);
  const [qtrWise, setQtrWise] = useState([]);
  const [halfYear, setHalfYear] = useState([]);
  const [selectedGrowth, setSelectedGrowth] = useState(null);

  const monthOptions = [
    "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct",
    "Nov", "Dec", "Jan", "Feb", "Mar",
  ];
  const cityOptions = ["Bangalore", "Mysore", "Mangalore"];
  const qtrWiseOptions = ["Qtr1", "Qtr2", "Qtr3", "Qtr4"];
  const halfYearOptions = ["H1", "H2"];

  const growthOptions = [
    "Full Synthetic QTY %",
    "Semi Synthetic QTY %",
    "Full & Semi Synthetic QTY %",
  ];

  const growthKeyMap = {
    "Full Synthetic QTY %": "fullSyntheticPercentageQTY",
    "Semi Synthetic QTY %": "semiSyntheticPercentageQTY",
    "Full & Semi Synthetic QTY %": "fullSemiSyntheticPercentageQTY",
  };

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const params = new URLSearchParams();
        if (months.length > 0) params.append("months", months.join(","));
        if (cities.length > 0) params.append("cities", cities.join(","));
        if (qtrWise.length > 0) params.append("qtrWise", qtrWise.join(","));
        if (halfYear.length > 0) params.append("halfYear", halfYear.join(","));
        const endpoint = `/api/oil/oil_branch_summary${
          params.toString() ? "?" + params.toString() : ""
        }`;
        const data = await fetchData(endpoint);
        setSummary(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching oil tyre branch summary:", error);
        setSummary([]);
      }
    };
    fetchSummary();
  }, [months, cities, qtrWise, halfYear]);

  const readBranchName = (row) =>
    row?.branch || row?.Branch || row?.branchName || row?.BranchName || row?.name || row?.Name || "";
  const readCityName = (row) =>
    row?.city || row?.City || row?.cityName || row?.CityName || "";

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
        <Typography variant="h4">OIL REPORT (Branch-wise)</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" color="secondary" onClick={() => navigate("/DashboardHome/oil")}>
            Graph
          </Button>
          <Button variant="contained" color="secondary" onClick={() => navigate("/DashboardHome/oil-bar-chart")}>
            CityWise
          </Button>
        </Box>
      </Box>

      <SlicerFilters
        monthOptions={monthOptions}
        cityOptions={cityOptions}
        qtrWiseOptions={qtrWiseOptions}
        halfYearOptions={halfYearOptions}
        months={months}
        setMonths={setMonths}
        cities={cities}
        setCities={setCities}
        qtrWise={qtrWise}
        setQtrWise={setQtrWise}
        halfYear={halfYear}
        setHalfYear={setHalfYear}
      />

      <GrowthButtons
        growthOptions={growthOptions}
        selectedGrowth={selectedGrowth}
        setSelectedGrowth={setSelectedGrowth}
      />

      {!selectedGrowth ? (
        <Typography>👆 Select a growth type to view the chart below</Typography>
      ) : (
        <BranchBarChart 
        chartData={chartData}
        selectedGrowth={selectedGrowth}
        decimalPlaces={0}
        />
      )}
    </Box>
  );
}

export default OilBranchesBarChartPage;
