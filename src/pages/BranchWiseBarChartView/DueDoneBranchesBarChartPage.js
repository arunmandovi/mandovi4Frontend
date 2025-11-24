import React, { useState, useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";
import { fetchData } from "../../api/uploadService";
import { useNavigate } from "react-router-dom";
import SlicerFilters from "../../components/SlicerFilters";
import GrowthButtons from "../../components/GrowthButtons";
import BranchBarChart from "../../components/BranchBarChart";
import { getSelectedGrowth, setSelectedGrowth } from "../../utils/growthSelection";

function DueDoneBranchesBarChartPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState([]);
  const [months, setMonths] = useState([]);
  const [cities, setCities] = useState([]);
  const [channels, setChannels] = useState([]);
  const [qtrWise, setQtrWise] = useState([]);
  const [halfYear, setHalfYear] = useState([]);
  const [selectedGrowth, setSelectedGrowthState] = useState(getSelectedGrowth("due_done"));

  const monthOptions = ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"];
  const cityOptions = ["Bangalore", "Mysore", "Mangalore"];
  const channelOptions = ["ARENA","NEXA"];
  const qtrWiseOptions = ["Qtr1","Qtr2","Qtr3","Qtr4"];
  const halfYearOptions = ["H1","H2"];

  const growthOptions = [
    "Done %"
  ];
  const growthKeyMap = {
    "Done %": "percentageDone",
  };

  useEffect(() => {
        if (!selectedGrowth && growthOptions.length === 1) {
          const defaultGrowth = growthOptions[0];
          setSelectedGrowthState(defaultGrowth);
          setSelectedGrowth(defaultGrowth, "due_done");
        }
      }, [selectedGrowth]);
  

  useEffect(() => {
    const savedGrowth = getSelectedGrowth("due_done");
    if (savedGrowth) setSelectedGrowthState(savedGrowth);
  }, []);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const params = new URLSearchParams();
        if (months.length>0) params.append("months", months.join(","));
        if (cities.length>0) params.append("cities", cities.join(","));
        if (channels.length>0) params.append("channels", channels.join(","));
        if (qtrWise.length>0) params.append("qtrWise", qtrWise.join(","));
        if (halfYear.length>0) params.append("halfYear", halfYear.join(","));
        const endpoint = `/api/due_done/due_done_branch_summary${params.toString()? "?"+params.toString():""}`;
        const data = await fetchData(endpoint);
        setSummary(Array.isArray(data)?data:[]);
      } catch (error) {
        console.error("Error fetching due vs done branch summary:", error);
        setSummary([]);
      }
    };
    fetchSummary();
  }, [months,cities,channels,qtrWise,halfYear]);

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

  const chartData = selectedGrowth && summary.length > 0 
  ? buildCombinedAverageData(summary)
      .filter(item => {
        if (selectedGrowth === "BodyShop Growth %" || selectedGrowth === "BS on FPR 2024-25 %" || selectedGrowth === "BS on FPR 2025-26 %") {
          return item.name !== "Vittla" && item.name !== "Naravi" && item.name !== "Gowribidanur" && item.name !== "Malur SOW" &&
          item.name !== "Maluru WS" && item.name !== "Kollegal" && item.name !== "Narasipura" && item.name !== "Nagamangala" &&
          item.name !== "Maddur" && item.name !== "Somvarpet" && item.name !== "Krishnarajapet" && item.name !== "ChamrajNagar" &&
          item.name !== "KRS Road" && item.name !== "Naravi" && item.name !== "Gowribidanur" && item.name !== "Malur SOW" && 
          item.name !== "Balmatta" && item.name !== "Bantwal" && item.name !== "Nexa Service" && item.name !== "Kadaba" && item.name !== "Sujith Bagh Lane";
        }
        return true;
      })
  : [];

  return (
    <Box sx={{p:3}}>
      <Box sx={{display:"flex", justifyContent:"space-between", alignItems:"center", mb:3}}>
        <Typography variant="h4">DUE VS DONE REPORT (Branch-wise)</Typography>
        <Box sx={{display:"flex", gap:1}}>
          <Button variant="contained" color="secondary" onClick={() => navigate("/DashboardHome/due_done")}>Graph-CityWise</Button>
          <Button variant="contained" color="secondary" onClick={() => navigate("/DashboardHome/due_done_branches")}>Graph-BranchWise</Button>
          <Button variant="contained" color="secondary" onClick={() => navigate("/DashboardHome/due_done-bar-chart")}>Bar Chart-CityWise</Button>
          <Button variant="contained" color="secondary" onClick={() => navigate("/DashboardHome/due_done_branches-bar-chart")}>Bar Chart-BranchWise</Button>
        </Box>
      </Box>

      <SlicerFilters
        monthOptions={monthOptions} months={months} setMonths={setMonths}
        cityOptions={cityOptions} cities={cities} setCities={setCities}
        channelOptions={channelOptions} channels={channels} setChannels={setChannels}
        qtrWiseOptions={qtrWiseOptions} qtrWise={qtrWise} setQtrWise={setQtrWise}
        halfYearOptions={halfYearOptions} halfYear={halfYear} setHalfYear={setHalfYear}
      />

      <GrowthButtons
        growthOptions={growthOptions}
        selectedGrowth={selectedGrowth}
        setSelectedGrowth={(value)=>{
          setSelectedGrowthState(value);
          setSelectedGrowth(value,"due_done");
        }}
      />

      {!selectedGrowth ? <Typography sx={{mt:2}}>👆 Select a growth type to view the chart below</Typography> :
        <BranchBarChart 
        chartData={chartData} 
        selectedGrowth={selectedGrowth} 
        showPercent={true}
        />
      }
    </Box>
  );
}

export default DueDoneBranchesBarChartPage;
