import React from "react";

const CustomGrowthTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload || payload.length === 0) return null;

  // ⭐ FIX: Sort order of cities inside tooltip
  const ORDER = ["Bangalore", "Mysore", "Mangalore"];

  const sortedPayload = [...payload].sort(
    (a, b) => ORDER.indexOf(a.name) - ORDER.indexOf(b.name)
  );

  return (
    <div
      style={{
        background: "#fff",
        padding: "10px 12px",
        borderRadius: "6px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
      }}
    >
      <p style={{ margin: 0, fontWeight: "bold" }}>{label}</p>

      {sortedPayload.map((entry) => (
        <p key={entry.name} style={{ margin: 0, color: entry.color }}>
          <strong>{entry.name}: </strong>
          {formatter(entry.value)}
        </p>
      ))}
    </div>
  );
};

export default CustomGrowthTooltip;
