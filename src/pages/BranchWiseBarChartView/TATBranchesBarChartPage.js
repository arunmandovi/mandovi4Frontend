import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
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
  Cell,
} from "recharts";
import { fetchData } from "../../api/uploadService";
import { useNavigate } from "react-router-dom";
import SlicerFilters from "../../components/SlicerFilters";
import { getBarColor } from "../../utils/getBarColor";

function TATBranchesBarChartPage() {
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
  
  const growthOptions = ["FR1", "FR2", "FR3", "PMS"];

  const growthKeyMap = {
    FR1: "firstFreeService",
    FR2: "secondFreeService",
    FR3: "thirdFreeService",
    PMS: "paidService",
  };

  // ------------------- Fetch API -------------------
  useEffect(() => {
      const fetchSummary = async () => {
        try {
          const params = new URLSearchParams();
          if (months.length > 0) params.append("months", months.join(","));
          if (cities.length > 0) params.append("cities", cities.join(","));
          if (qtrWise.length > 0) params.append("qtrWise", qtrWise.join(","));
          if (halfYear.length > 0) params.append("halfYear", halfYear.join(","));
          const endpoint = `/api/tat/tat_branch_summary${
            params.toString() ? "?" + params.toString() : ""
          }`;
          const data = await fetchData(endpoint);
          setSummary(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error("Error fetching tat tyre branch summary:", error);
          setSummary([]);
        }
      };
      fetchSummary();
    }, [months, cities, qtrWise, halfYear]);

  // ------------------- Helpers -------------------
  const readBranchName = (row) =>
    (row?.branch || row?.Branch || row?.branchName || row?.BranchName || row?.name || row?.Name || "").toString().trim();

  const readCityName = (row) =>
    (row?.city || row?.City || row?.cityName || row?.CityName || "").toString().trim();

  // Convert "HH:MM:SS" → total seconds
  const timeToSeconds = (timeStr) => {
    if (!timeStr || typeof timeStr !== "string") return 0;
    const parts = timeStr.split(":").map(Number);
    if (parts.length === 3) {
      const [h, m, s] = parts;
      return h * 3600 + m * 60 + s;
    } else if (parts.length === 2) {
      const [m, s] = parts;
      return m * 60 + s;
    } else {
      const val = parseFloat(timeStr);
      return isNaN(val) ? 0 : val;
    }
  };

  // Convert seconds → "HH:MM:SS"
  const secondsToHHMMSS = (seconds) => {
    if (isNaN(seconds)) return "00:00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  };

  const readTimeValue = (row, apiKey) => {
    if (!row || !apiKey) return 0;
    const val = row[apiKey];
    return timeToSeconds(val);
  };

  // ------------------- Data Build -------------------
  const buildCombinedAverageData = (dataArr) => {
    const apiKey = growthKeyMap[selectedGrowth];
    const totals = {};
    const counts = {};
    const cityMap = {};

    (dataArr || []).forEach((row) => {
      const branch = readBranchName(row);
      const city = readCityName(row);
      const val = readTimeValue(row, apiKey);
      if (!isNaN(val)) {
        totals[branch] = (totals[branch] || 0) + val;
        counts[branch] = (counts[branch] || 0) + 1;
        cityMap[branch] = city;
      }
    });

    const branches = Object.keys(totals).map((b) => ({
      name: b,
      city: cityMap[b],
      valueSec: counts[b] ? totals[b] / counts[b] : 0,
    }));

    branches.sort((a, b) => b.valueSec - a.valueSec);
    return branches;
  };

  const chartData =
    selectedGrowth && summary.length > 0 ? buildCombinedAverageData(summary) : [];

  // ------------------- Tooltip -------------------
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const sec = payload[0].value;
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
            {payload[0].payload.name} ({payload[0].payload.city})
          </Typography>
          <Typography variant="body2">{secondsToHHMMSS(sec)}</Typography>
        </Box>
      );
    }
    return null;
  };

  // ------------------- Inside Label -------------------
  const InsideBarLabel = (props) => {
    const { x, y, width, height, value, fill } = props;
    if (value == null || width <= 0) return null;

    const textX = x + width / 2;
    const textY = y + height / 2;
    const rotation = -90;

    // ✅ Safe luminance calculation
    let textColor = "#000000";
    try {
      if (typeof fill === "string" && fill.startsWith("rgb")) {
        const rgb = fill.match(/\d+/g);
        if (rgb && rgb.length === 3) {
          const [r, g, b] = rgb.map(Number);
          const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          textColor = luminance > 0.6 ? "#000" : "#fff";
        }
      }
    } catch {
      textColor = "#000";
    }

    return (
      <text
        x={textX}
        y={textY}
        transform={`rotate(${rotation}, ${textX}, ${textY})`}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={11}
        fill={textColor}
        fontWeight={600}
        pointerEvents="none"
      >
        {secondsToHHMMSS(value)}
      </text>
    );
  };

  // ------------------- UI -------------------
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
        <Typography variant="h4">TAT REPORT (Branch-wise)</Typography>

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
            onClick={() => navigate("/DashboardHome/tat-bar-chart")}
          >
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

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.2, mb: 2 }}>
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
                selectedGrowth === g ? `0 3px 10px rgba(0,0,0,0.15)` : "none",
              "&:hover": { transform: "scale(1.05)" },
            }}
            onClick={() => setSelectedGrowth(g)}
          >
            {g}
          </Button>
        ))}
      </Box>

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
            {selectedGrowth} — Avg TAT (HH:MM:SS)
          </Typography>

          <ResponsiveContainer width="100%" height="92%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 10, bottom: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                interval={0}
                height={70}
              />
              <YAxis
                tickFormatter={(sec) => secondsToHHMMSS(sec)}
                tick={{ fontSize: 12 }}
                label={{
                  value: "Average TAT (HH:MM:SS)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="valueSec" barSize={35} isAnimationActive={false}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.valueSec)} />
                ))}
                <LabelList dataKey="valueSec" content={<InsideBarLabel />} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Box>
  );
}

export default TATBranchesBarChartPage;
