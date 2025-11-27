import React, { useState, useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";
import { fetchData } from "../../api/uploadService";
import { useNavigate } from "react-router-dom";
import SlicerFilters from "../../components/SlicerFilters";
import GrowthButtons from "../../components/GrowthButtons";
import GrowthLineChart from "../../components/GrowthLineChart";
import { sortCities } from "../../components/CityOrderHelper";
import { getSelectedGrowth, setSelectedGrowth } from "../../utils/growthSelection";

function PMSPartsPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState([]);
  const [months, setMonths] = useState([]);

  const [selectedGrowth, setSelectedGrowthState] = useState("7 PARTS PMS %");

  const monthOptions = ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"];

  
  const growthOptions = [
    "Air filter %",
    "Belt water pump %",
    "Brake fluid %",
    "Coolant %",
    "Fuel Filter %",
    "Oil filter %",
    "Spark plug %",
    "7 PARTS PMS %",
    "DRAIN PLUG GASKET %",
    "ISG BELT GENERATOR %",
    "CNG FILTER %",
    "3 PARTS PMS %",
    "Grand Total %",
  ];

  const growthKeyMap = {
    "Air filter %": "airFilter",
    "Belt water pump %": "beltWaterPump",
    "Brake fluid %": "brakeFluid",
    "Coolant %": "coolant",
    "Fuel Filter %": "fuelFilter",
    "Oil filter %": "oilFilter",
    "Spark plug %": "sparkPlug",
    "7 PARTS PMS %": "sevenPartsPMS",
    "DRAIN PLUG GASKET %": "drainPlugGasket",
    "ISG BELT GENERATOR %": "isgBeltGenerator",
    "CNG FILTER %": "cngFilter",
    "3 PARTS PMS %": "threePartsPMS",
    "Grand Total %": "grandTotal",
  };

  useEffect(() => {
    const savedGrowth = getSelectedGrowth("pms_parts");
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

          const data = await fetchData(`/api/pms_parts/pms_parts_summary${query}`);
          const safeData = Array.isArray(data) ? data : data?.result || [];
          combined.push({ month: m, data: safeData });
        }
        setSummary(combined);
      } catch (error) {
        console.error("fetchCitySummary error:", error);
      }
    };
    fetchCitySummary();
  }, [months]);

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
        <Typography variant="h4">PMS PARTS GRAPH (CityWise)</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/pms_parts")}>Graph-CityWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/pms_parts_branches")}>Graph-BranchWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/pms_parts-bar-chart")}>Bar Chart-CityWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/pms_parts_branches-bar-chart")}>Bar Chart-BranchWise</Button>
        </Box>
      </Box>

      <SlicerFilters
        monthOptions={monthOptions}
        months={months}
        setMonths={setMonths}
      />

      <GrowthButtons
        growthOptions={growthOptions}
        selectedGrowth={selectedGrowth}
        setSelectedGrowth={(value) => {
          setSelectedGrowthState(value);
          setSelectedGrowth(value, "pms_parts");
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
            decimalDigits={2}
            showPercent={true}
            lowThreshold={98}
            yAxisMin={95}  
            yAxisMax={100}
          />
        </Box>
      )}
    </Box>
  );
}

export default PMSPartsPage;
