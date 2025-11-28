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

const ALL_BRANCHES = CITY_ORDER.flatMap((city) =>
  Object.entries(BRANCH_CITY_MAP)
    .filter(([_, c]) => c === city)
    .map(([br]) => br)
).sort((a, b) => a.localeCompare(b));

// Growth Key Map
const growthKeyMap = {
    "Arena BR Conversion %": "percentageArenaBRConversion",
    "Nexa BR Conversion %": "percentageNexaBRConversion",
    "Arena&Nexa BR Conversion %": "percentageArenaNexaBRConversion",
    "Arena Total Amount": "totalArenaAmount",
    "Nexa Total Amount": "totalNexaAmount",
    "Arena&Nexa Total Amount": "totalArenaNexaAmount",
  };

function BRConversionBranchWisePage() {
  const navigate = useNavigate();

  const [summary, setSummary] = useState([]);
  const [months, setMonths] = useState([]);
  const [selectedGrowth, setSelectedGrowthState] = useState("Arena&Nexa BR Conversion %");

  const [selectedBranches, setSelectedBranches] = useState(["Wilson Garden", "Balmatta", "KRS Road"]);

  const monthOptions = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
  const growthOptions = Object.keys(growthKeyMap);

  // Read branch exactly as API sends
  const readBranchName = (row) => {
    return row?.branch || row?.Branch || row?.branchName || row?.BranchName || "";
  };

  const readGrowthValue = (row, key) => {
    const raw = row?.[key];
    if (raw === undefined || raw === null) return null;
    const clean = String(raw).replace("%", "").trim();
    const parsed = parseFloat(clean);
    return isNaN(parsed) ? null : parsed;
  };

  useEffect(() => {
    const saved = getSelectedGrowth("br_conversion");
    if (saved) setSelectedGrowthState(saved);
  }, []);

  // API Fetch
  useEffect(() => {
    const fetchCitySummary = async () => {
      try {
        const activeMonths = months.length ? months : monthOptions;
        const combined = [];

        for (const m of activeMonths) {
          let query = `?&months=${m}`;

          const data = await fetchData(`/api/br_conversion/br_conversion_branch_summary${query}`);
          const safeData = Array.isArray(data) ? data : data?.result || [];

          combined.push({ month: m, data: safeData });
        }

        setSummary(combined);
      } catch (e) {
        console.error(e);
      }
    };

    fetchCitySummary();
  }, [months]);

  // Build Chart Data
  const buildChartData = () => {
    if (!selectedGrowth || selectedBranches.length === 0)
      return { formatted: [], sortedBranches: [] };

    const apiKey = growthKeyMap[selectedGrowth];

    const formatted = summary.map(({ month, data }) => {
      const entry = { month };

      selectedBranches.forEach((br) => {
        entry[br] = 0;
      });

      (data || []).forEach((row) => {
        const apiBranch = readBranchName(row);
        if (!selectedBranches.includes(apiBranch)) return;

        const val = readGrowthValue(row, apiKey);
        entry[apiBranch] = val ?? 0;
      });

      return entry;
    });

    return { formatted, sortedBranches: selectedBranches };
  };

  const { formatted: chartData, sortedBranches: cityKeys } = buildChartData();

  // Select Branches
  const handleBranchChange = (e) => {
    const value = e.target.value;

    if (value.includes("ALL")) {
      setSelectedBranches(ALL_BRANCHES);
    } else {
      setSelectedBranches(value.filter((x) => x !== "ALL"));
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">BR CONVERSION GRAPH (BranchWise)</Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/br_conversion")}>Graph-CityWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/br_conversion_branches")}>Graph-BranchWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/br_conversion-bar-chart")}>Bar Chart-CityWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/br_conversion_branches-bar-chart")}>Bar Chart-BranchWise</Button>
        </Box>
      </Box>

      {/* Branch Dropdown (ONLY dropdown now) */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 260 }}>
          <InputLabel>Select Branches</InputLabel>
          <Select
            multiple
            value={selectedBranches}
            label="Select Branches"
            onChange={handleBranchChange}
            renderValue={(selected) => selected.join(", ")}
          >
      
            {/* Group: Bangalore */}
            <ListItemText primary="Bangalore" sx={{ pl: 2, fontWeight: "bold" }} />
            {Object.entries(BRANCH_CITY_MAP)
              .filter(([_, city]) => city === "Bangalore")
              .map(([branch]) => (
                <MenuItem key={branch} value={branch}>
                  <Checkbox checked={selectedBranches.includes(branch)} />
                  <ListItemText primary={branch} />
                </MenuItem>
              ))}
      
            {/* Group: Mysore */}
            <ListItemText primary="Mysore" sx={{ pl: 2, fontWeight: "bold", mt: 1 }} />
            {Object.entries(BRANCH_CITY_MAP)
              .filter(([_, city]) => city === "Mysore")
              .map(([branch]) => (
                <MenuItem key={branch} value={branch}>
                  <Checkbox checked={selectedBranches.includes(branch)} />
                  <ListItemText primary={branch} />
                </MenuItem>
              ))}
      
            {/* Group: Mangalore */}
            <ListItemText primary="Mangalore" sx={{ pl: 2, fontWeight: "bold", mt: 1 }} />
            {Object.entries(BRANCH_CITY_MAP)
              .filter(([_, city]) => city === "Mangalore")
              .map(([branch]) => (
                <MenuItem key={branch} value={branch}>
                  <Checkbox checked={selectedBranches.includes(branch)} />
                  <ListItemText primary={branch} />
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      </Box>
      <SlicerFilters
        monthOptions={monthOptions}
        months={months}
        setMonths={setMonths}
      />

      <GrowthButtons
        growthOptions={growthOptions}
        selectedGrowth={selectedGrowth}
        setSelectedGrowth={(value) => {
          setSelectedGrowthState(value);
          setSelectedGrowth(value, "br_conversion");
        }}
      />

      {/* Graph */}
      {selectedBranches.length === 0 ? (
        <Typography sx={{ mt: 2, color: "red" }}>Please select at least one branch.</Typography>
      ) : !selectedGrowth ? (
        <Typography>Select a growth type to view the chart</Typography>
      ) : chartData.length === 0 ? (
        <Typography>No data available for selected criteria.</Typography>
      ) : (
        <Box
          sx={{
            mt: 2,
            height: 500,
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
            cityKeys={cityKeys}
            decimalDigits={["Arena BR Conversion %", "Nexa BR Conversion %", "Arena&Nexa BR Conversion %"]
                .includes(selectedGrowth) ? 1 : 0 }
            showPercent={
                ["Arena BR Conversion %", "Nexa BR Conversion %", "Arena&Nexa BR Conversion %"]
                .includes(selectedGrowth) ? true : false }
          />
        </Box>
      )}
    </Box>
  );
}

export default BRConversionBranchWisePage;
