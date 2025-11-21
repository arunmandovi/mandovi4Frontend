import React, { useState, useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";
import { fetchData } from "../../api/uploadService";
import { useNavigate } from "react-router-dom";
import SlicerFilters from "../../components/SlicerFilters";
import GrowthButtons from "../../components/GrowthButtons";
import GrowthLineChart from "../../components/GrowthLineChart";
import { sortCities } from "../../components/CityOrderHelper";
import CityWiseSummaryTable from "../../components/common/CityWiseSummaryTable ";
import { getSelectedGrowth, setSelectedGrowth } from "../../utils/growthSelection";

// NEW IMPORT
import { buildPivotTable } from "../../utils/buildPivotTable";

function SparesPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState([]);
  const [months, setMonths] = useState([]);
  const [channels, setChannels] = useState([]);
  const [selectedGrowth, setSelectedGrowthState] = useState(null);

  const monthOptions = [
    "Apr", "May", "Jun", "Jul", "Aug", "Sep",
    "Oct", "Nov", "Dec", "Jan", "Feb", "Mar",
  ];

  const channelOptions = ["Arena", "Nexa"];

  const growthOptions = [
    "SR Spares Growth %", "BR Spares Growth %", "SR&BR Spares Growth %", "Battery Growth %", "Tyre Growth %",
  ];

  const growthKeyMap = {
    "SR Spares Growth %": "growthSRSpares",
    "BR Spares Growth %": "growthBRSpares",
    "SR&BR Spares Growth %": "growthSRBRSpares",
    "Battery Growth %": "growthBattery",
    "Tyre Growth %": "growthTyre",
  };

  const valueKeyMap = {
    "SR Spares Growth %": ["previousSRSpares", "currentSRSpares", "growthSRSpares"],
    "BR Spares Growth %": ["previousBRSpares", "currentBRSpares", "growthBRSpares"],
    "SR&BR Spares Growth %": ["previousSRBRSpares", "currentSRBRSpares", "growthSRBRSpares"],
    "Battery Growth %": ["previousBattery", "currentBattery", "growthBattery"],
    "Tyre Growth %": ["previousTyre", "currentTyre", "growthTyre"],
  };

  const beautifyHeader = (key) => {
    if (key.startsWith("previous")) return "2024-25";
    if (key.startsWith("current")) return "2025-26";
    if (key.startsWith("growth")) return "GR %";
    return key;
  };

  useEffect(() => {
    const saved = getSelectedGrowth("spares");
    if (saved) setSelectedGrowthState(saved);
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

  // Fetch summary data
  useEffect(() => {
    const fetchCitySummary = async () => {
      try {
        const activeMonths = months.length ? months : monthOptions;
        const combined = [];

        for (const m of activeMonths) {
          let q = `?&months=${m}`;
          if (channels.length === 1) q += `&channels=${channels[0]}`;

          const data = await fetchData(`/api/spares/spares_summary${q}`);
          const safe = Array.isArray(data) ? data : data?.result || [];

          combined.push({ month: m, data: safe });
        }

        setSummary(combined);
      } catch (err) {
        console.error("summary error:", err);
      }
    };

    fetchCitySummary();
  }, [months, channels]);

  // Build chart data
  const buildChartData = () => {
    if (!selectedGrowth) return { formatted: [], sortedCities: [] };

    const apiKey = growthKeyMap[selectedGrowth];
    const cities = new Set();

    const filteredSummary = summary.filter((s) => s.data && s.data.length > 0);

    filteredSummary.forEach(({ data }) =>
      data.forEach((r) => cities.add(readCityName(r)))
    );

    const sortedCities = sortCities([...cities]);

    const formatted = filteredSummary.map(({ month, data }) => {
      const row = { month };
      sortedCities.forEach((c) => (row[c] = 0));

      data.forEach((r) => {
        const c = readCityName(r);
        row[c] = readGrowthValue(r, apiKey);
      });

      return row;
    });

    return { formatted, sortedCities };
  };

  const { formatted: chartData, sortedCities: cityKeys } = buildChartData();
  const keys = selectedGrowth ? valueKeyMap[selectedGrowth] : [];

  // NEW REUSABLE PIVOT TABLE LOGIC
  const citiesToShow = ["Bangalore", "Mysore", "Mangalore"];
  const { tableData, chartMonths } = buildPivotTable(summary, keys, citiesToShow);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">SPARES GRAPH (CityWise)</Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" color="secondary" onClick={() => navigate("/DashboardHome/spares")}>Graph-CityWise</Button>
          <Button variant="contained" color="secondary" onClick={() => navigate("/DashboardHome/spares-bar-chart")}>Bar Chart-CityWise</Button>
          <Button variant="contained" color="secondary" onClick={() => navigate("/DashboardHome/spares_branches-bar-chart")}>Bar Chart-BranchWise</Button>
        </Box>
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
        setSelectedGrowth={(v) => {
          setSelectedGrowthState(v);
          setSelectedGrowth(v, "spares");
        }}
      />

      {!selectedGrowth ? (
        <Typography>Select a growth type to view the chart</Typography>
      ) : chartData.length === 0 ? (
        <Typography>No data available for the selected criteria.</Typography>
      ) : (
        <>
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

            <GrowthLineChart chartData={chartData} cityKeys={cityKeys} decimalDigits={1} showPercent={true} />
          </Box>

          {/* TABLE USING REUSABLE LOGIC */}
          <CityWiseSummaryTable
            selectedGrowth={selectedGrowth}
            chartMonths={chartMonths}
            keys={keys}
            beautifyHeader={beautifyHeader}
            tableData={tableData}
            decimalDigits={2}
          />
        </>
      )}
    </Box>
  );
}

export default SparesPage;
