import React from "react";
import { Box, Button } from "@mui/material";

const GrowthButtons = ({ growthOptions, selectedGrowth, setSelectedGrowth }) => {
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.2, mb: 2 }}>
      {growthOptions.map((g, idx) => (
        <Button
          key={g}
          variant={selectedGrowth === g ? "contained" : "outlined"}
          color={selectedGrowth === g ? "secondary" : "primary"}
          sx={{
            borderRadius: "20px",
            px: 2,
            py: 0.5,
            textTransform: "none",
            fontWeight: 600,
            transition: "all 0.3s ease",
            background:
              selectedGrowth === g
                ? `linear-gradient(90deg, hsl(${idx * 40}, 70%, 45%), hsl(${
                    (idx * 40 + 20) % 360
                  }, 70%, 55%))`
                : "transparent",
            color: selectedGrowth === g ? "white" : "inherit",
            boxShadow:
              selectedGrowth === g ? `0 3px 10px rgba(0,0,0,0.15)` : "none",
            "&:hover": {
              transform: "scale(1.05)",
            },
          }}
          onClick={() => setSelectedGrowth(g)}
        >
          {g.replace(" Growth %", "")}
        </Button>
      ))}
    </Box>
  );
};

export default GrowthButtons;
