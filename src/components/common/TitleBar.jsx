import React from "react";
import { Box, Typography } from "@mui/material";

export default function TitleBar({ title }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
      }}
    >
      {/* Accent Bar */}
      <Box
        sx={{
          width: "6px",
          height: "32px",
          background: "linear-gradient(180deg, #1976d2, #42a5f5)",
          borderRadius: "4px",
        }}
      ></Box>

      {/* Title Text */}
      <Typography
        sx={{
          fontSize: "26px",
          fontWeight: 700,
          color: "#333",
          letterSpacing: "0.5px",
        }}
      >
        {title}
      </Typography>
    </Box>
  );
}
