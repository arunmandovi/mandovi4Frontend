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
  Cell,
} from "recharts";
import { fetchData } from "../../api/uploadService";
import { useNavigate } from "react-router-dom";
import SlicerFilters from "../../components/SlicerFilters";
import { getBarColor} from "../../utils/getBarColor";
import InsideBarLabel from "../../utils/InsideBarLabel";

function MSGPBranchesBarChartPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState([]);
  const [months, setMonths] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedGrowth, setSelectedGrowth] = useState(null);

  const monthOptions = [
    "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct",
    "Nov", "Dec", "Jan", "Feb", "Mar",
  ];

  const cityOptions = ["Bangalore", "Mysore", "Mangalore"];

  const growthOptions = [
    "SR&BR Growth %",
    "Service Growth %",
    "BodyShop Growth %",
    "Free Service Growth %",
    "PMS Growth %",
    "RR Growth %",
    "Others Growth %",
  ];

  const growthKeyMap = {
    "SR&BR Growth %": "growthSRBS",
    "Service Growth %": "growthService",
    "BodyShop Growth %": "growthBodyShop",
    "Free Service Growth %": "growthFreeService",
    "PMS Growth %": "growthPMS",
    "RR Growth %": "growthRR",
    "Others Growth %": "growthOthers",
  };

  // ---------- Fetch branch summary ----------
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const activeMonths = months.length ? months : monthOptions;
        const monthQuery = activeMonths.join(",");
        const cityQuery = cities.length ? `&cities=${cities.join(",")}` : "";

        const query = `?months=${monthQuery}${cityQuery}`;
        const data = await fetchData(`/api/msgp/msgp_branch_summary${query}`);

        if (data && data.length > 0) setSummary(data);
        else setSummary([]);
      } catch (err) {
        console.error("fetchSummary error:", err);
      }
    };

    fetchSummary();
  }, [months, cities]);

  // ---------- Helpers ----------
  const readBranchName = (row) => {
    if (!row) return "";
    return (
      row.branch ||
      row.Branch ||
      row.branchName ||
      row.BranchName ||
      row.name ||
      row.Name ||
      ""
    ).toString().trim();
  };

  const readCityName = (row) => {
    if (!row) return "";
    return (
      row.city ||
      row.City ||
      row.cityName ||
      row.CityName ||
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

  // ---------- Build averaged dataset ----------
  const buildCombinedAverageData = (dataArr) => {
    const apiKey = growthKeyMap[selectedGrowth];
    const totals = {};
    const counts = {};
    const cityMap = {};

    (dataArr || []).forEach((row) => {
      const branch = readBranchName(row);
      const city = readCityName(row);
      const val = readGrowthValue(row, apiKey);
      const parsed = parseFloat(String(val).replace("%", "").trim());
      if (!isNaN(parsed)) {
        totals[branch] = (totals[branch] || 0) + parsed;
        counts[branch] = (counts[branch] || 0) + 1;
        cityMap[branch] = city;
      }
    });

    const branches = Object.keys(totals).map((b) => ({
      name: b,
      city: cityMap[b],
      value: counts[b] ? totals[b] / counts[b] : 0,
    }));

    // Sort by growth value (descending)
    branches.sort((a, b) => b.value - a.value);

    return branches;
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
            {payload[0].payload.name} ({payload[0].payload.city})
          </Typography>
          <Typography variant="body2">
            {`${payload[0].value.toFixed(2)}%`}
          </Typography>
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
        <Typography variant="h4">MSGP REPORT (Branch-wise)</Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate("/DashboardHome/msgp")}
          >
            Graph
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate("/DashboardHome/msgp-bar-chart")}
          >
            CityWise
          </Button>
        </Box>
      </Box>

      {/* Filters Section */}
      <SlicerFilters
      monthOptions={monthOptions}
      cityOptions={cityOptions}
      months={months}
      setMonths={setMonths}
      cities={cities}
      setCities={setCities}
      />

      {/* Growth Buttons */}
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
              "&:hover": {
                transform: "scale(1.05)",
              },
            }}
            onClick={() => setSelectedGrowth(g)}
          >
            {g.replace(" Growth %", "")}
          </Button>
        ))}
      </Box>

      {/* Chart Display */}
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
                tick={{ fontSize: 12 }}
                label={{
                  value: "Growth %",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              <Bar dataKey="value" barSize={35} isAnimationActive={false}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.value)} />
                ))}
                
                <LabelList dataKey="value" content={<InsideBarLabel />} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Box>
  );
}

export default MSGPBranchesBarChartPage;
