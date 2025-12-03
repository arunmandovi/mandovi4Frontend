import React, { useEffect, useState } from "react";
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
import { Box, Typography, Button } from "@mui/material";
import { fetchData } from "../../api/uploadService";
import { useNavigate } from "react-router-dom";

/* ------- TIMELINE ------- */
const timeline = [
  { label: "Apr 24", key: "apr_24", month: "Apr" },
  { label: "May 24", key: "may_24", month: "May" },
  { label: "Jun 24", key: "jun_24", month: "Jun" },
  { label: "Jul 24", key: "jul_24", month: "Jul" },
  { label: "2024-25", key: "total_24", month: "Total" },

  { label: "Apr 25", key: "apr_25", month: "Apr" },
  { label: "May 25", key: "may_25", month: "May" },
  { label: "Jun 25", key: "jun_25", month: "Jun" },
  { label: "Jul 25", key: "jul_25", month: "Jul" },
  { label: "Aug 25", key: "aug_25", month: "Aug" },
  { label: "Sep 25", key: "sep_25", month: "Sep" },
  { label: "2025-26", key: "fy_2025_26", month: "Total" },
];

export default function ProfitLossMonthlyGraphPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState([]);
  const [cityList, setCityList] = useState([]);

  /* ------- FETCH LIVE DATA ------- */
  useEffect(() => {
    const load = async () => {
      try {
        const allCityNames = new Set();
        const final = [];

        for (const t of timeline) {
          const query = `?groupBy=city&months=${t.month}`;
          const data = await fetchData(
            `/api/profit_loss/profit_loss_summary${query}`
          );

          final.push({
            monthLabel: t.label,
            key: t.key,
            data: data || [],
          });

          data?.forEach((r) => {
            if (r.city) allCityNames.add(r.city);
          });
        }

        setSummary(final);
        setCityList(Array.from(allCityNames));
      } catch (err) {
        console.error("API error:", err);
      }
    };

    load();
  }, []);

  /* ------- BUILD CHART DATA ------- */
  const chartData = summary.map((block) => {
    const row = { month: block.monthLabel };

    cityList.forEach((city) => (row[city] = 0));

    block.data.forEach((item) => {
      if (!item.city) return;
      row[item.city] = item[block.key] ?? 0;
    });

    return row;
  });

  /* ------- 2 DECIMAL FORMATTER ------- */
  const formatTwoDecimals = (value) => {
    if (value == null || isNaN(value)) return value;
    return Number(value).toFixed(2);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* ---------- TOP BAR ---------- */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">PROFIT & LOSS Monthly Graph(CityWise)</Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/profit_loss_monthly")}>P&L Monthly Graph(CityWise)</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/profit_loss_branches")}>P&L Monthly Graph(BranchWise)</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/profit_loss_per_vehicle")}>P&L PerVehicle Graph(CityWise)</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/profit_loss_per_vehicle_branch")}>P&L PerVehicle Graph(BranchWise)</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/profit_loss")}>P&L Table</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/profit_loss_srbr")}>SR&BR Table</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/profit_loss-bar-chart")}>Bar Chart-CityWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/profit_loss_branches-bar-chart")}>Bar Chart-BranchWise</Button>
        </Box>
      </Box>

      {/* ---------- CHART BOX ---------- */}
      <Box
        sx={{
          width: "100%",
          height: 520,
          background: "#fff",
          borderRadius: 2,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          p: 2,
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
          data={chartData}
          margin={{ top: 10, right: 50, left: 10, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(v) => formatTwoDecimals(v)} />
            <Tooltip formatter={(v) => formatTwoDecimals(v)} />
            <Legend />

            {/* ---------- Neon Gradients ---------- */}
            <defs>
              {cityList.map((city, idx) => {
                const hue = (idx * 60) % 360;
                return (
                  <linearGradient
                    id={`glow-${city}`}
                    key={city}
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={`hsl(${hue}, 100%, 70%)`} />
                    <stop offset="50%" stopColor={`hsl(${hue}, 100%, 55%)`} />
                    <stop offset="100%" stopColor={`hsl(${hue}, 100%, 40%)`} />
                  </linearGradient>
                );
              })}
            </defs>

            {/* ---------- Neon Radium Lines ---------- */}
            {cityList.map((city, index) => (
              <Line
                key={city}
                dataKey={city}
                type="monotone"
                stroke={`url(#glow-${city})`}
                strokeWidth={4}
                dot={{
                  r: 5,
                  fill: `hsl(${(index * 60) % 360}, 100%, 65%)`,
                  stroke: "#fff",
                  strokeWidth: 1.5,
                }}
                activeDot={{
                  r: 7,
                  fill: `hsl(${(index * 60) % 360}, 100%, 75%)`,
                  stroke: "#fff",
                  strokeWidth: 2,
                  style: { filter: "drop-shadow(0 0 8px rgba(255,255,255,0.8))" },
                }}
                animationDuration={700}
                animationEasing="ease-out"
                style={{
                  filter: `
                    drop-shadow(0 0 6px rgba(255,255,255,0.7))
                    drop-shadow(0 0 10px rgba(255,255,255,0.5))
                    drop-shadow(0 3px 4px rgba(0,0,0,0.25))
                  `,
                }}
              >
                <LabelList
                  dataKey={city}
                  position="top"
                  fontSize={12}
                  formatter={(v) => formatTwoDecimals(v)}
                  style={{
                    paintOrder: "stroke",
                    stroke: "white",
                    strokeWidth: 1,
                  }}
                />
              </Line>
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
