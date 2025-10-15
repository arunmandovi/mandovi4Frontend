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

function LoaddBranchWisePage() {
  const navigate = useNavigate(); // For navigation
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
    "Free Service Growth %",
    "PMS Growth %",
    "FPR Growth %",
    "RR Growth %",
    "Others Growth %",
    "% BS on FPR Growth %",
  ];

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

  // ---------- Fetch branch summary ----------
  useEffect(() => {
    const fetchCityBranchSummary = async () => {
      try {
        const activeMonths = months.length ? months : monthOptions;
        const combined = [];
        for (const m of activeMonths) {
          const query = `?groupBy=city_branch&month=${m}`;
          const data = await fetchData(`/api/loadd/loadd_summary${query}`);
          combined.push({ month: m, data: data || [] });
        }
        setSummary(combined);
      } catch (err) {
        console.error("fetchCityBranchSummary error:", err);
      }
    };
    fetchCityBranchSummary();
  }, [months]);

  // ---------- Helpers ----------
  const readCityBranchName = (row) => {
    if (!row) return "";
    return (
      row.city_branch ||
      row.city_branch ||
      row.city_branchName ||
      row.City_branchName ||
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
    const cityBranchSet = new Set();
    summaryArr.forEach(({ data }) => {
      (data || []).forEach((row) => cityBranchSet.add(readCityBranchName(row)));
    });
    const allCities = Array.from(cityBranchSet);

    const result = summaryArr.map(({ month, data }) => {
      const entry = { month };
      allCities.forEach((c) => (entry[c] = 0));
      (data || []).forEach((row) => {
        const city_branch = readCityBranchName(row);
        const val = readGrowthValue(row, apiKey);
        const parsed = parseFloat(String(val).replace("%", "").trim());
        entry[city_branch] = isNaN(parsed) ? 0 : parsed;
      });
      return entry;
    });
    return { data: result, keys: allCities };
  };

  const { data: chartData, keys: cityBranchKeys } = buildChartData(summary);

  // ---------- Render ----------
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">
          LOAD REPORT (Branch-wise)
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => navigate("/loadd")}
        >
          City-wise View
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
              selected && selected.length ? selected.join(", ") : "All"
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
              <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
              <Legend />

              {cityBranchKeys.map((key, idx) => (
                <Line
                  key={key}
                  dataKey={key}
                  type="monotone"
                  stroke={`hsl(${(idx * 60) % 360}, 70%, 45%)`}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  isAnimationActive={false}
                >
                  {/* Always show value on each point formatted as xx.xx% */}
                  <LabelList
                    dataKey={key}
                    position="top"
                    fontSize={11}
                    formatter={(val) =>
                      isNaN(val) ? "" : `${val.toFixed(2)}%`
                    }
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

export default LoaddBranchWisePage;
