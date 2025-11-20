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
  Cell
} from "recharts";
import { Box, Typography } from "@mui/material";
import InsideBarLabel from "../utils/InsideBarLabel";

const CityBarChart = ({
  chartData = [],
  selectedGrowth = "",
  decimalPlaces = 1,
  showPercent = true, // true → %, false → , "falseNumber" → plain number
}) => {
  // ✅ Ensure all missing or null values become 0
  const safeData = chartData.map((d) => ({
    ...d,
    value:
      d.value === null || d.value === undefined || d.value === ""
        ? 0
        : Number(d.value),
  }));

  // ✅ Calculate Y-axis domain
  const values = safeData.map((d) => d.value);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const domain =
    showPercent === true && (maxValue >= 100 || minValue <= -100)
      ? [-100, 100]
      : [Math.min(minValue, 0), Math.max(maxValue, 0)];

  // ---------- Tooltip ----------
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { value, payload: data } = payload[0];
      const city = data?.city ?? data?.name ?? "";

      // 💬 Format value based on showPercent mode
      let formattedValue;
      if (showPercent === true) {
        formattedValue = `${Number(value).toFixed(decimalPlaces)}%`;
      } else if (showPercent === false) {
        formattedValue = ` ${Number(value).toLocaleString("en-IN", {
          maximumFractionDigits: decimalPlaces,
        })}`;
      } else if (showPercent === "falseNumber") {
        formattedValue = `${Number(value).toLocaleString("en-IN", {
          maximumFractionDigits: decimalPlaces,
        })}`;
      }

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
          <Typography variant="body2">{formattedValue}</Typography>
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
          data={safeData}
          margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
        >
          {/* ✅ Gradient + shadow */}
          <defs>
            <linearGradient id="bar3dGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsla(238, 62%, 63%, 1.00)" />
              <stop offset="50%" stopColor="hsla(238, 62%, 63%, 1.00)" />
              <stop offset="100%" stopColor="hsla(238, 62%, 63%, 1.00)" />
            </linearGradient>
            <filter id="barShadow" x="-20%" y="-20%" width="150%" height="150%">
              <feDropShadow dx="4" dy="4" stdDeviation="4" floodColor="#a1a1a1" />
            </filter>
          </defs>

          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="city" tick={{ fontSize: 12 }} />

          {/* ✅ Dynamic Y-axis formatting */}
          <YAxis
            domain={domain}
            tick={{ fontSize: 12 }}
            tickFormatter={(val) => {
              if (showPercent === true)
                return `${Number(val).toFixed(decimalPlaces)}%`;
              if (showPercent === false)
                return ` ${Number(val).toLocaleString("en-IN", {
                  maximumFractionDigits: 0,
                })}`;
              if (showPercent === "falseNumber")
                return `${Number(val).toLocaleString("en-IN", {
                  maximumFractionDigits: 0,
                })}`;
              return val;
            }}
            label={{
              value:
                showPercent === true
                  ? ""
                  : showPercent === false
                  ? ""
                  : "Value",
              angle: -90,
              position: "insideLeft",
            }}
          />

          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={0}
            stroke="#000"
            strokeWidth={2.5}
            ifOverflow="extendDomain"
            alwaysShow={true}
          />

          <Bar
  dataKey="value"
  barSize={100}
  isAnimationActive={true}
  radius={[6, 6, 0, 0]}
>
  {safeData.map((entry, index) => (
    <Cell
      key={`cell-${index}`}
      fill={entry.value < 0 ? "#ff0000" : "#05f105"} // Red below 0, Green above 0
    />
  ))}

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
