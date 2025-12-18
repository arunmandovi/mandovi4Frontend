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

  // ⬅️ UPDATED: Format value function
  const formatValue = (value, field) => {
    if (value === null || value === undefined) return "-";

    const num = Number(value);
    if (!isNaN(num)) {
      if (num === 0) return "-";

      // Utilized Bay → always integer
      if (field === "Utilized Bay") {
        return Math.round(num);
      }

      // Remove unnecessary .00 but keep decimals if needed
      const fixed = num.toFixed(decimalPlaces);
      return fixed.endsWith(".00")
        ? fixed.replace(".00", "")
        : fixed.replace(/\.0$/, "");
    }

    return value;
  };

  const allKeys = Object.keys(data[0]);

  const columns = allKeys
    .filter((key) => !hiddenColumns.includes(key))
    .map((key, index) => ({
      field: key,
      headerName: key,
      flex: index === 0 ? 1.8 : 1,
      width: index === 0 ? 160 : 80,
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

        // Pass the column name to formatValue
        return formatValue(value, params.field);
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
            height: "40px",
          },
          "& .MuiDataGrid-columnHeaderTitle": {
            fontWeight: "900 !important",
            color: "rgba(0, 0, 0, 1)",
            fontSize: "17px",
            textTransform: "uppercase",
            letterSpacing: "0.7px",
          },

          "& .MuiDataGrid-cell": {
            padding: "4px 10px",
            fontSize: "17px",
            fontWeight: "bold",
            borderRight: "1px solid #c7d4e6",
            borderBottom: "1px solid #c7d4e6",
            display: "flex",
            alignItems: "center",
          },

          "& .MuiDataGrid-row:nth-of-type(odd)": {
            backgroundColor: "#f7faff",
          },
          "& .MuiDataGrid-row:nth-of-type(even)": {
            backgroundColor: "#eef4ff",
          },

          "& .MuiDataGrid-row:hover": {
            backgroundColor: "#dcedff !important",
            transform: "scale(1.003)",
            transition: "0.12s ease-in-out",
          },
        }}
      />
    </Box>
  );
}
