import React, { useState, useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";
import { fetchData } from "../../api/uploadService";
import { useNavigate } from "react-router-dom";
import SlicerFilters from "../../components/SlicerFilters";
import GrowthButtons from "../../components/GrowthButtons";
import GrowthLineChart from "../../components/GrowthLineChart";
import { sortCities } from "../../components/CityOrderHelper";
import { getSelectedGrowth, setSelectedGrowth } from "../../utils/growthSelection";

function MGAProfitPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState([]);
  const [months, setMonths] = useState([]);
  const [selectedGrowth, setSelectedGrowthState] = useState(getSelectedGrowth("mga_profit"));

  const monthOptions = [
    "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct",
    "Nov", "Dec", "Jan", "Feb", "Mar",
  ];

  const growthOptions = [
    "Service&BodyShop Profit %",
    "Service Profit %",
    "BodyShop Profit %",
  ];

  const growthKeyMap = {
    "Service&BodyShop Profit %": "serviceBodyShopPercentageProfit",
    "Service Profit %": "servicePercentageProfit",
    "BodyShop Profit %": "bodyShopPercentageProfit",
  };

  const readCityName = (row) =>
    row?.city || row?.City || row?.cityName || row?.CityName || row?.name || row?.Name || "";

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

          const data = await fetchData(`/api/mga_profit/mga_profit_summary${query}`);
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

    summary.forEach(({ data }) =>
      (data || []).forEach((r) => cities.add(readCityName(r)))
    );

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
        <Typography variant="h4">MGA PROFIT REPORT</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" color="secondary" onClick={() => navigate("/DashboardHome/mga_profit")}>Graph</Button>
          <Button variant="contained" color="secondary" onClick={() => navigate("/DashboardHome/mga_profit-bar-chart")}>CityWise</Button>
          <Button variant="contained" color="secondary" onClick={() => navigate("/DashboardHome/mga_profit_branches-bar-chart")}>BranchWise</Button>
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
          setSelectedGrowth(value, "mga_profit");
        }}
      />

      {!selectedGrowth ? (
        <Typography>Select a growth type to view the chart</Typography>
      ) : chartData.length === 0 ? (
        <Typography>No data available for the selected criteria.</Typography>
      ) : (
        <Box sx={{ mt: 2, height: 520, background: "#fff", borderRadius: 2, boxShadow: 3, p: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            {selectedGrowth}
          </Typography>
          <GrowthLineChart
            chartData={chartData}
            cityKeys={cityKeys}
            decimalDigits={1}
            showPercent={[
              "Service&BodyShop Profit %",
              "Service Profit %",
              "BodyShop Profit %",
            ].includes(selectedGrowth)}
          />
        </Box>
      )}
    </Box>
  );
}

export default MGAProfitPage;
