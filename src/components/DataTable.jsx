import * as React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Typography } from "@mui/material";

export default function DataTable({ data, title, hiddenColumns = [], decimalPlaces = 0 }) {
  if (!data || data.length === 0) {
    return (
      <Typography variant="body1" color="text.secondary">
        ⚠ No data available
      </Typography>
    );
  }

  const formatValue = (value) => {
    if (value === null || value === undefined) return "-";

    // 🔹 If number → apply decimalPlaces
    if (typeof value === "number") return value.toFixed(decimalPlaces);

    // 🔹 If numeric string → convert & apply decimalPlaces
    if (!isNaN(value) && value !== "-") return Number(value).toFixed(decimalPlaces);

    return value;
  };

  const allKeys = Object.keys(data[0]);

  const columns = allKeys
    .filter((key) => !hiddenColumns.includes(key))
    .map((key) => ({
      field: key,
      headerName: key,
      flex: 1,
      minWidth: 150,
      sortable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        let value = params.value;

        // Right-align percentage text
        if (typeof value === "string" && value.includes("%")) {
          return <Box sx={{ textAlign: "right", width: "100%" }}>{value}</Box>;
        }

        return formatValue(value);
      },
    }));

  const rows = data.map((row, index) => ({
    id: index + 1,
    ...row,
  }));

  return (
    <Box sx={{ height: "auto", width: "100%", backgroundColor: "#fff" }}>
      {title && (
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            fontWeight: 600,
            textAlign: "center",
            textTransform: "uppercase",
          }}
        >
          {title}
        </Typography>
      )}

      <DataGrid
        rows={rows}
        columns={columns}
        disableColumnMenu
        autoHeight
        hideFooter
        sx={{
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#f5f5f5",
            fontWeight: "bold",
            textAlign: "center",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "1px solid #e0e0e0",
            padding: "6px 8px",
          },
        }}
      />
    </Box>
  );
}
