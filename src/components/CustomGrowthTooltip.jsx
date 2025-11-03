import React from "react";

const CustomGrowthTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload || payload.length === 0) return null;

  // ✅ Filter values: show only non-zero & valid data points
  const filteredPayload = payload.filter((item) => {
    const v = Number(item.value);
    return v !== 0 && !isNaN(v);
  });

  if (filteredPayload.length === 0) return null;

  return (
    <div style={{ background: "#fff", border: "1px solid #ccc", padding: "8px", borderRadius: "6px" }}>
      <p><strong>{label}</strong></p>
      {filteredPayload.map((item, i) => (
        <p key={i} style={{ margin: 0 }}>
          <span style={{ color: item.color, fontWeight: "bold" }}>
            {item.name}:
          </span>{" "}
          {formatter ? formatter(item.value) : item.value}
        </p>
      ))}
    </div>
  );
};

export default CustomGrowthTooltip;
