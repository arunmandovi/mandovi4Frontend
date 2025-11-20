import React, { useState, useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";
import { fetchData } from "../../api/uploadService";
import { useNavigate } from "react-router-dom";
import SlicerFilters from "../../components/SlicerFilters";
import GrowthButtons from "../../components/GrowthButtons";
import GrowthLineChart from "../../components/GrowthLineChart";
import { sortCities } from "../../components/CityOrderHelper";
import { getSelectedGrowth, setSelectedGrowth } from "../../utils/growthSelection";

function PerVehiclePage() {
  const navigate = useNavigate();

  // -------------------------------------
  // DEFAULT YEAR = 2025 SELECTED
  // -------------------------------------
  const [years, setYears] = useState(["2025"]);
  const [months, setMonths] = useState([]);

  const [summary, setSummary] = useState([]);
  const [selectedGrowth, setSelectedGrowthState] = useState(null);

  const monthOptions = [
    "Apr", "May", "Jun", "Jul", "Aug", "Sep",
    "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"
  ];

  const yearOptions = ["2024", "2025"];

  const growthOptions = [
    "SR LABOUR / VEH",
    "SR SPARES / VEH",
    "SR REVENUE /VEH",
    "BR LABOUR / VEH",
    "BR SPARES / VEH",
    "BR REVENUE /VEH",
  ];

  const growthKeyMap = {
    "SR LABOUR / VEH": "srLabourByVEH",
    "SR SPARES / VEH": "srSparesByVEH",
    "SR REVENUE /VEH": "srRevenueByVEH",
    "BR LABOUR / VEH": "brLabourByVeh",
    "BR SPARES / VEH": "brSparesByVeh",
    "BR REVENUE /VEH": "brRevenueByVeh",
  };

  // Load previously selected growth
  useEffect(() => {
    const savedGrowth = getSelectedGrowth("per_vehicle");
    if (savedGrowth) setSelectedGrowthState(savedGrowth);
  }, []);

  const readCityName = (row) =>
    row?.city || row?.City || row?.cityName || row?.CityName || row?.name || row?.Name || "";

  const readGrowthValue = (row, apiKey) => {
    const raw = row?.[apiKey];
    if (raw == null) return 0;
    const cleaned = String(raw).replace("%", "").trim();
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  // -------------------------------------
  // FETCH DATA — NOW MONTH + YEAR INCLUDED
  // -------------------------------------
  useEffect(() => {
    const fetchCitySummary = async () => {
      try {
        const activeMonths = months.length ? months : monthOptions;
        const activeYears = years.length ? years : yearOptions;

        const combined = [];

        for (const m of activeMonths) {
          let query = `?months=${m}`;

          // Add selected years
          if (activeYears.length) {
            query += `&years=${activeYears.join(",")}`;
          }

          const data = await fetchData(`/api/per_vehicle/per_vehicle_summary${query}`);
          const safeData = Array.isArray(data) ? data : data?.result || [];

          combined.push({ month: m, data: safeData });
        }

        setSummary(combined);
      } catch (error) {
        console.error("fetchCitySummary error:", error);
      }
    };

    fetchCitySummary();
  }, [months, years]); // now react when years change

  // Prepare chart data
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
        <Typography variant="h4">PER VEHICLE REPORT</Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" color="secondary" onClick={() => navigate("/DashboardHome/per_vehicle")}>Graph-CityWise</Button>
          <Button variant="contained" color="secondary" onClick={() => navigate("/DashboardHome/per_vehicle-bar-chart")}>Bar Chart-CityWise</Button>
          <Button variant="contained" color="secondary" onClick={() => navigate("/DashboardHome/per_vehicle_branches-bar-chart")}>Bar Chart-BranchWise</Button>
        </Box>
      </Box>

      {/* ----------------------------------------- */}
      {/* UPDATED FILTERS — MONTH + YEAR */}
      {/* ----------------------------------------- */}
      <SlicerFilters
        monthOptions={monthOptions}
        months={months}
        setMonths={setMonths}
        yearOptions={yearOptions}
        years={years}
        setYears={setYears}
      />

      <GrowthButtons
        growthOptions={growthOptions}
        selectedGrowth={selectedGrowth}
        setSelectedGrowth={(value) => {
          setSelectedGrowthState(value);
          setSelectedGrowth(value, "per_vehicle");
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
            decimalDigits={0}
            showPercent={false}
          />
        </Box>
      )}
    </Box>
  );
}

export default PerVehiclePage;
