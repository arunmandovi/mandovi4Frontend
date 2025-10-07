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
  const [pmsSummary, setPmsSummary] = useState([]);
  const [fprSummary, setFprSummary] = useState([]);
  const [runningRepairSummary, setRunningRepairSummary] = useState([]);
  const [othersSummary, setOthersSummary] = useState([]);
  const [bsFprSummary, setBsFprSummary] = useState([]);

  const [months, setMonths] = useState([]);
  const [groupBy, setGroupBy] = useState("city");
  const [qtr, setQtr] = useState([]);
  const [halfYear, setHalfYear] = useState([]);

  const monthOptions = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const qtrOptions = ["Qtr1", "Qtr2", "Qtr3", "Qtr4"];
  const halfYearOptions = ["H1", "H2"];
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - i);

  // ✅ Helper to add Grand Total row
  const addGrandTotalRow = (data) => {
    if (!data || data.length === 0) return data;

    let totalPrev = 0, totalCurr = 0, totalGrowth = 0, count = 0;

    data.forEach(row => {
      const prev = Number(String(row["2024-25"]).replace(/,/g, "")) || 0;
      const curr = Number(String(row["2025-26"]).replace(/,/g, "")) || 0;
      const growth = parseFloat(String(row["Growth %"]).replace("%", "")) || 0;

      totalPrev += prev;
      totalCurr += curr;
      totalGrowth += growth;
      count++;
    });

    const avgGrowth = count > 0 ? (totalGrowth / count).toFixed(2) + "%" : "0%";

    const totalLabelKey = Object.keys(data[0])[0];

    const grandTotalRow = {
      [totalLabelKey]: "Grand Total",
      "2024-25": totalPrev.toLocaleString("en-IN"),
      "2025-26": totalCurr.toLocaleString("en-IN"),
      "Growth %": avgGrowth,
    };

    return [...data, grandTotalRow];
  };

  // --- Core helpers ---
  const aggregateData = (data, keys) => {
    const map = {};
    data.forEach(row => {
      const key = keys.map(k => row[k]).join("_");
      if (!map[key]) {
        map[key] = { ...row };
      } else {
        ["previousServiceLoadd", "currentServiceLoadd", "growth"].forEach(col => {
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
      let combinedBSFpr = [];

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

            const serviceData = await fetchData(`/api/loadd/loadd_service${query}`);
            if (Array.isArray(serviceData)) combinedService = combinedService.concat(serviceData);

            const bodyShopData = await fetchData(`/api/loadd/loadd_bodyshop${query}`);
            if (Array.isArray(bodyShopData)) combinedBodyShop = combinedBodyShop.concat(bodyShopData);

            const freeServiceData = await fetchData(`/api/loadd/loadd_freeservice${query}`);
            if (Array.isArray(freeServiceData)) combinedFreeService = combinedFreeService.concat(freeServiceData);

            const pmsData = await fetchData(`/api/loadd/loadd_pms${query}`);
            if (Array.isArray(pmsData)) combinedPMS = combinedPMS.concat(pmsData);

            const fprData = await fetchData(`/api/loadd/loadd_fpr${query}`);
            if (Array.isArray(fprData)) combinedFPR = combinedFPR.concat(fprData);

            const runningRepairData = await fetchData(`/api/loadd/loadd_running_repair${query}`);
            if (Array.isArray(runningRepairData)) combinedRunningRepair = combinedRunningRepair.concat(runningRepairData);

            const othersData = await fetchData(`/api/loadd/loadd_others${query}`);
            if (Array.isArray(othersData)) combinedOthers = combinedOthers.concat(othersData);

            const bsFprData = await fetchData(`/api/loadd/loadd_bs_fpr${query}`);
            if (Array.isArray(bsFprData)) combinedBSFpr = combinedBSFpr.concat(bsFprData);
          }
        }
      }

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

      // ✅ Add Grand Total row
      setServiceSummary(addGrandTotalRow(formattedService));
      setBodyShopSummary(addGrandTotalRow(formattedBodyShop));
      setFreeServiceSummary(addGrandTotalRow(formattedFreeService));
      setPmsSummary(addGrandTotalRow(formattedPMS));
      setFprSummary(addGrandTotalRow(formattedFPR));
      setRunningRepairSummary(addGrandTotalRow(formattedRunningRepair));
      setOthersSummary(addGrandTotalRow(formattedOthers));
      setBsFprSummary(addGrandTotalRow(formattedBSFpr));
    } catch (err) {
      console.error(err);
      alert("❌ Error fetching Load Summaries: " + err.message);
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

      {/* Tables */}
      <Box sx={{ display: "flex", gap: 0.1, flexWrap: "wrap" }}>
        <Box sx={{ flex: 1, minWidth: 300, maxHeight: 600, overflowY: "auto" }}>
          <DataTable data={filterData(serviceSummary)} title="Service Load" />
        </Box>

        <Box sx={{ flex: 1, minWidth: 300, maxHeight: 600, overflowY: "auto" }}>
          <DataTable data={filterData(bodyShopSummary)} title="BodyShop Load" />
        </Box>

        <Box sx={{ flex: 1, minWidth: 300, maxHeight: 600, overflowY: "auto" }}>
          <DataTable data={filterData(freeServiceSummary)} title="Free Service Load" />
        </Box>

        <Box sx={{ flex: 1, minWidth: 300, maxHeight: 600, overflowY: "auto" }}>
          <DataTable data={filterData(pmsSummary)} title="PMS Load" />
        </Box>

        <Box sx={{ flex: 1, minWidth: 300, maxHeight: 600, overflowY: "auto" }}>
          <DataTable data={filterData(fprSummary)} title="FPR Load" />
        </Box>

        <Box sx={{ flex: 1, minWidth: 300, maxHeight: 600, overflowY: "auto" }}>
          <DataTable data={filterData(runningRepairSummary)} title="Running Repair Load" />
        </Box>

        <Box sx={{ flex: 1, minWidth: 300, maxHeight: 600, overflowY: "auto" }}>
          <DataTable data={filterData(othersSummary)} title="Others Load" />
        </Box>

        <Box sx={{ flex: 1, minWidth: 300, maxHeight: 600, overflowY: "auto" }}>
          <DataTable data={filterData(bsFprSummary)} title="% BS Load on FPR Load" />
        </Box>
      </Box>
    </Box>
  );
}

export default LoaddPage;
