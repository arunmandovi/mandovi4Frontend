import React, { useState, useEffect } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Typography,
} from "@mui/material";
import DataTable from "../components/DataTable";
import { fetchData } from "../api/uploadService";

function OilPage() {
  const [qtySummary, setQtySummary] = useState([]);
  const [percentageQtySummary, setPercentageQtySummary] = useState([]);
  const [profitSummary, setProfitSummary] = useState([]);

  const [months, setMonths] = useState([]);
  const [groupBy, setGroupBy] = useState("city");
  const [qtr, setQtr] = useState([]);
  const [halfYear, setHalfYear] = useState([]);

  const monthOptions = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const qtrOptions = ["Qtr1", "Qtr2", "Qtr3", "Qtr4"];
  const halfYearOptions = ["H1", "H2"];

  // --- Column rename mapping ---
  const columnMap = {
    city: "CITY",
    branch: "BRANCH",
    fullSynthetic: "FULL SYNTHETIC",
    semiSynthetic: "SEMI SYNTHETIC",
    fullSemiSynthetic: "FULL & SEMI SYNTHETIC",
    mineral: "MINERAL",
    grandTotal: "GRAND TOTAL",
  };

  // --- Add Grand Total row ---
  const addGrandTotalRow = (data) => {
    if (!data || data.length === 0) return data;

    const labelKey = Object.keys(data[0])[0];
    const numericKeys = Object.keys(data[0]).filter(
      (k) => k !== labelKey && !isNaN(parseFloat(data[0][k]?.toString().replace(/,/g, "")))
    );

    const totalRow = {};
    numericKeys.forEach((key) => {
      totalRow[key] = data.reduce((sum, row) => {
        const val = parseFloat(row[key]?.toString().replace(/,/g, "")) || 0;
        return sum + val;
      }, 0);
    });

    const grandTotalRow = { [labelKey]: "Grand Total" };
    numericKeys.forEach((key) => {
      grandTotalRow[key] = totalRow[key].toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    });

    return [...data, grandTotalRow];
  };

  // --- Format numbers ---
  const formatSummaryData = (data) => {
    return data.map((row) => {
      const formatted = { ...row };
      Object.keys(row).forEach((key) => {
        const val = row[key];
        if (typeof val === "number") {
          formatted[key] = val.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
        }
      });
      return formatted;
    });
  };

  // --- Rename columns for display ---
  const renameColumns = (data) => {
    return data.map((row) => {
      const newRow = {};
      for (const key in row) {
        const newKey = columnMap[key] || key;
        newRow[newKey] = row[key];
      }
      return newRow;
    });
  };

  // --- City sorting order ---
  const sortByCityOrder = (data) => {
    const cityOrder = ["Bangalore", "Mysore", "Mangalore"];
    return data.sort((a, b) => {
      if (!a.city && !a.CITY) return 1;
      if (!b.city && !b.CITY) return -1;
      const cityA = a.city || a.CITY;
      const cityB = b.city || b.CITY;
      const idxA = cityOrder.indexOf(cityA);
      const idxB = cityOrder.indexOf(cityB);
      if (idxA === -1 && idxB === -1) return cityA.localeCompare(cityB);
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });
  };

  // --- Fetch all summaries ---
  const fetchSummaries = async () => {
    try {
      let combinedQty = [];
      let combinedPercentage = [];
      let combinedProfit = [];

      const monthsList = months.length > 0 ? months : [""];
      const qtrList = qtr.length > 0 ? qtr : [""];
      const halfList = halfYear.length > 0 ? halfYear : [""];

      for (const m of monthsList) {
        for (const q of qtrList) {
          for (const h of halfList) {
            const query =
              `?groupBy=${groupBy}` +
              (m ? `&month=${m}` : "") +
              (q ? `&qtrWise=${q}` : "") +
              (h ? `&halfYear=${h}` : "");

            const qtyData = await fetchData(`/api/oil/oil_qty${query}`);
            if (Array.isArray(qtyData)) combinedQty = combinedQty.concat(qtyData);

            const percentageData = await fetchData(`/api/oil/oil_percentage_qty${query}`);
            if (Array.isArray(percentageData)) combinedPercentage = combinedPercentage.concat(percentageData);

            const profitData = await fetchData(`/api/oil/oil_profit${query}`);
            if (Array.isArray(profitData)) combinedProfit = combinedProfit.concat(profitData);
          }
        }
      }

      const formattedQty = sortByCityOrder(formatSummaryData(combinedQty));
      const formattedPercentage = sortByCityOrder(formatSummaryData(combinedPercentage));
      const formattedProfit = sortByCityOrder(formatSummaryData(combinedProfit));

      // Add grand total row, rename columns, then set state
      setQtySummary(filterData(renameColumns(addGrandTotalRow(formattedQty))));
      setPercentageQtySummary(filterData(renameColumns(addGrandTotalRow(formattedPercentage))));
      setProfitSummary(filterData(renameColumns(addGrandTotalRow(formattedProfit))));
    } catch (err) {
      console.error("❌ Error fetching Oil summaries:", err);
      alert("Error fetching Oil summaries: " + err.message);
    }
  };

  useEffect(() => {
    fetchSummaries();
  }, [months, groupBy, qtr, halfYear]);

  // --- Dynamically hide unused columns based on groupBy ---
  const getHiddenColumns = () => {
    const hidden = ["qtrWise", "halfYear", "channel"];
    if (groupBy === "city") hidden.push("BRANCH"); // renamed key
    if (groupBy === "branch") hidden.push("CITY"); // renamed key
    return hidden;
  };

  const filterData = (data) => {
    const hiddenColumns = getHiddenColumns();
    return data.map((row) => {
      const filtered = { ...row };
      hiddenColumns.forEach((c) => delete filtered[c]);
      return filtered;
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        OIL SUMMARY REPORT
      </Typography>

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Months</InputLabel>
          <Select
            multiple
            value={months}
            onChange={(e) => setMonths(e.target.value)}
            renderValue={(selected) => selected.join(", ")}
          >
            {monthOptions.map((m) => (
              <MenuItem key={m} value={m}>
                <Checkbox checked={months.indexOf(m) > -1} />
                <ListItemText primary={m} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Group By</InputLabel>
          <Select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
            <MenuItem value="city">City</MenuItem>
            <MenuItem value="branch">Branch</MenuItem>
            <MenuItem value="city_branch">City & Branch</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Quarter</InputLabel>
          <Select
            multiple
            value={qtr}
            onChange={(e) => setQtr(e.target.value)}
            renderValue={(selected) => selected.join(", ")}
          >
            {qtrOptions.map((q) => (
              <MenuItem key={q} value={q}>
                <Checkbox checked={qtr.indexOf(q) > -1} />
                <ListItemText primary={q} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Half Year</InputLabel>
          <Select
            multiple
            value={halfYear}
            onChange={(e) => setHalfYear(e.target.value)}
            renderValue={(selected) => selected.join(", ")}
          >
            {halfYearOptions.map((h) => (
              <MenuItem key={h} value={h}>
                <Checkbox checked={halfYear.indexOf(h) > -1} />
                <ListItemText primary={h} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Tables */}
      <Box sx={{ display: "flex", gap: 0.1, flexWrap: "wrap" }}>
        <Box sx={{ flex: 1, minWidth: 350, maxHeight: 600, overflowY: "auto" }}>
          <DataTable data={qtySummary} title="Qty Summary" />
        </Box>

        <Box sx={{ flex: 1, minWidth: 350, maxHeight: 600, overflowY: "auto" }}>
          <DataTable data={percentageQtySummary} title="Qty % Summary" />
        </Box>

        <Box sx={{ flex: 1, minWidth: 350, maxHeight: 600, overflowY: "auto" }}>
          <DataTable data={profitSummary} title="Profit Summary" />
        </Box>
      </Box>
    </Box>
  );
}

export default OilPage;
