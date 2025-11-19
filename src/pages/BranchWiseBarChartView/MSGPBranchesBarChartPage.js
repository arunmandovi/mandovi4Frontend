import React, { useState, useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";
import { fetchData } from "../../api/uploadService";
import { useNavigate } from "react-router-dom";
import SlicerFilters from "../../components/SlicerFilters";
import GrowthButtons from "../../components/GrowthButtons";
import BranchBarChart from "../../components/BranchBarChart";
import { getSelectedGrowth, setSelectedGrowth } from "../../utils/growthSelection";

function MSGPBranchesBarChartPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState([]);
  const [months, setMonths] = useState([]);
  const [cities, setCities] = useState([]);
  const [qtrWise, setQtrWise] = useState([]);
  const [halfYear, setHalfYear] = useState([]);
  const [selectedGrowth, setSelectedGrowthState] = useState(null);

  const monthOptions = ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"];
  const cityOptions = ["Bangalore", "Mysore", "Mangalore"];
  const qtrWiseOptions = ["Qtr1","Qtr2","Qtr3","Qtr4"];
  const halfYearOptions = ["H1","H2"];
  
  const growthOptions = [
    "SR&BR Growth %",
    "Service Growth %",
    "BodyShop Growth %",
    "Free Service Growth %",
    "PMS Growth %",
    "RR Growth %",
    "Others Growth %",
  ];

  const growthKeyMap = {
    "SR&BR Growth %": "growthSRBS",
    "Service Growth %": "growthService",
    "BodyShop Growth %": "growthBodyShop",
    "Free Service Growth %": "growthFreeService",
    "PMS Growth %": "growthPMS",
    "RR Growth %": "growthRR",
    "Others Growth %": "growthOthers",
  };

  useEffect(() => {
    const savedGrowth = getSelectedGrowth("msgp");
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
        const endpoint = `/api/msgp/msgp_branch_summary${params.toString()? "?"+params.toString():""}`;
        const data = await fetchData(endpoint);
        setSummary(Array.isArray(data)?data:[]);
      } catch (error) {
        console.error("Error fetching msgp branch summary:", error);
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
        <Typography variant="h4">MSGP REPORT (Branch-wise)</Typography>
        <Box sx={{display:"flex", gap:1}}>
          <Button variant="contained" color="secondary" onClick={()=>navigate("/DashboardHome/msgp")}>Graph-CityWise</Button>
          <Button variant="contained" color="secondary" onClick={()=>navigate("/DashboardHome/msgp-bar-chart")}>BarChart-CityWise</Button>
          <Button variant="contained" color="secondary" onClick={()=>navigate("/DashboardHome/msgp_branches-bar-chart")}>BarChart-BranchWise</Button>
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
          setSelectedGrowth(value,"msgp");
        }}
      />

      {!selectedGrowth ? <Typography sx={{mt:2}}>👆 Select a growth type to view the chart below</Typography> :
        <BranchBarChart chartData={chartData} selectedGrowth={selectedGrowth} />
      }
    </Box>
  );
}

export default MSGPBranchesBarChartPage;
