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

const GenericBarChartPage = ({
  title,
  apiEndpoint,
  dataKey,
  yearsStart,
  branches,
  extraFilters = null,
  lineChartPath,
  tablePath,
  growthPath,
}) => {
  const navigate = useNavigate();

  /* -------- FILTER STATES -------- */
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [selectedChannels, setSelectedChannels] = useState([]);
  const [selectedExtra, setSelectedExtra] = useState([]);
  const [selectedBranches, setSelectedBranches] = useState([]);

  /* -------- RAW DATA -------- */
  const [chartRaw, setChartRaw] = useState([]);

  const MONTHS = ["APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC","JAN","FEB","MAR"];
  const CURRENT_YEAR = new Date().getFullYear();
  const YEARS = Array.from(
    { length: CURRENT_YEAR - yearsStart + 1 },
    (_, i) => String(yearsStart + i)
  );
  const CHANNELS = ["ARENA","NEXA"];
  const BRANCHES_WITH_ALL = ["ALL", ...branches];

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      const months = selectedMonths.length ? selectedMonths : MONTHS;
      const years = selectedYears.length ? selectedYears : YEARS;
      let all = [];

      for (const m of months) {
        const query =
          `?months=${m}` +
          `&years=${years.join(",")}` +
          (selectedChannels.length ? `&channels=${selectedChannels.join(",")}` : "") +
          (extraFilters && selectedExtra.length ? `&${extraFilters.queryKey}=${selectedExtra.join(",")}` : "");

        try {
          const res = await fetchData(`${apiEndpoint}${query}`);
          if (Array.isArray(res)) all.push(...res);
        } catch (error) {
          console.error('Fetch error:', error);
        }
      }

      if (isMounted) {
        setChartRaw(all);
      }
    };

    load();
    return () => { isMounted = false; };
  }, [selectedMonths, selectedYears, selectedChannels, selectedExtra, extraFilters]);

  /* ================= BAR DATA (ALL + BRANCHES) ================= */
  const chartData = useMemo(() => {
    const branchTotals = {};
    let grandTotal = 0;

    chartRaw.forEach(r => {
      branchTotals[r.branch] = (branchTotals[r.branch] || 0) + (r[dataKey] || 0);
      grandTotal += r[dataKey] || 0;
    });

    const showAll = selectedBranches.includes("ALL");
    const branchesToShow =
      selectedBranches.filter(b => b !== "ALL").length
        ? selectedBranches.filter(b => b !== "ALL")
        : branches;

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
  }, [chartRaw, selectedBranches, dataKey, branches]);

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
        <Typography variant="h4">{title}</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" onClick={() => navigate(lineChartPath)}>Line Chart</Button>
          <Button variant="contained">Bar Chart</Button>
          <Button variant="contained" onClick={() => navigate(tablePath)}>Table</Button>
          <Button variant="contained" onClick={() => navigate(growthPath)}>Growth</Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6">Monthly {title} (Branch-wise)</Typography>

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

        {/* EXTRA FILTERS (Service Codes) */}
        {extraFilters && (
          <Box sx={{ my: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
            {extraFilters.options.map(s => (
              <Button key={s} size="small" sx={slicerStyle(selectedExtra.includes(s))}
                onClick={() =>
                  setSelectedExtra(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s])
                }>
                {s}
              </Button>
            ))}
          </Box>
        )}

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

export default GenericBarChartPage;
