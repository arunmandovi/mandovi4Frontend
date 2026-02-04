import React, { useState, useEffect } from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

import DataTable from "../../components/DataTable";
import SlicerFilters from "../../components/SlicerFilters";
import GrowthButtons from "../../components/GrowthButtons";
import { fetchData } from "../../api/uploadService";
import { getSelectedGrowth, setSelectedGrowth } from "../../utils/growthSelection";

function ProductivityTablePage() {
  const navigate = useNavigate();

  const [citySummary, setCitySummary] = useState([]);
  const [branchSummary, setBranchSummary] = useState([]);
  const [months, setMonths] = useState([]);
  const [years, setYears] = useState(["2025"]);
  const [cities, setCities] = useState([]);
  const [selectedGrowth, setSelectedGrowthState] = useState("Service");

  const monthOptions = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const yearOptions = ["2024", "2025"];
  const cityOptions = ["Bangalore", "Mysore", "Mangalore"];
  const growthOptions = ["Service", "BodyShop", "Free Service", "PMS", "RR", "Others"];

  /* ================= ORDER CONFIG ================= */
  const CITY_ORDER = ["Bangalore", "Mysore", "Mangalore"];

  const BRANCH_PRIORITY_ORDER = [
    "Wilson Garden", "Vijayanagar", "JP Nagar", "Yeshwanthpur WS",
    "Basaveshwarnagar", "Hennur", "Sarjapura", "Kolar", "Gowribidanur",
    "Uttarahali Kengeri", "Vidyarannapura", "Yelahanka", "Malur SOW",
    "Basavangudi", "Basavanagudi-SOW", "Kolar Nexa", "Maluru WS",
    "KRS Road", "Hunsur Road", "Bannur", "Mandya", "Gonikoppa",
    "Kushalnagar", "ChamrajNagar", "Krishnarajapet", "Somvarpet",
    "Maddur", "Nagamangala", "Narasipura", "Mysore Nexa", "Kollegal","Mandya Nexa",
    "Balmatta", "Bantwal", "Vittla", "Kadaba", "Uppinangady",
    "Surathkal", "Sullia", "Adyar", "Yeyyadi BR", "Nexa Service",
    "Sujith Bagh Lane", "Naravi"
  ];

  const sortByCustomOrder = (rows, key, order) =>
    [...rows].sort((a, b) => {
      const aIndex = order.indexOf(a[key]);
      const bIndex = order.indexOf(b[key]);
      if (aIndex === -1 && bIndex === -1) return a[key].localeCompare(b[key]);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });

  const productivityKeyMap = {
    Service: "serviceProductivity",
    BodyShop: "bodyShopProductivity",
    "Free Service": "freeServiceProductivity",
    PMS: "pmsProductivity",
    RR: "rrProductivity",
    Others: "othersProductivity",
  };

  const utilizedBayKeyMap = {
    Service: "serviceUtilizedBay",
    BodyShop: "bodyShopUtilizedBay",
    "Free Service": "serviceUtilizedBay",
    PMS: "serviceUtilizedBay",
    RR: "serviceUtilizedBay",
    Others: "serviceUtilizedBay",
  };

  const loadKeyMap = {
    Service: "serviceLoadd",
    BodyShop: "bodyShopLoadd",
    "Free Service": "freeServiceLoadd",
    PMS: "pmsLoadd",
    RR: "rrLoadd",
    Others: "othersLoadd",
  };

  const n = (v) => (v == null || v === "" ? 0 : Number(v));

  useEffect(() => {
    const saved = getSelectedGrowth("productivity");
    if (saved) setSelectedGrowthState(saved);
  }, []);

  useEffect(() => {
    loadCitySummary();
    loadBranchSummary();
  }, [months, years, selectedGrowth, cities]);

  const loadCitySummary = async () => {
    const selectedMonths = months.length ? months : monthOptions;
    const selectedYears = years.length ? years : yearOptions;

    const map = {};
    const monthData = {};

    for (const m of selectedMonths) {
      const data = await fetchData(
        `/api/productivity/productivity_summary?months=${m}&years=${selectedYears.join(",")}`
      );

      monthData[m] = Array.isArray(data) ? data : [];

      monthData[m].forEach((row) => {
        const city = row.city;
        if (!map[city]) {
          map[city] = {
            City: city,
            "Utilized Bay": n(row[utilizedBayKeyMap[selectedGrowth]]),
          };
        }
        map[city][m] = n(row[productivityKeyMap[selectedGrowth]]).toFixed(2);
      });
    }

    setCitySummary(
      addGrandTotal(
        sortByCustomOrder(Object.values(map), "City", CITY_ORDER),
        monthData,
        "City"
      )
    );
  };

  const loadBranchSummary = async () => {
    const selectedMonths = months.length ? months : monthOptions;
    const selectedYears = years.length ? years : yearOptions;

    const map = {};
    const monthData = {};

    for (const m of selectedMonths) {
      let data = await fetchData(
        `/api/productivity/productivity_branch_summary?months=${m}&years=${selectedYears.join(",")}`
      );

      data = (Array.isArray(data) ? data : [])
        .filter((r) => !cities.length || cities.includes(r.city))
        .filter((r) =>
          selectedGrowth === "BodyShop"
            ? n(r.bodyShopUtilizedBay) > 0
            : true
        );

      monthData[m] = data;

      data.forEach((row) => {
        const branch = row.branch;
        if (!map[branch]) {
          map[branch] = {
            Branch: branch,
            "Utilized Bay": n(row[utilizedBayKeyMap[selectedGrowth]]),
          };
        }
        map[branch][m] = n(row[productivityKeyMap[selectedGrowth]]).toFixed(2);
      });
    }

    setBranchSummary(
      addGrandTotal(
        sortByCustomOrder(Object.values(map), "Branch", BRANCH_PRIORITY_ORDER),
        monthData,
        "Branch"
      )
    );
  };

  const addGrandTotal = (rows, monthData, labelKey) => {
    if (!rows.length) return rows;

    const total = { [labelKey]: "GRAND TOTAL" };
    const months = Object.keys(monthData);
    total["Utilized Bay"] = 0;

    const used = new Set();
    months.forEach((m) => {
      (monthData[m] || []).forEach((r) => {
        const key = r.city || r.branch;
        if (!used.has(key)) {
          total["Utilized Bay"] += n(r[utilizedBayKeyMap[selectedGrowth]]);
          used.add(key);
        }
      });
    });

    months.forEach((m) => {
      const rowsForMonth = monthData[m] || [];
      const sumLoad = rowsForMonth.reduce(
        (s, r) => s + n(r[loadKeyMap[selectedGrowth]]),
        0
      );

      let grand = 0;

      if (selectedGrowth === "BodyShop") {
        const sumUtilized = rowsForMonth.reduce(
          (s, r) => s + n(r.bodyShopUtilizedBay),
          0
        );
        grand = sumUtilized === 0 ? 0 : sumLoad / sumUtilized;
      } else {
        const denom = rowsForMonth.reduce(
          (s, r) =>
            s +
            n(r[utilizedBayKeyMap[selectedGrowth]]) * n(r.workingDays),
          0
        );
        grand = denom === 0 ? 0 : sumLoad / denom;
      }

      total[m] = grand.toFixed(2);
    });

    return [...rows, total];
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">Productivity Table</Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/productivity_table")}>
            Productivity Table
          </Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/productivity")}>
            Graph-CityWise
          </Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/productivity_branches")}>
            Graph-BranchWise
          </Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/productivity-bar-chart")}>
            Bar Chart-CityWise
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate("/DashboardHome/productivity_branches-bar-chart")}
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

      <DataTable
        data={citySummary}
        title="City Wise Productivity Summary"
        decimalPlaces={2}
      />

      <Box sx={{ mt: 4 }}>
        <SlicerFilters
          cityOptions={cityOptions}
          cities={cities}
          setCities={setCities}
        />
      </Box>

      <DataTable
        data={branchSummary}
        title="Branch Wise Productivity Summary"
        decimalPlaces={2}
      />
    </Box>
  );
}

export default ProductivityTablePage;
