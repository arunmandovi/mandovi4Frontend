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
} from "recharts";

const MONTHS = ["APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC","JAN","FEB","MAR"];
const BRANCHES = [
  "BALMATTA","SURATHKAL","ADYAR","SULLIA","UPPINANGADY",
  "YEYYADI","BANTWAL","KADABA","VITTLA","SUJITH BAGH","NEXA","NARAVI"
];

const CCConversionBarChartPage = () => {
  const navigate = useNavigate();

  const [selectedMonths, setSelectedMonths] = useState([]);
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [selectedCces, setSelectedCces] = useState([]);

  const [summary, setSummary] = useState([]);
  const [cceKeys, setCceKeys] = useState([]);
  const [branchCceMap, setBranchCceMap] = useState({});

  const normalize = (v) => v?.trim().toUpperCase() || "";

  /* ---------- MASTER DATA ---------- */
  useEffect(() => {
    const loadMasterData = async () => {
      const res = await fetchData(`/api/cc/cc_conversion_summary`);
      const rows = Array.isArray(res) ? res : [];

      const map = {};
      rows.forEach(r => {
        const branch = normalize(r.branch);
        const cce = normalize(r.cceName);
        if (!map[branch]) map[branch] = new Set();
        map[branch].add(cce);
      });

      const normalizedMap = {};
      Object.keys(map).forEach(b => {
        normalizedMap[b] = [...map[b]].sort();
      });

      setBranchCceMap(normalizedMap);
    };

    loadMasterData();
  }, []);

  /* ---------- CCE OPTIONS ---------- */
  const dropdownCces = useMemo(() => {
    if (!selectedBranches.length) {
      return [...new Set(Object.values(branchCceMap).flat())].sort();
    }

    const set = new Set();
    selectedBranches.forEach(b => {
      branchCceMap[normalize(b)]?.forEach(cce => set.add(cce));
    });

    return [...set].sort();
  }, [selectedBranches, branchCceMap]);

  useEffect(() => {
    setSelectedCces(prev => prev.filter(cce => dropdownCces.includes(cce)));
  }, [dropdownCces]);

  /* ---------- FETCH DATA ---------- */
  useEffect(() => {
    const loadData = async () => {
      const monthsToFetch = selectedMonths.length ? selectedMonths : MONTHS;
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
      setCceKeys([...cceSet].sort());
    };

    loadData();
  }, [selectedMonths, selectedBranches, selectedCces]);

  /* ---------- CHART DATA ---------- */
  const chartData = cceKeys.map(cce => {
    const row = { cce };
    summary.forEach(({ month, data }) => {
      const r = data.find(d => normalize(d.cceName) === cce);
      row[month] = Math.round(Number(r?.percentagePMS ?? 0));
    });
    return row;
  });

  /* ---------- SLICER BUTTON STYLE ---------- */
  const selectedGradient =
    "linear-gradient(90deg, rgba(144,238,144,1) 0%, rgba(102,205,170,1) 100%)";

  const slicerButtonStyle = (selected) => ({
    borderRadius: "20px",
    px: 2,
    py: 0.5,
    textTransform: "none",
    fontWeight: 600,
    transition: "all 0.25s ease",
    background: selected ? selectedGradient : "#fff",
    border: selected ? "1.5px solid #388e3c" : "1px solid #bdbdbd",
    boxShadow: selected ? "0 3px 10px rgba(0,0,0,0.15)" : "none",
    "&:hover": {
      transform: "scale(1.05)",
      background: selected ? selectedGradient : "rgba(0,0,0,0.04)",
    },
  });

  return (
    <Box sx={{ p: 3 }}>
      {/* HEADER */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">CC CONVERSION – PMS % (Bar)</Typography>
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

      {/* MONTH SLICER */}
      <Box sx={{ mb: 2, display: "flex", gap: 1.2, flexWrap: "wrap" }}>
        {MONTHS.map(m => (
          <Button
            key={m}
            size="small"
            sx={slicerButtonStyle(selectedMonths.includes(m))}
            onClick={() =>
              setSelectedMonths(p =>
                p.includes(m) ? p.filter(x => x !== m) : [...p, m]
              )
            }
          >
            {m}
          </Button>
        ))}
      </Box>

      {/* BRANCH SLICER */}
      <Box sx={{ mb: 2, display: "flex", gap: 1.2, flexWrap: "wrap" }}>
        {BRANCHES.map(b => (
          <Button
            key={b}
            size="small"
            sx={slicerButtonStyle(selectedBranches.includes(b))}
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

      {/* CCE DROPDOWN */}
      <Box sx={{ mb: 3, width: 320 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Filter by CCE Name
        </Typography>
        <Select
          multiple
          fullWidth
          value={selectedCces}
          onChange={(e) => setSelectedCces(e.target.value)}
          input={<OutlinedInput />}
          renderValue={(selected) => selected.join(", ")}
        >
          {dropdownCces.map(cce => (
            <MenuItem key={cce} value={cce}>
              <Checkbox checked={selectedCces.includes(cce)} />
              <ListItemText primary={cce} />
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* BAR CHART */}
      {!chartData.length ? (
        <Typography>No data available</Typography>
      ) : (
        <Box sx={{ height: 700, background: "#fff", borderRadius: 3, boxShadow: 3, p: 3 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="cce" angle={-50} textAnchor="end" height={150} />
              <YAxis tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(v) => `${v}%`} 
               itemSorter={(item) => MONTHS.indexOf(item.dataKey)}  
              />
              {summary.map(s => (
                <Bar
                  key={s.month}
                  dataKey={s.month}
                  barSize={18}
                  fill={`#${Math.floor(Math.random() * 16777215).toString(16)}`}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Box>
  );
};

export default CCConversionBarChartPage;
