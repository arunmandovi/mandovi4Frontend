import * as React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Typography } from "@mui/material";

export default function DataTable({ data, title, hiddenColumns = [] }) {
  if (!data || data.length === 0) {
    return (
      <Typography variant="body1" color="text.secondary">
        ⚠ No data available
      </Typography>
    );
  }

  // Column header rename map
  const columnRenameBatteryMap = {
    totalQty: "QTY",
    totalDDL: "Net Retail DDL",
    totalSelling: "Net Retail Selling",
    percentageProfit: "PROFIT%",
  };

  // Format numeric values before rendering
  const formattedData = data.map((row) => {
    const newRow = { ...row };

    // totalQty as integer
    if (newRow.totalQty !== undefined && !isNaN(newRow.totalQty)) {
      newRow.totalQty = parseInt(newRow.totalQty, 10);
    }

    // totalDDL, totalSelling, profit with Indian number format
    ["totalDDL", "totalSelling", "profit"].forEach((col) => {
      if (newRow[col] !== undefined && !isNaN(Number(newRow[col]))) {
        newRow[col] = Number(newRow[col]).toLocaleString("en-IN", {
          maximumFractionDigits: 0,
        });
      }
    });

    // percentageProfit with 2 decimals + %
    if (newRow.percentageProfit !== undefined && !isNaN(Number(newRow.percentageProfit))) {
      newRow.percentageProfit = Number(newRow.percentageProfit).toFixed(2) + "%";
    }

    return newRow;
  });

  // Dynamically build columns, hide any columns passed via hiddenColumns
  const columns = Object.keys(formattedData[0])
    .filter((key) => !hiddenColumns.includes(key))
    .map((key) => ({
      field: key,
      headerName: columnRenameBatteryMap[key] || key.toUpperCase(),
      flex: 1,
      minWidth: 120,
    }));

  return (
    <Box sx={{ height: 500, width: "100%", display: "flex", flexDirection: "column" }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold", color: "text.primary" }}>
        {title}
      </Typography>

      <DataGrid
        rows={formattedData.map((row, i) => ({ id: i, ...row }))}
        columns={columns}
        disableRowSelectionOnClick
        pagination={false}
        autoHeight={false}
        sx={{
          borderRadius: 1,
          border: "1px solid #ddd",
          backgroundColor: "#fff",
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#f5f5f5",
            fontWeight: "bold",
            borderBottom: "2px solid #ddd",
          },
          "& .MuiDataGrid-columnHeader": {
            backgroundColor: "#e8f0fe",
            borderRadius: "6px",
            margin: "2px",
            padding: "6px",
            textAlign: "center",
            transition: "all 0.2s ease-in-out",
            fontWeight: "600",
            border: "1px solid #90caf9",
            cursor: "pointer",
            lineHeight: "1.2rem",
            whiteSpace: "normal",
            wordBreak: "break-word",
          },
          "& .MuiDataGrid-columnHeader:hover": {
            backgroundColor: "#d0e3ff",
            borderColor: "#42a5f5",
            boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
          },
          "& .MuiDataGrid-columnHeader:active": {
            backgroundColor: "#bbdefb",
            transform: "scale(0.98)",
          },
          "& .MuiDataGrid-cell": {
            fontSize: "0.85rem",
          },
          "& .MuiDataGrid-row:hover": {
            backgroundColor: "#fafafa",
          },
        }}
      />
    </Box>
  );
}
