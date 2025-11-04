import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../styles/Navbar.css";
import { uploadNavbarButtons } from "../config/uploadNavBarButtons";

const UploadNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    navigate("/EmployeeLogin");
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

      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
    </nav>
  );
};

export default UploadNavbar;
