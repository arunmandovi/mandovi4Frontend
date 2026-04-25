import React, { useState, useEffect, useMemo } from "react";
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

function LoaddPage() {
  const navigate = useNavigate();

  const [summary, setSummary] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [months, setMonths] = useState([]);
  const [channels, setChannels] = useState([]);
  const [qtrWise, setQtrWise] = useState([]);
  const [halfYear, setHalfYear] = useState([]);
  const [financialYears, setFinancialYears] = useState(["2026-2027"]);
  const [selectedGrowth, setSelectedGrowthState] = useState("PMS Growth %");

  const monthOptions = [
    "Apr", "May", "Jun", "Jul", "Aug", "Sep",
    "Oct", "Nov", "Dec", "Jan", "Feb", "Mar",
  ];

  const channelOptions = ["Arena", "Nexa"];
  const financialYearOptions = ["2025-2026", "2026-2027"];

  const growthOptions = [
    "Service Growth %",
    "BodyShop Growth %",
    "Free Service Growth %",
    "PMS Growth %",
    "FPR Growth %",
    "RR Growth %",
    "Others Growth %",
    "BS on FPR 2024-25 %",
    "BS on FPR 2025-26 %",
  ];

  const growthKeyMap = {
    "Service Growth %": "growthService",
    "BodyShop Growth %": "growthBodyShop",
    "Free Service Growth %": "growthFreeService",
    "PMS Growth %": "growthPMS",
    "FPR Growth %": "growthFPR",
    "RR Growth %": "growthRR",
    "Others Growth %": "growthOthers",
    "BS on FPR 2024-25 %": "previousBSFPR",
    "BS on FPR 2025-26 %": "currentBSFPR",
  };

  const valueKeyMap = {
    "Service Growth %": ["previousService", "currentService", "growthService"],
    "BodyShop Growth %": ["previousBodyShop", "currentBodyShop", "growthBodyShop"],
    "Free Service Growth %": ["previousFreeService", "currentFreeService", "growthFreeService"],
    "PMS Growth %": ["previousPMS", "currentPMS", "growthPMS"],
    "FPR Growth %": ["previousFPR", "currentFPR", "growthFPR"],
    "RR Growth %": ["previousRR", "currentRR", "growthRR"],
    "Others Growth %": ["previousOthers", "currentOthers", "growthOthers"],
    "BS on FPR 2024-25 %": ["previousBSFPR"],
    "BS on FPR 2025-26 %": ["currentBSFPR"],
  };

  const beautifyHeader = (key) => {
    if (key.startsWith("previous")) return "LY";
    if (key.startsWith("current")) return "TY";
    if (key.startsWith("growth")) return "GR %";
    return key;
  };

  useEffect(() => {
    const saved = getSelectedGrowth("loadd");
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

  // ✅ FETCH DATA WITH FINANCIAL YEAR FILTER
  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        const activeMonths = months.length ? months : monthOptions;
        const activeFinancialYear = financialYears[0] || "2025-2026";

        const combined = [];

        for (const month of activeMonths) {
          let queryParams = new URLSearchParams();
          queryParams.append("months", month);
          queryParams.append("selectedFinancialYear", activeFinancialYear);

          if (channels.length) channels.forEach(c => queryParams.append("channels", c));
          if (qtrWise.length) qtrWise.forEach(q => queryParams.append("qtrWise", q));
          if (halfYear.length) halfYear.forEach(h => queryParams.append("halfYear", h));

          const data = await fetchData(`/api/loadd/loadd_summary?${queryParams.toString()}`);
          const safe = Array.isArray(data) ? data : data?.result || [];

          combined.push({ month, data: safe });
        }

        setMonthlySummary(combined);

        // overall summary (optional)
        let overallParams = new URLSearchParams();
        overallParams.append("selectedFinancialYear", activeFinancialYear);

        const overallData = await fetchData(`/api/loadd/loadd_summary?${overallParams.toString()}`);
        const overallSafe = Array.isArray(overallData) ? overallData : overallData?.result || [];

        setSummary(overallSafe);

      } catch (err) {
        console.error("summary error:", err);
        setMonthlySummary([]);
        setSummary([]);
      }
    };

    fetchMonthlyData();
  }, [months, channels, qtrWise, halfYear, financialYears]);

  // ✅ CHART DATA
  const buildChartData = useMemo(() => {
    if (!selectedGrowth || monthlySummary.length === 0) return { formatted: [], sortedCities: [] };

    const apiKey = growthKeyMap[selectedGrowth];
    const cities = new Set();

    monthlySummary.forEach(({ data }) => {
      data.forEach((r) => cities.add(readCityName(r)));
    });

    const sortedCities = sortCities([...cities]);

    const formatted = monthlySummary.map(({ month, data }) => {
      const row = { month };
      sortedCities.forEach((c) => (row[c] = 0));

      data.forEach((r) => {
        const c = readCityName(r);
        row[c] = readGrowthValue(r, apiKey);
      });

      return row;
    });

    return { formatted, sortedCities };
  }, [selectedGrowth, monthlySummary, financialYears]);

  const { formatted: chartData, sortedCities: cityKeys } = buildChartData;
  const keys = selectedGrowth ? valueKeyMap[selectedGrowth] : [];

  // ✅ REUSABLE PIVOT TABLE (CLEAN)
  const citiesToShow = sortCities(
    [...new Set(summary.map((r) => readCityName(r)))]
  ).slice(0, 10);

  const { tableData, chartMonths } = buildPivotTable(
    monthlySummary,
    keys,
    citiesToShow
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">LOAD REPORT (Branch-wise)</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/loadd")}>Graph-CityWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/loadd_branches")}>Graph-BranchWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/loadd-bar-chart")}>Bar Chart-CityWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/loadd_branches-bar-chart")}>Bar Chart-BranchWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/loadd-negative-table")}>Table</Button>
        </Box>
      </Box>

      <SlicerFilters
        monthOptions={monthOptions}
        months={months}
        setMonths={setMonths}
        channelOptions={channelOptions}
        channels={channels}
        setChannels={setChannels}
        qtrWiseOptions={["Qtr1", "Qtr2", "Qtr3", "Qtr4"]}
        qtrWise={qtrWise}
        setQtrWise={setQtrWise}
        halfYearOptions={["H1", "H2"]}
        halfYear={halfYear}
        setHalfYear={setHalfYear}
        financialYearOptions={financialYearOptions}
        financialYears={financialYears}
        setFinancialYears={setFinancialYears}
      />

      <GrowthButtons
        growthOptions={growthOptions}
        selectedGrowth={selectedGrowth}
        setSelectedGrowth={(v) => {
          setSelectedGrowthState(v);
          setSelectedGrowth(v, "loadd");
        }}
      />

      {!selectedGrowth ? (
        <Typography>Select a growth type</Typography>
      ) : chartData.length === 0 ? (
        <Typography>No data available</Typography>
      ) : (
        <>
          <Box sx={{ mt: 2, height: 400, background: "#fff", p: 2 }}>
            <Typography variant="h6">{selectedGrowth}</Typography>

            <GrowthLineChart
              chartData={chartData}
              cityKeys={cityKeys}
              decimalDigits={1}
              showPercent={true}
            />
          </Box>

          <Box sx={{ mt: 2 }}>
            <CityWiseSummaryTable
              selectedGrowth={selectedGrowth}
              chartMonths={chartMonths}
              keys={keys}
              beautifyHeader={beautifyHeader}
              tableData={tableData}
              decimalDigits={0}
            />
          </Box>
        </>
      )}
    </Box>
  );
}

export default LoaddPage;