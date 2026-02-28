// Optimized GenericChartPage.jsx - FAST like original
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Box, Button, Typography, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LabelList,
} from "recharts";
import { fetchData } from "../../api/uploadService";

const GenericChartPage = ({
  title,
  apiPrefix,
  yearsStart,
  branches,
  branchColors,
  extraFilterOptions = null,
  dataValueKey = "count",
  barChartPath,
  tablePath,
  growthPath,
}) => {
  const navigate = useNavigate();

  // Chart 1 filters (Yearly) - SAME as original
  const [yearFilter1, setYearFilter1] = useState([]);
  const [channelFilter1, setChannelFilter1] = useState([]);
  const [extraFilter1, setExtraFilter1] = useState([]);
  const [branchFilter1, setBranchFilter1] = useState([]);

  // Chart 2 filters (Monthly) - SAME as original
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [selectedChannels, setSelectedChannels] = useState([]);
  const [selectedExtra, setSelectedExtra] = useState([]);
  const [selectedBranches, setSelectedBranches] = useState([]);

  const [chart1Raw, setChart1Raw] = useState([]);
  const [chart2Raw, setChart2Raw] = useState([]);

  const MONTHS = ["APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC","JAN","FEB","MAR"];
  const CURRENT_YEAR = new Date().getFullYear();
  const YEARS = useMemo(() => 
    Array.from({ length: CURRENT_YEAR - yearsStart + 1 }, (_, i) => String(yearsStart + i)),
    [yearsStart]
  );
  const CHANNELS = ["ARENA","NEXA"];
  const ALL_BRANCH = "ALL";
  const BRANCH_COLORS_FULL = { ...branchColors, [ALL_BRANCH]: "#000000" };

  /* ================= CHART 1 – YEARLY (SAME AS ORIGINAL) ================= */
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      const years = yearFilter1.length ? yearFilter1 : YEARS;
      let all = [];

      // ✅ SAME AS ORIGINAL: 1 call per year
      for (const y of years) {
        const query = `?years=${y}` +
          (channelFilter1.length ? `&channels=${channelFilter1.join(",")}` : "") +
          (extraFilterOptions && extraFilter1.length ? `&serviceCodes=${extraFilter1.join(",")}` : "");

        try {
          const res = await fetchData(`/api/${apiPrefix}/${apiPrefix}_branch_summary${query}`);
          if (Array.isArray(res)) {
            all.push(...res.map(r => ({ ...r, year: y })));
          }
        } catch (error) {
          console.error('Chart 1 fetch error:', error);
        }
      }
      if (isMounted) setChart1Raw(all);
    };
    load();
    return () => { isMounted = false; };
  }, [yearFilter1, channelFilter1, extraFilter1, apiPrefix, YEARS, extraFilterOptions]);

  /* ================= CHART 2 – MONTHLY (FIXED: SAME AS ORIGINAL) ================= */
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      const months = selectedMonths.length ? selectedMonths : MONTHS;
      const years = selectedYears.length ? selectedYears : YEARS;
      let all = [];

      // ✅ FIXED: Loop months FIRST, then years IN ONE CALL (like original)
      for (const m of months) {
        const query = `?months=${m}&years=${years.join(",")}` +  // ✅ Multiple years in ONE call
          (selectedChannels.length ? `&channels=${selectedChannels.join(",")}` : "") +
          (extraFilterOptions && selectedExtra.length ? `&serviceCodes=${selectedExtra.join(",")}` : "");

        try {
          const res = await fetchData(`/api/${apiPrefix}/${apiPrefix}_branch_summary${query}`);
          if (Array.isArray(res)) {
            all.push(...res.map(r => ({ ...r, month: m })));  // ✅ Force month like original
          }
        } catch (error) {
          console.error('Chart 2 fetch error:', error);
        }
      }
      if (isMounted) setChart2Raw(all);
    };
    load();
    return () => { isMounted = false; };
  }, [selectedMonths, selectedYears, selectedChannels, selectedExtra, apiPrefix, extraFilterOptions]);

  // Rest of component remains SAME (tooltip, transforms, render helpers)
  const SortedTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.[0]) return null;
    const sorted = [...payload]
      .filter(p => p.value != null)
      .sort((a, b) => b.value - a.value);
    return (
      <Paper sx={{ p: 1.5 }}>
        <Typography variant="subtitle2">{label}</Typography>
        {sorted.map(p => (
          <Box key={p.dataKey} sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2">{p.dataKey}</Typography>
            <Typography variant="body2" fontWeight={600}>{p.value}</Typography>
          </Box>
        ))}
      </Paper>
    );
  };

  const chart1Data = useMemo(() => {
    const showAll = branchFilter1.includes(ALL_BRANCH);
    const branchesFiltered = branchFilter1.filter(b => b !== ALL_BRANCH);
    const activeBranches = branchesFiltered.length ? branchesFiltered : branches;
    const map = {};
    chart1Raw.forEach(r => {
      if (!map[r.year]) map[r.year] = { year: r.year };
      if (activeBranches.includes(r.branch)) {
        const value = r[dataValueKey] || 0;
        map[r.year][r.branch] = (map[r.year][r.branch] || 0) + value;
        if (showAll) map[r.year][ALL_BRANCH] = (map[r.year][ALL_BRANCH] || 0) + value;
      }
    });
    return Object.values(map);
  }, [chart1Raw, branchFilter1, branches, dataValueKey]);

  const chart2Data = useMemo(() => {
    const showAll = selectedBranches.includes(ALL_BRANCH);
    const branchesFiltered = selectedBranches.filter(b => b !== ALL_BRANCH);
    const activeBranches = branchesFiltered.length ? branchesFiltered : branches;
    const map = {};
    chart2Raw.forEach(r => {
      const monthKey = r.month;
      if (!monthKey) return;
      if (!map[monthKey]) map[monthKey] = { month: monthKey };
      if (activeBranches.includes(r.branch)) {
        const value = r[dataValueKey] || 0;
        map[monthKey][r.branch] = (map[monthKey][r.branch] || 0) + value;
        if (showAll) map[monthKey][ALL_BRANCH] = (map[monthKey][ALL_BRANCH] || 0) + value;
      }
    });
    const months = selectedMonths.length ? selectedMonths : MONTHS;
    return months.map(m => map[m] || { month: m });
  }, [chart2Raw, selectedBranches, selectedMonths, branches, dataValueKey, MONTHS]);

  const slicerStyle = selected => ({
    borderRadius: 20, fontWeight: 600, textTransform: "none", px: 2,
    background: selected ? "#c8e6c9" : "#fff", border: "1px solid #9ccc65",
    "&:hover": { background: "#aed581" },
  });

  const renderFilterButtons = useCallback((options, selected, setSelected) => (
    <Box sx={{ my: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
      {options.map(item => (
        <Button
          key={item}
          size="small"
          sx={slicerStyle(selected.includes(item))}
          onClick={() => setSelected(p => p.includes(item) ? p.filter(x => x !== item) : [...p, item])}
        >
          {item}
        </Button>
      ))}
    </Box>
  ), []);

  const renderBranchButtons = useCallback((selectedBranchesState, setSelectedBranchesState) => (
    <Box sx={{ my: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
      {[ALL_BRANCH, ...branches].map(b => (
        <Button
          key={b}
          size="small"
          sx={slicerStyle(selectedBranchesState.includes(b))}
          onClick={() => setSelectedBranchesState(p => p.includes(b) ? p.filter(x => x !== b) : [...p, b])}
        >
          {b}
        </Button>
      ))}
    </Box>
  ), [branches]);

  const getActiveBranchesForChart = selectedBranches =>
    selectedBranches.includes(ALL_BRANCH)
      ? [ALL_BRANCH, ...branches]
      : selectedBranches.length ? selectedBranches.filter(b => b !== ALL_BRANCH) : branches;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">{title}</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained">Line Chart</Button>
          <Button variant="contained" onClick={() => navigate(`/DashboardHome/${barChartPath}`)}>Bar Chart</Button>
          <Button variant="contained" onClick={() => navigate(`/DashboardHome/${tablePath}`)}>Table</Button>
          <Button variant="contained" onClick={() => navigate(`/DashboardHome/${growthPath}`)}>Growth</Button>
        </Box>
      </Box>

      {/* YEARLY CHART */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Typography variant="h6">Yearly {title}</Typography>
        {renderFilterButtons(YEARS, yearFilter1, setYearFilter1)}
        {renderFilterButtons(CHANNELS, channelFilter1, setChannelFilter1)}
        {extraFilterOptions && renderFilterButtons(extraFilterOptions, extraFilter1, setExtraFilter1)}
        {renderBranchButtons(branchFilter1, setBranchFilter1)}
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chart1Data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip content={<SortedTooltip />} />
            {getActiveBranchesForChart(branchFilter1).map(b => (
              <Line key={b} dataKey={b} stroke={BRANCH_COLORS_FULL[b] || "#999"} strokeWidth={b === ALL_BRANCH ? 4 : 3}>
                <LabelList dataKey={b} position="top" />
              </Line>
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Paper>

      {/* MONTHLY CHART */}
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6">Monthly {title}</Typography>
        {renderFilterButtons(YEARS, selectedYears, setSelectedYears)}
        {renderFilterButtons(CHANNELS, selectedChannels, setSelectedChannels)}
        {extraFilterOptions && renderFilterButtons(extraFilterOptions, selectedExtra, setSelectedExtra)}
        {renderBranchButtons(selectedBranches, setSelectedBranches)}
        {renderFilterButtons(MONTHS, selectedMonths, setSelectedMonths)}
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chart2Data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip content={<SortedTooltip />} />
            {getActiveBranchesForChart(selectedBranches).map(b => (
              <Line key={b} dataKey={b} stroke={BRANCH_COLORS_FULL[b] || "#999"} strokeWidth={b === ALL_BRANCH ? 4 : 3}>
                <LabelList dataKey={b} position="top" />
              </Line>
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
};

export default GenericChartPage;
