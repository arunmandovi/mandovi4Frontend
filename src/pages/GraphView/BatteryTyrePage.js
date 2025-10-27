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
import SlicerFilters from "../../components/SlicerFilters";

function BatteryTyrePage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState([]);
  const [months, setMonths] = useState([]);
  const [selectedGrowth, setSelectedGrowth] = useState(null);

  const monthOptions = [
    "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct",
    "Nov", "Dec", "Jan", "Feb", "Mar",
  ];

  const growthOptions = [
    "Battery Propfit %",
    "Tyre Profit %",
    "Battery&Tyre Profit %",
  ];

  const growthKeyMap = {
    "Battery Propfit %": "batteryPercentageProfit",
    "Tyre Profit %": "tyrePercentageProfit",
    "Battery&Tyre Profit %": "batteryTyrePercentageProfit",
  };

  // ---------- Fetch city summary ----------
  useEffect(() => {
    const fetchCitySummary = async () => {
      try {
        const activeMonths = months.length ? months : monthOptions;
        const combined = [];

        for (const m of activeMonths) {
          const query = `?groupBy=city&months=${m}`;
          const data = await fetchData(`/api/battery_tyre/battery_tyre_summary${query}`);

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
    ).toString().trim();
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
      if (typeof v === "string" && v.trim().match(/^-?\d+(\.\d+)?%?$/)) return v;
    }
    return undefined;
  };

  const buildChartData = (summaryArr) => {
    const apiKey = growthKeyMap[selectedGrowth];
    const citySet = new Set();

    summaryArr.forEach(({ data }) => {
      (data || []).forEach((row) => citySet.add(readCityName(row)));
    });

    // ---------- Fixed city order ----------
    const preferredOrder = ["Bangalore", "Mysore", "Mangalore"];
    const allCitiesUnordered = Array.from(citySet);
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

    const result = summaryArr.map(({ month, data }) => {
      const entry = { month };
      allCities.forEach((c) => (entry[c] = 0));
      (data || []).forEach((row) => {
        const city = readCityName(row);
        const val = readGrowthValue(row, apiKey);
        const parsed = parseFloat(String(val).replace("%", "").trim());
        entry[city] = isNaN(parsed) ? 0 : parsed;
      });
      return entry;
    });
    return { data: result, keys: allCities };
  };

  const { data: chartData, keys: cityKeys } = buildChartData(summary);
  const isPercentageGrowth = selectedGrowth?.includes("%");

  // ---------- Custom Tooltip ----------
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // Sort tooltip data in the same fixed city order
      const preferredOrder = ["Bangalore", "Mysore", "Mangalore"];
      const sortedPayload = [
        ...payload.filter((p) =>
          preferredOrder.some((x) => x.toLowerCase() === p.name.toLowerCase())
        ),
        ...payload.filter(
          (p) => !preferredOrder.some((x) => x.toLowerCase() === p.name.toLowerCase())
        ),
      ];

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
            {label}
          </Typography>
          {sortedPayload.map((entry, i) => (
            <Typography
              key={i}
              variant="body2"
              sx={{ color: entry.color }}
            >{`${entry.name}: ${entry.value?.toFixed(2)}%`}</Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  // ---------- Render ----------
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
        <Typography variant="h4">BATTERY & TYRE REPORT</Typography>

        {/* Bar Chart Navigation Button */}
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={() => navigate("/DashboardHome/battery_tyre-bar-chart")}
                        >
                          Bar Chart
                        </Button>
      </Box>

      {/* Filters Section */}
      <SlicerFilters
      monthOptions={monthOptions}
      months={months}
      setMonths={setMonths}
      />

      {/* 🔹 Stylish Growth Type Buttons */}
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
                  {g.replace(" Growth %", "")}
                </Button>
              ))}
      </Box>

      {!selectedGrowth ? (
        <Typography>👆 Select a growth type to view the chart below</Typography>
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
                label={{
                  value: "Growth %",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{
                  display: "flex",
                  flexDirection: "row",
                }}
                payload={cityKeys.map((key, idx) => ({
                  value: key,
                  type: "line",
                  color: `hsl(${(idx * 60) % 360}, 70%, 45%)`,
                }))}
              />

              {cityKeys.map((key, idx) => (
                <Line
                  key={key}
                  dataKey={key}
                  type="monotone"
                  stroke={`hsl(${(idx * 60) % 360}, 70%, 45%)`}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  isAnimationActive={false}
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
                          y={y - 5}
                          textAnchor="middle"
                          fontSize={11}
                          fill="#333"
                        >
                          {`${Number(value).toFixed(2)}%`}
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

export default BatteryTyrePage;
