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

function BRConversionPage() {
  const [brConversionSummary, setBRConversionSummary] = useState([]);
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
    arenaFSPMSLoadd: "ARENA FS & PMS LOAD",
    arenaBRConversion: "ARENA BR Conversion",
    arenaPercentageBRConversion: "ARENA BR Conversion %",
    nexaFSPMSLoadd: "NEXA FS & PMS LOAD",
    nexaBRConversion: "NEXA BR Conversion",
    nexaPercentageBRConversion: "NEXA BR Conversion %",
    arenaNexaFSPMSLoadd: "ARENA&NEXA FS & PMS LOAD",
    arenaNexaBRConversion: "ARENA&NEXA BR Conversion",
    arenaNexaPercentageBRConversion: "ARENA&NEXA BR Conversion %",
    arenaLabourAmount: "ARENA Labour Amount",
    arenaPartAmount: "ARENA Part Amount",
    arenaTotalAmount: "ARENA TOTAL",
    nexaLabourAmount: "NEXA Labour Amount",
    nexaPartAmount: "NEXA Part Amount",
    nexaTotalAmount: "NEXA TOTAL",
    arenaNexaLabourAmount: "ARENA&NEXA Labour Amount",
    arenaNexaPartAmount: "ARENA&NEXA Part Amount",
    arenaNexaTotalAmount: "ARENA&NEXA TOTAL",
  };

  const formatNumericValues = (data) => {
    return data.map((row) => {
      const formatted = {};
      for (const key in row) {
        const val = row[key];
        if (key.toLowerCase().includes("percentage")) {
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

  // ✅ Updated Grand Total to calculate average for % columns
  const addGrandTotalRow = (data) => {
    if (!data || data.length === 0) return data;

    const totalRow = {};
    const numericKeys = new Set();
    const percentageKeys = new Set();

    Object.keys(data[0]).forEach((key) => {
      const val = data[0][key];
      if (typeof val === "string" && val.replace(/[,\d.%]/g, "").trim() === "")
        numericKeys.add(key);
      if (key.toLowerCase().includes("percentage")) percentageKeys.add(key);
    });

    const countRows = data.length;

    data.forEach((row) => {
      if (row[Object.keys(data[0])[0]] === "Grand Total") return;
      numericKeys.forEach((key) => {
        const num = Number(String(row[key]).replace(/[,%]/g, "").replace(/,/g, "")) || 0;
        if (percentageKeys.has(key)) {
          totalRow[key] = (totalRow[key] || 0) + num;
        } else {
          totalRow[key] = (totalRow[key] || 0) + num;
        }
      });
    });

    const formattedTotals = {};
    Object.entries(totalRow).forEach(([key, val]) => {
      if (percentageKeys.has(key)) {
        const avg = val / countRows;
        formattedTotals[key] = avg.toFixed(2) + "%";
      } else {
        formattedTotals[key] = val.toLocaleString("en-IN", { maximumFractionDigits: 2 });
      }
    });

    const firstKey = Object.keys(data[0])[0];
    formattedTotals[firstKey] = "Grand Total";

    return [...data, formattedTotals];
  };

  // ✅ Custom city priority sorting
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
    const fetchBRConversionSummary = async () => {
      try {
        let responses = [];
        const activeMonths = months.length > 0 ? months : [];
        const activeQuarters = quarters.length > 0 ? quarters : [];
        const activeHalfYears = halfYears.length > 0 ? halfYears : [];

        if (activeMonths.length === 0 && activeQuarters.length === 0 && activeHalfYears.length === 0) {
          const query = `?groupBy=${groupBy}`;
          const data = await fetchData(`/api/br_conversion/br_conversion_summary${query}`);
          responses.push(data);
        }

        for (const m of activeMonths) {
          const query = `?groupBy=${groupBy}&month=${m}`;
          const data = await fetchData(`/api/br_conversion/br_conversion_summary${query}`);
          responses.push(data);
        }

        for (const q of activeQuarters) {
          const query = `?groupBy=${groupBy}&qtrWise=${q}`;
          const data = await fetchData(`/api/br_conversion/br_conversion_summary${query}`);
          responses.push(data);
        }

        for (const h of activeHalfYears) {
          const query = `?groupBy=${groupBy}&halfYear=${h}`;
          const data = await fetchData(`/api/br_conversion/br_conversion_summary${query}`);
          responses.push(data);
        }

        const validData = responses.filter((r) => Array.isArray(r));
        let combinedData = validData.length > 1 ? combineDataSets(validData, groupBy) : validData[0] || [];

        combinedData = sortByCityPriority(combinedData);

        const formatted = formatNumericValues(combinedData);
        const withTotal = addGrandTotalRow(formatted);
        setBRConversionSummary(withTotal);
      } catch (error) {
        console.error(error);
        alert("❌ Error fetching BR Conversion Summary: " + error.message);
      }
    };

    fetchBRConversionSummary();
  }, [months, quarters, halfYears, groupBy]);

  const renamedData = brConversionSummary.map((row) => {
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
        BR Conversion REPORT
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
        <DataTable
          data={renamedData}
          title="BR Conversion Summary"
          hiddenColumns={hiddenColumns}
        />
      </Box>
    </Box>
  );
}

export default BRConversionPage;
