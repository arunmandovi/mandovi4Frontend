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

const CCConversionTablePage = () => {
  const navigate = useNavigate();

  const [selectedMonths, setSelectedMonths] = useState([]);
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [selectedCces, setSelectedCces] = useState([]);
  const [rawRows, setRawRows] = useState([]);
  const [branchCceMap, setBranchCceMap] = useState({});

  const normalize = (v) => v?.trim().toUpperCase() || "";

  /* ---------- MASTER DATA ---------- */
  useEffect(() => {
    const load = async () => {
      const res = await fetchData(`/api/cc/cc_conversion_summary`);
      const map = {};
      (Array.isArray(res) ? res : []).forEach(r => {
        const b = normalize(r.branch);
        const c = normalize(r.cceName);
        if (!map[b]) map[b] = new Set();
        map[b].add(c);
      });
      const out = {};
      Object.keys(map).forEach(b => out[b] = [...map[b]].sort());
      setBranchCceMap(out);
    };
    load();
  }, []);

  /* ---------- CCE OPTIONS ---------- */
  const dropdownCces = useMemo(() => {
    if (!selectedBranches.length)
      return [...new Set(Object.values(branchCceMap).flat())].sort();

    const s = new Set();
    selectedBranches.forEach(b =>
      branchCceMap[normalize(b)]?.forEach(c => s.add(c))
    );
    return [...s].sort();
  }, [selectedBranches, branchCceMap]);

  useEffect(() => {
    setSelectedCces(prev => prev.filter(c => dropdownCces.includes(c)));
  }, [dropdownCces]);

  /* ---------- DATA ---------- */
  useEffect(() => {
    const load = async () => {
      const months = selectedMonths.length ? selectedMonths : MONTHS;
      let all = [];
      for (const m of months) {
        const q =
          `?months=${m}` +
          (selectedBranches.length ? `&branches=${selectedBranches.join(",")}` : "") +
          (selectedCces.length ? `&cceNames=${selectedCces.join(",")}` : "");
        const res = await fetchData(`/api/cc/cc_conversion_summary${q}`);
        if (Array.isArray(res)) all.push(...res.map(r => ({ ...r, month: m })));
      }
      setRawRows(all);
    };
    load();
  }, [selectedMonths, selectedBranches, selectedCces]);

  const existingMonths = useMemo(
    () => MONTHS.filter(m => rawRows.some(r => r.month === m)),
    [rawRows]
  );

  const tableRows = useMemo(() => {
    const map = {};
    rawRows.forEach(r => {
      const k = `${r.branch}|${r.cceName}`;
      if (!map[k]) {
        map[k] = {
          branch: r.branch,
          cceName: r.cceName,
          experienceDays: r.experienceDays,
          months: {},
        };
      }
      map[k].months[r.month] = r;
    });
    return Object.values(map);
  }, [rawRows]);

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
        <Typography variant="h4">CC CONVERSION – TABLE</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/cc_conversion")}>Line Chart</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/cc_conversion-bar-chart")}>Bar Chart</Button>
          <Button variant="contained">Table</Button>
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
        <Select
          multiple
          fullWidth
          value={selectedCces}
          onChange={(e) => setSelectedCces(e.target.value)}
          input={<OutlinedInput />}
          renderValue={(s) => s.join(", ")}
        >
          {dropdownCces.map(c => (
            <MenuItem key={c} value={c}>
              <Checkbox checked={selectedCces.includes(c)} />
              <ListItemText primary={c} />
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* TABLE */}
      <TableContainer
        component={Paper}
        sx={{
          p: 2,
          borderRadius: "16px",
          background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
        }}
      >
        <Table
          size="small"
          sx={{
            border: "5px solid #b9c9df",
            borderRadius: "14px",
            overflow: "hidden",
          }}
        >
          <TableHead>
            <TableRow sx={{ background: "linear-gradient(135deg,#d1e2ff,#f0f6ff)" }}>
              <TableCell rowSpan={2} sx={headerCell}>Branch</TableCell>
              <TableCell rowSpan={2} sx={headerCell}>CCE</TableCell>
              <TableCell rowSpan={2} sx={headerCell} align="right">Exp</TableCell>
              {existingMonths.map(m => (
                <TableCell key={m} colSpan={3} align="center" sx={headerCell}>{m}</TableCell>
              ))}
            </TableRow>
            <TableRow sx={{ background: "#eaf2ff" }}>
              {existingMonths.map(m => (
                <React.Fragment key={m}>
                  <TableCell sx={subHeader}>Appt</TableCell>
                  <TableCell sx={subHeader}>Conv</TableCell>
                  <TableCell sx={subHeader}>%</TableCell>
                </React.Fragment>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {tableRows.map((r, i) => (
              <TableRow
                key={i}
                sx={{
                  backgroundColor: i % 2 ? "#eef4ff" : "#f7faff",
                  "&:hover": {
                    backgroundColor: "#dcedff",
                    transform: "scale(1.003)",
                    transition: "0.12s",
                  },
                }}
              >
                <TableCell sx={cell}>{r.branch}</TableCell>
                <TableCell sx={cell}>{r.cceName}</TableCell>
                <TableCell sx={cell} align="right">
                  {r.experienceDays?.toFixed(1) ?? "-"}
                </TableCell>

                {existingMonths.map(m => {
                  const d = r.months[m];
                  return (
                    <React.Fragment key={m}>
                      <TableCell sx={cell}>{d?.pmsAppointment ?? "-"}</TableCell>
                      <TableCell sx={cell}>{d?.pmsConversion ?? "-"}</TableCell>
                      <TableCell sx={cell}>
                        {d?.percentagePMS ? `${d.percentagePMS.toFixed(0)}%` : "-"}
                      </TableCell>
                    </React.Fragment>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

const headerCell = {
  fontWeight: 900,
  fontSize: 16,
  textTransform: "uppercase",
  borderBottom: "3px solid #99b3d8",
};

const subHeader = {
  fontWeight: 800,
  textAlign: "center",
  borderBottom: "2px solid #c7d4e6",
};

const cell = {
  fontSize: 16,
  fontWeight: "bold",
  borderRight: "1px solid #c7d4e6",
  borderBottom: "1px solid #c7d4e6",
  textAlign: "center",
};

export default CCConversionTablePage;
