import { DataGrid } from "@mui/x-data-grid";
import { Box, Typography } from "@mui/material";

export default function DataTable({ tableData }) {
  const safeData = Array.isArray(tableData) ? tableData : [];

  if (safeData.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography sx={{ textAlign: "center", color: "text.secondary" }}>
          ⚠ No Data Found
        </Typography>
      </Box>
    );
  }

  const columns = Object.keys(safeData[0])
    .filter((key) => key !== "batteryTyreSINo" && key !== "id")
    .map((key) => ({
      field: key,
      headerName: key.replace(/_/g, " ").toUpperCase(),
      flex: 1,
    }));

  return (
    <Box sx={{ width: "100%", mt: 2 }}>
      <DataGrid
        autoHeight
        rows={safeData.map((row, index) => ({ id: index + 1, ...row }))}
        columns={columns}
        pageSize={25}
        rowsPerPageOptions={[5, 10, 25, 50]}
        disableSelectionOnClick
      />
    </Box>
  );
}
