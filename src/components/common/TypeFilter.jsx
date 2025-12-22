import React from "react";
import { Box, Button, Typography } from "@mui/material";

const TYPES = ["CASH", "INVOICE", "INSURANCE", "OTHERS"];

const TypeFilter = ({
  types = [],
  setTypes = () => {},
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
      {/* Type Filters */}
      <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        <Box>
          <Typography sx={{ fontWeight: 600, mb: 1 }}>
            Select Type(s)
          </Typography>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.2 }}>
            {TYPES.map((type) => {
              const selected = types.includes(type);
              return (
                <Button
                  key={type}
                  size="small"
                  sx={commonButtonStyles(selected)}
                  onClick={() =>
                    selected
                      ? setTypes(types.filter((t) => t !== type))
                      : setTypes([...types, type])
                  }
                >
                  {type}
                </Button>
              );
            })}
          </Box>
        </Box>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: "flex", gap: 2 }}>
        <Button variant="contained" color="secondary" onClick={onViewAll}>
          View All
        </Button>

        <Button
          variant="contained"
          color="primary"
          onClick={onFilter}
          disabled={types.length === 0}
        >
          Apply Filter
        </Button>
      </Box>
    </Box>
  );
};

export default TypeFilter;
