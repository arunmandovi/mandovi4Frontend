import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import {
  Box,
  Typography,
  Button,
  FormControl,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  InputLabel,
  ListSubheader,
} from "@mui/material";
import { fetchData } from "../../api/uploadService";
import { useNavigate } from "react-router-dom";

const timeline = [
  { label: "SR&BR Apr 25", key: "apr25_per_100k", month: "Apr" },
  { label: "SR&BR May 25", key: "may25_per_100k", month: "May" },
  { label: "SR&BR Apr 25", key: "jun25_per_100k", month: "Jun" },
  { label: "SR&BR Apr 25", key: "jul25_per_100k", month: "Jul" },
  { label: "SR&BR Aug 25", key: "aug25_per_100k", month: "Aug" },
  { label: "SR&BR Sep 25", key: "sep25_per_100k", month: "Sep" },
  { label: "SR&BR Apr 25", key: "total25_per_100k", month: "Total" },
];

const BRANCH_ORDER = [
  "ns palya","sarjapura","basaveshwarnagar","kolar nexa","gowribidanur","hennur",
  "jp nagar","kolar","basavanagudi-sow","basavangudi","malur sow","maluru ws",
  "uttarahali kengeri","vidyarannapura","vijayanagar","wilson garden","yelahanka",
  "yeshwanthpur ws","bannur","chamrajnagar","hunsur road","maddur","gonikoppa",
  "mandya","krs road","kushalnagar","krishnarajapet","mysore nexa","nagamangala",
  "somvarpet","narasipura","kollegal","balmatta","bantwal","vittla","kadaba",
  "uppinangady","surathkal","sullia","adyar","yeyyadi br","nexa service",
  "sujith bagh lane","naravi",
];

const BangaloreBranches = [
  "ns palya", "sarjapura", "basaveshwarnagar", "kolar nexa", "gowribidanur", "hennur",
  "jp nagar", "kolar", "basavanagudi-sow", "basavangudi", "malur sow", "maluru ws",
  "uttarahali kengeri", "vidyarannapura", "vijayanagar", "wilson garden", "yelahanka","yeshwanthpur ws",
];

const MysoreBranches = [
  "bannur", "chamrajnagar","hunsur road", "maddur", "gonikoppa", "mandya", "krs road", "kushalnagar",
  "krishnarajapet", "mysore nexa","nagamangala", "somvarpet", "narasipura", "kollegal",
];

const MangaloreBranches = [
  "balmatta", "bantwal", "vittla", "kadaba", "uppinangady", "surathkal", "sullia",
  "adyar", "yeyyadi br", "nexa service", "sujith bagh lane", "naravi",
];

/* Utility helpers */
const normalize = (s) => (s ? String(s).toLowerCase().trim() : "");
const titleCase = (s) =>
  String(s)
    .split(/[\s-_]+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");

const sanitizeId = (s) => String(s).replace(/[^a-z0-9_-]/gi, "_");

export default function ProfitLossPerVehicleBranchWisePage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState([]);
  const [branchListNormalized, setBranchListNormalized] = useState([]); 
  const [availableOriginalNames, setAvailableOriginalNames] = useState({}); 
  const [selectedBranches, setSelectedBranches] = useState(
    ["Adyar", "wilson garden", "KRS Road"].map(normalize)
  );

  useEffect(() => {
    const load = async () => {
      try {
        const allBranchNames = new Set(); 
        const final = [];

        for (const t of timeline) {
          const query = `?groupBy=branch&months=${t.month}`;
          const data = await fetchData(
            `/api/profit_loss/profit_loss_branch_summary${query}`
          );

          final.push({
            monthLabel: t.label,
            key: t.key,
            data: data || [],
          });

          data?.forEach((r) => {
            if (r.branch) allBranchNames.add(r.branch);
          });
        }

        const branchesOriginal = Array.from(allBranchNames);

        const normMap = {};
        branchesOriginal.forEach((orig) => {
          const n = normalize(orig);
          if (!normMap[n]) normMap[n] = orig;
        });

        const branchNorms = Object.keys(normMap);

        const sorted = branchNorms.sort((a, b) => {
          const ia = BRANCH_ORDER.indexOf(a);
          const ib = BRANCH_ORDER.indexOf(b);
          if (ia === -1 && ib === -1) return a.localeCompare(b);
          if (ia === -1) return 1;
          if (ib === -1) return -1;
          return ia - ib;
        });

        setAvailableOriginalNames(normMap);
        setBranchListNormalized(sorted);

        if (!sorted.includes(normalize("Adyar")) && sorted.length > 0) {
          setSelectedBranches([sorted[0]]);
        }

        setSummary(final);
      } catch (err) {
        console.error("API error:", err);
      }
    };

    load();
  }, []);

  const chartData = summary.map((block) => {
    const row = { month: block.monthLabel };

    branchListNormalized.forEach((branchNorm) => (row[branchNorm] = 0));

    block.data.forEach((item) => {
      if (!item.branch) return;
      const norm = normalize(item.branch);
      row[norm] = item[block.key] ?? 0;
    });

    return row;
  });

  const formatTwoDecimals = (value) => {
    if (value == null || isNaN(value)) return value;
    return Number(value).toFixed(2);
  };

  const groups = [
    { label: "Bangalore", list: BangaloreBranches },
    { label: "Mysore", list: MysoreBranches },
    { label: "Mangalore", list: MangaloreBranches },
  ];

  const groupAvailable = (group) =>
    group.filter((b) => branchListNormalized.includes(normalize(b)));

  const isGroupSelected = (groupNorms) =>
    groupNorms.every((g) => selectedBranches.includes(g));

  const isAnyGroupSelected = (groupNorms) =>
    groupNorms.some((g) => selectedBranches.includes(g));

  const toggleGroup = (groupNorms) => {
    const allSelected = isGroupSelected(groupNorms);
    if (allSelected) {
      setSelectedBranches((prev) => prev.filter((p) => !groupNorms.includes(p)));
    } else {
      setSelectedBranches((prev) => {
        const set = new Set(prev);
        groupNorms.forEach((g) => set.add(g));
        return Array.from(set);
      });
    }
  };

  const handleIndividualToggle = (norm) => {
    setSelectedBranches((prev) =>
      prev.includes(norm) ? prev.filter((p) => p !== norm) : [...prev, norm]
    );
  };

  const renderDisplayName = (norm) => {
    return availableOriginalNames[norm] || titleCase(norm);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">PROFIT & LOSS Monthly Graph(BranchWise)</Typography>

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/profit_loss_monthly")}>P&L Monthly Graph(CityWise)</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/profit_loss_branches")}>P&L Monthly Graph(BranchWise)</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/profit_loss_per_vehicle")}>P&L PerVehicle Graph(CityWise)</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/profit_loss_per_vehicle_branch")}>P&L PerVehicle Graph(BranchWise)</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/profit_loss")}>P&L Table</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/profit_loss_srbr")}>SR&BR Table</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/profit_loss-bar-chart")}>Bar Chart-CityWise</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/profit_loss_branches-bar-chart")}>Bar Chart-BranchWise</Button>
        </Box>
      </Box>

      <Box sx={{ mb: 2, width: 360 }}>
        <FormControl fullWidth>
          <InputLabel>Select Branches</InputLabel>

          <Select
            multiple
            value={selectedBranches}
            onChange={(e) => setSelectedBranches(e.target.value)}
            renderValue={(selected) => {
              return selected.map((s) => renderDisplayName(s)).join(", ");
            }}
            MenuProps={{
              PaperProps: { style: { maxHeight: 400 } },
            }}
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
                    <MenuItem
                      onClick={(ev) => {
                        ev.stopPropagation();
                        toggleGroup(available);
                      }}
                      sx={{ ml: 1 }}
                    >
                      <Checkbox checked={groupAllSelected} indeterminate={!groupAllSelected && groupAnySelected} />
                      <ListItemText primary="Select All" />
                    </MenuItem>
                  </ListSubheader>

                  {available.map((norm) => (
                    <MenuItem
                      key={norm}
                      value={norm}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        handleIndividualToggle(norm);
                      }}
                    >
                      <Checkbox checked={selectedBranches.includes(norm)} />
                      <ListItemText primary={renderDisplayName(norm)} />
                    </MenuItem>
                  ))}
                </Box>
              );
            })}

            {(() => {
              const grouped = new Set([
                ...BangaloreBranches.map(normalize),
                ...MysoreBranches.map(normalize),
                ...MangaloreBranches.map(normalize),
              ]);
              const others = branchListNormalized.filter((b) => !grouped.has(b));
              if (others.length === 0) return null;
              return (
                <Box key="others">
                  <ListSubheader>Others</ListSubheader>
                  {others.map((norm) => (
                    <MenuItem
                      key={norm}
                      value={norm}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        handleIndividualToggle(norm);
                      }}
                    >
                      <Checkbox checked={selectedBranches.includes(norm)} />
                      <ListItemText primary={renderDisplayName(norm)} />
                    </MenuItem>
                  ))}
                </Box>
              );
            })()}
          </Select>
        </FormControl>
      </Box>

      <Box
        sx={{
          width: "100%",
          height: "65vh",
          minHeight: 500, 
          background: "#fff",
          borderRadius: 2,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          p: 2,
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 50, left: 10, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(v) => formatTwoDecimals(v)} 
              domain={[0, 45]}
              />

            <Tooltip
              content={({ payload, label }) => {
                if (!payload || payload.length === 0) return null;

                const enriched = payload.map((p) => ({
                  ...p,
                  displayName: renderDisplayName(p.dataKey || p.name || p.unit || ""),
                }));

                const sorted = [...enriched].sort((a, b) => (b.value || 0) - (a.value || 0));

                return (
                  <Box sx={{ p: 1, bgcolor: "white", borderRadius: 1, boxShadow: 2 }}>
                    <Typography sx={{ fontWeight: "bold", mb: 1 }}>{label}</Typography>

                    {sorted.map((item) => (
                      <Typography
                        key={item.dataKey || item.name}
                        sx={{ display: "flex", justifyContent: "space-between" }}
                      >
                        <span>{item.displayName}</span>
                        <strong>{formatTwoDecimals(item.value)}</strong>
                      </Typography>
                    ))}
                  </Box>
                );
              }}
            />

            <defs>
              {branchListNormalized.map((branchNorm, idx) => {
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

            {/* Render lines ONLY for selected branches */}
            {selectedBranches.map((branchNorm) => {
              const index = branchListNormalized.indexOf(branchNorm);
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
                  dot={{
                    r: 5,
                    fill: `hsl(${hue}, 100%, 65%)`,
                    stroke: "#fff",
                    strokeWidth: 1.5,
                  }}
                  activeDot={{
                    r: 7,
                    fill: `hsl(${hue}, 100%, 75%)`,
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                >
                  <LabelList
                    dataKey={branchNorm}
                    position="top"
                    fontSize={12}
                    formatter={(v) => formatTwoDecimals(v)}
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
}
