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

const ALL_SA = "ALL";

/* ---------------- COMPONENT ---------------- */

const SAConversionPage = () => {
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

  /* ---------- MASTER DATA ---------- */
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
      Object.keys(map).forEach(b => (normalized[b] = [...map[b]]));
      setBranchSAMap(normalized);
    };

    loadMasterData();
  }, []);

  /* ---------- SA OPTIONS ---------- */
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

  const allSASelected =
    dropdownSAs.length > 0 &&
    selectedSAs.length === dropdownSAs.length;

  useEffect(() => {
    setSelectedSAs(prev => prev.filter(c => dropdownSAs.includes(c)));
  }, [dropdownSAs]);

  /* ---------- DATA FETCH ---------- */
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
      const row = { sa };

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

      if (isAC && (allSelected || !selectedMonths.length)) {
        row.ALL_APPT = totalAppt;
        row.ALL_CONV = totalConv;
      }

      let rankValue = 0;

      if (isAC) {
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
      return row;
    });

    return rows.sort((a, b) => b.__rankValue - a.__rankValue);
  }, [saKeys, summary, allSelected, selectedMonths, growthKey, isPercentage, isAC]);

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
          SA CONVERSION – {selectedGrowth}
        </Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/sa_conversion")}>Line Chart</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/sa_conversion-bar-chart")}>Bar Chart</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/sa_conversion_table")}>Table</Button>
        </Box>
      </Box>

      {/* MONTH FILTERS */}
      <Box sx={{ mb: 2, display: "flex", gap: 1.2, flexWrap: "wrap" }}>
        <Button size="small" sx={btnStyle(allSelected)} onClick={() => { setAllSelected(true); setSelectedMonths([]); }}>
          ALL
        </Button>
        {MONTHS.map(m => (
          <Button key={m} size="small" sx={btnStyle(selectedMonths.includes(m))}
            onClick={() => { setAllSelected(false); setSelectedMonths(p => p.includes(m) ? p.filter(x => x !== m) : [...p, m]); }}>
            {m}
          </Button>
        ))}
      </Box>

      {/* BRANCH FILTERS */}
      <Box sx={{ mb: 2, display: "flex", gap: 1.2, flexWrap: "wrap" }}>
        {BRANCHES.map(b => (
          <Button key={b} size="small" sx={btnStyle(selectedBranches.includes(b))}
            onClick={() => setSelectedBranches(p => p.includes(b) ? p.filter(x => x !== b) : [...p, b])}>
            {b}
          </Button>
        ))}
      </Box>

      {/* GROWTH */}
      <Box sx={{ mb: 3, display: "flex", gap: 1.2 }}>
        {GROWTH_OPTIONS.map(g => (
          <Button key={g} size="small" sx={btnStyle(selectedGrowth === g)} onClick={() => setSelectedGrowth(g)}>
            {g}
          </Button>
        ))}
      </Box>

      {/* SA DROPDOWN */}
      <Box sx={{ mb: 3, width: 320 }}>
        <Select
          multiple
          fullWidth
          value={selectedSAs}
          input={<OutlinedInput />}
          renderValue={s => s.join(", ")}
          onChange={e => {
            const value = e.target.value;
            if (value.includes(ALL_SA)) {
              setSelectedSAs(allSASelected ? [] : dropdownSAs);
            } else {
              setSelectedSAs(value);
            }
          }}
        >
          <MenuItem value={ALL_SA}>
            <Checkbox checked={allSASelected} />
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

      {/* CHART */}
      <Box sx={{ height: 700, background: "#fff", borderRadius: 3, p: 3 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ bottom: 140 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="sa" angle={-50} textAnchor="end" interval={0} />
            <YAxis tickFormatter={v => isPercentage ? `${v.toFixed(0)}%` : v.toFixed(0)} />
            <Tooltip formatter={v => isPercentage ? `${v.toFixed(0)}%` : v.toFixed(0)} />

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
                  <Line key={key} dataKey={key} strokeWidth={3} stroke={MONTH_COLORS[key]}>
                    <LabelList position="top"
                      formatter={v => isPercentage ? `${v.toFixed(0)}%` : v.toFixed(0)} />
                  </Line>
                ))}
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default SAConversionPage;
