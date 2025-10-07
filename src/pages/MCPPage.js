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

function MCPPage() {
  const [mcpSummary, setMCPSummary] = useState([]);

  const [months, setMonths] = useState([]);
  const [groupBy, setGroupBy] = useState("city");
  const [qtr, setQtr] = useState([]);
  const [halfYear, setHalfYear] = useState([]);

  const monthOptions = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const qtrOptions = ["Qtr1", "Qtr2", "Qtr3", "Qtr4"];
  const halfYearOptions = ["H1", "H2"];
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - i);

  // 🔹 Helper: Aggregate rows by key columns
  const aggregateData = (data, keys) => {
    const map = {};
    data.forEach((row) => {
      const key = keys.map((k) => row[k]).join("_");
      if (!map[key]) {
        map[key] = { ...row };
      } else {
        ["mcp", "amount"].forEach((col) => {
          if (row[col] !== undefined && !isNaN(row[col])) {
            map[key][col] = (map[key][col] || 0) + Number(row[col]);
          }
        });
      }
    });
    return Object.values(map);
  };

  // 🔹 Format data and compute display columns
  const formatSummaryData = (data) => {
    const keys = groupBy === "city_branch" ? ["city", "branch"] : [groupBy];
    const aggregated = aggregateData(data, keys);

    return aggregated.map((row) => {
      const formattedRow = { ...row };
      if (row.mcp !== undefined && row.amount !== undefined) {
        formattedRow["MCP NO"] = Number(row.mcp).toLocaleString("en-IN");
        formattedRow["AMOUNT"] = Number(row.amount).toLocaleString("en-IN");
        delete formattedRow.mcp;
        delete formattedRow.amount;
      }
      return formattedRow;
    });
  };

  // 🔹 Maintain custom city order
  const sortByCityOrder = (data) => {
    const cityOrder = ["Bangalore", "Mysore", "Mangalore"];
    return data.sort((a, b) => {
      if (!a.city) return 1;
      if (!b.city) return -1;
      const indexA = cityOrder.indexOf(a.city);
      const indexB = cityOrder.indexOf(b.city);
      if (indexA === -1 && indexB === -1) return a.city.localeCompare(b.city);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  };

  // 🔹 Add a Grand Total row
  const addGrandTotalRow = (data) => {
    if (!data || data.length === 0) return data;

    const totalRow = {};
    const numericKeys = new Set();

    // detect numeric columns
    Object.keys(data[0]).forEach((key) => {
      const sample = data[0][key];
      if (typeof sample === "string" && sample.replace(/[,\d.%]/g, "").trim() === "")
        numericKeys.add(key);
    });

    // sum totals
    data.forEach((row) => {
      numericKeys.forEach((key) => {
        const num = Number(String(row[key]).replace(/[,%]/g, "").replace(/,/g, "")) || 0;
        totalRow[key] = (totalRow[key] || 0) + num;
      });
    });

    // format total row
    const formattedTotals = {};
    Object.entries(totalRow).forEach(([key, val]) => {
      formattedTotals[key] = val.toLocaleString("en-IN");
    });

    const totalLabelKey = Object.keys(data[0])[0];
    formattedTotals[totalLabelKey] = "Grand Total";

    return [...data, formattedTotals];
  };

  // 🔹 Fetch data from API
  const fetchSummaries = async () => {
    try {
      let allMCP = [];

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

            const mcpData = await fetchData(`/api/mcp/mcp_summary${query}`);
            if (Array.isArray(mcpData)) allMCP = allMCP.concat(mcpData);
          }
        }
      }

      let formattedMCP = sortByCityOrder(formatSummaryData(allMCP));
      formattedMCP = addGrandTotalRow(formattedMCP);
      setMCPSummary(formattedMCP);
    } catch (err) {
      console.error(err);
      alert("❌ Error fetching MCP Summaries: " + err.message);
    }
  };

  useEffect(() => {
    fetchSummaries();
  }, [months, groupBy, qtr, halfYear]);

  // 🔹 Hide unwanted columns
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
        MCP SUMMARY REPORT
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
      <Box sx={{ display: "flex", flexWrap: "wrap" }}>
        <Box sx={{ flex: 1, minWidth: 400, maxHeight: 600, overflowY: "auto" }}>
          <DataTable data={filterData(mcpSummary)} title="MCP Summary" />
        </Box>
      </Box>
    </Box>
  );
}

export default MCPPage;
