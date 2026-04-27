import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { buildTableDataBelowAverageTAT } from "./NegativeHelperFiles/NegativeTableHelpers";
import { fetchData } from "../../api/uploadService";
import SlicerFilters from "../../components/SlicerFilters";
import {
  CITY_ORDER,
  BRANCH_CITY_MAP,
} from "../../helpers/SortByCityAndBranch";

import NegativeFilters from "./NegativeHelperFiles/NegativeFilters";

import {
  tableContainerSx,
  tableSx,
  tableHeadRowSx,
  toggleGroupSx,
  handleCityChangeExternal,
} from "./NegativeHelperFiles/NegativeTableHelpers";

const ALL_BRANCHES = CITY_ORDER.flatMap((city) =>
  Object.entries(BRANCH_CITY_MAP)
    .filter(([_, c]) => c === city)
    .map(([br]) => br)
).sort((a, b) => a.localeCompare(b));

const growthKeyMap = {
  FR1: "firstFreeService",
  FR2: "secondFreeService",
  FR3: "thirdFreeService",
  PMS: "paidService",
};

const monthOptions = ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"];
const cityOptions = ["Bangalore","Mysore","Mangalore"];
const qtrWiseOptions = ["Qtr1","Qtr2","Qtr3","Qtr4"];
const halfYearOptions = ["H1","H2"];
const financialYearOptions = ["2025-2026","2026-2027"];

/* ================= TAT HELPERS ================= */
const timeToSeconds = (time) => {
  if (!time || typeof time !== "string") return null;
  const [h, m, s] = time.split(":").map(Number);
  return h * 3600 + m * 60 + s;
};
/* ============================================== */

function readBranchName(row) {
  return row?.branch || row?.Branch || row?.branchName || row?.BranchName || row?.name || row?.Name || "";
}

function readCityName(row) {
  return row?.city || row?.City || row?.cityName || row?.CityName || "";
}

function readGrowthValue(row, apiKey) {
  const raw = row?.[apiKey];

  if (raw === undefined || raw === null) return null;

  if (typeof raw === "string" && raw.includes(":")) {
    return raw;
  }

  const cleaned = String(raw).replace("%", "").trim();
  const num = parseFloat(cleaned);

  return isNaN(num) ? null : num;
}

function TATNegativeTable() {
  const navigate = useNavigate();

  const [summary, setSummary] = useState([]);
  const [months, setMonths] = useState([]);
  const [cities, setCities] = useState([]);
  const [qtrWise, setQtrWise] = useState([]);
  const [halfYear, setHalfYear] = useState([]);
  const [financialYears, setFinancialYears] = useState(["2026-2027"]);
  const [selectedBranches, setSelectedBranches] = useState(ALL_BRANCHES);
  const [selectedCities, setSelectedCities] = useState([]);
  const [valueFilter, setValueFilter] = useState([]);

  const branchGroups = useMemo(() => [
    {
      city: "Bangalore",
      branches: Object.entries(BRANCH_CITY_MAP)
        .filter(([_, c]) => c === "Bangalore")
        .map(([br]) => br),
    },
    {
      city: "Mysore",
      branches: Object.entries(BRANCH_CITY_MAP)
        .filter(([_, c]) => c === "Mysore")
        .map(([br]) => br),
    },
    {
      city: "Mangalore",
      branches: Object.entries(BRANCH_CITY_MAP)
        .filter(([_, c]) => c === "Mangalore")
        .map(([br]) => br),
    },
  ], []);

  const handleCityChange = (e) =>
    handleCityChangeExternal({
      e,
      setSelectedCities,
      setSelectedBranches,
      ALL_BRANCHES,
      CITY_ORDER,
      BRANCH_CITY_MAP,
    });

  const handleBranchChange = (e) => {
    setSelectedBranches(e.target.value);
  };

  const handleValueFilterChange = (event, newValueFilter) => {
    setValueFilter(newValueFilter);
  };

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const params = new URLSearchParams();

        if (months.length) params.append("months", months.join(","));
        if (cities.length) params.append("cities", cities.join(","));
        if (qtrWise.length) params.append("qtrWise", qtrWise.join(","));
        if (halfYear.length) params.append("halfYear", halfYear.join(","));

        const activeFY = financialYears[0] || "2025-2026";
        params.append("financialYears", activeFY);

        const endpoint = `/api/tat/tat_branch_summary?${params.toString()}`;
        const data = await fetchData(endpoint);
        setSummary(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setSummary([]);
      }
    };

    fetchSummary();
  }, [months, cities, qtrWise, halfYear, financialYears]);

  const tableData = useMemo(() => {
    const data = buildTableDataBelowAverageTAT({
      summary,
      selectedBranches,
      selectedCities,
      valueFilter,
      growthKeyMap,
      readBranchName,
      readCityName,
      readGrowthValue,
    });

    return data.map((row) => {
      const newRow = { ...row };

      Object.entries(growthKeyMap).forEach(([label, key]) => {
        const value = row[label];
        const overallAvg = row._overallAverages?.[key];

        if (!value || value === "--" || !overallAvg) {
          newRow[`_${label}_isAbove`] = false;
          return;
        }

        const valueSec = timeToSeconds(value);
        newRow[`_${label}_isAbove`] = valueSec > overallAvg;
      });

      return newRow;
    });
  }, [summary, selectedBranches, selectedCities, valueFilter]);

  const getCellStyle = (row, label) => {
    if (row[`_${label}_isAbove`]) {
      return {
        backgroundColor: "#ffcdd2",
        color: "#b71c1c",
        fontWeight: 900,
      };
    }
    return {};
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">TAT Table (Branch-wise)</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/tat")}>Graph-CityWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/tat_branches")}>Graph-BranchWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/tat-bar-chart")}>Bar Chart-CityWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/tat_branches-bar-chart")}>Bar Chart-BranchWise</Button>
          <Button variant="contained">Table</Button>
        </Box>
      </Box>

      <NegativeFilters
        cityOptions={cityOptions}
        selectedCities={selectedCities}
        handleCityChange={handleCityChange}
        selectedBranches={selectedBranches}
        handleBranchChange={handleBranchChange}
        branchGroups={branchGroups}
      />

      <SlicerFilters
        monthOptions={monthOptions} months={months} setMonths={setMonths}
        cityOptions={cityOptions} cities={cities} setCities={setCities}
        qtrWiseOptions={qtrWiseOptions} qtrWise={qtrWise} setQtrWise={setQtrWise}
        halfYearOptions={halfYearOptions} halfYear={halfYear} setHalfYear={setHalfYear}
        financialYearOptions={financialYearOptions} financialYears={financialYears} setFinancialYears={setFinancialYears}
      />

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
        <ToggleButtonGroup
          value={valueFilter}
          onChange={handleValueFilterChange}
          size="small"
          sx={toggleGroupSx}
        >
          <ToggleButton value="positive">Above Average</ToggleButton>
          <ToggleButton value="negative">Below Average</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <TableContainer component={Paper} sx={tableContainerSx}>
        <Table size="small" sx={tableSx}>
          <TableHead>
            <TableRow sx={tableHeadRowSx}>
              <TableCell>Branch</TableCell>
              <TableCell>City</TableCell>
              {Object.keys(growthKeyMap).map((label) => (
                <TableCell key={label} align="center">{label}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.map((row, i) => (
              <TableRow key={i}>
                <TableCell sx={{ fontWeight: 800 }}>{row.branch}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{row.city}</TableCell>

                {Object.keys(growthKeyMap).map((label) => (
                  <TableCell
                    key={label}
                    align="center"
                    sx={getCellStyle(row, label)}
                  >
                    {row[label]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default TATNegativeTable;