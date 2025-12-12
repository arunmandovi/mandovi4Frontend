import React, { useState, useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";
import { fetchData } from "../../api/uploadService";
import { useNavigate, useLocation } from "react-router-dom";
import SlicerFilters from "../../components/SlicerFilters";
import GrowthButtons from "../../components/GrowthButtons";
import CityBarChart from "../../components/CityBarChart";
import { getSelectedGrowth, setSelectedGrowth } from "../../utils/growthSelection";

function ProductivityBarChartPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [summary, setSummary] = useState([]);
  const [months, setMonths] = useState(["Dec"]);
  const [years, setYears] = useState(["2025"]);
  const [selectedGrowth, setSelectedGrowthState] = useState(null);

  const monthOptions = ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"];
  const yearOptions = ["2024", "2025"];

  const growthOptions = [
    "Service", "BodyShop","Free Service", "PMS", "RR", "Others",
  ];

  const growthKeyMap = {
    "Service": "serviceProductivity",
    "BodyShop": "bodyShopProductivity",
    "Free Service": "freeServiceProductivity",
    "PMS": "pmsProductivity",
    "RR": "rrProductivity",
    "Others": "othersProductivity",
  };

  useEffect(() => {
    const prev = getSelectedGrowth("productivity");

    const fromPages = location.state?.fromNavigation === true;

    if (!fromPages) {
      if (!prev) {
        setSelectedGrowthState("Service");
        setSelectedGrowth("Service", "productivity");
      } else {
        setSelectedGrowthState(prev);
      }
    } else {
      setSelectedGrowthState(prev || "Service");
    }
  }, []);

  useEffect(() => {
    const fetchCitySummary = async () => {
      try {
        const params = new URLSearchParams();
        if (months.length) params.append("months", months.join(","));
        if (years.length) params.append("years", years.join(","));
        const query = params.toString() ? `?${params.toString()}` : "";
        const data = await fetchData(`/api/productivity/productivity_summary${query}`);
        setSummary(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("fetchCitySummary error:", err);
      }
    };
    fetchCitySummary();
  }, [months, years]);

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
      value: parseFloat(((totals[city] || 0) / (counts[city] || 1)).toFixed(2)),
    }));
  };

  const chartData =
    selectedGrowth && summary.length > 0 ? buildCombinedAverageData(summary) : [];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">PRODUCTIVITY REPORT (City-wise)</Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained" onClick={() => navigate("/DashboardHome/productivity_table", {
                state: { fromNavigation: true },
              })
            }
          >
            Productivity Table
          </Button>

          <Button
            variant="contained" onClick={() => navigate("/DashboardHome/productivity", {
                state: { fromNavigation: true },
              })
            }
          >
            Graph-CityWise
          </Button>

          <Button
            variant="contained" onClick={() => navigate("/DashboardHome/productivity_branches", {
                state: { fromNavigation: true },
              })
            }
          >
            Graph-BranchWise
          </Button>

          <Button
            variant="contained" onClick={() => navigate("/DashboardHome/productivity-bar-chart", {
                state: { fromNavigation: true },
              })
            }
          >
            Bar Chart-CityWise
          </Button>

          <Button
            variant="contained" onClick={() => navigate("/DashboardHome/productivity_branches-bar-chart", {
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
        yearOptions={yearOptions}
        years={years}
        setYears={setYears}
      />

      <GrowthButtons
        growthOptions={growthOptions}
        selectedGrowth={selectedGrowth}
        setSelectedGrowth={(value) => {
          setSelectedGrowthState(value);
          setSelectedGrowth(value, "productivity");
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
          showPercent={false}
        />
      )}
    </Box>
  );
}

export default ProductivityBarChartPage;
