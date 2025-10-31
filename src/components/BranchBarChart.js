import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
  Cell,
  ReferenceLine,
} from "recharts";
import { Box, Typography } from "@mui/material";
import { getBarColor } from "../utils/getBarColor";
import InsideBarLabel from "../utils/InsideBarLabel";

const CustomTooltip = ({
  active,
  payload,
  decimalPlaces = 1,
  showPercent = true,
}) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const name = payload[0].payload.name;
    const city = payload[0].payload.city;

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
          {name} ({city})
        </Typography>
        <Typography variant="body2">
          {showPercent
            ? `${Number(value).toFixed(decimalPlaces)}%`
            : `₹ ${Number(value).toLocaleString("en-IN", {
                minimumFractionDigits: 0,
                maximumFractionDigits: decimalPlaces,
              })}`}
        </Typography>
      </Box>
    );
  }
  return null;
};

const BranchBarChart = ({
  chartData,
  selectedGrowth,
  decimalPlaces = 1,
}) => {
  if (!chartData || chartData.length === 0) {
    return <Typography>No data available for the selected criteria.</Typography>;
  }

  // ✅ Automatically detect if % should be shown
  const showPercent = selectedGrowth?.includes("%");

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
            tickFormatter={(val) =>
              showPercent
                ? `${Number(val).toFixed(decimalPlaces)}%`
                : `₹ ${Number(val).toLocaleString("en-IN", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: decimalPlaces,
                  })}`
            }
            label={{
              value: showPercent ? "Growth %" : "Amount (₹)",
              angle: -90,
              position: "insideLeft",
            }}
          />
          <Tooltip
            content={
              <CustomTooltip
                decimalPlaces={decimalPlaces}
                showPercent={showPercent}
              />
            }
          />
          <Legend />

          <ReferenceLine y={0} stroke="#003366" strokeWidth={2} />

          <Bar dataKey="value" barSize={35} isAnimationActive={false}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.value)} />
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

export default BranchBarChart;
