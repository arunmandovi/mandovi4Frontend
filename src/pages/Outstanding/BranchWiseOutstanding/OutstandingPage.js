import React, { useEffect, useState, useCallback, useMemo } from "react";
import { 
  Box, Typography, Button, FormControl, InputLabel, Select, 
  MenuItem, OutlinedInput, Chip, Checkbox, ListItemText 
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { fetchData } from "../../../api/uploadService";
import OutstandingTable from "./OutstandingTable";

const NAVIGATION_MAP = {
  total: {
    title: "Total Outstanding – Branch Summary",
    branchApi: "/api/outstanding/total_branch_outstanding",
    saApi: "/api/outstanding/total_sa_outstanding",
    partyApi: "/api/outstanding/total_party_outstanding",
    paths: {
      branch: "/DashboardHome/total_branch_outstanding",
      sa: "/DashboardHome/total_sa_outstanding",
      party: "/DashboardHome/total_party_outstanding"
    }
  },
  cash: {
    title: "Cash Outstanding – Branch Summary",
    branchApi: "/api/outstanding/cash_branch_outstanding",
    saApi: "/api/outstanding/cash_sa_outstanding", 
    partyApi: "/api/outstanding/cash_party_outstanding",
    paths: {
      branch: "/DashboardHome/cash_branch_outstanding",
      sa: "/DashboardHome/cash_sa_outstanding",
      party: "/DashboardHome/cash_party_outstanding"
    }
  },
  insurance: {
    title: "Insurance Outstanding – Branch Summary",
    branchApi: "/api/outstanding/insurance_branch_outstanding",
    saApi: "/api/outstanding/insurance_sa_outstanding",
    partyApi: "/api/outstanding/insurance_party_outstanding",
    paths: {
      branch: "/DashboardHome/insurance_branch_outstanding",
      sa: "/DashboardHome/insurance_sa_outstanding",
      party: "/DashboardHome/insurance_party_outstanding"
    }
  },
  invoice: {
    title: "Invoice Outstanding – Branch Summary",
    branchApi: "/api/outstanding/invoice_branch_outstanding",
    saApi: "/api/outstanding/invoice_sa_outstanding",
    partyApi: "/api/outstanding/invoice_party_outstanding",
    paths: {
      branch: "/DashboardHome/invoice_branch_outstanding",
      sa: "/DashboardHome/invoice_sa_outstanding",
      party: "/DashboardHome/invoice_party_outstanding"
    }
  },
  others: {
    title: "Others Outstanding – Branch Summary", 
    branchApi: "/api/outstanding/others_branch_outstanding",
    saApi: "/api/outstanding/others_sa_outstanding",
    partyApi: "/api/outstanding/others_party_outstanding",
    paths: {
      branch: "/DashboardHome/others_branch_outstanding",
      sa: "/DashboardHome/others_sa_outstanding",
      party: "/DashboardHome/others_party_outstanding"
    }
  }
};

const OutstandingPage = ({ type = "cash" }) => {
  // ✅ ALL HOOKS AT TOP LEVEL - NO EARLY RETURNS BEFORE HOOKS
  const navigate = useNavigate();
  
  const [config, setConfig] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredData, setFilteredData] = useState([]);
  const [workshopFilter, setWorkshopFilter] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [selectedAdvisor, setSelectedAdvisor] = useState(null);
  const [showPartyView, setShowPartyView] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'balanceAmt', direction: 'asc' });

  const [saData, setSaData] = useState([]);
  const [saLoading, setSaLoading] = useState(false);
  const [saFilteredData, setSaFilteredData] = useState([]);
  const [saAdvisorFilter, setSaAdvisorFilter] = useState([]);
  const [saSortConfig, setSaSortConfig] = useState({ key: 'balanceAmt', direction: 'asc' });
  const [saAdvisorOptions, setSaAdvisorOptions] = useState([]);

  const [partyData, setPartyData] = useState([]);
  const [partyLoading, setPartyLoading] = useState(false);
  const [partyFilteredData, setPartyFilteredData] = useState([]);
  const [partySortConfig, setPartySortConfig] = useState({ key: 'balanceAmt', direction: 'asc' });

  const [showContactColumn, setShowContactColumn] = useState(false);
  const [workshopOptions, setWorkshopOptions] = useState([]);

  // Set config on mount
  useEffect(() => {
    const navConfig = NAVIGATION_MAP[type];
    if (navConfig) {
      setConfig(navConfig);
    }
  }, [type]);

  const loadData = useCallback(async (apiEndpoint) => {
    try {
      const res = await fetchData(apiEndpoint);
      return Array.isArray(res) ? res : [];
    } catch (error) {
      console.error('Fetch error:', error);
      return [];
    }
  }, []);

  // Fetch initial branch data
  useEffect(() => {
    if (!config?.branchApi) return;
    
    const initData = async () => {
      setLoading(true);
      const branchData = await loadData(config.branchApi);
      setData(branchData);
      
      const workshops = branchData.reduce((acc, row) => {
        const workshop = row.segment || null;
        const workshopValue = workshop || "null";
        if (workshopValue && !acc.find(w => w.value === workshopValue)) {
          acc.push({ 
            label: workshopValue === "null" ? "No Workshop" : workshopValue, 
            value: workshopValue 
          });
        }
        return acc;
      }, []).sort((a, b) => a.label.localeCompare(b.label));
      
      setWorkshopOptions(workshops);
      setFilteredData(branchData);
      setLoading(false);
    };
    initData();
  }, [config?.branchApi, loadData]);

  // ✅ FIXED: Load SA data - Handle empty SA case properly
  useEffect(() => {
    if (selectedBranch && !showPartyView && config?.saApi) {
      const loadSaData = async () => {
        setSaLoading(true);
        const res = await loadData(config.saApi);
        const branchData = res.filter(row => 
          row.branchName === selectedBranch || row.segment === selectedBranch
        );
        
        let finalSaData;
        let advisorOptions = [];
        
        // ✅ Check if branch has any advisors
        if (branchData.length === 0) {
          // ✅ NO ADVISORS - Create single EMPTY row
          finalSaData = [{
            salesMan: null, // ✅ Explicitly null for empty
            branchName: selectedBranch,
            segment: selectedBranch,
            balanceAmt: 0,
            billAmt: 0,
            upToSeven: 0,
            eightToThirty: 0,
            thirtyOneToNinty: 0,
            grtNinty: 0
          }];
        } else {
          // ✅ HAS ADVISORS - Use actual data
          finalSaData = branchData;
          // Build advisor options from actual data
          advisorOptions = branchData.reduce((acc, row) => {
            const advisorValue = row.salesMan || "null";
            if (advisorValue && !acc.find(a => a.value === advisorValue)) {
              acc.push({
                label: advisorValue === "null" ? "No Advisor" : advisorValue,
                value: advisorValue
              });
            }
            return acc;
          }, []).sort((a, b) => a.label.localeCompare(b.label));
        }

        setSaData(finalSaData);
        setSaAdvisorOptions(advisorOptions);
        setSaFilteredData(finalSaData);
        setSaLoading(false);
      };
      loadSaData();
    }
  }, [selectedBranch, showPartyView, config?.saApi, loadData]);

  // ✅ FIXED: Load Party data - Handle empty SA clicks properly
  useEffect(() => {
    if (selectedAdvisor !== null && showPartyView && config?.partyApi && selectedBranch) {
      const loadPartyData = async () => {
        setPartyLoading(true);
        const res = await loadData(config.partyApi);
        
        let advisorData;
        if (selectedAdvisor === null || selectedAdvisor === "null") {
          // ✅ EMPTY SA CLICK - Show ALL parties for this branch ONLY
          advisorData = res.filter(row => 
            (row.branchName === selectedBranch || row.segment === selectedBranch)
          );
        } else {
          // ✅ NORMAL ADVISOR - Filter by both advisor AND branch
          advisorData = res.filter(row => 
            row.salesMan === selectedAdvisor &&
            (row.branchName === selectedBranch || row.segment === selectedBranch)
          );
        }
        
        setPartyData(advisorData);
        setPartyFilteredData(advisorData);
        setPartyLoading(false);
      };
      loadPartyData();
    }
  }, [selectedAdvisor, selectedBranch, showPartyView, config?.partyApi, loadData]);

  const handleBranchClick = useCallback((branchName) => {
    setSelectedBranch(branchName);
    setSelectedAdvisor(null);
    setShowDetailView(true);
    setShowPartyView(false);
  }, []);

  // ✅ FIXED: Handle empty advisor clicks
  const handleAdvisorClick = useCallback((advisorName) => {
    setSelectedAdvisor(advisorName); // Pass actual value (null or string)
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

  const handleSummarySort = useCallback((config) => setSortConfig(config), []);
  const handleSaSort = useCallback((config) => setSaSortConfig(config), []);
  const handlePartySort = useCallback((config) => setPartySortConfig(config), []);

  const toggleContactColumn = useCallback(() => {
    setShowContactColumn(prev => !prev);
  }, []);

  const handleWorkshopChange = useCallback((event) => {
    const value = event.target.value;
    if (typeof value === 'string') value = [value];
    setWorkshopFilter(value || []);
  }, []);

  const handleSaAdvisorChange = useCallback((event) => {
    const value = event.target.value;
    if (typeof value === 'string') value = [value];
    setSaAdvisorFilter(value || []);
  }, []);

  // Filter/sort logic for branch view
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

  // Filter/sort logic for SA view
  useEffect(() => {
    let filtered = saData;
    if (saAdvisorFilter.length > 0) {
      filtered = filtered.filter(row => {
        const advisorValue = row.salesMan || null;
        return saAdvisorFilter.includes(advisorValue);
      });
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

  // Filter/sort logic for party view
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

  const totals = useMemo(() => filteredData.reduce((acc, row) => {
    acc.balanceAmt += row.balanceAmt || 0;
    acc.billAmt += row.billAmt || 0;
    acc.upToSeven += row.upToSeven || 0;
    acc.eightToThirty += row.eightToThirty || 0;
    acc.thirtyOneToNinty += row.thirtyOneToNinty || 0;
    acc.grtNinty += row.grtNinty || 0;
    return acc;
  }, { balanceAmt: 0, billAmt: 0, upToSeven: 0, eightToThirty: 0, thirtyOneToNinty: 0, grtNinty: 0 }), [filteredData]);

  const saTotals = useMemo(() => saFilteredData.reduce((acc, row) => {
    acc.balanceAmt += row.balanceAmt || 0;
    acc.billAmt += row.billAmt || 0;
    acc.upToSeven += row.upToSeven || 0;
    acc.eightToThirty += row.eightToThirty || 0;
    acc.thirtyOneToNinty += row.thirtyOneToNinty || 0;
    acc.grtNinty += row.grtNinty || 0;
    return acc;
  }, { balanceAmt: 0, billAmt: 0, upToSeven: 0, eightToThirty: 0, thirtyOneToNinty: 0, grtNinty: 0 }), [saFilteredData]);

  const partyTotals = useMemo(() => partyFilteredData.reduce((acc, row) => {
    acc.balanceAmt += row.balanceAmt || 0;
    acc.billAmt += row.billAmt || 0;
    acc.upToSeven += row.upToSeven || 0;
    acc.eightToThirty += row.eightToThirty || 0;
    acc.thirtyOneToNinty += row.thirtyOneToNinty || 0;
    acc.grtNinty += row.grtNinty || 0;
    return acc;
  }, { balanceAmt: 0, billAmt: 0, upToSeven: 0, eightToThirty: 0, thirtyOneToNinty: 0, grtNinty: 0 }), [partyFilteredData]);

  const formatCurrency = (value) => new Intl.NumberFormat('en-IN', {
    style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 0
  }).format(value || 0);

  // ✅ FIXED: Level-aware display functions - Properly handle empty SA display
  const getTableProps = useCallback((level) => {
    const baseProps = {
      formatCurrency,
      selectedBranch,
      selectedAdvisor,
      showContactColumn,
      onToggleContactColumn: toggleContactColumn,
      getRowKey: (row, index) => row.partyName || row.salesMan || row.segment || index,
      // ✅ FIXED: Display name logic - show EMPTY for no SA
      getDisplayName: (row, tableLevel) => {
        switch (tableLevel) {
          case 'sa':
            return row.salesMan || ''; // ✅ Empty string for no SA rows
          case 'party':
            return row.partyName || row.customerName || '';
          case 'branch':
          default:
            return row.segment || row.branchName || '';
        }
      },
      getSegmentName: (row) => row.segment || row.branchName || '',
      getAdvisorName: (row) => row.salesMan || ''
    };

    switch (level) {
      case 'party':
        return {
          ...baseProps,
          level: "party",
          data: partyData,
          filteredData: partyFilteredData,
          totals: partyTotals,
          onRowClick: () => {}, // No further drill down
          onBack: backToBranchView,
          filters: [],
          filterOptions: [],
          onFilterChange: () => {},
          sortConfig: partySortConfig,
          onSort: handlePartySort,
          loading: partyLoading,
          title: "",
          navigatePath: config?.paths?.party,
          apiEndpoints: []
        };
      case 'sa':
        return {
          ...baseProps,
          level: "sa",
          data: saData,
          filteredData: saFilteredData,
          totals: saTotals,
          onRowClick: handleAdvisorClick, // ✅ Click works for both null and actual advisors
          onBack: backToSummary,
          filters: saAdvisorFilter,
          filterOptions: saAdvisorOptions,
          onFilterChange: handleSaAdvisorChange,
          sortConfig: saSortConfig,
          onSort: handleSaSort,
          loading: saLoading,
          title: selectedBranch,
          navigatePath: config?.paths?.sa,
          apiEndpoints: []
        };
      case 'branch':
      default:
        return {
          ...baseProps,
          level: "branch",
          data,
          filteredData,
          totals,
          onRowClick: handleBranchClick,
          onBack: backToSummary,
          filters: workshopFilter,
          filterOptions: workshopOptions,
          onFilterChange: handleWorkshopChange,
          sortConfig,
          onSort: handleSummarySort,
          loading,
          title: `${type.charAt(0).toUpperCase() + type.slice(1)} Branch Outstanding`,
          navigatePath: config?.paths?.branch,
          apiEndpoints: []
        };
    }
  }, [
    formatCurrency, selectedBranch, selectedAdvisor, showContactColumn, toggleContactColumn,
    partyData, partyFilteredData, partyTotals, backToBranchView, partySortConfig, 
    handlePartySort, partyLoading, config?.paths?.party,
    saData, saFilteredData, saTotals, handleAdvisorClick, backToSummary, saAdvisorFilter, 
    saAdvisorOptions, handleSaAdvisorChange, saSortConfig, handleSaSort, saLoading, 
    config?.paths?.sa, data, filteredData, totals, handleBranchClick, workshopFilter, 
    workshopOptions, handleWorkshopChange, sortConfig, handleSummarySort, loading, 
    config?.paths?.branch, type, partySortConfig
  ]);

  // ✅ EARLY RETURNS ONLY AFTER ALL HOOKS
  if (!config) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">
          Invalid outstanding type: {type}. Expected one of: cash, insurance, invoice, others
        </Typography>
      </Box>
    );
  }

  if (loading && !showDetailView && !showPartyView) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  const renderNavigationButtons = () => (
    <Box sx={{ display: "flex", gap: 1 }}>
      <Button variant="contained" onClick={() => navigate("/DashboardHome/total_branch_outstanding")}>Total</Button>
      <Button variant="contained" onClick={() => navigate("/DashboardHome/cash_branch_outstanding")}>Cash</Button>
      <Button variant="contained" onClick={() => navigate("/DashboardHome/invoice_branch_outstanding")}>Invoice</Button>
      <Button variant="contained" onClick={() => navigate("/DashboardHome/insurance_branch_outstanding")}>Insurance</Button>
      <Button variant="contained" onClick={() => navigate("/DashboardHome/others_branch_outstanding")}>Others</Button>
    </Box>
  );

  const renderFilters = (level) => {
    if (level === 'branch') {
      return (
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
            <Chip 
              label="Clear Filters" 
              onClick={() => setWorkshopFilter([])} 
              color="error" 
              variant="outlined" 
              sx={{ height: 40 }} 
            />
          )}
        </Box>
      );
    }
    
    if (level === 'sa') {
      return (
        <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "end", flexWrap: "wrap" }}>
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel>Service Advisors</InputLabel>
            <Select 
              multiple 
              value={saAdvisorFilter} 
              onChange={handleSaAdvisorChange}
              input={<OutlinedInput label="Service Advisors" />}
            >
              {saAdvisorOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Checkbox checked={saAdvisorFilter.indexOf(option.value) > -1} />
                  <ListItemText primary={option.label} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {saAdvisorFilter.length > 0 && (
            <Chip 
              label="Clear Filters" 
              onClick={() => setSaAdvisorFilter([])} 
              color="error" 
              variant="outlined" 
              sx={{ height: 40 }} 
            />
          )}
        </Box>
      );
    }
    return null;
  };

  if (showPartyView) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Button variant="outlined" onClick={backToBranchView}>
              ← Back to Service Advisors ({selectedBranch})
            </Button>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {selectedAdvisor ? selectedAdvisor : 'All Parties'} - Party Details ({selectedBranch})
            </Typography>
          </Box>
          <Button variant="contained" onClick={() => navigate(config.paths.party)}>
            All Parties
          </Button>
        </Box>
        <OutstandingTable {...getTableProps('party')} />
      </Box>
    );
  }

  if (showDetailView) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Button variant="outlined" onClick={backToSummary}>← Back to Branches</Button>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {selectedBranch} - Service Advisors
            </Typography>
          </Box>
          <Button variant="contained" onClick={() => navigate(config.paths.sa)}>All SA</Button>
        </Box>
        {renderFilters('sa')}
        <OutstandingTable {...getTableProps('sa')} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>{config.title}</Typography>
        {renderNavigationButtons()}
      </Box>
      {renderFilters('branch')}
      <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
        Showing {filteredData.length} records | Sorted by: {sortConfig.key} ({sortConfig.direction.toUpperCase()})
      </Typography>
      <OutstandingTable {...getTableProps('branch')} />
    </Box>
  );
};

export default OutstandingPage;
