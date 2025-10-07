import React, { useState, useEffect } from "react";
import {
  Box, FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText, Typography
} from "@mui/material";
import DataTable from "../components/DataTable";
import { fetchData } from "../api/uploadService";

function BRConversionPage() {
  const [brArenaSummary, setBrArenaSummary] = useState([]);
  const [brNexaSummary, setBrNexaSummary] = useState([]);
  const [brCombinedSummary, setBrCombinedSummary] = useState([]);
  const [revenueArenaSummary, setRevenueArenaSummary] = useState([]);
  const [revenueNexaSummary, setRevenueNexaSummary] = useState([]);
  const [revenueCombinedSummary, setRevenueCombinedSummary] = useState([]);
  const [months, setMonths] = useState([]);
  const [groupBy, setGroupBy] = useState("city");
  const [qtr, setQtr] = useState([]);
  const [halfYear, setHalfYear] = useState([]);

  const monthOptions = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const qtrOptions = ["Qtr1","Qtr2","Qtr3","Qtr4"];
  const halfYearOptions = ["H1","H2"];
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - i);

  // ✅ Add Grand Total helper
  const addGrandTotalRow = (data) => {
    if (!data || data.length === 0) return data;

    const totalRow = {};
    const numericKeys = new Set();

    // Identify numeric columns
    Object.keys(data[0]).forEach((key) => {
      const sample = data[0][key];
      if (typeof sample === "string" && sample.replace(/[,\d.%]/g, "").trim() === "")
        numericKeys.add(key);
    });

    // Sum numeric columns
    data.forEach((row) => {
      if (row[Object.keys(data[0])[0]] === "Grand Total") return; // skip previous total rows
      numericKeys.forEach((key) => {
        const num = Number(String(row[key]).replace(/[,%]/g, "").replace(/,/g, "")) || 0;
        totalRow[key] = (totalRow[key] || 0) + num;
      });
    });

    // Format totals
    const formattedTotals = {};
    Object.entries(totalRow).forEach(([key, val]) => {
      if (key.toLowerCase().includes("percentage")) {
        formattedTotals[key] = val.toFixed(2) + "%";
      } else {
        formattedTotals[key] = val.toLocaleString("en-IN");
      }
    });

    // Add label
    const totalLabelKey = Object.keys(data[0])[0];
    formattedTotals[totalLabelKey] = "Grand Total";

    return [...data, formattedTotals];
  };

  // Aggregate rows by group
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

  // Fetch BR or Revenue summary
  const fetchBRSummary = async (endpoint, isRevenue = false) => {
    let combinedResults = [];
    const monthsList = months.length > 0 ? months : [""];
    const qtrList = qtr.length > 0 ? qtr : [""];
    const halfList = halfYear.length > 0 ? halfYear : [""];

    for (const m of monthsList) {
      for (const q of qtrList) {
        for (const h of halfList) {
          const query = `?groupBy=${groupBy}`
            + (m ? `&month=${m}` : "")
            + (q ? `&qtr_wise=${q}` : "")
            + (h ? `&half_year=${h}` : "");

          const data = await fetchData(`/api/br_conversion/${endpoint}${query}`);
          if (Array.isArray(data)) combinedResults = combinedResults.concat(data);
        }
      }
    }

    if (!isRevenue) {
      return aggregateData(combinedResults, groupBy).map(row => {
        const formattedRow = {};
        Object.keys(row).forEach(key => {
          if (key === groupBy || key === "city" || key === "branch" || key === "city_branch") {
            formattedRow[key] = row[key];
          }
        });
        if (row.fs_pms_load !== undefined) formattedRow["FS & PMS LOAD"] = Number(row.fs_pms_load).toLocaleString("en-IN");
        if (row.br_conversion !== undefined) formattedRow["BR CONVERSION"] = Number(row.br_conversion).toLocaleString("en-IN");
        if (row.percentageBR_conversion !== undefined) formattedRow["BR Conversion %"] = Number(row.percentageBR_conversion).toFixed(2) + "%";
        return formattedRow;
      });
    } else {
      return aggregateData(combinedResults, groupBy).map(row => {
        const formattedRow = {};
        Object.keys(row).forEach(key => {
          if (key === groupBy || key === "city" || key === "branch" || key === "city_branch") {
            formattedRow[key] = row[key];
          }
        });
        if (row.labourAmt !== undefined) formattedRow["Labour Amount"] = Number(row.labourAmt).toLocaleString("en-IN", { maximumFractionDigits: 0 });
        if (row.partAmt !== undefined) formattedRow["Parts Amount"] = Number(row.partAmt).toLocaleString("en-IN", { maximumFractionDigits: 0 });
        if (row.totalAmt !== undefined) formattedRow["Total Amount"] = Number(row.totalAmt).toLocaleString("en-IN", { maximumFractionDigits: 0 });
        return formattedRow;
      });
    }
  };

  // Compute combined BR Conversion summary
  const computeCombinedSummary = (arenaData, nexaData) => {
    // remove any Grand Total rows before combining
    const filteredArena = arenaData.filter(r => r[Object.keys(arenaData[0])[0]] !== "Grand Total");
    const filteredNexa = nexaData.filter(r => r[Object.keys(nexaData[0])[0]] !== "Grand Total");

    const combined = [...filteredArena, ...filteredNexa];
    const aggregated = {};

    combined.forEach(row => {
      const key = groupBy === "city_branch"
        ? row.city + " - " + row.branch
        : row[groupBy];

      if (!aggregated[key]) aggregated[key] = { fs_pms_load: 0, br_conversion: 0, city: row.city, branch: row.branch };

      aggregated[key].fs_pms_load += Number(row["FS & PMS LOAD"]?.replace(/,/g, "")) || 0;
      aggregated[key].br_conversion += Number(row["BR CONVERSION"]?.replace(/,/g, "")) || 0;
    });

    return Object.entries(aggregated).map(([key, value]) => ({
      [groupBy]: key,
      city: value.city,
      branch: value.branch,
      "FS & PMS LOAD": value.fs_pms_load.toLocaleString("en-IN"),
      "BR CONVERSION": value.br_conversion.toLocaleString("en-IN"),
      "BR Conversion %": value.fs_pms_load === 0 ? "0.00%" : ((value.br_conversion / value.fs_pms_load) * 100).toFixed(2) + "%"
    }));
  };

  // Compute combined Revenue summary
  const computeCombinedRevenueSummary = (arenaData, nexaData) => {
    // remove any Grand Total rows before combining
    const filteredArena = arenaData.filter(r => r[Object.keys(arenaData[0])[0]] !== "Grand Total");
    const filteredNexa = nexaData.filter(r => r[Object.keys(nexaData[0])[0]] !== "Grand Total");

    const combined = [...filteredArena, ...filteredNexa];
    const aggregated = {};

    combined.forEach(row => {
      const key = groupBy === "city_branch"
        ? row.city + " - " + row.branch
        : row[groupBy];

      if (!aggregated[key]) aggregated[key] = { labourAmt: 0, partAmt: 0, totalAmt: 0, city: row.city, branch: row.branch };

      aggregated[key].labourAmt += Number(row["Labour Amount"]?.replace(/,/g, "")) || 0;
      aggregated[key].partAmt += Number(row["Parts Amount"]?.replace(/,/g, "")) || 0;
      aggregated[key].totalAmt += Number(row["Total Amount"]?.replace(/,/g, "")) || 0;
    });

    return Object.entries(aggregated).map(([key, value]) => ({
      [groupBy]: key,
      city: value.city,
      branch: value.branch,
      "Labour Amount": value.labourAmt.toLocaleString("en-IN", { maximumFractionDigits: 0 }),
      "Parts Amount": value.partAmt.toLocaleString("en-IN", { maximumFractionDigits: 0 }),
      "Total Amount": value.totalAmt.toLocaleString("en-IN", { maximumFractionDigits: 0 }),
    }));
  };

  const fetchAllData = async () => {
    try {
      const arenaData = await fetchBRSummary("br_conversion_arena");
      const nexaData = await fetchBRSummary("br_conversion_nexa");

      const brArena = addGrandTotalRow(arenaData);
      const brNexa = addGrandTotalRow(nexaData);
      const brCombined = addGrandTotalRow(computeCombinedSummary(arenaData, nexaData));

      const revenueArenaData = await fetchBRSummary("br_conversion_revenue_arena", true);
      const revenueNexaData = await fetchBRSummary("br_conversion_revenue_nexa", true);

      const revenueArena = addGrandTotalRow(revenueArenaData);
      const revenueNexa = addGrandTotalRow(revenueNexaData);
      const revenueCombined = addGrandTotalRow(computeCombinedRevenueSummary(revenueArenaData, revenueNexaData));

      setBrArenaSummary(brArena);
      setBrNexaSummary(brNexa);
      setBrCombinedSummary(brCombined);
      setRevenueArenaSummary(revenueArena);
      setRevenueNexaSummary(revenueNexa);
      setRevenueCombinedSummary(revenueCombined);
    } catch (err) {
      console.error(err);
      alert("❌ Error fetching BR Conversion Summary: " + err.message);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [months, groupBy, qtr, halfYear]);

  // Hide unwanted columns
  const hiddenColumns = ["qtr_wise", "half_year", "channel"];
  if (groupBy === "city") hiddenColumns.push("branch");
  if (groupBy === "branch") hiddenColumns.push("city");
  const filterData = (data, extraHidden = []) =>
    data.map(row => {
      const filteredRow = { ...row };
      hiddenColumns.forEach(col => delete filteredRow[col]);
      extraHidden.forEach(col => delete filteredRow[col]);
      return filteredRow;
    });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>BR CONVERSION & REVENUE REPORT</Typography>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
        {/* Months */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Months</InputLabel>
          <Select multiple value={months} onChange={(e) => setMonths(e.target.value)} renderValue={(selected) => selected.join(", ")}>
            {monthOptions.map(m => (
              <MenuItem key={m} value={m}>
                <Checkbox checked={months.indexOf(m) > -1} />
                <ListItemText primary={m} />
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
          <Select multiple value={qtr} onChange={(e) => setQtr(e.target.value)} renderValue={(selected) => selected.join(", ")}>
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
          <Select multiple value={halfYear} onChange={(e) => setHalfYear(e.target.value)} renderValue={(selected) => selected.join(", ")}>
            {halfYearOptions.map(h => (
              <MenuItem key={h} value={h}>
                <Checkbox checked={halfYear.indexOf(h) > -1} />
                <ListItemText primary={h} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ display: "flex", gap: 0.1, flexWrap: "wrap" }}>
        {/* BR Conversion Tables */}
        <Box sx={{ flex: 1, minWidth: 300, maxHeight: 600, overflowY: "auto" }}>
          <DataTable data={filterData(brArenaSummary)} title="BR Arena Summary" />
        </Box>
        <Box sx={{ flex: 1, minWidth: 300, maxHeight: 600, overflowY: "auto" }}>
          <DataTable data={filterData(brNexaSummary)} title="BR Nexa Summary" />
        </Box>
        <Box sx={{ flex: 1, minWidth: 300, maxHeight: 600, overflowY: "auto" }}>
          <DataTable data={filterData(brCombinedSummary)} title="BR Arena & Nexa Summary" />
        </Box>

        {/* Revenue Tables */}
        <Box sx={{ flex: 1, minWidth: 300, maxHeight: 600, overflowY: "auto" }}>
          <DataTable data={filterData(revenueArenaSummary)} title="Revenue Arena Summary" />
        </Box>
        <Box sx={{ flex: 1, minWidth: 300, maxHeight: 600, overflowY: "auto" }}>
          <DataTable data={filterData(revenueNexaSummary)} title="Revenue Nexa Summary" />
        </Box>
        <Box sx={{ flex: 1, minWidth: 300, maxHeight: 600, overflowY: "auto" }}>
          <DataTable data={filterData(revenueCombinedSummary)} title="Revenue Arena & Nexa Summary" />
        </Box>
      </Box>
    </Box>
  );
}

export default BRConversionPage;
