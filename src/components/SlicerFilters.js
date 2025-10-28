import React from "react";
import { Box, Button, Typography } from "@mui/material";

const SlicerFilters = ({
  monthOptions = [],
  cityOptions = [],
  months = [], // initially selected months (auto-highlighted)
  setMonths = () => {},
  cities = [], // initially selected cities (auto-highlighted)
  setCities = () => {},
}) => {
  // ✅ Light green gradient for selected buttons
  const selectedGradient =
    "linear-gradient(90deg, rgba(144,238,144,1) 0%, rgba(102,205,170,1) 100%)";

  const commonButtonStyles = (selected) => ({
    borderRadius: "20px",
    px: 2,
    py: 0.5,
    textTransform: "none",
    fontWeight: 600,
    transition: "all 0.3s ease",
    background: selected ? selectedGradient : "white", // ✅ default white background
    color: "inherit", // ✅ text color always black
    border: selected ? "1.5px solid #388e3c" : "1px solid #bdbdbd",
    boxShadow: selected ? "0 3px 10px rgba(0,0,0,0.15)" : "none",
    "&:hover": {
      transform: "scale(1.05)",
      background: selected
        ? selectedGradient
        : "rgba(0, 0, 0, 0.04)", // light gray hover if unselected
    },
  });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mb: 3 }}>
      {/* Month Slicer */}
      {monthOptions.length > 0 && (
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Select Month(s)
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.2 }}>
            {monthOptions.map((m) => {
              const selected = months.includes(m); // ✅ auto-select based on current data
              return (
                <Button
                  key={m}
                  variant="outlined"
                  size="small"
                  sx={commonButtonStyles(selected)}
                  onClick={() => {
                    if (selected)
                      setMonths(months.filter((x) => x !== m));
                    else setMonths([...months, m]);
                  }}
                >
                  {m}
                </Button>
              );
            })}
          </Box>
        </Box>
      )}

      {/* City Slicer */}
      {cityOptions.length > 0 && (
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Select City(s)
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.2 }}>
            {cityOptions.map((c) => {
              const selected = cities.includes(c); // ✅ auto-select based on current data
              return (
                <Button
                  key={c}
                  variant="outlined"
                  size="small"
                  sx={commonButtonStyles(selected)}
                  onClick={() => {
                    if (selected)
                      setCities(cities.filter((x) => x !== c));
                    else setCities([...cities, c]);
                  }}
                >
                  {c}
                </Button>
              );
            })}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default SlicerFilters;
