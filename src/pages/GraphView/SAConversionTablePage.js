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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { fetchData } from "../../api/uploadService";

const MONTHS = ["APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC","JAN","FEB","MAR"];
const BRANCHES = [
  "BALMATTA","SURATHKAL","ADYAR","SULLIA","UPPINANGADY",
  "YEYYADI","BANTWAL","KADABA","VITTLA","SUJITH BAGH","NEXA","NARAVI"
];

const ALL_SA = "ALL";

const SAConversionTablePage = () => {
  const navigate = useNavigate();

  const [selectedMonths, setSelectedMonths] = useState([]);
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [selectedSAs, setSelectedSAs] = useState([]);
  const [rawRows, setRawRows] = useState([]);
  const [branchSAMap, setBranchSAMap] = useState({});

  /* ✅ METRIC TOGGLE STATE */
  const [metrics, setMetrics] = useState({ A: false, C: false, P: false });

  const showAll = !metrics.A && !metrics.C && !metrics.P;
  const showA = showAll || metrics.A;
  const showC = showAll || metrics.C;
  const showP = showAll || metrics.P;

  const normalize = (v) => v?.trim().toUpperCase() || "";

  /* ---------- MASTER DATA ---------- */
  useEffect(() => {
    const load = async () => {
      const res = await fetchData(`/api/sa/sa_conversion_summary`);
      const map = {};
      (Array.isArray(res) ? res : []).forEach(r => {
        const b = normalize(r.branch);
        const c = normalize(r.saName);
        if (!map[b]) map[b] = new Set();
        map[b].add(c);
      });
      const out = {};
      Object.keys(map).forEach(b => out[b] = [...map[b]].sort());
      setBranchSAMap(out);
    };
    load();
  }, []);

  /* ---------- SA OPTIONS ---------- */
  const dropdownSAs = useMemo(() => {
    if (!selectedBranches.length)
      return [...new Set(Object.values(branchSAMap).flat())].sort();

    const s = new Set();
    selectedBranches.forEach(b =>
      branchSAMap[normalize(b)]?.forEach(c => s.add(c))
    );
    return [...s].sort();
  }, [selectedBranches, branchSAMap]);

  const allSASelected =
    dropdownSAs.length > 0 &&
    selectedSAs.length === dropdownSAs.length;

  useEffect(() => {
    setSelectedSAs(prev => prev.filter(c => dropdownSAs.includes(c)));
  }, [dropdownSAs]);

  /* ---------- FETCH DATA ---------- */
  useEffect(() => {
    const load = async () => {
      const months = selectedMonths.length ? selectedMonths : MONTHS;
      let all = [];
      for (const m of months) {
        const q =
          `?months=${m}` +
          (selectedBranches.length ? `&branches=${selectedBranches.join(",")}` : "") +
          (selectedSAs.length ? `&saNames=${selectedSAs.join(",")}` : "");
        const res = await fetchData(`/api/sa/sa_conversion_summary${q}`);
        if (Array.isArray(res)) all.push(...res.map(r => ({ ...r, month: m })));
      }
      setRawRows(all);
    };
    load();
  }, [selectedMonths, selectedBranches, selectedSAs]);

  const existingMonths = useMemo(
    () => MONTHS.filter(m => rawRows.some(r => r.month === m)),
    [rawRows]
  );

  /* ---------- TABLE DATA ---------- */
  const tableRows = useMemo(() => {
    const map = {};

    rawRows.forEach(r => {
      const k = `${r.branch}|${r.saName}`;
      if (!map[k]) {
        map[k] = {
          branch: r.branch,
          saName: r.saName,
          months: {},
          totalApt: 0,
          totalConv: 0,
        };
      }
      map[k].months[r.month] = r;
      map[k].totalApt += r.pmsAppointment || 0;
      map[k].totalConv += r.pmsConversion || 0;
    });

    return Object.values(map)
      .map(r => ({
        ...r,
        totalPct: r.totalApt > 0 ? (r.totalConv / r.totalApt) * 100 : 0,
      }))
      .sort((a, b) => b.totalConv - a.totalConv || b.totalPct - a.totalPct);
  }, [rawRows]);

  const slicerStyle = (selected) => ({
    borderRadius: 20,
    fontWeight: 600,
    textTransform: "none",
    px: 2,
    background: selected ? "#c8e6c9" : "#fff",
    border: "1px solid #9ccc65",
    "&:hover": { background: "#aed581" },
  });

  return (
    <Box sx={{ p: 3 }}>
      {/* HEADER */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">SA CONVERSION – TABLE</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/sa_conversion")}>Line Chart</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/sa_conversion-bar-chart")}>Bar Chart</Button>
          <Button variant="contained">Table</Button>
        </Box>
      </Box>

      {/* MONTH FILTER */}
      <Box sx={{ mb: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
        {MONTHS.map(m => (
          <Button key={m} size="small" sx={slicerStyle(selectedMonths.includes(m))}
            onClick={() => setSelectedMonths(p => p.includes(m) ? p.filter(x => x !== m) : [...p, m])}>
            {m}
          </Button>
        ))}
      </Box>

      {/* BRANCH FILTER */}
      <Box sx={{ mb: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
        {BRANCHES.map(b => (
          <Button key={b} size="small" sx={slicerStyle(selectedBranches.includes(b))}
            onClick={() => setSelectedBranches(p => p.includes(b) ? p.filter(x => x !== b) : [...p, b])}>
            {b}
          </Button>
        ))}
      </Box>

      {/* METRIC FILTER (ADDED – SAME AS CC) */}
      <Box sx={{ mb: 2, display: "flex", gap: 1 }}>
        {[
          { k: "A", l: "Appointment" },
          { k: "C", l: "Conversion" },
          { k: "P", l: "PMS %" },
        ].map(m => (
          <Button key={m.k} size="small" sx={slicerStyle(metrics[m.k])}
            onClick={() => setMetrics(p => ({ ...p, [m.k]: !p[m.k] }))}>
            {m.l}
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
          renderValue={(s) => s.join(", ")}
          onChange={(e) => {
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
          {dropdownSAs.map(c => (
            <MenuItem key={c} value={c}>
              <Checkbox checked={selectedSAs.includes(c)} />
              <ListItemText primary={c} />
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* TABLE */}
      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 4, border: "2px solid #455a64" }}>
        <Table size="small" sx={{ borderCollapse: "collapse", "& th, & td": { border: "1px solid #9e9e9e" } }}>
          <TableHead>
            <TableRow sx={{ background: "#718390ff", "& th": { color: "#fff", fontWeight: 800 } }}>
              <TableCell rowSpan={2}>Branch</TableCell>
              <TableCell rowSpan={2}>SA</TableCell>

              {existingMonths.map(m => (
                <TableCell key={m} colSpan={(showA?1:0)+(showC?1:0)+(showP?1:0)} align="center">
                  {m}
                </TableCell>
              ))}
              <TableCell colSpan={(showA?1:0)+(showC?1:0)+(showP?1:0)} align="center" sx={{ background: "#1551d4ff" }}>
                TOTAL
              </TableCell>
            </TableRow>

            <TableRow sx={{ background: "#aeb37aff", "& th": { fontWeight: 700 } }}>
              {existingMonths.map(m => (
                <React.Fragment key={m}>
                  {showA && <TableCell align="center">A</TableCell>}
                  {showC && <TableCell align="center">C</TableCell>}
                  {showP && <TableCell align="center">%</TableCell>}
                </React.Fragment>
              ))}
              {showA && <TableCell align="center">A</TableCell>}
              {showC && <TableCell align="center">C</TableCell>}
              {showP && <TableCell align="center">%</TableCell>}
            </TableRow>
          </TableHead>

          <TableBody>
            {tableRows.map((r, i) => (
              <TableRow key={i} sx={{ background: i % 2 ? "#fafafa" : "#fff" }}>
                <TableCell sx={{ fontWeight: 800 }}>{r.branch}</TableCell>
                <TableCell>{r.saName}</TableCell>

                {existingMonths.map(m => {
                  const d = r.months[m];
                  return (
                    <React.Fragment key={m}>
                      {showA && <TableCell align="center">{d?.pmsAppointment ?? "-"}</TableCell>}
                      {showC && <TableCell align="center">{d?.pmsConversion ?? "-"}</TableCell>}
                      {showP && <TableCell align="center">{d ? `${d.percentagePMS.toFixed(0)}%` : "-"}</TableCell>}
                    </React.Fragment>
                  );
                })}

                {showA && <TableCell align="center" sx={{ fontWeight: 800 }}>{r.totalApt}</TableCell>}
                {showC && <TableCell align="center" sx={{ fontWeight: 800 }}>{r.totalConv}</TableCell>}
                {showP && <TableCell align="center" sx={{ fontWeight: 900 }}>{r.totalPct.toFixed(0)}%</TableCell>}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default SAConversionTablePage;
