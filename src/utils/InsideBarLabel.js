import React from "react";

const InsideBarLabel = (props) => {
  const {
    x,
    y,
    width,
    height,
    value,
    decimalPlaces = 1, // default: 1 decimal for percentage
    showPercent = true, // ✅ new flag from parent
  } = props;

  if (value == null || width <= 0) return null;

  const textX = x + width / 2;
  const textY = y + height / 2; // centered vertically inside bar
  const rotation = -90;

  // ✅ Format value dynamically
  const displayValue = showPercent
    ? `${Number(value).toFixed(decimalPlaces)}%`
    : `${Number(value).toFixed(decimalPlaces)}`;

  return (
    <text
      x={textX}
      y={textY}
      transform={`rotate(${rotation}, ${textX}, ${textY})`}
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize={11}
      fill="#0e0d0d"
      fontWeight="600"
      pointerEvents="none"
    >
      {displayValue}
    </text>
  );
};

export default InsideBarLabel;
