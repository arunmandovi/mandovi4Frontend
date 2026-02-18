import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  OutlinedInput,
  Checkbox,
  ListItemText,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { fetchData } from "../../../api/uploadService";

const TotalBranchOutstandingPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredData, setFilteredData] = useState([]);
  const [workshopFilter, setWorkshopFilter] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [showDetailView, setShowDetailView] = useState(false);
  // NEW: Party level states
  const [selectedAdvisor, setSelectedAdvisor] = useState(null);
  const [showPartyView, setShowPartyView] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'balanceAmt', direction: 'asc' });
  const navigate = useNavigate();

  /* ---------------- OPTIONS ---------------- */
  const [workshopOptions, setWorkshopOptions] = useState([]);

  /* ---------------- SORT ARROW STYLES (REUSABLE) ---------------- */
  const sortLabelSx = {
    color: 'white !important',
    fontWeight: 'bold',
    '&:hover': {
      color: '#fff !important',
      '& .MuiTableSortLabel-icon': {
        color: '#ffeb3b !important'
      },
      '& .MuiTableSortLabel-iconDirectionDesc': {
        color: '#ffeb3b !important'
      },
      '& .MuiTableSortLabel-iconDirectionAsc': {
        color: '#ffeb3b !important'
      }
    },
    '& .MuiTableSortLabel-icon': {
      color: 'white !important',
      fontWeight: 'bold',
      fontSize: '1.2em'
    },
    '& .MuiTableSortLabel-iconDirectionDesc': {
      color: 'white !important',
      fontWeight: 'bold',
      fontSize: '1.2em'
    },
    '& .MuiTableSortLabel-iconDirectionAsc': {
      color: 'white !important',
      fontWeight: 'bold',
      fontSize: '1.2em'
    }
  };

  /* ---------------- FETCH SUMMARY DATA ---------------- */
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const res = await fetchData("/api/outstanding/total_branch_outstanding");
        if (Array.isArray(res)) {
          setData(res);
          const workshops = res.reduce((acc, row) => {
            const workshop = row.segment || null;
            const workshopValue = workshop || "null";
            if (workshopValue && !acc.find(w => w.value === workshopValue)) {
              acc.push({ label: workshopValue === "null" ? "No Workshop" : workshopValue, value: workshopValue });
            }
            return acc;
          }, []).sort((a, b) => a.label.localeCompare(b.label));
          setWorkshopOptions(workshops);
          setFilteredData(res);
        }
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  /* ---------------- SA DETAIL DATA ---------------- */
  const [saData, setSaData] = useState([]);
  const [saLoading, setSaLoading] = useState(false);
  const [saFilteredData, setSaFilteredData] = useState([]);
  const [saAdvisorFilter, setSaAdvisorFilter] = useState([]);
  const [saSortConfig, setSaSortConfig] = useState({ key: 'balanceAmt', direction: 'asc' });
  const [saAdvisorOptions, setSaAdvisorOptions] = useState([]);
  const [saAllAdvisorOptions, setSaAllAdvisorOptions] = useState([]);

  /* ---------------- PARTY DETAIL DATA ---------------- */
  const [partyData, setPartyData] = useState([]);
  const [partyLoading, setPartyLoading] = useState(false);
  const [partyFilteredData, setPartyFilteredData] = useState([]);
  const [partySortConfig, setPartySortConfig] = useState({ key: 'balanceAmt', direction: 'asc' });

  /* ---------------- LOAD SA DATA (Branch → SA) ---------------- */
  useEffect(() => {
    if (selectedBranch && !showPartyView) {
      const loadSaData = async () => {
        try {
          setSaLoading(true);
          const res = await fetchData("/api/outstanding/total_sa_outstanding");
          const branchData = res.filter(row => 
            row.branchName === selectedBranch || 
            row.segment === selectedBranch
          );
          setSaData(branchData);

          const allAdvisors = branchData.reduce((acc, row) => {
            const advisorValue = row.salesMan || "null";
            if (advisorValue && !acc.find(a => a.value === advisorValue)) {
              acc.push({
                label: advisorValue === "null" ? "No Advisor" : advisorValue,
                value: advisorValue
              });
            }
            return acc;
          }, []).sort((a, b) => a.label.localeCompare(b.label));
          setSaAllAdvisorOptions(allAdvisors);
          setSaAdvisorOptions(allAdvisors);

          setSaFilteredData(branchData);
        } catch (error) {
          console.error('SA fetch error:', error);
        } finally {
          setSaLoading(false);
        }
      };
      loadSaData();
    }
  }, [selectedBranch]);

  /* ---------------- LOAD PARTY DATA (SA → Party) ---------------- */
  useEffect(() => {
    if (selectedAdvisor && showPartyView) {
      const loadPartyData = async () => {
        try {
          setPartyLoading(true);
          const res = await fetchData("/api/outstanding/total_party_outstanding");
          // SAME LOGIC AS BRANCH FILTERING - Filter by advisor AND branch
          const advisorData = res.filter(row => 
            row.salesMan === selectedAdvisor &&
            (row.branchName === selectedBranch || row.segment === selectedBranch)
          );
          setPartyData(advisorData);
          setPartyFilteredData(advisorData);
        } catch (error) {
          console.error('Party fetch error:', error);
        } finally {
          setPartyLoading(false);
        }
      };
      loadPartyData();
    }
  }, [selectedAdvisor, selectedBranch, showPartyView]);

  /* ---------------- HANDLE ROW CLICKS ---------------- */
  const handleBranchClick = useCallback((branchName) => {
    setSelectedBranch(branchName);
    setSelectedAdvisor(null);
    setShowDetailView(true);
    setShowPartyView(false);
  }, []);

  const handleAdvisorClick = useCallback((advisorName) => {
    // SAME PATTERN: Show party view inline instead of navigating
    setSelectedAdvisor(advisorName);
    setShowPartyView(true);
  }, []);

  const backToBranchView = useCallback(() => {
    setShowPartyView(false);
    setSelectedAdvisor(null);
  }, []);

  const backToSummary = useCallback(() => {
    setShowDetailView(false);
    setShowPartyView(false);
    setSelectedBranch(null);
    setSelectedAdvisor(null);
  }, []);

  /* ---------------- SUMMARY VIEW SORT HANDLER ---------------- */
  const handleSummarySort = useCallback((key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  }, [sortConfig]);

  /* ---------------- SA VIEW SORT HANDLER ---------------- */
  const handleSaSort = useCallback((key) => {
    let direction = 'asc';
    if (saSortConfig.key === key && saSortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSaSortConfig({ key, direction });
  }, [saSortConfig]);

  /* ---------------- PARTY VIEW SORT HANDLER ---------------- */
  const handlePartySort = useCallback((key) => {
    let direction = 'asc';
    if (partySortConfig.key === key && partySortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setPartySortConfig({ key, direction });
  }, [partySortConfig]);

  /* ---------------- SUMMARY VIEW FILTERS ---------------- */
  const handleWorkshopChange = useCallback((event) => {
    const value = event.target.value;
    if (typeof value === 'string') value = [value];
    setWorkshopFilter(value || []);
  }, []);

  useEffect(() => {
    let filtered = data;
    if (workshopFilter.length > 0) {
      filtered = filtered.filter(row => {
        const workshopValue = row.segment || "null";
        return workshopFilter.includes(workshopValue);
      });
    }
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key] || 0;
        const bValue = b[sortConfig.key] || 0;
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    setFilteredData(filtered);
  }, [workshopFilter, data, sortConfig]);

  const totals = useMemo(() => {
    return filteredData.reduce((acc, row) => {
      acc.balanceAmt += row.balanceAmt || 0;
      acc.upToSeven += row.upToSeven || 0;
      acc.eightToThirty += row.eightToThirty || 0;
      acc.thirtyOneToNinty += row.thirtyOneToNinty || 0;
      acc.grtNinty += row.grtNinty || 0;
      return acc;
    }, { balanceAmt: 0, upToSeven: 0, eightToThirty: 0, thirtyOneToNinty: 0, grtNinty: 0 });
  }, [filteredData]);

  /* ---------------- SA VIEW FUNCTIONS ---------------- */
  const handleSaAdvisorChange = useCallback((event) => {
    const value = event.target.value;
    if (typeof value === 'string') value = [value];
    setSaAdvisorFilter(value || []);
  }, []);

  useEffect(() => {
    let filtered = saData;
    if (saAdvisorFilter.length > 0) {
      filtered = filtered.filter(row => saAdvisorFilter.includes(row.salesMan || "null"));
    }
    if (saSortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[saSortConfig.key] || 0;
        const bValue = b[saSortConfig.key] || 0;
        if (aValue < bValue) return saSortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return saSortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    setSaFilteredData(filtered);
  }, [saAdvisorFilter, saData, saSortConfig]);

  const saTotals = useMemo(() => {
    return saFilteredData.reduce((acc, row) => {
      acc.balanceAmt += row.balanceAmt || 0;
      acc.upToSeven += row.upToSeven || 0;
      acc.eightToThirty += row.eightToThirty || 0;
      acc.thirtyOneToNinty += row.thirtyOneToNinty || 0;
      acc.grtNinty += row.grtNinty || 0;
      return acc;
    }, { balanceAmt: 0, upToSeven: 0, eightToThirty: 0, thirtyOneToNinty: 0, grtNinty: 0 });
  }, [saFilteredData]);

  /* ---------------- PARTY VIEW FUNCTIONS ---------------- */
  useEffect(() => {
    let filtered = partyData;
    if (partySortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[partySortConfig.key] || 0;
        const bValue = b[partySortConfig.key] || 0;
        if (aValue < bValue) return partySortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return partySortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    setPartyFilteredData(filtered);
  }, [partyData, partySortConfig]);

  const partyTotals = useMemo(() => {
    return partyFilteredData.reduce((acc, row) => {
      acc.balanceAmt += row.balanceAmt || 0;
      acc.upToSeven += row.upToSeven || 0;
      acc.eightToThirty += row.eightToThirty || 0;
      acc.thirtyOneToNinty += row.thirtyOneToNinty || 0;
      acc.grtNinty += row.grtNinty || 0;
      return acc;
    }, { balanceAmt: 0, upToSeven: 0, eightToThirty: 0, thirtyOneToNinty: 0, grtNinty: 0 });
  }, [partyFilteredData]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  if (loading && !showDetailView && !showPartyView) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {showPartyView ? (
        /* ---------------- PARTY VIEW (3rd Level) ---------------- */
        <>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Button variant="outlined" onClick={backToBranchView}>
                ← Back to Service Advisors ({selectedBranch})
              </Button>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {selectedAdvisor} - Party Details ({selectedBranch})
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button variant="contained" onClick={() => navigate("/DashboardHome/total_party_outstanding")}>All Parties</Button>
            </Box>
          </Box>

          {partyLoading ? (
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Typography>Loading party details...</Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 4 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ background: "#455a64" }}>
                    <TableCell sx={{ color: "#fff", fontWeight: 800, minWidth: 60, width: 60 }}>S.No</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: 800, minWidth: 250 }}>Party</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: 800, minWidth: 150 }}>Workshop</TableCell>
                    <TableCell align="right" sx={{ color: "#fff", fontWeight: 800 }}>
                      <TableSortLabel
                        active={partySortConfig.key === 'balanceAmt'}
                        direction={partySortConfig.direction}
                        onClick={() => handlePartySort('balanceAmt')}
                        sx={sortLabelSx}
                      >
                        Balance Amt
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right" sx={{ color: "#fff", fontWeight: 800 }}>
                      <TableSortLabel
                        active={partySortConfig.key === 'upToSeven'}
                        direction={partySortConfig.direction}
                        onClick={() => handlePartySort('upToSeven')}
                        sx={sortLabelSx}
                      >
                        Upto 7 Days
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right" sx={{ color: "#fff", fontWeight: 800 }}>
                      <TableSortLabel
                        active={partySortConfig.key === 'eightToThirty'}
                        direction={partySortConfig.direction}
                        onClick={() => handlePartySort('eightToThirty')}
                        sx={sortLabelSx}
                      >
                        8-30 Days
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right" sx={{ color: "#fff", fontWeight: 800 }}>
                      <TableSortLabel
                        active={partySortConfig.key === 'thirtyOneToNinty'}
                        direction={partySortConfig.direction}
                        onClick={() => handlePartySort('thirtyOneToNinty')}
                        sx={sortLabelSx}
                      >
                        31-90 Days
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right" sx={{ color: "#fff", fontWeight: 800 }}>
                      <TableSortLabel
                        active={partySortConfig.key === 'grtNinty'}
                        direction={partySortConfig.direction}
                        onClick={() => handlePartySort('grtNinty')}
                        sx={sortLabelSx}
                      >
                        90+ Days
                      </TableSortLabel>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {partyFilteredData.map((row, index) => (
                    <TableRow key={row.partyName || index} sx={{ 
                      background: index % 2 ? "#fafafa" : "#fff",
                      '&:hover': { backgroundColor: '#e3f2fd !important' }
                    }}>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{index + 1}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{row.partyName || row.customerName || ''}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{row.segment || ''}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(row.balanceAmt)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(row.upToSeven)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(row.eightToThirty)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(row.thirtyOneToNinty)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(row.grtNinty)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ background: "#e3f2fd" }}>
                    <TableCell sx={{ fontWeight: 900, fontSize: '1.1em' }} colSpan={3}>TOTAL</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 900, fontSize: '1.1em', color: '#1976d2' }}>
                      {formatCurrency(partyTotals.balanceAmt)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 900, fontSize: '1.1em', color: '#1976d2' }}>
                      {formatCurrency(partyTotals.upToSeven)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 900, fontSize: '1.1em', color: '#1976d2' }}>
                      {formatCurrency(partyTotals.eightToThirty)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 900, fontSize: '1.1em', color: '#1976d2' }}>
                      {formatCurrency(partyTotals.thirtyOneToNinty)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 900, fontSize: '1.1em', color: '#1976d2' }}>
                      {formatCurrency(partyTotals.grtNinty)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      ) : showDetailView ? (
        /* ---------------- SA VIEW (2nd Level) ---------------- */
        <>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Button variant="outlined" onClick={backToSummary}>
                ← Back to Branches
              </Button>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {selectedBranch} - Service Advisors
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button variant="contained" onClick={() => navigate("/DashboardHome/total_sa_outstanding")}>All SA</Button>
            </Box>
          </Box>

          <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "end", flexWrap: "wrap" }}>
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel>Service Advisors</InputLabel>
              <Select multiple value={saAdvisorFilter} onChange={handleSaAdvisorChange} input={<OutlinedInput label="Service Advisors" />}>
                {saAdvisorOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Checkbox checked={saAdvisorFilter.indexOf(option.value) > -1} />
                    <ListItemText primary={option.label} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {saAdvisorFilter.length > 0 && (
              <Chip label="Clear Filters" onClick={() => { setSaAdvisorFilter([]); }} color="error" variant="outlined" sx={{ height: 40 }} />
            )}
          </Box>

          {saLoading ? (
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Typography>Loading SA details...</Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 4 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ background: "#455a64" }}>
                    <TableCell sx={{ color: "#fff", fontWeight: 800, minWidth: 60, width: 60 }}>S.No</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: 800, minWidth: 250 }}>Workshop</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: 800, minWidth: 250 }}>Service Advisor</TableCell>
                    <TableCell align="right" sx={{ color: "#fff", fontWeight: 800 }}>
                      <TableSortLabel
                        active={saSortConfig.key === 'balanceAmt'}
                        direction={saSortConfig.direction}
                        onClick={() => handleSaSort('balanceAmt')}
                        sx={sortLabelSx}
                      >
                        Balance Amt
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right" sx={{ color: "#fff", fontWeight: 800 }}>
                      <TableSortLabel
                        active={saSortConfig.key === 'upToSeven'}
                        direction={saSortConfig.direction}
                        onClick={() => handleSaSort('upToSeven')}
                        sx={sortLabelSx}
                      >
                        Upto 7 Days
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right" sx={{ color: "#fff", fontWeight: 800 }}>
                      <TableSortLabel
                        active={saSortConfig.key === 'eightToThirty'}
                        direction={saSortConfig.direction}
                        onClick={() => handleSaSort('eightToThirty')}
                        sx={sortLabelSx}
                      >
                        8-30 Days
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right" sx={{ color: "#fff", fontWeight: 800 }}>
                      <TableSortLabel
                        active={saSortConfig.key === 'thirtyOneToNinty'}
                        direction={saSortConfig.direction}
                        onClick={() => handleSaSort('thirtyOneToNinty')}
                        sx={sortLabelSx}
                      >
                        31-90 Days
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right" sx={{ color: "#fff", fontWeight: 800 }}>
                      <TableSortLabel
                        active={saSortConfig.key === 'grtNinty'}
                        direction={saSortConfig.direction}
                        onClick={() => handleSaSort('grtNinty')}
                        sx={sortLabelSx}
                      >
                        90+ Days
                      </TableSortLabel>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {saFilteredData.map((row, index) => (
                    <TableRow 
                      key={`${row.salesMan}-${index}`} 
                      sx={{ 
                        background: index % 2 ? "#fafafa" : "#fff",
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: '#e3f2fd !important' }
                      }}
                      onClick={() => handleAdvisorClick(row.salesMan)}
                    >
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{index + 1}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{row.segment || ''}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{row.salesMan || ''}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(row.balanceAmt)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(row.upToSeven)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(row.eightToThirty)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(row.thirtyOneToNinty)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(row.grtNinty)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ background: "#e3f2fd" }}>
                    <TableCell sx={{ fontWeight: 900, fontSize: '1.1em' }} colSpan={3}>TOTAL</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 900, fontSize: '1.1em', color: '#1976d2' }}>
                      {formatCurrency(saTotals.balanceAmt)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 900, fontSize: '1.1em', color: '#1976d2' }}>
                      {formatCurrency(saTotals.upToSeven)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 900, fontSize: '1.1em', color: '#1976d2' }}>
                      {formatCurrency(saTotals.eightToThirty)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 900, fontSize: '1.1em', color: '#1976d2' }}>
                      {formatCurrency(saTotals.thirtyOneToNinty)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 900, fontSize: '1.1em', color: '#1976d2' }}>
                      {formatCurrency(saTotals.grtNinty)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      ) : (
        /* ---------------- SUMMARY VIEW (1st Level) ---------------- */
        <>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Total Outstanding – Branch Summary
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button variant="contained" onClick={() => navigate("/DashboardHome/total_branch_outstanding")}>Total</Button>
              <Button variant="contained" onClick={() => navigate("/DashboardHome/cash_branch_outstanding")}>Cash</Button>
              <Button variant="contained" onClick={() => navigate("/DashboardHome/invoice_branch_outstanding")}>Invoice</Button>
              <Button variant="contained" onClick={() => navigate("/DashboardHome/insurance_branch_outstanding")}>Insurance</Button>
              <Button variant="contained" onClick={() => navigate("/DashboardHome/others_branch_outstanding")}>Others</Button>
            </Box>
          </Box>

          <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "end", flexWrap: "wrap" }}>
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel>Workshops</InputLabel>
              <Select
                multiple
                value={workshopFilter}
                onChange={handleWorkshopChange}
                input={<OutlinedInput label="Workshops" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value === "null" ? "No Workshop" : value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {workshopOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Checkbox checked={workshopFilter.indexOf(option.value) > -1} />
                    <ListItemText primary={option.label} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {workshopFilter.length > 0 && (
              <Chip label="Clear Filters" onClick={() => setWorkshopFilter([])} color="error" variant="outlined" sx={{ height: 40 }} />
            )}
          </Box>

          <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
            Showing {filteredData.length} records | Sorted by: {sortConfig.key} ({sortConfig.direction.toUpperCase()})
          </Typography>

          <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 4 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ background: "#455a64" }}>
                  <TableCell sx={{ color: "#fff", fontWeight: 800, minWidth: 60, width: 60 }}>S.No</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 800, minWidth: 250 }}>Branch/Workshop</TableCell>
                  <TableCell align="right" sx={{ color: "#fff", fontWeight: 800 }}>
                    <TableSortLabel
                      active={sortConfig.key === 'balanceAmt'}
                      direction={sortConfig.direction}
                      onClick={() => handleSummarySort('balanceAmt')}
                      sx={sortLabelSx}
                    >
                      Balance Amt
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right" sx={{ color: "#fff", fontWeight: 800 }}>
                    <TableSortLabel
                      active={sortConfig.key === 'upToSeven'}
                      direction={sortConfig.direction}
                      onClick={() => handleSummarySort('upToSeven')}
                      sx={sortLabelSx}
                    >
                      Upto 7 Days
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right" sx={{ color: "#fff", fontWeight: 800 }}>
                    <TableSortLabel
                      active={sortConfig.key === 'eightToThirty'}
                      direction={sortConfig.direction}
                      onClick={() => handleSummarySort('eightToThirty')}
                      sx={sortLabelSx}
                    >
                      8-30 Days
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right" sx={{ color: "#fff", fontWeight: 800 }}>
                    <TableSortLabel
                      active={sortConfig.key === 'thirtyOneToNinty'}
                      direction={sortConfig.direction}
                      onClick={() => handleSummarySort('thirtyOneToNinty')}
                      sx={sortLabelSx}
                    >
                      31-90 Days
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right" sx={{ color: "#fff", fontWeight: 800 }}>
                    <TableSortLabel
                      active={sortConfig.key === 'grtNinty'}
                      direction={sortConfig.direction}
                      onClick={() => handleSummarySort('grtNinty')}
                      sx={sortLabelSx}
                    >
                      90+ Days
                    </TableSortLabel>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.map((row, index) => (
                  <TableRow 
                    key={row.segment || index} 
                    sx={{ 
                      background: index % 2 ? "#fafafa" : "#fff",
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: '#e3f2fd !important' }
                    }}
                    onClick={() => handleBranchClick(row.segment || row.branchName || 'Unknown')}
                  >
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{index + 1}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{row.segment || row.branchName || ''}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(row.balanceAmt)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(row.upToSeven)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(row.eightToThirty)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(row.thirtyOneToNinty)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(row.grtNinty)}</TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{ background: "#e3f2fd" }}>
                  <TableCell sx={{ fontWeight: 900, fontSize: '1.1em' }} colSpan={2}>GRAND TOTAL</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 900, fontSize: '1.1em', color: '#1976d2' }}>
                    {formatCurrency(totals.balanceAmt)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 900, fontSize: '1.1em', color: '#1976d2' }}>
                    {formatCurrency(totals.upToSeven)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 900, fontSize: '1.1em', color: '#1976d2' }}>
                    {formatCurrency(totals.eightToThirty)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 900, fontSize: '1.1em', color: '#1976d2' }}>
                    {formatCurrency(totals.thirtyOneToNinty)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 900, fontSize: '1.1em', color: '#1976d2' }}>
                    {formatCurrency(totals.grtNinty)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
};

export default TotalBranchOutstandingPage;
