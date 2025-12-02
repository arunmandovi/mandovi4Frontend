import * as React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Typography } from "@mui/material";

export default function DataTable({
  data,
  title,
  hiddenColumns = [],
  decimalPlaces = 0,
}) {
  const [animateKey, setAnimateKey] = React.useState(0);

  React.useEffect(() => {
    setAnimateKey((prev) => prev + 1);
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <Typography variant="body1" color="text.secondary">
        ⚠ No data available
      </Typography>
    );
  }

  // ⬅️ UPDATED: Show blank ("-") when value is 0
  const formatValue = (value) => {
    if (value === null || value === undefined) return "-";

    // Blank for zero
    if (Number(value) === 0) return "-";

    if (typeof value === "number") return value.toFixed(decimalPlaces);

    if (!isNaN(value) && value !== "-") return Number(value).toFixed(decimalPlaces);

    return value;
  };

  const allKeys = Object.keys(data[0]);

  const columns = allKeys
    .filter((key) => !hiddenColumns.includes(key))
    .map((key, index) => ({
      field: key,
      headerName: key,
      flex: index === 0 ? 1.8 : 1,
      minWidth: index === 0 ? 180 : 90,
      sortable: false,
      headerAlign: "center",
      align: "left",

      renderCell: (params) => {
        let value = params.value;

        // ⬅️ UPDATED: If "0%" then show blank
        if (typeof value === "string" && value.includes("%")) {
          return (
            <Box sx={{ textAlign: "right", width: "100%" }}>
              {value.startsWith("0") ? "-" : value}
            </Box>
          );
        }

        return formatValue(value);
      },
    }));

  const rows = data.map((row, index) => ({
    id: index + 1,
    ...row,
  }));

  return (
    <Box
      key={animateKey}
      sx={{
        height: "100%",
        width: "100%",
        p: 2,
        borderRadius: "16px",
        background: "rgba(255, 255, 255, 0.75)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
        animation: "popIn 0.45s ease",

        "@keyframes popIn": {
          "0%": { opacity: 0, transform: "scale(0.97)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
      }}
    >
      {title && (
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            fontWeight: "900 !important",
            fontSize: "22px",
            color: "#002b5b",
            textAlign: "left",
            textTransform: "uppercase",
            letterSpacing: "1.2px",
            textShadow: "0px 1px 3px rgba(0,0,0,0.35)",
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
          borderRadius: "14px",
          overflow: "hidden",
          border: "5px solid #b9c9df",

          "& .MuiDataGrid-columnHeaders": {
            background: "linear-gradient(135deg, #d1e2ff, #f0f6ff)",
            borderBottom: "3px solid #99b3d8",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            height: "56px",
          },
          "& .MuiDataGrid-columnHeaderTitle": {
            fontWeight: "900 !important",
            color: "rgba(0, 0, 0, 1)",
            fontSize: "17px",
            textTransform: "uppercase",
            letterSpacing: "0.7px",
          },

          "& .MuiDataGrid-cell": {
            borderRight: "1px solid #c7d4e6",
            borderBottom: "1px solid #c7d4e6",
            fontSize: "20px",
            fontWeight: "500",
            color: "rgba(8, 8, 8, 1)",
          },

          "& .MuiDataGrid-row": {
            borderBottom: "1px solid #c7d4e6",
          },

          "& .MuiDataGrid-row:nth-of-type(odd)": {
            backgroundColor: "#f7faff",
          },
          "& .MuiDataGrid-row:nth-of-type(even)": {
            backgroundColor: "#eef4ff",
          },

          "& .MuiDataGrid-row:hover": {
            backgroundColor: "#dcedff !important",
            transform: "scale(1.004)",
            transition: "0.15s ease-in-out",
            boxShadow: "0 3px 10px rgba(0,0,0,0.12)",
          },
        }}
      />
    </Box>
  );
}
