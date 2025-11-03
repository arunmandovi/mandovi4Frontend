import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import CustomGrowthTooltip from "./CustomGrowthTooltip";

const GrowthLineChart = ({ chartData, cityKeys, decimalDigits, showPercentage }) => {
  // ✅ Filter out rows where all city values are 0
  const filteredData = chartData.filter((row) =>
    cityKeys.some((key) => Number(row[key]) !== 0)
  );

  // ✅ Formatter function only here
  const formatValue = (value) => {
    const num = Number(value) || 0;
    return showPercentage
      ? `${num.toFixed(decimalDigits)}%`
      : num.toFixed(decimalDigits);
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={filteredData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis
          label={{ value: showPercentage ? "Growth %" : "Growth", angle: -90, position: "insideLeft" }}
          tick={{ fontSize: 12 }}
        />
        <Tooltip content={<CustomGrowthTooltip formatter={formatValue} />} />
        <Legend />

        {cityKeys.map((key, idx) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={`hsl(${(idx * 60) % 360}, 70%, 45%)`}
            strokeWidth={2}
            dot={{ r: 3 }}
            isAnimationActive={false}
          >
            <LabelList
              dataKey={key}
              position="top"
              fontSize={10}
              formatter={formatValue}
            />
          </Line>
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default GrowthLineChart;
