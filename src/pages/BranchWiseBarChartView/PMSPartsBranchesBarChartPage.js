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

function PMSPartsBranchesBarChartPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState([]);
  const [months, setMonths] = useState([]);
  const [cities, setCities] = useState([]);
  const [qtrWise, setQtrWise] = useState([]);
  const [halfYear, setHalfYear] = useState([]);
  const [selectedGrowth, setSelectedGrowthState] = useState("7 PARTS PMS %");
  const [selectedBranches, setSelectedBranches] = useState(ALL_BRANCHES);

  const monthOptions = ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"];
  const cityOptions = ["Bangalore", "Mysore", "Mangalore"];
  const qtrWiseOptions = ["Qtr1","Qtr2","Qtr3","Qtr4"];
  const halfYearOptions = ["H1","H2"];
  
  const growthOptions = [
    "Air filter %",
    "Belt water pump %",
    "Brake fluid %",
    "Coolant %",
    "Fuel Filter %",
    "Oil filter %",
    "Spark plug %",
    "7 PARTS PMS %",
    "DRAIN PLUG GASKET %",
    "ISG BELT GENERATOR %",
    "CNG FILTER %",
    "3 PARTS PMS %",
    "Grand Total %",
  ];

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

  useEffect(() => {
    const savedGrowth = getSelectedGrowth("pms_parts");
    if (savedGrowth) setSelectedGrowthState(savedGrowth);
  }, []);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const params = new URLSearchParams();
        if (months.length>0) params.append("months", months.join(","));
        if (cities.length>0) params.append("cities", cities.join(","));
        if (qtrWise.length>0) params.append("qtrWise", qtrWise.join(","));
        if (halfYear.length>0) params.append("halfYear", halfYear.join(","));
        const endpoint = `/api/pms_parts/pms_parts_branch_summary${params.toString()? "?"+params.toString():""}`;
        const data = await fetchData(endpoint);
        setSummary(Array.isArray(data)?data:[]);
      } catch (error) {
        console.error("Error fetching pms parts branch summary:", error);
        setSummary([]);
      }
    };
    fetchSummary();
  }, [months,cities,qtrWise,halfYear]);

  const readBranchName = (row) => row?.branch || row?.Branch || row?.branchName || row?.BranchName || row?.name || row?.Name || "";
  const readCityName = (row) => row?.city || row?.City || row?.cityName || row?.CityName || "";
  const readGrowthValue = (row, apiKey) => {
    if (!apiKey) return null;
    const val = row?.[apiKey];
    if (val === null || val === undefined || val === "") return null;
    const num = parseFloat(String(val).replace("%","").trim());
    return isNaN(num)?null:num;
  };

  const buildCombinedAverageData = (dataArr) => {
    const apiKey = growthKeyMap[selectedGrowth];
    const totals = {};
    const counts = {};
    const cityMap = {};
    (dataArr || []).forEach((row)=>{
      const branch = readBranchName(row);
      const city = readCityName(row);
      const val = readGrowthValue(row, apiKey);
      if (val===null) return;
      totals[branch] = (totals[branch]||0)+val;
      counts[branch] = (counts[branch]||0)+1;
      cityMap[branch] = city;
    });
    return Object.keys(totals)
    .map((b) => {
      const value = counts[b] ? totals[b] / counts[b] : 0;
  
      return {
        name: b,
        city: cityMap[b],
        value,
        fill: value > 98 ? "#05f105ff" : "#ff0000ff", 
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
    <Box sx={{p:3}}>
      <Box sx={{display:"flex", justifyContent:"space-between", alignItems:"center", mb:3}}>
        <Typography variant="h4">PMS PARTS REPORT (Branch-wise)</Typography>
        <Box sx={{display:"flex", gap:1}}>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/pms_parts")}>Graph-CityWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/pms_parts_branches")}>Graph-BranchWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/pms_parts-bar-chart")}>Bar Chart-CityWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/pms_parts_branches-bar-chart")}>Bar Chart-BranchWise</Button>
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
        monthOptions={monthOptions} months={months} setMonths={setMonths}
        cityOptions={cityOptions} cities={cities} setCities={setCities}
        qtrWiseOptions={qtrWiseOptions} qtrWise={qtrWise} setQtrWise={setQtrWise}
        halfYearOptions={halfYearOptions} halfYear={halfYear} setHalfYear={setHalfYear}
      />

      <GrowthButtons
        growthOptions={growthOptions}
        selectedGrowth={selectedGrowth}
        setSelectedGrowth={(value)=>{
          setSelectedGrowthState(value);
          setSelectedGrowth(value,"pms_parts");
        }}
      />

      {!selectedGrowth ? <Typography sx={{mt:2}}>👆 Select a growth type to view the chart below</Typography> :
        <BranchBarChart 
        chartData={chartData} 
        selectedGrowth={selectedGrowth} 
        decimalPlaces={2}
        />
      }
    </Box>
  );
}

export default PMSPartsBranchesBarChartPage;
