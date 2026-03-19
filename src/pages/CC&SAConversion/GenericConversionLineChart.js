import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Button,
  Typography,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { 
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowUp as ArrowUpIcon,
  Close as CloseIcon,
  Edit as EditIcon
} from "@mui/icons-material";
import { fetchData } from "../../api/uploadService";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  LabelList,  // ✅ ADDED for data labels
} from "recharts";

const MONTHS = [
  "APR","MAY","JUN","JUL","AUG","SEP",
  "OCT","NOV","DEC","JAN","FEB","MAR"
];

const BRANCHES = [
  "BALMATTA","SURATHKAL","ADYAR","BANTWAL","KADABA","VITTLA","SUJITH BAGH",
  "NEXA","NARAVI"
];

const BRANCH_COLORS = {
  BALMATTA: "#1f77b4",
  SURATHKAL: "#ff7f0e", 
  ADYAR: "#2ca02c",
  SULLIA: "#d62728",
  UPPINANGADY: "#9467bd",
  YEYYADI: "#8c564b",
  BANTWAL: "#e377c2",
  KADABA: "#7f7f7f",
  VITTLA: "#bcbd22",
  "SUJITH BAGH": "#17becf",
  NEXA: "#4e79a7",
  NARAVI: "#f28e2b",
  ALL: "#2e7d32",
  APPT: "#1976d2",
  CONV: "#d32f2f",
};

const MONTH_COLORS = {
  APR: "#1f77b4", MAY: "#ff7f0e", JUN: "#2ca02c", JUL: "#d62728",
  AUG: "#9467bd", SEP: "#8c564b", OCT: "#e377c2", NOV: "#7f7f7f",
  DEC: "#bcbd22", JAN: "#17becf", FEB: "#4e79a7", MAR: "#f28e2b",
  ALL: "#2e7d32", APPT: "#1976d2", CONV: "#d32f2f",
};

const CCE_STATUS_COLORS = {
  PSF: "#400dce",
  SMR: "#000000",
  NO_EXPERIENCE: "#d32f2f",
  NORMAL: "#000000"
};

const GROWTH_OPTIONS = ["PMS %", "Appointment", "Conversion", "A&C"];

const growthKeyMap = {
  "PMS %": "percentagePMS",
  "Appointment": "pmsAppointment",
  "Conversion": "pmsConversion",
};

const HIGHLIGHTED_CCE = [
  { branchName: "ADYAR", cceName: "KUSUMA" },
  { branchName: "ADYAR", cceName: "GAYATHRI" },
  { branchName: "ADYAR", cceName: "PRAPTHI" },
  { branchName: "BALMATTA", cceName: "RASHMITHA" },
  { branchName: "BALMATTA", cceName: "GAYATHRI" },
  { branchName: "BALMATTA", cceName: "RESHMA" },
  { branchName: "BANTWAL", cceName: "RAKSHA" },
  { branchName: "NARAVI", cceName: "RASHMI" },
  { branchName: "NEXA", cceName: "THEJASWINI" },
  { branchName: "SULLIA", cceName: "SHILPA" },
  { branchName: "SUJITH BAGH", cceName: "KAVYA" },
  { branchName: "SULLIA", cceName: "RANJITHA" },
  { branchName: "SULLIA", cceName: "SHUKALATHA" },
  { branchName: "SURATHKAL", cceName: "KRITHIKA" },
  { branchName: "SURATHKAL", cceName: "SHREE RAKSHA" },
  { branchName: "UPPINANGADY", cceName: "SHRADHA" },
  { branchName: "YEYYADI", cceName: "KAVYA" },
];

const GenericConversionLineChart = ({ type = "sa" }) => {
  const navigate = useNavigate();
  
  const isSA = type === "sa";
  const isCC = type === "cc";
  const titlePrefix = isSA ? "SA" : "CC";
  const personKey = isSA ? "saName" : "cceName";
  const personParam = isSA ? "saNames" : "cceNames";
  const apiPrefix = isSA ? "/api/sa" : "/api/cc";
  const barRoute = isSA ? "/DashboardHome/sa_conversion" : "/DashboardHome/cc_conversion";
  const tableRoute = isSA ? "/DashboardHome/sa_conversion_table" : "/DashboardHome/cc_conversion_table";

  const [sortByExp, setSortByExp] = useState(false);
  const [expSortAsc, setExpSortAsc] = useState(false);
  const [filterMode, setFilterMode] = useState("ALL");
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [allSelected, setAllSelected] = useState(true);
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [selectedPersons, setSelectedPersons] = useState([]);
  const [selectedGrowth, setSelectedGrowth] = useState("PMS %");
  const [summary, setSummary] = useState([]);
  const [personKeys, setPersonKeys] = useState([]);
  const [branchPersonMap, setBranchPersonMap] = useState({});

  const normalize = v => v?.trim().toUpperCase() || "";
  const isPercentage = selectedGrowth === "PMS %";
  const isAC = selectedGrowth === "A&C";
  const isAllMonthsSelected = allSelected || !selectedMonths.length;

  const getFilteredPersonKeys = useMemo(() => {
    if (!isCC || filterMode === "ALL") return personKeys;
    
    return personKeys.filter(person => {
      if (filterMode === "PSF") {
        return HIGHLIGHTED_CCE.some(highlight => 
          normalize(person).includes(normalize(highlight.cceName))
        );
      } else if (filterMode === "SMR") {
        return !HIGHLIGHTED_CCE.some(highlight => 
          normalize(person).includes(normalize(highlight.cceName))
        );
      }
      return true;
    });
  }, [personKeys, filterMode, isCC]);

  const personBranchMap = useMemo(() => {
    const map = {};
    Object.entries(branchPersonMap).forEach(([branch, persons]) => {
      persons.forEach(person => {
        map[normalize(person)] = normalize(branch);
      });
    });
    return map;
  }, [branchPersonMap]);

  useEffect(() => {
    const loadMasterData = async () => {
      const res = await fetchData(`${apiPrefix}/${type}_conversion_summary`);
      const rows = Array.isArray(res) ? res : [];
      const map = {};
      rows.forEach(r => {
        const b = normalize(r.branch);
        const p = normalize(r[personKey]);
        if (!map[b]) map[b] = new Set();
        map[b].add(p);
      });
      const normalized = {};
      Object.keys(map).forEach(b => normalized[b] = [...map[b]]);
      setBranchPersonMap(normalized);
    };
    loadMasterData();
  }, [apiPrefix, type, personKey]);

  const dropdownPersons = useMemo(() => {
    if (!selectedBranches.length) {
      return [...new Set(Object.values(branchPersonMap).flat())];
    }
    const set = new Set();
    selectedBranches.forEach(b =>
      branchPersonMap[normalize(b)]?.forEach(p => set.add(p))
    );
    return [...set];
  }, [selectedBranches, branchPersonMap]);

  const allPersonSelected =
    dropdownPersons.length > 0 &&
    selectedPersons.length === dropdownPersons.length;

  useEffect(() => {
    setSelectedPersons(prev => prev.filter(p => dropdownPersons.includes(p)));
  }, [dropdownPersons]);

  useEffect(() => {
    const loadData = async () => {
      const monthsToFetch = allSelected || !selectedMonths.length ? MONTHS : selectedMonths;
      const allData = [];
      const personSet = new Set();

      for (const month of monthsToFetch) {
        const query = `?months=${month}` +
         (selectedBranches.length ? `&branches=${selectedBranches.join(",")}` : "") +
         (selectedPersons.length ? `&${personParam}=${selectedPersons.join(",")}` : "");
        const res = await fetchData(`${apiPrefix}/${type}_conversion_summary${query}`);
        const rows = Array.isArray(res) ? res : [];
        rows.forEach(r => personSet.add(normalize(r[personKey])));
        allData.push({ month, data: rows });
      }
      setSummary(allData);
      setPersonKeys([...personSet]);
    };
    loadData();
  }, [selectedMonths, allSelected, selectedBranches, selectedPersons, apiPrefix, type, personKey, personParam]);

  const chartData = useMemo(() => {
    const rows = getFilteredPersonKeys.map(person => {
      let actualBranch = 'UNKNOWN';
      let experienceDays = null;
      
      for (const { data } of summary) {
        const matchingRow = data.find(d => normalize(d[personKey]) === normalize(person));
        if (matchingRow) {
          actualBranch = normalize(matchingRow.branch);
          if (isCC) experienceDays = matchingRow.experienceDays;
          break;
        }
      }

      if (selectedBranches.length > 0) {
        const normalizedSelected = selectedBranches.map(normalize);
        if (!normalizedSelected.includes(actualBranch)) return null;
      }

      const hasNoExperience = isCC && (experienceDays === null || experienceDays === undefined);
      const isHighlightedCCE = isCC && HIGHLIGHTED_CCE.some(highlight => 
        normalize(person).includes(normalize(highlight.cceName))
      );

      let cceStatus = 'NORMAL';
      if (isCC) {
        if (hasNoExperience) cceStatus = 'NO_EXPERIENCE';
        else if (isHighlightedCCE) cceStatus = 'PSF';
        else cceStatus = 'SMR';
      }

      const displayName = isCC && experienceDays != null
        ? `${person} (${Math.round(experienceDays)})`
        : person;

      const row = {
        person: displayName,
        originalPerson: person,
        branch: actualBranch,
        experienceDays,
        hasNoExperience,
        isHighlightedCCE,
        cceStatus,
        ALL_PMS_RAW: 0
      };

      let totalPMS = 0, totalAppt = 0, totalConv = 0, validMonths = 0;

      summary.forEach(({ data }) => {
        const r = data.find(d => normalize(d[personKey]) === normalize(person));
        if (r) {
          totalPMS += Number(r?.percentagePMS ?? 0);
          totalAppt += Number(r?.pmsAppointment ?? 0);
          totalConv += Number(r?.pmsConversion ?? 0);
          validMonths++;
        }
      });

      // ✅ Rank
      if (!isAC) {
        if (selectedGrowth === "PMS %") row.__rankValue = totalPMS / validMonths || 0;
        if (selectedGrowth === "Appointment") row.__rankValue = totalAppt;
        if (selectedGrowth === "Conversion") row.__rankValue = totalConv;
      } else {
        row.__rankValue = totalPMS / validMonths || 0;
      }

      // ✅ MONTH DATA
      summary.forEach(({ month, data }) => {
        const r = data.find(d => normalize(d[personKey]) === normalize(person));
        if (!r) return;

        const percentagePMS = Number(r?.percentagePMS ?? 0);
        const pmsAppointment = Number(r?.pmsAppointment ?? 0);

        if (!isAC) {
          if (selectedGrowth === "PMS %") row[month] = Math.round(percentagePMS);
          if (selectedGrowth === "Appointment") row[month] = Math.round(pmsAppointment);
          if (selectedGrowth === "Conversion") row[month] = Math.round(r?.pmsConversion ?? 0);
        } else {
          const scaledPMSHeight =
            pmsAppointment > 0
              ? Math.round((percentagePMS / 100) * pmsAppointment)
              : 0;
        
          row[`${month}_APPT`] = Math.round(pmsAppointment);
          row[`${month}_CONV`] = Math.round(percentagePMS); // actual %
          row[`${month}_PMS_SCALED`] = scaledPMSHeight;     // visual height
        }
      });

      // ✅ ALL MODE (MATCH BAR CHART)
      if (isAllMonthsSelected) {
        if (!isAC) {
          if (selectedGrowth === "PMS %") row.ALL = Math.round(totalPMS / validMonths || 0);
          if (selectedGrowth === "Appointment") row.ALL = Math.round(totalAppt);
          if (selectedGrowth === "Conversion") row.ALL = Math.round(totalConv);
        } else {
          const avgPMS = totalPMS / validMonths || 0;
           
          row.ALL_APPT = Math.round(totalAppt);
          row.ALL_PMS_RAW = Math.round(avgPMS);
          row.ALL_PMS =
            totalAppt > 0
              ? Math.round((avgPMS / 100) * totalAppt)
              : 0;
                  }
      }

      row.__branchColor = BRANCH_COLORS[row.branch] || '#999';
      return row;
    });

    let sortedRows = rows.filter(Boolean);

    if (sortByExp && isCC) {
      sortedRows.sort((a, b) =>
        expSortAsc
          ? (a.experienceDays || 0) - (b.experienceDays || 0)
          : (b.experienceDays || 0) - (a.experienceDays || 0)
      );
    } else {
      sortedRows.sort((a, b) => b.__rankValue - a.__rankValue);
    }

    return sortedRows;
  }, [getFilteredPersonKeys, summary, selectedGrowth, selectedBranches, isAllMonthsSelected, isCC, sortByExp, expSortAsc]);

  // 🔴 FIXED Custom label renderer for data points - SAFE null checks
  const renderCustomLabel = (props) => {
  const { x, y, value, payload, dataKey } = props;

  if (!value || value === 0) return null;

  // ✅ SAFETY: fallback if dataKey missing
  const key = dataKey || props?.dataKey || "";

  let displayValue = value;
  let isPercent = false;

  // ✅ PMS scaled line → show actual %
  if (key && key.includes("PMS_SCALED")) {
    const month = key.split("_")[0];
    displayValue = payload?.[`${month}_CONV`] ?? 0;
    isPercent = true;
  }

  // ✅ ALL mode PMS
  else if (key === "ALL_PMS") {
    displayValue = payload?.ALL_PMS_RAW ?? 0;
    isPercent = true;
  }

  // ✅ Appointment line
  else if (key && key.includes("_APPT")) {
    isPercent = false;
  }

  // ✅ fallback (non A&C cases)
  else {
    isPercent = false;
  }

  return (
    <g>
      <text
        x={x}
        y={y - 10}
        textAnchor="middle"
        fill="#000"
        fontSize="12"
        fontWeight="bold"
      >
        {isPercent
          ? `${Math.round(displayValue)}%`
          : Math.round(displayValue)}
      </text>
    </g>
  );
};


  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const chartEntry = chartData.find(entry => entry.person === label);
      const branchName = chartEntry?.branch || 'N/A';
      const isHighlightedCCE = chartEntry?.isHighlightedCCE || false;
      const cceStatus = chartEntry?.cceStatus || 'NORMAL';
      const originalPerson = chartEntry?.originalPerson || label;

      const shouldShowPercentage = () => {
        return selectedGrowth === "PMS %" || (isAC && payload.some(p => p.dataKey?.includes('_CONV')));
      };

      return (
        <Box sx={{ 
          p: 2, 
          bgcolor: '#ffffff', 
          borderRadius: 2, 
          border: `2px solid ${CCE_STATUS_COLORS[cceStatus] || '#e0e0e0'}`,
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          minWidth: 420,
          maxHeight: 'none',
          height: 'auto',
          maxWidth: 500,
          overflow: 'visible'
        }}>
          
          {/* HEADER */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, pb: 1, borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: CCE_STATUS_COLORS[cceStatus] }}>
              {titlePrefix}: {label}
            </Typography>
            <IconButton 
              size="small" 
              onClick={() => {
                navigate(`/edit/${type}/${encodeURIComponent(originalPerson)}/${encodeURIComponent(branchName)}`, {
                  state: { 
                    person: originalPerson, 
                    branch: branchName,
                    displayName: label,
                    isHighlighted: isHighlightedCCE,
                    type
                  }
                });
              }}
              sx={{ 
                color: '#1976d2',
                '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.1)' }
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* BRANCH */}
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="body2" sx={{ color: '#666', fontSize: '0.85rem', mb: 0.5 }}>
              📍 Branch: <strong>{branchName}</strong>
            </Typography>
          </Box>

          {/* ✅ Selected Period Performance */}
          {isAllMonthsSelected && (
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#1976d2' }}>
                Selected Period Performance:
              </Typography>

              {payload.map((entry, index) => {
                let displayValue = Math.round(entry.value);
                let displayName = entry.dataKey;

                if (entry.dataKey?.includes('_PMS_SCALED')) {
                  displayName = 'PMS %';
                  const month = entry.dataKey.split('_')[0];
                  displayValue = chartEntry?.[`${month}_CONV`] || 0;
                } 
                else if (entry.dataKey === 'ALL_PMS') {
                  displayName = 'PMS %';
                  displayValue = chartEntry?.ALL_PMS_RAW || 0;
                } 
                else if (entry.dataKey?.includes('_APPT')) {
                  displayName = 'Appointments';
                } 
                else if (entry.dataKey?.includes('_CONV')) {
                  displayName = 'PMS %';
                }

                return (
                  <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.6, px: 1.2, borderRadius: 1.2, bgcolor: 'rgba(25, 118, 210, 0.06)', mb: 0.4 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>
                      {displayName}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2', fontSize: '1rem' }}>
                      {displayName === 'PMS %' ? `${displayValue}%` : displayValue}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          )}

          {/* ✅ All Months Performance */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: '#1976d2' }}>
              All Months Performance:
            </Typography>

            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)',  
              gridTemplateRows: 'repeat(4, 1fr)',      
              gap: 0.8,
              height: 200,                             
              width: '100%',
              overflow: 'hidden'                       
            }}>
              {MONTHS.map(month => {
                const appt = chartEntry?.[`${month}_APPT`] || 0;
                const conv = chartEntry?.[`${month}_CONV`] || chartEntry?.[month] || 0;

                return (
                  <Box
                    key={month}
                    sx={{ 
                      py: 0.7,
                      px: 0.8, 
                      borderRadius: 1.2, 
                      bgcolor: (appt > 0 || conv > 0)
                        ? 'rgba(0,0,0,0.03)'
                        : 'rgba(0,0,0,0.01)',          
                      textAlign: 'center',
                      border: '1px solid rgba(0,0,0,0.05)',
                      fontSize: '0.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      minHeight: 0
                    }}
                  >
                    <Typography variant="caption" sx={{ 
                      color: MONTH_COLORS[month], 
                      fontWeight: 600, 
                      fontSize: '0.7rem',
                      mb: 0.1
                    }}>
                      {month}
                    </Typography>

                    {appt !== 0 && (
                      <Typography variant="body2" sx={{ 
                        fontWeight: 500, 
                        fontSize: '0.7rem', 
                        color: MONTH_COLORS.APPT 
                      }}>
                        Appt: {appt}
                      </Typography>
                    )}

                    {conv !== 0 && (
                      <Typography variant="body2" sx={{ 
                        fontWeight: 600, 
                        fontSize: '0.75rem',
                        color: isAC ? MONTH_COLORS.CONV : '#1976d2',
                        lineHeight: 1
                      }}>
                        {shouldShowPercentage() ? `${conv}%` : conv}
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>

        </Box>
      );
    }
    return null;
  };

  const CustomXAxisTick = ({ x, y, payload }) => {
    const entry = chartData.find(e => e.person === payload.value);
    const cceStatus = entry?.cceStatus || 'NORMAL';
    const textColor = CCE_STATUS_COLORS[cceStatus];
    
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={20} textAnchor="end" fill={textColor} transform="rotate(-50)" fontSize="13" fontWeight="bold" fontFamily="Arial, sans-serif">
          {payload.value}
        </text>
      </g>
    );
  };

  const selectedGradient = "linear-gradient(90deg, rgba(144,238,144,1) 0%, rgba(102,205,170,1) 100%)";
  const btnStyle = sel => ({
    borderRadius: 20,
    px: 2,
    py: 0.5,
    fontWeight: 600,
    background: sel ? selectedGradient : "#fff",
    border: sel ? "1.5px solid #388e3c" : "1px solid #bdbdbd",
  });

  const getLineColor = (entry) => isAC ? MONTH_COLORS.APPT || MONTH_COLORS.CONV : entry.__branchColor;

  const toggleExpSort = () => {
    if (!isCC) return;
    if (sortByExp) {
      setExpSortAsc(!expSortAsc);
    } else {
      setSortByExp(true);
      setExpSortAsc(false);
    }
  };

  const disableExpSort = () => {
    setSortByExp(false);
  };

  const renderLines = () => {
    const lines = [];

    if (isAC) {
      if (isAllMonthsSelected) {
        lines.push(
          <Line
            key="ALL_APPT"
            dataKey="ALL_APPT"
            stroke={MONTH_COLORS.APPT}
            strokeWidth={3}
            label={renderCustomLabel}
          />
        );
    
        lines.push(
          <Line
            key="ALL_PMS"
            dataKey="ALL_PMS"
            stroke={MONTH_COLORS.CONV}
            strokeWidth={3}
            label={renderCustomLabel}
          />
        );
      } else {
        selectedMonths.forEach(month => {
          lines.push(
            <Line
              key={`${month}_APPT`}
              dataKey={`${month}_APPT`}
              stroke={MONTH_COLORS.APPT}
              strokeWidth={3}
              label={renderCustomLabel}
            />
          );
    
          lines.push(
            <Line
              key={`${month}_PMS_SCALED`}
              dataKey={`${month}_PMS_SCALED`}
              stroke={MONTH_COLORS.CONV}
              strokeWidth={3}
              label={renderCustomLabel}
            />
          );
        });
      }
    } else {
      if (isAllMonthsSelected) {
        lines.push(
          <Line 
            key="ALL" 
            dataKey="ALL" 
            stroke="#2e7d32" 
            strokeWidth={4}
            label={renderCustomLabel}  // ✅ SAFE labels
          />
        );
      } else {
        selectedMonths.forEach(month => {
          lines.push(
            <Line 
              key={month} 
              dataKey={month} 
              stroke={MONTH_COLORS[month]} 
              strokeWidth={3}
              label={renderCustomLabel}  // ✅ SAFE labels
            />
          );
        });
      }
    }

    return lines;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3, alignItems: "center" }}>
        <Typography variant="h4">{titlePrefix} CONVERSION – {selectedGrowth}</Typography>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          {isCC && sortByExp && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mr: 1 }}>
              <Button size="small" variant="outlined" onClick={toggleExpSort} sx={{ minWidth: "auto", px: 1, borderRadius: 20, fontSize: "0.75rem" }} title="Toggle Experience Sort Direction">EXP</Button>
              <IconButton size="small" onClick={toggleExpSort} sx={{ p: 0.25, background: expSortAsc ? "#4caf50" : "#f44336", color: "white", "&:hover": { background: expSortAsc ? "#45a049" : "#da190b" } }} title={expSortAsc ? "Ascending" : "Descending"}>
                {expSortAsc ? <ArrowUpIcon fontSize="small" /> : <ArrowDownIcon fontSize="small" />}
              </IconButton>
              <IconButton size="small" onClick={disableExpSort} sx={{ p: 0.25, background: "#ff9800", color: "white", "&:hover": { background: "#f57c00" } }} title="Disable Experience Sort (Back to Performance Sort)">
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
          {isCC && !sortByExp && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mr: 1 }}>
              <Button size="small" variant="outlined" onClick={toggleExpSort} sx={{ minWidth: "auto", px: 1, borderRadius: 20, fontSize: "0.75rem" }} title="Sort by Experience">EXP</Button>
              <IconButton size="small" onClick={toggleExpSort} sx={{ p: 0.25, background: "transparent", color: "#666", "&:hover": { background: "rgba(0,0,0,0.1)" } }} title="Click to sort by Experience">
                <ArrowDownIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
          {isCC && (
            <Box sx={{ display: "flex", gap: 0.5, mr: 1 }}>
              <Button size="small" sx={btnStyle(filterMode === "ALL")} onClick={() => setFilterMode("ALL")}>ALL</Button>
              <Button size="small" sx={btnStyle(filterMode === "PSF")} onClick={() => setFilterMode("PSF")}>PSF</Button>
              <Button size="small" sx={btnStyle(filterMode === "SMR")} onClick={() => setFilterMode("SMR")}>SMR</Button>
            </Box>
          )}
          <Button variant="contained">Line Chart</Button>
          <Button variant="contained" onClick={() => navigate(`/DashboardHome/${type}_conversion-bar-chart`)}>Bar Chart</Button>
          <Button variant="contained" onClick={() => navigate(tableRoute)}>Table</Button>
        </Box>
      </Box>

      <Box sx={{ mb: 2, display: "flex", gap: 1.2, flexWrap: "wrap" }}>
        <Button size="small" sx={btnStyle(allSelected)} onClick={() => { setAllSelected(true); setSelectedMonths([]); }}>ALL</Button>
        {MONTHS.map(m => (
          <Button key={m} size="small" sx={btnStyle(selectedMonths.includes(m))} onClick={() => {
            setAllSelected(false);
            setSelectedMonths(p => p.includes(m) ? p.filter(x => x !== m) : [...p, m]);
          }}>{m}</Button>
        ))}
      </Box>

      <Box sx={{ mb: 2, display: "flex", gap: 1.2, flexWrap: "wrap" }}>
        {BRANCHES.map(b => (
          <Button key={b} size="small" sx={btnStyle(selectedBranches.includes(b))} onClick={() => setSelectedBranches(p => p.includes(b) ? p.filter(x => x !== b) : [...p, b])}>
            {b}
          </Button>
        ))}
      </Box>

      <Box sx={{ mb: 3, display: "flex", gap: 1.2 }}>
        {GROWTH_OPTIONS.map(g => (
          <Button key={g} size="small" sx={btnStyle(selectedGrowth === g)} onClick={() => setSelectedGrowth(g)}>
            {g}
          </Button>
        ))}
      </Box>

      <Box sx={{ mb: 3, width: 320 }}>
        <Select multiple fullWidth value={selectedPersons} onChange={e => {
          const value = e.target.value;
          if (value.includes("ALL")) {
            setSelectedPersons(allPersonSelected ? [] : dropdownPersons);
          } else {
            setSelectedPersons(value);
          }
        }} input={<OutlinedInput />} renderValue={s => s.join(", ")}>
          <MenuItem value="ALL">
            <Checkbox checked={allPersonSelected} indeterminate={selectedPersons.length > 0 && selectedPersons.length < dropdownPersons.length} />
            <ListItemText primary="Select All" />
          </MenuItem>
          {dropdownPersons.map(person => (
            <MenuItem key={person} value={person}>
              <Checkbox checked={selectedPersons.includes(person)} />
              <ListItemText primary={person} />
            </MenuItem>
          ))}
        </Select>
      </Box>

      <Box sx={{ height: 800, background: "#fff", borderRadius: 3, p: 3 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 40, right: 30, left: 20, bottom: 120 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="person" height={160} interval={0} tick={<CustomXAxisTick />} />
            <YAxis tickFormatter={v => (isPercentage || isAC) ? `${Math.round(v)}%` : Math.round(v)} />
            <Tooltip content={<CustomTooltip />} />
            
            {renderLines()}
            
            <ReferenceLine y={50} stroke="#ff7300" strokeDasharray="3 3" label={{ position: 'top', fill: '#ff7300' }} />
            <ReferenceLine y={75} stroke="#00bfff" strokeDasharray="3 3" label={{ position: 'top', fill: '#00bfff' }} />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default GenericConversionLineChart;
