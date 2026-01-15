import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Button,
  Typography,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { fetchData } from "../../api/uploadService";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LabelList,
  Cell,
} from "recharts";

/* ---------------- CONSTANTS ---------------- */

const MONTHS = [
  "APR","MAY","JUN","JUL","AUG","SEP",
  "OCT","NOV","DEC","JAN","FEB","MAR"
];

const BRANCHES = [
  "BALMATTA","SURATHKAL","ADYAR","SULLIA","UPPINANGADY",
  "YEYYADI","BANTWAL","KADABA","VITTLA","SUJITH BAGH",
  "NEXA","NARAVI"
];

// Branch-wise colors
const BRANCH_COLORS = {
  BALMATTA: "#1f77b4",
  SURATHKAL: "#ff7f0e", 
  ADYAR: "#2ca02c",
  SULLIA: "#d62728",
  UPPINANGADY: "#9467bd",
  YEYYADI: "#8c564b",
  BANTWAL: "#e377c2",
  KADABA: "#7f7f7f",
  VITTLA: "#bcbd22",
  "SUJITH BAGH": "#17becf",
  NEXA: "#4e79a7",
  NARAVI: "#f28e2b",
  ALL: "#2e7d32",
  APPT: "#1976d2",
  CONV: "#d32f2f",
};

const MONTH_COLORS = {
  APR: "#1f77b4", MAY: "#ff7f0e", JUN: "#2ca02c", JUL: "#d62728",
  AUG: "#9467bd", SEP: "#8c564b", OCT: "#e377c2", NOV: "#7f7f7f",
  DEC: "#bcbd22", JAN: "#17becf", FEB: "#4e79a7", MAR: "#f28e2b",
  ALL: "#2e7d32",
  APPT: "#1976d2",
  CONV: "#d32f2f",
};

const GROWTH_OPTIONS = ["PMS %", "Appointment", "Conversion", "A&C"];

const growthKeyMap = {
  "PMS %": "percentagePMS",
  "Appointment": "pmsAppointment",
  "Conversion": "pmsConversion",
};

/* ---------------- COMPONENT ---------------- */

const CCConversionBarChartPage = () => {
  const navigate = useNavigate();

  const [selectedMonths, setSelectedMonths] = useState([]);
  const [allSelected, setAllSelected] = useState(true);
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [selectedCces, setSelectedCces] = useState([]);
  const [selectedGrowth, setSelectedGrowth] = useState("PMS %");

  const [summary, setSummary] = useState([]);
  const [cceKeys, setCceKeys] = useState([]);
  const [branchCceMap, setBranchCceMap] = useState({});

  const normalize = v => v?.trim().toUpperCase() || "";
  const isPercentage = selectedGrowth === "PMS %";
  const isAC = selectedGrowth === "A&C";
  const growthKey = growthKeyMap[selectedGrowth];

  /* ---------- CCE BRANCH MAPPING ---------- */
  const cceBranchMap = useMemo(() => {
    const map = {};
    Object.entries(branchCceMap).forEach(([branch, cces]) => {
      cces.forEach(cce => {
        map[normalize(cce)] = normalize(branch);
      });
    });
    return map;
  }, [branchCceMap]);

  /* ---------- MASTER DATA ---------- */
  useEffect(() => {
    const loadMasterData = async () => {
      const res = await fetchData(`/api/cc/cc_conversion_summary`);
      const rows = Array.isArray(res) ? res : [];

      const map = {};
      rows.forEach(r => {
        const b = normalize(r.branch);
        const c = normalize(r.cceName);
        if (!map[b]) map[b] = new Set();
        map[b].add(c);
      });

      const normalized = {};
      Object.keys(map).forEach(b => normalized[b] = [...map[b]]);
      setBranchCceMap(normalized);
    };

    loadMasterData();
  }, []);

  /* ---------- CCE OPTIONS ---------- */
  const dropdownCces = useMemo(() => {
    if (!selectedBranches.length) {
      return [...new Set(Object.values(branchCceMap).flat())];
    }
    const set = new Set();
    selectedBranches.forEach(b =>
      branchCceMap[normalize(b)]?.forEach(c => set.add(c))
    );
    return [...set];
  }, [selectedBranches, branchCceMap]);

  const allCceSelected =
    dropdownCces.length > 0 &&
    selectedCces.length === dropdownCces.length;

  useEffect(() => {
    setSelectedCces(prev => prev.filter(c => dropdownCces.includes(c)));
  }, [dropdownCces]);

  /* ---------- DATA FETCH ---------- */
  useEffect(() => {
    const loadData = async () => {
      const monthsToFetch =
        allSelected || !selectedMonths.length ? MONTHS : selectedMonths;

      const allData = [];
      const cceSet = new Set();

      for (const month of monthsToFetch) {
        const query =
          `?months=${month}` +
          (selectedBranches.length ? `&branches=${selectedBranches.join(",")}` : "") +
          (selectedCces.length ? `&cceNames=${selectedCces.join(",")}` : "");

        const res = await fetchData(`/api/cc/cc_conversion_summary${query}`);
        const rows = Array.isArray(res) ? res : [];

        rows.forEach(r => cceSet.add(normalize(r.cceName)));
        allData.push({ month, data: rows });
      }

      setSummary(allData);
      setCceKeys([...cceSet]);
    };

    loadData();
  }, [selectedMonths, allSelected, selectedBranches, selectedCces]);

  /* ---------- CUSTOM TOOLTIP FOR BAR CHART ---------- */
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // Get months in chronological order (selected or all)
      const monthsForChart = allSelected || !selectedMonths.length ? MONTHS : selectedMonths;
      
      // Find the chart entry for this CCE
      const chartEntry = chartData.find(entry => normalize(entry.cce) === normalize(label));
      const branchName = chartEntry?.branch || 'N/A';
      
      return (
        <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.95)', borderRadius: 2, border: '1px solid #ccc', minWidth: 200 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1.5, color: '#1976d2' }}>
            CCE: {label}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1.5, color: '#666', fontSize: '0.8rem' }}>
            Branch: {branchName}
          </Typography>
          
          {/* Show data in chronological month order */}
          {monthsForChart.map(month => {
            const dataPoint = payload.find(p => 
              p.dataKey === month || 
              p.dataKey === `${month}_APPT` || 
              p.dataKey === `${month}_CONV`
            );
            
            if (dataPoint && dataPoint.value !== 0) {
              const displayValue = isPercentage ? `${Math.round(dataPoint.value)}%` : Math.round(dataPoint.value);
              return (
                <Box key={month} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.3 }}>
                  <Typography variant="body2" sx={{ color: MONTH_COLORS[month], fontWeight: 500, fontSize: '0.85rem' }}>
                    {month}:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                    {displayValue}
                  </Typography>
                </Box>
              );
            }
            return null;
          })}
        </Box>
      );
    }
    return null;
  };

  /* ---------- CHART DATA ---------- */
  const chartData = useMemo(() => {
    const rows = cceKeys.map(cce => {
      // Find the FIRST occurrence in summary data to get correct branch
      let actualBranch = 'UNKNOWN';
      
      for (const { data } of summary) {
        const matchingRow = data.find(d => normalize(d.cceName) === cce);
        if (matchingRow) {
          actualBranch = normalize(matchingRow.branch);
          break;
        }
      }

      // Filter: Only show CCEs from selected branches
      if (selectedBranches.length > 0) {
        const normalizedSelected = selectedBranches.map(normalize);
        if (!normalizedSelected.includes(actualBranch)) {
          return null;
        }
      }

      const row = { 
        cce,
        branch: actualBranch
      };

      let totalConv = 0;
      let totalAppt = 0;
      let totalVal = 0;
      let count = 0;

      summary.forEach(({ month, data }) => {
        const r = data.find(d => normalize(d.cceName) === cce);

        const conv = Number(r?.pmsConversion ?? 0);
        const appt = Number(r?.pmsAppointment ?? 0);
        const val = Number(r?.[growthKey] ?? 0);

        if (isAC) {
          row[`${month}_APPT`] = appt;
          row[`${month}_CONV`] = conv;
        } else {
          row[month] = val;
        }

        totalConv += conv;
        totalAppt += appt;
        totalVal += val;
        count++;
      });

      let rankValue = 0;

      if (isAC) {
        if (allSelected || !selectedMonths.length) {
          row.ALL_APPT = totalAppt;
          row.ALL_CONV = totalConv;
        }
        rankValue = totalConv;
      } else if (isPercentage && (allSelected || !selectedMonths.length)) {
        rankValue = totalAppt ? (totalConv / totalAppt) * 100 : 0;
        row.ALL = rankValue;
      } else {
        rankValue = isPercentage
          ? count ? totalVal / count : 0
          : totalVal;

        if (allSelected || !selectedMonths.length) {
          row.ALL = rankValue;
        }
      }

      row.__rankValue = rankValue;
      row.__branchColor = BRANCH_COLORS[row.branch] || '#999';
      return row;
    });

    return rows
      .filter(row => row !== null)
      .sort((a, b) => b.__rankValue - a.__rankValue);
  }, [cceKeys, summary, allSelected, selectedMonths, growthKey, isPercentage, isAC, selectedBranches]);

  /* ---------- Custom Label Component ---------- */
  const VerticalBranchLabel = ({ x, y, width, height, value, index }) => {
    const entry = chartData[index];
    const branchName = entry?.branch || '';
    
    if (!branchName || branchName === 'UNKNOWN') return null;

    const displayName = branchName.length > 8 ? branchName.substring(0, 8) + '...' : branchName;

    return (
      <text
        x={x + width / 2}
        y={y + height / 2}
        fill="#000000"
        fontSize="12"
        fontWeight="bold"
        textAnchor="middle"
        dominantBaseline="middle"
        transform={`rotate(-90 ${x + width / 2} ${y + height / 2})`}
        fontFamily="Arial, sans-serif"
      >
        {displayName}
      </text>
    );
  };

  /* ---------- BUTTON STYLE ---------- */
  const selectedGradient =
    "linear-gradient(90deg, rgba(144,238,144,1) 0%, rgba(102,205,170,1) 100%)";

  const btnStyle = sel => ({
    borderRadius: 20,
    px: 2,
    py: 0.5,
    fontWeight: 600,
    background: sel ? selectedGradient : "#fff",
    border: sel ? "1.5px solid #388e3c" : "1px solid #bdbdbd",
  });

  const getBarColor = (entry) => {
    if (isAC) {
      return MONTH_COLORS.APPT || MONTH_COLORS.CONV;
    }
    return entry.__branchColor;
  };

  /* ---------------- RENDER ---------------- */

  return (
    <Box sx={{ p: 3 }}>
      {/* HEADER */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">
          CC CONVERSION – {selectedGrowth} (Bar)
        </Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/cc_conversion")}>
            Line Chart
          </Button>
          <Button variant="contained">Bar Chart</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/cc_conversion_table")}>
            Table
          </Button>
        </Box>
      </Box>

      {/* MONTH FILTERS */}
      <Box sx={{ mb: 2, display: "flex", gap: 1.2, flexWrap: "wrap" }}>
        <Button
          size="small"
          sx={btnStyle(allSelected)}
          onClick={() => {
            setAllSelected(true);
            setSelectedMonths([]);
          }}
        >
          ALL
        </Button>

        {MONTHS.map(m => (
          <Button
            key={m}
            size="small"
            sx={btnStyle(selectedMonths.includes(m))}
            onClick={() => {
              setAllSelected(false);
              setSelectedMonths(p =>
                p.includes(m) ? p.filter(x => x !== m) : [...p, m]
              );
            }}
          >
            {m}
          </Button>
        ))}
      </Box>

      {/* BRANCH FILTERS */}
      <Box sx={{ mb: 2, display: "flex", gap: 1.2, flexWrap: "wrap" }}>
        {BRANCHES.map(b => (
          <Button
            key={b}
            size="small"
            sx={btnStyle(selectedBranches.includes(b))}
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

      {/* GROWTH FILTER */}
      <Box sx={{ mb: 3, display: "flex", gap: 1.2 }}>
        {GROWTH_OPTIONS.map(g => (
          <Button
            key={g}
            size="small"
            sx={btnStyle(selectedGrowth === g)}
            onClick={() => setSelectedGrowth(g)}
          >
            {g}
          </Button>
        ))}
      </Box>

      {/* CCE DROPDOWN */}
      <Box sx={{ mb: 3, width: 320 }}>
        <Select
          multiple
          fullWidth
          value={selectedCces}
          onChange={e => {
            const value = e.target.value;
            if (value.includes("ALL")) {
              setSelectedCces(allCceSelected ? [] : dropdownCces);
            } else {
              setSelectedCces(value);
            }
          }}
          input={<OutlinedInput />}
          renderValue={s => s.join(", ")}
        >
          <MenuItem value="ALL">
            <Checkbox
              checked={allCceSelected}
              indeterminate={
                selectedCces.length > 0 &&
                selectedCces.length < dropdownCces.length
              }
            />
            <ListItemText primary="Select All" />
          </MenuItem>

          {dropdownCces.map(cce => (
            <MenuItem key={cce} value={cce}>
              <Checkbox checked={selectedCces.includes(cce)} />
              <ListItemText primary={cce} />
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* BAR CHART */}
      <Box sx={{ height: 700, background: "#fff", borderRadius: 3, p: 3 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="cce" 
              angle={-50} 
              textAnchor="end" 
              height={140}
              tick={{ fontSize: 11 }}
            />
            <YAxis tickFormatter={v => isPercentage ? `${v.toFixed(0)}%` : v.toFixed(0)} />
            <Tooltip content={<CustomTooltip />} />
            
            {isAC
              ? (allSelected || !selectedMonths.length ? ["ALL"] : selectedMonths).flatMap(k => ([
                  <Bar 
                    key={`${k}-APPT`} 
                    dataKey={`${k}_APPT`} 
                    barSize={14} 
                    fill={MONTH_COLORS.APPT}
                  >
                    <LabelList position="top" />
                  </Bar>,
                  <Bar 
                    key={`${k}-CONV`} 
                    dataKey={`${k}_CONV`} 
                    barSize={14} 
                    fill={MONTH_COLORS.CONV}
                  >
                    <LabelList position="top" />
                  </Bar>
                ]))
              : (allSelected || !selectedMonths.length ? ["ALL"] : selectedMonths).map(key => (
                  <Bar 
                    key={key} 
                    dataKey={key} 
                    barSize={28}
                    label={<VerticalBranchLabel />}
                  >
                    <LabelList
                      position="top"
                      formatter={v => isPercentage ? `${v.toFixed(0)}%` : v.toFixed(0)}
                    />
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getBarColor(entry)} />
                    ))}
                  </Bar>
                ))}
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default CCConversionBarChartPage;
