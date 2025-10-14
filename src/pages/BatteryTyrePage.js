import React, { useState, useEffect } from "react";
import {
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Checkbox,
  ListItemText,
  Button,
} from "@mui/material";
import { fetchData } from "../api/uploadService";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Color palette for different cities
const colorPalette = [
  "#8884d8", "#82ca9d", "#ffc658", "#d0ed57", "#a4de6c",
  "#8dd1e1", "#ff8042", "#ffbb28", "#d888d8", "#84cae1",
];

function BatteryTyrePage() {
  const [batteryTyreSummary, setBatteryTyreSummary] = useState([]);
  const [months, setMonths] = useState([]);
  const [quarters, setQuarters] = useState([]);
  const [halfYears, setHalfYears] = useState([]);
  const [groupBy, setGroupBy] = useState("city");
  const [showGraph, setShowGraph] = useState(false); // 👈 for toggle view

  const monthOptions = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const quarterOptions = ["Qtr1", "Qtr2", "Qtr3", "Qtr4"];
  const halfYearOptions = ["H1", "H2"];

  const fetchAndFormatData = async () => {
    try {
      const requests = [];

      // collect all filters
      const activeMonths = months.length > 0 ? months : [];
      const activeQuarters = quarters.length > 0 ? quarters : [];
      const activeHalfYears = halfYears.length > 0 ? halfYears : [];

      // no filters = fetch overall
      if (
        activeMonths.length === 0 &&
        activeQuarters.length === 0 &&
        activeHalfYears.length === 0
      ) {
        requests.push(fetchData(`/api/battery_tyre/battery_tyre_summary?groupBy=${groupBy}`));
      }

      for (const m of activeMonths) {
        requests.push(fetchData(`/api/battery_tyre/battery_tyre_summary?groupBy=${groupBy}&month=${m}`));
      }

      for (const q of activeQuarters) {
        requests.push(fetchData(`/api/battery_tyre/battery_tyre_summary?groupBy=${groupBy}&qtrWise=${q}`));
      }

      for (const h of activeHalfYears) {
        requests.push(fetchData(`/api/battery_tyre/battery_tyre_summary?groupBy=${groupBy}&halfYear=${h}`));
      }

      const responses = await Promise.all(requests);
      const validData = responses.filter((r) => Array.isArray(r));
      const flatData = validData.flat();

      // aggregate by city/branch key
      const aggregated = flatData.reduce((acc, row) => {
        const key =
          groupBy === "city_branch"
            ? `${row.city || "Unknown City"}|${row.branch || "Unknown Branch"}`
            : groupBy === "city"
            ? row.city || "Unknown City"
            : row.branch || "Unknown Branch";

        if (!acc[key]) {
          acc[key] = {
            city: row.city || "Unknown City",
            branch: row.branch || "Unknown Branch",
            batteryProfit: 0,
            tyreProfit: 0,
            batteryTyreProfit: 0,
          };
        }

        acc[key].batteryProfit += Number(row.batteryProfit) || 0;
        acc[key].tyreProfit += Number(row.tyreProfit) || 0;
        acc[key].batteryTyreProfit += Number(row.batteryTyreProfit) || 0;

        return acc;
      }, {});

      // convert to array + labels
      let combinedData = Object.values(aggregated).map((row) => ({
        ...row,
        label:
          groupBy === "city_branch"
            ? `${row.city} - ${row.branch}`
            : groupBy === "city"
            ? row.city
            : row.branch,
      }));

      // custom sorting
      const priorityCities = ["Bangalore", "Mysore", "Mangalore"];
      combinedData.sort((a, b) => {
        if (groupBy === "city" || groupBy === "city_branch") {
          const indexA = priorityCities.indexOf(a.city);
          const indexB = priorityCities.indexOf(b.city);
          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
        }
        return 0;
      });

      setBatteryTyreSummary(combinedData);
    } catch (error) {
      console.error(error);
      alert("❌ Error fetching Battery & Tyre Summary: " + error.message);
    }
  };

  useEffect(() => {
    fetchAndFormatData();
  }, [months, quarters, halfYears, groupBy]);

  const decimalFormatter = (value) => Number(value).toFixed(2);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        BATTERY & TYRE REPORT
      </Typography>

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Month</InputLabel>
          <Select
            multiple
            value={months}
            onChange={(e) => setMonths(e.target.value)}
            renderValue={(selected) => selected.join(", ")}
          >
            {monthOptions.map((m) => (
              <MenuItem key={m} value={m}>
                <Checkbox checked={months.indexOf(m) > -1} />
                <ListItemText primary={m} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Quarter</InputLabel>
          <Select
            multiple
            value={quarters}
            onChange={(e) => setQuarters(e.target.value)}
            renderValue={(selected) => selected.join(", ")}
          >
            {quarterOptions.map((q) => (
              <MenuItem key={q} value={q}>
                <Checkbox checked={quarters.indexOf(q) > -1} />
                <ListItemText primary={q} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Half Year</InputLabel>
          <Select
            multiple
            value={halfYears}
            onChange={(e) => setHalfYears(e.target.value)}
            renderValue={(selected) => selected.join(", ")}
          >
            {halfYearOptions.map((h) => (
              <MenuItem key={h} value={h}>
                <Checkbox checked={halfYears.indexOf(h) > -1} />
                <ListItemText primary={h} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Group By</InputLabel>
          <Select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
            <MenuItem value="city">City</MenuItem>
            <MenuItem value="branch">Branch</MenuItem>
            <MenuItem value="city_branch">City & Branch</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Chart */}
      <Box sx={{ width: "100%", height: 500 }}>
        <ResponsiveContainer>
          {showGraph ? (
            <LineChart
              data={batteryTyreSummary}
              margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" angle={-45} textAnchor="end" interval={0} />
              <YAxis />
              <Tooltip formatter={decimalFormatter} />
              <Legend />
              <Line type="monotone" dataKey="batteryProfit" name="Battery Profit" stroke="#8884d8" />
              <Line type="monotone" dataKey="tyreProfit" name="Tyre Profit" stroke="#82ca9d" />
              <Line type="monotone" dataKey="batteryTyreProfit" name="Battery & Tyre Profit" stroke="#ffc658" />
            </LineChart>
          ) : (
            <BarChart
              data={batteryTyreSummary}
              margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" angle={-45} textAnchor="end" interval={0} />
              <YAxis />
              <Tooltip formatter={decimalFormatter} />
              <Legend />
              <Bar dataKey="batteryProfit" name="Battery Profit" fill="#8884d8" />
              <Bar dataKey="tyreProfit" name="Tyre Profit" fill="#82ca9d" />
              <Bar
                dataKey="batteryTyreProfit"
                name="Battery & Tyre Profit"
                fill="#ffc658"
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </Box>

      {/* Toggle Button */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowGraph(!showGraph)}
        >
          {showGraph ? "Show Bar Chart" : "Show Graph View"}
        </Button>
      </Box>
    </Box>
  );
}

export default BatteryTyrePage;
