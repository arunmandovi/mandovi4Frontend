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

function MSGPProfitPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState([]);
  const [months, setMonths] = useState([]);
  const [selectedGrowth, setSelectedGrowthState] = useState("Service&BodyShop Profit %");

  const monthOptions = [
    "Apr", "May", "Jun", "Jul", "Aug", "Sep",
    "Oct", "Nov", "Dec", "Jan", "Feb", "Mar",
  ];

  const growthOptions = [
    "Service&BodyShop Profit %",
    "Service Profit %",
    "BodyShop Profit %",
  ];

  const growthKeyMap = {
    "Service&BodyShop Profit %": "percentageProfitServiceBodyShop",
    "Service Profit %": "percentageProfitService",
    "BodyShop Profit %": "percentageProfitBodyShop",
  };

  const valueKeyMap = {
    "Service&BodyShop Profit %": ["netRetailDDLServiceBodyShop", "profitServiceBodyShop", "percentageProfitServiceBodyShop"],
    "Service Profit %": ["netRetailDDLService", "profitService", "percentageProfitService"],
    "BodyShop Profit %": ["netRetailDDLBodyShop", "profitBodyShop", "percentageProfitBodyShop"],
  };

  const beautifyHeader = (key) => {
    if (key.startsWith("netRetailDDL")) return "DDL";
    if (key.startsWith("profit")) return "Profit";
    if (key.startsWith("percentageProfit")) return "Profit %";
    return key;
  };

  useEffect(() => {
    const saved = getSelectedGrowth("msgp_profit");
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

  useEffect(() => {
    const fetchCitySummary = async () => {
      try {
        const activeMonths = months.length ? months : monthOptions;
        const combined = [];

        for (const m of activeMonths) {
          let q = `?&months=${m}`;

          const data = await fetchData(`/api/msgp_profit/msgp_profit_summary${q}`);
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
  const { tableData, chartMonths } = buildPivotTable(summary, keys, citiesToShow);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">MSGP PROFIT GRAPH (CityWise)</Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/msgp_profit")}>Graph-CityWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/msgp_profit_branches")}>Graph-BranchWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/msgp_profit-bar-chart")}>Bar Chart-CityWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/msgp_profit_branches-bar-chart")}>Bar Chart-BranchWise</Button>
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
          setSelectedGrowth(v, "msgp_profit");
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
          
            decimalDigits={0}
            percentageDecimalDigits={
              selectedGrowth.includes("%") ? 1 : 0   
            }
            growthDecimalDigits={1}
          />
        </>
      )}
    </Box>
  );
}

export default MSGPProfitPage;
