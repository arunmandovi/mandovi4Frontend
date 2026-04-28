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
import { useNavigate, useLocation } from "react-router-dom";
import SlicerFilters from "../../components/SlicerFilters";
import GrowthButtons from "../../components/GrowthButtons";
import BranchBarChart from "../../components/BranchBarChart";
import { getSelectedGrowth, setSelectedGrowth } from "../../utils/growthSelection";

import { CITY_ORDER, BRANCH_CITY_MAP } from "../../helpers/SortByCityAndBranch";

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
      0: "Jan", 1: "Feb", 2: "Mar", 3: "Apr", 4: "May", 5: "Jun",
      6: "Jul", 7: "Aug", 8: "Sep", 9: "Oct", 10: "Nov", 11: "Dec",
    };
    return monthMapReverse[new Date().getMonth()] || "Apr";
  };

  const [months, setMonths] = useState([getCurrentFYMonth()]);
  const [years, setYears] = useState("2026");
  const [channels, setChannels] = useState([]); 
  const [days, setDays] = useState([]);
  const [selectedDate, setSelectedDate] = useState([]);
  const [selectedGrowth, setSelectedGrowthState] = useState(null);
  const [selectedBranches, setSelectedBranches] = useState(ALL_BRANCHES);

  const monthOptions = ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"];
  const yearOtions = ["2025","2026"];
  const cityOptions = ["Bangalore", "Mysore", "Mangalore"];
  const channelOptions = ["ARENA","NEXA"]; 

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

    const month = months[0];
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

  const buildQuery = (day) => {
    const month = months[0];

    let query = `?month=${month}&day=${day}&years=${years}`;

    if (selectedCities.length > 0) {
      selectedCities.forEach((c) => {
        query += `&cities=${encodeURIComponent(c)}`;
      });
    }

    if (channels.length > 0) {
      channels.forEach((ch) => {
        query += `&channels=${encodeURIComponent(ch)}`;
      });
    }

    return query;
  };

  useEffect(() => {
    const autoSelectLastAvailableDate = async () => {
      if (days.length === 0) return;

      let latestDateWithData = null;

      for (let i = days.length - 1; i >= 0; i--) {
        const day = days[i];

        try {
          const res = await fetchData(
            `/api/hold_up/hold_up_branch_summary${buildQuery(day)}`
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

      setSelectedDate([
        latestDateWithData || days[days.length - 1]
      ]);
    };

    autoSelectLastAvailableDate();
  }, [days, months, years, selectedCities, channels]);

  useEffect(() => {
    if (!months || selectedDate.length === 0) return;

    const fetchSummary = async () => {
      try {
        const day = selectedDate[0];

        const data = await fetchData(
          `/api/hold_up/hold_up_branch_summary${buildQuery(day)}`
        );

        setSummary(Array.isArray(data) ? data : data?.result || []);
      } catch (error) {
        console.error("Error fetching hold up branch summary:", error);
        setSummary([]);
      }
    };

    fetchSummary();
  }, [months, selectedDate, years, selectedCities, channels]);

  const readBranchName = (row) =>
    row?.branch || row?.Branch || row?.branchName || row?.BranchName || row?.name || row?.Name || "";

  const readCityName = (row) =>
    row?.city || row?.City || row?.cityName || row?.CityName || "";

  const readGrowthValue = (row, apiKey) => {
    const val = row?.[apiKey];
    if (val == null) return null;
    const num = parseFloat(String(val).replace("%", "").trim());
    return isNaN(num) ? null : num;
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

    return Object.keys(totals)
      .map((b) => ({
        name: b,
        city: cityMap[b],
        value: counts[b] ? totals[b] / counts[b] : 0
      }))
      .sort((a, b) => b.value - a.value);
  };

  const chartData =
    selectedGrowth && summary.length > 0
      ? buildCombinedAverageData(summary).filter((item) =>
          selectedBranches.includes(item.name)
        )
      : [];

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
        months={months}
        setMonths={(selected) =>
          setMonths([selected[selected.length - 1]])
        }
        cityOptions={cityOptions}
        cities={selectedCities}
        setCities={setSelectedCities}
        dateOptions={days}
        dates={selectedDate}
        setDates={(arr) =>
          setSelectedDate([arr[arr.length - 1]])
        }
        yearOptions={yearOtions}
        years={years}
        setYears={setYears}
        channelOptions={channelOptions}   // ✅ added
        channels={channels}               // ✅ added
        setChannels={setChannels}         // ✅ added
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
        <Typography>Select growth</Typography>
      ) : summary.length === 0 ? (
        <Typography>No data</Typography>
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