import React, { useState, useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";
import { fetchData } from "../../api/uploadService";
import { useNavigate, useLocation } from "react-router-dom";
import SlicerFilters from "../../components/SlicerFilters";
import GrowthButtons from "../../components/GrowthButtons";
import CityBarChart from "../../components/CityBarChart";
import { getSelectedGrowth, setSelectedGrowth } from "../../utils/growthSelection";

function PMSPartsBarChartPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [summary, setSummary] = useState([]);
  const [months, setMonths] = useState([]);
  const [qtrWise, setQtrWise] = useState([]);
  const [halfYear, setHalfYear] = useState([]);
  const [selectedGrowth, setSelectedGrowthState] = useState(null);

  const monthOptions = ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"];
  const qtrWiseOptions = ["Qtr1", "Qtr2", "Qtr3", "Qtr4"];
  const halfYearOptions = ["H1", "H2"];

  const growthOptions = [
    "Air filter %",
    "Belt water pump %",
    "Brake fluid %",
    "Coolant %",
    "Fuel Filter %",
    "Oil filter %",
    "Spark plug %",
    "7 PARTS PMS %",
    "DRAIN PLUG GASKET %",
    "ISG BELT GENERATOR %",
    "CNG FILTER %",
    "3 PARTS PMS %",
    "Grand Total %",
  ];

  const growthKeyMap = {
    "Air filter %": "airFilter",
    "Belt water pump %": "beltWaterPump",
    "Brake fluid %": "brakeFluid",
    "Coolant %": "coolant",
    "Fuel Filter %": "fuelFilter",
    "Oil filter %": "oilFilter",
    "Spark plug %": "sparkPlug",
    "7 PARTS PMS %": "sevenPartsPMS",
    "DRAIN PLUG GASKET %": "drainPlugGasket",
    "ISG BELT GENERATOR %": "isgBeltGenerator",
    "CNG FILTER %": "cngFilter",
    "3 PARTS PMS %": "threePartsPMS",
    "Grand Total %": "grandTotal",
  };

  useEffect(() => {
    const prev = getSelectedGrowth("pms_parts");

    const fromPages = location.state?.fromNavigation === true;

    if (!fromPages) {
      if (!prev) {
        setSelectedGrowthState("7 PARTS PMS %");
        setSelectedGrowth("7 PARTS PMS %", "pms_parts");
      } else {
        setSelectedGrowthState(prev);
      }
    } else {
      setSelectedGrowthState(prev || "7 PARTS PMS %");
    }
  }, []);

  useEffect(() => {
    const fetchCitySummary = async () => {
      try {
        const params = new URLSearchParams();
        if (months.length) params.append("months", months.join(","));
        if (qtrWise.length) params.append("qtrWise", qtrWise.join(","));
        if (halfYear.length) params.append("halfYear", halfYear.join(","));
        const query = params.toString() ? `?${params.toString()}` : "";
        const data = await fetchData(`/api/pms_parts/pms_parts_summary${query}`);
        setSummary(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("fetchCitySummary error:", err);
      }
    };
    fetchCitySummary();
  }, [months, qtrWise, halfYear]);

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

    const preferredOrder = ["Bangalore", "Mysore", "Mangalore"];
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
        <Typography variant="h4">PMS PARTS REPORT (City-wise)</Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained" onClick={() => navigate("/DashboardHome/pms_parts", {
                state: { fromNavigation: true },
              })
            }
          >
            Graph-CityWise
          </Button>

          <Button
            variant="contained" onClick={() => navigate("/DashboardHome/pms_parts_branches", {
                state: { fromNavigation: true },
              })
            }
          >
            Graph-BranchWise
          </Button>

          <Button
            variant="contained" onClick={() => navigate("/DashboardHome/pms_parts-bar-chart", {
                state: { fromNavigation: true },
              })
            }
          >
            Bar Chart-CityWise
          </Button>

          <Button
            variant="contained" onClick={() => navigate("/DashboardHome/pms_parts_branches-bar-chart", {
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
        setMonths={setMonths}
        qtrWiseOptions={qtrWiseOptions}
        qtrWise={qtrWise}
        setQtrWise={setQtrWise}
        halfYearOptions={halfYearOptions}
        halfYear={halfYear}
        setHalfYear={setHalfYear}
      />

      <GrowthButtons
        growthOptions={growthOptions}
        selectedGrowth={selectedGrowth}
        setSelectedGrowth={(value) => {
          setSelectedGrowthState(value);
          setSelectedGrowth(value, "pms_parts");
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
          decimalPlaces={2}
        />
      )}
    </Box>
  );
}

export default PMSPartsBarChartPage;
