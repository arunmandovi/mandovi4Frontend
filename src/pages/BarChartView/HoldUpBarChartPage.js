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
      0: "Jan", 1: "Feb", 2: "Mar", 3: "Apr", 4: "May", 5: "Jun", 6: "Jul", 7: "Aug", 8: "Sep", 9: "Oct", 10: "Nov", 11: "Dec",
    };
    const today = new Date();
    const jsMonth = today.getMonth();
    return monthMapReverse[jsMonth] || "Apr";
  };

  const [months, setMonths] = useState(getCurrentFYMonth());
  const [days, setDays] = useState([]);
  const [selectedDate, setSelectedDate] = useState([]);

  const [selectedGrowth, setSelectedGrowthState] = useState(null);

  const monthOptions = [
    "Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"
  ];

  const growthOptions = ["Service", "BodyShop", "PMS", "ServiceBodyShop"];

  const growthKeyMap = {
    Service: "countService",
    BodyShop: "countBodyShop",
    PMS: "countPMS",
    ServiceBodyShop: "countServiceBodyShop"
  };

  // Load previous selected growth
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

  // Generate all days in selected month
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

  // ⭐ AUTO-SELECT LAST AVAILABLE DATE WITH DATA
  useEffect(() => {
    const autoSelectLastAvailableDate = async () => {
      if (days.length === 0) return;

      let latestDateWithData = null;

      // CHECK EACH DATE'S DATA
      for (let i = days.length - 1; i >= 0; i--) {
        const day = days[i];
        const query = `?month=${months}&day=${day}`;

        try {
          const res = await fetchData(`/api/hold_up/hold_up_summary${query}`);
          const safe = Array.isArray(res) ? res : res?.result || [];

          if (safe.length > 0) {
            latestDateWithData = day;
            break; // STOP when first (latest) valid day is found
          }
        } catch (err) {
          console.error("Error checking date:", day, err);
        }
      }

      // If found → auto select
      if (latestDateWithData) {
        setSelectedDate([latestDateWithData]);
      } else {
        // fallback to last day of month
        setSelectedDate([days[days.length - 1]]);
      }
    };

    autoSelectLastAvailableDate();
  }, [days]);

  // Fetch summary for selected day
  useEffect(() => {
    if (!months || selectedDate.length === 0) return;

    const fetchCitySummary = async () => {
      try {
        const day = selectedDate[0];
        const query = `?month=${months}&day=${day}`;

        const data = await fetchData(`/api/hold_up/hold_up_summary${query}`);
        const safeData = Array.isArray(data) ? data : data?.result || [];

        setSummary(safeData);
      } catch (error) {
        console.error("fetchCitySummary error:", error);
      }
    };

    fetchCitySummary();
  }, [months, selectedDate]);

  const readCityName = (row) =>
    row?.city || row?.City || row?.cityName || row?.CityName || row?.name || row?.Name || "";

  const readGrowthValue = (row, apiKey) => {
    const candidates = [
      apiKey, apiKey?.toLowerCase(), apiKey?.toUpperCase(),
      apiKey?.replace(/([A-Z])/g, "_$1").toLowerCase(),
      "value", "growth", "val",
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

    (dataArr || []).forEach((row) => {
      const city = readCityName(row);
      const val = readGrowthValue(row, apiKey);
      const parsed = parseFloat(String(val).replace("%", "").trim());

      if (!isNaN(parsed)) {
        totals[city] = (totals[city] || 0) + parsed;
        counts[city] = (counts[city] || 0) + 1;
      }
    });

    const preferredOrder = ["BANGALORE", "MYSORE", "MANGALORE"];
    const allCities = Object.keys(totals);

    const sortedCities = [
      ...preferredOrder.filter((c) =>
        allCities.some((x) => x.toLowerCase() === c.toLowerCase())
      ),
      ...allCities
        .filter(
          (c) => !preferredOrder.some((p) => p.toLowerCase() === c.toLowerCase())
        )
        .sort((a, b) => a.localeCompare(b)),
    ];

    return sortedCities.map((city) => ({
      city,
      value: parseFloat(((totals[city] || 0) / (counts[city] || 1)).toFixed(1)),
    }));
  };

  const chartData =
    selectedGrowth && summary.length > 0 ? buildCombinedAverageData(summary) : [];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">HOLD UP REPORT (City-wise)</Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            onClick={() =>
              navigate("/DashboardHome/hold_up_table", {
                state: { fromNavigation: true },
              })
            }
          >
            Hold Up Summary
          </Button>

          <Button
            variant="contained"
            onClick={() =>
              navigate("/DashboardHome/hold_up", {
                state: { fromNavigation: true },
              })
            }
          >
            Graph-CityWise
          </Button>

          <Button
            variant="contained"
            onClick={() =>
              navigate("/DashboardHome/hold_up_branches", {
                state: { fromNavigation: true },
              })
            }
          >
            Graph-BranchWise
          </Button>

          <Button
            variant="contained"
            onClick={() =>
              navigate("/DashboardHome/hold_up-bar-chart", {
                state: { fromNavigation: true },
              })
            }
          >
            Bar Chart-CityWise
          </Button>

          <Button
            variant="contained"
            onClick={() =>
              navigate("/DashboardHome/hold_up_branches-bar-chart", {
                state: { fromNavigation: true },
              })
            }
          >
            Bar Chart-BranchWise
          </Button>
        </Box>
      </Box>

      <SlicerFilters
        monthOptions={monthOptions}
        months={months}
        setMonths={(selected) => {
          const lastSelected = selected[selected.length - 1];
          setMonths(lastSelected ? [lastSelected] : []);
        }}
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
        <Typography>👆 Select a growth type to view the chart below</Typography>
      ) : summary.length === 0 ? (
        <Typography>No data available for the selected criteria.</Typography>
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
