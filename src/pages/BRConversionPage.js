import React, { useState, useEffect } from "react";
import {
  Box, FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText, Typography
} from "@mui/material";
import DataTable from "../components/DataTable";
import { fetchData } from "../api/uploadService";

function BRConversionPage() {
  const [brSummary, setBrSummary] = useState([]);
  const [months, setMonths] = useState([]);
  const [years, setYears] = useState([]);
  const [groupBy, setGroupBy] = useState("city");
  const [qtr, setQtr] = useState([]);
  const [halfYear, setHalfYear] = useState([]);

  const monthOptions = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const qtrOptions = ["Qtr1","Qtr2","Qtr3","Qtr4"];
  const halfYearOptions = ["H1","H2"];
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - i);

  // ✅ Column rename map for BR Conversion
  const columnRenameBRMap = {
    totalQty: "QTY",
    totalDDL: "Net Retail DDL",
    totalSelling: "Net Retail Selling",
    percentageProfit: "PROFIT%",
    city: "City",
    branch: "Branch",
    channel: "Channel",
    qtr_wise: "Quarter",
    half_year: "Half Year",
  };

  // ✅ Aggregate rows by group
  const aggregateData = (data, groupByKey) => {
    const aggregated = {};
    data.forEach(row => {
      const key = groupByKey === "city_branch"
        ? row.city + " - " + row.branch
        : row[groupByKey];

      if (!aggregated[key]) aggregated[key] = { ...row };
      else {
        Object.keys(row).forEach(col => {
          if (typeof row[col] === "number") aggregated[key][col] += row[col];
        });
      }
    });
    return Object.values(aggregated);
  };

  // ✅ Fetch BR Conversion summary
  const fetchBRSummary = async () => {
    try {
      let combinedResults = [];
      const monthsList = months.length > 0 ? months : [""];
      const yearsList = years.length > 0 ? years : [""];
      const qtrList = qtr.length > 0 ? qtr : [""];
      const halfList = halfYear.length > 0 ? halfYear : [""];

      for (const m of monthsList) {
        for (const y of yearsList) {
          for (const q of qtrList) {
            for (const h of halfList) {
              const query = `?groupBy=${groupBy}`
                + (m ? `&month=${m}` : "")
                + (y ? `&year=${y}` : "")
                + (q ? `&qtr_wise=${q}` : "")
                + (h ? `&half_year=${h}` : "");

              const data = await fetchData(`/api/br_conversion/br_conversion_arena${query}`);
              if (Array.isArray(data)) combinedResults = combinedResults.concat(data);
            }
          }
        }
      }

      // Aggregate by group
      let aggregated = aggregateData(combinedResults, groupBy);

      // Format numeric values for Indian number format
      aggregated = aggregated.map(row => {
        const formattedRow = { ...row };

        // totalQty as integer
        if (formattedRow.totalQty !== undefined && !isNaN(formattedRow.totalQty)) {
          formattedRow.totalQty = parseInt(formattedRow.totalQty, 10);
        }

        // totalDDL & totalSelling in Indian number format
        ["totalDDL", "totalSelling"].forEach(col => {
          if (formattedRow[col] !== undefined && !isNaN(Number(formattedRow[col]))) {
            formattedRow[col] = Number(formattedRow[col]).toLocaleString("en-IN", {
              maximumFractionDigits: 0,
            });
          }
        });

        // percentageProfit with 2 decimals + %
        if (formattedRow.percentageProfit !== undefined && !isNaN(Number(formattedRow.percentageProfit))) {
          formattedRow.percentageProfit = Number(formattedRow.percentageProfit).toFixed(2) + "%";
        }

        return formattedRow;
      });

      setBrSummary(aggregated);
    } catch (err) {
      console.error(err);
      alert("❌ Error fetching BR Conversion Summary: " + err.message);
    }
  };

  useEffect(() => {
    fetchBRSummary();
  }, [months, years, groupBy, qtr, halfYear]);

  // Hide unwanted columns based on groupBy
  const hiddenColumns = ["qtr_wise", "half_year", "channel"];
  if (groupBy === "city") hiddenColumns.push("branch");
  if (groupBy === "branch") hiddenColumns.push("city");

  const filteredData = brSummary.map(row => {
    const filteredRow = { ...row };
    hiddenColumns.forEach(col => delete filteredRow[col]);
    return filteredRow;
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>BR CONVERSION REPORT</Typography>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
        {/* Months */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Months</InputLabel>
          <Select
            multiple value={months}
            onChange={(e) => setMonths(e.target.value)}
            renderValue={(selected) => selected.join(", ")}
          >
            {monthOptions.map(m => (
              <MenuItem key={m} value={m}>
                <Checkbox checked={months.indexOf(m) > -1} />
                <ListItemText primary={m} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Years */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Years</InputLabel>
          <Select
            multiple value={years}
            onChange={(e) => setYears(e.target.value)}
            renderValue={(selected) => selected.join(", ")}
          >
            {yearOptions.map(y => (
              <MenuItem key={y} value={y}>
                <Checkbox checked={years.indexOf(y) > -1} />
                <ListItemText primary={y} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Group By */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Group By</InputLabel>
          <Select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
            <MenuItem value="city">City</MenuItem>
            <MenuItem value="branch">Branch</MenuItem>
            <MenuItem value="city_branch">City & Branch</MenuItem>
          </Select>
        </FormControl>

        {/* Quarter */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Quarter</InputLabel>
          <Select
            multiple value={qtr}
            onChange={(e) => setQtr(e.target.value)}
            renderValue={(selected) => selected.join(", ")}
          >
            {qtrOptions.map(q => (
              <MenuItem key={q} value={q}>
                <Checkbox checked={qtr.indexOf(q) > -1} />
                <ListItemText primary={q} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Half Year */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Half Year</InputLabel>
          <Select
            multiple value={halfYear}
            onChange={(e) => setHalfYear(e.target.value)}
            renderValue={(selected) => selected.join(", ")}
          >
            {halfYearOptions.map(h => (
              <MenuItem key={h} value={h}>
                <Checkbox checked={halfYear.indexOf(h) > -1} />
                <ListItemText primary={h} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ flex: 1, minWidth: 300, maxHeight: 600, overflowY: "auto" }}>
        <DataTable data={filteredData} title="BR Arena Summary" columnRenameMap={columnRenameBRMap} />
      </Box>
    </Box>
  );
}

export default BRConversionPage;
