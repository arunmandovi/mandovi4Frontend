import React, { useState, useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";
import { fetchData } from "../../api/uploadService";
import { useNavigate, useLocation } from "react-router-dom";
import SlicerFilters from "../../components/SlicerFilters";
import GrowthButtons from "../../components/GrowthButtons";
import CityBarChart from "../../components/CityBarChart";
import { getSelectedGrowth, setSelectedGrowth } from "../../utils/growthSelection";

function HoldUpBarChartPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [summary, setSummary] = useState([]);

  const getCurrentFYMonth = () => {
    const monthMapReverse = {
      0: "Jan", 1: "Feb", 2: "Mar", 3: "Apr", 4: "May", 5: "Jun",
      6: "Jul", 7: "Aug", 8: "Sep", 9: "Oct", 10: "Nov", 11: "Dec",
    };
    return monthMapReverse[new Date().getMonth()] || "Apr";
  };

  const [months, setMonths] = useState(getCurrentFYMonth());
  const [years, setYears] = useState("2026");
  const [channels, setChannels] = useState([]);
  const [days, setDays] = useState([]);
  const [selectedDate, setSelectedDate] = useState([]);
  const [selectedGrowth, setSelectedGrowthState] = useState(null);

  const monthOptions = ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"];
  const yearOptions = ["2025","2026"];
  const channelOptions = ["ARENA", "NEXA"];

  const growthOptions = ["Service", "BodyShop", "PMS", "ServiceBodyShop"];
  const growthKeyMap = {
    Service: "countService",
    BodyShop: "countBodyShop",
    PMS: "countPMS",
    ServiceBodyShop: "countServiceBodyShop"
  };

  useEffect(() => {
    const prev = getSelectedGrowth("hold_up");
    const fromPages = location.state?.fromNavigation === true;

    if (!fromPages) {
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
    if (!months) return;

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

  // ✅ Query builder (with channels)
  const buildQuery = (day) => {
    let query = `?month=${months}&day=${day}`;

    if (years) {
      query += `&years=${years}`;
    }

    if (channels && channels.length > 0) {
      channels.forEach((ch) => {
        query += `&channels=${encodeURIComponent(ch)}`;
      });
    }

    return query;
  };

  // ✅ Auto select latest available date (with channels applied)
  useEffect(() => {
    const autoSelectLastAvailableDate = async () => {
      if (days.length === 0) return;

      let latestDateWithData = null;

      for (let i = days.length - 1; i >= 0; i--) {
        const day = days[i];
        const query = buildQuery(day);

        try {
          const res = await fetchData(`/api/hold_up/hold_up_summary${query}`);
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
  }, [days, years, channels]);

  // ✅ Main data fetch (with channels)
  useEffect(() => {
    if (!months || selectedDate.length === 0) return;

    const fetchCitySummary = async () => {
      try {
        const day = selectedDate[0];
        const query = buildQuery(day);

        const data = await fetchData(`/api/hold_up/hold_up_summary${query}`);
        const safeData = Array.isArray(data) ? data : data?.result || [];

        setSummary(safeData);
      } catch (error) {
        console.error("fetchCitySummary error:", error);
      }
    };

    fetchCitySummary();
  }, [months, selectedDate, years, channels]);

  const readCityName = (row) =>
    row?.city || row?.City || row?.cityName || row?.CityName || row?.name || row?.Name || "";

  const readGrowthValue = (row, apiKey) => {
    const val = row?.[apiKey];
    if (val == null) return 0;
    const parsed = parseFloat(String(val).replace("%", "").trim());
    return isNaN(parsed) ? 0 : parsed;
  };

  const buildCombinedAverageData = (dataArr) => {
    const apiKey = growthKeyMap[selectedGrowth];
    const totals = {};
    const counts = {};

    (dataArr || []).forEach((row) => {
      const city = readCityName(row);
      const parsed = readGrowthValue(row, apiKey);

      if (!isNaN(parsed)) {
        totals[city] = (totals[city] || 0) + parsed;
        counts[city] = (counts[city] || 0) + 1;
      }
    });

    return Object.keys(totals)
      .sort((a, b) => a.localeCompare(b))
      .map((city) => ({
        city,
        value: parseFloat((totals[city] / counts[city]).toFixed(1)),
      }));
  };

  const chartData =
    selectedGrowth && summary.length > 0
      ? buildCombinedAverageData(summary)
      : [];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">HOLD UP REPORT (City-wise)</Typography>

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
        setMonths={(selected) => {
          const last = selected[selected.length - 1];
          setMonths(last ? [last] : []);
        }}
        dateOptions={days}
        dates={selectedDate}
        setDates={(arr) => {
          const last = arr[arr.length - 1];
          setSelectedDate(last ? [last.padStart(2, "0")] : []);
        }}
        yearOptions={yearOptions}
        years={years}
        setYears={setYears}
        channelOptions={channelOptions}     // ✅ added
        channels={channels}                 // ✅ added
        setChannels={setChannels}           // ✅ added
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
        <Typography>Select a growth type</Typography>
      ) : summary.length === 0 ? (
        <Typography>No data available</Typography>
      ) : (
        <CityBarChart
          chartData={chartData}
          selectedGrowth={selectedGrowth}
          decimalPlaces={0}
          showPercent={false}
        />
      )}
    </Box>
  );
}

export default HoldUpBarChartPage;