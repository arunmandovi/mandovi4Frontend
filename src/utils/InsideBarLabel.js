import React from "react";

const InsideBarLabel = (props) => {
  const {
    x,
    y,
    width,
    height,
    value,
    decimalPlaces = 1,
    showPercent = true, // can be true, false, or "falseNumber"
  } = props;

  if (value == null || width <= 0) return null;

  const textX = x + width / 2;
  const textY = y + height / 2; // centered vertically inside bar
  const rotation = -90;

  // ✅ Format dynamically based on mode
  let displayValue;
  if (showPercent === true) {
    displayValue = `${Number(value).toFixed(decimalPlaces)}%`;
  } else if (showPercent === false) {
    displayValue = ` ${Number(value).toLocaleString("en-IN", {
      maximumFractionDigits: decimalPlaces,
    })}`;
  } else if (showPercent === "falseNumber") {
    displayValue = `${Number(value).toLocaleString("en-IN", {
      maximumFractionDigits: decimalPlaces,
    })}`;
  } else {
    displayValue = String(value);
  }

  return (
    <text
      x={textX}
      y={textY}
      transform={`rotate(${rotation}, ${textX}, ${textY})`}
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize={19}
      fill="hsla(0, 3%, 20%, 1.00)"
      fontWeight="600"
      pointerEvents="none"
    >
      {displayValue}
    </text>
  );
};

export default InsideBarLabel;
