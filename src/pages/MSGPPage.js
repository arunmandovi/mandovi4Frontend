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

function MSGPPage() {
  const [serviceBodyShopSummary, setServiceBodyShopSummary] = useState([]);
  const [serviceSummary, setServiceSummary] = useState([]);
  const [bodyShopSummary, setBodyShopSummary] = useState([]);
  const [freeServiceSummary, setFreeServiceSummary] = useState([]);
  const [pmsSummary, setPmsSummary] = useState([]);
  const [runningRepairSummary, setRunningRepairSummary] = useState([]);
  const [othersSummary, setOthersSummary] = useState([]);

  const [months, setMonths] = useState([]);
  const [groupBy, setGroupBy] = useState("city");
  const [qtr, setQtr] = useState([]);
  const [halfYear, setHalfYear] = useState([]);

  const monthOptions = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const qtrOptions = ["Qtr1", "Qtr2", "Qtr3", "Qtr4"];
  const halfYearOptions = ["H1", "H2"];
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - i);

  const aggregateData = (data, keys) => {
    const map = {};
    data.forEach(row => {
      const key = keys.map(k => row[k]).join("_");
      if (!map[key]) {
        map[key] = { ...row };
      } else {
        ["previousNetRetailDDL", "currentNetRetailDDL", "growth"].forEach(col => {
          if (row[col] !== undefined && !isNaN(row[col])) {
            map[key][col] = (map[key][col] || 0) + Number(row[col]);
          }
        });
      }
    });
    return Object.values(map);
  };

  const formatSummaryData = (data) => {
    const keys = groupBy === "city_branch" ? ["city", "branch"] : [groupBy];
    const aggregated = aggregateData(data, keys);

    return aggregated.map(row => {
      const formattedRow = { ...row };
      if (row.previousNetRetailDDL !== undefined && row.currentNetRetailDDL !== undefined) {
        formattedRow["2024-25"] = Number(row.previousNetRetailDDL).toLocaleString("en-IN");
        formattedRow["2025-26"] = Number(row.currentNetRetailDDL).toLocaleString("en-IN");
        formattedRow["Growth %"] = row.growth !== null ? row.growth.toFixed(2) + "%" : "0%";
        delete formattedRow.previousNetRetailDDL;
        delete formattedRow.currentNetRetailDDL;
        delete formattedRow.growth;
      }
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
  const sortByCityOrder = (data) => {
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

  const synchronizeRows = (tablesData, keyColumns) => {
    const allKeys = new Set();
    tablesData.forEach(table => {
      table.forEach(row => {
        const key = keyColumns.map(k => row[k]).join("_");
        allKeys.add(key);
      });
    });

    const keysArray = Array.from(allKeys);
    return tablesData.map(table => {
      const map = {};
      table.forEach(row => {
        const key = keyColumns.map(k => row[k]).join("_");
        map[key] = row;
      });

      return keysArray.map(key => {
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

  const fetchSummaries = async () => {
    try {
      let combinedService = [];
      let combinedBodyShop = [];
      let combinedFreeService = [];
      let combinedPMS = [];
      let combinedFPR = [];
      let combinedRunningRepair = [];
      let combinedOthers = [];
      let combinedBSFpr = []; // 🆕 new variable

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

              const serviceBodyShopData = await fetchData(`/api/msgp/msgp_service_bodyshop${query}`);
              if (Array.isArray(serviceBodyShopData)) combinedService = combinedService.concat(serviceBodyShopData);

              const serviceData = await fetchData(`/api/msgp/msgp_service${query}`);
              if (Array.isArray(serviceData)) combinedService = combinedService.concat(serviceData);

              const bodyShopData = await fetchData(`/api/msgp/msgp_bodyshop${query}`);
              if (Array.isArray(bodyShopData)) combinedBodyShop = combinedBodyShop.concat(bodyShopData);

              const freeServiceData = await fetchData(`/api/msgp/msgp_freeservice${query}`);
              if (Array.isArray(freeServiceData)) combinedFreeService = combinedFreeService.concat(freeServiceData);

              const pmsData = await fetchData(`/api/msgp/msgp_pms${query}`);
              if (Array.isArray(pmsData)) combinedPMS = combinedPMS.concat(pmsData);

              const runningRepairData = await fetchData(`/api/msgp/msgp_running_repair${query}`);
              if (Array.isArray(runningRepairData)) combinedRunningRepair = combinedRunningRepair.concat(runningRepairData);

              const othersData = await fetchData(`/api/msgp/msgp_others${query}`);
              if (Array.isArray(othersData)) combinedOthers = combinedOthers.concat(othersData);
            }
        }
      }

      let formattedServiceBodyShop = sortByCityOrder(formatSummaryData(combinedService));
      let formattedService = sortByCityOrder(formatSummaryData(combinedService));
      let formattedBodyShop = sortByCityOrder(formatSummaryData(combinedBodyShop));
      let formattedFreeService = sortByCityOrder(formatSummaryData(combinedFreeService));
      let formattedPMS = sortByCityOrder(formatSummaryData(combinedPMS));
      let formattedFPR = sortByCityOrder(formatSummaryData(combinedFPR));
      let formattedRunningRepair = sortByCityOrder(formatSummaryData(combinedRunningRepair));
      let formattedOthers = sortByCityOrder(formatSummaryData(combinedOthers));
      let formattedBSFpr = sortByCityOrder(formatSummaryData(combinedBSFpr));

      const keyColumns = groupBy === "city_branch" ? ["city", "branch"] : [groupBy];
      [
        formattedServiceBodyShop,
        formattedService,
        formattedBodyShop,
        formattedFreeService,
        formattedPMS,
        formattedFPR,
        formattedRunningRepair,
        formattedOthers,
        formattedBSFpr,
      ] = synchronizeRows(
        [
          formattedServiceBodyShop,
          formattedService,
          formattedBodyShop,
          formattedFreeService,
          formattedPMS,
          formattedFPR,
          formattedRunningRepair,
          formattedOthers,
          formattedBSFpr,
        ],
        keyColumns
      );

      setServiceBodyShopSummary(formattedServiceBodyShop);
      setServiceSummary(formattedService);
      setBodyShopSummary(formattedBodyShop);
      setFreeServiceSummary(formattedFreeService);
      setPmsSummary(formattedPMS);
      setRunningRepairSummary(formattedRunningRepair);
      setOthersSummary(formattedOthers);
    } catch (err) {
      console.error(err);
      alert("❌ Error fetching MSGP Summaries: " + err.message);
    }
  };

  useEffect(() => {
    fetchSummaries();
  }, [months, groupBy, qtr, halfYear]);

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
        MSGP SUMMARY REPORT
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

      {/* 🔹 Data Tables */}
      <Box sx={{ display: "flex", gap: 0.1, flexWrap: "wrap" }}>
         <Box sx={{ flex: 1, minWidth: 300, maxHeight: 600, overflowY: "auto" }}>
          <DataTable data={filterData(serviceBodyShopSummary)} title="SERVICE + BODYSHOP" />
        </Box>

        <Box sx={{ flex: 1, minWidth: 300, maxHeight: 600, overflowY: "auto" }}>
          <DataTable data={filterData(serviceSummary)} title="SERVICE" />
        </Box>

        <Box sx={{ flex: 1, minWidth: 300, maxHeight: 600, overflowY: "auto" }}>
          <DataTable data={filterData(bodyShopSummary)} title="BODYSHOP" />
        </Box>

        <Box sx={{ flex: 1, minWidth: 300, maxHeight: 600, overflowY: "auto" }}>
          <DataTable data={filterData(freeServiceSummary)} title="FREE SERVICE" />
        </Box>

        <Box sx={{ flex: 1, minWidth: 300, maxHeight: 600, overflowY: "auto" }}>
          <DataTable data={filterData(pmsSummary)} title="PAID SERVICE" />
        </Box>

        <Box sx={{ flex: 1, minWidth: 300, maxHeight: 600, overflowY: "auto" }}>
          <DataTable data={filterData(runningRepairSummary)} title="RUNNING REPAIR" />
        </Box>

        <Box sx={{ flex: 1, minWidth: 300, maxHeight: 600, overflowY: "auto" }}>
          <DataTable data={filterData(othersSummary)} title="OTHERS SERVICE" />
      </Box>
      </Box>
    </Box>
  );
}

export default MSGPPage;
