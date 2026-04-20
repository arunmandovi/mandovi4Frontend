import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
} from "@mui/material";

import { fetchData } from "../../api/uploadService";
import { useNavigate } from "react-router-dom";

import SlicerFilters from "../../components/SlicerFilters";
import GrowthButtons from "../../components/GrowthButtons";
import BranchBarChart from "../../components/BranchBarChart";

import { getSelectedGrowth, setSelectedGrowth } from "../../utils/growthSelection";

import {
  CITY_ORDER,
  BRANCH_CITY_MAP,
} from "../../helpers/SortByCityAndBranch";

const ALL_BRANCHES = CITY_ORDER.flatMap((city) =>
  Object.entries(BRANCH_CITY_MAP)
    .filter(([_, c]) => c === city)
    .map(([br]) => br)
).sort((a, b) => a.localeCompare(b));

const growthKeyMap = {
    "Service Growth %": "growthService",
    "BodyShop Growth %": "growthBodyShop",
    "SR&BR Growth %": "growthSrBr",
    "Free Service Growth %": "growthFreeService",
    "PMS Growth %": "growthPMS",
    "FPR Growth %": "growthFPR",
    "RR Growth %": "growthRunningRepair",
    "Others Growth %": "growthOthers",
};

function LabourBranchesBarChartPage() {
  const navigate = useNavigate();

  const [summary, setSummary] = useState([]);
  const [months, setMonths] = useState([]);
  const [cities, setCities] = useState([]);
  const [channels, setChannels] = useState([]);
  const [qtrWise, setQtrWise] = useState([]);
  const [halfYear, setHalfYear] = useState([]);

  // ✅ Financial Year
  const [financialYears, setFinancialYears] = useState(["2026-2027"]);

  const [selectedGrowth, setSelectedGrowthState] = useState("PMS Growth %");
  const [selectedBranches, setSelectedBranches] = useState(ALL_BRANCHES);
  // ✅ Added selectedCities state
  const [selectedCities, setSelectedCities] = useState([]);

  const monthOptions = ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"];
  const cityOptions = ["Bangalore","Mysore","Mangalore"];
  const channelOptions = ["ARENA","NEXA"];
  const qtrWiseOptions = ["Qtr1","Qtr2","Qtr3","Qtr4"];
  const halfYearOptions = ["H1","H2"];
  const financialYearOptions = ["2025-2026", "2026-2027"];

  const growthOptions = Object.keys(growthKeyMap);

  const readBranchName = (row) =>
    row?.branch || row?.Branch || row?.branchName || row?.BranchName || row?.name || row?.Name || "";

  const readCityName = (row) =>
    row?.city || row?.City || row?.cityName || row?.CityName || "";

  const readGrowthValue = (row, apiKey) => {
    const raw = row?.[apiKey];
    if (raw === undefined || raw === null) return null;
    const cleaned = String(raw).replace("%", "").trim();
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  };

  useEffect(() => {
    const saved = getSelectedGrowth("labour");
    if (saved) setSelectedGrowthState(saved);
  }, []);

  // ✅ FETCH WITH FINANCIAL YEAR
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const params = new URLSearchParams();

        if (months.length) params.append("months", months.join(","));
        if (cities.length) params.append("cities", cities.join(","));
        if (channels.length) params.append("channels", channels.join(","));
        if (qtrWise.length) params.append("qtrWise", qtrWise.join(","));
        if (halfYear.length) params.append("halfYear", halfYear.join(","));

        const activeFY = financialYears[0] || "2025-2026";
        params.append("selectedFinancialYear", activeFY);

        const endpoint = `/api/labour/labour_branch_summary?${params.toString()}`;

        const data = await fetchData(endpoint);
        setSummary(Array.isArray(data) ? data : []);

      } catch (e) {
        console.error(e);
        setSummary([]);
      }
    };

    fetchSummary();
  }, [months, cities, channels, qtrWise, halfYear, financialYears]);

  const buildChartData = () => {
    if (!selectedGrowth) return [];
    const apiKey = growthKeyMap[selectedGrowth];

    const totals = {};
    const counts = {};
    const cityMap = {};

    summary.forEach((row) => {
      const br = readBranchName(row);
      // ✅ Filter branches by selected cities
      const city = readCityName(row);
      if (!selectedCities.includes(city) && selectedCities.length > 0) return;
      if (!selectedBranches.includes(br)) return;

      const val = readGrowthValue(row, apiKey);
      if (val === null) return;

      totals[br] = (totals[br] || 0) + val;
      counts[br] = (counts[br] || 0) + 1;
      cityMap[br] = city;
    });

    return Object.keys(totals)
      .map((b) => ({
        name: b,
        city: cityMap[b],
        value: totals[b] / counts[b],
      }))
      .sort((a, b) => b.value - a.value);
  };

  const chartData = buildChartData();

  const handleBranchChange = (e) => {
    setSelectedBranches(e.target.value);
  };

  // ✅ Added handleCityChange
  const handleCityChange = (e) => {
    const newSelectedCities = e.target.value;
    setSelectedCities(newSelectedCities);
    
    // Auto-select all branches for selected cities
    if (newSelectedCities.length > 0) {
      const branchesForCities = CITY_ORDER
        .filter(city => newSelectedCities.includes(city))
        .flatMap(city => 
          Object.entries(BRANCH_CITY_MAP)
            .filter(([_, c]) => c === city)
            .map(([br]) => br)
        );
      setSelectedBranches(branchesForCities);
    } else {
      // If no cities selected, select all branches
      setSelectedBranches(ALL_BRANCHES);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">LABOUR REPORT (Branch-wise)</Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/labour")}>Graph-CityWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/labour_branches")}>Graph-BranchWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/labour-bar-chart")}>Bar Chart-CityWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/labour_branches-bar-chart")}>Bar Chart-BranchWise</Button>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",justifyContent: "flex-end",gap: 2,mb: 3,flexWrap: "wrap"  
        }}
      >
        {/* ✅ CITY SELECTOR */}
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Select Cities</InputLabel>
          <Select
            multiple
            label="Select Cities"
            value={selectedCities}
            onChange={handleCityChange}
            renderValue={(selected) =>
              selected.length === 0
                ? "All Cities"
                : selected.length === cityOptions.length
                ? "All Cities"
                : `${selected.length} Cities`
            }
          >
            {cityOptions.map((city) => (
              <MenuItem value={city} key={city}>
                <Checkbox checked={selectedCities.includes(city)} />
                <ListItemText primary={city} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      
        {/* ✅ BRANCH SELECTOR */}
        <FormControl size="small" sx={{ minWidth: 260 }}>
          <InputLabel>Select Branches</InputLabel>
          <Select
            multiple
            label="Select Branches"
            value={selectedBranches}
            onChange={handleBranchChange}
            renderValue={() =>
              selectedCities.length > 0
                ? `${selectedBranches.length} Branches`
                : "All Branches"
            }
          >
            {CITY_ORDER.map((city) => (
              <React.Fragment key={city}>
                <ListItemText
                  primary={city}
                  sx={{ pl: 2, fontWeight: "bold" }}
                />
      
                {Object.entries(BRANCH_CITY_MAP)
                  .filter(([_, c]) => c === city)
                  .map(([br]) => (
                    <MenuItem value={br} key={br}>
                      <Checkbox checked={selectedBranches.includes(br)} />
                      <ListItemText primary={br} />
                    </MenuItem>
                  ))}
              </React.Fragment>
            ))}
          </Select>
        </FormControl>
      </Box>

      <SlicerFilters
        monthOptions={monthOptions}
        months={months}
        setMonths={setMonths}
        cityOptions={cityOptions}
        cities={cities}
        setCities={setCities}
        channelOptions={channelOptions}
        channels={channels}
        setChannels={setChannels}
        qtrWiseOptions={qtrWiseOptions}
        qtrWise={qtrWise}
        setQtrWise={setQtrWise}
        halfYearOptions={halfYearOptions}
        halfYear={halfYear}
        setHalfYear={setHalfYear}
        financialYearOptions={financialYearOptions}
        financialYears={financialYears}
        setFinancialYears={setFinancialYears}
      />

      <GrowthButtons
        growthOptions={growthOptions}
        selectedGrowth={selectedGrowth}
        setSelectedGrowth={(v) => {
          setSelectedGrowthState(v);
          setSelectedGrowth(v, "labour");
        }}
      />

      {selectedBranches.length === 0 ? (
        <Typography sx={{ mt: 2, color: "red" }}>
          Please select at least one branch.
        </Typography>
      ) : chartData.length === 0 ? (
        <Typography sx={{ mt: 2 }}>No data available.</Typography>
      ) : (
        <Box sx={{ mt: 2, height: 520, background: "#fff", borderRadius: 2, boxShadow: 3, p: 2 }}>
          <BranchBarChart
            chartData={chartData}
            selectedGrowth={selectedGrowth}
            showPercent={true}
          />
        </Box>
      )}
    </Box>
  );
}

export default LabourBranchesBarChartPage;