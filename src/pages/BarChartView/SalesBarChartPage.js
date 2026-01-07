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
const BRANCHES = ["Balmatta","Uppinangady","Surathkal","Sullia","Bantwal","Nexa","Kadaba","Vittla"];

/* ---------------- COMPONENT ---------------- */
const SalesBarChartPage = () => {
  const navigate = useNavigate();

  const [yearFilter1, setYearFilter1] = useState([]);
  const [channelFilter1, setChannelFilter1] = useState([]);
  const [branchFilter1, setBranchFilter1] = useState([]);

  const [selectedMonths, setSelectedMonths] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [selectedChannels, setSelectedChannels] = useState([]);
  const [selectedBranches, setSelectedBranches] = useState([]);

  const [chart1Data, setChart1Data] = useState([]);
  const [chart2Raw, setChart2Raw] = useState([]);

  /* ================= CHART 1 – YEAR WISE ================= */
  useEffect(() => {
    const load = async () => {
      const years = yearFilter1.length ? yearFilter1 : YEARS;
      const result = [];

      for (const y of years) {
        const query =
          `?years=${y}` +
          (channelFilter1.length ? `&channels=${channelFilter1.join(",")}` : "");

        const res = await fetchData(`/api/sales/sales_branch_summary${query}`);

        const filtered = Array.isArray(res)
          ? res.filter(r =>
              !branchFilter1.length || branchFilter1.includes(r.branch)
            )
          : [];

        const total = filtered.reduce((sum, r) => sum + (r.count || 0), 0);
        result.push({ year: y, value: total });
      }

      setChart1Data(result);
    };

    load();
  }, [yearFilter1, channelFilter1, branchFilter1]);

  /* ================= CHART 2 – MONTH WISE ================= */
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

        if (Array.isArray(res)) {
          const filtered = res.filter(r =>
            !selectedBranches.length || selectedBranches.includes(r.branch)
          );
          all.push(...filtered.map(r => ({ ...r, month: m })));
        }
      }

      setChart2Raw(all);
    };

    load();
  }, [selectedMonths, selectedYears, selectedChannels, selectedBranches]);

  const chart2Data = useMemo(() => {
    const map = {};
    chart2Raw.forEach(r => {
      map[r.month] = (map[r.month] || 0) + (r.count || 0);
    });

    return MONTHS.map(m => ({
      month: m,
      value: map[m] || 0,
    }));
  }, [chart2Raw]);

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
      {/* HEADER */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">SALES</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/sales")}>
            Line Chart
          </Button>
          <Button variant="contained">
            Bar Chart
          </Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/sales_table")}>
            Table
          </Button>
        </Box>
      </Box>

      {/* ================== CHART 1 ================== */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Yearly Sales
        </Typography>

        <Box sx={{ mb: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
          {YEARS.map(y => (
            <Button
              key={y}
              size="small"
              sx={slicerStyle(yearFilter1.includes(y))}
              onClick={() =>
                setYearFilter1(p =>
                  p.includes(y) ? p.filter(x => x !== y) : [...p, y]
                )
              }
            >
              {y}
            </Button>
          ))}
        </Box>

        <Box sx={{ mb: 2, display: "flex", gap: 1 }}>
          {CHANNELS.map(c => (
            <Button
              key={c}
              size="small"
              sx={slicerStyle(channelFilter1.includes(c))}
              onClick={() =>
                setChannelFilter1(p =>
                  p.includes(c) ? p.filter(x => x !== c) : [...p, c]
                )
              }
            >
              {c}
            </Button>
          ))}
        </Box>

        <Box sx={{ mb: 3, display: "flex", gap: 1, flexWrap: "wrap" }}>
          {BRANCHES.map(b => (
            <Button
              key={b}
              size="small"
              sx={slicerStyle(branchFilter1.includes(b))}
              onClick={() =>
                setBranchFilter1(p =>
                  p.includes(b) ? p.filter(x => x !== b) : [...p, b]
                )
              }
            >
              {b}
            </Button>
          ))}
        </Box>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chart1Data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#6e56e6ff" barSize={60}>
              <LabelList dataKey="value" position="top" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      {/* ================== CHART 2 ================== */}
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Monthly Sales
        </Typography>

        <Box sx={{ mb: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
          {YEARS.map(y => (
            <Button
              key={y}
              size="small"
              sx={slicerStyle(selectedYears.includes(y))}
              onClick={() =>
                setSelectedYears(p =>
                  p.includes(y) ? p.filter(x => x !== y) : [...p, y]
                )
              }
            >
              {y}
            </Button>
          ))}
        </Box>

        <Box sx={{ mb: 2, display: "flex", gap: 1 }}>
          {CHANNELS.map(c => (
            <Button
              key={c}
              size="small"
              sx={slicerStyle(selectedChannels.includes(c))}
              onClick={() =>
                setSelectedChannels(p =>
                  p.includes(c) ? p.filter(x => x !== c) : [...p, c]
                )
              }
            >
              {c}
            </Button>
          ))}
        </Box>

        <Box sx={{ mb: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
          {BRANCHES.map(b => (
            <Button
              key={b}
              size="small"
              sx={slicerStyle(selectedBranches.includes(b))}
              onClick={() =>
                setSelectedBranches(p =>
                  p.includes(b) ? p.filter(x => x !== b) : [...p, b]
                )
              }
            >
              {b}
            </Button>
          ))}
        </Box>

        <Box sx={{ mb: 3, display: "flex", gap: 1, flexWrap: "wrap" }}>
          {MONTHS.map(m => (
            <Button
              key={m}
              size="small"
              sx={slicerStyle(selectedMonths.includes(m))}
              onClick={() =>
                setSelectedMonths(p =>
                  p.includes(m) ? p.filter(x => x !== m) : [...p, m]
                )
              }
            >
              {m}
            </Button>
          ))}
        </Box>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chart2Data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#6840dfff" barSize={60}>
              <LabelList dataKey="value" position="top" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
};

export default SalesBarChartPage;
