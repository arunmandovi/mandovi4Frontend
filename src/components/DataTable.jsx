import * as React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Typography } from "@mui/material";

export default function DataTable({ data, title }) {
  if (!data || data.length === 0) {
    return (
      <Typography variant="body1" color="text.secondary">
        ⚠ No data available
      </Typography>
    );
  }

  const columns = Object.keys(data[0]).map((key) => ({
    field: key,
    headerName: key.toUpperCase(),
    flex: 1,
  }));

  return (
    <Box
      sx={{
        height: 500,
        width: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography
        variant="h6"
        sx={{ mb: 2, fontWeight: "bold", color: "text.primary" }}
      >
        {title}
      </Typography>

      <DataGrid
        rows={data.map((row, i) => ({ id: i, ...row }))}
        columns={columns}
        disableSelectionOnClick
        pagination={false}
        autoHeight={false}
        sx={{
          borderRadius: 1,
          border: "1px solid #ddd",
          backgroundColor: "#fff",

          // ✅ Column headers
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#fafafa",
            fontWeight: "bold",
            fontSize: "0.9rem",
          },

          // ✅ Hover effect for column headers
          "& .MuiDataGrid-columnHeader:hover": {
            backgroundColor: "#e3f2fd",
            cursor: "pointer",
          },

          // ✅ Cells
          "& .MuiDataGrid-cell": {
            fontSize: "0.85rem",
          },

          // ✅ Row hover (light, not heavy)
          "& .MuiDataGrid-row:hover": {
            backgroundColor: "#f9f9f9",
          },
        }}
      />
    </Box>
  );
}
