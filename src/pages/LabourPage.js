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
import { fetchData } from "../api/uploadService";
import { useNavigate } from "react-router-dom";

function LabourPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState([]);
  const [months, setMonths] = useState([]);
  const [selectedGrowth, setSelectedGrowth] = useState(null);

  const monthOptions = [
    "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct",
    "Nov", "Dec", "Jan", "Feb", "Mar",
  ];

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

  // ---------- Fetch city summary ----------
  useEffect(() => {
    const fetchCitySummary = async () => {
      try {
        const activeMonths = months.length ? months : monthOptions;
        const combined = [];

        for (const m of activeMonths) {
          const query = `?groupBy=city&months=${m}`;
          const data = await fetchData(`/api/labour/labour_summary${query}`);

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

  // ---------- Custom Tooltip ----------
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
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
      {/* Header section with title and Bar Chart button */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">LABOUR REPORT (City-wise)</Typography>

        {/* Bar Chart Navigation Button */}
        <Button
          variant="contained"
          color="secondary"
          onClick={() => navigate("/DashboardHome/labour-bar-chart")}
        >
          Bar Chart
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Select Month(s)</InputLabel>
          <Select
            multiple
            value={months}
            onChange={(e) => setMonths(e.target.value)}
            renderValue={(selected) =>
              selected && selected.length ? selected.join(", ") : "Auto Filter"
            }
          >
            {monthOptions.map((m) => (
              <MenuItem key={m} value={m}>
                <Checkbox checked={months.indexOf(m) > -1} />
                <ListItemText primary={m} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Growth buttons */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 2 }}>
        {growthOptions.map((g) => (
          <Button
            key={g}
            variant={selectedGrowth === g ? "contained" : "outlined"}
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

export default LabourPage;
