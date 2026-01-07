import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Typography,
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

/* ---------------- CONSTANTS ---------------- */
const MONTHS = ["APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC","JAN","FEB","MAR"];
const YEARS = Array.from({ length: 20 }, (_, i) => String(2005 + i));
const CHANNELS = ["ARENA","NEXA"];
const BRANCHES = ["Balmatta","Uppinangady","Surathkal","Sullia","Bantwal","Nexa","Kadaba","Vittla"];

/* ---------------- COMPONENT ---------------- */
const SalesTablePage = () => {
  const navigate = useNavigate();

  const [selectedMonths, setSelectedMonths] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [selectedChannels, setSelectedChannels] = useState([]);
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [rawRows, setRawRows] = useState([]);

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    const load = async () => {
      const months = selectedMonths.length ? selectedMonths : MONTHS;
      const years = selectedYears.length ? selectedYears : YEARS;

      let all = [];

      for (const m of months) {
        const query =
          `?months=${m}` +
          `&years=${years.join(",")}` +
          (selectedChannels.length ? `&channels=${selectedChannels.join(",")}` : "");

        const res = await fetchData(`/api/sales/sales_branch_summary${query}`);

        if (Array.isArray(res)) {
          const filtered = res.filter(
            r => !selectedBranches.length || selectedBranches.includes(r.branch)
          );
          all.push(...filtered.map(r => ({ ...r, month: m })));
        }
      }

      setRawRows(all);
    };

    load();
  }, [selectedMonths, selectedYears, selectedChannels, selectedBranches]);

  /* ---------------- MONTHS TO SHOW ---------------- */
  const existingMonths = useMemo(
    () => (selectedMonths.length ? selectedMonths : MONTHS),
    [selectedMonths]
  );

  /* ---------------- TRANSFORM TABLE DATA ---------------- */
  const { tableRows, grandTotals } = useMemo(() => {
    const map = {};
    const monthTotals = {};
    let overallTotal = 0;

    rawRows.forEach(r => {
      const key = r.branch;

      if (!map[key]) {
        map[key] = {
          branch: r.branch,
          months: {},
          total: 0,
        };
      }

      const value = r.count || 0;
      map[key].months[r.month] = (map[key].months[r.month] || 0) + value;
      map[key].total += value;

      monthTotals[r.month] = (monthTotals[r.month] || 0) + value;
      overallTotal += value;
    });

    return {
      tableRows: Object.values(map),
      grandTotals: {
        months: monthTotals,
        total: overallTotal,
      },
    };
  }, [rawRows]);

  /* ---------------- UI HELPERS ---------------- */
  const slicerStyle = selected => ({
    borderRadius: 20,
    fontWeight: 600,
    textTransform: "none",
    px: 2,
    background: selected ? "#c8e6c9" : "#fff",
    border: "1px solid #9ccc65",
    "&:hover": { background: "#aed581" },
  });

  /* ---------------- RENDER ---------------- */
  return (
    <Box sx={{ p: 3 }}>
      {/* HEADER + NAVIGATION */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">
          SALES – BRANCH SUMMARY
        </Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/sales")}>Line Chart</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/sales-bar-chart")}>Bar Chart</Button>
          <Button variant="contained">Table</Button>
        </Box>
      </Box>

      {/* YEAR FILTER */}
      <Box sx={{ mb: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
        {YEARS.map(y => (
          <Button
            key={y}
            size="small"
            sx={slicerStyle(selectedYears.includes(y))}
            onClick={() =>
              setSelectedYears(p =>
                p.includes(y) ? p.filter(x => x !== y) : [...p, y]
              )
            }
          >
            {y}
          </Button>
        ))}
      </Box>

      {/* CHANNEL FILTER */}
      <Box sx={{ mb: 2, display: "flex", gap: 1 }}>
        {CHANNELS.map(c => (
          <Button
            key={c}
            size="small"
            sx={slicerStyle(selectedChannels.includes(c))}
            onClick={() =>
              setSelectedChannels(p =>
                p.includes(c) ? p.filter(x => x !== c) : [...p, c]
              )
            }
          >
            {c}
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

      {/* MONTH FILTER */}
      <Box sx={{ mb: 3, display: "flex", gap: 1, flexWrap: "wrap" }}>
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

      {/* TABLE */}
      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 4 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ background: "#455a64" }}>
              <TableCell sx={{ color: "#fff", fontWeight: 800 }}>
                Branch
              </TableCell>

              {existingMonths.map(m => (
                <TableCell key={m} align="center" sx={{ color: "#fff", fontWeight: 800 }}>
                  {m}
                </TableCell>
              ))}

              <TableCell align="center" sx={{ color: "#fff", fontWeight: 900 }}>
                TOTAL
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {tableRows.map((r, i) => (
              <TableRow key={i} sx={{ background: i % 2 ? "#fafafa" : "#fff" }}>
                <TableCell sx={{ fontWeight: 700 }}>
                  {r.branch}
                </TableCell>

                {existingMonths.map(m => (
                  <TableCell key={m} align="center">
                    {r.months[m] ?? "-"}
                  </TableCell>
                ))}

                <TableCell align="center" sx={{ fontWeight: 900 }}>
                  {r.total}
                </TableCell>
              </TableRow>
            ))}

            {/* GRAND TOTAL */}
            <TableRow sx={{ background: "#e3f2fd" }}>
              <TableCell sx={{ fontWeight: 900 }}>
                GRAND TOTAL
              </TableCell>

              {existingMonths.map(m => (
                <TableCell key={m} align="center" sx={{ fontWeight: 900 }}>
                  {grandTotals.months[m] ?? "-"}
                </TableCell>
              ))}

              <TableCell align="center" sx={{ fontWeight: 900 }}>
                {grandTotals.total}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default SalesTablePage;
