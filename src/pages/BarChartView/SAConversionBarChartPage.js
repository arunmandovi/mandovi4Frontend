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
  ALL: "#2e7d32", APPT: "#1976d2", CONV: "#d32f2f",
};

const GROWTH_OPTIONS = ["PMS %", "Appointment", "Conversion", "A&C"];

const growthKeyMap = {
  "PMS %": "percentagePMS",
  "Appointment": "pmsAppointment",
  "Conversion": "pmsConversion",
};

const SAConversionBarChartPage = () => {
  const navigate = useNavigate();

  const [selectedMonths, setSelectedMonths] = useState([]);
  const [allSelected, setAllSelected] = useState(true);
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [selectedSAs, setSelectedSAs] = useState([]);
  const [selectedGrowth, setSelectedGrowth] = useState("PMS %");

  const [summary, setSummary] = useState([]);
  const [saKeys, setSAKeys] = useState([]);
  const [branchSAMap, setBranchSAMap] = useState({});

  const normalize = v => v?.trim().toUpperCase() || "";
  const isPercentage = selectedGrowth === "PMS %";
  const isAC = selectedGrowth === "A&C";
  const growthKey = growthKeyMap[selectedGrowth];

  /* ---------- SA BRANCH MAPPING ---------- */
  const saBranchMap = useMemo(() => {
    const map = {};
    Object.entries(branchSAMap).forEach(([branch, sas]) => {
      sas.forEach(sa => {
        map[normalize(sa)] = normalize(branch);
      });
    });
    return map;
  }, [branchSAMap]);

  useEffect(() => {
    const loadMasterData = async () => {
      const res = await fetchData(`/api/sa/sa_conversion_summary`);
      const rows = Array.isArray(res) ? res : [];

      const map = {};
      rows.forEach(r => {
        const b = normalize(r.branch);
        const c = normalize(r.saName);
        if (!map[b]) map[b] = new Set();
        map[b].add(c);
      });

      const normalized = {};
      Object.keys(map).forEach(b => normalized[b] = [...map[b]]);
      setBranchSAMap(normalized);
    };

    loadMasterData();
  }, []);

  const dropdownSAs = useMemo(() => {
    if (!selectedBranches.length) {
      return [...new Set(Object.values(branchSAMap).flat())];
    }
    const set = new Set();
    selectedBranches.forEach(b =>
      branchSAMap[normalize(b)]?.forEach(c => set.add(c))
    );
    return [...set];
  }, [selectedBranches, branchSAMap]);

  useEffect(() => {
    setSelectedSAs(prev => prev.filter(c => dropdownSAs.includes(c)));
  }, [dropdownSAs]);

  useEffect(() => {
    const loadData = async () => {
      const monthsToFetch =
        allSelected || !selectedMonths.length ? MONTHS : selectedMonths;

      const allData = [];
      const saSet = new Set();

      for (const month of monthsToFetch) {
        const query =
          `?months=${month}` +
          (selectedBranches.length ? `&branches=${selectedBranches.join(",")}` : "") +
          (selectedSAs.length ? `&saNames=${selectedSAs.join(",")}` : "");

        const res = await fetchData(`/api/sa/sa_conversion_summary${query}`);
        const rows = Array.isArray(res) ? res : [];

        rows.forEach(r => saSet.add(normalize(r.saName)));
        allData.push({ month, data: rows });
      }

      setSummary(allData);
      setSAKeys([...saSet]);
    };

    loadData();
  }, [selectedMonths, allSelected, selectedBranches, selectedSAs]);

  /* ---------- CHART DATA ---------- */
  const chartData = useMemo(() => {
    const rows = saKeys.map(sa => {
      const row = { 
        sa,
        branch: saBranchMap[sa] || 'UNKNOWN'
      };

      let totalConv = 0;
      let totalAppt = 0;
      let totalVal = 0;
      let count = 0;

      summary.forEach(({ month, data }) => {
        const r = data.find(d => normalize(d.saName) === sa);

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

    return rows.sort((a, b) => b.__rankValue - a.__rankValue);
  }, [saKeys, summary, allSelected, selectedMonths, growthKey, isPercentage, isAC, saBranchMap]);

  /* ---------- Custom Label Component for Vertical Branch Names INSIDE Bars ---------- */
  const VerticalBranchLabel = ({ x, y, width, height, value, index }) => {
    const entry = chartData[index];
    const branchName = entry?.branch || '';
    
    if (!branchName || branchName === 'UNKNOWN') return null;

    // Truncate long branch names
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

  const allSASelected =
    dropdownSAs.length > 0 &&
    selectedSAs.length === dropdownSAs.length;

  const getBarColor = (entry) => {
    if (isAC) {
      return MONTH_COLORS.APPT || MONTH_COLORS.CONV;
    }
    return entry.__branchColor;
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* HEADER */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">
          SA CONVERSION – {selectedGrowth} (Bar)
        </Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/sa_conversion")}>
            Line Chart
          </Button>
          <Button variant="contained">Bar Chart</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/sa_conversion_table")}>
            Table
          </Button>
        </Box>
      </Box>

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
          value={selectedSAs}
          onChange={e => {
            const value = e.target.value;
            if (value.includes("ALL")) {
              setSelectedSAs(allSASelected ? [] : dropdownSAs);
            } else {
              setSelectedSAs(value);
            }
          }}
          input={<OutlinedInput />}
          renderValue={s => s.join(", ")}
        >
          <MenuItem value="ALL">
            <Checkbox
              checked={allSASelected}
              indeterminate={
                selectedSAs.length > 0 &&
                selectedSAs.length < dropdownSAs.length
              }
            />
            <ListItemText primary="Select All" />
          </MenuItem>

          {dropdownSAs.map(sa => (
            <MenuItem key={sa} value={sa}>
              <Checkbox checked={selectedSAs.includes(sa)} />
              <ListItemText primary={sa} />
            </MenuItem>
          ))}
        </Select>
      </Box>

      <Box sx={{ height: 700, background: "#fff", borderRadius: 3, p: 3 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="sa" angle={-50} textAnchor="end" height={140} tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={v => isPercentage ? `${v.toFixed(0)}%` : v.toFixed(0)} />
            <Tooltip 
              formatter={v => isPercentage ? [`${v.toFixed(0)}%`, 'Value'] : [v.toFixed(0), 'Value']}
              labelFormatter={label => `SA: ${label} (${chartData.find(d => d.sa === label)?.branch || 'N/A'})`}
            />

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

export default SAConversionBarChartPage;
