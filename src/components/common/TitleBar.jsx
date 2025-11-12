import { Box, Typography, Button } from "@mui/material";

export default function TitleBar({ title, onBack }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
      <Typography
        variant="h5"
        sx={{ fontWeight: "bold", color: "#1976d2", textAlign: "center", flexGrow: 1 }}
      >
        {title}
      </Typography>

      
    </Box>
  );
}
