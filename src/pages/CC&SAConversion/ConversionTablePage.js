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
  IconButton,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { 
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowUp as ArrowUpIcon,
  Close as CloseIcon 
} from "@mui/icons-material";
import { fetchData } from "../../api/uploadService";
import * as XLSX from 'xlsx';

const MONTHS = ["APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC","JAN","FEB","MAR"];
const BRANCHES = ["BALMATTA","SURATHKAL","ADYAR","SULLIA","UPPINANGADY","YEYYADI","BANTWAL","KADABA","VITTLA","SUJITH BAGH","NEXA","NARAVI"];
const FINANCIAL_YEARS = ["2025-2026", "2026-2027"];

const HIGHLIGHTED_CCE = [
  { branchName: "ADYAR", cceName: "KUSUMA" },
  { branchName: "ADYAR", cceName: "GAYATHRI" },
  { branchName: "ADYAR", cceName: "PRAPTHI" },
  { branchName: "BALMATTA", cceName: "RASHMITHA" },
  { branchName: "BALMATTA", cceName: "GAYATHRI" },
  { branchName: "BALMATTA", cceName: "RESHMA" },
  { branchName: "BANTWAL", cceName: "RAKSHA" },
  { branchName: "NARAVI", cceName: "RASHMI" },
  { branchName: "NEXA", cceName: "THEJASWINI" },
  { branchName: "SULLIA", cceName: "SHILPA" },
  { branchName: "SUJITH BAGH", cceName: "KAVYA" },
  { branchName: "SULLIA", cceName: "RANJITHA" },
  { branchName: "SULLIA", cceName: "SHUKALATHA" },
  { branchName: "SURATHKAL", cceName: "KRITHIKA" },
  { branchName: "SURATHKAL", cceName: "SHREE RAKSHA" },
  { branchName: "UPPINANGADY", cceName: "SHRADHA" },
  { branchName: "YEYYADI", cceName: "KAVYA" },
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

  const [sortByExp, setSortByExp] = useState(false);
  const [expSortAsc, setExpSortAsc] = useState(false);

  const [filterMode, setFilterMode] = useState("ALL");
  
  // ✅ CHANGED: Single Financial Year (string instead of array)
  const [selectedFinancialYear, setSelectedFinancialYear] = useState("2026-2027");
  
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

  useEffect(() => {
    const load = async () => {
      // ✅ UPDATED: Include financialYear in master data
      const q = `?financialYears=${selectedFinancialYear}`;
      const res = await fetchData(`${apiPrefix}${q}`);
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
  }, [apiPrefix, personKey, selectedFinancialYear]); // ✅ Added dependency

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

  // ✅ UPDATED: Single Financial Year fetch (much faster!)
  useEffect(() => {
    const load = async () => {
      const months = selectedMonths.length ? selectedMonths : MONTHS;
      let all = [];
      
      // ✅ CHANGED: Single FY (no loop needed)
      const fy = selectedFinancialYear;
      
      for (const m of months) {
        const q = `?financialYears=${fy}&months=${m}` +
                 (selectedBranches.length ? `&branches=${selectedBranches.join(",")}` : "") +
                 (selectedPersons.length ? `&${isSA ? 'saNames' : 'cceNames'}=${selectedPersons.join(",")}` : "");
        const res = await fetchData(`${apiPrefix}${q}`);
        if (Array.isArray(res)) all.push(...res.map(r => ({ ...r, month: m, financialYear: fy })));
      }
      setRawRows(all);
    };
    load();
  }, [selectedMonths, selectedBranches, selectedPersons, selectedFinancialYear, apiPrefix, isSA]); // ✅ Updated dependency

  const existingMonths = useMemo(
    () => MONTHS.filter(m => rawRows.some(r => r.month === m)),
    [rawRows]
  );

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

  const filteredTableRows = useMemo(() => {
    if (!isCC || filterMode === "ALL") return tableRows;
    
    return tableRows.filter(row => {
      const isMatch = HIGHLIGHTED_CCE.some(highlight => 
        normalize(row[personKey]) === normalize(highlight.cceName) &&
        normalize(row.branch) === normalize(highlight.branchName)
      );
 
      if (filterMode === "PSF") return isMatch;
      if (filterMode === "SMR") return !isMatch;
 
      return true;
    });
  }, [tableRows, filterMode, isCC]);

  const sortedTableRows = useMemo(() => {
    let rows = filteredTableRows;
    if (sortByExp && isCC) {
      rows = [...rows].sort((a, b) => {
        const expA = a.experienceDays || 0;
        const expB = b.experienceDays || 0;
        return expSortAsc ? expA - expB : expB - expA;
      });
    }
    return rows;
  }, [filteredTableRows, sortByExp, expSortAsc, isCC]);

  const downloadExcel = () => {
    if (sortedTableRows.length === 0) return;

    const headers = ['Branch', personLabel];
    if (isCC) headers.push('Exp');
    
    existingMonths.forEach(month => {
      if (showA) headers.push(`${month}_A`);
      if (showC) headers.push(`${month}_C`);
      if (showP) headers.push(`${month}_P`);
    });
    if (showA) headers.push('TOTAL_A');
    if (showC) headers.push('TOTAL_C');
    if (showP) headers.push('TOTAL_P');

    const data = sortedTableRows.map(row => {
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
    
    // ✅ UPDATED: Single FY in filename
    const filters = [];
    filters.push(`FY_${selectedFinancialYear}`);
    if (selectedMonths.length) filters.push(`Months_${selectedMonths.join('_')}`);
    if (selectedBranches.length) filters.push(`Branches_${selectedBranches.slice(0,3).join('_')}${selectedBranches.length > 3 ? '_etc' : ''}`);
    if (isCC && filterMode !== "ALL") filters.push(`Filter_${filterMode}`);
    const filename = `${isSA ? 'SA' : 'CC'}_Conversion_Report${filters.length ? `_${filters.join('_')}` : ''}.xlsx`;
    
    XLSX.writeFile(wb, filename);
  };

  const slicerStyle = (selected) => ({
    borderRadius: 20,
    fontWeight: 600,
    textTransform: "none",
    px: 2,
    background: selected ? "#c8e6c9" : "#fff",
    border: "1px solid #9ccc65",
    "&:hover": { background: "#aed581" },
  });

  const toggleExpSort = () => {
    if (!isCC) return;
    if (sortByExp) {
      setExpSortAsc(!expSortAsc);
    } else {
      setSortByExp(true);
      setExpSortAsc(false);
    }
  };

  const disableExpSort = () => {
    setSortByExp(false);
  };

  const FONT_SIZES = {
    header: '0.85rem',    
    subheader: '0.75rem', 
    cell: '0.8rem',       
    title: 'h5'           
  };

  const getRowStyle = (row) => {
    if (!isCC) return {};
    
    const isHighlightedCCE = HIGHLIGHTED_CCE.some(highlight => 
      normalize(row[personKey]) === normalize(highlight.cceName) &&
      normalize(row.branch) === normalize(highlight.branchName)
    );
    
    const hasNoExperience = !row.experienceDays;

    if (isHighlightedCCE) {
      return {
        backgroundColor: 'rgba(255, 235, 59, 0.3) !important',
        '& td': { borderColor: '#f57c00 !important' }
      };
    } else if (hasNoExperience) {
      return {
        backgroundColor: 'rgba(244, 67, 54, 0.1) !important',
        '& td': { color: '#d32f2f !important' }
      };
    }
    return {};
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3, alignItems: "center" }}>
        <Typography variant="h4">{title}</Typography>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          {isCC && sortByExp && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mr: 1 }}>
              <Button
                size="small"
                variant="outlined"
                onClick={toggleExpSort}
                sx={{ 
                  minWidth: "auto", 
                  px: 1, 
                  borderRadius: 20,
                  fontSize: "0.75rem"
                }}
                title="Toggle Experience Sort Direction"
              >
                EXP
              </Button>
              <IconButton
                size="small"
                onClick={toggleExpSort}
                sx={{ 
                  p: 0.25,
                  background: expSortAsc ? "#4caf50" : "#f44336",
                  color: "white",
                  "&:hover": {
                    background: expSortAsc ? "#45a049" : "#da190b",
                  }
                }}
                title={expSortAsc ? "Ascending" : "Descending"}
              >
                {expSortAsc ? <ArrowUpIcon fontSize="small" /> : <ArrowDownIcon fontSize="small" />}
              </IconButton>
              <IconButton
                size="small"
                onClick={disableExpSort}
                sx={{ 
                  p: 0.25,
                  background: "#ff9800",
                  color: "white",
                  "&:hover": {
                    background: "#f57c00",
                  }
                }}
                title="Disable Experience Sort (Back to Performance Sort)"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
          {isCC && !sortByExp && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mr: 1 }}>
              <Button
                size="small"
                variant="outlined"
                onClick={toggleExpSort}
                sx={{ 
                  minWidth: "auto", 
                  px: 1, 
                  borderRadius: 20,
                  fontSize: "0.75rem"
                }}
                title="Sort by Experience"
              >
                EXP
              </Button>
              <IconButton
                size="small"
                onClick={toggleExpSort}
                sx={{ 
                  p: 0.25,
                  background: "transparent",
                  color: "#666",
                  "&:hover": {
                    background: "rgba(0,0,0,0.1)",
                  }
                }}
                title="Click to sort by Experience"
              >
                <ArrowDownIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
          {isCC && (
            <Box sx={{ display: "flex", gap: 0.5, mr: 1 }}>
              <Button size="small" sx={slicerStyle(filterMode === "ALL")} onClick={() => setFilterMode("ALL")}>
                ALL
              </Button>
              <Button size="small" sx={slicerStyle(filterMode === "PSF")} onClick={() => setFilterMode("PSF")}>
                PSF
              </Button>
              <Button size="small" sx={slicerStyle(filterMode === "SMR")} onClick={() => setFilterMode("SMR")}>
                SMR
              </Button>
            </Box>
          )}
          <Button variant="contained" onClick={() => navigate(`/DashboardHome/${type}_conversion`)}>Line Chart</Button>
          <Button variant="contained" onClick={() => navigate(`/DashboardHome/${type}_conversion-bar-chart`)}>Bar Chart</Button>
          <Button variant="contained">Table</Button>
          <Button 
            variant="contained" 
            color="success"
            onClick={downloadExcel}
            disabled={sortedTableRows.length === 0}
            sx={{ minWidth: 120 }}
          >
            Download
          </Button>
        </Box>
      </Box>

      {/* ✅ CHANGED: Single Select Financial Year (Radio Style) */}
      <Box sx={{ mb: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
        {FINANCIAL_YEARS.map(fy => (
          <Button 
            key={fy} 
            size="small" 
            sx={slicerStyle(fy === selectedFinancialYear)}
            onClick={() => setSelectedFinancialYear(fy)} // ✅ Single select logic
          >
            {fy}
          </Button>
        ))}
      </Box>

      <Box sx={{ mb: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
        {MONTHS.map(m => (
          <Button key={m} size="small" sx={slicerStyle(selectedMonths.includes(m))}
            onClick={() => setSelectedMonths(p => p.includes(m) ? p.filter(x => x !== m) : [...p, m])}>
            {m}
          </Button>
        ))}
      </Box>

      {/* ✅ FIXED: Branch filter bug */}
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

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 4, border: "2px solid #455a64" }}>
        <Table size="small" sx={{ 
          "& th, & td": {
            border: "1px solid #9e9e9e",
            fontSize: FONT_SIZES.cell,
            padding: "4px 6px"
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
            {sortedTableRows.map((r, i) => (
              <TableRow 
                key={i} 
                sx={{ 
                  background: i % 2 ? "#fafafa" : "#fff",
                  ...getRowStyle(r)
                }}
              >
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