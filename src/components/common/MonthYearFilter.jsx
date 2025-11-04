import React from "react";
import { Box, Button, Typography } from "@mui/material";

const MONTHS = [
  "Apr", "May", "Jun", "Jul", "Aug", "Sep",
  "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"
];

const YEARS = ["2024", "2025"];

const MonthYearFilter = ({
  months = [],
  years = [],
  setMonths = () => {},
  setYears = () => {},
  onFilter,
  onViewAll,
}) => {
  const selectedGradient =
    "linear-gradient(90deg, rgba(144,238,144,1) 0%, rgba(102,205,170,1) 100%)";

  const commonButtonStyles = (selected) => ({
    borderRadius: "20px",
    px: 2,
    py: 0.5,
    textTransform: "none",
    fontWeight: 600,
    transition: "all 0.18s ease",
    background: selected ? selectedGradient : "white",
    border: selected ? "1.5px solid #388e3c" : "1px solid #bdbdbd",
    boxShadow: selected ? "0 4px 12px rgba(0,0,0,0.12)" : "none",
    "&:hover": {
      transform: "scale(1.03)",
      background: selected ? selectedGradient : "rgba(0, 0, 0, 0.04)",
    },
  });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mb: 3 }}>
      {/* Row: Month & Year Filters */}
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 4, flexWrap: "wrap" }}>
        
        {/* Month slicer */}
        <Box>
          <Typography sx={{ fontWeight: 600, mb: 1 }}>Select Month(s)</Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.2 }}>
            {MONTHS.map((m) => {
              const selected = months.includes(m);
              return (
                <Button
                  key={m}
                  size="small"
                  sx={commonButtonStyles(selected)}
                  onClick={() =>
                    selected ? setMonths(months.filter((x) => x !== m)) : setMonths([...months, m])
                  }
                >
                  {m}
                </Button>
              );
            })}
          </Box>
        </Box>

        {/* Year slicer */}
        <Box>
          <Typography sx={{ fontWeight: 600, mb: 1 }}>Select Year(s)</Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.2 }}>
            {YEARS.map((y) => {
              const selected = years.includes(y);
              return (
                <Button
                  key={y}
                  size="small"
                  sx={commonButtonStyles(selected)}
                  onClick={() =>
                    selected ? setYears(years.filter((x) => x !== y)) : setYears([...years, y])
                  }
                >
                  {y}
                </Button>
              );
            })}
          </Box>
        </Box>

      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: "flex", gap: 2 }}>
        <Button variant="contained" color="secondary" onClick={onViewAll}>
          📄 View All
        </Button>

        <Button
          variant="contained"
          color="primary"
          onClick={onFilter}
          disabled={months.length === 0 && years.length === 0}
        >
          🔎 Apply Filter
        </Button>
      </Box>
    </Box>
  );
};

export default MonthYearFilter;
