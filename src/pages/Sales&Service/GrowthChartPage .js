import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Typography, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { fetchData } from "../../api/uploadService";
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

const GrowthChartPage = ({ 
  title, 
  apiEndpoint, 
  metricKey, 
  yearsStart, 
  branches, 
  branchColors,
  navigateUrls,
  serviceCodes = null 
}) => {
  const navigate = useNavigate();

  const [yearFilter, setYearFilter] = useState([]);
  const [channelFilter, setChannelFilter] = useState([]);
  const [serviceCodesFilter, setServiceCodesFilter] = useState([]);
  const [branchFilter, setBranchFilter] = useState([]);
  const [rawData, setRawData] = useState([]);

  const CURRENT_YEAR = new Date().getFullYear();
  const YEARS = Array.from(
    { length: CURRENT_YEAR - yearsStart + 1 },
    (_, i) => String(yearsStart + i)
  );
  const CHANNELS = ["ARENA", "NEXA"];
  const SERVICECODES = serviceCodes || [];
  const ALL_BRANCH = "ALL";
  const BRANCH_COLORS = { ALL: "#000000", ...branchColors };

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
          : "";

        try {
          const res = await fetchData(
            `${apiEndpoint}?years=${year}${channelParams}${serviceCodesParams}`
          );

          if (Array.isArray(res)) {
            res.forEach((r) => {
              merged.push({
                year,
                branch: r.branch,
                [metricKey]: r[metricKey],
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
  }, [yearFilter, channelFilter, serviceCodesFilter, apiEndpoint, metricKey]);

  /* ================= TRANSFORM DATA (YEAR-OVER-YEAR GROWTH %) ================= */
  const chartData = useMemo(() => {
    const showAll = branchFilter.includes(ALL_BRANCH);
    const selectedBranches = branchFilter.length === 0
      ? branches
      : branchFilter.filter((b) => b !== ALL_BRANCH);
    const branchesToProcess = showAll ? branches : selectedBranches;

    const prevYearMap = {};
    const yearMap = {};
    const sortedData = [...rawData].sort((a, b) => Number(a.year) - Number(b.year));

    sortedData.forEach((r) => {
      if (!branchesToProcess.includes(r.branch)) return;

      if (!yearMap[r.year]) yearMap[r.year] = { year: r.year };

      const prevMetric = prevYearMap[r.branch];
      yearMap[r.year][r.branch] = prevMetric !== undefined 
        ? Number(((r[metricKey] - prevMetric) / prevMetric) * 100).toFixed(2) 
        : 0;
      prevYearMap[r.branch] = r[metricKey];
    });

    if (showAll) {
      let prevCombined = null;
      Object.keys(yearMap)
        .sort((a, b) => Number(a) - Number(b))
        .forEach((yr) => {
          const combined = branches.reduce((sum, br) => {
            const val = sortedData.find((d) => d.year === yr && d.branch === br)?.[metricKey] || 0;
            return sum + val;
          }, 0);
          yearMap[yr]["ALL"] = prevCombined !== null 
            ? Number(((combined - prevCombined) / prevCombined) * 100).toFixed(2) 
            : 0;
          prevCombined = combined;
        });
    }

    return Object.values(yearMap).sort((a, b) => Number(a.year) - Number(b.year));
  }, [rawData, branchFilter, branches, metricKey]);

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

  const branchesToRender = (branchFilter.includes(ALL_BRANCH) ? ["ALL"] : []).concat(
    branchFilter.length === 0 ? branches : branchFilter.filter((b) => b !== ALL_BRANCH)
  );

  /* ---------------- RENDER ---------------- */
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">{title}</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          {navigateUrls.map(({ path, label }, i) => (
            <Button 
              key={i} 
              variant="contained" 
              onClick={() => navigate(path)}
            >
              {label}
            </Button>
          ))}
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
              onClick={() => setYearFilter((p) => 
                p.includes(y) ? p.filter((x) => x !== y) : [...p, y]
              )}
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
              onClick={() => setChannelFilter((p) => 
                p.includes(c) ? p.filter((x) => x !== c) : [...p, c]
              )}
            >
              {c}
            </Button>
          ))}
        </Box>

        {/* SERVICE CODES FILTER (conditional) */}
        {SERVICECODES.length > 0 && (
          <Box sx={{ my: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
            {SERVICECODES.map((s) => (
              <Button
                key={s}
                size="small"
                sx={slicerStyle(serviceCodesFilter.includes(s))}
                onClick={() => setServiceCodesFilter((p) => 
                  p.includes(s) ? p.filter((x) => x !== s) : [...p, s]
                )}
              >
                {s}
              </Button>
            ))}
          </Box>
        )}

        {/* BRANCH FILTER */}
        <Box sx={{ my: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
          {[ALL_BRANCH, ...branches].map((b) => (
            <Button
              key={b}
              size="small"
              sx={slicerStyle(branchFilter.includes(b))}
              onClick={() => setBranchFilter((p) => {
                if (b === ALL_BRANCH) {
                  return p.includes(ALL_BRANCH) ? p.filter((x) => x !== ALL_BRANCH) : [...p, ALL_BRANCH];
                }
                const filtered = p.filter((x) => x !== b);
                return p.includes(b) ? filtered : [...filtered, b];
              })}
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
              {branchesToRender.map((b) => (
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
              {branchesToRender.map((b) => (
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

export default GrowthChartPage;
