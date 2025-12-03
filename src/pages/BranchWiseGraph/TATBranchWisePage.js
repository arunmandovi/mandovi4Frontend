import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
} from "@mui/material";

import { fetchData } from "../../api/uploadService";
import { useNavigate } from "react-router-dom";

import SlicerFilters from "../../components/SlicerFilters";
import GrowthButtons from "../../components/GrowthButtons";

import { getSelectedGrowth, setSelectedGrowth } from "../../utils/growthSelection";

import { CITY_ORDER, BRANCH_CITY_MAP } from "../../helpers/SortByCityAndBranch";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";

const monthOptions = [ "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", ];

const growthOptions = ["FR1", "FR2", "FR3", "PMS"];

const ALL_BRANCHES = CITY_ORDER.flatMap((city) =>
  Object.entries(BRANCH_CITY_MAP)
    .filter(([_, c]) => c === city)
    .map(([br]) => br)
).sort((a, b) => a.localeCompare(b));

const growthKeyMap = {
    FR1: "firstFreeService",
    FR2: "secondFreeService",
    FR3: "thirdFreeService",
    PMS: "paidService",
  };

const timeToSeconds = (hhmmss) => {
  if (hhmmss === null || hhmmss === undefined) return null;
  const s = String(hhmmss).trim();
  if (!s.includes(":")) return null;
  const parts = s.split(":").map((p) => parseInt(p, 10) || 0);
  // If format is mm:ss (2 parts) handle it
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  const [h = 0, m = 0, sec = 0] = parts;
  return (h || 0) * 3600 + (m || 0) * 60 + (sec || 0);
};

const secondsToHHMMSS = (sec) => {
  if (sec === null || sec === undefined || isNaN(sec)) return "00:00:00";
  const s = Number(sec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = Math.floor(s % 60);
  return `${String(h).padStart(2, "0")}:{${String(m).padStart(2, "0")}}:${String(ss).padStart(2, "0")}`.replace(/{/g, '').replace(/}/g, '');
};

const COLORS = [
  "#FF5733", "#33A1FF", "#9B59B6", "#27AE60", "#F1C40F", "#E67E22", "#2ECC71", "#3498DB", "#8E44AD","#D35400",
  "#1ABC9C", "#E74C3C", "#F39C12", "#7D3C98", "#16A085", "#2980B9", "#C0392B", "#BA55D3", "#20B2AA", "#FF8C00",
];

const TATBranchLineChart = ({ chartData = [], cityKeys = [] }) => {
  const filteredData = (chartData || []).filter((item) =>
    cityKeys.some((k) => item[k] !== 0 && item[k] !== null && item[k] !== undefined)
  );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={filteredData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis dataKey="month" tick={{ fontSize: 12, fontWeight: 600 }} />

        <YAxis
          label={{ value: "TAT (HH:MM:SS)", angle: -90, position: "insideLeft" }}
          tick={{ fontSize: 12 }}
          tickFormatter={(v) => secondsToHHMMSS(v)}
        />

        <Tooltip
          content={({ payload, label }) => {
            if (!payload || payload.length === 0) return null;
            const sorted = [...payload].sort((a, b) => b.value - a.value);
            return (
              <div style={{ background: "#fff", padding: 10, border: "1px solid #000" }}>
                <strong>{label}</strong>
                {sorted.map((item) => (
                  <div key={item.dataKey} style={{ color: item.color }}>
                    {item.name}: {secondsToHHMMSS(item.value)}
                  </div>
                ))}
              </div>
            );
          }}
        />

        {cityKeys.map((key, index) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={COLORS[index % COLORS.length]}
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          >
            <LabelList
              dataKey={key}
              position="top"
              content={({ x, y, value }) => {
                if (value === null || value === undefined) return null;
                return (
                  <text x={x} y={y - 5} fill={Number(value) < 0 ? "rgba(215,7,7,1)" : "#000"} fontSize={12} fontWeight="bold" textAnchor="middle">
                    {secondsToHHMMSS(value)}
                  </text>
                );
              }}
            />
          </Line>
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

const TATBranchWisePage = () => {
  const navigate = useNavigate();

  const [summary, setSummary] = useState([]); // [{ month, data: [...] }, ...]
  const [months, setMonths] = useState([]);
  const [selectedGrowth, setSelectedGrowthState] = useState(getSelectedGrowth("tat") || "FR1");

  const [selectedBranches, setSelectedBranches] = useState(["Adyar", "KRS Road", "Wilson Garden"]);

  useEffect(() => {
    const saved = getSelectedGrowth("tat");
    if (saved) setSelectedGrowthState(saved);
  }, []);

  useEffect(() => {
    const fetchBranchSummary = async () => {
      try {
        const activeMonths = months.length ? months : monthOptions;
        const combined = [];

        for (const m of activeMonths) {
          const query = `?&months=${m}`;
          const data = await fetchData(`/api/tat/tat_branch_summary${query}`);
          const safeData = Array.isArray(data) ? data : data?.result || [];
          combined.push({ month: m, data: safeData });
        }

        setSummary(combined);
      } catch (err) {
        console.error(err);
      }
    };

    fetchBranchSummary();
  }, [months]);

  const readBranchName = (row) => row?.branch || row?.Branch || row?.branchName || row?.BranchName || "";

  const readTATValue = (row, key) => {
    if (!row) return null;
    const raw = row?.[key];
    if (raw === undefined || raw === null) return null;
    if (typeof raw === "string" && raw.includes(":")) return timeToSeconds(raw);
    const cleaned = String(raw).replace("%", "").trim();
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  };

  const buildChartData = () => {
    if (!selectedGrowth || selectedBranches.length === 0) return { formatted: [], sortedBranches: [] };

    const apiKey = growthKeyMap[selectedGrowth];

    const formatted = summary.map(({ month, data }) => {
      const entry = { month };

      selectedBranches.forEach((br) => (entry[br] = 0));

      (data || []).forEach((row) => {
        const apiBranch = readBranchName(row);
        if (!selectedBranches.includes(apiBranch)) return;
        const val = readTATValue(row, apiKey);
        entry[apiBranch] = val ?? 0;
      });

      return entry;
    });

    return { formatted, sortedBranches: selectedBranches };
  };

  const { formatted: chartData, sortedBranches: cityKeys } = buildChartData();

  const handleBranchChange = (e) => {
    const value = e.target.value;
    if (value.includes("ALL")) {
      setSelectedBranches(ALL_BRANCHES);
    } else {
      setSelectedBranches(value.filter((x) => x !== "ALL"));
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">TAT GRAPH (BranchWise)</Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/tat")}>Graph-CityWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/tat_branches")}>Graph-BranchWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/tat-bar-chart")}>Bar Chart-CityWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/tat_branches-bar-chart")}>Bar Chart-BranchWise</Button>
        </Box>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 260 }}>
          <InputLabel>Select Branches</InputLabel>
           <Select
            multiple
            label="Select Branches"
            value={selectedBranches}
            onChange={handleBranchChange}
            displayEmpty
            renderValue={() => "Select Branches"}  
            MenuProps={{
              PaperProps: {
                style: { maxHeight: 300 },
              },
            }}
          >
            <ListItemText primary="Bangalore" sx={{ pl: 2, fontWeight: "bold" }} />
            {Object.entries(BRANCH_CITY_MAP)
              .filter(([_, c]) => c === "Bangalore")
              .map(([br]) => (
                <MenuItem value={br} key={br}>
                  <Checkbox checked={selectedBranches.includes(br)} />
                  <ListItemText primary={br} />
                </MenuItem>
              ))}
             <ListItemText primary="Mysore" sx={{ pl: 2, fontWeight: "bold" }} />
            {Object.entries(BRANCH_CITY_MAP)
              .filter(([_, c]) => c === "Mysore")
              .map(([br]) => (
                <MenuItem value={br} key={br}>
                  <Checkbox checked={selectedBranches.includes(br)} />
                  <ListItemText primary={br} />
                </MenuItem>
              ))}
             <ListItemText primary="Mangalore" sx={{ pl: 2, fontWeight: "bold" }} />
            {Object.entries(BRANCH_CITY_MAP)
              .filter(([_, c]) => c === "Mangalore")
              .map(([br]) => (
                <MenuItem value={br} key={br}>
                  <Checkbox checked={selectedBranches.includes(br)} />
                  <ListItemText primary={br} />
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      </Box>

      <SlicerFilters monthOptions={monthOptions} months={months} setMonths={setMonths} />

      <GrowthButtons
        growthOptions={growthOptions}
        selectedGrowth={selectedGrowth}
        setSelectedGrowth={(value) => {
          setSelectedGrowthState(value);
          setSelectedGrowth(value, "tat");
        }}
      />

      {selectedBranches.length === 0 ? (
        <Typography sx={{ mt: 2, color: "red" }}>Please select at least one branch.</Typography>
      ) : !selectedGrowth ? (
        <Typography>Select a TAT type to view the chart</Typography>
      ) : chartData.length === 0 ? (
        <Typography>No data available for selected criteria.</Typography>
      ) : (
        <Box sx={{ mt: 2, height: 500, background: "#fff", borderRadius: 2, boxShadow: 3, p: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>{selectedGrowth}</Typography>

          <TATBranchLineChart chartData={chartData} cityKeys={cityKeys} />
        </Box>
      )}
    </Box>
  );
};

export default TATBranchWisePage;
