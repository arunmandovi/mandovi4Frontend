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

function MSGPPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState([]);
  const [months, setMonths] = useState([]);
  const [selectedGrowth, setSelectedGrowthState] = useState("SR&BR Growth %");

  const monthOptions = [
    "Apr", "May", "Jun", "Jul", "Aug", "Sep",
    "Oct", "Nov", "Dec", "Jan", "Feb", "Mar",
  ];

  const growthOptions = [
    "SR&BR Growth %",
    "Service Growth %",
    "BodyShop Growth %",
    "Free Service Growth %",
    "PMS Growth %",
    "RR Growth %",
    "Others Growth %",
  ];

  const growthKeyMap = {
    "SR&BR Growth %": "growthSRBS",
    "Service Growth %": "growthService",
    "BodyShop Growth %": "growthBodyShop",
    "Free Service Growth %": "growthFreeService",
    "PMS Growth %": "growthPMS",
    "RR Growth %": "growthRR",
    "Others Growth %": "growthOthers",
  };

  const valueKeyMap = {
    "SR&BR Growth %": ["previousSRBS", "currentSRBS", "growthSRBS"],
    "Service Growth %": ["previousService", "currentService", "growthService"],
    "BodyShop Growth %": ["previousBodyShop", "currentBodyShop", "growthBodyShop"],
    "Free Service Growth %": ["previousFreeService", "currentFreeService", "growthFreeService"],
    "PMS Growth %": ["previousPMS", "currentPMS", "growthPMS"],
    "RR Growth %": ["previousRR", "currentRR", "growthRR"],
    "Others Growth %": ["previousOthers", "currentOthers", "growthOthers"],
  };

  const beautifyHeader = (key) => {
    if (key.startsWith("previous")) return "LY";
    if (key.startsWith("current")) return "TY";
    if (key.startsWith("growth")) return "GR %";
    return key;
  };

  useEffect(() => {
    const saved = getSelectedGrowth("msgp");
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

          const data = await fetchData(`/api/msgp/msgp_summary${q}`);
          const safe = Array.isArray(data) ? data : data?.result || [];

          combined.push({ month: m, data: safe });
        }

        setSummary(combined);
      } catch (err) {
        console.error("summary error:", err);
      }
    };

    fetchCitySummary();
  }, [months]);

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
  const citiesToShow = ["BANGALORE", "MYSORE", "MANGALORE"];
  const { tableData, chartMonths } = buildPivotTable(summary, keys, citiesToShow);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">MSGP GRAPH (CityWise)</Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/msgp")}>Graph-CityWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/msgp_branches")}>Graph-BranchWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/msgp-bar-chart")}>Bar Chart-CityWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/msgp_branches-bar-chart")}>Bar Chart-BranchWise</Button>
        </Box>
      </Box>

      <SlicerFilters
        monthOptions={monthOptions}
        months={months}
        setMonths={setMonths}
      />

      <GrowthButtons
        growthOptions={growthOptions}
        selectedGrowth={selectedGrowth}
        setSelectedGrowth={(v) => {
          setSelectedGrowthState(v);
          setSelectedGrowth(v, "msgp");
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
              height: 400,
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

export default MSGPPage;
