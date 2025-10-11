import React, { useState, useEffect } from "react";
import {
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Checkbox,
  ListItemText,
} from "@mui/material";
import DataTable from "../components/DataTable";
import { fetchData } from "../api/uploadService";

function RevenuePage() {
  const [revenueSummary, setRevenueSummary] = useState([]);
  const [months, setMonths] = useState([]);
  const [quarters, setQuarters] = useState([]);
  const [halfYears, setHalfYears] = useState([]);
  const [groupBy, setGroupBy] = useState("city");

  const monthOptions = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const quarterOptions = ["Q1", "Q2", "Q3", "Q4"];
  const halfYearOptions = ["H1", "H2"];

  const columnRenameMap = {
    city: "City",
    branch: "Branch",
    previousSRBRLabour: "SR+BR Labour 2024-25",
    currentSRBRLabour: "SR+BR Labour 2025-26",
    growthSRBRLabour: "SR+BR LABOUR Growth %",
    previousSRSpares: "SR Spares 2024-25",
    currentSRSpares: "SR Spares 2025-26",
    growthSRSpares: "SR Spares Growth %",
    previousBRSpares: "BR Spares 2024-25",
    currentBRSpares: "BR Spares 2025-26",
    growthBRSpares: "BR Spares Growth %",
    previousSRBRSpares: "SR+BR Spares 2024-25",
    currentSRBRSpares: "SR+BR Spares 2025-26",
    growthSRBRSpares: "SR+BR Spares Growth %",
    previousSRBRTotal: "SR+BR Total 2024-25",
    currentSRBRTotal: "SR+BR Total 2025-26",
    growthSRBRTotal: "SR+Br Total Growth %",
  };

  const formatNumericValues = (data) => {
    return data.map((row) => {
      const formatted = {};
      for (const key in row) {
        const val = row[key];
        if (key.toLowerCase().includes("growth")) {
          const num =
            typeof val === "number"
              ? val
              : parseFloat(String(val).replace("%", ""));
          formatted[key] = !isNaN(num) ? num.toFixed(2) + "%" : val;
        } else if (typeof val === "number") {
          formatted[key] = val.toLocaleString("en-IN", { maximumFractionDigits: 2 });
        } else if (typeof val === "string" && !isNaN(parseFloat(val)) && val.trim() !== "") {
          formatted[key] = parseFloat(val).toLocaleString("en-IN", { maximumFractionDigits: 2 });
        } else {
          formatted[key] = val;
        }
      }
      return formatted;
    });
  };

  const combineDataSets = (dataSets, keyField) => {
    const combined = {};
    dataSets.forEach((data) => {
      data.forEach((row) => {
        const key = row[keyField];
        if (!combined[key]) combined[key] = { ...row };
        else {
          Object.keys(row).forEach((col) => {
            const val1 = Number(String(combined[key][col]).replace(/[,()%]/g, "")) || 0;
            const val2 = Number(String(row[col]).replace(/[,()%]/g, "")) || 0;
            if (!isNaN(val1) && !isNaN(val2)) {
              combined[key][col] = val1 + val2;
            }
          });
        }
      });
    });
    return Object.values(combined);
  };

    // ✅ Updated Grand Total Row Calculation
const addGrandTotalRow = (data) => {
  if (!data || data.length === 0) return data;

  const totalRow = {};
  const numericKeys = new Set();

  // Identify numeric keys
  Object.keys(data[0]).forEach((key) => {
    const val = data[0][key];
    if (typeof val === "number" || (!isNaN(parseFloat(val)) && val !== "")) {
      numericKeys.add(key);
    }
  });

  // Sum all numeric values across rows
  data.forEach((row) => {
    if (row[Object.keys(data[0])[0]] === "Grand Total") return;

    numericKeys.forEach((key) => {
      const raw = row[key];
      let num = 0;
      if (typeof raw === "number") num = raw;
      else if (typeof raw === "string") {
        const parsed = parseFloat(raw.replace("%", "").replace(/,/g, ""));
        if (!isNaN(parsed)) num = parsed;
      }
      totalRow[key] = (totalRow[key] || 0) + num;
    });
  });

  const formattedTotals = {};
  const allKeys = Object.keys(data[0]);
  const firstKey = allKeys[0];

  allKeys.forEach((key) => {
    const val = totalRow[key];

    if (key.toLowerCase().includes("growth")) {
      let sum = 0;

      // ✅ Custom logic for specific percentage columns
      if (key.includes("growthSRBRLabour")) {
        const previousSRBRLabour = totalRow["previousSRBRLabour"] || 0;
        const currentSRBRLabour = totalRow["currentSRBRLabour"] || 0;
        sum = (currentSRBRLabour - previousSRBRLabour) * 100 / previousSRBRLabour;
      } else if (key.includes("growthSRSpares")) {
        const previousSRSpares = totalRow["previousSRSpares"] || 0;
        const currentSrSpares = totalRow["currentSRSpares"] || 0;
        sum = (currentSrSpares - previousSRSpares) * 100 / previousSRSpares;
      } else if (key.includes("growthBRSpares")) {
        const previousBRSpares = totalRow["previousBRSpares"] || 0;
        const currentBRSpares = totalRow["currentBRSpares"] || 0;
        sum = (currentBRSpares - previousBRSpares) * 100 / previousBRSpares;
      } else if (key.includes("growthSRBRSpares")) {
        const previousSRBRSpares = totalRow["previousSRBRSpares"] || 0;
        const currentSRBRSpares = totalRow["currentSRBRSpares"] || 0;
        sum = (currentSRBRSpares - previousSRBRSpares) * 100 / previousSRBRSpares;
      } else if (key.includes("growthSRBRTotal")) {
        const previousSRBRTotal = totalRow["previousSRBRTotal"] || 0;
        const currentSRBRTotal = totalRow["currentSRBRTotal"] || 0;
        sum = (currentSRBRTotal - previousSRBRTotal) * 100 / previousSRBRTotal;
      } else {
        sum = val;
      }

      formattedTotals[key] =
        sum.toLocaleString("en-IN", { maximumFractionDigits: 2 }) + "%";
    } else {
      if (typeof val === "number" && !isNaN(val)) {
        formattedTotals[key] = val.toLocaleString("en-IN", {
          maximumFractionDigits: 2,
        });
      } else {
        formattedTotals[key] = val || "";
      }
    }
  });

  formattedTotals[firstKey] = "Grand Total";
  return [...data, formattedTotals];
};

  const sortByCityPriority = (data) => {
    const priorityCities = ["Bangalore", "Mysore", "Mangalore"];
    return data.sort((a, b) => {
      const cityA = a.city || "";
      const cityB = b.city || "";
      const indexA = priorityCities.indexOf(cityA);
      const indexB = priorityCities.indexOf(cityB);

      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return 0;
    });
  };

  useEffect(() => {
    const fetchRevenueSummary = async () => {
      try {
        let responses = [];
        const activeMonths = months.length > 0 ? months : [];
        const activeQuarters = quarters.length > 0 ? quarters : [];
        const activeHalfYears = halfYears.length > 0 ? halfYears : [];

        if (
          activeMonths.length === 0 &&
          activeQuarters.length === 0 &&
          activeHalfYears.length === 0
        ) {
          const query = `?groupBy=${groupBy}`;
          const data = await fetchData(`/api/revenue/revenue_summary${query}`);
          responses.push(data);
        }

        for (const m of activeMonths) {
          const query = `?groupBy=${groupBy}&month=${m}`;
          const data = await fetchData(`/api/revenue/revenue_summary${query}`);
          responses.push(data);
        }

        for (const q of activeQuarters) {
          const query = `?groupBy=${groupBy}&qtrWise=${q}`;
          const data = await fetchData(`/api/revenue/revenue_summary${query}`);
          responses.push(data);
        }

        for (const h of activeHalfYears) {
          const query = `?groupBy=${groupBy}&halfYear=${h}`;
          const data = await fetchData(`/api/revenue/revenue_summary${query}`);
          responses.push(data);
        }

        const validData = responses.filter((r) => Array.isArray(r));
        let combinedData =
          validData.length > 1
            ? combineDataSets(validData, groupBy)
            : validData[0] || [];

        combinedData = sortByCityPriority(combinedData);

        const formatted = formatNumericValues(combinedData);
        const withTotal = addGrandTotalRow(formatted);
        setRevenueSummary(withTotal);
      } catch (error) {
        console.error(error);
        alert("❌ Error fetching Summary: " + error.message);
      }
    };

    fetchRevenueSummary();
  }, [months, quarters, halfYears, groupBy]);

  const renamedData = revenueSummary.map((row) => {
    const newRow = {};
    Object.keys(row).forEach((key) => {
      const newKey = columnRenameMap[key] || key;
      newRow[newKey] = row[key];
    });
    return newRow;
  });

  const hiddenColumns = [];
  if (groupBy === "city") hiddenColumns.push("Branch");
  if (groupBy === "branch") hiddenColumns.push("City");

  return (
    <Box className="battery-container" sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        REVENUE REPORT
      </Typography>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Month</InputLabel>
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
          <InputLabel>Quarter</InputLabel>
          <Select
            multiple
            value={quarters}
            onChange={(e) => setQuarters(e.target.value)}
            renderValue={(selected) => selected.join(", ")}
          >
            {quarterOptions.map((q) => (
              <MenuItem key={q} value={q}>
                <Checkbox checked={quarters.indexOf(q) > -1} />
                <ListItemText primary={q} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Half Year</InputLabel>
          <Select
            multiple
            value={halfYears}
            onChange={(e) => setHalfYears(e.target.value)}
            renderValue={(selected) => selected.join(", ")}
          >
            {halfYearOptions.map((h) => (
              <MenuItem key={h} value={h}>
                <Checkbox checked={halfYears.indexOf(h) > -1} />
                <ListItemText primary={h} />
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
      </Box>

      <Box sx={{ overflowX: "auto", width: "100%" }}>
        <DataTable data={renamedData} title="Revenue Summary" hiddenColumns={hiddenColumns} />
      </Box>
    </Box>
  );
}

export default RevenuePage;
