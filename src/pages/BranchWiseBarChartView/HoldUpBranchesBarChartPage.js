import React, { useState, useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";
import { fetchData } from "../../api/uploadService";
import { useNavigate, useLocation } from "react-router-dom";
import SlicerFilters from "../../components/SlicerFilters";
import GrowthButtons from "../../components/GrowthButtons";
import BranchBarChart from "../../components/BranchBarChart";
import { getSelectedGrowth, setSelectedGrowth } from "../../utils/growthSelection";

function HoldUpBranchesBarChartPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCities, setSelectedCities] = useState([]);
  const [summary, setSummary] = useState([]);
  const [months, setMonths] = useState(["Nov"]);
  const [days, setDays] = useState([]);

  const [selectedDate, setSelectedDate] = useState([]);
  const [selectedGrowth, setSelectedGrowthState] = useState(null);

  const monthOptions = ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"];
  const cityOptions = ["BANGALORE", "MYSORE", "MANGALORE"];
  const growthOptions = ["Service", "BodyShop", "PMS", "ServiceBodyShop"];

  const growthKeyMap = {
    Service: "countService",
    BodyShop: "countBodyShop",
    PMS: "countPMS",
    ServiceBodyShop: "countServiceBodyShop"
  };

  // Set default growth on mount
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

    const validDays = Array.from({ length: daysInMonth }, (_, i) => String(i + 1).padStart(2, "0"));
    setDays(validDays);
  }, [months]);

  useEffect(() => {
    if (days.length > 0 && selectedDate.length === 0) {
      setSelectedDate([days[days.length - 1]]);
    }
  }, [days]);

  useEffect(() => {
  if (!months || selectedDate.length === 0) return;

  const fetchSummary = async () => {
    try {
      const month = Array.isArray(months) ? months[0] : months;
      const day = selectedDate[0];
      const cityQuery = selectedCities.length > 0 ? `&cities=${selectedCities.join(",")}` : "";
      const query = `?month=${month}&day=${day}${cityQuery}`;

      const data = await fetchData(`/api/hold_up/hold_up_branch_summary${query}`);
      setSummary(Array.isArray(data) ? data : data?.result || []);
    } catch (error) {
      console.error("Error fetching hold up branch summary:", error);
      setSummary([]);
    }
  };

  fetchSummary();
}, [months, selectedDate, selectedCities]);

  const readBranchName = (row) => row?.branch || row?.Branch || row?.branchName || row?.BranchName || row?.name || row?.Name || "";
  const readCityName = (row) => row?.city || row?.City || row?.cityName || row?.CityName || "";

  const readGrowthValue = (row, apiKey) => {
    if (!apiKey) return null;
    const val = row?.[apiKey];
    if (val === null || val === undefined || val === "") return null;
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

  const chartData = selectedGrowth && summary.length > 0 ? buildCombinedAverageData(summary) : [];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">HOLD UP REPORT (Branch-wise)</Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/hold_up", { state: { fromNavigation: true } })}>Graph-CityWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/hold_up_branches", { state: { fromNavigation: true } })}>Graph-BranchWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/hold_up-bar-chart", { state: { fromNavigation: true } })}>Bar Chart-CityWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/hold_up_branches-bar-chart", { state: { fromNavigation: true } })}>Bar Chart-BranchWise</Button>
        </Box>
      </Box>

      <SlicerFilters
        monthOptions={monthOptions} months={months} setMonths={(selected) => {
          const lastSelected = selected[selected.length - 1];
          setMonths(lastSelected ? [lastSelected] : []);
        }}
        cityOptions={cityOptions} cities={selectedCities} setCities={setSelectedCities}
        dateOptions={days} dates={selectedDate} setDates={(arr) => {
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
        <Typography sx={{ mt: 2 }}>👆 Select a growth type to view the chart below</Typography>
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
