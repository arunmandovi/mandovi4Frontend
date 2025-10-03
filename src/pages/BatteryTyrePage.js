import React, { useState, useEffect } from "react";
import { 
  Box, Select, MenuItem, FormControl, InputLabel, Typography, Checkbox, ListItemText 
} from "@mui/material";
import DataTable from "../components/DataTable";
import { fetchData } from "../api/uploadService";
import { useNavigate } from "react-router-dom";

function BatteryTyrePage() {
  const navigate = useNavigate();
  const [batterySummary, setBatterySummary] = useState([]);
  const [tyreSummary, setTyreSummary] = useState([]);
  const [batteryTyreSummary, setBatteryTyreSummary] = useState([]);
  const [months, setMonths] = useState([]);
  const [years, setYears] = useState([]);
  const [groupBy, setGroupBy] = useState("city");

  const monthOptions = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - i);

  // Aggregate data by group
  const filterColumnsByGroup = (data) => {
    const aggregated = {};
    data.forEach(row => {
      const key = groupBy === "city" ? row.city
                : groupBy === "branch" ? row.branch
                : row.city + " - " + row.branch;

      if (!aggregated[key]) aggregated[key] = { ...row };
      else {
        Object.keys(row).forEach(k => {
          if (k === "city" || k === "branch" || k === "oilType") return;
          aggregated[key][k] = (Number(aggregated[key][k]) || 0) + (Number(row[k]) || 0);
        });
      }
    });

    return Object.values(aggregated).map(row => {
      const filteredRow = { ...row };
      if (groupBy === "city") delete filteredRow.branch;
      if (groupBy === "branch") delete filteredRow.city;
      delete filteredRow.oilType;
      Object.keys(filteredRow).forEach(k => {
        if (typeof filteredRow[k] === "number") filteredRow[k] = filteredRow[k].toFixed(2);
      });
      return filteredRow;
    });
  };

  // Compute combined Battery & Tyre summary
  const computeBatteryTyreSummary = (batteryRaw, tyreRaw) => {
    const combinedData = [...batteryRaw, ...tyreRaw];
    const aggregated = {};

    combinedData.forEach(row => {
      const key = groupBy === "city" ? row.city
                : groupBy === "branch" ? row.branch
                : row.city + " - " + row.branch;

      if (!aggregated[key]) aggregated[key] = { profit: 0, netretailddl: 0 };
      aggregated[key].profit += Number(row.profit || 0);
      aggregated[key].netretailddl += Number(row.netretailddl || 0);
    });

    const summary = Object.entries(aggregated).map(([key, value]) => {
      const denominator = value.netretailddl || 0;

      // ✅ Fix: dynamic column key based on groupBy
      const groupKey =
        groupBy === "city" ? { city: key } :
        groupBy === "branch" ? { branch: key } :
        { city_branch: key };

      return {
        ...groupKey,
        profit: value.profit.toFixed(2),
        percentageProfit: denominator === 0 
          ? "0.00%" 
          : ((value.profit / denominator) * 100).toFixed(2) + "%"
      };
    });

    setBatteryTyreSummary(summary);
  };

  // Fetch data whenever months, years, or groupBy change
  useEffect(() => {
    const fetchDataAsync = async () => {
      try {
        let batteryCombined = [];
        let tyreCombined = [];

        // If no month/year selected, fetch all
        const selectedMonths = months.length > 0 ? months : [""];
        const selectedYears = years.length > 0 ? years : [""];

        for (const month of selectedMonths) {
          for (const year of selectedYears) {
            const query = `?groupBy=${groupBy}${month ? `&month=${month}` : ""}${year ? `&year=${year}` : ""}`;
            const [batteryDataRaw, tyreDataRaw] = await Promise.all([
              fetchData(`/api/battery_tyre/battery_summary${query}`),
              fetchData(`/api/battery_tyre/tyre_summary${query}`)
            ]);

            if (Array.isArray(batteryDataRaw)) batteryCombined = batteryCombined.concat(batteryDataRaw);
            if (Array.isArray(tyreDataRaw)) tyreCombined = tyreCombined.concat(tyreDataRaw);
          }
        }

        const batteryAggregated = filterColumnsByGroup(batteryCombined);
        const tyreAggregated = filterColumnsByGroup(tyreCombined);

        setBatterySummary(batteryAggregated);
        setTyreSummary(tyreAggregated);
        computeBatteryTyreSummary(batteryCombined, tyreCombined);

      } catch (err) {
        console.error(err);
        alert("❌ Error fetching Battery & Tyre: " + err.message);
      }
    };

    fetchDataAsync();
  }, [months, years, groupBy]);

  return (
    <Box className="battery-container" sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">BATTERY & TYRE REPORT</Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Months</InputLabel>
          <Select
            multiple
            value={months}
            onChange={(e) => setMonths(e.target.value)}
            renderValue={(selected) => selected.join(", ")}
          >
            {monthOptions.map(m => (
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
            {yearOptions.map(y => (
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
      </Box>

      <Box sx={{ overflowX: "auto", width: "100%" }}>
        <Box sx={{ display: "flex", gap: 0.1, flexWrap: "nowrap", minWidth: "1000px" }}>
          <Box sx={{ flex: 1 }}>
            <DataTable data={batterySummary} title="Battery Summary" />
          </Box>

          <Box sx={{ flex: 1 }}>
            <DataTable data={tyreSummary} title="Tyre Summary" />
          </Box>

          <Box sx={{ flex: 1 }}>
            <DataTable data={batteryTyreSummary} title="Battery & Tyre Summary" />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default BatteryTyrePage;
