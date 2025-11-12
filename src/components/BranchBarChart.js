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
import { getBarColor } from "../utils/getBarColor";

/* ---------- Tooltip ---------- */
const CustomTooltip = ({
  active,
  payload,
  decimalPlaces = 1,
  showPercent = true,
}) => {
  if (active && payload && payload.length) {
    const item = payload[0]?.payload || {};
    const value = item.value ?? 0;
    const name = item.name || "";
    const city = item.city || "";

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

/* ---------- Bar shape with ±100 cap ---------- */
const CappedBarShape = (props) => {
  const { y, height, value } = props;
  if (value === 0 || value == null) return <Rectangle {...props} />;

  const absValue = Math.abs(value);
  if (absValue <= 100) return <Rectangle {...props} />;

  const ratio = 100 / absValue;
  const cappedHeight = Math.max(2, height * ratio);

  if (value > 0) {
    const newY = y + (height - cappedHeight);
    return (
      <Rectangle {...props} y={newY} height={cappedHeight} radius={[4, 4, 0, 0]} />
    );
  }
  return (
    <Rectangle {...props} y={y} height={cappedHeight} radius={[0, 0, 4, 4]} />
  );
};

/* ---------- Custom label that stays inside capped bar ---------- */
const CustomLabel = (props) => {
  const { x, y, width, height, value, showPercent, decimalPlaces } = props;
  if (value == null) return null;

  const absValue = Math.abs(value);
  const formatted = showPercent
    ? `${value.toFixed(decimalPlaces)}%`
    : `₹ ${value.toLocaleString("en-IN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimalPlaces,
      })}`;

  // Cap label inside the visible bar (use capped height if value > 100)
  const capRatio = absValue > 100 ? 100 / absValue : 1;
  const visibleHeight = height * capRatio;

  // Center text within the visible part
  const textX = x + width / 2;
  const textY =
    value >= 0 ? y + height - visibleHeight / 2 : y + visibleHeight / 2;

  return (
    <text
      x={textX}
      y={textY}
      textAnchor="middle"
      transform={`rotate(-90, ${textX}, ${textY})`}
      fontSize={11}
      fontWeight={600}
      fill="#000"
    >
      {formatted}
    </text>
  );
};

/* ---------- Main chart ---------- */
const BranchBarChart = ({ chartData, selectedGrowth, decimalPlaces = 1 }) => {
  if (!chartData || chartData.length === 0) {
    return <Typography>No data available for the selected criteria.</Typography>;
  }

  // Ensure every branch renders even if 0
  const sanitizedData = chartData.map((item) => ({
    ...item,
    value: item.value == null ? 0 : item.value,
  }));

  const showPercent = selectedGrowth?.includes("%");
  const maxAbsValue = Math.max(...sanitizedData.map((d) => Math.abs(d.value ?? 0)));
  const shouldCapAt100 = showPercent && maxAbsValue > 100;

  const yAxisDomain = showPercent
    ? shouldCapAt100
      ? [-100, 100]
      : [-Math.ceil(maxAbsValue + 5), Math.ceil(maxAbsValue + 5)]
    : ["auto", "auto"];

  const yTicks = showPercent
    ? shouldCapAt100
      ? Array.from({ length: 21 }, (_, i) => -100 + i * 10)
      : Array.from(
          { length: Math.ceil((Math.ceil(maxAbsValue + 5) * 2) / 10) + 1 },
          (_, i) => -Math.ceil(maxAbsValue + 5) + i * 10
        )
    : undefined;

  return (
    <Box
      sx={{
        mt: 2,
        width: "100%",
        height: 750,
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
            tick={{ fontSize: 11 }}
            angle={-45}
            textAnchor="end"
            interval={0}
            height={70}
          />

          <YAxis
            allowDataOverflow
            domain={yAxisDomain}
            ticks={yTicks}
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

          {shouldCapAt100 && (
            <>
              <ReferenceLine
                y={100}
                stroke="#999"
                strokeDasharray="5 5"
                label={{
                  value: "Cap (+100%)",
                  position: "right",
                  fill: "#555",
                  fontSize: 12,
                }}
              />
              <ReferenceLine
                y={-100}
                stroke="#999"
                strokeDasharray="5 5"
                label={{
                  value: "Cap (-100%)",
                  position: "right",
                  fill: "#555",
                  fontSize: 12,
                }}
              />
            </>
          )}

          <Bar
            dataKey="value"
            barSize={35}
            isAnimationActive={false}
            shape={shouldCapAt100 ? <CappedBarShape /> : undefined}
          >
            {sanitizedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry?.barColor || getBarColor(entry?.value ?? 0)}
              />
            ))}

            <LabelList
              dataKey="value"
              content={(props) => (
                <CustomLabel
                  {...props}
                  showPercent={showPercent}
                  decimalPlaces={decimalPlaces}
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
