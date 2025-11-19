import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
  LabelList,
} from "recharts";

// Nice color palette
const COLORS = [
  "#FF5733", "#33A1FF", "#9B59B6", "#27AE60", "#F1C40F",
  "#E67E22", "#2ECC71", "#3498DB", "#8E44AD", "#D35400",
  "#1ABC9C", "#E74C3C", "#F39C12", "#7D3C98", "#16A085",
  "#2980B9", "#C0392B", "#BA55D3", "#20B2AA", "#FF8C00"
];

function BranchWiseGrowthLineChart({
  chartData = [],
  cityKeys = [],
  decimalDigits = 1,
  showPercent = true,
}) {
  // Tooltip formatter
  const tooltipFormatter = (value) => {
    if (value === null || value === undefined) return "-";
    return showPercent
      ? `${value.toFixed(decimalDigits)}%`
      : value.toFixed(decimalDigits);
  };

  // Y-axis formatter
  const axisFormatter = (value) => {
    if (value === null || value === undefined) return "";
    return showPercent ? `${value}%` : value;
  };

  // ✅ Remove months where ALL city values are 0/null/undefined
  const filteredData = chartData.filter((item) =>
    cityKeys.some((key) => {
      const v = item[key];
      return v !== 0 && v !== null && v !== undefined;
    })
  );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={filteredData}
        margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" />

        {/* X-Axis → Only Months */}
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fontWeight: 600 }}
        />

        <YAxis tickFormatter={axisFormatter} width={60}>
          <Label
            value={showPercent ? "Growth (%)" : "Values"}
            angle={-90}
            position="insideLeft"
            offset={10}
          />
        </YAxis>

        <Tooltip formatter={tooltipFormatter} />

        {/* Multi-color lines */}
        {cityKeys.map((key, index) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={COLORS[index % COLORS.length]}
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          >
            <LabelList
              dataKey={key}
              position="top"
              formatter={(value) =>
                value === null || value === undefined
                  ? ""
                  : showPercent
                  ? `${value.toFixed(decimalDigits)}%`
                  : value.toFixed(decimalDigits)
              }
            />
          </Line>
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export default BranchWiseGrowthLineChart;
