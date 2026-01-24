import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Typography, Paper, RadioGroup, FormControlLabel, Radio } from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LabelList,
} from "recharts";
import { fetchData } from "../../api/uploadService";

/* ---------------- CONSTANTS ---------------- */
const START_YEAR = 2005;
const CURRENT_YEAR = new Date().getFullYear();

const YEARS = Array.from(
  { length: CURRENT_YEAR - START_YEAR + 1 },
  (_, i) => String(START_YEAR + i)
);

const CHANNELS = ["ARENA", "NEXA"];
const SERVICECODES = ["PMS20", "PMS30", "PMS40", "PMS50", "MORE THAN PMS50"];

const BRANCHES = [
  "Balmatta",
  "Uppinangady",
  "Surathkal",
  "Sullia",
  "Adyar",
  "Sujith Bagh Lane", 
  "Naravi",
  "Bantwal",
  "Nexa",
  "Nexa Service",
  "Kadaba",
  "Vittla",
  "Yeyyadi BR"
];

const ALL_BRANCH = "ALL";

const BRANCH_COLORS = {
  ALL: "#000000",
  Balmatta: "#1f77b4",
  Uppinangady: "#ff7f0e",
  Surathkal: "#2ca02c",
  Sullia: "#d62728",
  Adyar: "#17becf",
  "Sujith Bagh Lane": "#bcbd22",
  Naravi: "#ff9896",
  Bantwal: "#9467bd",
  Nexa: "#8c564b",
  "Nexa Service": "#8c564b",
  Kadaba: "#e377c2",
  Vittla: "#7f7f7f",
  "Yeyyadi BR": "#98df8a",
};

const SERVICE_CODE_DELAYS = {
  "PMS20": 2,
  "PMS30": 3,
  "PMS40": 4,
  "PMS50": 5,
  "MORE THAN PMS50": 6
};

/* ---------------- COMPONENT ---------------- */
const SalesServiceeGrowthPage = () => {
  const navigate = useNavigate();

  const [yearFilter, setYearFilter] = useState([]);
  const [channelFilter, setChannelFilter] = useState([]);
  const [serviceCodesFilter, setServiceCodesFilter] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("ALL");
  const [salesRawData, setSalesRawData] = useState([]);
  const [serviceRawData, setServiceRawData] = useState([]);

  /* ================= GET SERVICE DELAY ================= */
  const getServiceDelay = () => {
    if (serviceCodesFilter.length === 0) return 0;
    const primaryServiceCode = serviceCodesFilter[0];
    return SERVICE_CODE_DELAYS[primaryServiceCode] || 0;
  };

  /* ================= GET SERVICE YEARS FROM SALES YEARS ================= */
  const getServiceYearsFromSalesYears = (salesYears) => {
    const delay = getServiceDelay();
    return salesYears.map(year => String(Number(year) + delay));
  };

  /* ================= DATA LOAD ================= */
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      const salesYearsToLoad = yearFilter.length ? yearFilter : YEARS;
      const serviceDelay = getServiceDelay();
      const serviceYearsToLoad = getServiceYearsFromSalesYears(salesYearsToLoad);
      
      // Load Sales Data (user-selected years)
      let salesMerged = [];
      for (const year of salesYearsToLoad) {
        const channelParams = channelFilter.length
          ? "&" + channelFilter.map((c) => `channels=${c}`).join("&")
          : "";
        try {
          const res = await fetchData(
            `/api/sales/sales_branch_summary?years=${year}${channelParams}`
          );
          if (Array.isArray(res)) {
            res.forEach((r) => {
              salesMerged.push({
                year,
                branch: r.branch,
                count: r.count,
                type: 'sales'
              });
            });
          }
        } catch (error) {
          console.error('Sales fetch error:', error);
        }
      }

      // Load Service Data (auto-calculated delayed years)
      let serviceMerged = [];
      for (const year of salesYearsToLoad) {
        const serviceYear = String(Number(year) + serviceDelay);
        const channelParams = channelFilter.length
          ? "&" + channelFilter.map((c) => `channels=${c}`).join("&")
          : "";
        const serviceCodesParams = serviceCodesFilter.length
          ? "&" + serviceCodesFilter.map((s) => `serviceCodes=${s}`).join("&")
          : "";
        
        try {
          const res = await fetchData(
            `/api/servicee/servicee_branch_summary?years=${serviceYear}${channelParams}${serviceCodesParams}`
          );
          if (Array.isArray(res)) {
            res.forEach((r) => {
              serviceMerged.push({
                baseYear: year,        // Original sales year
                serviceYear: serviceYear,
                branch: r.branch,
                serviceLoadd: r.serviceLoadd,
                type: 'service'
              });
            });
          }
        } catch (error) {
          console.error('Service fetch error:', error);
        }
      }

      if (isMounted) {
        setSalesRawData(salesMerged);
        setServiceRawData(serviceMerged);
      }
    };

    load();
    return () => { isMounted = false; };
  }, [yearFilter, channelFilter, serviceCodesFilter]);

  /* ================= COMBINED CHART DATA ================= */
  const combinedChartData = useMemo(() => {
    const serviceDelay = getServiceDelay();
    
    // Use filtered sales years only
    const baseYears = yearFilter.length > 0 ? yearFilter : YEARS.slice().reverse();
    const sortedBaseYears = baseYears.sort((a, b) => Number(a) - Number(b));

    const chartData = sortedBaseYears.map(baseYear => {
      const yearData = { 
        baseYear, 
        serviceYear: String(Number(baseYear) + serviceDelay)
      };

      if (selectedBranch === "ALL") {
        // ALL branch - aggregate all branches
        const salesForBaseYear = salesRawData
          .filter(d => d.year === baseYear)
          .reduce((sum, d) => sum + (d.count || 0), 0);
        
        const prevBaseYear = sortedBaseYears[sortedBaseYears.indexOf(baseYear) - 1];
        const prevSalesForYear = prevBaseYear ? salesRawData
          .filter(d => d.year === prevBaseYear)
          .reduce((sum, d) => sum + (d.count || 0), 0) : 0;
        
        yearData["ALL_sales"] = prevSalesForYear > 0 
          ? Number(((salesForBaseYear - prevSalesForYear) / prevSalesForYear) * 100).toFixed(2)
          : 0;

        // Service data for corresponding delayed year
        const serviceForYear = serviceRawData
          .filter(d => d.baseYear === baseYear)
          .reduce((sum, d) => sum + (d.serviceLoadd || 0), 0);
        
        const prevServiceBaseYear = sortedBaseYears[sortedBaseYears.indexOf(baseYear) - 1];
        const prevServiceForYear = prevServiceBaseYear ? serviceRawData
          .filter(d => d.baseYear === prevServiceBaseYear)
          .reduce((sum, d) => sum + (d.serviceLoadd || 0), 0) : 0;
        
        yearData["ALL_service"] = prevServiceForYear > 0
          ? Number(((serviceForYear - prevServiceForYear) / prevServiceForYear) * 100).toFixed(2)
          : 0;
      } else {
        // Specific branch
        const salesItem = salesRawData.find(d => d.year === baseYear && d.branch === selectedBranch);
        const prevBaseYear = sortedBaseYears[sortedBaseYears.indexOf(baseYear) - 1];
        const prevSalesItem = prevBaseYear ? salesRawData.find(d => d.year === prevBaseYear && d.branch === selectedBranch) : null;
        
        const salesGrowth = prevSalesItem && prevSalesItem.count > 0
          ? Number(((salesItem?.count || 0 - prevSalesItem.count) / prevSalesItem.count) * 100).toFixed(2)
          : 0;
        yearData[`${selectedBranch}_sales`] = salesGrowth;

        // Service data for corresponding delayed year
        const serviceItem = serviceRawData.find(d => d.baseYear === baseYear && d.branch === selectedBranch);
        const prevServiceBaseYear = sortedBaseYears[sortedBaseYears.indexOf(baseYear) - 1];
        const prevServiceItem = prevServiceBaseYear ? serviceRawData.find(d => d.baseYear === prevServiceBaseYear && d.branch === selectedBranch) : null;
        
        const serviceGrowth = prevServiceItem && prevServiceItem.serviceLoadd > 0
          ? Number(((serviceItem?.serviceLoadd || 0 - prevServiceItem.serviceLoadd) / prevServiceItem.serviceLoadd) * 100).toFixed(2)
          : 0;
        yearData[`${selectedBranch}_service`] = serviceGrowth;
      }

      return yearData;
    });

    return chartData;
  }, [salesRawData, serviceRawData, selectedBranch, yearFilter, serviceCodesFilter]);

  /* ================= TOOLTIP ================= */
  const CustomTooltip = ({ active, payload, label, payloadRaw }) => {
    if (!active || !payload?.length) return null;

    const serviceDelay = getServiceDelay();
    const baseYear = label;
    const serviceYear = payloadRaw?.[0]?.serviceYear || String(Number(baseYear) + serviceDelay);

    return (
      <Paper sx={{ p: 1.5 }}>
        <Typography variant="subtitle2">Sales Year: {baseYear}</Typography>
        <Typography variant="caption" color="text.secondary">
          Service Year: {serviceYear} ({serviceCodesFilter[0] || 'No Filter'})
        </Typography>
        {payload.map((p) => (
          <Box key={p.dataKey} sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
            <Typography variant="body2">
              {p.dataKey.replace(/_sales$/, ' Sales').replace(/_service$/, ' Service')}
            </Typography>
            <Typography
              variant="body2"
              fontWeight={600}
              color={p.value < 0 ? "error.main" : "success.main"}
            >
              {p.value}%
            </Typography>
          </Box>
        ))}
      </Paper>
    );
  };

  const slicerStyle = (selected) => ({
    borderRadius: 20,
    fontWeight: 600,
    textTransform: "none",
    px: 2,
    background: selected ? "#c8e6c9" : "#fff",
    border: "1px solid #9ccc65",
    "&:hover": { background: "#aed581" },
  });

  /* ---------------- RENDER ---------------- */
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">SALES & SERVICE GROWTH % (YEAR VS BRANCH)</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained">Sales & Service Growth</Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
        {/* CURRENT FILTER INFO */}
        <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Service Delay: {getServiceDelay()} years | 
            Sales Years: {yearFilter.length > 0 ? yearFilter.join(', ') : 'ALL'} | 
            Service Years: {getServiceYearsFromSalesYears(yearFilter.length > 0 ? yearFilter : [CURRENT_YEAR]).join(', ')} | 
            Active Filter: {serviceCodesFilter[0] || 'None'}
          </Typography>
        </Box>

        {/* YEAR FILTER (Controls Sales Years) */}
        <Box sx={{ my: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Sales Years (Service years auto-calculated):
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {YEARS.map((y) => (
              <Button
                key={y}
                size="small"
                sx={slicerStyle(yearFilter.includes(y))}
                onClick={() =>
                  setYearFilter((p) =>
                    p.includes(y) ? p.filter((x) => x !== y) : [...p, y]
                  )
                }
              >
                {y}
              </Button>
            ))}
          </Box>
        </Box>

        {/* CHANNEL FILTER */}
        <Box sx={{ my: 2, display: "flex", gap: 1 }}>
          {CHANNELS.map((c) => (
            <Button
              key={c}
              size="small"
              sx={slicerStyle(channelFilter.includes(c))}
              onClick={() =>
                setChannelFilter((p) =>
                  p.includes(c) ? p.filter((x) => x !== c) : [...p, c]
                )
              }
            >
              {c}
            </Button>
          ))}
        </Box>

        {/* SERVICE CODES FILTER (Single Selection) */}
        <Box sx={{ my: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Service Delay:
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {SERVICECODES.map((s) => (
              <Button
                key={s}
                size="small"
                sx={slicerStyle(serviceCodesFilter.includes(s))}
                onClick={() =>
                  setServiceCodesFilter((p) =>
                    p.includes(s) ? [] : [s] // Single selection only
                  )
                }
              >
                {s} ({SERVICE_CODE_DELAYS[s]}yr)
              </Button>
            ))}
          </Box>
        </Box>

        {/* BRANCH RADIO BUTTON FILTER */}
        <Box sx={{ my: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
            Select Branch:
          </Typography>
          <RadioGroup
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            row
            sx={{ 
              flexWrap: "wrap", 
              gap: 1,
              '& .MuiFormControlLabel-root': {
                marginRight: 0.5,
                marginBottom: 0.5,
                whiteSpace: 'nowrap'
              }
            }}
          >
            <FormControlLabel value="ALL" control={<Radio />} label="ALL" />
            {BRANCHES.map((branch) => (
              <FormControlLabel 
                key={branch} 
                value={branch} 
                control={<Radio />} 
                label={branch} 
              />
            ))}
          </RadioGroup>
        </Box>

        {/* COMBINED LINE CHART */}
        <Box sx={{ my: 3 }}>
          <Typography variant="h6" sx={{ mb: 3, textAlign: 'center' }}>
            LINE CHART - {selectedBranch} | {combinedChartData.length} years
          </Typography>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={combinedChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="baseYear" name="Sales Year" />
              <YAxis unit="%" />
              <Tooltip content={<CustomTooltip />} />
              {selectedBranch === "ALL" ? (
                <>
                  <Line dataKey="ALL_sales" stroke="#1f77b4" strokeWidth={4} name="ALL Sales" connectNulls>
                    <LabelList formatter={(v) => `${v}%`} dataKey="ALL_sales" position="top" />
                  </Line>
                  <Line dataKey="ALL_service" stroke="#ff7f0e" strokeWidth={4} name="ALL Service" connectNulls>
                    <LabelList formatter={(v) => `${v}%`} dataKey="ALL_service" position="top" />
                  </Line>
                </>
              ) : (
                <>
                  <Line
                    dataKey={`${selectedBranch}_sales`}
                    stroke={BRANCH_COLORS[selectedBranch] || "#1f77b4"}
                    strokeWidth={3}
                    name={`${selectedBranch} Sales`}
                    connectNulls
                  >
                    <LabelList formatter={(v) => `${v}%`} dataKey={`${selectedBranch}_sales`} position="top" />
                  </Line>
                  <Line dataKey={`${selectedBranch}_service`} stroke="#ff7f0e" strokeWidth={3} name={`${selectedBranch} Service`} connectNulls>
                    <LabelList formatter={(v) => `${v}%`} dataKey={`${selectedBranch}_service`} position="top" />
                  </Line>
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </Box>

        {/* COMBINED BAR CHART */}
        <Box sx={{ my: 3 }}>
          <Typography variant="h6" sx={{ mb: 3, textAlign: 'center' }}>
            BAR CHART - {selectedBranch} | {combinedChartData.length} years
          </Typography>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={combinedChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="baseYear" name="Sales Year" />
              <YAxis unit="%" />
              <Tooltip content={<CustomTooltip />} />
              {selectedBranch === "ALL" ? (
                <>
                  <Bar dataKey="ALL_sales" fill="#1f77b4" name="ALL Sales" barSize={20}>
                    <LabelList formatter={(v) => `${v}%`} dataKey="ALL_sales" position="top" />
                  </Bar>
                  <Bar dataKey="ALL_service" fill="#ff7f0e" name="ALL Service" barSize={20}>
                    <LabelList formatter={(v) => `${v}%`} dataKey="ALL_service" position="top" />
                  </Bar>
                </>
              ) : (
                <>
                  <Bar
                    dataKey={`${selectedBranch}_sales`}
                    fill={BRANCH_COLORS[selectedBranch] || "#1f77b4"}
                    name={`${selectedBranch} Sales`}
                    barSize={16}
                  >
                    <LabelList formatter={(v) => `${v}%`} dataKey={`${selectedBranch}_sales`} position="top" />
                  </Bar>
                  <Bar dataKey={`${selectedBranch}_service`} fill="#ff7f0e" name={`${selectedBranch} Service`} barSize={16}>
                    <LabelList formatter={(v) => `${v}%`} dataKey={`${selectedBranch}_service`} position="top" />
                  </Bar>
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Paper>
    </Box>
  );
};

export default SalesServiceeGrowthPage;
