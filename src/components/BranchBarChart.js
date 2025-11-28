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
  Rectangle,
} from "recharts";
import { Box, Typography } from "@mui/material";

/* ---------- Tooltip ---------- */
const CustomTooltip = ({
  active,
  payload,
  decimalPlaces = 1,
  showPercent = true,
  isMCPChart = false,
}) => {
  if (active && payload && payload.length) {
    const item = payload[0]?.payload || {};
    const value = item.value ?? 0;
    const name = item.name || "";
    const city = item.city || "";

    const formattedValue = showPercent
      ? `${Number(value).toFixed(decimalPlaces)}%`
      : isMCPChart
      ? `${Number(value).toLocaleString("en-IN", {
          minimumFractionDigits: 0,
          maximumFractionDigits: decimalPlaces,
        })}`
      : ` ${Number(value).toLocaleString("en-IN", {
          minimumFractionDigits: 0,
          maximumFractionDigits: decimalPlaces,
        })}`;

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
          {name} {city ? `(${city})` : ""}
        </Typography>
        <Typography variant="body2">{formattedValue}</Typography>
      </Box>
    );
  }
  return null;
};

/* ---------- Custom bar shape (cap ±100%) ---------- */
const CappedBarShape = (props) => {
  const { x, y, width, height, value, yAxis, background, ...rest } = props;

  if (value === 0 || value == null) return null;

  // Get base height as if value was positive
  const absHeight = Math.abs(height);

  // ✅ Force same visual height for all negatives
  const visualHeight = absHeight; // keep same height for all
  const barY = value >= 0 ? y : y - absHeight; // flip for negatives

  return (
    <Rectangle
      {...rest}
      x={x}
      y={barY}
      width={width}
      height={visualHeight}
      radius={value >= 0 ? [4, 4, 0, 0] : [0, 0, 4, 4]}
      fill={rest.fill}
    />
  );
};

const BRANCH_COLOR_MAP = {
  // case-insensitive (we will lowercase keys)
  Bangalore: "#B30000",   // Dark Red
  mysore: "#003399",      // Dark Blue
  Balmatta: "#006600",   // Dark Green

  // add more if needed
  udupi: "#B30000",
  shimoga: "#003399",
  hassan: "#006600",
};


/* ---------- Custom label ---------- */
const CustomLabel = (props) => {
  const {
    x,
    y,
    width,
    height,
    value,
    showPercent,
    decimalPlaces,
    chartType,
  } = props;

  if (value == null) return null;

  const absValue = Math.abs(value);
  const isMCPChart = chartType === "MCPBranchesBarChart";
  const isMGAChart = chartType === "MGABranchesBarChart";

  const formatted = showPercent
    ? `${value.toFixed(decimalPlaces)}%`
    : isMCPChart
    ? `${value.toLocaleString("en-IN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimalPlaces,
      })}`
    : ` ${value.toLocaleString("en-IN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimalPlaces,
      })}`;

  const isCapped = absValue > 100;
  const capRatio = isCapped ? 100 / absValue : 1;
  const visibleHeight = height * capRatio;

  const textX = x + width / 2;
  let textY;

  if (isMGAChart) {
    // ✅ Always center label for MGA chart
    textY = y + height / 2;
  } else {
    if (value >= 0) {
      // ✅ Positive bars - normal centering
      textY = y + (height - visibleHeight) + visibleHeight / 2;
    } else {
      // ✅ Negative bars - center correctly within visible region
      textY = y + visibleHeight / 2;
    }
  }

  return (
    <text
      x={textX}
      y={textY}
      textAnchor="middle"
      transform={`rotate(-90, ${textX}, ${textY})`}
      dominantBaseline="middle"
      fontSize={13}
      fontWeight={600}
      fill={isCapped ? "#003366" : "#000"}
    >
      {formatted}
    </text>
  );
};

/* ---------- Main Chart ---------- */
const BranchBarChart = ({
  chartData,
  selectedGrowth,
  decimalPlaces = 1,
  chartType,
}) => {
  const isMCPChart = chartType === "MCPBranchesBarChart";
  const isMGAChart = chartType === "MGABranchesBarChart";

  if (!chartData || chartData.length === 0) {
    return (
      <Typography>No data available for the selected criteria.</Typography>
    );
  }

  const sanitizedData = chartData.map((item) => ({
    ...item,
    value: item.value == null ? 0 : item.value,
  }));

  const showPercent = !isMCPChart && selectedGrowth?.includes("%");

  const values = sanitizedData.map((d) => d.value ?? 0);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const maxAbsValue = Math.max(Math.abs(maxValue), Math.abs(minValue));
  const shouldCapAt100 = showPercent && maxAbsValue > 100;

  const BangaloreBranches = [
    "ns palya", "sarjapura", "basaveshwarnagar", "kolar nexa", "gowribidanur", "hennur", "jp nagar", 
     "kolar", "basavanagudi-sow", "basavangudi", "malur sow", "maluru ws", "uttarahali kengeri", 
     "vidyarannapura", "vijayanagar", "wilson garden", "yelahanka","yeshwanthpur ws",
  ];

  const MysoreBranches = [
    "bannur", "chamrajnagar","hunsur road", "maddur", "gonikoppa", "mandya", "krs road", "kushalnagar",
     "krishnarajapet", "mysore nexa","nagamangala", "somvarpet", "narasipura", "kollegal",
  ];

  const MangaloreBranches = [
    "balmatta", "bantwal", "vittla", "kadaba", "uppinangady", "surathkal", "sullia",
    "adyar", "yeyyadi br", "nexa service", "sujith bagh lane", "naravi",
  ];

  const BRANCH_NAME_COLORS = {
    ...Object.fromEntries(BangaloreBranches.map((b) => [b.toLowerCase(), "rgba(6, 176, 6, 1)"])),
    ...Object.fromEntries(MysoreBranches.map((b) => [b.toLowerCase(), "#003399"])),
    ...Object.fromEntries(MangaloreBranches.map((b) => [b.toLowerCase(), "#B30000"])),
  };

  const CustomAxisTick = ({ x, y, payload }) => {
  const branch = payload?.value || "";
  const key = branch.toLowerCase();

  const color = BRANCH_NAME_COLORS[key] || "#000";

  return (
    <text
      x={x}
      y={y + 10}
      textAnchor="end"
      fill={color}
      fontSize={14}
      fontWeight="bold"
      transform={`rotate(-45, ${x}, ${y + 10})`}
    >
      {branch}
    </text>
  );
};


  let yAxisDomain;
  if (shouldCapAt100) {
    yAxisDomain = [-100, 120];
  } else {
    const roundTo = 5;
    const roundedMax =
      maxValue > 0 ? Math.ceil((maxValue + 1) / roundTo) * roundTo : 0;
    const roundedMin =
      minValue < 0 ? Math.floor((minValue - 1) / roundTo) * roundTo : 0;
    if (minValue >= 0) yAxisDomain = [0, roundedMax];
    else if (maxValue <= 0) yAxisDomain = [roundedMin, 0];
    else yAxisDomain = [roundedMin, roundedMax];
  }

  let yTicks;
  if (shouldCapAt100 && showPercent) {
    const positiveTicks = Array.from({ length: 11 }, (_, i) => i * 10); // 0–100
    const negativeTicks = [-100, -75, -50, -25];
    yTicks = [...negativeTicks, ...positiveTicks];
  }

  return (
    <Box
      sx={{
        mt: 2,
        width: "100%",
        height: 700,
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
          data={sanitizedData}
          margin={{ top: 10, right: 30, left: 10, bottom: 80 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            interval={0}
            height={120}
            tick={<CustomAxisTick />}
          />
          <YAxis
            allowDataOverflow
            domain={yAxisDomain}
            ticks={yTicks}
            tick={{ fontSize: 12 }}
            tickFormatter={(val) =>
              showPercent
                ? `${Number(val).toFixed(decimalPlaces)}%`
                : isMCPChart
                ? `${Number(val).toLocaleString("en-IN", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: decimalPlaces,
                  })}`
                : ` ${Number(val).toLocaleString("en-IN", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: decimalPlaces,
                  })}`
            }
            label={{
              value: showPercent
                ? ""
                : isMCPChart
                ? "Value"
                : "",
              angle: -90,
              position: "insideLeft",
            }}
          />
          <Tooltip
            content={
              <CustomTooltip
                decimalPlaces={decimalPlaces}
                showPercent={showPercent}
                isMCPChart={isMCPChart}
              />
            }
          />
          <Legend />
          <ReferenceLine y={0} stroke="#003366" strokeWidth={2} />

          <Bar
            dataKey="value"
            barSize={35}
            isAnimationActive={true}
            shape={shouldCapAt100 ? <CappedBarShape /> : undefined}
          >
            {sanitizedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry?.barColor
                    ? entry.barColor
                    : entry.value < 0
                    ? "red"
                    : entry.value >= 0 && entry.value <= 5
                    ? "yellow"
                    : "#05f105"
                }
              />
            ))}

            <LabelList
              dataKey="value"
              content={(props) => (
                <CustomLabel
                  {...props}
                  showPercent={showPercent}
                  decimalPlaces={decimalPlaces}
                  chartType={chartType}
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
