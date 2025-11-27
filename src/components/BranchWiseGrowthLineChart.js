import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";

// Nice color palette
const COLORS = [
  "#FF5733", "#33A1FF", "#9B59B6", "#27AE60", "#F1C40F",
  "#E67E22", "#2ECC71", "#3498DB", "#8E44AD", "#D35400",
  "#1ABC9C", "#E74C3C", "#F39C12", "#7D3C98", "#16A085",
  "#2980B9", "#C0392B", "#BA55D3", "#20B2AA", "#FF8C00"
];

// Indian format helper
const formatIndian = (num) => num.toLocaleString("en-IN");

// 🔥 Common formatter function (used everywhere)
const formatValue = (value, showPercent, digits) => {
  if (value === null || value === undefined) return "-";

  if (showPercent === true) {
    return `${value.toFixed(digits)}%`;
  }

  if (showPercent === "falseNumber") {
    return value.toFixed(digits);
  }

  // showPercent === false → Indian Format
  return formatIndian(Number(value.toFixed(digits)));
};

function BranchWiseGrowthLineChart({
  chartData = [],
  cityKeys = [],
  decimalDigits = 1,
  showPercent = true,
  yAxisMin,
  yAxisMax
}) {

  // Tooltip formatter
  const tooltipFormatter = (value) =>
    formatValue(value, showPercent, decimalDigits);

  // Remove months where all values are 0/null
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

        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fontWeight: 600 }}
        />

        <YAxis
          label={{
            value: showPercent === true ? "Growth %" : "Growth",
            angle: -90,
            position: "insideLeft",
          }}
          domain={[
            yAxisMin !== undefined ? yAxisMin : "auto",
            yAxisMax !== undefined ? yAxisMax : "auto",
          ]}
          tick={{ fontSize: 12 }}
          tickFormatter={(value) =>
            formatValue(Number(value), showPercent, decimalDigits)
          }
        />

        <Tooltip
          content={({ payload, label }) => {
            if (!payload || payload.length === 0) return null;

            const sorted = [...payload].sort((a, b) => b.value - a.value);

            return (
              <div style={{ background: "#fff", padding: 10, border: "1px solid #000" }}>
                <strong>{label}</strong>
                {sorted.map((item) => (
                  <div key={item.dataKey} style={{ color: item.color }}>
                    {item.name}: {formatValue(item.value, showPercent, decimalDigits)}
                  </div>
                ))}
              </div>
            );
          }}
        />

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
              content={({ x, y, value }) => {
                const isNegative = Number(value) < 0;

                return (
                  <text
                    x={x}
                    y={y - 5}
                    fill={isNegative ? "rgba(215, 7, 7, 1)" : "#000"}
                    fontSize={12}
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {formatValue(Number(value), showPercent, decimalDigits)}
                  </text>
                );
              }}
            />
          </Line>
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export default BranchWiseGrowthLineChart;
