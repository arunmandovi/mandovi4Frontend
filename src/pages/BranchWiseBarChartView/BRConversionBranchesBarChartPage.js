import React, { useState, useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";
import { fetchData } from "../../api/uploadService";
import { useNavigate } from "react-router-dom";
import SlicerFilters from "../../components/SlicerFilters";
import GrowthButtons from "../../components/GrowthButtons";
import BranchBarChart from "../../components/BranchBarChart";
import { getSelectedGrowth, setSelectedGrowth } from "../../utils/growthSelection";

function BRConversionBranchesBarChartPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState([]);
  const [months, setMonths] = useState([]);
  const [cities, setCities] = useState([]);
  const [qtrWise, setQtrWise] = useState([]);
  const [halfYear, setHalfYear] = useState([]);
  const [selectedGrowth, setSelectedGrowthState] = useState("Arena&Nexa BR Conversion %");

  const monthOptions = ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"];
  const cityOptions = ["Bangalore", "Mysore", "Mangalore"];
  const qtrWiseOptions = ["Qtr1","Qtr2","Qtr3","Qtr4"];
  const halfYearOptions = ["H1","H2"];

  const growthOptions = [
    "Arena BR Conversion %", "Nexa BR Conversion %", "Arena&Nexa BR Conversion %",
    "Arena Total Amount", "Nexa Total Amount", "Arena&Nexa Total Amount",
  ];

  const growthKeyMap = {
    "Arena BR Conversion %": "arenaPercentageBRConversion",
    "Nexa BR Conversion %": "nexaPercentageBRConversion",
    "Arena&Nexa BR Conversion %": "arenaNexaPercentageBRConversion",
    "Arena Total Amount": "arenaTotalAmount",
    "Nexa Total Amount": "nexaTotalAmount",
    "Arena&Nexa Total Amount": "arenaNexaTotalAmount",
  };

  useEffect(() => {
    const savedGrowth = getSelectedGrowth("br_conversion");
    if (savedGrowth) setSelectedGrowthState(savedGrowth);
  }, []);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const params = new URLSearchParams();
        if (months.length>0) params.append("months", months.join(","));
        if (cities.length>0) params.append("cities", cities.join(","));
        if (qtrWise.length>0) params.append("qtrWise", qtrWise.join(","));
        if (halfYear.length>0) params.append("halfYear", halfYear.join(","));
        const endpoint = `/api/br_conversion/br_conversion_branch_summary${params.toString()? "?"+params.toString():""}`;
        const data = await fetchData(endpoint);
        setSummary(Array.isArray(data)?data:[]);
      } catch (error) {
        console.error("Error fetching br conversion branch summary:", error);
        setSummary([]);
      }
    };
    fetchSummary();
  }, [months,cities,qtrWise,halfYear]);

  const readBranchName = (row) => row?.branch || row?.Branch || row?.branchName || row?.BranchName || row?.name || row?.Name || "";
  const readCityName = (row) => row?.city || row?.City || row?.cityName || row?.CityName || "";
  const readGrowthValue = (row, apiKey) => {
    if (!apiKey) return null;
    const val = row?.[apiKey];
    if (val === null || val === undefined || val === "") return null;
    const num = parseFloat(String(val).replace("%","").trim());
    return isNaN(num)?null:num;
  };

  const buildCombinedAverageData = (dataArr) => {
    const apiKey = growthKeyMap[selectedGrowth];
    const totals = {};
    const counts = {};
    const cityMap = {};
    (dataArr || []).forEach((row)=>{
      const branch = readBranchName(row);
      const city = readCityName(row);
      const val = readGrowthValue(row, apiKey);
      if (val===null) return;
      totals[branch] = (totals[branch]||0)+val;
      counts[branch] = (counts[branch]||0)+1;
      cityMap[branch] = city;
    });
    return Object.keys(totals).map((b)=>({
      name:b,
      city:cityMap[b],
      value:counts[b]?totals[b]/counts[b]:0
    })).sort((a,b)=>b.value-a.value);
  };

  const chartData = selectedGrowth && summary.length>0 ? buildCombinedAverageData(summary) : [];

  return (
    <Box sx={{p:3}}>
      <Box sx={{display:"flex", justifyContent:"space-between", alignItems:"center", mb:3}}>
        <Typography variant="h4">BR CONVERSION REPORT (Branch-wise)</Typography>
        <Box sx={{display:"flex", gap:1}}>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/br_conversion")}>Graph-CityWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/br_conversion_branches")}>Graph-BranchWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/br_conversion-bar-chart")}>Bar Chart-CityWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/br_conversion_branches-bar-chart")}>Bar Chart-BranchWise</Button>
        </Box>
      </Box>

      <SlicerFilters
        monthOptions={monthOptions} months={months} setMonths={setMonths}
        cityOptions={cityOptions} cities={cities} setCities={setCities}
        qtrWiseOptions={qtrWiseOptions} qtrWise={qtrWise} setQtrWise={setQtrWise}
        halfYearOptions={halfYearOptions} halfYear={halfYear} setHalfYear={setHalfYear}
      />

      <GrowthButtons
        growthOptions={growthOptions}
        selectedGrowth={selectedGrowth}
        setSelectedGrowth={(value)=>{
          setSelectedGrowthState(value);
          setSelectedGrowth(value,"br_conversion");
        }}
      />

      {!selectedGrowth ? <Typography sx={{mt:2}}>👆 Select a growth type to view the chart below</Typography> :
        <BranchBarChart 
        chartData={chartData} 
        selectedGrowth={selectedGrowth}
        decimalPlaces={["Arena Total Amount", "Nexa Total Amount", "Arena&Nexa Total Amount"]
          .includes(selectedGrowth) ? 0 : 1 }
        chartType={["Arena Total Amount", "Nexa Total Amount", "Arena&Nexa Total Amount"]
          .includes(selectedGrowth) ? "MGABranchesBarChart" : "absValue"}
        />
      }
    </Box>
  );
}

export default BRConversionBranchesBarChartPage;
