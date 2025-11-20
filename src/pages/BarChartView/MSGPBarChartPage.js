import React, { useState, useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";
import { fetchData } from "../../api/uploadService";
import { useNavigate } from "react-router-dom";
import SlicerFilters from "../../components/SlicerFilters";
import GrowthButtons from "../../components/GrowthButtons";
import CityBarChart from "../../components/CityBarChart";
import { getSelectedGrowth, setSelectedGrowth } from "../../utils/growthSelection";

function MSGPBarChartPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState([]);
  const [months, setMonths] = useState([]);
  const [qtrWise, setQtrWise] = useState([]);
  const [halfYear, setHalfYear] = useState([]);
  const [selectedGrowth, setSelectedGrowthState] = useState(getSelectedGrowth("msgp"));

  const monthOptions = ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"];
  const qtrWiseOptions = ["Qtr1", "Qtr2", "Qtr3", "Qtr4"];
  const halfYearOptions = ["H1", "H2"];

  const growthOptions = [
    "SR&BR Growth %",
    "Service Growth %",
    "BodyShop Growth %",
    "Free Service Growth %",
    "PMS Growth %",
    "RR Growth %",
    "Others Growth %",
  ];

  const growthKeyMap = {
    "SR&BR Growth %": "growthSRBS",
    "Service Growth %": "growthService",
    "BodyShop Growth %": "growthBodyShop",
    "Free Service Growth %": "growthFreeService",
    "PMS Growth %": "growthPMS",
    "RR Growth %": "growthRR",
    "Others Growth %": "growthOthers",
  };

  useEffect(() => {
    const fetchCitySummary = async () => {
      try {
        const params = new URLSearchParams();
        if (months.length) params.append("months", months.join(","));
        if (qtrWise.length) params.append("qtrWise", qtrWise.join(","));
        if (halfYear.length) params.append("halfYear", halfYear.join(","));
        const query = params.toString() ? `?${params.toString()}` : "";
        const data = await fetchData(`/api/msgp/msgp_summary${query}`);
        setSummary(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("fetchCitySummary error:", err);
      }
    };
    fetchCitySummary();
  }, [months, qtrWise, halfYear]);

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
    const preferredOrder = ["BANGALORE", "MYSORE", "MANGALORE"];
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
        <Typography variant="h4">MSGP REPORT (City-wise)</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" color="secondary" onClick={() => navigate("/DashboardHome/msgp")}>Graph-CityWise</Button>
          <Button variant="contained" color="secondary" onClick={() => navigate("/DashboardHome/msgp-bar-chart")}>Bar Chart-CityWise</Button>
          <Button variant="contained" color="secondary" onClick={() => navigate("/DashboardHome/msgp_branches-bar-chart")}>Bar Chart-BranchWise</Button>
        </Box>
      </Box>

      <SlicerFilters
        monthOptions={monthOptions}
        months={months}
        setMonths={setMonths}
        qtrWiseOptions={qtrWiseOptions}
        qtrWise={qtrWise}
        setQtrWise={setQtrWise}
        halfYearOptions={halfYearOptions}
        halfYear={halfYear}
        setHalfYear={setHalfYear}
      />

      <GrowthButtons
        growthOptions={growthOptions}
        selectedGrowth={selectedGrowth}
        setSelectedGrowth={(value) => {
          setSelectedGrowthState(value);
          setSelectedGrowth(value, "msgp");
        }}
      />

      {!selectedGrowth ? (
        <Typography>👆 Select a growth type to view the chart below</Typography>
      ) : summary.length === 0 ? (
        <Typography>No data available for the selected criteria.</Typography>
      ) : (
        <CityBarChart chartData={chartData} selectedGrowth={selectedGrowth} decimalPlaces={1} />
      )}
    </Box>
  );
}

export default MSGPBarChartPage;
