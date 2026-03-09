// ProfitLossChart.jsx - PERFECTLY MATCHES WORKING CODE
import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { Box, Typography, Button, FormControl, Select, MenuItem, Checkbox, ListItemText, InputLabel, ListSubheader } from '@mui/material';
import { fetchData } from '../../api/uploadService'; 
import { useNavigate } from 'react-router-dom';

const BRANCH_ORDER = [
  'ns palya','sarjapura','basaveshwarnagar','kolar nexa','gowribidanur','hennur','jp nagar',
  'kolar','basavanagudi-sow','basavangudi','malur sow','maluru ws','uttarahali kengeri',
  'vidyarannapura','vijayanagar','wilson garden','yelahanka','yeshwanthpur ws','bannur',
  'chamrajnagar','hunsur road','maddur','gonikoppa','mandya','krs road','kushalnagar',
  'krishnarajapet','mysore nexa','nagamangala','somvarpet','narasipura','kollegal',
  'mandya nexa','balmatta','bantwal','vittla','kadaba','uppinangady','surathkal',
  'sullia','adyar','yeyyadi br','nexa service','sujith bagh lane','naravi'
];

const GROUPS = [
  { label: 'Bangalore', list: ['ns palya','sarjapura','basaveshwarnagar','kolar nexa','gowribidanur','hennur','jp nagar','kolar','basavanagudi-sow','basavangudi','malur sow','maluru ws','uttarahali kengeri','vidyarannapura','vijayanagar','wilson garden','yelahanka','yeshwanthpur ws'] },
  { label: 'Mysore', list: ['bannur','chamrajnagar','hunsur road','maddur','gonikoppa','mandya','krs road','kushalnagar','krishnarajapet','mysore nexa','nagamangala','somvarpet','narasipura','kollegal','mandya nexa'] },
  { label: 'Mangalore', list: ['balmatta','bantwal','vittla','kadaba','uppinangady','surathkal','sullia','adyar','yeyyadi br','nexa service','sujith bagh lane','naravi'] }
];

const normalize = (s) => (s ? String(s).toLowerCase().trim() : "");
const titleCase = (s) => String(s).split(/[\s-_]+/).map(w => (w ? w[0].toUpperCase() + w.slice(1) : w)).join(" ");
const sanitizeId = (s) => String(s).replace(/[^a-z0-9_-]/gi, "_");

const ProfitLossChart = ({ 
  type, 
  groupBy, 
  timeline, 
  apiEndpoint, 
  formatFn = (v) => Number(v)?.toFixed(2) || '', 
  isPerVehicle = false 
}) => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState([]);
  const [groupList, setGroupList] = useState([]);
  const [availableOriginalNames, setAvailableOriginalNames] = useState({});
  const [selectedGroups, setSelectedGroups] = useState([]);

  // ✅ EXACT SAME API CALL AS WORKING CODE
  useEffect(() => {
    const load = async () => {
      try {
        const allGroupNames = new Set();
        const final = [];

        for (const t of timeline) {
          // ✅ FIXED: Exact query format from working code
          const query = `?groupBy=${groupBy}&months=${t.month}`;
          const data = await fetchData(`${apiEndpoint}${query}`);
          
          final.push({
            monthLabel: t.label,
            key: t.key,
            data: data || [],
          });

          data?.forEach((r) => {
            if (r[groupBy]) allGroupNames.add(r[groupBy]);
          });
        }

        setSummary(final);

        if (groupBy === 'branch') {
          const normMap = {};
          Array.from(allGroupNames).forEach((orig) => {
            const n = normalize(orig);
            if (!normMap[n]) normMap[n] = orig;
          });

          const sorted = Object.keys(normMap).sort((a, b) => {
            const ia = BRANCH_ORDER.indexOf(a);
            const ib = BRANCH_ORDER.indexOf(b);
            if (ia === -1 && ib === -1) return a.localeCompare(b);
            if (ia === -1) return 1;
            if (ib === -1) return -1;
            return ia - ib;
          });

          setAvailableOriginalNames(normMap);
          setGroupList(sorted);
          if (!sorted.includes(normalize("Adyar")) && sorted.length > 0) {
            setSelectedGroups([sorted[0]]);
          }
        } else {
          setGroupList(Array.from(allGroupNames));
        }
      } catch (err) {
        console.error("API error:", err);
      }
    };
    load();
  }, [groupBy, timeline, apiEndpoint]);

  // ✅ EXACT SAME chartData logic
  const chartData = summary.map((block) => {
    const row = { month: block.monthLabel };
    const useBranches = groupBy === 'branch' ? selectedGroups : groupList;
    
    useBranches.forEach((branchNorm) => (row[branchNorm] = 0));
    block.data.forEach((item) => {
      if (!item[groupBy]) return;
      const norm = normalize(item[groupBy]);
      row[norm] = item[block.key] ?? 0;
    });
    return row;
  });

  const renderDisplayName = (norm) => availableOriginalNames[norm] || titleCase(norm);

  // ✅ EXACT SAME branch selector logic
  const groups = GROUPS;
  const groupAvailable = (group) => group.filter((b) => groupList.includes(normalize(b)));
  const isGroupSelected = (groupNorms) => groupNorms.every((g) => selectedGroups.includes(g));
  const isAnyGroupSelected = (groupNorms) => groupNorms.some((g) => selectedGroups.includes(g));

  const toggleGroup = (groupNorms) => {
    const allSelected = isGroupSelected(groupNorms);
    if (allSelected) {
      setSelectedGroups((prev) => prev.filter((p) => !groupNorms.includes(p)));
    } else {
      setSelectedGroups((prev) => {
        const set = new Set(prev);
        groupNorms.forEach((g) => set.add(g));
        return Array.from(set);
      });
    }
  };

  const handleIndividualToggle = (norm) => {
    setSelectedGroups((prev) =>
      prev.includes(norm) ? prev.filter((p) => p !== norm) : [...prev, norm]
    );
  };

  const titleMap = {
    cityMonthly: 'PROFIT LOSS Monthly Graph CityWise',
    branchMonthly: 'PROFIT LOSS Monthly Graph BranchWise',
    cityPerVehicle: 'PROFIT LOSS PerVehicle Graph CityWise',
    branchPerVehicle: 'PROFIT LOSS PerVehicle Graph BranchWise',
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">{titleMap[type]}</Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/profit_loss_monthly")}>P&L Monthly Graph(CityWise)</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/profit_loss_branches")}>P&L Monthly Graph(BranchWise)</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/profit_loss_per_vehicle")}>P&L PerVehicle Graph(CityWise)</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/profit_loss_per_vehicle_branch")}>P&L PerVehicle Graph(BranchWise)</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/profit_loss_table")}>P&L Table</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/profit_loss_srbr_table")}>SR&BR Table</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/profit_loss-bar-chart")}>Bar Chart-CityWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/profit_loss_branches-bar-chart")}>Bar Chart-BranchWise</Button>
        </Box>
      </Box>

      {/* ✅ EXACT SAME BRANCH SELECTOR */}
      {groupBy === 'branch' && (
        <Box sx={{ mb: 2, width: 360 }}>
          <FormControl fullWidth>
            <InputLabel>Select Branches</InputLabel>
            <Select
              multiple
              value={selectedGroups}
              onChange={(e) => setSelectedGroups(e.target.value)}
              renderValue={(selected) => selected.map(renderDisplayName).join(", ")}
              MenuProps={{ PaperProps: { style: { maxHeight: 400 } } }}
            >
              {groups.map((g) => {
                const available = groupAvailable(g.list).map(normalize);
                if (available.length === 0) return null;
                const groupAllSelected = isGroupSelected(available);
                const groupAnySelected = isAnyGroupSelected(available);
                return (
                  <Box key={g.label}>
                    <ListSubheader sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>{g.label}</span>
                      <MenuItem onClick={(ev) => { ev.stopPropagation(); toggleGroup(available); }} sx={{ ml: 1 }}>
                        <Checkbox checked={groupAllSelected} indeterminate={!groupAllSelected && groupAnySelected} />
                        <ListItemText primary="Select All" />
                      </MenuItem>
                    </ListSubheader>
                    {available.map((norm) => (
                      <MenuItem key={norm} value={norm} onClick={(ev) => { ev.stopPropagation(); handleIndividualToggle(norm); }}>
                        <Checkbox checked={selectedGroups.includes(norm)} />
                        <ListItemText primary={renderDisplayName(norm)} />
                      </MenuItem>
                    ))}
                  </Box>
                );
              })}
            </Select>
          </FormControl>
        </Box>
      )}

      {/* ✅ EXACT SAME CHART JSX */}
      <Box sx={{ width: "100%", height: "65vh", minHeight: 500, background: "#fff", borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", p: 2 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 50, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={formatFn} domain={[0, 45]} />
            <Tooltip
              content={({ payload, label }) => {
                if (!payload || payload.length === 0) return null;
                const enriched = payload.map((p) => ({ ...p, displayName: renderDisplayName(p.dataKey || p.name) }));
                const sorted = [...enriched].sort((a, b) => (b.value || 0) - (a.value || 0));
                return (
                  <Box sx={{ p: 1, bgcolor: "white", borderRadius: 1, boxShadow: 2 }}>
                    <Typography sx={{ fontWeight: "bold", mb: 1 }}>{label}</Typography>
                    {sorted.map((item) => (
                      <Typography key={item.dataKey} sx={{ display: "flex", justifyContent: "space-between" }}>
                        <span>{item.displayName}</span>
                        <strong>{formatFn(item.value)}</strong>
                      </Typography>
                    ))}
                  </Box>
                );
              }}
            />
            <defs>
              {groupList.map((branchNorm, idx) => {
                const hue = (idx * 60) % 360;
                const id = `glow-${sanitizeId(branchNorm)}`;
                return (
                  <linearGradient id={id} key={id} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={`hsl(${hue}, 100%, 70%)`} />
                    <stop offset="50%" stopColor={`hsl(${hue}, 100%, 55%)`} />
                    <stop offset="100%" stopColor={`hsl(${hue}, 100%, 40%)`} />
                  </linearGradient>
                );
              })}
            </defs>
            {(groupBy === 'branch' ? selectedGroups : groupList).map((branchNorm) => {
              const index = groupList.indexOf(branchNorm);
              if (index === -1) return null;
              const hue = (index * 60) % 360;
              const gradId = `glow-${sanitizeId(branchNorm)}`;
              return (
                <Line
                  key={branchNorm}
                  dataKey={branchNorm}
                  name={renderDisplayName(branchNorm)}
                  type="monotone"
                  stroke={`url(#${gradId})`}
                  strokeWidth={4}
                  dot={{ r: 5, fill: `hsl(${hue}, 100%, 65%)`, stroke: "#fff", strokeWidth: 1.5 }}
                  activeDot={{ r: 7, fill: `hsl(${hue}, 100%, 75%)`, stroke: "#fff", strokeWidth: 2 }}
                >
                  <LabelList
                    dataKey={branchNorm}
                    position="top"
                    fontSize={12}
                    formatter={formatFn}
                    style={{ paintOrder: "stroke", stroke: "white", strokeWidth: 1 }}
                  />
                </Line>
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default ProfitLossChart;
