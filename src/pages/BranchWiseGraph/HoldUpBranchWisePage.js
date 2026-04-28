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

  const getCurrentFYMonth = () => {
    const jsMonthToName = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return jsMonthToName[new Date().getMonth()];
  };

  const [months, setMonths] = useState(getCurrentFYMonth());
  const [years, setYears] = useState("2026");
  const [channels, setChannels] = useState([]); // ✅ NEW
  const [selectedCities, setSelectedCities] = useState([]);
  const [days, setDays] = useState([]);
  const [selectedDate, setSelectedDate] = useState([]);
  const [selectedGrowth, setSelectedGrowthState] = useState("ServiceBodyShop");
  const [selectedBranches, setSelectedBranches] = useState([
    "Wilson Garden","Balmatta","KRS Road"
  ]);

  const monthOptions = ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"];
  const yearOtions = ["2025","2026"];
  const cityOptions = ["Bangalore", "Mysore", "Mangalore"];
  const channelOptions = ["ARENA","NEXA"]; // ✅ NEW

  const allDayOptions = Array.from({ length: 31 }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );

  useEffect(() => {
    const saved = getSelectedGrowth("hold_up");
    if (saved) setSelectedGrowthState(saved);
  }, []);

  const buildQuery = (day, citiesArr = []) => {
    let query = `?month=${months}&day=${day}`;

    if (years) {
      query += `&years=${years}`;
    }

    if (citiesArr.length > 0) {
      citiesArr.forEach((c) => {
        query += `&cities=${encodeURIComponent(c)}`;
      });
    }

    if (channels && channels.length > 0) {
      channels.forEach((ch) => {
        query += `&channels=${encodeURIComponent(ch)}`;
      });
    }

    return query;
  };

  // ✅ Detect valid days (with channels)
  useEffect(() => {
    if (!months) return;

    const fetchValidDays = async () => {
      try {
        const valid = [];

        for (const d of allDayOptions) {
          const query = buildQuery(d);
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
  }, [months, years, channels]);

  useEffect(() => {
    if (days.length > 0) {
      setSelectedDate(days);
    }
  }, [days]);

  // ✅ Fetch summary (with channels)
  useEffect(() => {
    const fetchSummary = async () => {
      if (!months || selectedDate.length === 0) return;

      const selectedCitiesFromBranches = [
        ...new Set(selectedBranches.map((br) => BRANCH_CITY_MAP[br])),
      ];

      let allData = [];

      for (const day of selectedDate) {
        const query = buildQuery(day, selectedCitiesFromBranches);

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
  }, [months, selectedDate, selectedBranches, channels, years]);

  const readBranchName = (row) =>
    row?.branch || row?.Branch || row?.branchName || row?.BranchName || "";

  const readGrowthValue = (row, key) => {
    const raw = row?.[key];
    if (raw == null) return 0;
    const parsed = parseFloat(String(raw).replace("%", "").trim());
    return isNaN(parsed) ? 0 : parsed;
  };

  const buildChartData = () => {
    if (!selectedGrowth || selectedBranches.length === 0)
      return { formatted: [], sortedBranches: [] };

    const apiKey = growthKeyMap[selectedGrowth];
    const chartRows = [];

    selectedDate.forEach((day) => {
      const entry = { month: `${months}-${day}` };

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

  const handleCityChange = (e) => {
    const newSelectedCities = e.target.value;
    setSelectedCities(newSelectedCities);

    if (newSelectedCities.length > 0) {
      const branchesForCities = newSelectedCities.flatMap(city =>
        Object.entries(BRANCH_CITY_MAP)
          .filter(([_, c]) => c === city)
          .map(([br]) => br)
      );
      setSelectedBranches(branchesForCities);
    } else {
      setSelectedBranches(ALL_BRANCHES);
    }
  };

  return (
    <Box sx={{ p: 3 }}>

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">HOLD UP GRAPH (BranchWise)</Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/hold_up_table")}>HoldUp Summary</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/hold_up_day_table")}>HoldUp DayWise Summary</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/hold_up")}>Graph-CityWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/hold_up_branches")}>Graph-BranchWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/hold_up-bar-chart")}>Bar Chart-CityWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/hold_up_branches-bar-chart")}>Bar Chart-BranchWise</Button>
        </Box>
      </Box>

      <SlicerFilters
        monthOptions={monthOptions}
        months={months ? [months] : []}
        setMonths={(selected) => setMonths(selected[selected.length - 1] || "")}
        dateOptions={[]}
        dates={selectedDate}
        setDates={(arr) => {
          const last = arr[arr.length - 1];
          setSelectedDate(last ? [last.padStart(2, "0")] : []);
        }}
        yearOptions={yearOtions}
        years={years}
        setYears={setYears}
        channelOptions={channelOptions}   // ✅ added
        channels={channels}               // ✅ added
        setChannels={setChannels}         // ✅ added
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
        <Box sx={{ mt: 2, height: 520, background: "#fff", borderRadius: 2, boxShadow: 3, p: 2 }}>
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