import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { fetchData } from "../../api/uploadService";
import { useNavigate } from "react-router-dom";
import SlicerFilters from "../../components/SlicerFilters";

function TATBarChartPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState([]);
  const [months, setMonths] = useState([]);
  const [qtrWise, setQtrWise] = useState([]);
  const [halfYear, setHalfYear] = useState([]);
  const [selectedGrowth, setSelectedGrowth] = useState(null);

  // ---------- Filter Options ----------
  const monthOptions = [
    "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct",
    "Nov", "Dec", "Jan", "Feb", "Mar",
  ];

  const qtrWiseOptions = ["Qtr1", "Qtr2", "Qtr3", "Qtr4"];
  const halfYearOptions = ["H1", "H2"];

  const growthOptions = ["FR1", "FR2", "FR3", "PMS"];

  const growthKeyMap = {
    FR1: "firstFreeService",
    FR2: "secondFreeService",
    FR3: "thirdFreeService",
    PMS: "paidService",
  };

  const preferredOrder = ["Bangalore", "Mysore", "Mangalore"];

  // ---------- Fetch data ----------
  useEffect(() => {
    const fetchCitySummary = async () => {
      try {
        const activeMonths = months.length ? months : [];
        const activeQtrWise = qtrWise.length ? qtrWise : [];
        const activeHalfYear = halfYear.length ? halfYear : [];

        // ✅ Build query dynamically
        const queryParams = new URLSearchParams();
        if (activeMonths.length) queryParams.append("months", activeMonths.join(","));
        if (activeQtrWise.length) queryParams.append("qtrWise", activeQtrWise.join(","));
        if (activeHalfYear.length) queryParams.append("halfYear", activeHalfYear.join(","));

        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
        const data = await fetchData(`/api/tat/tat_summary${queryString}`);

        if (data && data.length > 0) {
          setSummary(data);
        } else {
          setSummary([]);
        }
      } catch (err) {
        console.error("fetchCitySummary error:", err);
        setSummary([]);
      }
    };

    fetchCitySummary();
  }, [months, qtrWise, halfYear]);

  // ---------- Helpers ----------
  const readCityName = (row) => {
    if (!row) return "";
    return (
      row.city ||
      row.City ||
      row.cityName ||
      row.CityName ||
      row.name ||
      row.Name ||
      ""
    )
      .toString()
      .trim();
  };

  const readGrowthValue = (row, apiKey) => {
    if (!row || !apiKey) return undefined;
    const val = row[apiKey];
    if (!val) return 0;

    // If it's in HH:MM:SS, convert to seconds
    if (typeof val === "string" && val.includes(":")) {
      const parts = val.split(":").map(Number);
      return parts[0] * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
    }

    return parseFloat(val);
  };

  const formatSecondsToHHMMSS = (seconds) => {
    if (isNaN(seconds)) return "00:00:00";
    const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
    const s = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  // ---------- Build averaged dataset ----------
  const buildCombinedAverageData = (dataArr) => {
    const apiKey = growthKeyMap[selectedGrowth];
    const cityTotals = {};
    const cityCounts = {};

    (dataArr || []).forEach((row) => {
      const city = readCityName(row);
      const val = readGrowthValue(row, apiKey);
      if (!isNaN(val)) {
        cityTotals[city] = (cityTotals[city] || 0) + val;
        cityCounts[city] = (cityCounts[city] || 0) + 1;
      }
    });

    const allCitiesUnordered = Object.keys(cityTotals);
    const allCities = [
      ...preferredOrder.filter((c) =>
        allCitiesUnordered.some((x) => x.toLowerCase() === c.toLowerCase())
      ),
      ...allCitiesUnordered
        .filter(
          (c) => !preferredOrder.some((p) => p.toLowerCase() === c.toLowerCase())
        )
        .sort((a, b) => a.localeCompare(b)),
    ];

    return allCities.map((city) => ({
      city,
      value: cityCounts[city] ? cityTotals[city] / cityCounts[city] : 0,
    }));
  };

  const chartData =
    selectedGrowth && summary.length > 0 ? buildCombinedAverageData(summary) : [];

  // ---------- Custom Tooltip ----------
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            background: "white",
            border: "1px solid #ccc",
            borderRadius: 1,
            p: 1,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {payload[0].payload.city}
          </Typography>
          <Typography variant="body2">
            {formatSecondsToHHMMSS(payload[0].value)}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  // ---------- Render ----------
  return (
    <Box sx={{ p: 3 }}>
      {/* Header Buttons */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">TAT REPORT (City-wise)</Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate("/DashboardHome/tat")}
          >
            Graph
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() =>
              navigate("/DashboardHome/tat_branches-bar-chart")
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
                  ? `linear-gradient(90deg, hsl(${idx * 40}, 70%, 45%), hsl(${
                      (idx * 40 + 20) % 360
                    }, 70%, 55%))`
                  : "transparent",
              color: selectedGrowth === g ? "white" : "inherit",
              boxShadow:
                selectedGrowth === g
                  ? `0 3px 10px rgba(0,0,0,0.15)`
                  : "none",
              "&:hover": {
                transform: "scale(1.05)",
                background:
                  selectedGrowth === g
                    ? `linear-gradient(90deg, hsl(${idx * 40}, 65%, 40%), hsl(${
                        (idx * 40 + 20) % 360
                      }, 65%, 50%))`
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
        <Typography>👆 Select a service type to view the chart below</Typography>
      ) : summary.length === 0 ? (
        <Typography>No data available for the selected criteria.</Typography>
      ) : (
        <Box
          sx={{
            mt: 2,
            width: "100%",
            height: 520,
            background: "#fff",
            borderRadius: 2,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            p: 2,
          }}
        >
          <Typography variant="h6" sx={{ mb: 1 }}>
            {selectedGrowth} — Average TAT
          </Typography>

          <ResponsiveContainer width="100%" height="92%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="city" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(val) => formatSecondsToHHMMSS(val)}
                label={{
                  value: "TAT (HH:MM:SS)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="value"
                fill="#1976d2"
                barSize={35}
                isAnimationActive={false}
              >
                <LabelList
                  dataKey="value"
                  position="top"
                  fontSize={11}
                  content={(props) => {
                    const { x, y, value } = props;
                    if (value == null) return null;
                    return (
                      <text
                        x={x}
                        y={y - 5}
                        textAnchor="middle"
                        fontSize={11}
                        fill="#333"
                      >
                        {formatSecondsToHHMMSS(value)}
                      </text>
                    );
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Box>
  );
}

export default TATBarChartPage;
