import React, { useState, useEffect } from "react";
import {
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Checkbox,
  ListItemText,
  Button,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { fetchData } from "../../api/uploadService";
import { useNavigate } from "react-router-dom";

function LabourBranchesGraphPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState([]);
  const [months, setMonths] = useState([]);
  const [selectedGrowth, setSelectedGrowth] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState("All Branches");

  const monthOptions = [
    "Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar",
  ];

  const growthOptions = [
    "Service Growth %",
    "BodyShop Growth %",
    "SR&BR Growth %",
    "Free Service Growth %",
    "PMS Growth %",
    "FPR Growth %",
    "RR Growth %",
    "Others Growth %",
  ];

  const growthKeyMap = {
    "Service Growth %": "growthService",
    "BodyShop Growth %": "growthBodyShop",
    "SR&BR Growth %": "growthSrBr",
    "Free Service Growth %": "growthFreeService",
    "PMS Growth %": "growthPMS",
    "FPR Growth %": "growthFPR",
    "RR Growth %": "growthRunningRepair",
    "Others Growth %": "growthOthers",
  };

  // Fetch branch summary
  useEffect(() => {
    const fetchBranchSummary = async () => {
      try {
        const activeMonths = months.length ? months : monthOptions;
        const combined = [];
        for (const m of activeMonths) {
          const query = `?groupBy=branch&months=${m}`;
          const data = await fetchData(`/api/labour/labour_summary${query}`);
          if (data && data.length > 0) combined.push({ month: m, data });
        }
        setSummary(combined);
      } catch (err) {
        console.error("fetchBranchSummary error:", err);
      }
    };
    fetchBranchSummary();
  }, [months]);

  // Helpers
  const readBranchName = (row) =>
    (row?.branch || row?.Branch || row?.branchName || row?.BranchName || "").trim();

  const readGrowthValue = (row, apiKey) => {
    if (!row || !apiKey) return 0;
    const val = row[apiKey] ?? Object.values(row).find((v) => typeof v === "number");
    const parsed = parseFloat(String(val).replace("%", "").trim());
    return isNaN(parsed) ? 0 : parsed;
  };

  const buildChartData = (summaryArr) => {
    const apiKey = growthKeyMap[selectedGrowth];
    const branchSet = new Set();

    summaryArr.forEach(({ data }) => {
      (data || []).forEach((row) => branchSet.add(readBranchName(row)));
    });

    const allBranches = Array.from(branchSet).sort();

    const result = summaryArr.map(({ month, data }) => {
      const entry = { month };
      allBranches.forEach((b) => (entry[b] = 0));
      (data || []).forEach((row) => {
        const branch = readBranchName(row);
        const val = readGrowthValue(row, apiKey);
        entry[branch] = val;
      });
      return entry;
    });
    return { data: result, keys: allBranches };
  };

  // Branch filter
  const filteredSummary =
    selectedBranch === "All Branches"
      ? summary
      : summary.map((s) => ({
          ...s,
          data: s.data.filter(
            (d) =>
              readBranchName(d).toLowerCase() === selectedBranch.toLowerCase()
          ),
        }));

  const { data: chartData, keys: branchKeys } = buildChartData(filteredSummary);

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box sx={{ background: "#fff", border: "1px solid #ccc", borderRadius: 1, p: 1 }}>
          <Typography variant="body2" fontWeight={600}>{label}</Typography>
          {payload.map((entry, i) => (
            <Typography key={i} variant="body2" color={entry.color}>
              {`${entry.name}: ${entry.value?.toFixed(2)}%`}
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  return (
    <Box sx={{ p: 3, background: "#f9f9fb", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>LABOUR REPORT (Branch-wise)</Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            sx={{
              borderRadius: "20px", px: 2, py: 0.8, fontWeight: 600,
              background: "linear-gradient(90deg, #2196F3, #21CBF3)",
              boxShadow: "0 4px 10px rgba(33,150,243,0.3)",
              "&:hover": { transform: "scale(1.05)", background: "linear-gradient(90deg, #1E88E5, #00ACC1)" },
            }}
            onClick={() => navigate("/DashboardHome/labour")}
          >City View</Button>

          <Button
            variant="contained"
            sx={{
              borderRadius: "20px", px: 2, py: 0.8, fontWeight: 600,
              background: "linear-gradient(90deg, #9C27B0, #E040FB)",
              boxShadow: "0 4px 10px rgba(156,39,176,0.3)",
              "&:hover": { transform: "scale(1.05)", background: "linear-gradient(90deg, #8E24AA, #D500F9)" },
            }}
            onClick={() => navigate("/DashboardHome/labour-bar-chart")}
          >Bar Chart</Button>
        </Box>
      </Box>

      {/* Month Filter */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Select Month(s)</InputLabel>
          <Select
            multiple
            value={months}
            onChange={(e) => setMonths(e.target.value)}
            renderValue={(selected) => selected.length ? selected.join(", ") : "Auto Filter"}
          >
            {monthOptions.map((m) => (
              <MenuItem key={m} value={m}>
                <Checkbox checked={months.indexOf(m) > -1} />
                <ListItemText primary={m} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Branch Buttons */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.2, mb: 3 }}>
        {["All Branches", "Bangalore", "Mysore", "Mangalore"].map((b, idx) => (
          <Button
            key={b}
            variant={selectedBranch === b ? "contained" : "outlined"}
            sx={{
              borderRadius: "25px", px: 2, py: 0.6, textTransform: "none", fontWeight: 600,
              background: selectedBranch === b
                ? `linear-gradient(90deg, hsl(${idx * 80}, 70%, 45%), hsl(${(idx * 80 + 30) % 360}, 70%, 55%))`
                : "#fff",
              color: selectedBranch === b ? "white" : "#444",
              borderColor: selectedBranch === b ? "transparent" : "#ccc",
              "&:hover": { transform: "scale(1.05)", background: selectedBranch === b ? `linear-gradient(90deg, hsl(${idx * 80}, 65%, 40%), hsl(${(idx * 80 + 30) % 360}, 65%, 50%))` : "rgba(0,0,0,0.05)" }
            }}
            onClick={() => setSelectedBranch(b)}
          >{b}</Button>
        ))}
      </Box>

      {/* Growth Buttons */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.2, mb: 3 }}>
        {growthOptions.map((g, idx) => (
          <Button
            key={g}
            variant={selectedGrowth === g ? "contained" : "outlined"}
            sx={{
              borderRadius: "25px", px: 2, py: 0.6, textTransform: "none", fontWeight: 600,
              background: selectedGrowth === g
                ? `linear-gradient(90deg, hsl(${idx * 40}, 70%, 45%), hsl(${(idx * 40 + 20) % 360}, 70%, 55%))`
                : "#fff",
              color: selectedGrowth === g ? "white" : "#444",
              borderColor: selectedGrowth === g ? "transparent" : "#ccc",
              "&:hover": { transform: "scale(1.05)", background: selectedGrowth === g ? `linear-gradient(90deg, hsl(${idx * 40}, 65%, 40%), hsl(${(idx * 40 + 20) % 360}, 65%, 50%))` : "rgba(0,0,0,0.05)" }
            }}
            onClick={() => setSelectedGrowth(g)}
          >{g.replace(" Growth %", "")}</Button>
        ))}
      </Box>

      {!selectedGrowth ? (
        <Typography>👆 Select a growth type to view the chart below</Typography>
      ) : summary.length === 0 ? (
        <Typography>No data available for the selected criteria.</Typography>
      ) : (
        <Box sx={{ mt: 2, width: "100%", height: 450, background: "#fff", borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", p: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>{selectedGrowth}</Typography>

          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 30, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
              <XAxis dataKey="month" tick={{ fontSize: 13, fill: "#333", fontWeight: 600 }} axisLine={{ stroke: "#333", strokeWidth: 1.5 }} />
              <YAxis domain={["auto","auto"]} tick={{ fontSize: 13, fill: "#333", fontWeight: 600 }} axisLine={{ stroke: "#333", strokeWidth: 1.5 }} label={{ value: "Growth %", angle: -90, position: "insideLeft", fill: "#333", fontSize: 14, fontWeight: 600 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {branchKeys.map((key, idx) => (
                <Line key={key} dataKey={key} type="monotone" stroke={`hsl(${(idx * 60) % 360}, 70%, 45%)`} strokeWidth={2.5} dot={{ r: 4, strokeWidth: 1, fill: "#fff" }} isAnimationActive={false}>
                  <LabelList dataKey={key} position="top" fontSize={10} content={({ x, y, value }) => value != null ? <text x={x} y={y-6} textAnchor="middle" fontSize={10} fill="#333">{`${Number(value).toFixed(1)}%`}</text> : null} />
                </Line>
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Box>
  );
}

export default LabourBranchesGraphPage;
