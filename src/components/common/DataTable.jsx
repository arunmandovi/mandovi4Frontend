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

  // 🔹 Identify the first DB column name dynamically
  const firstDbColumn = Object.keys(safeData[0])[0];

  // 🔹 Exclude the auto DB column + batteryTyreSINo + id
  const dataColumns = Object.keys(safeData[0])
    .filter(
      (key) =>
        key !== firstDbColumn && key !== "batteryTyreSINo" && key !== "id"
    )
    .map((key) => ({
      field: key,
      headerName: key.replace(/_/g, " ").toUpperCase(),
      flex: 1,
    }));

  // 🔹 Add Serial Number column at the beginning
  const columns = [
    {
      field: "serialNo",
      headerName: "SI NO",
      width: 90,
    },
    ...dataColumns,
  ];

  return (
    <Box sx={{ width: "100%", mt: 2 }}>
      <DataGrid
        rows={safeData.map((row, index) => ({
          id: index + 1,
          serialNo: index + 1,
          ...row,
        }))}
        columns={columns}
        pageSize={25}
        rowsPerPageOptions={[5, 10, 25, 50]}
        disableSelectionOnClick
        style={{ height: 600 }}     // ⬅ FIXED HEIGHT FOR SCROLLING
        sx={{
          "& .MuiDataGrid-columnHeaders": {
            position: "sticky",
            top: 0,
            zIndex: 10,
            backgroundColor: "#f1f1f1",
            fontWeight: "bold",
          },
          "& .MuiDataGrid-columnHeaderTitle": {
            fontWeight: "bold",
          },
        }}
      />
    </Box>
  );
}
