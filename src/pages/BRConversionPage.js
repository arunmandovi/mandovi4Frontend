import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Typography,
} from "@mui/material";
import DataTable from "../components/DataTable";
import { fetchData } from "../api/uploadService";

function BRConversionPage() {
  const [brArenaSummary, setBrArenaSummary] = useState([]);
  const [brNexaSummary, setBrNexaSummary] = useState([]);
  const [brCombinedSummary, setBrCombinedSummary] = useState([]);
  const [months, setMonths] = useState([]);
  const [years, setYears] = useState([]);
  const [groupBy, setGroupBy] = useState("city");
  const [qtr, setQtr] = useState([]);
  const [halfYear, setHalfYear] = useState([]);

  // 🔹 Refs for sync scrolling
  const arenaRef = useRef(null);
  const nexaRef = useRef(null);
  const combinedRef = useRef(null);

  // Sync scroll logic
  const syncScroll = (source, targetRefs) => {
    const { scrollTop, scrollLeft } = source;
    targetRefs.forEach((ref) => {
      if (ref.current) {
        if (ref.current.scrollTop !== scrollTop) {
          ref.current.scrollTop = scrollTop;
        }
        if (ref.current.scrollLeft !== scrollLeft) {
          ref.current.scrollLeft = scrollLeft;
        }
      }
    });
  };

  useEffect(() => {
    const arenaEl = arenaRef.current;
    const nexaEl = nexaRef.current;
    const combinedEl = combinedRef.current;

    if (!arenaEl || !nexaEl || !combinedEl) return;

    const handleArenaScroll = () => syncScroll(arenaEl, [nexaEl, combinedEl]);
    const handleNexaScroll = () => syncScroll(nexaEl, [arenaEl, combinedEl]);
    const handleCombinedScroll = () => syncScroll(combinedEl, [arenaEl, nexaEl]);

    arenaEl.addEventListener("scroll", handleArenaScroll);
    nexaEl.addEventListener("scroll", handleNexaScroll);
    combinedEl.addEventListener("scroll", handleCombinedScroll);

    return () => {
      arenaEl.removeEventListener("scroll", handleArenaScroll);
      nexaEl.removeEventListener("scroll", handleNexaScroll);
      combinedEl.removeEventListener("scroll", handleCombinedScroll);
    };
  }, []);

  // ================= Fetch + Format Data ==================
  const aggregateData = (data, groupByKey) => {
    const aggregated = {};
    data.forEach((row) => {
      const key =
        groupByKey === "city_branch"
          ? row.city + " - " + row.branch
          : row[groupByKey];

      if (!aggregated[key]) aggregated[key] = { ...row };
      else {
        Object.keys(row).forEach((col) => {
          if (typeof row[col] === "number") aggregated[key][col] += row[col];
        });
      }
    });
    return Object.values(aggregated);
  };

  const fetchBRSummary = async (endpoint) => {
    let combinedResults = [];
    const monthsList = months.length > 0 ? months : [""];
    const yearsList = years.length > 0 ? years : [""];
    const qtrList = qtr.length > 0 ? qtr : [""];
    const halfList = halfYear.length > 0 ? halfYear : [""];

    for (const m of monthsList) {
      for (const y of yearsList) {
        for (const q of qtrList) {
          for (const h of halfList) {
            const query =
              `?groupBy=${groupBy}` +
              (m ? `&month=${m}` : "") +
              (y ? `&year=${y}` : "") +
              (q ? `&qtr_wise=${q}` : "") +
              (h ? `&half_year=${h}` : "");

            const data = await fetchData(
              `/api/br_conversion/${endpoint}${query}`
            );
            if (Array.isArray(data)) combinedResults = combinedResults.concat(data);
          }
        }
      }
    }

    let aggregated = aggregateData(combinedResults, groupBy);

    // 🔹 Rename keys for display
    aggregated = aggregated.map((row) => {
      const formattedRow = {};

      // Always keep the grouping key
      if (row[groupBy] !== undefined) {
        formattedRow[groupBy] = row[groupBy];
      }

      if (row.city) formattedRow.city = row.city;
      if (row.branch) formattedRow.branch = row.branch;

      if (row.fs_pms_load !== undefined) {
        const val = Number(row.fs_pms_load) || 0;
        formattedRow["FS & PMS LOAD"] = val.toLocaleString("en-IN", {
          maximumFractionDigits: 0,
        });
      }

      if (row.br_conversion !== undefined) {
        const val = Number(row.br_conversion) || 0;
        formattedRow["BR CONVERSION"] = val.toLocaleString("en-IN", {
          maximumFractionDigits: 0,
        });
      }

      if (row.percentageBR_conversion !== undefined) {
        const val = Number(row.percentageBR_conversion) || 0;
        formattedRow["BR Conversion %"] = val.toFixed(2) + "%";
      }

      return formattedRow;
    });

    return aggregated;
  };

  const computeCombinedSummary = (arenaData, nexaData) => {
    const combined = [...arenaData, ...nexaData];
    const aggregated = {};

    combined.forEach((row) => {
      const key =
        groupBy === "city_branch"
          ? (row.city ? row.city : "") + " - " + (row.branch ? row.branch : "")
          : row[groupBy];

      if (!aggregated[key]) aggregated[key] = { fs_pms_load: 0, br_conversion: 0 };

      aggregated[key].fs_pms_load +=
        Number(String(row["FS & PMS LOAD"]).replace(/,/g, "")) || 0;
      aggregated[key].br_conversion +=
        Number(String(row["BR CONVERSION"]).replace(/,/g, "")) || 0;
    });

    return Object.entries(aggregated).map(([key, value]) => ({
      [groupBy]: key,
      "FS & PMS LOAD": value.fs_pms_load.toLocaleString("en-IN", {
        maximumFractionDigits: 0,
      }),
      "BR CONVERSION": value.br_conversion.toLocaleString("en-IN", {
        maximumFractionDigits: 0,
      }),
      "BR Conversion %":
        value.fs_pms_load === 0
          ? "0.00%"
          : ((value.br_conversion / value.fs_pms_load) * 100).toFixed(2) + "%",
    }));
  };

  const fetchAllData = async () => {
    try {
      const arenaData = await fetchBRSummary("br_conversion_arena");
      setBrArenaSummary(arenaData);

      const nexaData = await fetchBRSummary("br_conversion_nexa");
      setBrNexaSummary(nexaData);

      const combined = computeCombinedSummary(arenaData, nexaData);
      setBrCombinedSummary(combined);
    } catch (err) {
      console.error(err);
      alert("❌ Error fetching BR Conversion Summary: " + err.message);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [months, years, groupBy, qtr, halfYear]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        BR CONVERSION REPORT
      </Typography>

      {/* ===== Filter Controls ===== */}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
        {/* Months */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Months</InputLabel>
          <Select
            multiple
            value={months}
            onChange={(e) => setMonths(e.target.value)}
            renderValue={(selected) => selected.join(", ")}
          >
            {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map(
              (m) => (
                <MenuItem key={m} value={m}>
                  <Checkbox checked={months.indexOf(m) > -1} />
                  <ListItemText primary={m} />
                </MenuItem>
              )
            )}
          </Select>
        </FormControl>

        {/* Years */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Years</InputLabel>
          <Select
            multiple
            value={years}
            onChange={(e) => setYears(e.target.value)}
            renderValue={(selected) => selected.join(", ")}
          >
            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(
              (y) => (
                <MenuItem key={y} value={y}>
                  <Checkbox checked={years.indexOf(y) > -1} />
                  <ListItemText primary={y} />
                </MenuItem>
              )
            )}
          </Select>
        </FormControl>

        {/* Group By */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Group By</InputLabel>
          <Select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
            <MenuItem value="city">City</MenuItem>
            <MenuItem value="branch">Branch</MenuItem>
            <MenuItem value="city_branch">City & Branch</MenuItem>
          </Select>
        </FormControl>

        {/* Quarter */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Quarter</InputLabel>
          <Select
            multiple
            value={qtr}
            onChange={(e) => setQtr(e.target.value)}
            renderValue={(selected) => selected.join(", ")}
          >
            {["Qtr1","Qtr2","Qtr3","Qtr4"].map((q) => (
              <MenuItem key={q} value={q}>
                <Checkbox checked={qtr.indexOf(q) > -1} />
                <ListItemText primary={q} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Half Year */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Half Year</InputLabel>
          <Select
            multiple
            value={halfYear}
            onChange={(e) => setHalfYear(e.target.value)}
            renderValue={(selected) => selected.join(", ")}
          >
            {["H1", "H2"].map((h) => (
              <MenuItem key={h} value={h}>
                <Checkbox checked={halfYear.indexOf(h) > -1} />
                <ListItemText primary={h} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* ===== Tables ===== */}
      <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
        {/* Arena */}
        <Box
          ref={arenaRef}
          sx={{ flex: 1, minWidth: 300, maxHeight: 600, overflow: "auto" }}
        >
          <DataTable data={brArenaSummary} title="BR Arena Summary" />
        </Box>

        {/* Nexa */}
        <Box
          ref={nexaRef}
          sx={{ flex: 1, minWidth: 300, maxHeight: 600, overflow: "auto" }}
        >
          <DataTable data={brNexaSummary} title="BR Nexa Summary" />
        </Box>

        {/* Combined */}
        <Box
          ref={combinedRef}
          sx={{ flex: 1, minWidth: 300, maxHeight: 600, overflow: "auto" }}
        >
          <DataTable data={brCombinedSummary} title="BR Arena & Nexa Summary" />
        </Box>
      </Box>
    </Box>
  );
}

export default BRConversionPage;
