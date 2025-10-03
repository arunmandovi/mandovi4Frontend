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

function LoaddPage() {
  const [serviceSummary, setServiceSummary] = useState([]);
  const [bodyShopSummary, setBodyShopSummary] = useState([]);
  const [freeServiceSummary, setFreeServiceSummary] = useState([]);
  const [pmsSummary, setPmsSummary] = useState([]); // PMS Summary
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

  // Aggregate rows based on groupBy keys
  const aggregateData = (data, keys) => {
    const map = {};
    data.forEach(row => {
      const key = keys.map(k => row[k]).join("_");
      if (!map[key]) {
        map[key] = { ...row };
      } else {
        // Sum numeric fields
        ["previousServiceLoadd", "currentServiceLoadd", "growth"].forEach(col => {
          if (row[col] !== undefined && !isNaN(row[col])) {
            map[key][col] = (map[key][col] || 0) + Number(row[col]);
          }
        });
      }
    });
    return Object.values(map);
  };

  // Format summary data with FY labels
  const formatSummaryData = (data) => {
    const keys = groupBy === "city_branch" ? ["city", "branch"] : [groupBy];
    const aggregated = aggregateData(data, keys);

    return aggregated.map((row) => {
      const formattedRow = { ...row };
      if (row.previousServiceLoadd !== undefined && row.currentServiceLoadd !== undefined) {
        formattedRow["2024-25"] = Number(row.previousServiceLoadd).toLocaleString("en-IN");
        formattedRow["2025-26"] = Number(row.currentServiceLoadd).toLocaleString("en-IN");
        formattedRow["Growth %"] = row.growth !== null ? row.growth.toFixed(2) + "%" : "0%";

        delete formattedRow.previousServiceLoadd;
        delete formattedRow.currentServiceLoadd;
        delete formattedRow.growth;
      }
      return formattedRow;
    });
  };

  // Sort rows by specific city order
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

  // Fetch all summaries
  const fetchSummaries = async () => {
    try {
      let combinedService = [];
      let combinedBodyShop = [];
      let combinedFreeService = [];
      let combinedPMS = [];

      const monthsList = months.length > 0 ? months : [""];
      const yearsList = years.length > 0 ? years : [""];
      const qtrList = qtr.length > 0 ? qtr : [""];
      const halfList = halfYear.length > 0 ? halfYear : [""];

      for (const m of monthsList) {
        for (const y of yearsList) {
          for (const q of qtrList) {
            for (const h of halfList) {
              const query =
                `?groupBy=${groupBy}` +
                (m ? `&month=${m}` : "") +
                (y ? `&year=${y}` : "") +
                (q ? `&qtrWise=${q}` : "") +
                (h ? `&halfYear=${h}` : "");

              const serviceData = await fetchData(`/api/loadd/loadd_service${query}`);
              if (Array.isArray(serviceData)) combinedService = combinedService.concat(serviceData);

              const bodyShopData = await fetchData(`/api/loadd/loadd_bodyshop${query}`);
              if (Array.isArray(bodyShopData)) combinedBodyShop = combinedBodyShop.concat(bodyShopData);

              const freeServiceData = await fetchData(`/api/loadd/loadd_freeservice${query}`);
              if (Array.isArray(freeServiceData)) combinedFreeService = combinedFreeService.concat(freeServiceData);

              const pmsData = await fetchData(`/api/loadd/loadd_pms${query}`);
              if (Array.isArray(pmsData)) combinedPMS = combinedPMS.concat(pmsData);
            }
          }
        }
      }

      setServiceSummary(sortByCityOrder(formatSummaryData(combinedService)));
      setBodyShopSummary(sortByCityOrder(formatSummaryData(combinedBodyShop)));
      setFreeServiceSummary(sortByCityOrder(formatSummaryData(combinedFreeService)));
      setPmsSummary(sortByCityOrder(formatSummaryData(combinedPMS)));
    } catch (err) {
      console.error(err);
      alert("❌ Error fetching Load Summaries: " + err.message);
    }
  };

  useEffect(() => {
    fetchSummaries();
  }, [months, years, groupBy, qtr, halfYear]);

  // Hide unwanted columns
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
        LOAD SUMMARY REPORT
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
          <InputLabel>Years</InputLabel>
          <Select
            multiple
            value={years}
            onChange={(e) => setYears(e.target.value)}
            renderValue={(selected) => selected.join(", ")}
          >
            {yearOptions.map((y) => (
              <MenuItem key={y} value={y}>
                <Checkbox checked={years.indexOf(y) > -1} />
                <ListItemText primary={y} />
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

      {/* Tables Side by Side */}
      <Box sx={{ display: "flex", gap: 0.1, flexWrap: "wrap" }}>
        <Box sx={{ flex: 1, minWidth: 300, maxHeight: 600, overflowY: "auto" }}>
          <DataTable data={filterData(serviceSummary)} title="Load Service Summary" />
        </Box>

        <Box sx={{ flex: 1, minWidth: 300, maxHeight: 600, overflowY: "auto" }}>
          <DataTable data={filterData(bodyShopSummary)} title="Load BodyShop Summary" />
        </Box>

        <Box sx={{ flex: 1, minWidth: 300, maxHeight: 600, overflowY: "auto" }}>
          <DataTable data={filterData(freeServiceSummary)} title="Load Free Service Summary" />
        </Box>

        <Box sx={{ flex: 1, minWidth: 300, maxHeight: 600, overflowY: "auto" }}>
          <DataTable data={filterData(pmsSummary)} title="Load PMS Summary" />
        </Box>
      </Box>
    </Box>
  );
}

export default LoaddPage;
