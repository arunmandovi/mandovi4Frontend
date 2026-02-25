import React, { useEffect, useState, useCallback, useMemo } from "react";
import { 
  Box, Typography, Button, FormControl, InputLabel, Select, 
  MenuItem, OutlinedInput, Chip, Checkbox, ListItemText 
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { fetchData } from "../../../api/uploadService";
import * as XLSX from 'xlsx';
import OutstandingTable from "./OutstandingTable";

const NAVIGATION_MAP = {
  total: {
    title: "Total Outstanding – Branch Summary",
    filename: "Total_Outstanding_Branch_Summary",
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
    filename: "Cash_Outstanding_Branch_Summary",
    branchApi: "/api/outstanding/cash_branch_outstanding",
    saApi: "/api/outstanding/cash_sa_outstanding", 
    partyApi: "/api/outstanding/cash_party_outstanding",
    paths: {
      branch: "/DashboardHome/cash_branch_outstanding",
      sa: "/DashboardHome/cash_sa_outstanding",
      party: "/DashboardHome/cash_party_outstanding"
    }
  },
  invoice: {
    title: "Invoice Outstanding – Branch Summary",
    filename: "Invoice_Outstanding_Branch_Summary",
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
    filename: "Others_Outstanding_Branch_Summary",
    branchApi: "/api/outstanding/others_branch_outstanding",
    saApi: "/api/outstanding/others_sa_outstanding",
    partyApi: "/api/outstanding/others_party_outstanding",
    paths: {
      branch: "/DashboardHome/others_branch_outstanding",
      sa: "/DashboardHome/others_sa_outstanding",
      party: "/DashboardHome/others_party_outstanding"
    }
  },
  id: {
    title: "Insurance Outstanding – Branch Summary",
    filename: "ID_Outstanding_Branch_Summary",
    branchApi: "/api/outstanding/id_branch_outstanding",
    insuranceApi: "/api/outstanding/id_sa_outstanding",
    partyApi: "/api/outstanding/id_party_outstanding",
    paths: {
      branch: "/DashboardHome/id_branch_outstanding",
      insurance: "/DashboardHome/id_sa_outstanding",
      party: "/DashboardHome/id_party_outstanding"
    }
  },
  customercollect: {
    title: "Customer Collect Outstanding – Branch Summary",
    filename: "CustomerCollect_Outstanding_Branch_Summary",
    branchApi: "/api/outstanding/cc_branch_outstanding",
    saApi: "/api/outstanding/cc_sa_outstanding",
    partyApi: "/api/outstanding/cc_party_outstanding",
    paths: {
      branch: "/DashboardHome/customercollect_branch_outstanding",
      sa: "/DashboardHome/customercollect_sa_outstanding",
      party: "/DashboardHome/customercollect_party_outstanding"
    }
  }
};

const OutstandingPage = ({ type = "cash" }) => {
  const navigate = useNavigate();
  
  // ✅ ALL STATE
  const [config, setConfig] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredData, setFilteredData] = useState([]);
  const [workshopFilter, setWorkshopFilter] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [selectedInsuranceParty, setSelectedInsuranceParty] = useState(null);  // For ID type
  const [selectedAdvisor, setSelectedAdvisor] = useState(null);  // For other types
  const [showPartyView, setShowPartyView] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'balanceAmt', direction: 'asc' });
  
  // Common second layer states
  const [detailData, setDetailData] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailFilteredData, setDetailFilteredData] = useState([]);
  const [detailSortConfig, setDetailSortConfig] = useState({ key: 'balanceAmt', direction: 'asc' });
  const [detailFilter, setDetailFilter] = useState([]);
  const [detailFilterOptions, setDetailFilterOptions] = useState([]);
  
  const [partyData, setPartyData] = useState([]);
  const [partyLoading, setPartyLoading] = useState(false);
  const [partyFilteredData, setPartyFilteredData] = useState([]);
  const [partySortConfig, setPartySortConfig] = useState({ key: 'balanceAmt', direction: 'asc' });
  const [showContactColumn, setShowContactColumn] = useState(false);
  const [workshopOptions, setWorkshopOptions] = useState([]);

  // ✅ ALL TOTALS
  const totals = useMemo(() => {
    const initialTotals = { 
      balanceAmt: 0, billAmt: 0, upToSeven: 0, eightToThirty: 0, 
      thirtyOneToNinty: 0, grtNinty: 0, insuranceAmt: 0, differenceAmt: 0
    };
    return filteredData.reduce((acc, row) => {
      Object.keys(initialTotals).forEach(key => {
        acc[key] += row[key] || 0;
      });
      return acc;
    }, initialTotals);
  }, [filteredData]);

  const detailTotals = useMemo(() => {
    const initialTotals = { 
      balanceAmt: 0, billAmt: 0, upToSeven: 0, eightToThirty: 0, 
      thirtyOneToNinty: 0, grtNinty: 0, insuranceAmt: 0, differenceAmt: 0
    };
    return detailFilteredData.reduce((acc, row) => {
      Object.keys(initialTotals).forEach(key => {
        acc[key] += row[key] || 0;
      });
      return acc;
    }, initialTotals);
  }, [detailFilteredData]);

  const partyTotals = useMemo(() => {
    const initialTotals = { 
      balanceAmt: 0, billAmt: 0, upToSeven: 0, eightToThirty: 0, 
      thirtyOneToNinty: 0, grtNinty: 0, insuranceAmt: 0, differenceAmt: 0
    };
    return partyFilteredData.reduce((acc, row) => {
      Object.keys(initialTotals).forEach(key => {
        acc[key] += row[key] || 0;
      });
      return acc;
    }, initialTotals);
  }, [partyFilteredData]);

  // ✅ HELPER: Get second layer column header
  const getSecondLayerHeader = () => type === 'id' ? 'Insurance Party' : 'Service Advisor';

  // ✅ HELPER: Format workshop value for display and filtering
  const getWorkshopValue = (workshop) => workshop || "null";
  const getWorkshopLabel = (value) => value === "null" ? "No Workshop" : value;

  // ✅ DOWNLOAD FUNCTIONS
  const downloadBranchExcel = useCallback(() => {
    try {
      const columns = ['billAmt', 'balanceAmt', 'upToSeven', 'eightToThirty', 'thirtyOneToNinty', 'grtNinty'];
      if (type === 'id') columns.push('insuranceAmt', 'differenceAmt');
      
      const excelData = filteredData.map((row, index) => {
        const rowData = { 'S.No': index + 1, 'Branch/Workshop': row.segment || row.branchName || '' };
        columns.forEach(col => {
          rowData[col.charAt(0).toUpperCase() + col.slice(1).replace(/([A-Z])/g, ' $1')] = row[col] || 0;
        });
        return rowData;
      });

      excelData.push({
        'S.No': '', 'Branch/Workshop': 'GRAND TOTAL',
        ...columns.reduce((acc, col) => {
          acc[col.charAt(0).toUpperCase() + col.slice(1).replace(/([A-Z])/g, ' $1')] = totals[col] || 0;
          return acc;
        }, {})
      });

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(wb, ws, 'Branch Summary');
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      XLSX.writeFile(wb, `${config?.filename || 'Branch_Summary'}_${timestamp}.xlsx`);
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed');
    }
  }, [filteredData, totals, config?.filename, type]);

  const downloadDetailExcel = useCallback(() => {
    try {
      const columns = ['billAmt', 'balanceAmt', 'upToSeven', 'eightToThirty', 'thirtyOneToNinty', 'grtNinty'];
      if (type === 'id') columns.push('insuranceAmt', 'differenceAmt');
      
      const excelData = detailFilteredData.map((row, index) => ({
        'S.No': index + 1,
        [getSecondLayerHeader()]: type === 'id' ? (row.insuranceParty || '') : (row.salesMan || ''),
        'Branch': selectedBranch || '',
        ...columns.reduce((acc, col) => {
          acc[col.charAt(0).toUpperCase() + col.slice(1).replace(/([A-Z])/g, ' $1')] = row[col] || 0;
          return acc;
        }, {})
      }));

      excelData.push({
        'S.No': '', 
        [getSecondLayerHeader()]: 'GRAND TOTAL',
        'Branch': selectedBranch || '',
        ...columns.reduce((acc, col) => {
          acc[col.charAt(0).toUpperCase() + col.slice(1).replace(/([A-Z])/g, ' $1')] = detailTotals[col] || 0;
          return acc;
        }, {})
      });

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(wb, ws, `${selectedBranch}_${type === 'id' ? 'Insurance' : 'SA'}`);
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      XLSX.writeFile(wb, `${config?.filename || 'Detail_Summary'}_${selectedBranch}_${timestamp}.xlsx`);
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed');
    }
  }, [detailFilteredData, detailTotals, config?.filename, selectedBranch, type, getSecondLayerHeader]);

  const downloadPartyExcel = useCallback(() => {
    try {
      const columns = ['billAmt', 'balanceAmt', 'upToSeven', 'eightToThirty', 'thirtyOneToNinty', 'grtNinty'];
      if (type === 'id') columns.push('insuranceAmt', 'differenceAmt');
      
      const excelData = partyFilteredData.map((row, index) => ({
        'S.No': index + 1,
        'Party Name': row.partyName || row.customerName || '',
        'Workshop': row.segment || '',
        ...(type === 'id' ? { 
          'Insurance Party': row.insuranceParty || '', 
          'Service Advisor': row.salesMan || '',
          'Bill No': row.billNo || ''
        } : { 
          'Service Advisor': row.salesMan || '',
          'Bill No': row.billNo || ''
        }),
        ...columns.reduce((acc, col) => {
          acc[col.charAt(0).toUpperCase() + col.slice(1).replace(/([A-Z])/g, ' $1')] = row[col] || 0;
          return acc;
        }, {})
      }));

      excelData.push({
        'S.No': '', 'Party Name': 'GRAND TOTAL', 'Workshop': '',
        ...(type === 'id' ? { 
          'Insurance Party': selectedInsuranceParty || '', 
          'Service Advisor': '', 
          'Bill No': ''
        } : { 
          'Service Advisor': selectedAdvisor || '',
          'Bill No': ''
        }),
        ...columns.reduce((acc, col) => {
          acc[col.charAt(0).toUpperCase() + col.slice(1).replace(/([A-Z])/g, ' $1')] = partyTotals[col] || 0;
          return acc;
        }, {})
      });

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(wb, ws, `${selectedBranch}_${selectedInsuranceParty || selectedAdvisor || 'All_Parties'}`);
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      XLSX.writeFile(wb, `${config?.filename || 'Party_Summary'}_${selectedBranch}_${selectedInsuranceParty || selectedAdvisor || 'All_Parties'}_${timestamp}.xlsx`);
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed');
    }
  }, [partyFilteredData, partyTotals, config?.filename, selectedBranch, selectedInsuranceParty, selectedAdvisor, type]);

  // ✅ CORE FUNCTIONS
  useEffect(() => {
    const navConfig = NAVIGATION_MAP[type];
    if (navConfig) setConfig(navConfig);
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

  useEffect(() => {
    if (!config?.branchApi) return;
    const initData = async () => {
      setLoading(true);
      const branchData = await loadData(config.branchApi);
      setData(branchData);
      
      // ✅ FIXED: Proper workshop options generation
      const workshops = branchData.reduce((acc, row) => {
        const workshopValue = getWorkshopValue(row.segment);
        if (workshopValue && !acc.find(w => w.value === workshopValue)) {
          acc.push({ 
            label: getWorkshopLabel(workshopValue), 
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

  // ✅ SECOND LAYER: Detail data loading (SA for others, Insurance for ID)
  useEffect(() => {
    if (selectedBranch && !showPartyView) {
      const loadDetailData = async () => {
        setDetailLoading(true);
        
        if (type === 'id' && config?.insuranceApi) {
          // ID: Load insurance summary from id_sa_outstanding
          const res = await loadData(config.insuranceApi);
          const branchData = res.filter(row => 
            row.segment === selectedBranch || row.branchName === selectedBranch
          );
          
          const finalData = branchData.length === 0 ? [{
            segment: selectedBranch, insuranceParty: null, partyName: null, salesMan: null, billNo: null,
            balanceAmt: 0, billAmt: 0, upToSeven: 0, eightToThirty: 0,
            thirtyOneToNinty: 0, grtNinty: 0, insuranceAmt: 0, differenceAmt: 0
          }] : branchData;

          const insuranceOptions = finalData.reduce((acc, row) => {
            const insuranceValue = row.insuranceParty || "null";
            if (insuranceValue && !acc.find(i => i.value === insuranceValue)) {
              acc.push({ 
                label: insuranceValue === "null" ? "No Insurance Party" : insuranceValue, 
                value: insuranceValue 
              });
            }
            return acc;
          }, []).sort((a, b) => a.label.localeCompare(b.label));

          setDetailData(finalData);
          setDetailFilterOptions(insuranceOptions);
          setDetailFilteredData(finalData);
        } else if (config?.saApi) {
          // Other types: Load SA data
          const res = await loadData(config.saApi);
          const branchData = res.filter(row => 
            row.branchName === selectedBranch || row.segment === selectedBranch
          );
          
          const finalData = branchData.length === 0 ? [{
            salesMan: null, branchName: selectedBranch, segment: selectedBranch,
            balanceAmt: 0, billAmt: 0, upToSeven: 0, eightToThirty: 0,
            thirtyOneToNinty: 0, grtNinty: 0, insuranceAmt: 0, differenceAmt: 0
          }] : branchData;

          const advisorOptions = finalData.reduce((acc, row) => {
            const advisorValue = row.salesMan || "null";
            if (advisorValue && !acc.find(a => a.value === advisorValue)) {
              acc.push({ 
                label: advisorValue === "null" ? "No Advisor" : advisorValue, 
                value: advisorValue 
              });
            }
            return acc;
          }, []).sort((a, b) => a.label.localeCompare(b.label));

          setDetailData(finalData);
          setDetailFilterOptions(advisorOptions);
          setDetailFilteredData(finalData);
        }
        
        setDetailLoading(false);
      };
      loadDetailData();
    }
  }, [selectedBranch, showPartyView, config?.saApi, config?.insuranceApi, loadData, type]);

  // ✅ THIRD LAYER: Party data loading
  useEffect(() => {
    if ((type === 'id' ? selectedInsuranceParty : selectedAdvisor) !== null && showPartyView && config?.partyApi && selectedBranch) {
      const loadPartyData = async () => {
        setPartyLoading(true);
        const res = await loadData(config.partyApi);
        
        let filteredData;
        if (type === 'id') {
          // ID: Filter by insuranceParty
          filteredData = selectedInsuranceParty === null || selectedInsuranceParty === "null"
            ? res.filter(row => row.segment === selectedBranch || row.branchName === selectedBranch)
            : res.filter(row => row.insuranceParty === selectedInsuranceParty && (row.segment === selectedBranch || row.branchName === selectedBranch));
        } else {
          // Others: Filter by salesMan
          filteredData = selectedAdvisor === null || selectedAdvisor === "null"
            ? res.filter(row => row.branchName === selectedBranch || row.segment === selectedBranch)
            : res.filter(row => row.salesMan === selectedAdvisor && (row.branchName === selectedBranch || row.segment === selectedBranch));
        }
        
        setPartyData(filteredData);
        setPartyFilteredData(filteredData);
        setPartyLoading(false);
      };
      loadPartyData();
    }
  }, [selectedInsuranceParty, selectedAdvisor, selectedBranch, showPartyView, config?.partyApi, loadData, type]);

  // ✅ HANDLERS
  const handleBranchClick = useCallback((branchName) => {
    setSelectedBranch(branchName);
    if (type === 'id') setSelectedInsuranceParty(null);
    else setSelectedAdvisor(null);
    setShowDetailView(true);
    setShowPartyView(false);
  }, [type]);

  const handleDetailClick = useCallback((detailName) => {
    if (type === 'id') {
      setSelectedInsuranceParty(detailName);
    } else {
      setSelectedAdvisor(detailName);
    }
    setShowPartyView(true);
  }, [type]);

  const backToBranchView = useCallback(() => {
    setShowPartyView(false);
    if (type === 'id') setSelectedInsuranceParty(null);
    else setSelectedAdvisor(null);
  }, [type]);

  const backToSummary = useCallback(() => {
    setShowDetailView(false);
    setShowPartyView(false);
    setSelectedBranch(null);
    if (type === 'id') setSelectedInsuranceParty(null);
    else setSelectedAdvisor(null);
  }, [type]);

  // ✅ FIXED FILTERING & SORTING
  useEffect(() => {
    let filtered = [...data];
    
    // ✅ FIXED: Proper workshop filtering logic
    if (workshopFilter.length > 0) {
      filtered = filtered.filter(row => {
        const rowWorkshop = getWorkshopValue(row.segment);
        return workshopFilter.includes(rowWorkshop);
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

  useEffect(() => {
    let filtered = [...detailData];
    if (detailFilter.length > 0) {
      const filterField = type === 'id' ? 'insuranceParty' : 'salesMan';
      filtered = filtered.filter(row => detailFilter.includes(row[filterField] || "null"));
    }
    if (detailSortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[detailSortConfig.key] || 0;
        const bValue = b[detailSortConfig.key] || 0;
        if (aValue < bValue) return detailSortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return detailSortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    setDetailFilteredData(filtered);
  }, [detailFilter, detailData, detailSortConfig, type]);

  useEffect(() => {
    let filtered = [...partyData];
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

  const formatCurrency = (value) => new Intl.NumberFormat('en-IN', {
    style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 0
  }).format(value || 0);

  // ✅ TABLE PROPS - FIXED HEADER
  const getTableProps = useCallback((level) => {
    const baseProps = {
      formatCurrency, 
      type, 
      selectedBranch, 
      selectedAdvisor: type === 'id' ? selectedInsuranceParty : selectedAdvisor,
      secondLayerHeader: getSecondLayerHeader(),
      showContactColumn, 
      onToggleContactColumn: () => setShowContactColumn(prev => !prev),
      getRowKey: (row, index) => row.partyName || row.billNo || (type === 'id' ? row.insuranceParty : row.salesMan) || row.segment || index,
      getDisplayName: (row, tableLevel) => {
        switch (tableLevel) {
          case 'detail':
          case 'sa': 
            return type === 'id' ? (row.insuranceParty || '') : (row.salesMan || '');
          case 'party': 
            return row.partyName || row.customerName || '';
          case 'branch':
          default: 
            return row.segment || row.branchName || '';
        }
      },
      getSegmentName: (row) => row.segment || row.branchName || '',
      getAdvisorName: (row) => type === 'id' ? (row.insuranceParty || '') : (row.salesMan || '')
    };

    switch (level) {
      case 'party':
        return { 
          ...baseProps, 
          level: "party", 
          data: partyData, 
          filteredData: partyFilteredData,
          totals: partyTotals, 
          onRowClick: () => {}, 
          onBack: backToBranchView,
          filters: [], 
          filterOptions: [], 
          onFilterChange: () => {}, 
          sortConfig: partySortConfig, 
          onSort: (config) => setPartySortConfig(config),
          loading: partyLoading, 
          title: "", 
          navigatePath: config?.paths?.party,
          apiEndpoints: [], 
          showAllColumns: type === 'id'
        };
      case 'detail':
      case 'sa':
        return { 
          ...baseProps, 
          level: "sa", 
          data: detailData, 
          filteredData: detailFilteredData,
          totals: detailTotals, 
          onRowClick: handleDetailClick, 
          onBack: backToSummary,
          filters: detailFilter, 
          filterOptions: detailFilterOptions, 
          onFilterChange: (e) => {
            const value = e.target.value || [];
            if (typeof value === 'string') value = [value];
            setDetailFilter(value);
          },
          sortConfig: detailSortConfig, 
          onSort: (config) => setDetailSortConfig(config),
          loading: detailLoading, 
          title: selectedBranch,
          navigatePath: type === 'id' ? config?.paths?.insurance : config?.paths?.sa
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
          onFilterChange: (e) => {
            const value = e.target.value || [];
            if (typeof value === 'string') value = [value];
            setWorkshopFilter(value);
          },
          sortConfig, 
          onSort: (config) => setSortConfig(config), 
          loading, 
          title: `${type.charAt(0).toUpperCase() + type.slice(1)} Branch Outstanding`,
          navigatePath: config?.paths?.branch
        };
    }
  }, [formatCurrency, type, selectedBranch, selectedInsuranceParty, selectedAdvisor, showContactColumn, 
    partyData, partyFilteredData, partyTotals, backToBranchView, partySortConfig, partyLoading, 
    detailData, detailFilteredData, detailTotals, handleDetailClick, backToSummary, 
    detailFilter, detailFilterOptions, detailSortConfig, detailLoading,
    data, filteredData, totals, handleBranchClick, workshopFilter, workshopOptions, sortConfig, loading,
    config?.paths?.party, config?.paths?.insurance, config?.paths?.sa, config?.paths?.branch, getSecondLayerHeader]);

  // ✅ FIXED: renderFilters with proper display logic
  const renderFilters = (level) => {
    if (level === 'branch') {
      return (
        <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "end", flexWrap: "wrap" }}>
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel>Workshops</InputLabel>
            <Select 
              multiple 
              value={workshopFilter} 
              input={<OutlinedInput label="Workshops" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip 
                      key={value} 
                      label={getWorkshopLabel(value)} 
                      size="small" 
                    />
                  ))}
                </Box>
              )}
              onChange={(e) => {
                const value = e.target.value || [];
                if (typeof value === 'string') {
                  setWorkshopFilter([value]);
                } else {
                  setWorkshopFilter(value);
                }
              }}
            >
              {workshopOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Checkbox checked={workshopFilter.includes(option.value)} />
                  <ListItemText primary={option.label} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {workshopFilter.length > 0 && (
            <Chip 
              label={`Clear Filters (${workshopFilter.length})`} 
              onClick={() => setWorkshopFilter([])} 
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

  // ✅ RENDER LOGIC
  if (!config) {
    return <Box sx={{ p: 3 }}><Typography color="error">Invalid outstanding type: {type}</Typography></Box>;
  }

  if (loading && !showDetailView && !showPartyView) {
    return <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Typography>Loading...</Typography>
    </Box>;
  }

  const renderNavigationButtons = () => (
    <Box sx={{ display: "flex", gap: 1, flexWrap: 'wrap' }}>
      <Button variant="contained" onClick={() => navigate("/DashboardHome/total_branch_outstanding")} size="small">Total</Button>
      <Button variant="contained" onClick={() => navigate("/DashboardHome/cash_branch_outstanding")} size="small">Cash</Button>
      <Button variant="contained" onClick={() => navigate("/DashboardHome/invoice_branch_outstanding")} size="small">Invoice</Button>
      <Button variant="contained" onClick={() => navigate("/DashboardHome/others_branch_outstanding")} size="small">Others</Button>
      <Button variant="contained" onClick={() => navigate("/DashboardHome/id_branch_outstanding")} size="small">Insurance</Button>
      <Button variant="contained" onClick={() => navigate("/DashboardHome/customercollect_branch_outstanding")} size="small">Customer Collect</Button>
      <Button variant="contained" onClick={downloadBranchExcel} size="small"
        sx={{ backgroundColor: '#4caf50', '&:hover': { backgroundColor: '#45a049' } }}>
        📥 Download
      </Button>
    </Box>
  );

  if (showPartyView) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Button variant="outlined" onClick={backToBranchView}>
              ← Back to {type === 'id' ? 'Insurance Summary' : 'Service Advisors'} ({selectedBranch})
            </Button>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {type === 'id' ? (selectedInsuranceParty || 'All Parties') : (selectedAdvisor || 'All Parties')} - Party Details ({selectedBranch})
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button variant="contained" onClick={() => navigate(config.paths.party)} size="small">All Parties</Button>
            <Button variant="contained" onClick={downloadPartyExcel} size="small"
              sx={{ backgroundColor: '#4caf50', '&:hover': { backgroundColor: '#45a049' } }}>
              📥 Download
            </Button>
          </Box>
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
              {selectedBranch} - {type === 'id' ? 'Insurance Summary' : 'Service Advisors'}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button variant="contained" 
              onClick={() => navigate(type === 'id' ? config.paths.insurance : config.paths.sa)} 
              size="small">
              {type === 'id' ? 'All Insurance' : 'All SA'}
            </Button>
            <Button variant="contained" onClick={downloadDetailExcel} size="small"
              sx={{ backgroundColor: '#4caf50', '&:hover': { backgroundColor: '#45a049' } }}>
              📥 Download
            </Button>
          </Box>
        </Box>
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
        Showing {filteredData.length} of {data.length} records |{' '}
        {workshopFilter.length > 0 && `Filtered by: ${workshopFilter.map(getWorkshopLabel).join(', ')} | `}Sorted by: {sortConfig.key} ({sortConfig.direction.toUpperCase()})
      </Typography>
      <OutstandingTable {...getTableProps('branch')} />
    </Box>
  );
};

export default OutstandingPage;
