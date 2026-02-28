// GenericConversionLineChart.jsx
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

const GenericConversionLineChart = ({
  type, // "sa" or "cc"
  title,
  xAxisDataKey,
  nameField,
  apiPrefix,
  tableRoute,
  barChartRoute,
}) => {
  const navigate = useNavigate();

  const [selectedMonths, setSelectedMonths] = useState([]);
  const [allSelected, setAllSelected] = useState(true);
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedGrowth, setSelectedGrowth] = useState("PMS %");

  const [summary, setSummary] = useState([]);
  const [itemKeys, setItemKeys] = useState([]);
  const [branchItemMap, setBranchItemMap] = useState({});

  const normalize = v => v?.trim().toUpperCase() || "";
  const isPercentage = selectedGrowth === "PMS %";
  const isAC = selectedGrowth === "A&C";
  const growthKey = growthKeyMap[selectedGrowth];
  const allItemSelected = itemKeys.length > 0 && selectedItems.length === itemKeys.length;
  const ALL_ITEM = `ALL_${type.toUpperCase()}`;

  /* ---------- MASTER DATA ---------- */
  useEffect(() => {
    const loadMasterData = async () => {
      const res = await fetchData(`/${apiPrefix}/${type}_conversion_summary`);
      const rows = Array.isArray(res) ? res : [];

      const map = {};
      rows.forEach(r => {
        const b = normalize(r.branch);
        const c = normalize(r[`${nameField}Name`]);
        if (!map[b]) map[b] = new Set();
        map[b].add(c);
      });

      const normalized = {};
      Object.keys(map).forEach(b => (normalized[b] = [...map[b]]));
      setBranchItemMap(normalized);
    };

    loadMasterData();
  }, [type, apiPrefix, nameField]);

  /* ---------- ITEM OPTIONS ---------- */
  const dropdownItems = useMemo(() => {
    if (!selectedBranches.length) {
      return [...new Set(Object.values(branchItemMap).flat())];
    }
    const set = new Set();
    selectedBranches.forEach(b =>
      branchItemMap[normalize(b)]?.forEach(c => set.add(c))
    );
    return [...set];
  }, [selectedBranches, branchItemMap]);

  useEffect(() => {
    setSelectedItems(prev => prev.filter(c => dropdownItems.includes(c)));
  }, [dropdownItems]);

  /* ---------- DATA FETCH ---------- */
  useEffect(() => {
    const loadData = async () => {
      const monthsToFetch = allSelected || !selectedMonths.length ? MONTHS : selectedMonths;
      const allData = [];
      const itemSet = new Set();

      for (const month of monthsToFetch) {
        const query =
          `?months=${month}` +
          (selectedBranches.length ? `&branches=${selectedBranches.join(",")}` : "") +
          (selectedItems.length ? `&${nameField}Names=${selectedItems.join(",")}` : "");

        const res = await fetchData(`/${apiPrefix}/${type}_conversion_summary${query}`);
        const rows = Array.isArray(res) ? res : [];

        rows.forEach(r => itemSet.add(normalize(r[`${nameField}Name`])));
        allData.push({ month, data: rows });
      }

      setSummary(allData);
      setItemKeys([...itemSet]);
    };

    loadData();
  }, [selectedMonths, allSelected, selectedBranches, selectedItems, type, apiPrefix, nameField]);

  /* ---------- CUSTOM TOOLTIP ---------- */
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const monthsForChart = allSelected || !selectedMonths.length ? MONTHS : selectedMonths;
      
      return (
        <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.9)', borderRadius: 2, border: '1px solid #ccc' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            {type.toUpperCase()}: {label}
          </Typography>
          
          {monthsForChart.map(month => {
            const dataPoint = payload.find(p => p.dataKey === month || p.dataKey === `${month}_APPT` || p.dataKey === `${month}_CONV`);
            
            if (dataPoint) {
              const displayValue = isPercentage 
                ? `${Math.round(dataPoint.value)}%` 
                : Math.round(dataPoint.value);
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
    const rows = itemKeys.map(item => {
      const row = { [xAxisDataKey]: item };

      let totalConv = 0;
      let totalAppt = 0;
      let totalVal = 0;
      let count = 0;

      summary.forEach(({ month, data }) => {
        const r = data.find(d => normalize(d[`${nameField}Name`]) === item);

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

      if (isAC && (allSelected || !selectedMonths.length)) {
        row.ALL_APPT = totalAppt;
        row.ALL_CONV = totalConv;
      }

      row.__rankValue = rankValue;
      return row;
    });

    return rows.sort((a, b) => b.__rankValue - a.__rankValue);
  }, [itemKeys, summary, allSelected, selectedMonths, growthKey, isPercentage, isAC, xAxisDataKey, nameField]);

  /* ---------- BUTTON STYLE ---------- */
  const selectedGradient = "linear-gradient(90deg, rgba(144,238,144,1) 0%, rgba(102,205,170,1) 100%)";

  const btnStyle = sel => ({
    borderRadius: 20,
    px: 2,
    py: 0.5,
    fontWeight: 600,
    background: sel ? selectedGradient : "#fff",
    border: sel ? "1.5px solid #388e3c" : "1px solid #bdbdbd",
  });

  /* ---------- NAVIGATION HANDLERS ---------- */
  const handleLineChartClick = () => {
    navigate(`/DashboardHome/${type}_conversion`);
  };

  const handleBarChartClick = () => {
    navigate(`/DashboardHome/${type}_conversion-bar-chart`);
  };

  const handleTableClick = () => {
    navigate(`/DashboardHome/${type}_conversion_table`);
  };

  /* ---------------- RENDER ---------------- */
  return (
    <Box sx={{ p: 3 }}>
      {/* HEADER */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">
          {title} – {selectedGrowth}
        </Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" onClick={handleLineChartClick}>
            Line Chart
          </Button>
          <Button variant="contained" onClick={handleBarChartClick}>
            Bar Chart
          </Button>
          <Button variant="contained" onClick={handleTableClick}>
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
              setSelectedMonths(p => p.includes(m) ? p.filter(x => x !== m) : [...p, m]); 
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
              setSelectedBranches(p => p.includes(b) ? p.filter(x => x !== b) : [...p, b])
            }
          >
            {b}
          </Button>
        ))}
      </Box>

      {/* GROWTH */}
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

      {/* ITEM DROPDOWN */}
      <Box sx={{ mb: 3, width: 320 }}>
        <Select
          multiple
          fullWidth
          value={selectedItems}
          input={<OutlinedInput />}
          renderValue={s => s.join(", ")}
          onChange={e => {
            const value = e.target.value;
            if (value.includes(ALL_ITEM)) {
              setSelectedItems(allItemSelected ? [] : dropdownItems);
            } else {
              setSelectedItems(value);
            }
          }}
        >
          <MenuItem value={ALL_ITEM}>
            <Checkbox checked={allItemSelected} />
            <ListItemText primary="Select All" />
          </MenuItem>
          {dropdownItems.map(item => (
            <MenuItem key={item} value={item}>
              <Checkbox checked={selectedItems.includes(item)} />
              <ListItemText primary={item} />
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* CHART */}
      <Box sx={{ height: 700, background: "#fff", borderRadius: 3, p: 3 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ bottom: 140 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisDataKey} angle={-50} textAnchor="end" interval={0} />
            <YAxis tickFormatter={v => isPercentage ? `${v.toFixed(0)}%` : v.toFixed(0)} />
            <Tooltip content={<CustomTooltip />} />

            {isAC
              ? (allSelected || !selectedMonths.length
                  ? [
                      <Line key="ALL_APPT" dataKey="ALL_APPT" stroke="#1976d2" strokeWidth={3}>
                        <LabelList position="top" />
                      </Line>,
                      <Line key="ALL_CONV" dataKey="ALL_CONV" stroke="#d32f2f" strokeWidth={3}>
                        <LabelList position="top" />
                      </Line>,
                    ]
                  : selectedMonths.flatMap(m => [
                      <Line key={`${m}-APPT`} dataKey={`${m}_APPT`} stroke="#1976d2" strokeWidth={3}>
                        <LabelList position="top" />
                      </Line>,
                      <Line key={`${m}-CONV`} dataKey={`${m}_CONV`} stroke="#d32f2f" strokeWidth={3}>
                        <LabelList position="top" />
                      </Line>,
                    ]))
              : (allSelected || !selectedMonths.length ? ["ALL"] : selectedMonths).map(key => (
                  <Line 
                    key={key} 
                    dataKey={key} 
                    strokeWidth={3} 
                    stroke={MONTH_COLORS[key]}
                  >
                    <LabelList 
                      position="top"
                      formatter={v => isPercentage ? `${v.toFixed(0)}%` : v.toFixed(0)} 
                    />
                  </Line>
                ))}
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default GenericConversionLineChart;
