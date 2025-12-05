import React, { useState, useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";
import DataTable from "../../components/DataTable";
import { fetchData } from "../../api/uploadService";
import { useNavigate } from "react-router-dom";
import SlicerFilters from "../../components/SlicerFilters";

function ReferenceeTablePage() {
  const [groupDesignationSummary, setGroupDesignationSummary] = useState([]);
  const [months, setMonths] = useState([]);
  const [cities, setCities] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);

  const navigate = useNavigate();

  const monthOptions = [
    "Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"
  ];

  const cityOptions = ["BANGALORE", "MYSORE", "MANGALORE"];

  const toNumberOrNull = (v) => {
    if (v === null || v === undefined || v === "-" || v === "") return null;
    const n = Number(v);
    return Number.isNaN(n) ? null : Math.round(n);
  };

  const groupDesignation_ORDER = ["MANAGER", "SERVICE ADVISOR", "SUPERVISOR"];

  // ---------- GRAND TOTAL UTILITY ----------
  const addGrandTotalRow = (rows) => {
    if (!rows || rows.length === 0) return rows;

    const keys = Object.keys(rows[0]);
    const firstColKey = keys[0];

    const totalRow = {};
    keys.forEach((k) => {
      totalRow[k] = 0;
    });
    totalRow[firstColKey] = "TOTAL";
    totalRow._isTotal = true;
    totalRow.id = "TOTAL_ROW";

    rows.forEach((row) => {
      keys.forEach((k) => {
        if (k === firstColKey) return;
        const val = row[k];
        if (val !== null && val !== undefined && val !== "-" && !isNaN(Number(val))) {
          totalRow[k] += Number(val);
        }
      });
    });

    keys.forEach((k) => {
      if (k === firstColKey) return;
      totalRow[k] = Math.round(totalRow[k]);
    });

    return [...rows, totalRow];
  };

  // ---------- LOAD AVAILABLE CITIES ----------
  const loadAvailableCities = async () => {
    try {
      const cityData = await fetchData("/api/referencee/available_cities");
      setAvailableCities(Array.isArray(cityData) ? cityData : []);
    } catch (err) {
      console.error("Error fetching cities:", err);
    }
  };

  // ---------- LOAD DATA ----------
  const loadGroupDesignationSummary = async () => {
    try {
      const query = new URLSearchParams();
      months.forEach((m) => query.append("months", m));
      cities.forEach((c) => query.append("cities", c));

      const data = await fetchData(`/api/referencee/referencee_table_summary?${query.toString()}`);
      if (!Array.isArray(data)) {
        setGroupDesignationSummary([]);
        return;
      }

      const formatted = data.map((row) => ({
        GroupDesignation: row.groupDesignation || "-",
        Reference: toNumberOrNull(row.referencee),
        Enquiry: toNumberOrNull(row.enquiry),
        Booking: toNumberOrNull(row.booking),
        Invoice: toNumberOrNull(row.invoice),
      }));

      formatted.sort(
        (a, b) =>
          groupDesignation_ORDER.indexOf(a.GroupDesignation) -
          groupDesignation_ORDER.indexOf(b.GroupDesignation)
      );

      setGroupDesignationSummary(addGrandTotalRow(formatted));
    } catch (err) {
      console.error("Group Designation Summary Fetch Error:", err);
      alert("❌ Error fetching Group Designation Summary");
      setGroupDesignationSummary([]);
    }
  };

  useEffect(() => {
    loadAvailableCities();
  }, []);

  useEffect(() => {
    loadGroupDesignationSummary();
  }, [months, cities]);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header & Buttons */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Reference Table
        </Typography>

        {/* Filters using SlicerFilters for both Month and City */}
        <SlicerFilters
          monthOptions={monthOptions}
          months={months}
          setMonths={setMonths}
          cityOptions={cityOptions}
          cities={cities}
          setCities={setCities}
        />

        {/* Navigation Buttons */}
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/referencee_table")}>Referencee Table</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/referencee")}>Graph-CityWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/referencee_branches")}>Graph-BranchWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/referencee-bar-chart")}>Bar Chart-CityWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/referencee_branches-bar-chart")}>Bar Chart-BranchWise</Button>
        </Box>
      </Box>

      {/* Table container */}
      <Box sx={{ flex: 1, overflowY: "auto", minHeight: "70vh" }}>
        <DataTable
          data={groupDesignationSummary}
          title="Group Designation Wise Summary"
        />
      </Box>
    </Box>
  );
}

export default ReferenceeTablePage;
