import React from "react";
import { Box, Typography } from "@mui/material";

const CityWiseSummaryTable = ({
  selectedGrowth,
  chartMonths,
  keys,
  beautifyHeader,
  tableData,
  decimalDigits = 1,
  growthDecimalDigits = 1,
  percentageDecimalDigits = 0,
}) => {
  const isQtyKey = (k) =>
    k === "qtyFullSynthetic" ||
    k === "qtySemiSynthetic" ||
    k === "qtyFullSemiSynthetic";

  const baseQtyKeyMap = {
    qtyFullSynthetic: "fullSyntheticQTY",
    qtySemiSynthetic: "semiSyntheticQTY",
    qtyFullSemiSynthetic: "fullAndSemiSyntheticQty",
  };

  const computeQtyPercent = (base, total) =>
    total === 0 ? 0 : (base / total) * 100;

  // -------- GRAND TOTAL BENCHMARK --------
  const grandTotals = {};

  chartMonths.forEach((m) => {
    const LY = keys[0];
    const TY = keys[1];

    const totalLY = tableData.reduce(
      (sum, r) => sum + Number(r[`${m}_${LY}`] || 0),
      0
    );

    const totalTY = tableData.reduce(
      (sum, r) => sum + Number(r[`${m}_${TY}`] || 0),
      0
    );

    grandTotals[m] = {
      percentage: totalLY === 0 ? 0 : (totalTY / totalLY) * 100,
    };
  });

  const avgBenchmark =
    chartMonths.reduce((s, m) => s + grandTotals[m].percentage, 0) /
    chartMonths.length;

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        City-wise Summary – {selectedGrowth}
      </Typography>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          {/* -------- HEADER MONTH ROW -------- */}
          <tr style={{ background: "#f0f0f0" }}>
            <th style={{ padding: 8, border: "1px solid #ccc" }}>City</th>

            {chartMonths.map((m) => (
              <th
                key={m}
                colSpan={keys.length}
                style={{
                  padding: 8,
                  border: "1px solid #ccc",
                  textAlign: "center",
                }}
              >
                {m}
              </th>
            ))}

            <th
              colSpan={keys.length}
              style={{
                padding: 8,
                border: "1px solid #ccc",
                background: "#ffeccc",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              ALL
            </th>
          </tr>

          {/* -------- HEADER KEYS ROW -------- */}
          <tr style={{ background: "#fafafa" }}>
            <th style={{ padding: 8, border: "1px solid #ccc" }}></th>

            {chartMonths.flatMap((m) =>
              keys.map((k) => (
                <th
                  key={`${m}_${k}`}
                  style={{ padding: 8, border: "1px solid #ccc" }}
                >
                  {beautifyHeader(k)}
                </th>
              ))
            )}

            {keys.map((k) => (
              <th
                key={`ALL_${k}`}
                style={{
                  padding: 8,
                  border: "1px solid #ccc",
                  background: "#fff7e6",
                  fontWeight: "bold",
                }}
              >
                {beautifyHeader(k)}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {/* -------- CITY ROWS -------- */}
          {tableData.map((row, idx) => {
            const allTotals = {};
            const LY = keys[0];
            const TY = keys[1];

            // ------------ CITY TOTAL CALCULATIONS ------------
            keys.forEach((k) => {
              if (isQtyKey(k)) {
                const baseKey = baseQtyKeyMap[k];

                const totalBase = chartMonths.reduce(
                  (s, m) => s + Number(row[`${m}_${baseKey}`] || 0),
                  0
                );

                const totalGT = chartMonths.reduce(
                  (s, m) => s + Number(row[`${m}_grandTotal`] || 0),
                  0
                );

                allTotals[k] = computeQtyPercent(totalBase, totalGT);
              } else if (k.includes("percentage")) {
                const LYtotal = chartMonths.reduce(
                  (s, m) => s + Number(row[`${m}_${LY}`] || 0),
                  0
                );
                const TYtotal = chartMonths.reduce(
                  (s, m) => s + Number(row[`${m}_${TY}`] || 0),
                  0
                );

                allTotals[k] =
                  LYtotal === 0 ? 0 : (TYtotal / LYtotal) * 100;
              } else if (k.includes("growth")) {
                const LYtotal = chartMonths.reduce(
                  (s, m) => s + Number(row[`${m}_${LY}`] || 0),
                  0
                );
                const TYtotal = chartMonths.reduce(
                  (s, m) => s + Number(row[`${m}_${TY}`] || 0),
                  0
                );

                allTotals[k] =
                  LYtotal === 0 ? 0 : ((TYtotal - LYtotal) / LYtotal) * 100;
              } else {
                allTotals[k] = chartMonths.reduce(
                  (s, m) => s + Number(row[`${m}_${k}`] || 0),
                  0
                );
              }
            });

            return (
              <tr key={idx}>
                {/* CITY NAME */}
                <td
                  style={{
                    padding: 8,
                    border: "1px solid #ccc",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  {row.city}
                </td>

                {/* -------- MONTH VALUES -------- */}
                {chartMonths.flatMap((m) =>
                  keys.map((k) => {
                    let val = Number(row[`${m}_${k}`] || 0);

                    if (isQtyKey(k)) {
                      const baseKey = baseQtyKeyMap[k];
                      const baseVal = Number(row[`${m}_${baseKey}`] || 0);
                      const totalVal = Number(row[`${m}_grandTotal`] || 0);
                      val = computeQtyPercent(baseVal, totalVal);
                    }

                    // -------- UNIFIED FORMATTING RULE ----------
                    const formatted =
                      k.includes("percentage")
                        ? `${val.toFixed(percentageDecimalDigits)}%`
                        : k.includes("growth")
                        ? `${val.toFixed(growthDecimalDigits)}%`
                        : isQtyKey(k)
                        ? `${val.toFixed(0)}%`
                        : val.toFixed(decimalDigits);

                    return (
                      <td
                        key={`${m}_${k}`}
                        style={{
                          padding: 8,
                          border: "1px solid #ccc",
                          textAlign: "center",
                        }}
                      >
                        {formatted}
                      </td>
                    );
                  })
                )}

                {/* -------- ALL TOTAL (CITY) -------- */}
                {keys.map((k) => {
                  const val = allTotals[k];

                  const formatted =
                    k.includes("percentage")
                      ? `${val.toFixed(percentageDecimalDigits)}%`
                      : k.includes("growth")
                      ? `${val.toFixed(growthDecimalDigits)}%`
                      : isQtyKey(k)
                      ? `${val.toFixed(0)}%`
                      : val.toFixed(decimalDigits);

                  return (
                    <td
                      key={`all_${k}`}
                      style={{
                        padding: 8,
                        border: "1px solid #ccc",
                        background: "#fff7e6",
                        textAlign: "center",
                        fontWeight: "600",
                      }}
                    >
                      {formatted}
                    </td>
                  );
                })}
              </tr>
            );
          })}

          {/* -------- GRAND TOTAL ROW -------- */}
          <tr style={{ background: "#d9edf7", fontWeight: "bold" }}>
            <td style={{ padding: 8, border: "1px solid #ccc" }}>Grand Total</td>

            {chartMonths.flatMap((m) =>
              keys.map((k) => {
                const LY = keys[0];
                const TY = keys[1];

                // Qty% monthly grand total
                if (isQtyKey(k)) {
                  const baseKey = baseQtyKeyMap[k];

                  const baseSum = tableData.reduce(
                    (sum, r) => sum + Number(r[`${m}_${baseKey}`] || 0),
                    0
                  );

                  const totalSum = tableData.reduce(
                    (sum, r) => sum + Number(r[`${m}_grandTotal`] || 0),
                    0
                  );

                  const pct = computeQtyPercent(baseSum, totalSum);

                  return (
                    <td
                      key={`${m}_${k}`}
                      style={{
                        padding: 8,
                        border: "1px solid #ccc",
                        textAlign: "center",
                      }}
                    >
                      {pct.toFixed(0)}%
                    </td>
                  );
                }

                // BR% monthly
                if (k.includes("percentage")) {
                  const totalLY = tableData.reduce(
                    (sum, r) => sum + Number(r[`${m}_${LY}`] || 0),
                    0
                  );

                  const totalTY = tableData.reduce(
                    (sum, r) => sum + Number(r[`${m}_${TY}`] || 0),
                    0
                  );

                  const pct =
                    totalLY === 0 ? 0 : (totalTY / totalLY) * 100;

                  return (
                    <td
                      key={`${m}_${k}`}
                      style={{
                        padding: 8,
                        border: "1px solid #ccc",
                        textAlign: "center",
                      }}
                    >
                      {pct.toFixed(percentageDecimalDigits)}%
                    </td>
                  );
                }

                // Growth %
                if (k.includes("growth")) {
                  const totalLY = tableData.reduce(
                    (sum, r) => sum + Number(r[`${m}_${LY}`] || 0),
                    0
                  );

                  const totalTY = tableData.reduce(
                    (sum, r) => sum + Number(r[`${m}_${TY}`] || 0),
                    0
                  );

                  const pct =
                    totalLY === 0
                      ? 0
                      : ((totalTY - totalLY) / totalLY) * 100;

                  return (
                    <td
                      key={`${m}_${k}`}
                      style={{
                        padding: 8,
                        border: "1px solid #ccc",
                        textAlign: "center",
                      }}
                    >
                      {pct.toFixed(growthDecimalDigits)}%
                    </td>
                  );
                }

                // Normal totals
                const total = tableData.reduce(
                  (sum, r) => sum + Number(r[`${m}_${k}`] || 0),
                  0
                );

                return (
                  <td
                    key={`${m}_${k}`}
                    style={{
                      padding: 8,
                      border: "1px solid #ccc",
                      textAlign: "center",
                    }}
                  >
                    {total.toFixed(decimalDigits)}
                  </td>
                );
              })
            )}

            {/* -------- ALL COLUMN GRAND TOTAL -------- */}
            {keys.map((k) => {
              const LY = keys[0];
              const TY = keys[1];

              // Grand Total Qty%
              if (isQtyKey(k)) {
                const baseKey = baseQtyKeyMap[k];

                const sumBase = tableData.reduce(
                  (sum, r) =>
                    sum +
                    chartMonths.reduce(
                      (ss, m) => ss + Number(r[`${m}_${baseKey}`] || 0),
                      0
                    ),
                  0
                );

                const sumTotal = tableData.reduce(
                  (sum, r) =>
                    sum +
                    chartMonths.reduce(
                      (ss, m) => ss + Number(r[`${m}_grandTotal`] || 0),
                      0
                    ),
                  0
                );

                const pct = computeQtyPercent(sumBase, sumTotal);

                return (
                  <td
                    key={`all_gt_${k}`}
                    style={{
                      padding: 8,
                      border: "1px solid #ccc",
                      background: "#c8e6ff",
                      textAlign: "center",
                    }}
                  >
                    {pct.toFixed(0)}%
                  </td>
                );
              }

              // All % total
              if (k.includes("percentage")) {
                const fullLY = tableData.reduce(
                  (sum, r) =>
                    sum +
                    chartMonths.reduce(
                      (ss, m) => ss + Number(r[`${m}_${LY}`] || 0),
                      0
                    ),
                  0
                );

                const fullTY = tableData.reduce(
                  (sum, r) =>
                    sum +
                    chartMonths.reduce(
                      (ss, m) => ss + Number(r[`${m}_${TY}`] || 0),
                      0
                    ),
                  0
                );

                const pct = fullLY === 0 ? 0 : (fullTY / fullLY) * 100;

                return (
                  <td
                    key={`all_gt_${k}`}
                    style={{
                      padding: 8,
                      border: "1px solid #ccc",
                      background: "#c8e6ff",
                      textAlign: "center",
                    }}
                  >
                    {pct.toFixed(percentageDecimalDigits)}%
                  </td>
                );
              }

              // All growth%
              if (k.includes("growth")) {
                const fullLY = tableData.reduce(
                  (sum, r) =>
                    sum +
                    chartMonths.reduce(
                      (ss, m) => ss + Number(r[`${m}_${LY}`] || 0),
                      0
                    ),
                  0
                );

                const fullTY = tableData.reduce(
                  (sum, r) =>
                    sum +
                    chartMonths.reduce(
                      (ss, m) => ss + Number(r[`${m}_${TY}`] || 0),
                      0
                    ),
                  0
                );

                const pct =
                  fullLY === 0 ? 0 : ((fullTY - fullLY) / fullLY) * 100;

                return (
                  <td
                    key={`all_gt_${k}`}
                    style={{
                      padding: 8,
                      border: "1px solid #ccc",
                      background: "#c8e6ff",
                      textAlign: "center",
                    }}
                  >
                    {pct.toFixed(growthDecimalDigits)}%
                  </td>
                );
              }

              // Normal summation
              const total = tableData.reduce(
                (sum, r) =>
                  sum +
                  chartMonths.reduce(
                    (ss, m) => ss + Number(r[`${m}_${k}`] || 0),
                    0
                  ),
                0
              );

              return (
                <td
                  key={`all_gt_${k}`}
                  style={{
                    padding: 8,
                    border: "1px solid #ccc",
                    background: "#c8e6ff",
                    textAlign: "center",
                  }}
                >
                  {total.toFixed(decimalDigits)}
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
