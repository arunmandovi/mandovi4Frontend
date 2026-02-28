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
import { useNavigate, useParams } from "react-router-dom";
import { fetchData } from "../../api/uploadService";
import * as XLSX from 'xlsx';

const MONTHS = ["APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC","JAN","FEB","MAR"];
const BRANCHES = [
  "BALMATTA","SURATHKAL","ADYAR","SULLIA","UPPINANGADY",
  "YEYYADI","BANTWAL","KADABA","VITTLA","SUJITH BAGH","NEXA","NARAVI"
];

const ConversionTablePage = ({ type }) => {
  const navigate = useNavigate();
  const { personType } = useParams(); // Optional: for dynamic routing

  const isSA = type === 'sa';
  const isCC = type === 'cc';
  
  const title = `${isSA ? 'SA' : 'CC'} CONVERSION – TABLE`;
  const apiPrefix = isSA ? '/api/sa/sa_conversion_summary' : '/api/cc/cc_conversion_summary';
  const personKey = isSA ? 'saName' : 'cceName';
  const personLabel = isSA ? 'SA' : 'CCE';
  const allPerson = isSA ? 'ALL_SA' : 'ALL_CCE';
  const personState = isSA ? 'selectedSAs' : 'selectedCces';
  const setPersonState = isSA ? 'setSelectedSAs' : 'setSelectedCces';
  const branchMapState = isSA ? 'branchSAMap' : 'branchCceMap';
  const dropdownPersons = isSA ? 'dropdownSAs' : 'dropdownCces';

  const [selectedMonths, setSelectedMonths] = useState([]);
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [selectedPersons, setSelectedPersons] = useState([]);
  const [rawRows, setRawRows] = useState([]);
  const [branchPersonMap, setBranchPersonMap] = useState({});
  const [metrics, setMetrics] = useState({ A: false, C: false, P: false });

  const showAll = !metrics.A && !metrics.C && !metrics.P;
  const showA = showAll || metrics.A;
  const showC = showAll || metrics.C;
  const showP = showAll || metrics.P;

  const normalize = (v) => v?.trim().toUpperCase() || "";

  /* ---------- DOWNLOAD FUNCTION ---------- */
  const downloadExcel = () => {
    if (tableRows.length === 0) return;

    const headers = ['Branch', personLabel];
    if (isCC) headers.push('Exp'); // Only CC has Exp column
    
    existingMonths.forEach(month => {
      if (showA) headers.push(`${month}_A`);
      if (showC) headers.push(`${month}_C`);
      if (showP) headers.push(`${month}_P`);
    });
    if (showA) headers.push('TOTAL_A');
    if (showC) headers.push('TOTAL_C');
    if (showP) headers.push('TOTAL_P');

    const data = tableRows.map(row => {
      const rowData = { 
        Branch: row.branch, 
        [personLabel]: row[personKey]
      };
      
      if (isCC) {
        rowData.Exp = row.experienceDays?.toFixed(1) ?? '';
      }
      
      existingMonths.forEach(month => {
        const dataMonth = row.months[month];
        if (showA) rowData[`${month}_A`] = dataMonth?.pmsAppointment ?? '';
        if (showC) rowData[`${month}_C`] = dataMonth?.pmsConversion ?? '';
        if (showP) rowData[`${month}_P`] = dataMonth ? `${dataMonth.percentagePMS.toFixed(0)}%` : '';
      });
      
      if (showA) rowData['TOTAL_A'] = row.totalApt;
      if (showC) rowData['TOTAL_C'] = row.totalConv;
      if (showP) rowData['TOTAL_P'] = `${row.totalPct.toFixed(0)}%`;
      
      return rowData;
    });

    const ws = XLSX.utils.json_to_sheet(data, { header: headers });
    const colWidths = headers.map(h => ({
      wch: Math.max(10, h.length, ...data.map(row => String(row[h] || '').length))
    }));
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${isSA ? 'SA' : 'CC'} Conversion Summary`);
    
    const filters = [];
    if (selectedMonths.length) filters.push(`Months_${selectedMonths.join('_')}`);
    if (selectedBranches.length) filters.push(`Branches_${selectedBranches.slice(0,3).join('_')}${selectedBranches.length > 3 ? '_etc' : ''}`);
    const filename = `${isSA ? 'SA' : 'CC'}_Conversion_${new Date().toISOString().slice(0,10)}${filters.length ? '_' + filters.join('_') : ''}.xlsx`;
    
    XLSX.writeFile(wb, filename);
  };

  /* ---------- MASTER DATA ---------- */
  useEffect(() => {
    const load = async () => {
      const res = await fetchData(apiPrefix);
      const map = {};
      (Array.isArray(res) ? res : []).forEach(r => {
        const b = normalize(r.branch);
        const p = normalize(r[personKey]);
        if (!map[b]) map[b] = new Set();
        map[b].add(p);
      });
      const out = {};
      Object.keys(map).forEach(b => out[b] = [...map[b]].sort());
      setBranchPersonMap(out);
    };
    load();
  }, [apiPrefix, personKey]);

  /* ---------- PERSON OPTIONS ---------- */
  const dropdownPersonsMemo = useMemo(() => {
    if (!selectedBranches.length)
      return [...new Set(Object.values(branchPersonMap).flat())].sort();

    const s = new Set();
    selectedBranches.forEach(b =>
      branchPersonMap[normalize(b)]?.forEach(p => s.add(p))
    );
    return [...s].sort();
  }, [selectedBranches, branchPersonMap]);

  const allPersonSelected = 
    dropdownPersonsMemo.length > 0 &&
    selectedPersons.length === dropdownPersonsMemo.length;

  useEffect(() => {
    setSelectedPersons(prev => prev.filter(p => dropdownPersonsMemo.includes(p)));
  }, [dropdownPersonsMemo]);

  /* ---------- FETCH DATA ---------- */
  useEffect(() => {
    const load = async () => {
      const months = selectedMonths.length ? selectedMonths : MONTHS;
      let all = [];
      for (const m of months) {
        const q =
          `?months=${m}` +
          (selectedBranches.length ? `&branches=${selectedBranches.join(",")}` : "") +
          (selectedPersons.length ? `&${isSA ? 'saNames' : 'cceNames'}=${selectedPersons.join(",")}` : "");
        const res = await fetchData(`${apiPrefix}${q}`);
        if (Array.isArray(res)) all.push(...res.map(r => ({ ...r, month: m })));
      }
      setRawRows(all);
    };
    load();
  }, [selectedMonths, selectedBranches, selectedPersons, apiPrefix, isSA]);

  const existingMonths = useMemo(
    () => MONTHS.filter(m => rawRows.some(r => r.month === m)),
    [rawRows]
  );

  /* ---------- TABLE DATA ---------- */
  const tableRows = useMemo(() => {
    const map = {};
    rawRows.forEach(r => {
      const k = `${r.branch}|${r[personKey]}`;
      if (!map[k]) {
        map[k] = {
          branch: r.branch,
          [personKey]: r[personKey],
          ...(isCC && { experienceDays: r.experienceDays }),
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
  }, [rawRows, personKey, isCC]);

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
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3, alignItems: "center" }}>
        <Typography variant="h4">{title}</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" onClick={() => navigate(`/DashboardHome/${type}_conversion`)}>Line Chart</Button>
          <Button variant="contained" onClick={() => navigate(`/DashboardHome/${type}_conversion-bar-chart`)}>Bar Chart</Button>
          <Button variant="contained">Table</Button>
          <Button 
            variant="contained" 
            color="success"
            onClick={downloadExcel}
            disabled={tableRows.length === 0}
            sx={{ minWidth: 120 }}
          >
            Download
          </Button>
        </Box>
      </Box>

      {/* Filters - identical for both */}
      <Box sx={{ mb: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
        {MONTHS.map(m => (
          <Button key={m} size="small" sx={slicerStyle(selectedMonths.includes(m))}
            onClick={() => setSelectedMonths(p => p.includes(m) ? p.filter(x => x !== m) : [...p, m])}>
            {m}
          </Button>
        ))}
      </Box>

      <Box sx={{ mb: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
        {BRANCHES.map(b => (
          <Button key={b} size="small" sx={slicerStyle(selectedBranches.includes(b))}
            onClick={() => setSelectedBranches(p => p.includes(b) ? p.filter(x => x !== b) : [...p, b])}>
            {b}
          </Button>
        ))}
      </Box>

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

      <Box sx={{ mb: 3, width: 320 }}>
        <Select
          multiple
          fullWidth
          value={selectedPersons}
          input={<OutlinedInput />}
          renderValue={(s) => s.join(", ")}
          onChange={(e) => {
            const value = e.target.value;
            if (value.includes(allPerson)) {
              setSelectedPersons(allPersonSelected ? [] : dropdownPersonsMemo);
            } else {
              setSelectedPersons(value);
            }
          }}
        >
          <MenuItem value={allPerson}>
            <Checkbox checked={allPersonSelected} />
            <ListItemText primary="Select All" />
          </MenuItem>
          {dropdownPersonsMemo.map(p => (
            <MenuItem key={p} value={p}>
              <Checkbox checked={selectedPersons.includes(p)} />
              <ListItemText primary={p} />
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* Dynamic Table Header & Body - ALL VALUES NOW BOLD */}
      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 4, border: "2px solid #455a64" }}>
        <Table size="small" sx={{ 
          borderCollapse: "collapse", 
          "& th, & td": { 
            border: "1px solid #9e9e9e",
            fontWeight: 700  // ALL CELLS BOLD
          } 
        }}>
          <TableHead>
            <TableRow sx={{ background: "#718390ff", "& th": { color: "#fff", fontWeight: 800 } }}>
              <TableCell rowSpan={2}>Branch</TableCell>
              <TableCell rowSpan={2}>{personLabel}</TableCell>
              {isCC && <TableCell rowSpan={2}>Exp</TableCell>}
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
                <TableCell sx={{ fontWeight: 700 }}>{r[personKey]}</TableCell>
                {isCC && <TableCell align="center" sx={{ fontWeight: 700 }}>{r.experienceDays?.toFixed(1) ?? "-"}</TableCell>}
                {existingMonths.map(m => {
                  const d = r.months[m];
                  return (
                    <React.Fragment key={m}>
                      {showA && <TableCell align="center" sx={{ fontWeight: 700 }}>{d?.pmsAppointment ?? "-"}</TableCell>}
                      {showC && <TableCell align="center" sx={{ fontWeight: 700 }}>{d?.pmsConversion ?? "-"}</TableCell>}
                      {showP && <TableCell align="center" sx={{ fontWeight: 700 }}>{d ? `${d.percentagePMS.toFixed(0)}%` : "-"}</TableCell>}
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

export default ConversionTablePage;
