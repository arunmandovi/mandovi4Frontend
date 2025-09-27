import React, { useState, useEffect } from "react";
import { 
  Box, Select, MenuItem, FormControl, InputLabel, Typography, Checkbox, ListItemText 
} from "@mui/material";
import DataTable from "../components/DataTable";
import { fetchData } from "../api/uploadService";

function BatteryTyrePage() {
  const [batterySummary, setBatterySummary] = useState([]);
  const [tyreSummary, setTyreSummary] = useState([]);
  const [batteryTyreSummary, setBatteryTyreSummary] = useState([]);
  const [months, setMonths] = useState([]);
  const [years, setYears] = useState([]);
  const [groupBy, setGroupBy] = useState("city");

  const monthOptions = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - i);

  const filterColumnsByGroup = (data) => {
    // Sum numeric values for each group (grouped by groupBy)
    const aggregated = {};

    data.forEach(row => {
      const key = groupBy === "city" ? row.city
                : groupBy === "branch" ? row.branch
                : row.city + " - " + row.branch;

      if (!aggregated[key]) aggregated[key] = { ...row };
      else {
        Object.keys(row).forEach(k => {
          if (k === "city" || k === "branch") return;
          const val = Number(row[k]) || 0;
          aggregated[key][k] = (Number(aggregated[key][k]) || 0) + val;
        });
      }
    });

    return Object.values(aggregated).map(row => {
      const filteredRow = { ...row };
      if (groupBy === "city") delete filteredRow.branch;
      if (groupBy === "branch") delete filteredRow.city;

      // Format numbers
      Object.keys(filteredRow).forEach(key => {
        if (typeof filteredRow[key] === "number") {
          filteredRow[key] = key === "percentageProfit" 
            ? filteredRow[key].toFixed(2) + "%" 
            : filteredRow[key].toFixed(2);
        }
      });

      // Calculate percentageProfit per row
      if (row.profit && row.totalddl) {
        filteredRow.percentageProfit = ((row.profit / row.totalddl) * 100).toFixed(2) + "%";
      }

      return filteredRow;
    });
  };

  const computeBatteryTyreSummary = (battery, tyre) => {
    const totalProfitBattery = battery.reduce((sum, r) => sum + Number(r.profit || 0), 0);
    const totalProfitTyre = tyre.reduce((sum, r) => sum + Number(r.profit || 0), 0);
    const totalDDL_Battery = battery.reduce((sum, r) => sum + Number(r.totalddl || 0), 0);
    const totalDDL_Tyre = tyre.reduce((sum, r) => sum + Number(r.totalddl || 0), 0);

    const combinedProfit = totalProfitBattery + totalProfitTyre;
    const combinedTotalDDL = totalDDL_Battery + totalDDL_Tyre;
    const combinedProfitPercent = combinedTotalDDL === 0 ? 0 : (combinedProfit / combinedTotalDDL) * 100;

    setBatteryTyreSummary([{
      profit: combinedProfit.toFixed(2),
      percentageProfit: combinedProfitPercent.toFixed(2) + "%"
    }]);
  };

  useEffect(() => {
    const fetchDataAsync = async () => {
      try {
        const yearStr = years.join(",");
        let batteryCombined = [];
        let tyreCombined = [];

        for (const month of months.length > 0 ? months : [""]) {
          const query = `?groupBy=${groupBy}${month ? `&month=${month}` : ""}${yearStr ? `&year=${yearStr}` : ""}`;

          const [batteryDataRaw, tyreDataRaw] = await Promise.all([
            fetchData(`/api/battery_tyre/battery_summary${query}`),
            fetchData(`/api/battery_tyre/tyre_summary${query}`)
          ]);

          const batteryData = Array.isArray(batteryDataRaw) ? batteryDataRaw : [];
          const tyreData = Array.isArray(tyreDataRaw) ? tyreDataRaw : [];

          batteryCombined = batteryCombined.concat(batteryData.map(({ oilType, ...rest }) => rest));
          tyreCombined = tyreCombined.concat(tyreData.map(({ oilType, ...rest }) => rest));
        }

        const batteryAggregated = filterColumnsByGroup(batteryCombined);
        const tyreAggregated = filterColumnsByGroup(tyreCombined);

        setBatterySummary(batteryAggregated);
        setTyreSummary(tyreAggregated);
        computeBatteryTyreSummary(batteryAggregated, tyreAggregated);

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
        <Typography variant="h4">Battery & Tyre</Typography>
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

      <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
        <Box sx={{ flex: 1, minWidth: 300, maxHeight: 500, overflowY: "auto" }}>
          <DataTable data={batterySummary} title="Battery Summary" />
        </Box>

        <Box sx={{ flex: 1, minWidth: 300, maxHeight: 500, overflowY: "auto" }}>
          <DataTable data={tyreSummary} title="Tyre Summary" />
        </Box>

        <Box sx={{ flex: 1, minWidth: 300, maxHeight: 200, overflowY: "auto" }}>
          <DataTable data={batteryTyreSummary} title="Battery & Tyre Summary" />
        </Box>
      </Box>
    </Box>
  );
}

export default BatteryTyrePage;
