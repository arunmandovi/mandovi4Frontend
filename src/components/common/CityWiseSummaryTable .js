import React from "react";
import { Box, Typography } from "@mui/material";

const CityWiseSummaryTable = ({
  selectedGrowth,
  chartMonths,
  keys,
  beautifyHeader,
  tableData,
  decimalDigits = 1   // default for non-growth values
}) => {
  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        City-wise Summary – {selectedGrowth}
      </Typography>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
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
          </tr>

          <tr style={{ background: "#fafafa" }}>
            <th style={{ padding: 8, border: "1px solid #ccc" }}></th>

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
          </tr>
        </thead>

        <tbody>
          {tableData.map((row, i) => (
            <tr key={i}>
              <td
                style={{
                  padding: 8,
                  border: "1px solid #ccc",
                  textAlign: "center",
                  fontWeight: "bold"
                }}
              >
                {row.city}
              </td>

              {chartMonths.flatMap((m) =>
                keys.map((k) => {
                  const val = row[`${m}_${k}`] || 0;

                  // growth always 1 decimal
                  const formattedValue = k.includes("growth")
                    ? `${val.toFixed(1)}%`
                    : val.toFixed(decimalDigits);

                  return (
                    <td
                      key={`${m}_${k}`}
                      style={{
                        padding: 8,
                        border: "1px solid #ccc",
                        textAlign: "center",
                        color: k.includes("growth")
                          ? val > 0
                            ? "rgba(6, 226, 24, 1)"
                            : val < 0
                            ? "rgba(215, 7, 7, 1)"
                            : "black"
                          : "black",
                        fontWeight:
                          k.includes("growth") && val !== 0 ? "600" : "400"
                      }}
                    >
                      {formattedValue}
                    </td>
                  );
                })
              )}
            </tr>
          ))}

          {/* GRAND TOTAL ROW */}
          <tr style={{ background: "#d9edf7", fontWeight: "bold" }}>
            <td style={{ padding: 8, border: "1px solid #ccc" }}>
              Grand Total
            </td>

            {chartMonths.flatMap((m) =>
              keys.map((k) => {
                const values = tableData.map((r) => r[`${m}_${k}`] || 0);

                if (k.includes("growth")) {
                  const prev = keys[0];
                  const curr = keys[1];

                  const prevTotal = tableData.reduce(
                    (s, r) => s + (r[`${m}_${prev}`] || 0),
                    0
                  );

                  const currTotal = tableData.reduce(
                    (s, r) => s + (r[`${m}_${curr}`] || 0),
                    0
                  );

                  const growth =
                    prevTotal === 0
                      ? 0
                      : ((currTotal - prevTotal) / prevTotal) * 100;

                  return (
                    <td
                      key={`${m}_${k}`}
                      style={{
                        padding: 8,
                        border: "1px solid #ccc",
                        textAlign: "center",
                        color: growth < 0 ? "rgba(215, 7, 7, 1)" : "rgba(6, 226, 24, 1)"
                      }}
                    >
                      {growth.toFixed(1)}%
                    </td>
                  );
                }

                const total = values.reduce((a, b) => a + b, 0);

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
          </tr>
        </tbody>
      </table>
    </Box>
  );
};

export default CityWiseSummaryTable;
