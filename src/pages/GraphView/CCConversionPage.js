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
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LabelList,
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

const MONTH_COLORS = {
  APR: "#1f77b4", MAY: "#ff7f0e", JUN: "#2ca02c", JUL: "#d62728",
  AUG: "#9467bd", SEP: "#8c564b", OCT: "#e377c2", NOV: "#7f7f7f",
  DEC: "#bcbd22", JAN: "#17becf", FEB: "#4e79a7", MAR: "#f28e2b",
  ALL: "#2e7d32",
};

const GROWTH_OPTIONS = ["PMS %", "Appointment", "Conversion", "A&C"];

const growthKeyMap = {
  "PMS %": "percentagePMS",
  "Appointment": "pmsAppointment",
  "Conversion": "pmsConversion",
};

const ALL_CCE = "ALL";

/* ---------------- COMPONENT ---------------- */

const CCConversionPage = () => {
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
      Object.keys(map).forEach(b => (normalized[b] = [...map[b]]));
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

  /* ---------- CUSTOM TOOLTIP ---------- */
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // Get months in chronological order (selected or all)
      const monthsForChart = allSelected || !selectedMonths.length ? MONTHS : selectedMonths;
      
      return (
        <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.9)', borderRadius: 2, border: '1px solid #ccc' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            CCE: {label}
          </Typography>
          
          {/* Show data in chronological month order */}
          {monthsForChart.map(month => {
            const dataPoint = payload.find(p => p.dataKey === month || p.dataKey === `${month}_APPT` || p.dataKey === `${month}_CONV`);
            
            if (dataPoint) {
              const displayValue = isPercentage ? `${dataPoint.value}%` : dataPoint.value;
              return (
                <Box key={month} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                  <Typography variant="body2" sx={{ color: MONTH_COLORS[month], fontWeight: 500 }}>
                    {month}:
                  </Typography>
                  <Typography variant="body2">
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
      const row = { cce };

      let totalConv = 0;
      let totalAppt = 0;
      let totalVal = 0;
      let count = 0;

      summary.forEach(({ month, data }) => {
        const r = data.find(d => normalize(d.cceName) === cce);

        const conv = Math.round(Number(r?.pmsConversion ?? 0));
        const appt = Math.round(Number(r?.pmsAppointment ?? 0));
        const val = Math.round(Number(r?.[growthKey] ?? 0));

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
        rankValue = totalConv;

        if (allSelected || !selectedMonths.length) {
          row.ALL_APPT = totalAppt;
          row.ALL_CONV = totalConv;
        }
      } else if (isPercentage && (allSelected || !selectedMonths.length)) {
        rankValue = totalAppt ? Math.round((totalConv / totalAppt) * 100) : 0;
        row.ALL = rankValue;
      } else {
        rankValue = isPercentage
          ? count ? Math.round(totalVal / count) : 0
          : totalVal;

        if (allSelected || !selectedMonths.length) {
          row.ALL = rankValue;
        }
      }

      row.__rankValue = rankValue;
      return row;
    });

    return rows.sort((a, b) => b.__rankValue - a.__rankValue);
  }, [cceKeys, summary, allSelected, selectedMonths, growthKey, isPercentage, isAC]);

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

  /* ---------------- RENDER ---------------- */

  return (
    <Box sx={{ p: 3 }}>
      {/* HEADER */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">
          CC CONVERSION – {selectedGrowth}
        </Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/cc_conversion")}>Line Chart</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/cc_conversion-bar-chart")}>Bar Chart</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/cc_conversion_table")}>Table</Button>
        </Box>
      </Box>

      {/* MONTH FILTERS */}
      <Box sx={{ mb: 2, display: "flex", gap: 1.2, flexWrap: "wrap" }}>
        <Button size="small" sx={btnStyle(allSelected)} onClick={() => {
          setAllSelected(true); setSelectedMonths([]);
        }}>
          ALL
        </Button>

        {MONTHS.map(m => (
          <Button key={m} size="small" sx={btnStyle(selectedMonths.includes(m))}
            onClick={() => {
              setAllSelected(false);
              setSelectedMonths(p => p.includes(m) ? p.filter(x => x !== m) : [...p, m]);
            }}>
            {m}
          </Button>
        ))}
      </Box>

      {/* BRANCH FILTERS */}
      <Box sx={{ mb: 2, display: "flex", gap: 1.2, flexWrap: "wrap" }}>
        {BRANCHES.map(b => (
          <Button key={b} size="small" sx={btnStyle(selectedBranches.includes(b))}
            onClick={() =>
              setSelectedBranches(p =>
                p.includes(b) ? p.filter(x => x !== b) : [...p, b]
              )
            }>
            {b}
          </Button>
        ))}
      </Box>

      {/* GROWTH */}
      <Box sx={{ mb: 3, display: "flex", gap: 1.2 }}>
        {GROWTH_OPTIONS.map(g => (
          <Button key={g} size="small" sx={btnStyle(selectedGrowth === g)}
            onClick={() => setSelectedGrowth(g)}>
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
          input={<OutlinedInput />}
          renderValue={s => s.join(", ")}
          onChange={e => {
            const value = e.target.value;
            if (value.includes(ALL_CCE)) {
              setSelectedCces(allCceSelected ? [] : dropdownCces);
            } else {
              setSelectedCces(value);
            }
          }}
        >
          <MenuItem value={ALL_CCE}>
            <Checkbox checked={allCceSelected} />
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

      {/* CHART */}
      <Box sx={{ height: 700, background: "#fff", borderRadius: 3, p: 3 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ bottom: 140 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="cce" angle={-50} textAnchor="end" interval={0} />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            
            {isAC
              ? (allSelected || !selectedMonths.length ? ["ALL"] : selectedMonths).flatMap(m => [
                  <Line key={`${m}-A`} dataKey={`${m}_APPT`} stroke="#1976d2" strokeWidth={3}>
                    <LabelList 
                      position="top" 
                      formatter={(value) => `${value}`} 
                    />
                  </Line>,
                  <Line key={`${m}-C`} dataKey={`${m}_CONV`} stroke="#d32f2f" strokeWidth={3}>
                    <LabelList 
                      position="top" 
                      formatter={(value) => `${value}`} 
                    />
                  </Line>
                ])
              : (allSelected || !selectedMonths.length ? ["ALL"] : selectedMonths).map(key => (
                  <Line key={key} dataKey={key} stroke={MONTH_COLORS[key]} strokeWidth={3}>
                    <LabelList 
                      position="top" 
                      formatter={(value) => isPercentage ? `${value}%` : `${value}`}
                    />
                  </Line>
                ))}
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default CCConversionPage;
