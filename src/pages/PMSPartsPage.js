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

function PMSPartsPage() {
  const [pmsPartsSummary, setPMSPartsSummary] = useState([]);
  const [months, setMonths] = useState([]);
  const [groupBy, setGroupBy] = useState("city");
  const [qtr, setQtr] = useState([]);
  const [halfYear, setHalfYear] = useState([]);

  const monthOptions = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const qtrOptions = ["Qtr1", "Qtr2", "Qtr3", "Qtr4"];
  const halfYearOptions = ["H1", "H2"];

  // 🔹 Aggregate Data
  const aggregateData = (data, keys) => {
    const map = {};
    data.forEach((row) => {
      const key = keys.map((k) => row[k]).join("_");
      if (!map[key]) {
        map[key] = { ...row };
      } else {
        [
          "Air filter",
          "Belt water pump",
          "Brake fluid",
          "Coolant",
          "Fuel Filter",
          "Oil filter",
          "Spark plug",
          "7 PARTS PMS",
          "DRAIN PLUG GASKET",
          "ISG BELT GENERATOR",
          "CNG FILTER",
          "3 PARTS PMS",
          "Grand Total",
        ].forEach((col) => {
          if (row[col] !== undefined && !isNaN(row[col])) {
            map[key][col] = (map[key][col] || 0) + Number(row[col]);
          }
        });
      }
    });
    return Object.values(map);
  };

  // 🔹 Add Grand Total Row (average values instead of sum)
  const addGrandTotalRow = (data) => {
    if (!data || data.length === 0) return data;

    const totalRow = {};
    const numericKeys = new Set();

    Object.keys(data[0]).forEach((key) => {
      const sample = data[0][key];
      if (
        typeof sample === "string" &&
        sample.replace(/[,\d.%]/g, "").trim() === ""
      )
        numericKeys.add(key);
    });

    const rowCount = data.length;

    data.forEach((row) => {
      numericKeys.forEach((key) => {
        const num = Number(String(row[key]).replace(/[,%]/g, "").replace(/,/g, "")) || 0;
        totalRow[key] = (totalRow[key] || 0) + num;
      });
    });

    // ➤ Convert total to average (divide by number of rows)
    const formattedTotals = {};
    Object.entries(totalRow).forEach(([key, val]) => {
      const avg = rowCount > 0 ? val / rowCount : 0;
      formattedTotals[key] = avg.toFixed(2) + "%";
    });

    // ✅ Label under city column
    const totalLabelKey = Object.keys(data[0])[0];
    formattedTotals[totalLabelKey] = "Grand Total";

    return [...data, formattedTotals];
  };

  // 🔹 Format Data
  const formatSummaryData = (data) => {
    const keys = groupBy === "city_branch" ? ["city", "branch"] : [groupBy];
    const aggregated = aggregateData(data, keys);

    return aggregated.map((row) => {
      const formattedRow = { ...row };

      const numericColumns = [
        "airFilter",
        "beltWaterPump",
        "brakeFluid",
        "coolant",
        "fuelFilter",
        "oilFilter",
        "sparkPlug",
        "sevenPartsPMS",
        "drainPlugGasket",
        "isgBeltGenerator",
        "cngFilter",
        "threePartsPMS",
        "grandTotal",
      ];

      numericColumns.forEach((col) => {
        if (row[col] !== undefined && !isNaN(row[col])) {
          formattedRow[col] = (Number(row[col]) || 0).toFixed(2) + "%";
        }
      });

      const displayMap = {
        airFilter: "Air filter",
        beltWaterPump: "Belt water pump",
        brakeFluid: "Brake fluid",
        coolant: "Coolant",
        fuelFilter: "Fuel Filter",
        oilFilter: "Oil filter",
        sparkPlug: "Spark plug",
        sevenPartsPMS: "7 PARTS PMS",
        drainPlugGasket: "DRAIN PLUG GASKET",
        isgBeltGenerator: "ISG BELT GENERATOR",
        cngFilter: "CNG FILTER",
        threePartsPMS: "3 PARTS PMS",
        grandTotal: "Grand Total",
      };

      Object.keys(displayMap).forEach((col) => {
        formattedRow[displayMap[col]] = formattedRow[col];
        delete formattedRow[col];
      });

      return formattedRow;
    });
  };

  // 🔹 City priority for sorting
  const CITY_PRIORITY = {
    bangalore: 0,
    mysore: 1,
    mangalore: 2,
  };
  const getCityPriority = (city) => {
    if (!city && city !== "") return 99;
    const c = (city || "").toString().trim().toLowerCase();
    return CITY_PRIORITY.hasOwnProperty(c) ? CITY_PRIORITY[c] : 99;
  };

  const finalSortByCityPriority = (data) => {
    return data.sort((a, b) => {
      if (groupBy === "city_branch") {
        const pa = getCityPriority(a.city);
        const pb = getCityPriority(b.city);
        if (pa !== pb) return pa - pb;
        const cityCompare = (a.city || "").localeCompare(b.city || "");
        if (cityCompare !== 0) return cityCompare;
        return (a.branch || "").localeCompare(b.branch || "");
      }
      const pa = getCityPriority(a.city);
      const pb = getCityPriority(b.city);
      if (pa !== pb) return pa - pb;
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
        emptyRow["2024-25"] = "0.00%";
        emptyRow["2025-26"] = "0.00%";
        emptyRow["Growth %"] = "0.00%";
        return emptyRow;
      });
    });
  };

  // 🔹 Fetch Data
  const fetchSummaries = async () => {
    try {
      let pmsPartsSummary = [];
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
            const pmsPartsSummaryData = await fetchData(`/api/pms_parts/pms_parts_summary${query}`);
            if (Array.isArray(pmsPartsSummaryData))
              pmsPartsSummary = pmsPartsSummary.concat(pmsPartsSummaryData);
          }
        }
      }

      let formatted = formatSummaryData(pmsPartsSummary);
      const keyColumns = groupBy === "city_branch" ? ["city", "branch"] : [groupBy];
      [formatted] = synchronizeRows([formatted], keyColumns);
      formatted = finalSortByCityPriority(formatted);

      // ✅ Add Average row at end
      formatted = addGrandTotalRow(formatted);

      setPMSPartsSummary(formatted);
    } catch (err) {
      console.error(err);
      alert("❌ Error fetching PMS Parts Summaries: " + err.message);
    }
  };

  useEffect(() => {
    fetchSummaries();
  }, [months, groupBy, qtr, halfYear]);

  // 🔹 Hide columns
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
        PMS Parts SUMMARY REPORT
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
          <DataTable data={filterData(pmsPartsSummary)} title="PMS PARTS Summary" />
        </Box>
      </Box>
    </Box>
  );
}

export default PMSPartsPage;
