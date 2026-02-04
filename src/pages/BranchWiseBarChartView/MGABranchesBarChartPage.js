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
import {
  CITY_ORDER,
  BRANCH_CITY_MAP,
} from "../../helpers/SortByCityAndBranch";

const ALL_BRANCHES = CITY_ORDER.flatMap((city) =>
  Object.entries(BRANCH_CITY_MAP)
    .filter(([_, c]) => c === city)
    .map(([br]) => br)
).sort((a, b) => a.localeCompare(b));

function MGABranchesBarChartPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState([]);
  const [months, setMonths] = useState([]);
  const [cities, setCities] = useState([]);
  const [channels, setChannels] = useState([]);
  const [qtrWise, setQtrWise] = useState([]);
  const [halfYear, setHalfYear] = useState([]);
  const [selectedGrowth, setSelectedGrowth] = useState(null);
  const [selectedBranches, setSelectedBranches] = useState(ALL_BRANCHES);

  const monthOptions = [
    "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct",
    "Nov", "Dec", "Jan", "Feb", "Mar",
  ];
  const cityOptions = ["Bangalore", "Mysore", "Mangalore"];
  const channelOptions = ["ARENA", "NEXA"];
  const qtrWiseOptions = ["Qtr1", "Qtr2", "Qtr3", "Qtr4"];
  const halfYearOptions = ["H1", "H2"];
  const growthOptions = ["MGA By VEH"];
  const growthKeyMap = { "MGA By VEH": "mgaVeh" };

    useEffect(() => {
    if (growthOptions.length === 1) {
      setSelectedGrowth(growthOptions[0]);
     }
    }, []);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const params = new URLSearchParams();
        if (months.length > 0) params.append("months", months.join(","));
        if (cities.length > 0) params.append("cities", cities.join(","));
        if (channels.length > 0) params.append("channels", channels.join(","));
        if (qtrWise.length > 0) params.append("qtrWise", qtrWise.join(","));
        if (halfYear.length > 0) params.append("halfYear", halfYear.join(","));
        const endpoint = `/api/mga/mga_branch_summary${
          params.toString() ? "?" + params.toString() : ""
        }`;

        const data = await fetchData(endpoint);
        setSummary(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching mga branch summary:", error);
        setSummary([]);
      }
    };
    fetchSummary();
  }, [months, cities, channels, qtrWise, halfYear]);

  const readBranchName = (row) =>
    row?.branch || row?.Branch || row?.branchName || row?.BranchName || row?.name || row?.Name || "";
  const readCityName = (row) =>
    row?.city || row?.City || row?.cityName || row?.CityName || "";

  const readGrowthValue = (row, apiKey) => {
    const candidates = [
      apiKey,
      apiKey?.toLowerCase(),
      apiKey?.toUpperCase(),
      apiKey?.replace(/([A-Z])/g, "_$1").toLowerCase(),
      "value",
      "growth",
      "val",
    ];
    for (const key of candidates) {
      if (Object.prototype.hasOwnProperty.call(row, key) && row[key] != null)
        return row[key];
    }
    for (const key of Object.keys(row)) {
      const v = row[key];
      if (typeof v === "number") return v;
      if (typeof v === "string" && v.trim().match(/^-?\d+(\.\d+)?%?$/)) return v;
    }
    return undefined;
  };

  const buildCombinedAverageData = (dataArr) => {
    const apiKey = growthKeyMap[selectedGrowth];
    const totals = {};
    const counts = {};
    const cityMap = {};

    (dataArr || []).forEach((row) => {
      const branch = readBranchName(row);
      const city = readCityName(row);
      const val = readGrowthValue(row, apiKey);
      const parsed = parseFloat(String(val).replace("%", "").trim());

      if (!isNaN(parsed)) {
        totals[branch] = (totals[branch] || 0) + parsed;
        counts[branch] = (counts[branch] || 0) + 1;
        cityMap[branch] = city;
      }
    });

    return Object.keys(totals)
      .map((b) => {
        const resultVal = counts[b] ? totals[b] / counts[b] : 0;
        return {
          name: b,
          city: cityMap[b],
          value: resultVal,
          fill: resultVal < 455 ? "red" : "#05f105ff",
        };
      })
      .sort((a, b) => b.value - a.value);
  };

  const chartData =
  selectedGrowth && summary.length > 0
    ? buildCombinedAverageData(summary)
        .filter(item => {

          if (
            selectedGrowth === "BodyShop Growth %" ||
            selectedGrowth === "BS on FPR 2024-25 %" ||
            selectedGrowth === "BS on FPR 2025-26 %"
          ) {
            return !(
              item.name === "Vittla" ||
              item.name === "Naravi" ||
              item.name === "Gowribidanur" ||
              item.name === "Malur SOW" ||
              item.name === "Maluru WS" ||
              item.name === "Kollegal" ||
              item.name === "Mandya Nexa" ||
              item.name === "Narasipura" ||
              item.name === "Nagamangala" ||
              item.name === "Maddur" ||
              item.name === "Somvarpet" ||
              item.name === "Krishnarajapet" ||
              item.name === "ChamrajNagar" ||
              item.name === "KRS Road" ||
              item.name === "Balmatta" ||
              item.name === "Bantwal" ||
              item.name === "Nexa Service" ||
              item.name === "Kadaba" ||
              item.name === "Sujith Bagh Lane"
            );
          }

          return true;
        })
        .filter(item => selectedBranches.includes(item.name))
    : [];

    const handleBranchChange = (e) => {
      const value = e.target.value;
      setSelectedBranches(value);
    };

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">MGA REPORT (Branch-wise)</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/mga")}>Graph-CityWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/mga_branches")}>Graph-BranchWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/mga-bar-chart")}>Bar Chart-CityWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/mga_branches-bar-chart")}>Bar Chart-BranchWise</Button>
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
            renderValue={() => "Select Branches"} 
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
        cityOptions={cityOptions}
        channelOptions={channelOptions}
        qtrWiseOptions={qtrWiseOptions}
        halfYearOptions={halfYearOptions}
        months={months}
        setMonths={setMonths}
        cities={cities}
        setCities={setCities}
        channels={channels}
        setChannels={setChannels}
        qtrWise={qtrWise}
        setQtrWise={setQtrWise}
        halfYear={halfYear}
        setHalfYear={setHalfYear}
      />

      <GrowthButtons
        growthOptions={growthOptions}
        selectedGrowth={selectedGrowth}
        setSelectedGrowth={setSelectedGrowth}
      />

      {!selectedGrowth ? (
        <Typography>👆 Select a growth type to view the chart below</Typography>
      ) : (
        <BranchBarChart
          chartData={chartData}
          selectedGrowth={selectedGrowth}
          decimalPlaces={0}
          chartType="MGABranchesBarChart"
        />
      )}
    </Box>
  );
}

export default MGABranchesBarChartPage;