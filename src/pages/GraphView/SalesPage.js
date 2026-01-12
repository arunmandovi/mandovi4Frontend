import React, { useEffect, useMemo, useState } from "react";
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
  Legend,
  LabelList,
} from "recharts";
import { fetchData } from "../../api/uploadService";

/* ---------------- CONSTANTS ---------------- */
const MONTHS = ["APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC","JAN","FEB","MAR"];
const START_YEAR = 2005;
const CURRENT_YEAR = new Date().getFullYear();

const YEARS = Array.from(
  { length: CURRENT_YEAR - START_YEAR + 1 },
  (_, i) => String(START_YEAR + i)
);

const CHANNELS = ["ARENA","NEXA"];
const BRANCHES = [
  "Balmatta","Uppinangady","Surathkal","Sullia",
  "Bantwal","Nexa","Kadaba","Vittla"
];

const ALL_BRANCH = "ALL";

const BRANCH_COLORS = {
  ALL: "#000000",
  Balmatta: "#1f77b4",
  Uppinangady: "#ff7f0e",
  Surathkal: "#2ca02c",
  Sullia: "#d62728",
  Bantwal: "#9467bd",
  Nexa: "#8c564b",
  Kadaba: "#e377c2",
  Vittla: "#7f7f7f",
};

/* ---------------- COMPONENT ---------------- */
const SalesPage = () => {
  const navigate = useNavigate();

  /* -------- FILTER STATES (UNCHANGED) -------- */
  const [yearFilter1, setYearFilter1] = useState([]);
  const [channelFilter1, setChannelFilter1] = useState([]);
  const [branchFilter1, setBranchFilter1] = useState([]);

  const [selectedMonths, setSelectedMonths] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [selectedChannels, setSelectedChannels] = useState([]);
  const [selectedBranches, setSelectedBranches] = useState([]);

  /* -------- RAW DATA -------- */
  const [chart1Raw, setChart1Raw] = useState([]);
  const [chart2Raw, setChart2Raw] = useState([]);

  /* ================= CHART 1 – YEAR WISE ================= */
  useEffect(() => {
    const load = async () => {
      const years = yearFilter1.length ? yearFilter1 : YEARS;
      let all = [];

      for (const y of years) {
        const query =
          `?years=${y}` +
          (channelFilter1.length ? `&channels=${channelFilter1.join(",")}` : "");

        const res = await fetchData(`/api/sales/sales_branch_summary${query}`);
        if (Array.isArray(res)) {
          all.push(...res.map(r => ({ ...r, year: y })));
        }
      }
      setChart1Raw(all);
    };
    load();
  }, [yearFilter1, channelFilter1]);

  /* ================= TOOLTIP ================= */
  const SortedTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;

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

  /* ================= CHART 2 – MONTH WISE ================= */
  useEffect(() => {
    const load = async () => {
      const months = selectedMonths.length ? selectedMonths : MONTHS;
      const years = selectedYears.length ? selectedYears : YEARS;
      let all = [];

      for (const m of months) {
        const query =
          `?months=${m}&years=${years.join(",")}` +
          (selectedChannels.length ? `&channels=${selectedChannels.join(",")}` : "");

        const res = await fetchData(`/api/sales/sales_branch_summary${query}`);
        if (Array.isArray(res)) {
          all.push(...res.map(r => ({ ...r, month: m })));
        }
      }
      setChart2Raw(all);
    };
    load();
  }, [selectedMonths, selectedYears, selectedChannels]);

  /* ================= YEARLY TRANSFORM ================= */
  const chart1Data = useMemo(() => {
    const showAll = branchFilter1.includes(ALL_BRANCH);
    const branches = branchFilter1.filter(b => b !== ALL_BRANCH);
    const activeBranches = branches.length ? branches : BRANCHES;

    const map = {};

    chart1Raw.forEach(r => {
      if (!map[r.year]) map[r.year] = { year: r.year };

      if (activeBranches.includes(r.branch)) {
        map[r.year][r.branch] = (map[r.year][r.branch] || 0) + r.count;
        if (showAll) {
          map[r.year][ALL_BRANCH] = (map[r.year][ALL_BRANCH] || 0) + r.count;
        }
      }
    });

    return Object.values(map);
  }, [chart1Raw, branchFilter1]);

  /* ================= MONTHLY TRANSFORM ================= */
  const chart2Data = useMemo(() => {
    const showAll = selectedBranches.includes(ALL_BRANCH);
    const branches = selectedBranches.filter(b => b !== ALL_BRANCH);
    const activeBranches = branches.length ? branches : BRANCHES;

    const map = {};

    chart2Raw.forEach(r => {
      if (!map[r.month]) map[r.month] = { month: r.month };

      if (activeBranches.includes(r.branch)) {
        map[r.month][r.branch] = (map[r.month][r.branch] || 0) + r.count;
        if (showAll) {
          map[r.month][ALL_BRANCH] = (map[r.month][ALL_BRANCH] || 0) + r.count;
        }
      }
    });

    const months = selectedMonths.length ? selectedMonths : MONTHS;
    return months.map(m => map[m] || { month: m });
  }, [chart2Raw, selectedBranches, selectedMonths]);

  /* ---------------- UI STYLE ---------------- */
  const slicerStyle = selected => ({
    borderRadius: 20,
    fontWeight: 600,
    textTransform: "none",
    px: 2,
    background: selected ? "#c8e6c9" : "#fff",
    border: "1px solid #9ccc65",
    "&:hover": { background: "#aed581" },
  });

  /* ---------------- RENDER ---------------- */
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">SALES</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained">Line Chart</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/sales-bar-chart")}>Bar Chart</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/sales_table")}>Table</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/sales_growth")}>Growth</Button>
        </Box>
      </Box>

      {/* ================== YEARLY ================== */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Typography variant="h6">Yearly Sales</Typography>

        {/* YEAR */}
        <Box sx={{ my: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
          {YEARS.map(y => (
            <Button key={y} size="small" sx={slicerStyle(yearFilter1.includes(y))}
              onClick={() =>
                setYearFilter1(p => p.includes(y) ? p.filter(x => x !== y) : [...p, y])
              }>
              {y}
            </Button>
          ))}
        </Box>

        {/* CHANNEL */}
        <Box sx={{ my: 2, display: "flex", gap: 1 }}>
          {CHANNELS.map(c => (
            <Button key={c} size="small" sx={slicerStyle(channelFilter1.includes(c))}
              onClick={() =>
                setChannelFilter1(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c])
              }>
              {c}
            </Button>
          ))}
        </Box>

        {/* BRANCH */}
        <Box sx={{ my: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
          {[ALL_BRANCH, ...BRANCHES].map(b => (
            <Button key={b} size="small" sx={slicerStyle(branchFilter1.includes(b))}
              onClick={() =>
                setBranchFilter1(p => p.includes(b) ? p.filter(x => x !== b) : [...p, b])
              }>
              {b}
            </Button>
          ))}
        </Box>

        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chart1Data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip content={<SortedTooltip />} />
            {(branchFilter1.includes(ALL_BRANCH)
              ? [ALL_BRANCH, ...BRANCHES]
              : branchFilter1.length ? branchFilter1 : BRANCHES
            ).map(b => (
              <Line key={b} dataKey={b} stroke={BRANCH_COLORS[b]} strokeWidth={b === ALL_BRANCH ? 4 : 3}>
                <LabelList dataKey={b} position="top" />
              </Line>
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Paper>

      {/* ================== MONTHLY ================== */}
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6">Monthly Sales</Typography>

        {/* YEAR */}
        <Box sx={{ my: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
          {YEARS.map(y => (
            <Button key={y} size="small" sx={slicerStyle(selectedYears.includes(y))}
              onClick={() =>
                setSelectedYears(p => p.includes(y) ? p.filter(x => x !== y) : [...p, y])
              }>
              {y}
            </Button>
          ))}
        </Box>

        {/* CHANNEL */}
        <Box sx={{ my: 2, display: "flex", gap: 1 }}>
          {CHANNELS.map(c => (
            <Button key={c} size="small" sx={slicerStyle(selectedChannels.includes(c))}
              onClick={() =>
                setSelectedChannels(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c])
              }>
              {c}
            </Button>
          ))}
        </Box>

        {/* BRANCH */}
        <Box sx={{ my: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
          {[ALL_BRANCH, ...BRANCHES].map(b => (
            <Button key={b} size="small" sx={slicerStyle(selectedBranches.includes(b))}
              onClick={() =>
                setSelectedBranches(p => p.includes(b) ? p.filter(x => x !== b) : [...p, b])
              }>
              {b}
            </Button>
          ))}
        </Box>

        {/* MONTH */}
        <Box sx={{ my: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
          {MONTHS.map(m => (
            <Button key={m} size="small" sx={slicerStyle(selectedMonths.includes(m))}
              onClick={() =>
                setSelectedMonths(p => p.includes(m) ? p.filter(x => x !== m) : [...p, m])
              }>
              {m}
            </Button>
          ))}
        </Box>

        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chart2Data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip content={<SortedTooltip />} />
            {(selectedBranches.includes(ALL_BRANCH)
              ? [ALL_BRANCH, ...BRANCHES]
              : selectedBranches.length ? selectedBranches : BRANCHES
            ).map(b => (
              <Line key={b} dataKey={b} stroke={BRANCH_COLORS[b]} strokeWidth={b === ALL_BRANCH ? 4 : 3}>
                <LabelList dataKey={b} position="top" />
              </Line>
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
};

export default SalesPage;
