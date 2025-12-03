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
    "Service&BodyShop Profit %": "serviceBodyShopPercentageProfit",
    "Service Profit %": "servicePercentageProfit",
    "BodyShop Profit %": "bodyShopPercentageProfit",
  };

function MGAProfitBranchesBarChartPage() {
  const navigate = useNavigate();

  const [summary, setSummary] = useState([]);
  const [months, setMonths] = useState([]);
  const [cities, setCities] = useState([]);
  const [qtrWise, setQtrWise] = useState([]);
  const [halfYear, setHalfYear] = useState([]);

  const [selectedGrowth, setSelectedGrowthState] = useState("Service&BodyShop Profit %");

  const [selectedBranches, setSelectedBranches] = useState(ALL_BRANCHES);

  const monthOptions = ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"];
  const cityOptions = ["Bangalore","Mysore","Mangalore"];
  const qtrWiseOptions = ["Qtr1","Qtr2","Qtr3","Qtr4"];
  const halfYearOptions = ["H1","H2"];
  const growthOptions = Object.keys(growthKeyMap);

  const readBranchName = (row) =>
    row?.branch ||
    row?.Branch ||
    row?.branchName ||
    row?.BranchName ||
    row?.name ||
    row?.Name ||
    "";

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
    const saved = getSelectedGrowth("mga_profit");
    if (saved) setSelectedGrowthState(saved);
  }, []);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const params = new URLSearchParams();
        if (months.length) params.append("months", months.join(","));
        if (cities.length) params.append("cities", cities.join(","));
        if (qtrWise.length) params.append("qtrWise", qtrWise.join(","));
        if (halfYear.length) params.append("halfYear", halfYear.join(","));

        const endpoint = `/api/mga_profit/mga_profit_branch_summary${
          params.toString() ? `?${params.toString()}` : ""
        }`;

        const data = await fetchData(endpoint);
        setSummary(Array.isArray(data) ? data : []);

      } catch (e) {
        console.error(e);
        setSummary([]);
      }
    };

    fetchSummary();
  }, [months, cities, qtrWise, halfYear]);

  const buildChartData = () => {
    if (!selectedGrowth) return [];
    const apiKey = growthKeyMap[selectedGrowth];

    const totals = {};
    const counts = {};
    const cityMap = {};

    summary.forEach((row) => {
      const br = readBranchName(row);
      if (!selectedBranches.includes(br)) return;

      const val = readGrowthValue(row, apiKey);
      if (val === null) return;

      totals[br] = (totals[br] || 0) + val;
      counts[br] = (counts[br] || 0) + 1;
      cityMap[br] = readCityName(row);
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
    const value = e.target.value;
    setSelectedBranches(value);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">MGA PROFIT REPORT (Branch-wise)</Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/mga_profit")}>Graph-CityWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/mga_profit_branches")}>Graph-BranchWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/mga_profit-bar-chart")}>Bar Chart-CityWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/mga_profit_branches-bar-chart")}>Bar Chart-BranchWise</Button>
        </Box>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 260 }}>
          <InputLabel>Select Branches</InputLabel>

          <Select
            multiple
            label="Select Branches"
            value={selectedBranches}
            onChange={handleBranchChange}
            displayEmpty
            renderValue={() => "Select Branches"}  // << ALWAYS SHOWN
            MenuProps={{
              PaperProps: {
                style: { maxHeight: 300 },
              },
            }}
          >
            <ListItemText primary="Bangalore" sx={{ pl: 2, fontWeight: "bold" }} />
            {Object.entries(BRANCH_CITY_MAP)
              .filter(([_, c]) => c === "Bangalore")
              .map(([br]) => (
                <MenuItem value={br} key={br}>
                  <Checkbox checked={selectedBranches.includes(br)} />
                  <ListItemText primary={br} />
                </MenuItem>
              ))}

            <ListItemText primary="Mysore" sx={{ pl: 2, fontWeight: "bold" }} />
            {Object.entries(BRANCH_CITY_MAP)
              .filter(([_, c]) => c === "Mysore")
              .map(([br]) => (
                <MenuItem value={br} key={br}>
                  <Checkbox checked={selectedBranches.includes(br)} />
                  <ListItemText primary={br} />
                </MenuItem>
              ))}

            <ListItemText primary="Mangalore" sx={{ pl: 2, fontWeight: "bold" }} />
            {Object.entries(BRANCH_CITY_MAP)
              .filter(([_, c]) => c === "Mangalore")
              .map(([br]) => (
                <MenuItem value={br} key={br}>
                  <Checkbox checked={selectedBranches.includes(br)} />
                  <ListItemText primary={br} />
                </MenuItem>
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
        qtrWiseOptions={qtrWiseOptions}
        qtrWise={qtrWise}
        setQtrWise={setQtrWise}
        halfYearOptions={halfYearOptions}
        halfYear={halfYear}
        setHalfYear={setHalfYear}
      />

      <GrowthButtons
        growthOptions={growthOptions}
        selectedGrowth={selectedGrowth}
        setSelectedGrowth={(v) => {
          setSelectedGrowthState(v);
          setSelectedGrowth(v, "mga_profit");
        }}
      />

      {selectedBranches.length === 0 ? (
        <Typography sx={{ mt: 2, color: "red" }}>
          Please select at least one branch.
        </Typography>
      ) : chartData.length === 0 ? (
        <Typography sx={{ mt: 2 }}>No data available.</Typography>
      ) : (
        <Box
          sx={{
            mt: 2,
            height: 520,
            background: "#fff",
            borderRadius: 2,
            boxShadow: 3,
            p: 2,
          }}
        >
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

export default MGAProfitBranchesBarChartPage;
