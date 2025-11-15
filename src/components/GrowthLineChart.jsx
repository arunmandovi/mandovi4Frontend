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

const GrowthLineChart = ({
  chartData,
  cityKeys,
  decimalDigits,
  showPercentage,
  showPercent = false,
}) => {
  const filteredData = chartData.filter((row) =>
    cityKeys.some((key) => Number(row[key]) !== 0)
  );

  const formatValue = (value) => {
    const num = Number(value) || 0;
    return showPercent
      ? `${num.toFixed(decimalDigits)}%`
      : num.toFixed(decimalDigits);
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={filteredData}
        margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis
          label={{
            value: showPercent ? "Growth %" : "Growth",
            angle: -90,
            position: "insideLeft",
          }}
          tick={{ fontSize: 12 }}
        />
        <Tooltip content={<CustomGrowthTooltip formatter={formatValue} />} />
        <Legend />

        {/* ---------- Neon Glow Gradients ---------- */}
        <defs>
          {cityKeys.map((key, idx) => {
            const hue = (idx * 60) % 360;
            return (
              <linearGradient id={`color-${key}`} key={idx} x1="0" y1="0" x2="1" y2="1">
                {/* bright top */}
                <stop offset="0%" stopColor={`hsl(${hue}, 100%, 70%)`} stopOpacity={1} />
                {/* neon glow */}
                <stop offset="50%" stopColor={`hsl(${hue}, 100%, 55%)`} stopOpacity={0.9} />
                {/* darker base */}
                <stop offset="100%" stopColor={`hsl(${hue}, 100%, 40%)`} stopOpacity={0.8} />
              </linearGradient>
            );
          })}
        </defs>

        {/* ---------- Neon/Radium Shiny Lines ---------- */}
        {cityKeys.map((key, idx) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={`url(#color-${key})`}
            strokeWidth={4}
            dot={{
              r: 5,
              fill: `hsl(${(idx * 60) % 360}, 100%, 65%)`,
              stroke: "white",
              strokeWidth: 1.5,
            }}
            activeDot={{
              r: 7,
              fill: `hsl(${(idx * 60) % 360}, 100%, 75%)`,
              stroke: "#fff",
              strokeWidth: 2,
              style: { filter: "drop-shadow(0 0 6px rgba(255,255,255,0.8))" },
            }}
            isAnimationActive={true}
            animationDuration={800}
            animationEasing="ease-out"
            /* ✨ NEON GLOW EFFECT + SHINE */
            style={{
              filter: `
                drop-shadow(0 0 6px hsla(0,0%,100%,0.6))
                drop-shadow(0 0 10px hsla(0,0%,100%,0.4))
                drop-shadow(0 3px 4px rgba(0,0,0,0.3))
              `,
            }}
          >
            <LabelList
              dataKey={key}
              position="top"
              fontSize={13}
              formatter={formatValue}
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
  );
};

export default GrowthLineChart;
