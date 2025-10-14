import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

function UploadNavbar({ title, buttons = [] }) {
  const navigate = useNavigate();

  return (
    <AppBar position="static">
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6">{title}</Typography>
        <Box>
          {buttons.map((btn, idx) => (
            <Button
              key={idx}
              color="inherit"
              onClick={() => navigate(btn.path)}
              sx={{ ml: 1 }}
            >
              {btn.label}
            </Button>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default UploadNavbar;