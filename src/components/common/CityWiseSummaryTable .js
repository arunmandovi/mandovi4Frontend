import React from "react";
import { Box, Typography } from "@mui/material";

const CityWiseSummaryTable = ({
  selectedGrowth,
  chartMonths,
  keys,
  beautifyHeader,
  tableData,
  decimalDigits = 1,             // non-growth values
  growthDecimalDigits = 1,       // growth %
  percentageDecimalDigits = 0    // percentage %
}) => {

  // -----------------------------------------
  // CALCULATE GRAND TOTAL PERCENTAGES FIRST
  // -----------------------------------------
  const grandTotals = {};

  chartMonths.forEach((m) => {
    grandTotals[m] = {};

    const prevKey = keys[0];
    const currKey = keys[1];

    const prevTotal = tableData.reduce(
      (sum, r) => sum + (r[`${m}_${prevKey}`] || 0),
      0
    );

    const currTotal = tableData.reduce(
      (sum, r) => sum + (r[`${m}_${currKey}`] || 0),
      0
    );

    grandTotals[m]["percentage"] =
      prevTotal === 0 ? 0 : (currTotal / prevTotal) * 100;
  });

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        City-wise Summary – {selectedGrowth}
      </Typography>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          {/* ------------------------------- */}
          {/* FIRST HEADER ROW (Months)      */}
          {/* ------------------------------- */}
          <tr style={{ background: "#f0f0f0" }}>
            <th style={{ padding: 8, border: "1px solid #ccc" }}>City</th>
        
            {chartMonths.map((m) => (
              <th
                key={m}
                colSpan={keys.length}
                style={{
                  padding: 8,
                  border: "1px solid #ccc",
                  textAlign: "center"
                }}
              >
                {m}
              </th>
            ))}
        
            {/* NEW — ALL BLOCK */}
            <th
              key="ALL"
              colSpan={keys.length}
              style={{
                padding: 8,
                border: "1px solid #ccc",
                textAlign: "center",
                background: "#ffeccc",
                fontWeight: "bold"
              }}
            >
              ALL
            </th>
          </tr>
        
          {/* ------------------------------- */}
          {/* SECOND HEADER ROW (Keys)       */}
          {/* ------------------------------- */}
          <tr style={{ background: "#fafafa" }}>
            <th style={{ padding: 8, border: "1px solid #ccc" }}></th>
        
            {/* month-wise keys */}
            {chartMonths.flatMap((m) =>
              keys.map((k) => (
                <th
                  key={`${m}_${k}`}
                  style={{
                    padding: 8,
                    border: "1px solid #ccc"
                  }}
                >
                  {beautifyHeader(k)}
                </th>
              ))
            )}
        
            {/* NEW — ALL keys */}
            {keys.map((k) => (
              <th
                key={`ALL_${k}`}
                style={{
                  padding: 8,
                  border: "1px solid #ccc",
                  background: "#fff7e6",
                  fontWeight: "bold"
                }}
              >
                {beautifyHeader(k)}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {tableData.map((row, i) => {
            const allTotals = {};
        
            // Calculate ALL totals for each key
            keys.forEach((k) => {
              const monthlyValues = chartMonths.map((m) => row[`${m}_${k}`] || 0);
              const sum = monthlyValues.reduce((a, b) => a + b, 0);
        
              if (k.includes("growth")) {
                // Recalculate growth = (All Current - All Previous)/ All Previous *100
                const prevKey = keys[0];
                const currKey = keys[1];
        
                const prevAll = chartMonths.reduce(
                  (s, m) => s + (row[`${m}_${prevKey}`] || 0),
                  0
                );
                const currAll = chartMonths.reduce(
                  (s, m) => s + (row[`${m}_${currKey}`] || 0),
                  0
                );
        
                allTotals[k] =
                  prevAll === 0 ? 0 : ((currAll - prevAll) / prevAll) * 100;
              } else if (k.includes("percentage")) {
                // All percentage = (Total curr / Total prev) * 100
                const prevKey = keys[0];
                const currKey = keys[1];
        
                const prevAll = chartMonths.reduce(
                  (s, m) => s + (row[`${m}_${prevKey}`] || 0),
                  0
                );
                const currAll = chartMonths.reduce(
                  (s, m) => s + (row[`${m}_${currKey}`] || 0),
                  0
                );
        
                allTotals[k] =
                  prevAll === 0 ? 0 : (currAll / prevAll) * 100;
              } else {
                allTotals[k] = sum;
              }
            });
        
            return (
              <tr key={i}>
                <td style={{
                  padding: 8,
                  border: "1px solid #ccc",
                  textAlign: "center",
                  fontWeight: "bold"
                }}>
                  {row.city}
                </td>
        
                {/* NORMAL MONTH VALUES */}
                {chartMonths.flatMap((m) =>
                  keys.map((k) => {
                    const val = row[`${m}_${k}`] || 0;
                    let formattedValue = "";
        
                    if (k.includes("growth")) formattedValue = `${val.toFixed(growthDecimalDigits)}%`;
                    else if (k.includes("percentage")) formattedValue = `${val.toFixed(percentageDecimalDigits)}%`;
                    else formattedValue = val.toFixed(decimalDigits);
        
                    let color = "black";
                    if (k.includes("percentage")) {
                      const grandPct = grandTotals[m]["percentage"];
                      color = val < grandPct ? "rgba(215,7,7,1)" : "rgba(6,226,24,1)";
                    } else if (k.includes("growth")) {
                      color = val > 0 ? "rgba(6,226,24,1)" : val < 0 ? "rgba(215,7,7,1)" : "black";
                    }
        
                    return (
                      <td key={`${m}_${k}`} style={{
                        padding: 8,
                        border: "1px solid #ccc",
                        textAlign: "center",
                        color,
                        fontWeight:
                          (k.includes("growth") || k.includes("percentage")) && val !== 0
                            ? "600"
                            : "400"
                      }}>
                        {formattedValue}
                      </td>
                    );
                  })
                )}
        
                {/* NEW — ALL COLUMN */}
                {keys.map((k) => {
                  const val = allTotals[k];
                  let formattedValue = "";
        
                  if (k.includes("growth")) formattedValue = `${val.toFixed(growthDecimalDigits)}%`;
                  else if (k.includes("percentage")) formattedValue = `${val.toFixed(percentageDecimalDigits)}%`;
                  else formattedValue = val.toFixed(decimalDigits);
        
                  return (
                    <td key={`all_${k}`} style={{
                      padding: 8,
                      border: "1px solid #ccc",
                      textAlign: "center",
                      background: "#fff7e6",
                      fontWeight: "600"
                    }}>
                      {formattedValue}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        
          {/* ----------------------- */}
          {/* GRAND TOTAL ROW WITH ALL */}
          {/* ----------------------- */}
          <tr style={{ background: "#d9edf7", fontWeight: "bold" }}>
            <td style={{ padding: 8, border: "1px solid #ccc" }}>Grand Total</td>
        
            {/* Per-month totals */}
            {chartMonths.flatMap((m) =>
              keys.map((k) => {
                const prev = keys[0];
                const curr = keys[1];
        
                const prevTotal = tableData.reduce(
                  (sum, r) => sum + (r[`${m}_${prev}`] || 0),
                  0
                );
        
                const currTotal = tableData.reduce(
                  (sum, r) => sum + (r[`${m}_${curr}`] || 0),
                  0
                );
        
                if (k.includes("growth")) {
                  const growth =
                    prevTotal === 0 ? 0 : ((currTotal - prevTotal) / prevTotal) * 100;
        
                  return (
                    <td key={`${m}_${k}`}
                      style={{
                        padding: 8,
                        border: "1px solid #ccc",
                        textAlign: "center",
                        color: growth < 0 ? "rgba(215,7,7,1)" : "rgba(6,226,24,1)"
                      }}>
                      {growth.toFixed(growthDecimalDigits)}%
                    </td>
                  );
                }
        
                if (k.includes("percentage")) {
                  const pct = grandTotals[m]["percentage"];
        
                  return (
                    <td key={`${m}_${k}`} style={{
                      padding: 8,
                      border: "1px solid #ccc",
                      textAlign: "center",
                      color: "rgba(6,226,24,1)"
                    }}>
                      {pct.toFixed(percentageDecimalDigits)}%
                    </td>
                  );
                }
        
                const total = tableData.reduce(
                  (sum, r) => sum + (r[`${m}_${k}`] || 0),
                  0
                );
        
                return (
                  <td key={`${m}_${k}`} style={{
                    padding: 8,
                    border: "1px solid #ccc",
                    textAlign: "center"
                  }}>
                    {total.toFixed(decimalDigits)}
                  </td>
                );
              })
            )}
        
            {/* NEW — GRAND TOTAL (ALL) */}
            {keys.map((k) => {
              const prev = keys[0];
              const curr = keys[1];
        
              // Sum all months for all cities
              const fullSum = tableData.reduce((sum, r) => {
                return (
                  sum +
                  chartMonths.reduce(
                    (sub, m) => sub + (r[`${m}_${k}`] || 0),
                    0
                  )
                );
              }, 0);
        
              if (k.includes("growth")) {
                const prevAll = tableData.reduce(
                  (s, r) =>
                    s +
                    chartMonths.reduce(
                      (ss, m) => ss + (r[`${m}_${prev}`] || 0),
                      0
                    ),
                  0
                );
        
                const currAll = tableData.reduce(
                  (s, r) =>
                    s +
                    chartMonths.reduce(
                      (ss, m) => ss + (r[`${m}_${curr}`] || 0),
                      0
                    ),
                  0
                );
        
                const g =
                  prevAll === 0 ? 0 : ((currAll - prevAll) / prevAll) * 100;
        
                return (
                  <td key={`all_gt_${k}`} style={{
                    padding: 8,
                    border: "1px solid #ccc",
                    textAlign: "center",
                    color: g < 0 ? "rgba(215,7,7,1)" : "rgba(6,226,24,1)"
                  }}>
                    {g.toFixed(growthDecimalDigits)}%
                  </td>
                );
              }
        
              return (
                <td key={`all_gt_${k}`} style={{
                  padding: 8,
                  border: "1px solid #ccc",
                  textAlign: "center",
                  background: "#c8e6ff"
                }}>
                  {fullSum.toFixed(decimalDigits)}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </Box>
  );
};

export default CityWiseSummaryTable;
