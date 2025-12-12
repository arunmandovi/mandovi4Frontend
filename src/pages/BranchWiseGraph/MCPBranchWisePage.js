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

const growthKeyMap = {
    "MCP NO": "mcp",
  };


function MCPBranchWisePage() {
  const navigate = useNavigate();

  const [summary, setSummary] = useState([]);
  const [months, setMonths] = useState([]);
  const [channels, setChannels] = useState([]);
  const [selectedGrowth, setSelectedGrowthState] = useState("MCP NO");

  const [selectedBranches, setSelectedBranches] = useState(["Wilson Garden", "Balmatta", "KRS Road"]);

  const monthOptions = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
  const channelOptions = ["Arena", "Nexa"];
  const growthOptions = Object.keys(growthKeyMap);

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
    const saved = getSelectedGrowth("mcp");
    if (saved) setSelectedGrowthState(saved);
  }, []);

  useEffect(() => {
    const fetchCitySummary = async () => {
      try {
        const activeMonths = months.length ? months : monthOptions;
        const combined = [];

        for (const m of activeMonths) {
          let query = `?&months=${m}`;
          if (channels.length === 1) query += `&channels=${channels[0]}`;

          const data = await fetchData(`/api/mcp/mcp_branch_summary${query}`);
          const safeData = Array.isArray(data) ? data : data?.result || [];

          combined.push({ month: m, data: safeData });
        }

        setSummary(combined);
      } catch (e) {
        console.error(e);
      }
    };

    fetchCitySummary();
  }, [months, channels]);

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
        <Typography variant="h4">MCP GRAPH (BranchWise)</Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/mcp")}>Graph-CityWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/mcp_branches")}>Graph-BranchWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/mcp-bar-chart")}>Bar Chart-CityWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/mcp_branches-bar-chart")}>Bar Chart-BranchWise</Button>
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
        setMonths={setMonths}
        channelOptions={channelOptions}
        channels={channels}
        setChannels={setChannels}
      />

      <GrowthButtons
        growthOptions={growthOptions}
        selectedGrowth={selectedGrowth}
        setSelectedGrowth={(value) => {
          setSelectedGrowthState(value);
          setSelectedGrowth(value, "mcp");
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
            decimalDigits={0}
            showPercent={false}
          />
        </Box>
      )}
    </Box>
  );
}

export default MCPBranchWisePage;
