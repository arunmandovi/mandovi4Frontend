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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
  Cell,
  Rectangle,
} from "recharts";
import { fetchData } from "../../api/uploadService";
import { useNavigate } from "react-router-dom";
import SlicerFilters from "../../components/SlicerFilters";
import { getSelectedGrowth, setSelectedGrowth } from "../../utils/growthSelection";

import {
  CITY_ORDER,
  BRANCH_CITY_MAP,
} from "../../helpers/SortByCityAndBranch";

const ALL_BRANCHES = CITY_ORDER.flatMap((city) =>
  Object.entries(BRANCH_CITY_MAP)
    .filter(([_, c]) => c === city)
    .map(([br]) => br)
).sort((a, b) => a.localeCompare(b));

const ThreeDBarShape = (props) => {
  const { x, y, width, height, fill } = props;

  if (!height || width <= 0) return null;

  const depth = 6;

  return (
    <g>
      <Rectangle
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        radius={[4, 4, 0, 0]}
      />

      <polygon
        points={`
          ${x},${y}
          ${x + depth},${y - depth}
          ${x + width + depth},${y - depth}
          ${x + width},${y}
        `}
        fill="#ffffff33"
      />

      <polygon
        points={`
          ${x + width},${y}
          ${x + width + depth},${y - depth}
          ${x + width + depth},${y + height - depth}
          ${x + width},${y + height}
        `}
        fill="#00000022"
      />
    </g>
  );
};


function TATBranchesBarChartPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState([]);
  const [months, setMonths] = useState([]);
  const [cities, setCities] = useState([]);
  const [qtrWise, setQtrWise] = useState([]);
  const [halfYear, setHalfYear] = useState([]);

  const [selectedGrowth, setSelectedGrowthState] = useState("FR1");
  const [selectedBranches, setSelectedBranches] = useState(ALL_BRANCHES);

  useEffect(() => {
    const saved = getSelectedGrowth("tat");
    if (saved) setSelectedGrowthState(saved);
  }, []);

  const monthOptions = [
    "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct",
    "Nov", "Dec", "Jan", "Feb", "Mar",
  ];

  const cityOptions = ["Bangalore", "Mysore", "Mangalore"];
  const qtrWiseOptions = ["Qtr1", "Qtr2", "Qtr3", "Qtr4"];
  const halfYearOptions = ["H1", "H2"];

  const growthOptions = ["FR1", "FR2", "FR3", "PMS"];

  const growthKeyMap = {
    FR1: "firstFreeService",
    FR2: "secondFreeService",
    FR3: "thirdFreeService",
    PMS: "paidService",
  };

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const params = new URLSearchParams();
        if (months.length > 0) params.append("months", months.join(","));
        if (cities.length > 0) params.append("cities", cities.join(","));
        if (qtrWise.length > 0) params.append("qtrWise", qtrWise.join(","));
        if (halfYear.length > 0) params.append("halfYear", halfYear.join(","));

        const endpoint = `/api/tat/tat_branch_summary${params.toString() ? "?" + params : ""}`;
        const data = await fetchData(endpoint);

        setSummary(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching TAT branch summary:", error);
        setSummary([]);
      }
    };
    fetchSummary();
  }, [months, cities, qtrWise, halfYear]);

  const readBranchName = (row) =>
    (row?.branch || row?.Branch || row?.branchName || row?.BranchName || row?.name || row?.Name || "")
      .toString()
      .trim();

  const readCityName = (row) =>
    (row?.city || row?.City || row?.cityName || row?.CityName || "")
      .toString()
      .trim();

  const timeToSeconds = (timeStr) => {
    if (!timeStr || typeof timeStr !== "string") return 0;
    const parts = timeStr.split(":").map(Number);
    if (parts.length === 3) {
      const [h, m, s] = parts;
      return h * 3600 + m * 60 + s;
    } else if (parts.length === 2) {
      const [m, s] = parts;
      return m * 60 + s;
    } else {
      const val = parseFloat(timeStr);
      return isNaN(val) ? 0 : val;
    }
  };

  const secondsToHHMMSS = (seconds) => {
    if (isNaN(seconds)) return "00:00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  };

  const readTimeValue = (row, apiKey) => {
    if (!row || !apiKey) return 0;
    const val = row[apiKey];
    return timeToSeconds(val);
  };

  const buildCombinedAverageData = (dataArr) => {
    const apiKey = growthKeyMap[selectedGrowth];
    const totals = {};
    const counts = {};
    const cityMap = {};

    (dataArr || []).forEach((row) => {
      const branch = readBranchName(row);
      const city = readCityName(row);
      const val = readTimeValue(row, apiKey);

      if (!isNaN(val)) {
        totals[branch] = (totals[branch] || 0) + val;
        counts[branch] = (counts[branch] || 0) + 1;
        cityMap[branch] = city;
      }
    });

    const branches = Object.keys(totals).map((b) => ({
      name: b,
      city: cityMap[b],
      valueSec: counts[b] ? totals[b] / counts[b] : 0,
    }));

    branches.sort((a, b) => a.valueSec - b.valueSec);
    return branches;
  };

  const chartData =
  selectedGrowth && summary.length > 0
    ? buildCombinedAverageData(summary)
        .filter(item => {

          if (
            selectedGrowth === "BodyShop Growth %" ||
            selectedGrowth === "BS on FPR 2024-25 %" ||
            selectedGrowth === "BS on FPR 2025-26 %"
          ) {
            return !(
              item.name === "Vittla" ||
              item.name === "Naravi" ||
              item.name === "Gowribidanur" ||
              item.name === "Malur SOW" ||
              item.name === "Maluru WS" ||
              item.name === "Kollegal" ||
              item.name === "Narasipura" ||
              item.name === "Nagamangala" ||
              item.name === "Maddur" ||
              item.name === "Somvarpet" ||
              item.name === "Krishnarajapet" ||
              item.name === "ChamrajNagar" ||
              item.name === "KRS Road" ||
              item.name === "Balmatta" ||
              item.name === "Bantwal" ||
              item.name === "Nexa Service" ||
              item.name === "Kadaba" ||
              item.name === "Sujith Bagh Lane"
            );
          }

          return true;
        })
        .filter(item => selectedBranches.includes(item.name))
    : [];

    const handleBranchChange = (e) => {
      const value = e.target.value;
      setSelectedBranches(value);
    };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const sec = payload[0].value;
      return (
        <Box
          sx={{
            background: "white",
            border: "1px solid #ccc",
            borderRadius: 1,
            p: 1,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {payload[0].payload.name} ({payload[0].payload.city})
          </Typography>
          <Typography variant="body2">{secondsToHHMMSS(sec)}</Typography>
        </Box>
      );
    }
    return null;
  };

  const InsideBarLabel = (props) => {
    const { x, y, width, height, value } = props;
    if (value == null || width <= 0) return null;

    const textX = x + width / 2;
    const textY = y + height / 2;

    return (
      <text
        x={textX}
        y={textY}
        transform={`rotate(-90, ${textX}, ${textY})`}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={11}
        fill="#000"
        fontWeight={600}
        pointerEvents="none"
      >
        {secondsToHHMMSS(value)}
      </text>
    );
  };

  const getBarColor = (valueSec) => {
    const threshold = 2 * 3600 + 30 * 60;
    return valueSec < threshold ? "#05f105" : "#ff0000";
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">TAT REPORT (Branch-wise)</Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button variant="contained" onClick={() => navigate("/DashboardHome/tat")}>Graph-CityWise</Button>
            <Button variant="contained" onClick={() => navigate("/DashboardHome/tat_branches")}>Graph-BranchWise</Button>
            <Button variant="contained" onClick={() => navigate("/DashboardHome/tat-bar-chart")}>Bar Chart-CityWise</Button>
            <Button variant="contained" onClick={() => navigate("/DashboardHome/tat_branches-bar-chart")}>Bar Chart-BranchWise</Button>
          </Box>
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
                  renderValue={() => "Select Branches"}  // << ALWAYS SHOWN
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

      <SlicerFilters
        monthOptions={monthOptions}
        cityOptions={cityOptions}
        qtrWiseOptions={qtrWiseOptions}
        halfYearOptions={halfYearOptions}
        months={months}
        setMonths={setMonths}
        cities={cities}
        setCities={setCities}
        qtrWise={qtrWise}
        setQtrWise={setQtrWise}
        halfYear={halfYear}
        setHalfYear={setHalfYear}
      />

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.2, mb: 2 }}>
        {growthOptions.map((g, idx) => (
          <Button
            key={g}
            variant={selectedGrowth === g ? "contained" : "outlined"}
            color={selectedGrowth === g ? "secondary" : "primary"}
            sx={{
              borderRadius: "20px",
              px: 2,
              py: 0.5,
              textTransform: "none",
              fontWeight: 600,
              transition: "all 0.3s ease",
              background:
                selectedGrowth === g
                  ? `linear-gradient(90deg, hsl(${idx * 40}, 70%, 45%), hsl(${(idx * 40 + 20) % 360}, 70%, 55%))`
                  : "transparent",
              color: selectedGrowth === g ? "white" : "inherit",
              boxShadow:
                selectedGrowth === g ? `0 3px 10px rgba(0,0,0,0.15)` : "none",
              "&:hover": { transform: "scale(1.05)" },
            }}
            onClick={() => {
              setSelectedGrowthState(g);
              setSelectedGrowth(g, "tat");
            }}
          >
            {g}
          </Button>
        ))}
      </Box>

      {!selectedGrowth ? (
        <Typography>👆 Select a service type to view the chart below</Typography>
      ) : summary.length === 0 ? (
        <Typography>No data available for the selected criteria.</Typography>
      ) : (
        <Box
          sx={{
            mt: 2,
            width: "100%",
            height: 520,
            background: "#fff",
            borderRadius: 2,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            p: 2,
          }}
        >
          <Typography variant="h6" sx={{ mb: 1 }}>
            {selectedGrowth} — Avg TAT (HH:MM:SS)
          </Typography>

          <ResponsiveContainer width="100%" height="92%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 10, bottom: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                interval={0}
                height={70}
              />
              <YAxis
                tickFormatter={(sec) => secondsToHHMMSS(sec)}
                tick={{ fontSize: 12 }}
                label={{
                  value: "Average TAT (HH:MM:SS)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              <Bar
                dataKey="valueSec"
                barSize={35}
                shape={<ThreeDBarShape />}
                isAnimationActive={true}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getBarColor(entry.valueSec)}
                  />
                ))}
                <LabelList dataKey="valueSec" content={<InsideBarLabel />} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Box>
  );
}

export default TATBranchesBarChartPage;
