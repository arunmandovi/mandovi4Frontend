import React, { useState, useEffect } from "react";
import { Box, Button, Typography, CircularProgress } from "@mui/material";
import { fetchData } from "../../api/uploadService";
import { useNavigate } from "react-router-dom";
import SlicerFilters from "../../components/SlicerFilters";
import GrowthButtons from "../../components/GrowthButtons";
import { sortCities } from "../../components/CityOrderHelper";
import GrowthLineChart from "../../components/GrowthLineChart";

function VASPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState([]);
  const [months, setMonths] = useState([]);
  const [selectedGrowth, setSelectedGrowth] = useState(null);
  const [loading, setLoading] = useState(false);

  const monthOptions = [
    "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct",
    "Nov", "Dec", "Jan", "Feb", "Mar",
  ];

  const growthOptions = [
    "Diagnostic Charges %",
    "Wheel Alignment Age %",
    "Wheel Balancing Age %",
    "Exterior Cleaning Age %",
    "Interior Cleaning Age %",
    "UndreBody Coating Age %",
    "TopBody Coating Age %",
    "Rat Mesh Age %",
    "AC Evaporator Age %",
    "AC Vent Age %",
    "Plastic Restorer Age %"
  ];

  const growthKeyMap = {
    "Diagnostic Charges %": "diagnosticChargesPercentagePMSLoad",
    "Wheel Alignment Age %": "wheelAlignmentPercentageAge",
    "Wheel Balancing Age %": "wheelBalancingPercentageAge",
    "Exterior Cleaning Age %": "exteriorCleaningPercentageAge",
    "Interior Cleaning Age %": "interiorCleaningPercentageAge",
    "UndreBody Coating Age %": "underBodyCoatingPercentageAge",
    "TopBody Coating Age %": "topBodyPercentageAge",
    "Rat Mesh Age %": "ratMeshPercentageAge",
    "AC Evaporator Age %": "acEvaporatorPercentageAge",
    "AC Vent Age %": "acVentPercentageAge",
    "Plastic Restorer Age %": "plasticRestorerPercentageAge"
  };
  const readCityName = (row) =>
    row?.city || row?.City || row?.cityName || row?.CityName || row?.name || row?.Name || "";

  useEffect(() => {
    const fetchCitySummary = async () => {
      try {
        setLoading(true);
        const activeMonths = months.length ? months : monthOptions;
        const allMonthsData = [];

        for (const m of activeMonths) {
          const res = await fetchData(`/api/vas/vas_summary?&months=${m}`);
          const safeArray = Array.isArray(res)
            ? res
            : Array.isArray(res?.result)
            ? res.result
            : [];
          allMonthsData.push({ month: m, data: safeArray });
        }

        setSummary(allMonthsData);
      } catch (err) {
        console.error("fetchCitySummary error:", err);
        setSummary([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCitySummary();
  }, [months]);

  const buildChartData = () => {
    if (!selectedGrowth || summary.length === 0) return { formatted: [], sortedCities: [] };

    const apiKey = growthKeyMap[selectedGrowth];
    const cities = new Set();

    summary.forEach(({ data }) =>
      (data || []).forEach((r) => cities.add(readCityName(r)))
    );

    const sortedCities = sortCities([...cities]);

    const formatted = summary.map(({ month, data }) => {
      const entry = { month };
      sortedCities.forEach((c) => (entry[c] = 0));

      (data || []).forEach((row) => {
        const city = readCityName(row);
        const raw = row?.[apiKey];
        const val = parseFloat(String(raw ?? 0).replace("%", ""));
        entry[city] = isNaN(val) ? 0 : val;
      });

      return entry;
    });

    return { formatted, sortedCities };
  };

  const { formatted: chartData, sortedCities: cityKeys } = buildChartData();

  return (
    <Box sx={{ p: 3 }}>
      {/* HEADER */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">VAS REPORT</Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate("/DashboardHome/vas-bar-chart")}
          >
            CityWise
          </Button>

          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate("/DashboardHome/vas_branches-bar-chart")}
          >
            BranchWise
          </Button>
        </Box>
      </Box>

      {/* FILTERS */}
      <SlicerFilters monthOptions={monthOptions} months={months} setMonths={setMonths} />

      {/* GROWTH SELECT */}
      <GrowthButtons
        growthOptions={growthOptions}
        selectedGrowth={selectedGrowth}
        setSelectedGrowth={setSelectedGrowth}
      />

      {/* Loading Indicator */}
      {loading && (
        <Box sx={{ textAlign: "center", my: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Main Chart */}
      {!loading && selectedGrowth && chartData.length > 0 ? (
        <Box sx={{ mt: 2, height: 520, background: "#fff", borderRadius: 2, boxShadow: 3, p: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            {selectedGrowth}
          </Typography>
          <GrowthLineChart
            chartData={chartData}
            cityKeys={cityKeys}
            decimalDigits={0}
            showPercentage={true}
          />
        </Box>
      ) : !loading && selectedGrowth ? (
        <Typography>No data found for selected filters</Typography>
      ) : (
        <Typography>Select a growth type to view the chart</Typography>
      )}
    </Box>
  );
}

export default VASPage;
