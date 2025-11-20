import React, { useState, useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";
import { fetchData } from "../../api/uploadService";
import { useNavigate } from "react-router-dom";
import SlicerFilters from "../../components/SlicerFilters";
import GrowthButtons from "../../components/GrowthButtons";
import GrowthLineChart from "../../components/GrowthLineChart";
import { sortCities } from "../../components/CityOrderHelper";
import { getSelectedGrowth, setSelectedGrowth } from "../../utils/growthSelection";

function LabourPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState([]);
  const [months, setMonths] = useState([]);
  const [channels, setChannels] = useState([]);
  const [selectedGrowth, setSelectedGrowthState] = useState(null);

  const monthOptions = ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"];
  const channelOptions = ["Arena", "Nexa"];
  
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

  useEffect(() => {
    const savedGrowth = getSelectedGrowth("labour");
    if (savedGrowth) setSelectedGrowthState(savedGrowth);
  }, []);

  const readCityName = (row) => row?.city || row?.City || row?.cityName || row?.CityName || row?.name || row?.Name || "";
  const readGrowthValue = (row, apiKey) => {
    const raw = row?.[apiKey];
    if (raw == null) return 0;
    const cleaned = String(raw).replace("%", "").trim();
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  useEffect(() => {
    const fetchCitySummary = async () => {
      try {
        const activeMonths = months.length ? months : monthOptions;
        const combined = [];
        for (const m of activeMonths) {
          let query = `?&months=${m}`;
          if (channels.length === 1) query += `&channels=${channels[0]}`;
          const data = await fetchData(`/api/labour/labour_summary${query}`);
          const safeData = Array.isArray(data) ? data : data?.result || [];
          combined.push({ month: m, data: safeData });
        }
        setSummary(combined);
      } catch (error) {
        console.error("fetchCitySummary error:", error);
      }
    };
    fetchCitySummary();
  }, [months, channels]);

  const buildChartData = () => {
    if (!selectedGrowth) return { formatted: [], sortedCities: [] };
    const apiKey = growthKeyMap[selectedGrowth];
    const cities = new Set();
    summary.forEach(({ data }) => (data || []).forEach((r) => cities.add(readCityName(r))));
    const sortedCities = sortCities([...cities]);
    const formatted = summary.map(({ month, data }) => {
      const entry = { month };
      sortedCities.forEach((city) => (entry[city] = 0));
      (data || []).forEach((row) => {
        const city = readCityName(row);
        entry[city] = readGrowthValue(row, apiKey);
      });
      return entry;
    });
    return { formatted, sortedCities };
  };

  const { formatted: chartData, sortedCities: cityKeys } = buildChartData();

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">LABOUR REPORT</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" color="secondary" onClick={() => navigate("/DashboardHome/labour")}>Graph-CityWise</Button>
          <Button variant="contained" color="secondary" onClick={() => navigate("/DashboardHome/labour-bar-chart")}>Bar Chart-CityWise</Button>
          <Button variant="contained" color="secondary" onClick={() => navigate("/DashboardHome/labour_branches-bar-chart")}>Bar Chart-BranchWise</Button>
        </Box>
      </Box>

      <SlicerFilters
        monthOptions={monthOptions}
        months={months}
        setMonths={setMonths}
        channelOptions={channelOptions}
        channels={channels}
        setChannels={setChannels}
      />

      <GrowthButtons
        growthOptions={growthOptions}
        selectedGrowth={selectedGrowth}
        setSelectedGrowth={(value) => {
          setSelectedGrowthState(value);
          setSelectedGrowth(value, "labour");
        }}
      />

      {!selectedGrowth ? (
        <Typography>Select a growth type to view the chart</Typography>
      ) : chartData.length === 0 ? (
        <Typography>No data available for the selected criteria.</Typography>
      ) : (
        <Box sx={{ mt: 2, height: 520, background: "#fff", borderRadius: 2, boxShadow: 3, p: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>{selectedGrowth}</Typography>
          <GrowthLineChart
            chartData={chartData}
            cityKeys={cityKeys}
            decimalDigits={1}
            showPercent={true}
          />
        </Box>
      )}
    </Box>
  );
}

export default LabourPage;
