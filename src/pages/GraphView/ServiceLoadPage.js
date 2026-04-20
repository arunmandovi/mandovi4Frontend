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
import { buildPivotTable } from "../../utils/buildPivotTable";

function ServiceLoadPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState([]);
  const [months, setMonths] = useState([]);
  const [channels, setChannels] = useState([]);
  const [financialYears, setFinancialYears] = useState([]);
  const [selectedGrowth, setSelectedGrowthState] = useState("Service Load");

  const monthOptions = [
    "Apr", "May", "Jun", "Jul", "Aug", "Sep",
    "Oct", "Nov", "Dec", "Jan", "Feb", "Mar",
  ];

  const channelOptions = ["ARENA", "NEXA"];
  const financialYearOptions = ["2024-2025", "2025-2026"];

  const growthOptions = ["Service Load"];

  const growthKeyMap = {
    "Service Load": "serviceLoad",
  };

  const valueKeyMap = {
    "Service Load": ["serviceLoad"],
  };

  const beautifyHeader = (key) => {
    if (key.startsWith("previous")) return "LY";
    if (key.startsWith("current")) return "TY";
    if (key.startsWith("growth")) return "GR %";
    return key;
  };

  useEffect(() => {
    const saved = getSelectedGrowth("service_load");
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
          let q = `?months=${encodeURIComponent(m)}`;

          // channels: support 0, 1 or many (Spring will bind repeated params to List)
          if (channels.length > 0) {
            channels.forEach((ch) => {
              q += `&channels=${encodeURIComponent(ch)}`;
            });
          }

          // financialYears: support 0, 1 or many
          if (financialYears.length > 0) {
            financialYears.forEach((fy) => {
              q += `&financialYears=${encodeURIComponent(fy)}`;
            });
          }

          const data = await fetchData(`/api/service_load/service_load_summary${q}`);
          const safe = Array.isArray(data) ? data : data?.result || [];

          combined.push({ month: m, data: safe });
        }

        setSummary(combined);
      } catch (err) {
        console.error("summary error:", err);
      }
    };

    fetchCitySummary();
  }, [months, channels, financialYears]);

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

  const citiesToShow = ["Bangalore", "Mysore", "Mangalore"];

  const pivotResult = buildPivotTable(summary, keys, citiesToShow);
  const tableData = pivotResult?.tableData || [];
  const chartMonths = pivotResult?.chartMonths || [];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">SERVICE LOAD GRAPH (CityWise)</Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate("/DashboardHome/service_load")}
          >
            Graph-CityWise
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate("/DashboardHome/service_load_branches")}
          >
            Graph-BranchWise
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() =>
              navigate("/DashboardHome/service_load-bar-chart")
            }
          >
            Bar Chart-CityWise
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() =>
              navigate("/DashboardHome/service_load_branches-bar-chart")
            }
          >
            Bar Chart-BranchWise
          </Button>
        </Box>
      </Box>

      <SlicerFilters
        monthOptions={monthOptions}
        months={months}
        setMonths={setMonths}
        channelOptions={channelOptions}
        channels={channels}
        setChannels={setChannels}
        financialYearOptions={financialYearOptions}
        financialYears={financialYears}
        setFinancialYears={setFinancialYears}
      />

      <GrowthButtons
        growthOptions={growthOptions}
        selectedGrowth={selectedGrowth}
        setSelectedGrowth={(v) => {
          setSelectedGrowthState(v);
          setSelectedGrowth(v, "service_load");
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

            <GrowthLineChart
              chartData={chartData}
              cityKeys={cityKeys}
              decimalDigits={0}
              showPercent={false}
            />
          </Box>

          {tableData && tableData.length > 0 ? (
            <CityWiseSummaryTable
              selectedGrowth={selectedGrowth}
              chartMonths={chartMonths}
              keys={keys}
              beautifyHeader={beautifyHeader}
              tableData={tableData}
            />
          ) : (
            <Box
              sx={{
                mt: 2,
                p: 2,
                background: "#fff",
                borderRadius: 2,
                boxShadow: 1,
              }}
            >
              <Typography>
                No table data available for the selected criteria.
              </Typography>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}

export default ServiceLoadPage;