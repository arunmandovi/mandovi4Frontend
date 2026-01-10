import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Typography, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
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

const BRANCHES_WITH_ALL = ["ALL", ...BRANCHES];

/* ---------------- COMPONENT ---------------- */
const SalesBarChartPage = () => {
  const navigate = useNavigate();

  /* -------- FILTER STATES -------- */
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [selectedChannels, setSelectedChannels] = useState([]);
  const [selectedBranches, setSelectedBranches] = useState([]);

  /* -------- RAW DATA -------- */
  const [chartRaw, setChartRaw] = useState([]);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const load = async () => {
      const months = selectedMonths.length ? selectedMonths : MONTHS;
      const years = selectedYears.length ? selectedYears : YEARS;
      let all = [];

      for (const m of months) {
        const query =
          `?months=${m}` +
          `&years=${years.join(",")}` +
          (selectedChannels.length ? `&channels=${selectedChannels.join(",")}` : "");

        const res = await fetchData(`/api/sales/sales_branch_summary${query}`);
        if (Array.isArray(res)) all.push(...res);
      }

      setChartRaw(all);
    };

    load();
  }, [selectedMonths, selectedYears, selectedChannels]);

  /* ================= BAR DATA (ALL + BRANCHES) ================= */
  const chartData = useMemo(() => {
    const branchTotals = {};
    let grandTotal = 0;

    chartRaw.forEach(r => {
      branchTotals[r.branch] = (branchTotals[r.branch] || 0) + (r.count || 0);
      grandTotal += r.count || 0;
    });

    const showAll = selectedBranches.includes("ALL");

    const branchesToShow =
      selectedBranches.filter(b => b !== "ALL").length
        ? selectedBranches.filter(b => b !== "ALL")
        : BRANCHES;

    const data = branchesToShow.map(b => ({
      branch: b,
      value: branchTotals[b] || 0,
    }));

    if (showAll) {
      data.unshift({
        branch: "ALL",
        value: grandTotal,
      });
    }

    return data;
  }, [chartRaw, selectedBranches]);

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

  /* ---------------- BRANCH CLICK HANDLER ---------------- */
  const handleBranchClick = branch => {
    setSelectedBranches(prev =>
      prev.includes(branch)
        ? prev.filter(b => b !== branch)
        : [...prev, branch]
    );
  };

  /* ---------------- RENDER ---------------- */
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">SALES</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/sales")}>
            Line Chart
          </Button>
          <Button variant="contained">Bar Chart</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/sales_table")}>
            Table
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6">Monthly Sales (Branch-wise)</Typography>

        {/* YEARS */}
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

        {/* CHANNELS */}
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

        {/* BRANCHES WITH ALL */}
        <Box sx={{ my: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
          {BRANCHES_WITH_ALL.map(b => (
            <Button
              key={b}
              size="small"
              sx={slicerStyle(selectedBranches.includes(b))}
              onClick={() => handleBranchClick(b)}
            >
              {b}
            </Button>
          ))}
        </Box>

        {/* MONTHS */}
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
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="branch" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#6840dfff" barSize={45}>
              <LabelList dataKey="value" position="top" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
};

export default SalesBarChartPage;
