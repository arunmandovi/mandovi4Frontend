import React, { useState, useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";
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

function BRConversionBarChartPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState([]);
  const [months, setMonths] = useState([]);
  const [qtrWise, setQtrWise] = useState([]);
  const [halfYear, setHalfYear] = useState([]);
  const [selectedGrowth, setSelectedGrowth] = useState(null);

  // ---------- Dropdown Options ----------
  const monthOptions = [
    "Apr", "May", "Jun", "Jul", "Aug", "Sep",
    "Oct", "Nov", "Dec", "Jan", "Feb", "Mar",
  ];

  const qtrWiseOptions = ["Qtr1", "Qtr2", "Qtr3", "Qtr4"];
  const halfYearOptions = ["H1", "H2"];

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

  // ---------- Fetch Data ----------
  useEffect(() => {
    const fetchCitySummary = async () => {
      try {
        const params = new URLSearchParams();
        if (months.length) params.append("months", months.join(","));
        if (qtrWise.length) params.append("qtrWise", qtrWise.join(","));
        if (halfYear.length) params.append("halfYear", halfYear.join(","));
        params.append("groupBy", "city");

        const query = `?${params.toString()}`;
        const data = await fetchData(`/api/br_conversion/br_conversion_summary${query}`);

        if (data && Array.isArray(data)) {
          setSummary(data);
        } else {
          setSummary([]);
        }
      } catch (err) {
        console.error("fetchCitySummary error:", err);
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
      .trim()
      .toUpperCase();
  };

  const readGrowthValue = (row, apiKey) => {
    if (!row || !apiKey) return 0;
    return parseFloat(row[apiKey] ?? 0);
  };

  // ---------- Build Chart Data ----------
  const buildChartData = (summaryArr) => {
    const apiKey = growthKeyMap[selectedGrowth];
    return summaryArr
      .map((row) => ({
        city: readCityName(row),
        value: readGrowthValue(row, apiKey),
      }))
      .sort((a, b) => {
        const aIndex = preferredOrder.indexOf(a.city);
        const bIndex = preferredOrder.indexOf(b.city);
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        return a.city.localeCompare(b.city);
      });
  };

  const chartData =
    selectedGrowth && summary.length > 0 ? buildChartData(summary) : [];

  // ---------- Tooltip ----------
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
            {selectedGrowth?.includes("%")
              ? `${value.toFixed(1)}%`
              : `₹ ${value.toLocaleString("en-IN", {
                  maximumFractionDigits: 0,
                })}`}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  // ---------- Render ----------
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
        <Typography variant="h4">BR CONVERSION REPORT (City-wise)</Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate("/DashboardHome/br_conversion")}
          >
            Graph
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() =>
              navigate("/DashboardHome/br_conversion_branches-bar-chart")
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

      {/* Chart Section */}
      {!selectedGrowth ? (
        <Typography>👆 Select a growth type to view the chart below</Typography>
      ) : chartData.length === 0 ? (
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
                  value: selectedGrowth?.includes("%")
                    ? "Growth %"
                    : "Amount (₹)",
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
                  content={({ x, y, value }) => {
                    if (value == null) return null;
                    const displayVal = selectedGrowth?.includes("%")
                      ? `${Number(value).toFixed(1)}%`
                      : `₹ ${Number(value).toLocaleString("en-IN", {
                          maximumFractionDigits: 0,
                        })}`;
                    return (
                      <text
                        x={x}
                        y={y - 5}
                        textAnchor="middle"
                        fontSize={11}
                        fill="#333"
                      >
                        {displayVal}
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

export default BRConversionBarChartPage;
