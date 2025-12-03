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
import BranchWiseGrowthLineChart from "../../components/BranchWiseGrowthLineChart";

import { getSelectedGrowth, setSelectedGrowth } from "../../utils/growthSelection";

import {
  CITY_ORDER,
  BRANCH_CITY_MAP,
} from "../../helpers/SortByCityAndBranch";

const ALL_BRANCHES = CITY_ORDER.flatMap(city =>
  Object.entries(BRANCH_CITY_MAP)
    .filter(([_, c]) => c === city)
    .map(([br]) => br)
).sort((a, b) => a.localeCompare(b));

const growthKeyMap = {
  Service: "countService",
  BodyShop: "countBodyShop",
  PMS: "countPMS",
  ServiceBodyShop: "countServiceBodyShop",
};

function HoldUpBranchWisePage() {
  const navigate = useNavigate();

  const [summary, setSummary] = useState([]);

  const [months, setMonths] = useState("Nov");
  const [days, setDays] = useState([]);
  const [selectedDate, setSelectedDate] = useState([]);

  const [selectedGrowth, setSelectedGrowthState] = useState("ServiceBodyShop");
  const [selectedBranches, setSelectedBranches] = useState([
    "Wilson Garden",
    "Balmatta",
    "KRS Road",
  ]);

  const monthOptions = [
    "Apr","May","Jun","Jul","Aug",
    "Sep","Oct","Nov","Dec","Jan","Feb","Mar",
  ];

  const allDayOptions = Array.from({ length: 31 }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );

  const readBranchName = (row) =>
    row?.branch || row?.Branch || row?.branchName || row?.BranchName || "";

  const readGrowthValue = (row, key) => {
    const raw = row?.[key];
    if (raw == null) return 0;
    const cleaned = String(raw).replace("%", "").trim();
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  useEffect(() => {
    const saved = getSelectedGrowth("hold_up");
    if (saved) setSelectedGrowthState(saved);
  }, []);

  useEffect(() => {
    if (!months) return;

    const fetchValidDays = async () => {
      try {
        const valid = [];

        for (const d of allDayOptions) {
          const query = `?month=${months}&day=${d}`;
          const data = await fetchData(`/api/hold_up/hold_up_branch_summary${query}`);

          const safe = Array.isArray(data) ? data : data?.result || [];
          if (safe.length > 0) valid.push(d);
        }

        setDays(valid);
      } catch (error) {
        console.error("Error detecting valid days:", error);
      }
    };

    fetchValidDays();
  }, [months]);

  useEffect(() => {
    if (days.length > 0 ) {
      setSelectedDate(days);
    }
  }, [days]);

  useEffect(() => {
    const fetchSummary = async () => {
      if (!months || selectedDate.length === 0) return;
  
      const selectedCities = [
        ...new Set(selectedBranches.map((br) => BRANCH_CITY_MAP[br])),
      ];
  
      const cityQuery = selectedCities.length
        ? `&cities=${selectedCities.join(",")}`
        : "";
  
      let allData = [];
  
      for (const day of selectedDate) {
        const query = `?month=${months}&day=${day}${cityQuery}`;
        const data = await fetchData(
          `/api/hold_up/hold_up_branch_summary${query}`
        );
  
        const safe = Array.isArray(data) ? data : data?.result || [];
  
        safe.forEach((row) =>
          allData.push({
            ...row,
            __day: day, 
          })
        );
      }
  
      setSummary(allData);
    };
  
    fetchSummary();
  }, [months, selectedDate, selectedBranches]);

  const buildChartData = () => {
    if (!selectedGrowth || selectedBranches.length === 0)
      return { formatted: [], sortedBranches: [] };
  
    const apiKey = growthKeyMap[selectedGrowth];
  
    const chartRows = [];
  
    selectedDate.forEach((day) => {
      const entry = {
        month: `${months}-${day}`,
      };
  
      selectedBranches.forEach((br) => (entry[br] = 0));
  
      summary
        .filter((r) => r.__day === day)
        .forEach((row) => {
          const branch = readBranchName(row);
          if (selectedBranches.includes(branch)) {
            entry[branch] = readGrowthValue(row, apiKey);
          }
        });
  
      chartRows.push(entry);
    });
  
    return {
      formatted: chartRows, 
      sortedBranches: selectedBranches,
    };
  };

  const { formatted: chartData, sortedBranches: branchKeys } = buildChartData();

  const handleBranchChange = (e) => {
    const value = e.target.value;
    value.includes("ALL")
      ? setSelectedBranches(ALL_BRANCHES)
      : setSelectedBranches(value.filter((x) => x !== "ALL"));
  };

  return (
    <Box sx={{ p: 3 }}>

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">HOLD UP GRAPH (BranchWise)</Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/hold_up_table")}>Hold Up Summary</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/hold_up")}>Graph-CityWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/hold_up_branches")}>Graph-BranchWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/hold_up-bar-chart")}>Bar Chart-CityWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/hold_up_branches-bar-chart")}>Bar Chart-BranchWise</Button>
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
        months={months ? [months] : []}
        setMonths={(selected) => {
          const lastSelected = selected[selected.length - 1] || "";
          setMonths(lastSelected);
        }}
        dateOptions={[]}
        dates={selectedDate}
        setDates={(arr) => {
          const last = arr[arr.length - 1];
          setSelectedDate(last ? [last.padStart(2, "0")] : []);    
        }}
      />

      <GrowthButtons
        growthOptions={Object.keys(growthKeyMap)}
        selectedGrowth={selectedGrowth}
        setSelectedGrowth={(v) => {
          setSelectedGrowthState(v);
          setSelectedGrowth(v, "hold_up");
        }}
      />

      {selectedBranches.length === 0 ? (
        <Typography sx={{ mt: 2, color: "red" }}>
          Please select at least one branch.
        </Typography>
      ) : chartData.length === 0 ? (
        <Typography>No data available.</Typography>
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
          <Typography variant="h6" sx={{ mb: 1 }}>
            {selectedGrowth}
          </Typography>

          <BranchWiseGrowthLineChart
            chartData={chartData}
            cityKeys={branchKeys}
            decimalDigits={0}
            showPercent={false}
          />
        </Box>
      )}
    </Box>
  );
}

export default HoldUpBranchWisePage;
