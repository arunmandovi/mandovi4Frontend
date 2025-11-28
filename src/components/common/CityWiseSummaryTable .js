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
  percentageProfitDecimalDigits = 1,
}) => {

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
      percentage: totalLY === 0 ? 0 : (totalTY / totalLY) * 100
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
          {/* ROW 1 – MONTH HEADER */}
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

            <th
              colSpan={keys.length}
              style={{
                padding: 8,
                border: "1px solid #ccc",
                background: "#ffeccc",
                textAlign: "center",
                fontWeight: "bold"
              }}
            >
              ALL
            </th>
          </tr>

          {/* ROW 2 – KEY HEADER */}
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
                  fontWeight: "bold"
                }}
              >
                {beautifyHeader(k)}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {/* ----------------------------------------------------
             CITY ROWS
          ---------------------------------------------------- */}
          {tableData.map((row, idx) => {
            const allTotals = {};

            // ----------------------------------------------------
            // ALL TOTAL CALCULATION (PER CITY)
            // ----------------------------------------------------
            keys.forEach((k) => {
              const LY = keys[0];
              const TY = keys[1];

              if (k.includes("percentage")) {
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
              }

              else if (k.includes("growth")) {
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
              }

              else {
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
                    textAlign: "center"
                  }}
                >
                  {row.city}
                </td>

                {/* MONTH CELLS */}
                {chartMonths.flatMap((m) =>
                  keys.map((k) => {
                    const val = Number(row[`${m}_${k}`] || 0);
                    let formatted =
                      k.includes("growth")
                        ? `${val.toFixed(growthDecimalDigits)}%`
                        : k.includes("percentage")
                        ? `${val.toFixed(k.includes("percentageProfit") ? 1 : percentageDecimalDigits)}%`
                        : val.toFixed(decimalDigits);

                    let color = "black";

                    if (k.includes("percentage")) {
                      const bench = grandTotals[m].percentage;
                      color =
                        val < bench
                          ? "rgba(215,7,7,1)"
                          : "rgba(6,226,24,1)";
                    }

                    if (k.includes("growth")) {
                      color =
                        val > 0
                          ? "rgba(6,226,24,1)"
                          : val < 0
                          ? "rgba(215,7,7,1)"
                          : "black";
                    }

                    return (
                      <td
                        key={`${m}_${k}`}
                        style={{
                          padding: 8,
                          border: "1px solid #ccc",
                          textAlign: "center",
                          color
                        }}
                      >
                        {formatted}
                      </td>
                    );
                  })
                )}

                {/* ALL COLUMN */}
                {keys.map((k) => {
                  const val = allTotals[k];

                  const formatted =
                    k.includes("percentage")
                      ? `${val.toFixed(k.includes("percentageProfit") ? 1 : percentageDecimalDigits)}%`
                      : k.includes("growth")
                      ? `${val.toFixed(growthDecimalDigits)}%`
                      : val.toFixed(decimalDigits);

                  let color = "black";

                  if (k.includes("percentage")) {
                    color =
                      val < avgBenchmark
                        ? "rgba(215,7,7,1)"
                        : "rgba(6,226,24,1)";
                  }

                  if (k.includes("growth")) {
                    color =
                      val > 0
                        ? "rgba(6,226,24,1)"
                        : val < 0
                        ? "rgba(215,7,7,1)"
                        : "black";
                  }

                  return (
                    <td
                      key={`all_${k}`}
                      style={{
                        padding: 8,
                        border: "1px solid #ccc",
                        background: "#fff7e6",
                        textAlign: "center",
                        fontWeight: "600",
                        color
                      }}
                    >
                      {formatted}
                    </td>
                  );
                })}
              </tr>
            );
          })}

          <tr style={{ background: "#d9edf7", fontWeight: "bold" }}>
            <td style={{ padding: 8, border: "1px solid #ccc" }}>
              Grand Total
            </td>

            {chartMonths.flatMap((m) =>
              keys.map((k) => {
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

                if (k.includes("growth")) {
                  const pct =
                    totalLY === 0 ? 0 : ((totalTY - totalLY) / totalLY) * 100;

                  return (
                    <td
                      key={`${m}_${k}`}
                      style={{
                        padding: 8,
                        border: "1px solid #ccc",
                        textAlign: "center",
                        color: pct >= 0 ? "rgba(6,226,24,1)" : "rgba(215,7,7,1)"
                      }}
                    >
                      {pct.toFixed(growthDecimalDigits)}%
                    </td>
                  );
                }

                if (k.includes("percentage")) {
                  const pct =
                    totalLY === 0 ? 0 : (totalTY / totalLY) * 100;

                  return (
                    <td
                      key={`${m}_${k}`}
                      style={{
                        padding: 8,
                        border: "1px solid #ccc",
                        textAlign: "center",
                        color: "rgba(6,226,24,1)"
                      }}
                    >
                      {pct.toFixed(k.includes("percentageProfit") ? 1 : percentageDecimalDigits)}%
                    </td>
                  );
                }

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
                      textAlign: "center"
                    }}
                  >
                    {total.toFixed(decimalDigits)}
                  </td>
                );
              })
            )}

            {keys.map((k) => {
              const LY = keys[0];
              const TY = keys[1];

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

              if (k.includes("percentage")) {
                const pct = fullLY === 0 ? 0 : (fullTY / fullLY) * 100;

                return (
                  <td
                    key={`all_gt_${k}`}
                    style={{
                      padding: 8,
                      border: "1px solid #ccc",
                      background: "#c8e6ff",
                      textAlign: "center",
                      color: "rgba(6,226,24,1)"
                    }}
                  >
                    {pct.toFixed(k.includes("percentageProfit") ? 1 : percentageDecimalDigits)}%
                  </td>
                );
              }

              if (k.includes("growth")) {
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
                      color:
                        pct > 0
                          ? "rgba(6,226,24,1)"
                          : pct < 0
                          ? "rgba(215,7,7,1)"
                          : "black"
                    }}
                  >
                    {pct.toFixed(growthDecimalDigits)}%
                  </td>
                );
              }

              const fullSum = tableData.reduce(
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
                    textAlign: "center"
                  }}
                >
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
