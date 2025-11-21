// FULL UPDATED CODE WITH TABLE SHOWING ONLY CHART MONTHS + RENAMED HEADERS
import React, { useState, useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";
import { fetchData } from "../../api/uploadService";
import { useNavigate } from "react-router-dom";
import SlicerFilters from "../../components/SlicerFilters";
import GrowthButtons from "../../components/GrowthButtons";
import GrowthLineChart from "../../components/GrowthLineChart";
import { sortCities } from "../../components/CityOrderHelper";
import { getSelectedGrowth, setSelectedGrowth } from "../../utils/growthSelection";

function LoaddPage() {
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
    "Service Growth %", "BodyShop Growth %", "Free Service Growth %",
    "PMS Growth %", "FPR Growth %", "RR Growth %",
    "Others Growth %", "BS on FPR 2024-25 %", "BS on FPR 2025-26 %",
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
    "BS on FPR 2024-25 %": ["previousBSFPR", "currentBSFPR", "growthBSFPR"],
    "BS on FPR 2025-26 %": ["previousBSFPR", "currentBSFPR", "growthBSFPR"],
  };

  // MAP FOR RENAMING HEADERS
  const beautifyHeader = (key) => {
    if (key.startsWith("previous")) return "2024-25";
    if (key.startsWith("current")) return "2025-26";
    if (key.startsWith("growth")) return "Growth";
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

  // Fetch summary
  useEffect(() => {
    const fetchCitySummary = async () => {
      try {
        const activeMonths = months.length ? months : monthOptions;
        const combined = [];

        for (const m of activeMonths) {
          let q = `?&months=${m}`;
          if (channels.length === 1) q += `&channels=${channels[0]}`;

          const data = await fetchData(`/api/loadd/loadd_summary${q}`);
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
      (data || []).forEach((r) => cities.add(readCityName(r)))
    );

    const sortedCities = sortCities([...cities]);

    const formatted = filteredSummary.map(({ month, data }) => {
      const row = { month };
      sortedCities.forEach((c) => (row[c] = 0));

      (data || []).forEach((r) => {
        const c = readCityName(r);
        row[c] = readGrowthValue(r, apiKey);
      });

      return row;
    });

    return { formatted, sortedCities };
  };

  const { formatted: chartData, sortedCities: cityKeys } = buildChartData();

  // Build pivot table using only chart months
  const buildPivotTable = () => {
    if (!selectedGrowth) return [];

    const chartMonths = summary
      .filter((s) => s.data && s.data.length > 0)
      .map((s) => s.month);

    const keys = valueKeyMap[selectedGrowth];
    const citiesToShow = ["Bangalore", "Mysore", "Mangalore"];

    const rows = [];

    citiesToShow.forEach((city) => {
      const r = { city };

      chartMonths.forEach((m) => {
        const summaryEntry = summary.find((x) => x.month === m);
        const cityRow = summaryEntry?.data?.find((it) => readCityName(it) === city);

        keys.forEach((k) => {
          r[`${m}_${k}`] = cityRow ? readGrowthValue(cityRow, k) : 0;
        });
      });

      rows.push(r);
    });

    return rows;
  };

  const chartMonths = summary
    .filter((s) => s.data && s.data.length > 0)
    .map((s) => s.month);

  const tableData = buildPivotTable();
  const keys = selectedGrowth ? valueKeyMap[selectedGrowth] : [];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">LOAD GRAPH (CityWise)</Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" color="secondary" onClick={() => navigate("/DashboardHome/loadd")}>
            Graph-CityWise
          </Button>
          <Button variant="contained" color="secondary" onClick={() => navigate("/DashboardHome/loadd_branches")}>
            Graph-BranchWise
          </Button>
          <Button variant="contained" color="secondary" onClick={() => navigate("/DashboardHome/loadd-bar-chart")}>
            Bar Chart-CityWise
          </Button>
          <Button variant="contained" color="secondary" onClick={() => navigate("/DashboardHome/loadd_branches-bar-chart")}>
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

          {/* TABLE SHOWING ONLY CHART MONTHS */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              City-wise Summary – {selectedGrowth}
            </Typography>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f0f0f0" }}>
                  <th style={{ padding: 8, border: "1px solid #ccc" }}>City</th>

                  {chartMonths.map((m) => (
                    <th
                      key={m}
                      colSpan={keys.length}
                      style={{ padding: 8, border: "1px solid #ccc", textAlign: "center" }}
                    >
                      {m}
                    </th>
                  ))}
                </tr>

                {/* RENAMED HEADERS */}
                <tr style={{ background: "#fafafa" }}>
                  <th style={{ padding: 8, border: "1px solid #ccc" }}></th>

                  {chartMonths.flatMap((m) =>
                    keys.map((k) => (
                      <th key={`${m}_${k}`} style={{ padding: 8, border: "1px solid #ccc" }}>
                        {beautifyHeader(k)}
                      </th>
                    ))
                  )}
                </tr>
              </thead>

              <tbody>
                {tableData.map((row, i) => (
                  <tr key={i}>
                    <td style={{ padding: 8, border: "1px solid #ccc", fontWeight: "bold" }}>
                      {row.city}
                    </td>

                    {chartMonths.flatMap((m) =>
                      keys.map((k) => {
                        const val = row[`${m}_${k}`] || 0;
                        return (
                          <td
                            key={`${m}_${k}`}
                            style={{
                              padding: 8,
                              border: "1px solid #ccc",
                              color: k.includes("growth")
                                ? val > 0
                                  ? "green"
                                  : val < 0
                                  ? "red"
                                  : "black"
                                : "black",
                              fontWeight: k.includes("growth") && val !== 0 ? "600" : "400",
                            }}
                          >
                            {k.includes("growth") ? `${val.toFixed(1)}%` : val.toFixed(1)}
                          </td>
                        );
                      })
                    )}
                  </tr>
                ))}

                {/* GRAND TOTAL ROW */}
                <tr style={{ background: "#d9edf7", fontWeight: "bold" }}>
                  <td style={{ padding: 8, border: "1px solid #ccc" }}>Grand Total</td>

                  {chartMonths.flatMap((m) =>
                    keys.map((k) => {
                      const values = tableData.map((r) => r[`${m}_${k}`] || 0);

                      if (k.includes("growth")) {
                        const prev = keys[0];
                        const curr = keys[1];

                        const prevTotal = tableData.reduce(
                          (s, r) => s + (r[`${m}_${prev}`] || 0),
                          0
                        );
                        const currTotal = tableData.reduce(
                          (s, r) => s + (r[`${m}_${curr}`] || 0),
                          0
                        );

                        const growth =
                          prevTotal === 0 ? 0 : ((currTotal - prevTotal) / prevTotal) * 100;
                        return (
                          <td key={`${m}_${k}`} style={{ padding: 8, border: "1px solid #ccc" }}>
                            {growth.toFixed(1)}%
                          </td>
                        );
                      }

                      const total = values.reduce((a, b) => a + b, 0);
                      return (
                        <td key={`${m}_${k}`} style={{ padding: 8, border: "1px solid #ccc" }}>
                          {total.toFixed(1)}
                        </td>
                      );
                    })
                  )}
                </tr>
              </tbody>
            </table>
          </Box>
        </>
      )}
    </Box>
  );
}

export default LoaddPage;
