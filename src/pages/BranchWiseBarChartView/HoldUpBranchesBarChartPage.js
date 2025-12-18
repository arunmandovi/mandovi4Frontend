import React, { useState, useEffect } from "react";
import { Box, Button, Typography, FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText, } from "@mui/material";
import { fetchData } from "../../api/uploadService";
import { useNavigate, useLocation } from "react-router-dom";
import SlicerFilters from "../../components/SlicerFilters";
import GrowthButtons from "../../components/GrowthButtons";
import BranchBarChart from "../../components/BranchBarChart";
import { getSelectedGrowth, setSelectedGrowth } from "../../utils/growthSelection";

import { CITY_ORDER, BRANCH_CITY_MAP, } from "../../helpers/SortByCityAndBranch";

const ALL_BRANCHES = CITY_ORDER.flatMap((city) =>
  Object.entries(BRANCH_CITY_MAP)
    .filter(([_, c]) => c === city)
    .map(([br]) => br)
).sort((a, b) => a.localeCompare(b));

function HoldUpBranchesBarChartPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCities, setSelectedCities] = useState([]);
  const [summary, setSummary] = useState([]);
  const getCurrentFYMonth = () => {
  const monthMapReverse = {
      0: "Jan", 1: "Feb", 2: "Mar", 3: "Apr", 4: "May", 5: "Jun", 6: "Jul", 7: "Aug", 8: "Sep", 9: "Oct", 10: "Nov", 11: "Dec",
    };
    const today = new Date();
    const jsMonth = today.getMonth();
    return monthMapReverse[jsMonth] || "Apr";
  };

const [months, setMonths] = useState([getCurrentFYMonth()]);
  const [days, setDays] = useState([]);
  const [selectedDate, setSelectedDate] = useState([]);
  const [selectedGrowth, setSelectedGrowthState] = useState(null);
  const [selectedBranches, setSelectedBranches] = useState(ALL_BRANCHES);

  const monthOptions = ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"];
  const cityOptions = ["BANGALORE", "MYSORE", "MANGALORE"];
  const growthOptions = ["Service", "BodyShop", "PMS", "ServiceBodyShop"];

  const growthKeyMap = {
    Service: "countService",
    BodyShop: "countBodyShop",
    PMS: "countPMS",
    ServiceBodyShop: "countServiceBodyShop"
  };

  useEffect(() => {
    const prev = getSelectedGrowth("hold_up");
    const fromNavigation = location.state?.fromNavigation === true;

    if (!fromNavigation) {
      if (!prev) {
        setSelectedGrowthState("ServiceBodyShop");
        setSelectedGrowth("ServiceBodyShop", "hold_up");
      } else {
        setSelectedGrowthState(prev);
      }
    } else {
      setSelectedGrowthState(prev || "ServiceBodyShop");
    }
  }, []);

  useEffect(() => {
    if (!months || months.length === 0) return;

    const month = Array.isArray(months) ? months[0] : months;
    const currentYear = new Date().getFullYear();
    const monthMap = {
      Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8,
      Oct: 9, Nov: 10, Dec: 11, Jan: 0, Feb: 1, Mar: 2
    };

    const jsMonth = monthMap[month];
    const daysInMonth = new Date(currentYear, jsMonth + 1, 0).getDate();

    const validDays = Array.from({ length: daysInMonth }, (_, i) =>
      String(i + 1).padStart(2, "0")
    );

    setDays(validDays);
  }, [months]);

  useEffect(() => {
    if (days.length > 0 && selectedDate.length === 0) {
      setSelectedDate([days[days.length - 1]]);
    }
  }, [days]);

  useEffect(() => {
    const autoSelectLastAvailableDate = async () => {
      if (days.length === 0) return;
  
      let latestDateWithData = null;
  
      for (let i = days.length - 1; i >= 0; i--) {
        const day = days[i];
        const month = Array.isArray(months) ? months[0] : months;
  
        const cityQuery =
          selectedCities.length > 0
            ? `&cities=${selectedCities.join(",")}`
            : "";
  
        const query = `?month=${month}&day=${day}${cityQuery}`;
  
        try {
          const res = await fetchData(
            `/api/hold_up/hold_up_branch_summary${query}`
          );
  
          const safe = Array.isArray(res) ? res : res?.result || [];
  
          if (safe.length > 0) {
            latestDateWithData = day;
            break;
          }
        } catch (err) {
          console.error("Error checking date:", day, err);
        }
      }
  
      if (latestDateWithData) {
        setSelectedDate([latestDateWithData]);
      } else {
        setSelectedDate([days[days.length - 1]]);
      }
    };
  
    autoSelectLastAvailableDate();
  }, [days, months, selectedCities]);

  useEffect(() => {
    if (!months || selectedDate.length === 0) return;

    const fetchSummary = async () => {
      try {
        const month = Array.isArray(months) ? months[0] : months;
        const day = selectedDate[0];

        const cityQuery = selectedCities.length > 0
          ? `&cities=${selectedCities.join(",")}`
          : "";

        const query = `?month=${month}&day=${day}${cityQuery}`;

        const data = await fetchData(
          `/api/hold_up/hold_up_branch_summary${query}`
        );

        setSummary(Array.isArray(data) ? data : data?.result || []);
      } catch (error) {
        console.error("Error fetching hold up branch summary:", error);
        setSummary([]);
      }
    };

    fetchSummary();
  }, [months, selectedDate, selectedCities]);

  const readBranchName = (row) =>
    row?.branch || row?.Branch || row?.branchName || row?.BranchName || row?.name || row?.Name || "";

  const readCityName = (row) =>
    row?.city || row?.City || row?.cityName || row?.CityName || "";

  const readGrowthValue = (row, apiKey) => {
    if (!apiKey) return null;
    const val = row?.[apiKey];
    if (val === null || val === undefined || val === "") return null;

    const num = parseFloat(String(val).replace("%", "").trim());
    return isNaN(num) ? null : num;
  };

  const getFillColor = (value, max) => {
    if (max === 0) return "rgb(0,200,0)"; 
  
    const ratio = value / max; 
  
    const colors = [
      { stop: 1.0, r: 180, g: 0,   b: 0 }, { stop: 0.75, r: 255, g: 0,   b: 0 }, { stop: 0.5, r: 255, g: 140, b: 0 },  
      { stop: 0.25, r: 255, g: 255, b: 0 }, { stop: 0.0, r: 0,   g: 200, b: 0 }   
    ];
  
    for (let i = 0; i < colors.length - 1; i++) {
      const c1 = colors[i];
      const c2 = colors[i + 1];
  
      if (ratio <= c1.stop && ratio >= c2.stop) {
        const range = c1.stop - c2.stop;
        const t = (ratio - c2.stop) / range;
  
        const r = Math.round(c2.r + (c1.r - c2.r) * t);
        const g = Math.round(c2.g + (c1.g - c2.g) * t);
        const b = Math.round(c2.b + (c1.b - c2.b) * t);
  
        return `rgb(${r},${g},${b})`;
      }
    }
    return "rgb(0,200,0)";
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

      if (val === null) return;

      totals[branch] = (totals[branch] || 0) + val;
      counts[branch] = (counts[branch] || 0) + 1;
      cityMap[branch] = city;
    });

    const raw = Object.keys(totals).map((b) => ({
      name: b,
      city: cityMap[b],
      value: counts[b] ? totals[b] / counts[b] : 0
    }));

    const max = Math.max(...raw.map((x) => x.value), 0);

    return raw
      .map((item) => ({
        ...item,
        fill: getFillColor(item.value, max)
      }))
      .sort((a, b) => b.value - a.value);
  };

  const chartData =
  selectedGrowth && summary.length > 0
    ? buildCombinedAverageData(summary)
        .filter(item => {
          if (
            selectedGrowth === "BodyShop Growth %" ||  selectedGrowth === "BS on FPR 2024-25 %" || selectedGrowth === "BS on FPR 2025-26 %"
          ) {
            return !(
              item.name === "Vittla" || item.name === "Naravi" || item.name === "Gowribidanur" || item.name === "Malur SOW" ||
              item.name === "Maluru WS" || item.name === "Kollegal" || item.name === "Narasipura" || item.name === "Nagamangala" ||
              item.name === "Maddur" || item.name === "Somvarpet" || item.name === "Krishnarajapet" || item.name === "ChamrajNagar" ||
              item.name === "KRS Road" || item.name === "Balmatta" || item.name === "Bantwal" ||
              item.name === "Nexa Service" || item.name === "Kadaba" || item.name === "Sujith Bagh Lane"
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
          mb: 3
        }}
      >
        <Typography variant="h4">HOLD UP REPORT (Branch-wise)</Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
           <Button
            variant="contained"
            onClick={() =>
              navigate("/DashboardHome/hold_up_table", { state: { fromNavigation: true } })
            }
          >
            HoldUp Summary
          </Button>

          <Button
            variant="contained"
            onClick={() =>
              navigate("/DashboardHome/hold_up_day_table", { state: { fromNavigation: true } })
            }
          >
            HoldUp DayWise Summary
          </Button>

          <Button
            variant="contained"
            onClick={() =>
              navigate("/DashboardHome/hold_up", { state: { fromNavigation: true } })
            }
          >
            Graph-CityWise
          </Button>

          <Button
            variant="contained"
            onClick={() =>
              navigate("/DashboardHome/hold_up_branches", { state: { fromNavigation: true } })
            }
          >
            Graph-BranchWise
          </Button>

          <Button
            variant="contained"
            onClick={() =>
              navigate("/DashboardHome/hold_up-bar-chart", { state: { fromNavigation: true } })
            }
          >
            Bar Chart-CityWise
          </Button>

          <Button
            variant="contained"
            onClick={() =>
              navigate("/DashboardHome/hold_up_branches-bar-chart", {
                state: { fromNavigation: true }
              })
            }
          >
            Bar Chart-BranchWise
          </Button>
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
        months={months}
        setMonths={(selected) => {
          const lastSelected = selected[selected.length - 1];
          setMonths(lastSelected ? [lastSelected] : []);
        }}
        cityOptions={cityOptions}
        cities={selectedCities}
        setCities={setSelectedCities}
        dateOptions={days}
        dates={selectedDate}
        setDates={(arr) => {
          const last = arr[arr.length - 1];
          setSelectedDate(last ? [last.padStart(2, "0")] : []);
        }}
      />

      <GrowthButtons
        growthOptions={growthOptions}
        selectedGrowth={selectedGrowth}
        setSelectedGrowth={(value) => {
          setSelectedGrowthState(value);
          setSelectedGrowth(value, "hold_up");
        }}
      />

      {!selectedGrowth ? (
        <Typography sx={{ mt: 2 }}>
          👆 Select a growth type to view the chart below
        </Typography>
      ) : summary.length === 0 ? (
        <Typography>No data available for the selected criteria.</Typography>
      ) : (
        <BranchBarChart
          chartData={chartData}
          selectedGrowth={selectedGrowth}
          decimalPlaces={0}
          chartType="absValue"
        />
      )}
    </Box>
  );
}

export default HoldUpBranchesBarChartPage;
