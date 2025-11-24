import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import CustomGrowthTooltip from "./CustomGrowthTooltip";

const GrowthLineChart = ({
  chartData,
  cityKeys = [],
  decimalDigits = 1,
  showPercent,
  lowThreshold,
  yAxisMin,
  yAxisMax
}) => {
  // Desired final visual order
  const DESIRED_ORDER = ["Bangalore", "Mysore", "Mangalore"];

  // Normalizer
  const normalize = (k = "") =>
    String(k).toLowerCase().replace(/[^a-z]/g, "");

  const desiredNorm = DESIRED_ORDER.map((x) => normalize(x));

  // Sort cities in forced order
  const sortedCityKeys = [...cityKeys].sort((a, b) => {
    const na = normalize(a);
    const nb = normalize(b);

    const ia = desiredNorm.indexOf(na);
    const ib = desiredNorm.indexOf(nb);

    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1 && ib === -1) return -1;
    if (ia === -1 && ib !== -1) return 1;

    return na.localeCompare(nb);
  });

  const filteredData = chartData.filter((row) =>
    sortedCityKeys.some((key) => Number(row[key]) !== 0)
  );

  const COLOR_MAP = {
    Bangalore: "rgba(101, 189, 7, 1)",
    Mysore: "#003399",
    Mangalore: "#cb0606ff",
    BANGALORE: "rgba(101, 189, 7, 1)",
    MYSORE: "#003399",
    MANGALORE: "#cb0606ff",
  };

  // Indian numbering format
  const formatIndian = (num) => num.toLocaleString("en-IN");

  // FINAL VALUE FORMATTER
  const formatValue = (value) => {
    const num = Number(value) || 0;

    if (showPercent === true) {
      return `${num.toFixed(decimalDigits)}%`;
    }

    if (showPercent === "falseNumber") {
      return num.toFixed(decimalDigits); // Plain number
    }

    // showPercent === false → Indian formatted number
    return formatIndian(Number(num.toFixed(decimalDigits)));
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={filteredData}
        margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" />

        {/* X-Axis: Only months, no city names */}
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
            showPercent === true
              ? `${Number(value).toFixed(decimalDigits)}%`
              : showPercent === "falseNumber"
              ? Number(value).toFixed(decimalDigits)
              : formatIndian(Number(value.toFixed(decimalDigits)))
          }
        />

        <Tooltip content={<CustomGrowthTooltip formatter={formatValue} />} />

        {/* ❌ Removed LEGEND (this was showing city names under X-axis) */}
        {/* <Legend /> */}

        {/* Gradients */}
        <defs>
          {sortedCityKeys.map((key, idx) => {
            const hue = (idx * 60) % 360;
            return (
              <linearGradient
                id={`color-${key}`}
                key={key}
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

        {/* Lines */}
        {sortedCityKeys.map((key) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={COLOR_MAP[key] || "#000"}
            strokeWidth={4}
            dot={{
              r: 5,
              fill: COLOR_MAP[key] || "#000",
              stroke: "white",
              strokeWidth: 1.5,
            }}
            activeDot={{
              r: 7,
              fill: COLOR_MAP[key] || "#000",
              stroke: "#fff",
              strokeWidth: 2,
            }}
          >
            <LabelList
              dataKey={key}
              position="top"
              fontSize={13}
              formatter={(val) => formatValue(val)}
              content={(props) => {
                const { x, y, value } = props;
                const isNegative = Number(value) < 0;
            
                return (
                  <text
                    x={x}
                    y={y - 5}
                    textAnchor="middle"
                    fill={
                          Number(value) < 0
                            ? "rgba(215, 7, 7, 1)"                                  
                            : lowThreshold && Number(value) < lowThreshold
                            ? "rgba(215, 7, 7, 1)"                                 
                            : "#000000ff"                                         
                        }
                    fontSize={16}
                    style={{
                      paintOrder: "stroke",
                      stroke: "white",
                      strokeWidth: 1,
                    }}
                  >
                    {formatValue(value)}
                  </text>
                );
              }}
            />
          </Line>
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default GrowthLineChart;
