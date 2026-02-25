import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TableSortLabel, Paper, Button, Select,
  MenuItem, FormControl, InputLabel, Chip, OutlinedInput, Checkbox,
  ListItemText, TextField
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { fetchData } from "../../../api/uploadService";
import * as XLSX from 'xlsx';

const NAVIGATION_MAP = {
  cash: {
    title: "Cash Outstanding – Party Summary",
    api: "/api/outstanding/cash_party_outstanding",
    branchPath: "/DashboardHome/cash_branch_outstanding",
    filename: "Cash_Outstanding_Party_Summary"
  },
  total: {
    title: "Total Outstanding – Party Summary", 
    api: "/api/outstanding/total_party_outstanding",
    branchPath: "/DashboardHome/total_branch_outstanding",
    filename: "Total_Outstanding_Party_Summary"
  },
  invoice: {
    title: "Invoice Outstanding – Party Summary",
    api: "/api/outstanding/invoice_party_outstanding",
    branchPath: "/DashboardHome/invoice_branch_outstanding",
    filename: "Invoice_Outstanding_Party_Summary"
  },
  insurance: {
    title: "Insurance Outstanding – Party Summary",
    api: "/api/outstanding/insurance_party_outstanding", 
    branchPath: "/DashboardHome/insurance_branch_outstanding",
    filename: "Insurance_Outstanding_Party_Summary"
  },
  others: {
    title: "Others Outstanding – Party Summary",
    api: "/api/outstanding/others_party_outstanding",
    branchPath: "/DashboardHome/others_branch_outstanding",
    filename: "Others_Outstanding_Party_Summary"
  },
  id: {
    title: "Insurance Outstanding – Party Summary",
    api: "/api/outstanding/id_party_outstanding",
    branchPath: "/DashboardHome/id_branch_outstanding",
    filename: "ID_Outstanding_Party_Summary"
  },
  // ✅ NEW: CustomerCollect configuration
  customercollect: {
    title: "Customer Collect Outstanding – Party Summary",
    api: "/api/outstanding/cc_party_outstanding",
    branchPath: "/DashboardHome/customercollect_branch_outstanding",
    filename: "CustomerCollect_Outstanding_Party_Summary"
  }
};

const getColumns = (type = 'cash') => {
  const baseColumns = [
    { key: 'billAmt', label: 'Bill Amt' },
    { key: 'balanceAmt', label: 'Balance Amt' },
    { key: 'upToSeven', label: 'Upto 7 Days' },
    { key: 'eightToThirty', label: '8-30 Days' },
    { key: 'thirtyOneToNinty', label: '31-90 Days' },
    { key: 'grtNinty', label: '>90 Days' }
  ];
  
  if (type === 'id') {
    return [
      baseColumns[0],
      baseColumns[1],
      { key: 'insuranceAmt', label: 'Insurance' },
      { key: 'differenceAmt', label: 'Difference' },
      ...baseColumns.slice(2)
    ];
  }
  
  return baseColumns;
};

const PartyOutstandingPage = ({ type }) => {
  const config = NAVIGATION_MAP[type];
  const navigate = useNavigate();
  const COLUMNS = getColumns(type);

  // State
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredData, setFilteredData] = useState([]);
  const [workshopFilter, setWorkshopFilter] = useState([]);
  const [advisorFilter, setAdvisorFilter] = useState([]);
  const [partyFilter, setPartyFilter] = useState("");
  const [searchParty, setSearchParty] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: 'balanceAmt', direction: 'asc' });
  const [workshopOptions, setWorkshopOptions] = useState([]);
  const [advisorOptions, setAdvisorOptions] = useState([]);
  const [allAdvisorOptions, setAllAdvisorOptions] = useState([]);

  // ✅ SIMPLIFIED totals - MOVED FIRST
  const totals = useMemo(() => {
    return filteredData.reduce((acc, row) => {
      COLUMNS.forEach(col => {
        acc[col.key] = (acc[col.key] || 0) + (row[col.key] || 0);
      });
      return acc;
    }, COLUMNS.reduce((acc, col) => ({ ...acc, [col.key]: 0 }), {}));
  }, [filteredData, COLUMNS]);

  const sortLabelSx = {
    color: 'white !important', 
    fontWeight: 'bold',
    '&:hover': { 
      color: '#fff !important',
      '& .MuiTableSortLabel-icon': { color: '#ffeb3b !important' },
      '& .MuiTableSortLabel-iconDirectionDesc': { color: '#ffeb3b !important' },
      '& .MuiTableSortLabel-iconDirectionAsc': { color: '#ffeb3b !important' }
    },
    '& .MuiTableSortLabel-icon': { color: 'white !important', fontWeight: 'bold', fontSize: '1.2em' },
    '& .MuiTableSortLabel-iconDirectionDesc': { color: 'white !important', fontWeight: 'bold', fontSize: '1.2em' },
    '& .MuiTableSortLabel-iconDirectionAsc': { color: 'white !important', fontWeight: 'bold', fontSize: '1.2em' }
  };

  // ✅ UPDATED: Dynamic first columns count - NOW includes billNo for ALL types
  const getFirstColumnsCount = () => {
    if (type === 'id') return 6; // S.No + Workshop + InsuranceParty + PartyName + BillNo + Service Advisor
    return 5; // S.No + Workshop + PartyName + BillNo + Service Advisor
  };

  const totalRowColSpan = getFirstColumnsCount();

  // ✅ ULTRA-SIMPLE & BULLETPROOF DOWNLOAD FUNCTION - UPDATED with billNo
  const downloadExcel = useCallback(() => {
    try {
      console.log('Starting download...', { filteredDataLength: filteredData.length });
      
      const excelData = filteredData.map((row, index) => ({
        'S.No': index + 1,
        'Workshop': row.segment || '',
        ...(type === 'id' && { 'Insurance Party': row.insuranceParty || '' }),
        'Party Name': row.partyName || '',
        'Bill No': row.billNo || '', // ✅ ADDED billNo for ALL types
        'Service Advisor': row.salesMan || '',
        ...COLUMNS.reduce((acc, col) => {
          acc[col.label] = row[col.key] || 0;
          return acc;
        }, {})
      }));

      // Add totals row
      const totalsRow = {
        'S.No': '',
        'Workshop': '',
        ...(type === 'id' && { 'Insurance Party': '' }),
        'Party Name': 'GRAND TOTAL',
        'Bill No': '', // ✅ ADDED billNo for ALL types
        'Service Advisor': '',
        ...COLUMNS.reduce((acc, col) => {
          acc[col.label] = totals[col.key] || 0;
          return acc;
        }, {})
      };
      excelData.push(totalsRow);

      console.log('Excel data prepared:', excelData.length, 'rows');

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      ws['!cols'] = [
        { wch: 8 },  // S.No
        { wch: 20 }, // Workshop
        ...(type === 'id' ? [{ wch: 20 }] : []), // Insurance Party for ID only
        { wch: 25 }, // Party Name
        { wch: 15 }, // Bill No - NOW FOR ALL TYPES ✅
        { wch: 20 }, // Service Advisor
        ...COLUMNS.map(() => ({ wch: 15 })) // Data columns
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Data');
      
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `${config.filename}_${timestamp}.xlsx`;
      
      console.log('Writing file:', filename);
      XLSX.writeFile(wb, filename);
      
      console.log('✅ Download completed successfully!');
      
    } catch (error) {
      console.error('❌ Excel download ERROR:', error);
      alert(`Download failed: ${error.message}`);
    }
  }, [filteredData, COLUMNS, config.filename, totals, type]);

  const fetchDataWithFilters = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (workshopFilter.length > 0) workshopFilter.forEach(w => params.append('segments', w));
      if (advisorFilter.length > 0) advisorFilter.forEach(a => params.append('salesMans', a));
      if (searchParty.trim()) params.append('party', searchParty.trim());
      
      const res = await fetchData(`${config.api}?${params.toString()}`);
      
      if (Array.isArray(res)) {
        setData(res);
        const workshops = res.reduce((acc, row) => {
          const workshopValue = row.segment || "null";
          if (workshopValue && !acc.find(w => w.value === workshopValue)) {
            acc.push({ label: workshopValue === "null" ? "No Workshop" : workshopValue, value: workshopValue });
          }
          return acc;
        }, []).sort((a, b) => a.label.localeCompare(b.label));
        setWorkshopOptions(workshops);
        
        const allAdvisors = res.reduce((acc, row) => {
          const advisorValue = row.salesMan || "null";
          if (advisorValue && !acc.find(a => a.value === advisorValue)) {
            acc.push({ label: advisorValue === "null" ? "No Advisor" : advisorValue, value: advisorValue });
          }
          return acc;
        }, []).sort((a, b) => a.label.localeCompare(b.label));
        setAllAdvisorOptions(allAdvisors);
        setAdvisorOptions(allAdvisors);
        
        setFilteredData(res);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDataWithFilters(); }, []);
  useEffect(() => { fetchDataWithFilters(); }, [workshopFilter, advisorFilter, searchParty]);

  const updateAdvisorOptions = useCallback((selectedWorkshops) => {
    let advisorsData = data;
    if (selectedWorkshops?.length > 0) {
      advisorsData = data.filter(row => selectedWorkshops.includes(row.segment || "null"));
    } else {
      setAdvisorOptions(allAdvisorOptions);
      return;
    }
    
    const advisors = advisorsData.reduce((acc, row) => {
      const advisorValue = row.salesMan || "null";
      if (advisorValue && !acc.find(a => a.value === advisorValue)) {
        acc.push({ label: advisorValue === "null" ? "No Advisor" : advisorValue, value: advisorValue });
      }
      return acc;
    }, []).sort((a, b) => a.label.localeCompare(b.label));
    
    setAdvisorOptions(advisors);
    if (advisorFilter.length > 0 && !advisors.some(a => advisorFilter.includes(a.value))) {
      setAdvisorFilter([]);
    }
  }, [data, advisorFilter, allAdvisorOptions]);

  const handleWorkshopChange = useCallback((event) => {
    const value = event.target.value || [];
    if (typeof value === 'string') value = [value];
    setWorkshopFilter(value);
    updateAdvisorOptions(value);
  }, [updateAdvisorOptions]);

  const handleAdvisorChange = useCallback((event) => {
    const value = event.target.value || [];
    if (typeof value === 'string') value = [value];
    setAdvisorFilter(value);
  }, []);

  const handlePartyChange = useCallback((event) => setPartyFilter(event.target.value), []);
  const handleFindParty = useCallback(() => setSearchParty(partyFilter.trim()), [partyFilter]);

  const sortData = useCallback((a, b) => {
    const aValue = a[sortConfig.key] || 0;
    const bValue = b[sortConfig.key] || 0;
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  }, [sortConfig]);

  const handleSort = useCallback((key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  }, [sortConfig]);

  useEffect(() => {
    let filtered = [...data];
    if (sortConfig.key) filtered.sort(sortData);
    setFilteredData(filtered);
  }, [sortConfig, data, sortData]);

  const formatCurrency = useCallback((value) => 
    new Intl.NumberFormat('en-IN', { style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 0 })
      .format(value || 0), []);

  const clearFilters = useCallback(() => {
    setWorkshopFilter([]);
    setAdvisorFilter([]);
    setPartyFilter("");
    setSearchParty("");
    setAdvisorOptions(allAdvisorOptions);
    setSortConfig({ key: 'balanceAmt', direction: 'asc' });
  }, [allAdvisorOptions]);

  if (loading) {
    return <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Typography>Loading...</Typography>
    </Box>;
  }

  const renderNavigationButtons = () => (
    <Box sx={{ display: "flex", gap: 1, flexWrap: 'wrap' }}>
      <Button variant="contained" onClick={() => navigate(config.branchPath)} size="small">Back</Button>
      <Button variant="contained" onClick={() => navigate("/DashboardHome/total_party_outstanding")} size="small">Total</Button>
      <Button variant="contained" onClick={() => navigate("/DashboardHome/cash_party_outstanding")} size="small">Cash</Button>
      <Button variant="contained" onClick={() => navigate("/DashboardHome/invoice_party_outstanding")} size="small">Invoice</Button>
      <Button variant="contained" onClick={() => navigate("/DashboardHome/others_party_outstanding")} size="small">Others</Button>
      <Button variant="contained" onClick={() => navigate("/DashboardHome/id_party_outstanding")} size="small">Insurance</Button>
      <Button variant="contained" onClick={() => navigate("/DashboardHome/customercollect_party_outstanding")} size="small">Customer Collect</Button>
      <Button 
        variant="contained" 
        onClick={downloadExcel} 
        size="small"
        sx={{ 
          backgroundColor: '#4caf50', 
          '&:hover': { backgroundColor: '#45a049' }
        }}
      >
        📥 Download
      </Button>
    </Box>
  );

  const getFilterDisplayText = () => {
    const parts = [];
    if (workshopFilter.length > 0) parts.push(`Workshops: ${workshopFilter.map(w => w === "null" ? "No Workshop" : w).join(', ')}`);
    if (advisorFilter.length > 0) parts.push(`Advisors: ${advisorFilter.map(a => a === "null" ? "No Advisor" : a).join(', ')}`);
    if (searchParty.trim()) parts.push(`Party: "${searchParty}"`);
    if (sortConfig.key) parts.push(`Sorted by: ${sortConfig.key.replace(/([A-Z])/g, ' $1').trim()} (${sortConfig.direction.toUpperCase()})`);
    return parts;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>{config.title}</Typography>
        {renderNavigationButtons()}
      </Box>

      <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "end", flexWrap: "wrap" }}>
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel>Workshops</InputLabel>
          <Select multiple value={workshopFilter} onChange={handleWorkshopChange}
            input={<OutlinedInput label="Workshops" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => <Chip key={value} label={value === "null" ? "No Workshop" : value} size="small" />)}
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

        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel>Service Advisors</InputLabel>
          <Select multiple value={advisorFilter} onChange={handleAdvisorChange}
            input={<OutlinedInput label="Service Advisors" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => <Chip key={value} label={value === "null" ? "No Advisor" : value} size="small" />)}
              </Box>
            )}
          >
            {advisorOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Checkbox checked={advisorFilter.indexOf(option.value) > -1} />
                <ListItemText primary={option.label} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', gap: 1, minWidth: 300 }}>
          <TextField size="small" label="Party Name" value={partyFilter} onChange={handlePartyChange}
            sx={{ flex: 1 }} placeholder="Enter party name..." />
          <Button variant="contained" size="small" onClick={handleFindParty} disabled={!partyFilter.trim()}
            sx={{ height: 40, minWidth: 80 }}>Find</Button>
        </Box>

        {(workshopFilter.length > 0 || advisorFilter.length > 0 || searchParty.trim()) && (
          <Chip label="Clear All Filters" onClick={clearFilters} color="error" variant="outlined" sx={{ height: 40 }} />
        )}
      </Box>

      <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
        Showing {filteredData.length} of {data.length} records{getFilterDisplayText().length > 0 && ` | ${getFilterDisplayText().join(' | ')}`}
      </Typography>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 4 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ background: "#455a64" }}>
              <TableCell sx={{ color: "#fff", fontWeight: 800, minWidth: 60, width: 60 }}>S.No</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: 800, minWidth: 200 }}>Workshop</TableCell>
              
              {/* ✅ ID TYPE: InsuranceParty column */}
              {type === 'id' && (
                <TableCell sx={{ color: "#fff", fontWeight: 800, minWidth: 200 }}>Insurance Party</TableCell>
              )}
              
              <TableCell sx={{ color: "#fff", fontWeight: 800, minWidth: 250 }}>Party Name</TableCell>
              
              {/* ✅ NEW: Bill No column for ALL TYPES */}
              <TableCell sx={{ color: "#fff", fontWeight: 800, minWidth: 120 }}>Bill No</TableCell>
              
              <TableCell sx={{ color: "#fff", fontWeight: 800, minWidth: 200 }}>Service Advisor</TableCell>
              
              {COLUMNS.map((column) => (
                <TableCell key={column.key} align="right" sx={{ color: "#fff", fontWeight: 800 }}>
                  <TableSortLabel active={sortConfig.key === column.key} direction={sortConfig.direction}
                    onClick={() => handleSort(column.key)} sx={sortLabelSx}>
                    {column.label}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          
          <TableBody>
            {filteredData.map((row, index) => (
              <TableRow key={`${(row.segment || "null")}-${(row.insuranceParty || "null")}-${(row.partyName || 'unknown')}-${(row.billNo || 'no-bill')}-${(row.salesMan || "null")}-${index}`}
                sx={{ background: index % 2 ? "#fafafa" : "#fff" }}>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{index + 1}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{row.segment || ''}</TableCell>
                
                {/* ✅ ID TYPE: InsuranceParty column */}
                {type === 'id' && (
                  <TableCell sx={{ fontWeight: 600 }}>{row.insuranceParty || ''}</TableCell>
                )}
                
                <TableCell sx={{ fontWeight: 600 }}>{row.partyName || ''}</TableCell>
                
                {/* ✅ NEW: Bill No column for ALL TYPES */}
                <TableCell sx={{ fontWeight: 600 }}>{row.billNo || ''}</TableCell>
                
                <TableCell sx={{ fontWeight: 600 }}>{row.salesMan || ''}</TableCell>
                
                {COLUMNS.map((column) => (
                  <TableCell key={column.key} align="right" sx={{ fontWeight: 600 }}>
                    {formatCurrency(row[column.key])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            
            {/* ✅ FIXED GRAND TOTAL - Updated colspan for billNo */}
            <TableRow sx={{ background: "#e3f2fd" }}>
              <TableCell sx={{ fontWeight: 900, fontSize: '1.1em' }} colSpan={totalRowColSpan}>
                GRAND TOTAL
              </TableCell>
              {COLUMNS.map((column) => (
                <TableCell key={column.key} align="right" sx={{ fontWeight: 900, fontSize: '1.1em', color: '#1976d2' }}>
                  {formatCurrency(totals[column.key])}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default PartyOutstandingPage;
