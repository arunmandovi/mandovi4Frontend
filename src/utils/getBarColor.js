// src/utils/getBarColor.js

// ✅ Returns color based on growth value
export const getBarColor = (value) => {
  if (value > 5) return "#05f105ff"; // Light Green
  if (value >= 0 && value <= 5) return "#FFD700"; // Yellow
  return "#ff0000ff"; // Red
};
