import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Typography, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart,
  Line,
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
const START_YEAR = 2019;
const CURRENT_YEAR = new Date().getFullYear();

const YEARS = Array.from(
  { length: CURRENT_YEAR - START_YEAR + 1 },
  (_, i) => String(START_YEAR + i)
);

const CHANNELS = ["ARENA", "NEXA"];
const SERVICECODES = ["PMS20", "PMS30", "PMS40", "PMS50", "MORE THAN PMS50"]; // ✅ ADDED
const BRANCHES = [
  "Balmatta","Uppinangady","Surathkal","Sullia","Adyar","Sujith Bagh Lane", 
  "Naravi","Bantwal","Nexa Service","Kadaba","Vittla", "Yeyyadi BR"
];

const ALL_BRANCH = "ALL";

const BRANCH_COLORS = {
  ALL: "#000000",
  Balmatta: "#1f77b4",
  Uppinangady: "#ff7f0e",
  Surathkal: "#2ca02c",
  Sullia: "#d62728",
  Adyar: "#17becf",
  "Sujith Bagh Lane": "#bcbd22",
  Naravi: "#ff9896",
  Bantwal: "#9467bd",
  "Nexa Service": "#8c564b",
  Kadaba: "#e377c2",
  Vittla: "#7f7f7f",
  "Yeyyadi BR": "#98df8a",
};

/* ---------------- COMPONENT ---------------- */
const ServiceeGrowthPage = () => {
  const navigate = useNavigate();

  const [yearFilter, setYearFilter] = useState([]);
  const [channelFilter, setChannelFilter] = useState([]);
  const [serviceCodesFilter, setServiceCodesFilter] = useState([]); // ✅ ADDED
  const [branchFilter, setBranchFilter] = useState([]);
  const [rawData, setRawData] = useState([]);

  /* ================= DATA LOAD ================= */
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      const yearsToLoad = yearFilter.length ? yearFilter : YEARS;
      let merged = [];

      for (const year of yearsToLoad) {
        const channelParams = channelFilter.length
          ? "&" + channelFilter.map((c) => `channels=${c}`).join("&")
          : "";
        const serviceCodesParams = serviceCodesFilter.length
          ? "&" + serviceCodesFilter.map((s) => `serviceCodes=${s}`).join("&")
          : ""; // ✅ ADDED

        try {
          const res = await fetchData(
            `/api/servicee/servicee_branch_summary?years=${year}${channelParams}${serviceCodesParams}`
          );

          if (Array.isArray(res)) {
            res.forEach((r) => {
              merged.push({
                year,
                branch: r.branch,
                serviceLoadd: r.serviceLoadd,
              });
            });
          }
        } catch (error) {
          console.error('Fetch error:', error);
        }
      }

      if (isMounted) {
        setRawData(merged);
      }
    };

    load();
    return () => { isMounted = false; };
  }, [yearFilter, channelFilter, serviceCodesFilter]); // ✅ ADDED

  /* ================= TRANSFORM DATA (YEAR-OVER-YEAR GROWTH %) ================= */
  const chartData = useMemo(() => {
    const showAll = branchFilter.includes(ALL_BRANCH);
    const selectedBranches =
      branchFilter.length === 0
        ? BRANCHES
        : branchFilter.filter((b) => b !== ALL_BRANCH);

    const branchesToProcess = showAll ? BRANCHES : selectedBranches;

    const prevYearMap = {};
    const yearMap = {};

    const sortedData = [...rawData].sort((a, b) => Number(a.year) - Number(b.year));

    sortedData.forEach((r) => {
      if (!branchesToProcess.includes(r.branch)) return;

      if (!yearMap[r.year]) yearMap[r.year] = { year: r.year };

      const prevServiceLoadd = prevYearMap[r.branch];
      yearMap[r.year][r.branch] =
        prevServiceLoadd !== undefined ? Number(((r.serviceLoadd - prevServiceLoadd) / prevServiceLoadd) * 100).toFixed(2) : 0;

      prevYearMap[r.branch] = r.serviceLoadd;
    });

    if (showAll) {
      let prevCombined = null;
      Object.keys(yearMap)
        .sort((a, b) => Number(a) - Number(b))
        .forEach((yr) => {
          const combined = BRANCHES.reduce((sum, br) => {
            const val = sortedData.find((d) => d.year === yr && d.branch === br)?.serviceLoadd || 0;
            return sum + val;
          }, 0);
          yearMap[yr]["ALL"] =
            prevCombined !== null ? Number(((combined - prevCombined) / prevCombined) * 100).toFixed(2) : 0;
          prevCombined = combined;
        });
    }

    return Object.values(yearMap).sort((a, b) => Number(a.year) - Number(b.year));
  }, [rawData, branchFilter]);

  /* ================= TOOLTIP ================= */
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;

    return (
      <Paper sx={{ p: 1.5 }}>
        <Typography variant="subtitle2">Year: {label}</Typography>
        {payload.map((p) => (
          <Box key={p.dataKey} sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2">{p.dataKey}</Typography>
            <Typography
              variant="body2"
              fontWeight={600}
              color={p.value < 0 ? "error.main" : "success.main"}
            >
              {p.value}%
            </Typography>
          </Box>
        ))}
      </Paper>
    );
  };

  const slicerStyle = (selected) => ({
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
        <Typography variant="h4">SERVICE GROWTH % (YEAR VS BRANCH)</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/servicee")}>
            Line Chart
          </Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/servicee-bar-chart")}>
            Bar Chart
          </Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/servicee_table")}>
            Table
          </Button>
          <Button variant="contained">Growth</Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
        {/* YEAR FILTER */}
        <Box sx={{ my: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
          {YEARS.map((y) => (
            <Button
              key={y}
              size="small"
              sx={slicerStyle(yearFilter.includes(y))}
              onClick={() =>
                setYearFilter((p) =>
                  p.includes(y) ? p.filter((x) => x !== y) : [...p, y]
                )
              }
            >
              {y}
            </Button>
          ))}
        </Box>

        {/* CHANNEL FILTER */}
        <Box sx={{ my: 2, display: "flex", gap: 1 }}>
          {CHANNELS.map((c) => (
            <Button
              key={c}
              size="small"
              sx={slicerStyle(channelFilter.includes(c))}
              onClick={() =>
                setChannelFilter((p) =>
                  p.includes(c) ? p.filter((x) => x !== c) : [...p, c]
                )
              }
            >
              {c}
            </Button>
          ))}
        </Box>

        {/* SERVICE CODES FILTER - ✅ ADDED */}
        <Box sx={{ my: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
          {SERVICECODES.map((s) => (
            <Button
              key={s}
              size="small"
              sx={slicerStyle(serviceCodesFilter.includes(s))}
              onClick={() =>
                setServiceCodesFilter((p) =>
                  p.includes(s) ? p.filter((x) => x !== s) : [...p, s]
                )
              }
            >
              {s}
            </Button>
          ))}
        </Box>

        {/* BRANCH FILTER */}
        <Box sx={{ my: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
          {[ALL_BRANCH, ...BRANCHES].map((b) => (
            <Button
              key={b}
              size="small"
              sx={slicerStyle(branchFilter.includes(b))}
              onClick={() =>
                setBranchFilter((p) => {
                  if (b === ALL_BRANCH) {
                    if (p.includes(ALL_BRANCH)) return p.filter((x) => x !== ALL_BRANCH);
                    return [...p, ALL_BRANCH];
                  } else {
                    const filtered = p.filter((x) => x !== b);
                    return p.includes(b) ? filtered : [...filtered, b];
                  }
                })
              }
            >
              {b}
            </Button>
          ))}
        </Box>

        {/* LINE CHART */}
        <Box sx={{ my: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Line Chart</Typography>
          <ResponsiveContainer width="100%" height={380}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis unit="%" />
              <Tooltip content={<CustomTooltip />} />
              {(
                (branchFilter.includes(ALL_BRANCH) ? ["ALL"] : []).concat(
                  branchFilter.length === 0
                    ? BRANCHES
                    : branchFilter.filter((b) => b !== ALL_BRANCH)
                )
              ).map((b) => (
                <Line
                  key={b}
                  dataKey={b}
                  stroke={BRANCH_COLORS[b] || "#000000"}
                  strokeWidth={b === "ALL" ? 4 : 3}
                  connectNulls
                >
                  <LabelList formatter={(v) => `${v}%`} dataKey={b} position="top" />
                </Line>
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Box>

        {/* BAR CHART */}
        <Box sx={{ my: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Bar Chart</Typography>
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis unit="%" />
              <Tooltip content={<CustomTooltip />} />
              {(
                (branchFilter.includes(ALL_BRANCH) ? ["ALL"] : []).concat(
                  branchFilter.length === 0
                    ? BRANCHES
                    : branchFilter.filter((b) => b !== ALL_BRANCH)
                )
              ).map((b) => (
                <Bar
                  key={b}
                  dataKey={b}
                  fill={BRANCH_COLORS[b] || "#000000"}
                  barSize={b === "ALL" ? 20 : 12}
                >
                  <LabelList formatter={(v) => `${v}%`} dataKey={b} position="top" />
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Paper>
    </Box>
  );
};

export default ServiceeGrowthPage;
