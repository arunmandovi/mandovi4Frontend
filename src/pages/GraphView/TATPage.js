import React, { useState, useEffect } from "react";
import {
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Checkbox,
  ListItemText,
  Button,
} from "@mui/material";

import {
  LineChart,
  Line,
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
import GrowthButtons from "../../components/GrowthButtons";
import SlicerFilters from "../../components/SlicerFilters";
import { getSelectedGrowth, setSelectedGrowth } from "../../utils/growthSelection";

function TATPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState([]);
  const [months, setMonths] = useState([]);

  const [selectedGrowth, setSelectedGrowthState] = useState(null);

  useEffect(() => {
    const saved = getSelectedGrowth("tat");
    if (saved) setSelectedGrowthState(saved);
  }, []);

  const monthOptions = [
    "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct",
    "Nov", "Dec", "Jan", "Feb", "Mar",
  ];

  const growthOptions = ["FR1", "FR2", "FR3", "PMS"];

  const growthKeyMap = {
    FR1: "firstFreeService",
    FR2: "secondFreeService",
    FR3: "thirdFreeService",
    PMS: "paidService",
  };

  const preferredOrder = ["Bangalore", "Mysore", "Mangalore"];

  // ---------- Fetch city summary ----------
  useEffect(() => {
    const fetchCitySummary = async () => {
      try {
        const activeMonths = months.length ? months : monthOptions;
        const combined = [];

        for (const m of activeMonths) {
          const query = `?groupBy=city&months=${m}`;
          const data = await fetchData(`/api/tat/tat_summary${query}`);

          if (
            (data && data.length > 0) ||
            (months.length > 0 && months.includes(m))
          ) {
            combined.push({ month: m, data });
          }
        }

        setSummary(combined);
      } catch (err) {
        console.error("fetchCitySummary error:", err);
      }
    };
    fetchCitySummary();
  }, [months]);

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
    const candidates = [
      apiKey,
      apiKey.toLowerCase(),
      apiKey.toUpperCase(),
      apiKey.replace(/([A-Z])/g, "_$1").toLowerCase(),
      "value",
      "growth",
      "val",
    ];
    for (const key of candidates) {
      if (Object.prototype.hasOwnProperty.call(row, key) && row[key] != null)
        return row[key];
    }
    for (const key of Object.keys(row)) {
      const v = row[key];
      if (typeof v === "number") return v;
      if (typeof v === "string" && v.trim().match(/^-?\d+(\.\d+)?%?$/))
        return v;
    }
    return undefined;
  };

  const formatSecondsToHHMMSS = (seconds) => {
    if (isNaN(seconds)) return "00:00:00";
    const h = Math.floor(seconds / 3600)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const buildChartData = (summaryArr) => {
    const apiKey = growthKeyMap[selectedGrowth];
    const citySet = new Set();
    summaryArr.forEach(({ data }) => {
      (data || []).forEach((row) => citySet.add(readCityName(row)));
    });
    const allCities = Array.from(citySet);

    const result = summaryArr.map(({ month, data }) => {
      const entry = { month };
      allCities.forEach((c) => (entry[c] = 0));
      (data || []).forEach((row) => {
        const city = readCityName(row);
        const val = readGrowthValue(row, apiKey);
        let parsed = 0;

        if (typeof val === "string" && val.includes(":")) {
          const parts = val.split(":").map(Number);
          parsed = parts[0] * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
        } else {
          parsed = parseFloat(String(val).replace("%", "").trim());
        }

        entry[city] = isNaN(parsed) ? 0 : parsed;
      });
      return entry;
    });

    return { data: result, keys: allCities };
  };

  const { data: chartData, keys: cityKeys } = buildChartData(summary);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0) return null;

    const sortedPayload = [...payload].sort((a, b) => {
      const aCity = a.name;
      const bCity = b.name;
      const aIndex = preferredOrder.indexOf(aCity);
      const bIndex = preferredOrder.indexOf(bCity);

      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return aCity.localeCompare(bCity);
    });

    return (
      <Box
        sx={{
          background: "#fff",
          border: "1px solid #ccc",
          borderRadius: 1,
          p: 1.2,
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        }}
      >
        <Typography sx={{ fontWeight: "bold", mb: 0.5 }}>{label}</Typography>
        {sortedPayload.map((entry, index) => (
          <Typography
            key={index}
            sx={{ color: entry.stroke, fontSize: 13, lineHeight: 1.3 }}
          >
            {entry.name}: {formatSecondsToHHMMSS(entry.value)}
          </Typography>
        ))}
      </Box>
    );
  };

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
        <Typography variant="h4">TAT REPORT</Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button variant="contained" color="secondary" onClick={() => navigate("/DashboardHome/tat")}>Graph-BranchWise</Button>
            <Button variant="contained" color="secondary" onClick={() => navigate("/DashboardHome/tat-bar-chart")}>Bar Chart-CityWise</Button>
            <Button variant="contained" color="secondary" onClick={() => navigate("/DashboardHome/tat_branches-bar-chart")}>Bar Chart-BranchWise</Button>
          </Box>
        </Box>
      </Box>

      <SlicerFilters monthOptions={monthOptions} months={months} setMonths={setMonths} />

      <GrowthButtons
        growthOptions={growthOptions}
        selectedGrowth={selectedGrowth}
        setSelectedGrowth={(value) => {
          setSelectedGrowthState(value);
          setSelectedGrowth(value, "tat");
        }}
      />

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
            {selectedGrowth}
          </Typography>

          <ResponsiveContainer width="100%" height="92%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
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

              {/* ---------- GLOW GRADIENTS ---------- */}
              <defs>
                {cityKeys.map((key, idx) => {
                  const hue = (idx * 60) % 360;
                  return (
                    <linearGradient
                      id={`color-${key}`}
                      key={idx}
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="1"
                    >
                      <stop offset="0%" stopColor={`hsl(${hue}, 100%, 70%)`} stopOpacity={1} />
                      <stop offset="50%" stopColor={`hsl(${hue}, 100%, 55%)`} stopOpacity={0.9} />
                      <stop offset="100%" stopColor={`hsl(${hue}, 100%, 40%)`} stopOpacity={0.8} />
                    </linearGradient>
                  );
                })}
              </defs>

              {/* ---------- NEON SHINING LINES ---------- */}
              {cityKeys.map((key, idx) => (
                <Line
                  key={key}
                  dataKey={key}
                  type="monotone"
                  stroke={`url(#color-${key})`}
                  strokeWidth={4}
                  dot={{
                    r: 5,
                    fill: `hsl(${(idx * 60) % 360}, 100%, 65%)`,
                    stroke: "white",
                    strokeWidth: 1.5,
                  }}
                  activeDot={{
                    r: 7,
                    fill: `hsl(${(idx * 60) % 360}, 100%, 75%)`,
                    stroke: "#fff",
                    strokeWidth: 2,
                    style: { filter: "drop-shadow(0 0 6px rgba(255,255,255,0.8))" },
                  }}
                  isAnimationActive={true}
                  animationDuration={1300}
                  animationEasing="ease-out"
                  style={{
                    filter: `
                      drop-shadow(0 0 5px hsla(0,0%,100%,0.6))
                      drop-shadow(0 0 8px hsla(0,0%,100%,0.45))
                      drop-shadow(0 3px 4px rgba(0,0,0,0.25))
                    `,
                  }}
                >
                  <LabelList
                    dataKey={key}
                    position="top"
                    fontSize={11}
                    content={(props) => {
                      const { x, y, value } = props;
                      if (value == null) return null;
                      return (
                        <text
                          x={x}
                          y={y - 6}
                          textAnchor="middle"
                          fontSize={11}
                          fill="#333"
                          style={{
                            paintOrder: "stroke",
                            stroke: "white",
                            strokeWidth: 2,
                          }}
                        >
                          {formatSecondsToHHMMSS(value)}
                        </text>
                      );
                    }}
                  />
                </Line>
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Box>
  );
}

export default TATPage;
