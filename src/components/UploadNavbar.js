import React from "react";
import { Button } from "@mui/material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../styles/Navbar.css";
import { uploadNavbarButtons } from "../config/uploadNavBarButtons";

const UploadNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/AdminLogin");
  };

  return (
    <nav className="navbar fixed-upload-navbar">
      {uploadNavbarButtons.map((btn) => (
        <Link
          key={btn.path}
          to={btn.path}
          className={location.pathname === btn.path ? "active-nav-link" : ""}
        >
          {btn.label}
        </Link>
      ))}

      <Button 
        variant="contained" 
        color="error"
        onClick={handleLogout}
        sx={{ ml: 2 }}
      >
        Logout
      </Button>
    </nav>
  );
};

export default UploadNavbar;
