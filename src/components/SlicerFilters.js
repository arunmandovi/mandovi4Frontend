import React from "react";
import { Box, Button, Typography } from "@mui/material";

const SlicerFilters = ({
  monthOptions = [],   // ✅ default empty array
  cityOptions = [],    // ✅ default empty array
  months = [],         // ✅ default empty array
  setMonths = () => {}, // ✅ default no-op function
  cities = [],          // ✅ default empty array
  setCities = () => {}, // ✅ default no-op function
}) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mb: 3 }}>
      {/* Month Slicer */}
      {monthOptions.length > 0 && (
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Select Month(s)
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {monthOptions.map((m) => {
              const selected = months.includes(m);
              return (
                <Button
                  key={m}
                  variant={selected ? "contained" : "outlined"}
                  color={selected ? "secondary" : "primary"}
                  size="small"
                  sx={{
                    borderRadius: "20px",
                    textTransform: "none",
                    px: 2,
                    py: 0.5,
                    fontWeight: 600,
                    minWidth: "60px",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": { transform: "scale(1.05)" },
                  }}
                  onClick={() => {
                    if (selected) setMonths(months.filter((x) => x !== m));
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
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {cityOptions.map((c) => {
              const selected = cities.includes(c);
              return (
                <Button
                  key={c}
                  variant={selected ? "contained" : "outlined"}
                  color={selected ? "secondary" : "primary"}
                  size="small"
                  sx={{
                    borderRadius: "20px",
                    textTransform: "none",
                    px: 2,
                    py: 0.5,
                    fontWeight: 600,
                    minWidth: "80px",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": { transform: "scale(1.05)" },
                  }}
                  onClick={() => {
                    if (selected) setCities(cities.filter((x) => x !== c));
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
