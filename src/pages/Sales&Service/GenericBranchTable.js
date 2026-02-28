import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { fetchData } from "../../api/uploadService";
import { utils, writeFileXLSX } from "xlsx";

const GenericBranchTable = ({
  title,
  apiEndpoint,
  config,
  navigationRoutes,
  valueField = "count"
}) => {
  const navigate = useNavigate();
  const tableRef = useRef(null);

  const {
    months = ["APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC", "JAN", "FEB", "MAR"],
    startYear,
    channels = ["ARENA", "NEXA"],
    branches,
    extraFilters // can be null or undefined
  } = config;

  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - startYear + 1 },
    (_, i) => String(startYear + i)
  );

  // States
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [selectedChannels, setSelectedChannels] = useState([]);
  const [selectedExtraFilters, setSelectedExtraFilters] = useState([]);
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [rawRows, setRawRows] = useState([]);

  // Fetch data - FIXED: Safe extraFilters handling
  useEffect(() => {
    const load = async () => {
      const monthsToFetch = selectedMonths.length ? selectedMonths : months;
      const yearsToFetch = selectedYears.length ? selectedYears : years;
      let all = [];

      for (const m of monthsToFetch) {
        const queryParams = new URLSearchParams({
          months: m,
          years: yearsToFetch.join(",")
        });

        if (selectedChannels.length) {
          queryParams.append("channels", selectedChannels.join(","));
        }

        // ✅ FIXED: Only add extraFilters if they exist and are selected
        if (extraFilters && selectedExtraFilters.length) {
          queryParams.append(extraFilters.name, selectedExtraFilters.join(","));
        }

        try {
          const res = await fetchData(`${apiEndpoint}?${queryParams}`);
          if (Array.isArray(res)) {
            const filtered = res.filter(
              (r) => !selectedBranches.length || selectedBranches.includes(r.branch)
            );
            all.push(...filtered.map((r) => ({ ...r, month: m })));
          }
        } catch (error) {
          console.error('Fetch error:', error);
        }
      }

      setRawRows(all);
    };

    load();
  }, [selectedMonths, selectedYears, selectedChannels, selectedExtraFilters, selectedBranches, months, years, apiEndpoint, extraFilters]);

  // Existing months for table headers
  const existingMonths = useMemo(
    () => (selectedMonths.length ? selectedMonths : months),
    [selectedMonths, months]
  );

  // Transform table data
  const { tableRows, grandTotals } = useMemo(() => {
    const map = {};
    const monthTotals = {};
    let overallTotal = 0;

    rawRows.forEach((r) => {
      const key = r.branch;

      if (!map[key]) {
        map[key] = {
          branch: r.branch,
          months: {},
          total: 0,
        };
      }

      const value = r[valueField] || 0;
      map[key].months[r.month] = (map[key].months[r.month] || 0) + value;
      map[key].total += value;

      monthTotals[r.month] = (monthTotals[r.month] || 0) + value;
      overallTotal += value;
    });

    return {
      tableRows: Object.values(map),
      grandTotals: {
        months: monthTotals,
        total: overallTotal,
      },
    };
  }, [rawRows, valueField]);

  // Download XLSX
  const handleDownloadXlsx = () => {
    if (!tableRef.current) return;
    const table = tableRef.current;
    const wb = utils.table_to_book(table);
    writeFileXLSX(wb, `${title.replace(/\s+/g, '_').toUpperCase()}.xlsx`);
  };

  // UI Helpers
  const slicerStyle = (selected) => ({
    borderRadius: 20,
    fontWeight: 600,
    textTransform: "none",
    px: 2,
    background: selected ? "#c8e6c9" : "#fff",
    border: "1px solid #9ccc65",
    "&:hover": { background: "#aed581" },
  });

  const toggleSelection = (setter, currentSelection, item) => {
    setter((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* HEADER + NAVIGATION */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">{title}</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          {navigationRoutes.map(({ label, path }, i) => (
            <Button
              key={label}
              variant="contained"
              onClick={() => navigate(path)}
              disabled={!path} // Disable if no path (current page)
            >
              {label}
            </Button>
          ))}
          <Button variant="contained" color="primary" onClick={handleDownloadXlsx}>
            Download
          </Button>
        </Box>
      </Box>

      {/* YEAR FILTER */}
      <Box sx={{ mb: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
        {years.map((y) => (
          <Button
            key={y}
            size="small"
            sx={slicerStyle(selectedYears.includes(y))}
            onClick={() => toggleSelection(setSelectedYears, selectedYears, y)}
          >
            {y}
          </Button>
        ))}
      </Box>

      {/* CHANNEL FILTER */}
      <Box sx={{ mb: 2, display: "flex", gap: 1 }}>
        {channels.map((c) => (
          <Button
            key={c}
            size="small"
            sx={slicerStyle(selectedChannels.includes(c))}
            onClick={() => toggleSelection(setSelectedChannels, selectedChannels, c)}
          >
            {c}
          </Button>
        ))}
      </Box>

      {/* EXTRA FILTERS (Service Codes, etc.) - FIXED: Safe rendering */}
      {extraFilters?.items && (
        <Box sx={{ mb: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
          {extraFilters.items.map((item) => (
            <Button
              key={item}
              size="small"
              sx={slicerStyle(selectedExtraFilters.includes(item))}
              onClick={() => toggleSelection(setSelectedExtraFilters, selectedExtraFilters, item)}
            >
              {item}
            </Button>
          ))}
        </Box>
      )}

      {/* BRANCH FILTER */}
      <Box sx={{ mb: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
        {branches.map((b) => (
          <Button
            key={b}
            size="small"
            sx={slicerStyle(selectedBranches.includes(b))}
            onClick={() => toggleSelection(setSelectedBranches, selectedBranches, b)}
          >
            {b}
          </Button>
        ))}
      </Box>

      {/* MONTH FILTER */}
      <Box sx={{ mb: 3, display: "flex", gap: 1, flexWrap: "wrap" }}>
        {months.map((m) => (
          <Button
            key={m}
            size="small"
            sx={slicerStyle(selectedMonths.includes(m))}
            onClick={() => toggleSelection(setSelectedMonths, selectedMonths, m)}
          >
            {m}
          </Button>
        ))}
      </Box>

      {/* TABLE */}
      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 4 }}>
        <Table size="small" ref={tableRef}>
          <TableHead>
            <TableRow sx={{ background: "#455a64" }}>
              <TableCell sx={{ color: "#fff", fontWeight: 800 }}>Branch</TableCell>
              {existingMonths.map((m) => (
                <TableCell key={m} align="center" sx={{ color: "#fff", fontWeight: 800 }}>
                  {m}
                </TableCell>
              ))}
              <TableCell align="center" sx={{ color: "#fff", fontWeight: 900 }}>
                TOTAL
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableRows.map((r, i) => (
              <TableRow key={i} sx={{ background: i % 2 ? "#fafafa" : "#fff" }}>
                <TableCell sx={{ fontWeight: 700 }}>{r.branch}</TableCell>
                {existingMonths.map((m) => (
                  <TableCell key={m} align="center">
                    {r.months[m] ?? "-"}
                  </TableCell>
                ))}
                <TableCell align="center" sx={{ fontWeight: 900 }}>
                  {r.total}
                </TableCell>
              </TableRow>
            ))}
            {/* GRAND TOTAL */}
            <TableRow sx={{ background: "#e3f2fd" }}>
              <TableCell sx={{ fontWeight: 900 }}>GRAND TOTAL</TableCell>
              {existingMonths.map((m) => (
                <TableCell key={m} align="center" sx={{ fontWeight: 900 }}>
                  {grandTotals.months[m] ?? "-"}
                </TableCell>
              ))}
              <TableCell align="center" sx={{ fontWeight: 900 }}>
                {grandTotals.total}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default GenericBranchTable;
