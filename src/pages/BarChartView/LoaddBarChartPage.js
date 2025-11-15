import React, { useState, useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";
import { fetchData } from "../../api/uploadService";
import { useNavigate } from "react-router-dom";
import SlicerFilters from "../../components/SlicerFilters";
import GrowthButtons from "../../components/GrowthButtons";
import CityBarChart from "../../components/CityBarChart";
import { getSelectedGrowth, setSelectedGrowth } from "../../utils/growthSelection";

function LoaddBarChartPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState([]);
  const [months, setMonths] = useState([]);
  const [channels, setChannels] = useState([]);
  const [qtrWise, setQtrWise] = useState([]);
  const [halfYear, setHalfYear] = useState([]);
  const [selectedGrowth, setSelectedGrowthState] = useState(null);

  const monthOptions = ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"];
  const channelOptions = ["ARENA", "NEXA"];
  const qtrWiseOptions = ["Qtr1", "Qtr2", "Qtr3", "Qtr4"];
  const halfYearOptions = ["H1", "H2"];
  const growthOptions = [
    "Service Growth %","BodyShop Growth %","Free Service Growth %",
    "PMS Growth %","FPR Growth %","RR Growth %","Others Growth %","BS on FPR 2024-25 %","BS on FPR 2025-26 %"
  ];
  const growthKeyMap = {
    "Service Growth %": "growthService",
    "BodyShop Growth %": "growthBodyShop",
    "Free Service Growth %": "growthFreeService",
    "PMS Growth %": "growthPMS",
    "FPR Growth %": "growthFPR",
    "RR Growth %": "growthRR",
    "Others Growth %": "growthOthers",
    "BS on FPR 2024-25 %": "previousBSFPR",
    "BS on FPR 2025-26 %": "currentBSFPR",
  };

  useEffect(() => {
    // Load saved growth type
    const savedGrowth = getSelectedGrowth("loadd");
    if (savedGrowth) setSelectedGrowthState(savedGrowth);
  }, []);

  useEffect(() => {
    const fetchCitySummary = async () => {
      try {
        const params = new URLSearchParams();
        if (months.length) params.append("months", months.join(","));
        if (channels.length) params.append("channels", channels.join(","));
        if (qtrWise.length) params.append("qtrWise", qtrWise.join(","));
        if (halfYear.length) params.append("halfYear", halfYear.join(","));
        const query = params.toString() ? `?${params.toString()}` : "";
        const data = await fetchData(`/api/loadd/loadd_summary${query}`);
        setSummary(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("fetchCitySummary error:", err);
      }
    };
    fetchCitySummary();
  }, [months, channels, qtrWise, halfYear]);

  const readCityName = (row) => row?.city || row?.City || row?.cityName || row?.CityName || row?.name || row?.Name || "";
  const readGrowthValue = (row, apiKey) => {
    const val = row?.[apiKey];
    if (val == null) return 0;
    const num = parseFloat(String(val).replace("%","").trim());
    return isNaN(num) ? 0 : num;
  };

  const buildCombinedAverageData = (dataArr) => {
    const apiKey = growthKeyMap[selectedGrowth];
    const totals = {};
    const counts = {};
    (dataArr || []).forEach((row) => {
      const city = readCityName(row);
      const val = readGrowthValue(row, apiKey);
      totals[city] = (totals[city] || 0) + val;
      counts[city] = (counts[city] || 0) + 1;
    });
    return Object.keys(totals).map((city) => ({
      city,
      value: parseFloat(((totals[city] || 0)/(counts[city]||1)).toFixed(1))
    }));
  };

  const chartData = selectedGrowth && summary.length > 0 ? buildCombinedAverageData(summary) : [];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display:"flex", justifyContent:"space-between", mb:3 }}>
        <Typography variant="h4">LOAD REPORT (City-wise)</Typography>
        <Box sx={{ display:"flex", gap:1 }}>
          <Button variant="contained" color="secondary" onClick={()=>navigate("/DashboardHome/loadd")}>Graph</Button>
          <Button variant="contained" color="secondary" onClick={()=>navigate("/DashboardHome/loadd-bar-chart")}>CityWise</Button>
          <Button variant="contained" color="secondary" onClick={()=>navigate("/DashboardHome/loadd_branches-bar-chart")}>BranchWise</Button>
        </Box>
      </Box>

      <SlicerFilters
        monthOptions={monthOptions} months={months} setMonths={setMonths}
        channelOptions={channelOptions} channels={channels} setChannels={setChannels}
        qtrWiseOptions={qtrWiseOptions} qtrWise={qtrWise} setQtrWise={setQtrWise}
        halfYearOptions={halfYearOptions} halfYear={halfYear} setHalfYear={setHalfYear}
      />

      <GrowthButtons
        growthOptions={growthOptions}
        selectedGrowth={selectedGrowth}
        setSelectedGrowth={(value) => {
          setSelectedGrowthState(value);
          setSelectedGrowth(value, "loadd");
        }}
      />

      {!selectedGrowth ? <Typography>👆 Select a growth type to view the chart below</Typography> :
        chartData.length === 0 ? <Typography>No data available for the selected criteria.</Typography> :
        <CityBarChart chartData={chartData} selectedGrowth={selectedGrowth} decimalPlaces={1} />
      }
    </Box>
  );
}

export default LoaddBarChartPage;
