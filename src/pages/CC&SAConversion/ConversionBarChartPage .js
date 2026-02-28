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

const MONTHS = [
  "APR","MAY","JUN","JUL","AUG","SEP",
  "OCT","NOV","DEC","JAN","FEB","MAR"
];

const BRANCHES = [
  "BALMATTA","SURATHKAL","ADYAR","BANTWAL","KADABA","VITTLA","SUJITH BAGH",
  "NEXA","NARAVI"
];

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
  ALL: "#2e7d32", APPT: "#1976d2", CONV: "#d32f2f",
};

const GROWTH_OPTIONS = ["PMS %", "Appointment", "Conversion", "A&C"];

const growthKeyMap = {
  "PMS %": "percentagePMS",
  "Appointment": "pmsAppointment",
  "Conversion": "pmsConversion",
};

const ConversionBarChartPage = ({ type = "sa" }) => {
  const navigate = useNavigate();
  
  const isSA = type === "sa";
  const titlePrefix = isSA ? "SA" : "CC";
  const personKey = isSA ? "saName" : "cceName";
  const personPlural = isSA ? "SAs" : "CCes";
  const personParam = isSA ? "saNames" : "cceNames";
  const apiPrefix = isSA ? "/api/sa" : "/api/cc";
  const lineRoute = isSA ? "/DashboardHome/sa_conversion" : "/DashboardHome/cc_conversion";
  const tableRoute = isSA ? "/DashboardHome/sa_conversion_table" : "/DashboardHome/cc_conversion_table";

  const [selectedMonths, setSelectedMonths] = useState([]);
  const [allSelected, setAllSelected] = useState(true);
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [selectedPersons, setSelectedPersons] = useState([]);
  const [selectedGrowth, setSelectedGrowth] = useState("PMS %");

  const [summary, setSummary] = useState([]);
  const [personKeys, setPersonKeys] = useState([]);
  const [branchPersonMap, setBranchPersonMap] = useState({});

  const normalize = v => v?.trim().toUpperCase() || "";
  const isPercentage = selectedGrowth === "PMS %";
  const isAC = selectedGrowth === "A&C";
  const growthKey = growthKeyMap[selectedGrowth];

  /* ---------- PERSON BRANCH MAPPING ---------- */
  const personBranchMap = useMemo(() => {
    const map = {};
    Object.entries(branchPersonMap).forEach(([branch, persons]) => {
      persons.forEach(person => {
        map[normalize(person)] = normalize(branch);
      });
    });
    return map;
  }, [branchPersonMap]);

  /* ---------- MASTER DATA ---------- */
  useEffect(() => {
    const loadMasterData = async () => {
      const res = await fetchData(`${apiPrefix}/${type}_conversion_summary`);
      const rows = Array.isArray(res) ? res : [];

      const map = {};
      rows.forEach(r => {
        const b = normalize(r.branch);
        const p = normalize(r[personKey]);
        if (!map[b]) map[b] = new Set();
        map[b].add(p);
      });

      const normalized = {};
      Object.keys(map).forEach(b => normalized[b] = [...map[b]]);
      setBranchPersonMap(normalized);
    };

    loadMasterData();
  }, [apiPrefix, type, personKey]);

  /* ---------- PERSON OPTIONS ---------- */
  const dropdownPersons = useMemo(() => {
    if (!selectedBranches.length) {
      return [...new Set(Object.values(branchPersonMap).flat())];
    }
    const set = new Set();
    selectedBranches.forEach(b =>
      branchPersonMap[normalize(b)]?.forEach(p => set.add(p))
    );
    return [...set];
  }, [selectedBranches, branchPersonMap]);

  const allPersonSelected =
    dropdownPersons.length > 0 &&
    selectedPersons.length === dropdownPersons.length;

  useEffect(() => {
    setSelectedPersons(prev => prev.filter(p => dropdownPersons.includes(p)));
  }, [dropdownPersons]);

  /* ---------- DATA FETCH ---------- */
  useEffect(() => {
    const loadData = async () => {
      const monthsToFetch = allSelected || !selectedMonths.length ? MONTHS : selectedMonths;
      const allData = [];
      const personSet = new Set();

      for (const month of monthsToFetch) {
        const query = `?months=${month}` +
          (selectedBranches.length ? `&branches=${selectedBranches.join(",")}` : "") +
          (selectedPersons.length ? `&${personParam}=${selectedPersons.join(",")}` : "");

        const res = await fetchData(`${apiPrefix}/${type}_conversion_summary${query}`);
        const rows = Array.isArray(res) ? res : [];

        rows.forEach(r => personSet.add(normalize(r[personKey])));
        allData.push({ month, data: rows });
      }

      setSummary(allData);
      setPersonKeys([...personSet]);
    };

    loadData();
  }, [selectedMonths, allSelected, selectedBranches, selectedPersons, apiPrefix, type, personKey, personParam]);

  /* ---------- CUSTOM TOOLTIP ---------- */
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const monthsForChart = allSelected || !selectedMonths.length ? MONTHS : selectedMonths;
      const chartEntry = chartData.find(entry => normalize(entry.person) === normalize(label));
      const branchName = chartEntry?.branch || 'N/A';
      
      return (
        <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.95)', borderRadius: 2, border: '1px solid #ccc', minWidth: 200 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1.5, color: '#1976d2' }}>
            {titlePrefix}: {label}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1.5, color: '#666', fontSize: '0.8rem' }}>
            Branch: {branchName}
          </Typography>
          
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
    const rows = personKeys.map(person => {
      let actualBranch = 'UNKNOWN';
      
      for (const { data } of summary) {
        const matchingRow = data.find(d => normalize(d[personKey]) === person);
        if (matchingRow) {
          actualBranch = normalize(matchingRow.branch);
          break;
        }
      }

      if (selectedBranches.length > 0) {
        const normalizedSelected = selectedBranches.map(normalize);
        if (!normalizedSelected.includes(actualBranch)) {
          return null;
        }
      }

      const row = { person, branch: actualBranch };
      let totalConv = 0, totalAppt = 0, totalVal = 0, count = 0;

      summary.forEach(({ month, data }) => {
        const r = data.find(d => normalize(d[personKey]) === person);
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
        rankValue = isPercentage ? (count ? totalVal / count : 0) : totalVal;
        if (allSelected || !selectedMonths.length) row.ALL = rankValue;
      }

      row.__rankValue = rankValue;
      row.__branchColor = BRANCH_COLORS[row.branch] || '#999';
      return row;
    });

    return rows.filter(row => row !== null).sort((a, b) => b.__rankValue - a.__rankValue);
  }, [personKeys, summary, allSelected, selectedMonths, growthKey, isPercentage, isAC, selectedBranches, personKey]);

  /* ---------- Custom Label ---------- */
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

  const selectedGradient = "linear-gradient(90deg, rgba(144,238,144,1) 0%, rgba(102,205,170,1) 100%)";
  const btnStyle = sel => ({
    borderRadius: 20,
    px: 2,
    py: 0.5,
    fontWeight: 600,
    background: sel ? selectedGradient : "#fff",
    border: sel ? "1.5px solid #388e3c" : "1px solid #bdbdbd",
  });

  const getBarColor = (entry) => isAC ? MONTH_COLORS.APPT || MONTH_COLORS.CONV : entry.__branchColor;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">{titlePrefix} CONVERSION – {selectedGrowth} (Bar)</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" onClick={() => navigate(lineRoute)}>Line Chart</Button>
          <Button variant="contained">Bar Chart</Button>
          <Button variant="contained" onClick={() => navigate(tableRoute)}>Table</Button>
        </Box>
      </Box>

      <Box sx={{ mb: 2, display: "flex", gap: 1.2, flexWrap: "wrap" }}>
        <Button size="small" sx={btnStyle(allSelected)} onClick={() => { setAllSelected(true); setSelectedMonths([]); }}>
          ALL
        </Button>
        {MONTHS.map(m => (
          <Button
            key={m}
            size="small"
            sx={btnStyle(selectedMonths.includes(m))}
            onClick={() => {
              setAllSelected(false);
              setSelectedMonths(p => p.includes(m) ? p.filter(x => x !== m) : [...p, m]);
            }}
          >
            {m}
          </Button>
        ))}
      </Box>

      <Box sx={{ mb: 2, display: "flex", gap: 1.2, flexWrap: "wrap" }}>
        {BRANCHES.map(b => (
          <Button
            key={b}
            size="small"
            sx={btnStyle(selectedBranches.includes(b))}
            onClick={() => setSelectedBranches(p => p.includes(b) ? p.filter(x => x !== b) : [...p, b])}
          >
            {b}
          </Button>
        ))}
      </Box>

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

      <Box sx={{ mb: 3, width: 320 }}>
        <Select
          multiple
          fullWidth
          value={selectedPersons}
          onChange={e => {
            const value = e.target.value;
            if (value.includes("ALL")) {
              setSelectedPersons(allPersonSelected ? [] : dropdownPersons);
            } else {
              setSelectedPersons(value);
            }
          }}
          input={<OutlinedInput />}
          renderValue={s => s.join(", ")}
        >
          <MenuItem value="ALL">
            <Checkbox
              checked={allPersonSelected}
              indeterminate={selectedPersons.length > 0 && selectedPersons.length < dropdownPersons.length}
            />
            <ListItemText primary="Select All" />
          </MenuItem>
          {dropdownPersons.map(person => (
            <MenuItem key={person} value={person}>
              <Checkbox checked={selectedPersons.includes(person)} />
              <ListItemText primary={person} />
            </MenuItem>
          ))}
        </Select>
      </Box>

      <Box sx={{ height: 700, background: "#fff", borderRadius: 3, p: 3 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="person" angle={-50} textAnchor="end" height={140} tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={v => isPercentage ? `${v.toFixed(0)}%` : v.toFixed(0)} />
            <Tooltip content={<CustomTooltip />} />
            
            {isAC
              ? (allSelected || !selectedMonths.length ? ["ALL"] : selectedMonths).flatMap(k => ([
                  <Bar key={`${k}-APPT`} dataKey={`${k}_APPT`} barSize={14} fill={MONTH_COLORS.APPT}>
                    <LabelList position="top" />
                  </Bar>,
                  <Bar key={`${k}-CONV`} dataKey={`${k}_CONV`} barSize={14} fill={MONTH_COLORS.CONV}>
                    <LabelList position="top" />
                  </Bar>
                ]))
              : (allSelected || !selectedMonths.length ? ["ALL"] : selectedMonths).map(key => (
                  <Bar key={key} dataKey={key} barSize={28} label={<VerticalBranchLabel />}>
                    <LabelList position="top" formatter={v => isPercentage ? `${v.toFixed(0)}%` : v.toFixed(0)} />
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

export default ConversionBarChartPage;
