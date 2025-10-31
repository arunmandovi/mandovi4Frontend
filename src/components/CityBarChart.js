import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  ReferenceLine,
} from "recharts";
import { Box, Typography } from "@mui/material";
import InsideBarLabel from "../utils/InsideBarLabel";

const CityBarChart = ({
  chartData = [],
  selectedGrowth = "",
  decimalPlaces = 1, // ✅ Always default to 1 decimal
  showPercent = true, // ✅ Determines whether to show % or ₹
}) => {
  // ---------- Tooltip ----------
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { value, payload: data } = payload[0];
      const city = data?.city ?? data?.name ?? "";

      return (
        <Box
          sx={{
            background: "white",
            border: "1px solid #ccc",
            p: 1,
            borderRadius: 1,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {city}
          </Typography>
          <Typography variant="body2">
            {showPercent
              ? `${Number(value).toFixed(decimalPlaces)}%`
              : `₹ ${Number(value).toLocaleString("en-IN", {
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
            tickFormatter={(val) =>
              showPercent
                ? `${Number(val).toFixed(decimalPlaces)}%`
                : `₹ ${Number(val).toLocaleString("en-IN", {
                    maximumFractionDigits: 0,
                  })}`
            }
            label={{
              value: showPercent ? "Growth %" : "Amount (₹)",
              angle: -90,
              position: "insideLeft",
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="#003366" strokeWidth={2} />

          <Bar dataKey="value" fill="#1976d2" barSize={35} isAnimationActive={false}>
            <LabelList
              dataKey="value"
              content={(props) => (
                <InsideBarLabel
                  {...props}
                  decimalPlaces={decimalPlaces}
                  showPercent={showPercent}
                />
              )}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default CityBarChart;
