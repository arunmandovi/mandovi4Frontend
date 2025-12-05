import React, { useState, useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";
import { fetchData } from "../../api/uploadService";
import { useNavigate } from "react-router-dom";
import SlicerFilters from "../../components/SlicerFilters";
import GrowthButtons from "../../components/GrowthButtons";
import GrowthLineChart from "../../components/GrowthLineChart";
import { sortCities } from "../../components/CityOrderHelper";
import { getSelectedGrowth, setSelectedGrowth } from "../../utils/growthSelection";

function HoldUpPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState([]);
  const [days, setDays] = useState([]);
  const [selectedGrowth, setSelectedGrowthState] = useState("ServiceBodyShop");

  const monthOptions = [
    "Apr", "May", "Jun", "Jul", "Aug", "Sep",
    "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"
  ];

  const [months, setMonths] = useState("Dec");

  const allDayOptions = Array.from({ length: 31 }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );

  const growthOptions = ["Service", "BodyShop", "PMS", "ServiceBodyShop"];
  const growthKeyMap = {
    Service: "countService",
    BodyShop: "countBodyShop",
    PMS: "countPMS",
    ServiceBodyShop: "countServiceBodyShop",
  };

  useEffect(() => {
    const savedGrowth = getSelectedGrowth("hold_up");
    if (savedGrowth) setSelectedGrowthState(savedGrowth);
  }, []);

  const readCityName = (row) =>
    row?.city || row?.City || row?.cityName || row?.CityName || row?.name || row?.Name || "";

  const readGrowthValue = (row, apiKey) => {
    const raw = row?.[apiKey];
    if (raw == null) return 0;
    const cleaned = String(raw).replace("%", "").trim();
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  useEffect(() => {
    if (!months) return;

    const fetchCitySummary = async () => {
      try {
        const combined = [];
        const detectedDays = new Set();

        for (const d of allDayOptions) {
          const query = `?month=${months}&day=${d}`;
          const data = await fetchData(`/api/hold_up/hold_up_summary${query}`);
          const safeData = Array.isArray(data) ? data : data?.result || [];

          if (safeData.length > 0) {
            detectedDays.add(d);
            combined.push({ month: `${months}-${d}`, data: safeData });
          }
        }

        setDays([...detectedDays]);
        setSummary(combined);

      } catch (error) {
        console.error("fetchCitySummary error:", error);
      }
    };

    fetchCitySummary();
  }, [months]);

  const buildChartData = () => {
    if (!selectedGrowth) return { formatted: [], sortedCities: [] };

    const apiKey = growthKeyMap[selectedGrowth];
    const cities = new Set();

    summary.forEach(({ data }) =>
      data?.forEach((r) => cities.add(readCityName(r)))
    );

    const sortedCities = sortCities([...cities]);

    const filteredSummary = summary.filter(({ month }) => {
      const day = month.split("-")[1];
      return days.includes(day);
    });

    const formatted = filteredSummary.map(({ month, data }) => {
      const entry = { month };
      sortedCities.forEach((city) => (entry[city] = 0));
      data.forEach((row) => {
        const city = readCityName(row);
        entry[city] = readGrowthValue(row, apiKey);
      });
      return entry;
    });

    return { formatted, sortedCities };
  };

  const { formatted: chartData, sortedCities: cityKeys } = buildChartData();

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">HOLD UP GRAPH (CityWise)</Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/hold_up_table")}>Hold Up Summary</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/hold_up")}>Graph-CityWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/hold_up_branches")}>Graph-BranchWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/hold_up-bar-chart")}>Bar Chart-CityWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/hold_up_branches-bar-chart")}>Bar Chart-BranchWise</Button>
        </Box>
      </Box>

      <SlicerFilters
        monthOptions={monthOptions}
        months={[months]}
        setMonths={(value) => {
          const selected = value[value.length - 1];
          setMonths(selected);
        }}
        dateOptions={[]} 
        dates={[]}       
        setDates={() => {}} 
        singleMonthSelect={true}
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
        <Typography>Select a growth type to view the chart</Typography>
      ) : chartData.length === 0 ? (
        <Typography>No data available for the selected criteria.</Typography>
      ) : (
        <Box sx={{ mt: 2, height: 520, background: "#fff", borderRadius: 2, boxShadow: 3, p: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>{selectedGrowth}</Typography>
          <GrowthLineChart chartData={chartData} cityKeys={cityKeys} decimalDigits={0} showPercent={false} />
        </Box>
      )}
    </Box>
  );
}

export default HoldUpPage;
