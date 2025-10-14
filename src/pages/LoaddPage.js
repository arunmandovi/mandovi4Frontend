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
  Legend,
  ResponsiveContainer,
  Tooltip,
  LabelList,
} from "recharts";
import { fetchData } from "../api/uploadService";

function LoaddPage() {
  const [loaddSummary, setLoaddSummary] = useState([]);
  const [months, setMonths] = useState([]);
  const [groupBy, setGroupBy] = useState("city");
  const [selectedGrowth, setSelectedGrowth] = useState(null);

  const monthOptions = [
    "Apr", "May", "Jun", "Jul", "Aug", "Sep",
    "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"
  ];

  const growthKeys = [
    "Service Growth %",
    "BodyShop Growth %",
    "Free Service Growth %",
    "PMS Growth %",
    "FPR Growth %",
    "RR Growth %",
    "Others Growth %",
    "% BS on FPR Growth %",
  ];

  // Mapping human-readable button labels to API keys
  const growthKeyMap = {
    "Service Growth %": "growthService",
    "BodyShop Growth %": "growthBodyShop",
    "Free Service Growth %": "growthFreeService",
    "PMS Growth %": "growthPMS",
    "FPR Growth %": "growthFPR",
    "RR Growth %": "growthRR",
    "Others Growth %": "growthOthers",
    "% BS on FPR Growth %": "growthBSFPR",
  };

  useEffect(() => {
    const fetchLoaddSummary = async () => {
      try {
        let responses = [];
        const activeMonths = months.length > 0 ? months : monthOptions;

        for (const m of activeMonths) {
          const query = `?groupBy=${groupBy}&month=${m}`;
          const data = await fetchData(`/api/loadd/loadd_summary${query}`);
          responses.push({ month: m, data });
        }

        setLoaddSummary(responses);
      } catch (error) {
        console.error(error);
        alert("❌ Error fetching Summary: " + error.message);
      }
    };

    fetchLoaddSummary();
  }, [months, groupBy]);

  // Prepare chart data: one object per month, keys = cities
  const chartData = loaddSummary.map(({ month, data }) => {
    const entry = { month };
    const apiKey = growthKeyMap[selectedGrowth];
    (data || []).forEach((r) => {
      const city = r.city || r.City;
      if (city && selectedGrowth && r[apiKey] !== undefined && r[apiKey] !== null) {
        entry[city] = parseFloat(r[apiKey].toString().replace("%", "")) || 0;
      }
    });
    return entry;
  });

  // All unique cities
  const allCities = Array.from(
    new Set(loaddSummary.flatMap(({ data }) => (data || []).map(r => r.city || r.City)))
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        LOAD REPORT
      </Typography>

      {/* Month Filter */}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Month</InputLabel>
          <Select
            multiple
            value={months}
            onChange={(e) => setMonths(e.target.value)}
            renderValue={(selected) => selected.join(", ")}
          >
            {monthOptions.map((m) => (
              <MenuItem key={m} value={m}>
                <Checkbox checked={months.indexOf(m) > -1} />
                <ListItemText primary={m} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Group By */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Group By</InputLabel>
          <Select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
            <MenuItem value="city">City</MenuItem>
            <MenuItem value="branch">Branch</MenuItem>
            <MenuItem value="city_branch">City & Branch</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Growth Buttons */}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
        {growthKeys.map((key) => (
          <Button
            key={key}
            variant={selectedGrowth === key ? "contained" : "outlined"}
            onClick={() => setSelectedGrowth(key)}
          >
            {key.replace(" Growth %", "")}
          </Button>
        ))}
      </Box>

      {/* Chart */}
      {selectedGrowth ? (
        <Box sx={{ width: "100%", height: 500 }}>
          <ResponsiveContainer>
            <LineChart
              data={chartData}
              margin={{ top: 30, right: 50, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 13, fontWeight: 600 }}
              />
              <YAxis
                tick={{ fontSize: 13, fontWeight: 600 }}
                label={{ value: "Growth %", angle: -90, position: "insideLeft", fontSize: 14 }}
              />
              <Tooltip />
              <Legend />
              {allCities.map((city, idx) => (
                <Line
                  key={city}
                  type="monotone"
                  dataKey={city}
                  stroke={`hsl(${(idx * 70) % 360}, 70%, 50%)`}
                  strokeWidth={3}
                  dot={{ r: 4 }}
                >
                  <LabelList
                    dataKey={city}
                    formatter={(value) => `${value}%`}
                    position="top"
                  />
                </Line>
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Box>
      ) : (
        <Typography variant="body1" sx={{ mt: 2 }}>
          👆 Select any growth type above to view its Month-wise City chart.
        </Typography>
      )}
    </Box>
  );
}

export default LoaddPage;
