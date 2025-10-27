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
import SlicerFilters from "../../components/SlicerFilters";

function LoaddBarChartPage() {
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

  // ---------- Fetch city summary ----------
  useEffect(() => {
    const fetchCitySummary = async () => {
      try {
        // Prepare month list: all months if none selected
        const activeMonths = months.length ? months : monthOptions;
        const monthQuery = activeMonths.join(",");
        const query = `?groupBy=city&months=${monthQuery}`;

        const data = await fetchData(`/api/loadd/loadd_summary${query}`);

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
    const cityTotals = {};
    const cityCounts = {};

    (dataArr || []).forEach((row) => {
      const city = readCityName(row);
      const val = readGrowthValue(row, apiKey);
      const parsed = parseFloat(String(val).replace("%", "").trim());
      if (!isNaN(parsed)) {
        cityTotals[city] = (cityTotals[city] || 0) + parsed;
        cityCounts[city] = (cityCounts[city] || 0) + 1;
      }
    });

    const preferredOrder = ["Bangalore", "Mysore", "Mangalore"];
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
            <Typography variant="h4">LOAD REPORT (City-wise)</Typography>
    
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => navigate("/DashboardHome/loadd")}
              >
                Graph
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => navigate("/DashboardHome/loadd_branches-bar-chart")}
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
      />

      {/* Stylish Growth Type Buttons */}
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
                      selectedGrowth === g ? `0 3px 10px rgba(0,0,0,0.15)` : "none",
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
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="city" tick={{ fontSize: 12 }} />
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
                        {`${Number(value).toFixed(2)}%`}
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

export default LoaddBarChartPage;
