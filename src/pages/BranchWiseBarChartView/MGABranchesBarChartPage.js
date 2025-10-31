import React, { useState, useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";
import { fetchData } from "../../api/uploadService";
import { useNavigate } from "react-router-dom";
import SlicerFilters from "../../components/SlicerFilters";
import CityBarChart from "../../components/CityBarChart"; // ✅ External reusable chart

function MGABranchesBarChartPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState([]);
  const [months, setMonths] = useState([]);
  const [qtrWise, setQtrWise] = useState([]);
  const [halfYear, setHalfYear] = useState([]);
  const [selectedGrowth, setSelectedGrowth] = useState(null);

  // ---------- Dropdown Options ----------
  const monthOptions = [
    "Apr", "May", "Jun", "Jul", "Aug", "Sep",
    "Oct", "Nov", "Dec", "Jan", "Feb", "Mar",
  ];
  const qtrWiseOptions = ["Qtr1", "Qtr2", "Qtr3", "Qtr4"];
  const halfYearOptions = ["H1", "H2"];

  const growthOptions = [
    "MGA By VEH",
  ];

  const growthKeyMap = {
    "MGA By VEH": "mgaVeh",
  };

  const preferredOrder = ["BANGALORE", "MYSORE", "MANGALORE"];

  // ---------- Fetch Data ----------
  useEffect(() => {
    const fetchCitySummary = async () => {
      try {
        const params = new URLSearchParams();
        if (months.length) params.append("months", months.join(","));
        if (qtrWise.length) params.append("qtrWise", qtrWise.join(","));
        if (halfYear.length) params.append("halfYear", halfYear.join(","));
        params.append("groupBy", "city");

        const query = `?${params.toString()}`;
        const data = await fetchData(`/api/mga/mga_summary${query}`);

        if (data && Array.isArray(data)) setSummary(data);
        else setSummary([]);
      } catch (err) {
        console.error("fetchCitySummary error:", err);
      }
    };
    fetchCitySummary();
  }, [months, qtrWise, halfYear]);

  // ---------- Helpers ----------
  const readCityName = (row) =>
    (row?.city || row?.City || row?.cityName || row?.CityName || row?.name || row?.Name || "")
      .toString()
      .trim()
      .toUpperCase();

  const readGrowthValue = (row, apiKey) =>
    parseFloat(row?.[apiKey] ?? 0);

  const buildChartData = (summaryArr) => {
    const apiKey = growthKeyMap[selectedGrowth];
    return summaryArr
      .map((row) => ({
        city: readCityName(row),
        value: readGrowthValue(row, apiKey),
      }))
      .sort((a, b) => {
        const aIndex = preferredOrder.indexOf(a.city);
        const bIndex = preferredOrder.indexOf(b.city);
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        return a.city.localeCompare(b.city);
      });
  };

  const chartData =
    selectedGrowth && summary.length > 0 ? buildChartData(summary) : [];

  // ---------- Render ----------
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
        <Typography variant="h4">MGA REPORT (City-wise)</Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate("/DashboardHome/mga")}
          >
            Graph
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() =>
              navigate("/DashboardHome/mga_branches-bar-chart")
            }
          >
            BranchWise
          </Button>
        </Box>
      </Box>

      {/* Filters Section */}
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

      {/* Growth Type Buttons */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1.2,
          mb: 2,
        }}
      >
        {growthOptions.map((g, idx) => (
          <Button
            key={g}
            variant={selectedGrowth === g ? "contained" : "outlined"}
            color={selectedGrowth === g ? "secondary" : "primary"}
            sx={{
              borderRadius: "20px",
              px: 2,
              py: 0.5,
              textTransform: "none",
              fontWeight: 600,
              transition: "all 0.3s ease",
              background:
                selectedGrowth === g
                  ? `linear-gradient(90deg, hsl(${idx * 40}, 70%, 45%), hsl(${(idx * 40 + 20) % 360}, 70%, 55%))`
                  : "transparent",
              color: selectedGrowth === g ? "white" : "inherit",
              boxShadow:
                selectedGrowth === g ? `0 3px 10px rgba(0,0,0,0.15)` : "none",
              "&:hover": {
                transform: "scale(1.05)",
                background:
                  selectedGrowth === g
                    ? `linear-gradient(90deg, hsl(${idx * 40}, 65%, 40%), hsl(${(idx * 40 + 20) % 360}, 65%, 50%))`
                    : "rgba(103,58,183,0.05)",
              },
            }}
            onClick={() => setSelectedGrowth(g)}
          >
            {g}
          </Button>
        ))}
      </Box>

      {/* Chart Section */}
      {!selectedGrowth ? (
        <Typography>👆 Select a growth type to view the chart below</Typography>
      ) : chartData.length === 0 ? (
        <Typography>No data available for the selected criteria.</Typography>
      ) : (
        <CityBarChart
          chartData={chartData}
          selectedGrowth={selectedGrowth}
          decimalPlaces={0}
          showPercent={selectedGrowth.includes("%")}
        />
      )}
    </Box>
  );
}

export default MGABranchesBarChartPage;
