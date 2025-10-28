import React from "react";
import { Box, Button, Typography } from "@mui/material";

const SlicerFilters = ({
  monthOptions = [],
  cityOptions = [],
  months = [],
  setMonths = () => {},
  cities = [],
  setCities = () => {},
}) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mb: 3 }}>
      {/* Month Slicer */}
      {monthOptions.length > 0 && (
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Select Month(s)
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.2 }}>
            {monthOptions.map((m, idx) => {
              const selected = months.includes(m);
              return (
                <Button
                  key={m}
                  variant={selected ? "contained" : "outlined"}
                  color={selected ? "secondary" : "primary"}
                  sx={{
                    borderRadius: "20px",
                    px: 2,
                    py: 0.5,
                    textTransform: "none",
                    fontWeight: 600,
                    transition: "all 0.3s ease",
                    background: selected
                      ? `linear-gradient(90deg, hsl(${idx * 40}, 70%, 45%), hsl(${
                          (idx * 40 + 20) % 360
                        }, 70%, 55%))`
                      : "transparent",
                    color: selected ? "white" : "inherit",
                    boxShadow: selected
                      ? `0 3px 10px rgba(0,0,0,0.15)`
                      : "none",
                    "&:hover": {
                      transform: "scale(1.05)",
                    },
                  }}
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
            {cityOptions.map((c, idx) => {
              const selected = cities.includes(c);
              return (
                <Button
                  key={c}
                  variant={selected ? "contained" : "outlined"}
                  color={selected ? "secondary" : "primary"}
                  sx={{
                    borderRadius: "20px",
                    px: 2,
                    py: 0.5,
                    textTransform: "none",
                    fontWeight: 600,
                    transition: "all 0.3s ease",
                    background: selected
                      ? `linear-gradient(90deg, hsl(${idx * 35}, 70%, 45%), hsl(${
                          (idx * 35 + 20) % 360
                        }, 70%, 55%))`
                      : "transparent",
                    color: selected ? "white" : "inherit",
                    boxShadow: selected
                      ? `0 3px 10px rgba(0,0,0,0.15)`
                      : "none",
                    "&:hover": {
                      transform: "scale(1.05)",
                    },
                  }}
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
