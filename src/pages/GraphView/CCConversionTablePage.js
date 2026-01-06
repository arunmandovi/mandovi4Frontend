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

const ALL_CCE = "ALL";

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

  const allCceSelected =
    dropdownCces.length > 0 &&
    selectedCces.length === dropdownCces.length;

  useEffect(() => {
    setSelectedCces(prev => prev.filter(c => dropdownCces.includes(c)));
  }, [dropdownCces]);

  /* ---------- FETCH DATA ---------- */
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

  /* ---------- TABLE DATA ---------- */
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
      .sort((a, b) => {
        if (b.totalConv !== a.totalConv) return b.totalConv - a.totalConv;
        return b.totalPct - a.totalPct;
      });
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
        <Typography variant="h4">CC CONVERSION – TABLE</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/cc_conversion")}>Line Chart</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/cc_conversion-bar-chart")}>Bar Chart</Button>
          <Button variant="contained">Table</Button>
        </Box>
      </Box>

      {/* MONTH FILTER */}
      <Box sx={{ mb: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
        {MONTHS.map(m => (
          <Button
            key={m}
            size="small"
            sx={slicerStyle(selectedMonths.includes(m))}
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

      {/* BRANCH FILTER */}
      <Box sx={{ mb: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
        {BRANCHES.map(b => (
          <Button
            key={b}
            size="small"
            sx={slicerStyle(selectedBranches.includes(b))}
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

      {/* ✅ CCE DROPDOWN WITH SELECT ALL */}
      <Box sx={{ mb: 3, width: 320 }}>
        <Select
          multiple
          fullWidth
          value={selectedCces}
          input={<OutlinedInput />}
          renderValue={(s) => s.join(", ")}
          onChange={(e) => {
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
          borderRadius: 3,
          boxShadow: 4,
          border: "2px solid #455a64",
        }}
      >
        <Table
          size="small"
          sx={{
            borderCollapse: "collapse",
            "& th, & td": {
              border: "1px solid #9e9e9e",
            },
          }}
        >
          <TableHead>
            <TableRow
              sx={{
                background: "#718390ff",
                "& th": {
                  color: "#fff",
                  fontWeight: 800,
                  border: "1.5px solid #455a64",
                },
              }}
            >
              <TableCell rowSpan={2}>Branch</TableCell>
              <TableCell rowSpan={2}>CCE</TableCell>
              <TableCell rowSpan={2}>Exp</TableCell>

              {existingMonths.map(m => (
                <TableCell key={m} colSpan={3} align="center">
                  {m}
                </TableCell>
              ))}
              <TableCell colSpan={3} align="center" sx={{ background: "#1551d4ff" }}>
                TOTAL
              </TableCell>
            </TableRow>

            <TableRow
              sx={{
                background: "#aeb37aff",
                "& th": {
                  fontWeight: 700,
                  border: "1.5px solid #90caf9",
                },
              }}
            >
              {existingMonths.map(m => (
                <React.Fragment key={m}>
                  <TableCell>A</TableCell>
                  <TableCell>C</TableCell>
                  <TableCell>%</TableCell>
                </React.Fragment>
              ))}
              <TableCell>A</TableCell>
              <TableCell>C</TableCell>
              <TableCell>%</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {tableRows.map((r, i) => (
              <TableRow
                key={i}
                sx={{
                  background: i % 2 ? "#fafafa" : "#fff",
                  "& td": {
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    border: "1px solid #cfd8dc",
                  },
                }}
              >
                <TableCell sx={{ fontWeight: 800 }}>{r.branch}</TableCell>
                <TableCell>{r.cceName}</TableCell>
                <TableCell>
                  {r.experienceDays != null ? r.experienceDays.toFixed(1) : "-"}
                </TableCell>

                {existingMonths.map(m => {
                  const d = r.months[m];
                  return (
                    <React.Fragment key={m}>
                      <TableCell>{d?.pmsAppointment ?? "-"}</TableCell>
                      <TableCell>{d?.pmsConversion ?? "-"}</TableCell>
                      <TableCell>
                        {d ? `${d.percentagePMS.toFixed(0)}%` : "-"}
                      </TableCell>
                    </React.Fragment>
                  );
                })}

                <TableCell sx={{ fontWeight: 800 }}>{r.totalApt}</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>{r.totalConv}</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>
                  {r.totalPct.toFixed(0)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default CCConversionTablePage;
