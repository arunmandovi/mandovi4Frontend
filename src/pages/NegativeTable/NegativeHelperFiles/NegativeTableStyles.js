import { red } from "@mui/material/colors";

export const FONT_SIZES = {
  header: "0.85rem",
  subheader: "0.75rem",
  cell: "0.8rem",
  title: "h5",
};

export const toggleGroupSx = {
  p: 0.5,
  borderRadius: "999px",
  backgroundColor: "#f8fafc",
  border: "1px solid #d6dbe3",
  boxShadow: "0 2px 8px rgba(15, 23, 42, 0.08)",
  "& .MuiToggleButtonGroup-grouped": {
    margin: "0 4px",
    border: "1px solid #d6dbe3 !important",
    borderRadius: "999px !important",
    textTransform: "none",
    fontSize: "0.82rem",
    fontWeight: 600,
    padding: "6px 14px",
    color: "#334155",
    backgroundColor: "#fff",
    minWidth: 92,
    transition: "all 0.2s ease",
    "&:not(:first-of-type)": {
      borderLeft: "1px solid #d6dbe3 !important",
    },
    "&:hover": {
      backgroundColor: "#eef4ff",
      borderColor: "#94a3b8",
      transform: "translateY(-1px)",
    },
    "&.Mui-selected": {
      background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)",
      color: "#fff",
      borderColor: "#2563eb !important",
      boxShadow: "0 4px 10px rgba(37, 99, 235, 0.25)",
    },
    "&.Mui-selected:hover": {
      background: "linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%)",
    },
  },
};

export const tableContainerSx = {
  borderRadius: 3,
  boxShadow: 4,
  border: "2px solid #455a64",
  maxHeight: 600,
};

export const tableSx = {
  "& th, & td": {
    border: "1px solid #9e9e9e",
    fontSize: "0.8rem",
    padding: "4px 6px",
  },
};

export const tableHeadRowSx = {
  background: "#718390ff",
  "& th": {
    color: "#fff",
    fontWeight: 800,
    fontSize: "0.85rem",
  },
};

export const getNegativeCellSx = (value) => {
  if (value === "--" || value === null) return {};
  const num = parseFloat(String(value).replace("%", ""));
  if (isNaN(num) || num >= 0) return {};
  return {
    backgroundColor: red[100],
    color: red[800],
    fontWeight: 900,
  };
};