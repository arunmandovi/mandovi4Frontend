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
} from "@mui/material";
import DataTable from "../components/DataTable";
import { fetchData } from "../api/uploadService";

function VASPage() {
  const [vasSummary, setVASSummary] = useState([]);
  const [months, setMonths] = useState([]);
  const [groupBy, setGroupBy] = useState("city");

  const monthOptions = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const columnRenameMap = {
    city: "City",
    branch: "Branch",
    pmsLoadDiagnosticCharges: "Diagnostic Charges PMS Load",
    noOfVehiclesDiagnosticCharges: "Diagnostice Charges No. Of Vehicles",
    labourEarningDiagnosticCharges: "Labour Earning",
    percentageOfDiagnosticPMSLoad: "% Diagnostic on PMS Load",
    thirdFRSAndPMLLoadWheelAlignment: "Wheel Alignment FR3 And PMS Load",
    noOfVehiclesWheelAlignment: "Wheel Alignment No. Of Vehicles",
    earningWheelAlignment: "Wheel Alignment Earning",
    percentageAgeWheelAlignment: "Wheel Alignment %age",
    thirdFRSAndPMSLoadWheelBalancing: "Wheel Balancing FR3 And PMS Load",
    noOfVehiclesWheelBalancing: "Wheel Balancing No. Of Vehicles",
    earningWheelBalancing: "Wheel Balancing Earning",
    percentageAgeWheelBalancing: "Wheel Balancing %age",
    FPRAndBDRLoadExteriorCleaning: "Exterior Cleaning FPR & BodyShop Load",
    noOfVehiclesExteriorCleaning: "Exterior Cleaning No. Of Vehicles",
    amountExteriorCleaning: "Exterior Cleaning amount",
    percentageAgeExteriorCleaning: "Exterior Cleaning %age",
    noOfVehiclesInteriorCleaning: "Interior Cleaning No. Of Vehicles",
    amountInteriorCleaning: "Interior Cleaning Amount",
    percentageAgeInteriorCleaning: "Interior Cleaning %age",
    noOfVehiclesUnderBodyCoating: "Underbody Coating No. Of Vehicles",
    amountUnderBodyCoating: "Underbody Coating amount",
    percentageAgeUnderBodyCoating: "Underbody Coating %age",
    noOfVehiclesTopBodyCoating: "Topbody Coating No. Of Vehicles",
    amountTopBodyCoating: "Topbody Coating amount",
    percentageAgeTopBodyCoating: "Topbody Coating %age",
    noOfVehiclesRatMesh: "Rat Mesh No. of Vehicles",
    amountRatMesh: "Rat Mesh amount",
    percentageAgeRatMesh: "Rat Mesh %age",
    noOfVehiclesACEvaporator: "AC Evaporator No. Of Vehicles",
    amountACEvaporator: "AC Evaporator Amount",
    percentageACEvaporator: "AC Evaporator %age",
    noOfVehiclesACVent: "AC Vent No. Of Vehicles",
    amountACVent: "AC Vent Amount",
    percentageAgeACVent: "AC Vent %age",
    noOfVehiclesPlasticRestorer: "Plastic Restorer No. Of Vehicles",
    amountPlasticRestorer: "Plastic Restorer Amount",
    percentageAgePlasticRestorer: "Plastic Restorer %age",
  };

  // ✅ Format numbers for readability (adds % where needed)
  const formatNumericValues = (data) => {
    return data.map((row) => {
      const formatted = {};
      for (const key in row) {
        const val = row[key];
        if (key.toLowerCase().includes("percentage") || key.toLowerCase().includes("%age")) {
          const num =
            typeof val === "number"
              ? val
              : parseFloat(String(val).replace("%", ""));
          formatted[key] = !isNaN(num)
            ? num.toFixed(2) + "%"
            : val;
        } else if (typeof val === "number") {
          formatted[key] = val.toLocaleString("en-IN", { maximumFractionDigits: 2 });
        } else if (typeof val === "string" && !isNaN(parseFloat(val)) && val.trim() !== "") {
          formatted[key] = parseFloat(val).toLocaleString("en-IN", { maximumFractionDigits: 2 });
        } else {
          formatted[key] = val;
        }
      }
      return formatted;
    });
  };

  // Combine multiple API results (month)
  const combineDataSets = (dataSets, keyField) => {
    const combined = {};
    dataSets.forEach((data) => {
      data.forEach((row) => {
        const key = row[keyField];
        if (!combined[key]) combined[key] = { ...row };
        else {
          Object.keys(row).forEach((col) => {
            const val1 = Number(String(combined[key][col]).replace(/[,()%]/g, "")) || 0;
            const val2 = Number(String(row[col]).replace(/[,()%]/g, "")) || 0;
            if (!isNaN(val1) && !isNaN(val2)) {
              combined[key][col] = val1 + val2;
            }
          });
        }
      });
    });
    return Object.values(combined);
  };

  // ✅ Grand Total Row — shows SUM for numeric values, keeps % symbol
  const addGrandTotalRow = (data, groupBy) => {
    if (!data || data.length === 0) return data;

    const totalRow = {};
    const numericKeys = new Set();

    // Identify numeric columns
    Object.keys(data[0]).forEach((key) => {
      const val = data[0][key];
      if (typeof val === "number" || (!isNaN(parseFloat(val)) && val !== "")) {
        numericKeys.add(key);
      }
    });

    // Sum all numeric values
    data.forEach((row) => {
      if (row[Object.keys(data[0])[0]] === "Grand Total") return;
      numericKeys.forEach((key) => {
        const raw = row[key];
        let num = 0;
        if (typeof raw === "number") num = raw;
        else if (typeof raw === "string") {
          const parsed = parseFloat(raw.replace("%", "").replace(/,/g, ""));
          if (!isNaN(parsed)) num = parsed;
        }
        totalRow[key] = (totalRow[key] || 0) + num;
      });
    });

    const formattedTotals = {};
    const allKeys = Object.keys(data[0]);
    const firstKey = allKeys[0];

    allKeys.forEach((key) => {
      const val = totalRow[key];
      if (numericKeys.has(key)) {
        if (key.toLowerCase().includes("percentage") || key.toLowerCase().includes("%age")) {
          formattedTotals[key] = val.toFixed(2) + "%";
        } else {
          formattedTotals[key] = val.toLocaleString("en-IN", { maximumFractionDigits: 2 });
        }
      } else {
        formattedTotals[key] = "";
      }
    });

    formattedTotals[firstKey] = "Grand Total";
    return [...data, formattedTotals];
  };

  // Sort by city priority
  const sortByCityPriority = (data) => {
    const priorityCities = ["Bangalore", "Mysore", "Mangalore"];
    return data.sort((a, b) => {
      const cityA = (a.city || a.City) || "";
      const cityB = (b.city || b.City) || "";
      const indexA = priorityCities.indexOf(cityA);
      const indexB = priorityCities.indexOf(cityB);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return 0;
    });
  };

  // Fetch and process VAS data
  useEffect(() => {
    const fetchVASSummary = async () => {
      try {
        let responses = [];
        const activeMonths = months.length > 0 ? months : [];

        if (activeMonths.length === 0) {
          const query = `?groupBy=${groupBy}`;
          const data = await fetchData(`/api/vas/vas_summary${query}`);
          responses.push(data);
        }

        for (const m of activeMonths) {
          const query = `?groupBy=${groupBy}&month=${m}`;
          const data = await fetchData(`/api/vas/vas_summary${query}`);
          responses.push(data);
        }

        const validData = responses.filter((r) => Array.isArray(r));
        let combinedData =
          validData.length > 1
            ? combineDataSets(validData, groupBy)
            : validData[0] || [];

        combinedData = sortByCityPriority(combinedData);
        const formatted = formatNumericValues(combinedData);
        const withTotal = addGrandTotalRow(formatted, groupBy);
        setVASSummary(withTotal);
      } catch (error) {
        console.error(error);
        alert("❌ Error fetching Summary: " + (error.message || error));
      }
    };

    fetchVASSummary();
  }, [months, groupBy]);

  // Rename columns
  const buildRenamedData = (rawRows) => {
    if (!Array.isArray(rawRows) || rawRows.length === 0) return [];
    const firstNonEmpty = rawRows.find((r) => r && Object.keys(r).length > 0);
    if (!firstNonEmpty) return [];

    const declaredKeys = Object.keys(columnRenameMap);
    const isArrayLike =
      Array.isArray(firstNonEmpty) ||
      (typeof firstNonEmpty === "object" &&
        Object.keys(firstNonEmpty).every((k) => /^[0-9]+$/.test(k)));

    let headerOriginalKeys = [];
    if (isArrayLike) {
      const length = Array.isArray(firstNonEmpty)
        ? firstNonEmpty.length
        : Object.keys(firstNonEmpty).length;
      headerOriginalKeys = declaredKeys.slice(0, length);
      if (headerOriginalKeys.length < length) {
        for (let i = headerOriginalKeys.length; i < length; i++) {
          headerOriginalKeys.push(`col${i}`);
        }
      }
    } else {
      headerOriginalKeys = Object.keys(firstNonEmpty);
    }

    const renamed = rawRows.map((row) => {
      if (!row) return {};
      if (Array.isArray(row)) {
        const obj = {};
        for (let i = 0; i < row.length; i++) {
          const origKey = headerOriginalKeys[i] || `col${i}`;
          const newKey = columnRenameMap[origKey] || origKey;
          obj[newKey] = row[i];
        }
        return obj;
      }

      const keys = Object.keys(row);
      const allNumericKeys = keys.every((k) => /^[0-9]+$/.test(k));
      if (allNumericKeys) {
        const obj = {};
        const sorted = keys.map((k) => parseInt(k, 10)).sort((a, b) => a - b);
        sorted.forEach((idx) => {
          const origKey = headerOriginalKeys[idx] || `col${idx}`;
          const newKey = columnRenameMap[origKey] || origKey;
          obj[newKey] = row[String(idx)];
        });
        return obj;
      }

      const obj = {};
      Object.entries(row).forEach(([k, v]) => {
        const newKey = columnRenameMap[k] || k;
        obj[newKey] = v;
      });
      return obj;
      return renamed.map((row) => {
      const formatted = {};
      Object.entries(row).forEach(([key, val]) => {
        const lowerKey = key.toLowerCase();
        if (lowerKey.includes("%") || lowerKey.includes("percentage") || lowerKey.includes("age")) {
          const num = parseFloat(String(val).replace("%", "").replace(/,/g, ""));
          formatted[key] = !isNaN(num) ? num.toFixed(2) + "%" : val;
        } else if (!isNaN(parseFloat(val)) && val !== "") {
          formatted[key] = parseFloat(val).toLocaleString("en-IN", { maximumFractionDigits: 2 });
        } else {
          formatted[key] = val;
        }
      });
      return formatted;
    });
    });

    const unionKeys = [];
    renamed.forEach((r) => {
      Object.keys(r).forEach((k) => {
        if (!unionKeys.includes(k)) unionKeys.push(k);
      });
    });

    return renamed.map((r) => {
      const out = {};
      unionKeys.forEach((k) => {
        out[k] = k in r ? r[k] : "";
      });
      return out;
    });
  };

  const renamedData = buildRenamedData(vasSummary);

  const hiddenColumns = [];
  if (groupBy === "city") hiddenColumns.push("Branch");
  if (groupBy === "branch") hiddenColumns.push("City");

  return (
    <Box className="battery-container" sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        VAS REPORT
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
          <InputLabel>Group By</InputLabel>
          <Select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
            <MenuItem value="city">City</MenuItem>
            <MenuItem value="branch">Branch</MenuItem>
            <MenuItem value="city_branch">City & Branch</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Data Table */}
      <Box sx={{ overflowX: "auto", width: "100%" }}>
        <DataTable
          data={renamedData}
          title="VAS Summary"
          hiddenColumns={hiddenColumns}
        />
      </Box>
    </Box>
  );
}

export default VASPage;
