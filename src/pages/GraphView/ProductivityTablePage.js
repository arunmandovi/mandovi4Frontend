import React, { useState, useEffect, useRef } from "react";
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

import { fetchData } from "../../api/uploadService";
import { useNavigate } from "react-router-dom";
import SlicerFilters from "../../components/SlicerFilters";
import GrowthButtons from "../../components/GrowthButtons";
import { getSelectedGrowth, setSelectedGrowth } from "../../utils/growthSelection";

function ProductivityTablePage() {
  const navigate = useNavigate();

  const [citySummary, setCitySummary] = useState([]);
  const [branchSummary, setBranchSummary] = useState([]);
  const [months, setMonths] = useState([]);
  const [years, setYears] = useState(["2025"]);
  const [cities, setCities] = useState([]);
  const [selectedGrowth, setSelectedGrowthState] = useState("Service");
  const [columnWidths, setColumnWidths] = useState([]);

  const cityTableRef = useRef(null);

  const monthOptions = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const yearOptions = ["2024", "2025"];
  const cityOptions = ["Bangalore", "Mysore", "Mangalore"];
  const growthOptions = ["Service", "BodyShop", "Free Service", "PMS", "RR", "Others"];

  const growthKeyMap = {
    Service: "serviceProductivity",
    BodyShop: "bodyShopProductivity",
    "Free Service": "freeServiceProductivity",
    PMS: "pmsProductivity",
    RR: "rrProductivity",
    Others: "othersProductivity",
  };

  const utilizedBayKeyMap = {
    Service: "serviceUtilizedBay",
    BodyShop: "bodyShopUtilizedBay",
    "Free Service": "serviceUtilizedBay",
    PMS: "serviceUtilizedBay",
    RR: "serviceUtilizedBay",
    Others: "serviceUtilizedBay",
  };

  const loadKeyMap = {
    Service: "serviceLoadd",
    BodyShop: "bodyShopLoadd",
    "Free Service": "freeServiceLoadd",
    PMS: "pmsLoadd",
    RR: "rrLoadd",
    Others: "othersLoadd",
  };

  const readCity = (r) => r?.city || r?.City || r?.cityName || r?.CityName || r?.name || "";
  const readBranch = (r) => r?.branch || r?.Branch || r?.branchName || "";

  const readValue = (row, key) => {
    if (!row || !key) return 0;
    const val = row[key];
    if (val == null) return 0;
    if (typeof val === "string") {
      const parsed = parseFloat(val.replace("%", "").trim());
      return isNaN(parsed) ? 0 : parsed;
    }
    return Number(val);
  };

  const readLoad = (row, loadKey) => {
    if (!row || !loadKey) return 0;
    const val = row[loadKey];
    return val == null ? 0 : Number(val);
  };

  useEffect(() => {
    const saved = getSelectedGrowth("productivity");
    if (saved) setSelectedGrowthState(saved);
  }, []);

  useEffect(() => {
    let canceled = false;

    const loadData = async () => {
      const selectedMonths = months.length ? months : monthOptions;
      const selectedYears = years.length ? years : yearOptions;

      try {
        const cityResult = [];
        for (const m of selectedMonths) {
          const data = await fetchData(
            `/api/productivity/productivity_summary?months=${m}&years=${selectedYears.join(",")}`
          );
          cityResult.push({
            month: m,
            data: Array.isArray(data) ? data : data?.result || [],
          });
        }
        if (!canceled) setCitySummary(cityResult);

        const branchResult = [];
        for (const m of selectedMonths) {
          const data = await fetchData(
            `/api/productivity/productivity_branch_summary?months=${m}&years=${selectedYears.join(",")}`
          );
          branchResult.push({
            month: m,
            data: Array.isArray(data) ? data : data?.result || [],
          });
        }
        if (!canceled) setBranchSummary(branchResult);
      } catch (err) {
        if (!canceled) console.error("Fetch Error:", err);
      }
    };

    loadData();
    return () => {
      canceled = true;
    };
  }, [months, years]);

  const filterBranchByCity = (summary) =>
    summary.map(({ month, data }) => ({
      month,
      data: data.filter((r) => {
        const city = readCity(r);
        const utilizedBay = readValue(r, utilizedBayKeyMap[selectedGrowth]);
        if (utilizedBay === 0) return false;
        if (cities.length && !cities.includes(city)) return false;
        return true;
      }),
    }));

  const buildTable = (summary, readNameFn, isBranchTable = false, isCityTable = false) => {
    if (!selectedGrowth) return { rows: [], monthKeys: [], totalRow: null };

    const growthKey = growthKeyMap[selectedGrowth];
    const utilizedKey = utilizedBayKeyMap[selectedGrowth];
    const loadKey = loadKeyMap[selectedGrowth];

    const names = new Set();
    summary.forEach(({ data }) =>
      (data || []).forEach((r) => names.add(readNameFn(r)))
    );

    const monthKeys = summary.map((s) => s.month);

    const rows = Array.from(names).map((name) => {
      const entry = { name, utilizedBay: 0 };
      monthKeys.forEach((m) => (entry[m] = 0));

      summary.forEach(({ month, data }) => {
        const row = (data || []).find((r) => readNameFn(r) === name);
        if (row) {
          entry[month] = readValue(row, growthKey);
          entry.utilizedBay = readValue(row, utilizedKey);
          entry.city = readCity(row);
        }
      });

      return entry;
    });

    if (isCityTable) {
      const cityOrder = ["Bangalore", "Mysore", "Mangalore"];
      rows.sort((a, b) => cityOrder.indexOf(a.name) - cityOrder.indexOf(b.name));
    }

    if (isBranchTable) {
      const cityOrder = ["Bangalore", "Mysore", "Mangalore"];
      rows.sort((a, b) => cityOrder.indexOf(a.city) - cityOrder.indexOf(b.city));
    }

    const totalRow = { name: "GRAND TOTAL" };

    monthKeys.forEach((m) => {
      const s = summary.find((x) => x.month === m);
      const rowsForMonth = (s && s.data) ? s.data : [];

      const sumLoad = rowsForMonth.reduce((sum, r) => sum + readLoad(r, loadKey), 0);
      const sumServiceUtilized = rowsForMonth.reduce((sum, r) => sum + readValue(r, "serviceUtilizedBay"), 0);
      const sumBodyShopUtilized = rowsForMonth.reduce((sum, r) => sum + readValue(r, "bodyShopUtilizedBay"), 0);

      let grand = 0;
      if (selectedGrowth === "BodyShop") {
        grand = sumBodyShopUtilized === 0 ? 0 : sumLoad / sumBodyShopUtilized;
      } else {
        const denom = rowsForMonth.reduce(
          (acc, r) => acc + readValue(r, utilizedKey) * Number(r.workingDays || 0),
          0
        );
        grand = denom === 0 ? 0 : sumLoad / denom;
      }

      totalRow[m] = Number(Number.isFinite(grand) ? grand.toFixed(2) : 0);
    });

    const allCities = new Set();
    summary.forEach(({ data }) => data.forEach(r => allCities.add(readCity(r))));

    totalRow.utilizedBay = 0;
    allCities.forEach(city => {
      for (let { data } of summary) {
        const row = data.find(r => readCity(r) === city);
        if (row) {
          totalRow.utilizedBay += readValue(row, utilizedKey);
          break; 
        }
      }
    });

    return { rows, monthKeys, totalRow };
  };

  const cityTable = buildTable(citySummary, readCity, false, true);
  const branchTable = buildTable(filterBranchByCity(branchSummary), readBranch, true, false);

  useEffect(() => {
    if (cityTableRef.current) {
      const ths = cityTableRef.current.querySelectorAll("thead tr:first-child th");
      const widths = Array.from(ths).map((th) => th.offsetWidth);
      setColumnWidths(widths);
    }
  }, [cityTable.rows, cityTable.monthKeys]);

  const getBranchRowColor = (city) => {
    if (city === "Bangalore") return "rgba(255, 255, 255, 1)";
    if (city === "Mysore") return "rgba(255, 255, 255, 1)";
    if (city === "Mangalore") return "rgba(255, 255, 255, 1)";
    return "transparent";
  };

  return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Typography variant="h4">PRODUCTIVITY TABLE</Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button variant="contained" onClick={() => navigate("/DashboardHome/productivity_table")}>Productivity Table</Button>
            <Button variant="contained" onClick={() => navigate("/DashboardHome/productivity")}>Graph-CityWise</Button>
            <Button variant="contained" onClick={() => navigate("/DashboardHome/productivity_branches")}>Graph-BranchWise</Button>
            <Button variant="contained" onClick={() => navigate("/DashboardHome/productivity-bar-chart")}>Bar Chart-CityWise</Button>
            <Button variant="contained" onClick={() => navigate("/DashboardHome/productivity_branches-bar-chart")}>Bar Chart-BranchWise</Button>
          </Box>
      </Box>

      <SlicerFilters
        monthOptions={monthOptions}
        months={months}
        setMonths={setMonths}
        yearOptions={yearOptions}
        years={years}
        setYears={setYears}
      />

      <GrowthButtons
        growthOptions={growthOptions}
        selectedGrowth={selectedGrowth}
        setSelectedGrowth={(value) => {
          setSelectedGrowthState(value);
          setSelectedGrowth(value, "productivity");
        }}
      />

      <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
        City Wise Productivity Summary
      </Typography>

      {cityTable.rows.length === 0 ? (
        <Typography>No CityWise Data.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table ref={cityTableRef}>
            <TableHead>
              <TableRow>
                <TableCell>City</TableCell>
                <TableCell>Utilized Bay</TableCell>
                {cityTable.monthKeys.map((m) => (
                  <TableCell key={m} align="right">{m}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {cityTable.rows.map((row) => (
                <TableRow key={row.name}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.utilizedBay}</TableCell>
                  {cityTable.monthKeys.map((m) => (
                    <TableCell key={m} align="right">{row[m]}</TableCell>
                  ))}
                </TableRow>
              ))}
              {cityTable.totalRow && (
                <TableRow sx={{ backgroundColor: "hsla(58, 100%, 61%, 1.00)" }}>
                  <TableCell><b>{cityTable.totalRow.name}</b></TableCell>
                  <TableCell><b>{cityTable.totalRow.utilizedBay}</b></TableCell>
                  {cityTable.monthKeys.map((m) => (
                    <TableCell key={m} align="right"><b>{cityTable.totalRow[m]}</b></TableCell>
                  ))}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Typography variant="h5" sx={{ mt: 5, mb: 2 }}>
        Branch Wise Productivity Summary
      </Typography>

      <SlicerFilters cityOptions={cityOptions} cities={cities} setCities={setCities} />

      {branchTable.rows.length === 0 ? (
        <Typography>No BranchWise Data.</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: columnWidths[0] }}>Branch</TableCell>
                <TableCell sx={{ width: columnWidths[1] }}>Utilized Bay</TableCell>
                {branchTable.monthKeys.map((m, idx) => (
                  <TableCell key={m} align="right" sx={{ width: columnWidths[idx + 2] }}>{m}</TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {branchTable.rows.map((row) => (
                <TableRow key={row.name} sx={{ backgroundColor: getBranchRowColor(row.city) }}>
                  <TableCell sx={{ width: columnWidths[0] }}>{row.name}</TableCell>
                  <TableCell sx={{ width: columnWidths[1] }}>{row.utilizedBay}</TableCell>
                  {branchTable.monthKeys.map((m, idx) => (
                    <TableCell key={m} align="right" sx={{ width: columnWidths[idx + 2] }}>{row[m]}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export default ProductivityTablePage;
