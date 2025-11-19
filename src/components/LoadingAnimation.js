import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

export default function LoadingAnimation() {
  return (
    <Box
      sx={{
        width: "100%",
        padding: "40px 0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",

        backgroundColor: "#ffffff",
        borderRadius: "12px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.08)",

        border: "1px solid #e0e0e0",
        mb: 3,
      }}
    >
      <CircularProgress size={55} thickness={4} />

      <Typography
        sx={{
          mt: 2,
          fontSize: "18px",
          fontWeight: 600,
          color: "#1976d2",
        }}
      >
        Loading... Please wait
      </Typography>
    </Box>
  );
}
