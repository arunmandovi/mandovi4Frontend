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

function MGAPage() {
  const [mgaSummary, setMGASummary] = useState([]);
  const [months, setMonths] = useState([]);
  const [groupBy, setGroupBy] = useState("city");
  const [qtr, setQtr] = useState([]);
  const [halfYear, setHalfYear] = useState([]);

  const monthOptions = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const qtrOptions = ["Qtr1", "Qtr2", "Qtr3", "Qtr4"];
  const halfYearOptions = ["H1", "H2"];
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - i);

  // 🔹 Aggregate Data
  const aggregateData = (data, keys) => {
    const map = {};
    data.forEach((row) => {
      const key = keys.map((k) => row[k]).join("_");
      if (!map[key]) {
        map[key] = { ...row };
      } else {
        [
          "MGA VALUE",
          "MGA/VEH",
          "MGA Shortfall/Veh",
          "MGA Shortfall Value",
        ].forEach((col) => {
          if (row[col] !== undefined && !isNaN(row[col])) {
            map[key][col] = (map[key][col] || 0) + Number(row[col]);
          }
        });
      }
    });
    return Object.values(map);
  };

  // 🔹 Format & Rename Headers
  const formatSummaryData = (data) => {
    const keys = groupBy === "city_branch" ? ["city", "branch"] : [groupBy];
    const aggregated = aggregateData(data, keys);

    return aggregated.map((row) => {
      const formattedRow = { ...row };
      formattedRow["MGA LOAD"] = Number(row.mgaLoadd || 0).toLocaleString("en-IN");
      formattedRow["MGA VALUE"] = Number(row.mgaValue || 0).toLocaleString("en-IN");
      formattedRow["MGA/VEH"] = Number(row.mgaVeh || 0).toLocaleString("en-IN");
      formattedRow["MGA Shortfall/Veh"] = Number(row.mgaShortfallVeh || 0).toLocaleString("en-IN");
      formattedRow["MGA Shortfall Value"] = Number(row.mgaShortfallValue || 0).toLocaleString("en-IN");

      delete formattedRow.mgaLoadd;
      delete formattedRow.mgaValue;
      delete formattedRow.mgaVeh;
      delete formattedRow.mgaShortfallVeh;
      delete formattedRow.mgaShortfallValue;

      return formattedRow;
    });
  };

  // 🔹 City priority helper (case-insensitive, trims)
  const CITY_PRIORITY = {
    "bangalore": 0,
    "mysore": 1,
    "mangalore": 2
  };
  const getCityPriority = (city) => {
    if (!city && city !== "") return 99;
    const c = (city || "").toString().trim().toLowerCase();
    return CITY_PRIORITY.hasOwnProperty(c) ? CITY_PRIORITY[c] : 99;
  };

  // 🔹 Final stable sort used AFTER synchronization
  const finalSortByCityPriority = (data) => {
    return data.sort((a, b) => {
      // If grouped by city & branch, first compare city priority, then branch
      if (groupBy === "city_branch") {
        const pa = getCityPriority(a.city);
        const pb = getCityPriority(b.city);
        if (pa !== pb) return pa - pb;
        // if same priority or both 99, sort by city name then branch name
        const cityCompare = (a.city || "").localeCompare(b.city || "");
        if (cityCompare !== 0) return cityCompare;
        return (a.branch || "").localeCompare(b.branch || "");
      }

      // Otherwise (groupBy city or branch), prioritize cities and then alphabetical
      const pa = getCityPriority(a.city);
      const pb = getCityPriority(b.city);
      if (pa !== pb) return pa - pb;

      // if both have same priority (including 99), sort alphabetically by city (fallback)
      return (a.city || "").localeCompare(b.city || "");
    });
  };

  // 🔹 Synchronize Missing Rows
  const synchronizeRows = (tablesData, keyColumns) => {
    const allKeys = new Set();
    tablesData.forEach((table) => {
      table.forEach((row) => {
        const key = keyColumns.map((k) => row[k]).join("_");
        allKeys.add(key);
      });
    });

    const keysArray = Array.from(allKeys);
    return tablesData.map((table) => {
      const map = {};
      table.forEach((row) => {
        const key = keyColumns.map((k) => row[k]).join("_");
        map[key] = row;
      });

      return keysArray.map((key) => {
        if (map[key]) return map[key];
        const emptyRow = {};
        keyColumns.forEach((col, i) => {
          emptyRow[col] = key.split("_")[i];
        });
        emptyRow["2024-25"] = 0;
        emptyRow["2025-26"] = 0;
        emptyRow["Growth %"] = "0%";
        return emptyRow;
      });
    });
  };

  // 🔹 Fetch MGA Summary
  const fetchSummaries = async () => {
    try {
      let mgaSummary = [];
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

            const mgaSummaryData = await fetchData(`/api/mga/mga_summary${query}`);
            if (Array.isArray(mgaSummaryData)) mgaSummary = mgaSummary.concat(mgaSummaryData);
          }
        }
      }

      // Format, synchronize, then do the final priority sort
      let formattedMGASummary = formatSummaryData(mgaSummary);

      const keyColumns = groupBy === "city_branch" ? ["city", "branch"] : [groupBy];
      [formattedMGASummary] = synchronizeRows([formattedMGASummary], keyColumns);

      // Final sort after synchronization (this guarantees order)
      formattedMGASummary = finalSortByCityPriority(formattedMGASummary);

      setMGASummary(formattedMGASummary);
    } catch (err) {
      console.error(err);
      alert("❌ Error fetching MGA Summaries: " + err.message);
    }
  };

  useEffect(() => {
    fetchSummaries();
  }, [months, groupBy, qtr, halfYear]);

  // 🔹 Hide irrelevant columns
  const hiddenColumns = ["qtrWise", "halfYear", "channel"];
  if (groupBy === "city") hiddenColumns.push("branch");
  if (groupBy === "branch") hiddenColumns.push("city");

  const filterData = (data) =>
    data.map((row) => {
      const filteredRow = { ...row };
      hiddenColumns.forEach((col) => delete filteredRow[col]);
      return filteredRow;
    });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        MGA SUMMARY REPORT
      </Typography>

      {/* 🔹 Filters */}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
        {/* Month */}
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

        {/* Half Year */}
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

      {/* 🔹 Data Table */}
      <Box sx={{ display: "flex", gap: 0.1, flexWrap: "wrap" }}>
        <Box sx={{ flex: 1, minWidth: 300, maxHeight: 600, overflowY: "auto" }}>
          <DataTable data={filterData(mgaSummary)} title="MGA Summary" />
        </Box>
      </Box>
    </Box>
  );
}

export default MGAPage;
