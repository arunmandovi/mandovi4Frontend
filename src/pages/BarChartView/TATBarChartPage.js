import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { fetchData } from "../../api/uploadService";
import { useNavigate } from "react-router-dom";
import GrowthButtons from "../../components/GrowthButtons";
import SlicerFilters from "../../components/SlicerFilters";
import { getSelectedGrowth, setSelectedGrowth } from "../../utils/growthSelection";

function TATBarChartPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState([]);
  const [months, setMonths] = useState([]);
  const [qtrWise, setQtrWise] = useState([]);
  const [halfYear, setHalfYear] = useState([]);
  const [selectedGrowth, setSelectedGrowthState] = useState(getSelectedGrowth("tat"));

  // ---------- Filter Options ----------
  const monthOptions = [
    "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct",
    "Nov", "Dec", "Jan", "Feb", "Mar",
  ];

  const qtrWiseOptions = ["Qtr1", "Qtr2", "Qtr3", "Qtr4"];
  const halfYearOptions = ["H1", "H2"];
  const growthOptions = ["FR1", "FR2", "FR3", "PMS"];

  const growthKeyMap = {
    FR1: "firstFreeService",
    FR2: "secondFreeService",
    FR3: "thirdFreeService",
    PMS: "paidService",
  };

  const preferredOrder = ["Bangalore", "Mysore", "Mangalore"];

  // ---------- Fetch data ----------
  useEffect(() => {
    const fetchCitySummary = async () => {
      try {
        const activeMonths = months.length ? months : [];
        const activeQtrWise = qtrWise.length ? qtrWise : [];
        const activeHalfYear = halfYear.length ? halfYear : [];

        const queryParams = new URLSearchParams();
        if (activeMonths.length) queryParams.append("months", activeMonths.join(","));
        if (activeQtrWise.length) queryParams.append("qtrWise", activeQtrWise.join(","));
        if (activeHalfYear.length) queryParams.append("halfYear", activeHalfYear.join(","));

        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
        const data = await fetchData(`/api/tat/tat_summary${queryString}`);

        if (data && data.length > 0) {
          setSummary(data);
        } else {
          setSummary([]);
        }
      } catch (err) {
        console.error("fetchCitySummary error:", err);
        setSummary([]);
      }
    };

    fetchCitySummary();
  }, [months, qtrWise, halfYear]);

  // ---------- Helpers ----------
  const readCityName = (row) => {
    if (!row) return "";
    return (
      row.city ||
      row.City ||
      row.cityName ||
      row.CityName ||
      row.name ||
      row.Name ||
      ""
    )
      .toString()
      .trim();
  };

  const readGrowthValue = (row, apiKey) => {
    if (!row || !apiKey) return undefined;
    const val = row[apiKey];
    if (!val) return 0;

    if (typeof val === "string" && val.includes(":")) {
      const parts = val.split(":").map(Number);
      return parts[0] * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
    }

    return parseFloat(val);
  };

  const formatSecondsToHHMMSS = (seconds) => {
    if (isNaN(seconds)) return "00:00:00";
    const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
    const s = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  // ---------- Build averaged dataset ----------
  const buildCombinedAverageData = (dataArr) => {
    const apiKey = growthKeyMap[selectedGrowth];
    const cityTotals = {};
    const cityCounts = {};

    (dataArr || []).forEach((row) => {
      const city = readCityName(row);
      const val = readGrowthValue(row, apiKey);
      if (!isNaN(val)) {
        cityTotals[city] = (cityTotals[city] || 0) + val;
        cityCounts[city] = (cityCounts[city] || 0) + 1;
      }
    });

    const allCitiesUnordered = Object.keys(cityTotals);
    const allCities = [
      ...preferredOrder.filter((c) =>
        allCitiesUnordered.some((x) => x.toLowerCase() === c.toLowerCase())
      ),
      ...allCitiesUnordered
        .filter(
          (c) => !preferredOrder.some((p) => p.toLowerCase() === c.toLowerCase())
        )
        .sort((a, b) => a.localeCompare(b)),
    ];

    return allCities.map((city) => ({
      city,
      value: cityCounts[city] ? cityTotals[city] / cityCounts[city] : 0,
    }));
  };

  const chartData =
    selectedGrowth && summary.length > 0 ? buildCombinedAverageData(summary) : [];

  // ---------- Custom Tooltip ----------
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            background: "white",
            border: "1px solid #ccc",
            borderRadius: 1,
            p: 1,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {payload[0].payload.city}
          </Typography>
          <Typography variant="body2">
            {formatSecondsToHHMMSS(payload[0].value)}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  // ---------- Render ----------
  return (
    <Box sx={{ p: 3 }}>
      {/* Header Buttons */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">TAT REPORT (City-wise)</Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" color="secondary" onClick={() => navigate("/DashboardHome/tat")}>Graph-BranchWise</Button>
          <Button variant="contained" color="secondary" onClick={() => navigate("/DashboardHome/tat-bar-chart")}>BarChart-CityWise</Button>
          <Button variant="contained" color="secondary" onClick={() => navigate("/DashboardHome/tat_branches-bar-chart")}>BarChart-BranchWise</Button>
        </Box>
      </Box>

      {/* Filters Section */}
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
          setSelectedGrowth(value, "tat");
        }}
      />

      {/* Chart Section */}
      {!selectedGrowth ? (
        <Typography>👆 Select a service type to view the chart below</Typography>
      ) : summary.length === 0 ? (
        <Typography>No data available for the selected criteria.</Typography>
      ) : (
        <Box
          sx={{
            mt: 2,
            width: "100%",
            height: 520,
            background: "#fff",
            borderRadius: 2,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            p: 2,
          }}
        >
          <Typography variant="h6" sx={{ mb: 1 }}>
            {selectedGrowth} — Average TAT
          </Typography>

          <ResponsiveContainer width="100%" height="92%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
            >
              {/* ✅ 3D Gradient & Shadow Definitions */}
              <defs>
                <linearGradient id="bar3dGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsla(238, 62%, 63%, 1.00)" />
                  <stop offset="50%" stopColor="hsla(238, 62%, 63%, 1.00)" />
                  <stop offset="100%" stopColor="hsla(238, 62%, 63%, 1.00)" />
                </linearGradient>
                <filter id="barShadow" x="-20%" y="-20%" width="150%" height="150%">
                  <feDropShadow dx="4" dy="4" stdDeviation="4" floodColor="#a1a1a1" />
                </filter>
              </defs>

              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="city" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(val) => formatSecondsToHHMMSS(val)}
                label={{
                  value: "TAT (HH:MM:SS)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              
              <Bar
               dataKey="value"
               fill="url(#bar3dGradient)"
               barSize={90}
               radius={[6, 6, 0, 0]}
               isAnimationActive={true}
               style={{ filter: "url(#barShadow)" }}
              >             
               <LabelList
                 dataKey="value"
                 position="insideTop"
                 fontSize={11}
                 content={(props) => {
                   const { x, y, width, height, value } = props;
                   if (value == null || height <= 0) return null;
             
                   // Center text inside the bar
                   const textX = x + width / 2;
                   const textY = y + height / 2 + 5; 
             
                   return (
                     <text
                       x={textX}
                       y={textY}
                       textAnchor="middle"
                       fontSize={13}
                       fontWeight={600}
                       fill={height > 60 ? "rgba(5, 5, 5, 1)" : "#000"}
                       transform={`rotate(-90, ${textX}, ${textY})`}
                       dominantBaseline="middle"
                       style={{ pointerEvents: "none" }}
                     >
                       {formatSecondsToHHMMSS(value)}
                     </text>
                   );
                 }}
               />
             </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Box>
  );
}

export default TATBarChartPage;
