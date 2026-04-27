import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  TableCell,
  Button,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { buildTableDataBelowAverage } from "./NegativeHelperFiles/NegativeTableHelpers";
import { fetchData } from "../../api/uploadService";
import SlicerFilters from "../../components/SlicerFilters";
import {
  CITY_ORDER,
  BRANCH_CITY_MAP,
} from "../../helpers/SortByCityAndBranch";

import NegativeFilters from "./NegativeHelperFiles/NegativeFilters";
import NegativeTableView from "./NegativeHelperFiles/NegativeTableView";

import {
  tableContainerSx,
  tableSx,
  tableHeadRowSx,
  toggleGroupSx,
  getNegativeCellSx,
  buildTableData,
  handleCityChangeExternal,
  buildTableDataBelowThreshold, getThresholdCellSx,
} from "./NegativeHelperFiles/NegativeTableHelpers";

const ALL_BRANCHES = CITY_ORDER.flatMap((city) =>
  Object.entries(BRANCH_CITY_MAP)
    .filter(([_, c]) => c === city)
    .map(([br]) => br)
).sort((a, b) => a.localeCompare(b));

const growthKeyMap = {
  "Air filter %": "airFilter",
  "Belt water pump %": "beltWaterPump",
  "Brake fluid %": "brakeFluid",
  "Coolant %": "coolant",
  "Fuel Filter %": "fuelFilter",
  "Oil filter %": "oilFilter",
  "Spark plug %": "sparkPlug",
  "7 PARTS PMS %": "sevenPartsPMS",
  "DRAIN PLUG GASKET %": "drainPlugGasket",
  "ISG BELT GENERATOR %": "isgBeltGenerator",
  "CNG FILTER %": "cngFilter",
  "3 PARTS PMS %": "threePartsPMS",
  "Grand Total %": "grandTotal",
};

const percentFormat = { decimalPlaces: 2, showPercent: true };

const growthFormatConfig = {
  airFilter: percentFormat,
  beltWaterPump: percentFormat,
  brakeFluid: percentFormat,
  coolant: percentFormat,
  fuelFilter: percentFormat,
  oilFilter: percentFormat,
  sparkPlug: percentFormat,
  sevenPartsPMS: percentFormat,
  drainPlugGasket: percentFormat,
  isgBeltGenerator: percentFormat,
  cngFilter: percentFormat,
  threePartsPMS: percentFormat,
  grandTotal: percentFormat,
};

const monthOptions = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
const cityOptions = ["Bangalore", "Mysore", "Mangalore"];
const qtrWiseOptions = ["Qtr1", "Qtr2", "Qtr3", "Qtr4"];
const halfYearOptions = ["H1", "H2"];
const financialYearOptions = ["2025-2026", "2026-2027"];

function readBranchName(row) {
  return row?.branch || row?.Branch || row?.branchName || row?.BranchName || row?.name || row?.Name || "";
}

function readCityName(row) {
  return row?.city || row?.City || row?.cityName || row?.CityName || "";
}

function readGrowthValue(row, apiKey) {
  const raw = row?.[apiKey];

  if (raw === undefined || raw === null) return null;

  if (typeof raw === "string" && raw.includes("/static/media")) {
    return null;
  }

  const cleaned = String(raw).replace("%", "").trim();
  const num = parseFloat(cleaned);

  return isNaN(num) ? null : num;
}

function PMSPartsNegativeTable() {
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

  const branchGroups = useMemo(
    () => [
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
    ],
    []
  );

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

        const endpoint = `/api/pms_parts/pms_parts_branch_summary?${params.toString()}`;
        const data = await fetchData(endpoint);
        setSummary(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setSummary([]);
      }
    };

    fetchSummary();
  }, [months, cities, qtrWise, halfYear, financialYears]);

  const PMS_THRESHOLD = 98;
  const tableData = useMemo(() => {
  return buildTableDataBelowThreshold({
    summary,
    selectedBranches,
    selectedCities,
    valueFilter,
    growthKeyMap,
    growthFormatConfig,
    readBranchName,
    readCityName,
    readGrowthValue,
    threshold: PMS_THRESHOLD,
  });
}, [summary, selectedBranches, selectedCities, valueFilter]);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">PMS PARTS Table (Branch-wise)</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/pms_parts")}>Graph-CityWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/pms_parts_branches")}>Graph-BranchWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/pms_parts-bar-chart")}>Bar Chart-CityWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/pms_parts_branches-bar-chart")}>Bar Chart-BranchWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/pms_parts-negative-table")}>Table</Button>
        </Box>
      </Box>

      <NegativeFilters
        cityOptions={cityOptions} selectedCities={selectedCities} handleCityChange={handleCityChange}
        selectedBranches={selectedBranches} handleBranchChange={handleBranchChange} branchGroups={branchGroups}
      />

      <SlicerFilters
        monthOptions={monthOptions} months={months} setMonths={setMonths}
        cityOptions={cityOptions} cities={cities} setCities={setCities}
        qtrWiseOptions={qtrWiseOptions} qtrWise={qtrWise} setQtrWise={setQtrWise}
        halfYearOptions={halfYearOptions} halfYear={halfYear} setHalfYear={setHalfYear}
        financialYearOptions={financialYearOptions} financialYears={financialYears} setFinancialYears={setFinancialYears}
      />

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mb: 3 }}>
        <ToggleButtonGroup
          value={valueFilter}
          onChange={handleValueFilterChange}
          size="small"
          sx={toggleGroupSx}
        >
          <ToggleButton value="positive">Above</ToggleButton>
          <ToggleButton value="negative">Below</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <NegativeTableView
        selectedBranches={selectedBranches}
        tableData={tableData}
        growthKeyMap={growthKeyMap}
        tableContainerSx={tableContainerSx}
        tableSx={tableSx}
        tableHeadRowSx={tableHeadRowSx}
        getNegativeCellSx={(value) => getThresholdCellSx(value, 98)}
      />
    </Box>
  );
}

export default PMSPartsNegativeTable;