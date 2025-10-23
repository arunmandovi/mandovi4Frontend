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

function BRConversionBarChartPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState([]);
  const [months, setMonths] = useState([]);
  const [selectedGrowth, setSelectedGrowth] = useState(null);

  const monthOptions = [
    "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct",
    "Nov", "Dec", "Jan", "Feb", "Mar",
  ];

  const growthOptions = [
    "Arena BR Conversion %",
    "Nexa BR Conversion %",
    "Arena&Nexa BR Conversion %",
    "Arena Total Amount",
    "Nexa Total Amount",
    "Arena&Nexa Total Amount",
  ];

  const growthKeyMap = {
    "Arena BR Conversion %": "arenaPercentageBRConversion",
    "Nexa BR Conversion %": "nexaPercentageBRConversion",
    "Arena&Nexa BR Conversion %": "arenaNexaPercentageBRConversion",
    "Arena Total Amount": "arenaTotalAmount",
    "Nexa Total Amount": "nexaTotalAmount",
    "Arena&Nexa Total Amount": "arenaNexaTotalAmount",
  };

  const preferredOrder = ["BANGALORE", "MYSORE", "MANGALORE"];

  // ---------- Fetch data ----------
  useEffect(() => {
    const fetchCitySummary = async () => {
      try {
        // send all selected months in one call
        const activeMonths = months.length ? months.map(m => m.toLowerCase()) : monthOptions.map(m => m.toLowerCase());
        const query = `?groupBy=city${activeMonths.map(m => `&months=${m}`).join("")}`;
        const data = await fetchData(`/api/br_conversion/br_conversion_summary${query}`);
        if (data && data.length > 0) {
          setSummary(data);
        } else {
          setSummary([]);
        }
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
    ).toString().trim().toUpperCase();
  };

  const readGrowthValue = (row, apiKey) => {
    if (!row || !apiKey) return 0;
    return parseFloat(row[apiKey] ?? 0);
  };

  // ---------- Build chart data ----------
  const buildChartData = (summaryArr) => {
    return summaryArr.map((row) => ({
      city: readCityName(row),
      value: readGrowthValue(row, growthKeyMap[selectedGrowth]),
    }))
    .sort((a, b) => {
      // ensure preferred order first
      const aIndex = preferredOrder.indexOf(a.city);
      const bIndex = preferredOrder.indexOf(b.city);
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return a.city.localeCompare(b.city);
    });
  };

  const chartData = selectedGrowth && summary.length > 0 ? buildChartData(summary) : [];
  const isPercentageGrowth = selectedGrowth?.includes("%");

  // ---------- Custom Tooltip ----------
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { city, value } = payload[0].payload;
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
            {city}
          </Typography>
          <Typography variant="body2">
            {isPercentageGrowth
              ? `${value.toFixed(2)}%`
              : `₹ ${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  // ---------- Render ----------
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">BR CONVERSION REPORT (City-wise)</Typography>

        <Button
          variant="contained"
          color="secondary"
          onClick={() => navigate("/DashboardHome/br_conversion")}
        >
          Graph
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
            renderValue={(selected) => selected.length ? selected.join(", ") : "All Months"}
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
            {g}
          </Button>
        ))}
      </Box>

      {!selectedGrowth ? (
        <Typography>👆 Select a growth type to view the chart below</Typography>
      ) : chartData.length === 0 ? (
        <Typography>No data available for the selected criteria.</Typography>
      ) : (
        <Box sx={{ mt: 2, width: "100%", height: 520, background: "#fff", borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", p: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>{selectedGrowth}</Typography>

          <ResponsiveContainer width="100%" height="92%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="city" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 12 }}
                label={{ value: isPercentageGrowth ? "Growth %" : "Amount (₹)", angle: -90, position: "insideLeft" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              <Bar dataKey="value" fill="#1976d2" barSize={35} isAnimationActive={false}>
                <LabelList
                  dataKey="value"
                  position="top"
                  fontSize={11}
                  content={({ x, y, value }) => {
                    if (value == null) return null;
                    const displayVal = isPercentageGrowth
                      ? `${Number(value).toFixed(2)}%`
                      : `₹ ${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
                    return <text x={x} y={y - 5} textAnchor="middle" fontSize={11} fill="#333">{displayVal}</text>;
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

export default BRConversionBarChartPage;
