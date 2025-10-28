// src/utils/InsideBarLabel.js
import React from "react";

const InsideBarLabel = (props) => {
  const { x, y, width, height, value } = props;

  if (value == null || width <= 0) return null;

  const textX = x + width / 2;
  let textY;

  if (value > 0) {
    textY = y + height / 2;
  } else if (value < 0) {
    textY = y + height / 2; 
  } else {
    textY = y - 6;
  }

  const rotation = -90;

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
      {`${Number(value).toFixed(2)}%`}
    </text>
  );
};

export default InsideBarLabel;
