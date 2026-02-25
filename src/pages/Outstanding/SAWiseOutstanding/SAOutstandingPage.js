import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TableSortLabel, Paper, Button, Select,
  MenuItem, FormControl, InputLabel, Chip, OutlinedInput, Checkbox,
  ListItemText
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchData } from "../../../api/uploadService";
import * as XLSX from 'xlsx';

const NAVIGATION_MAP = {
  cash: {
    title: "Cash Outstanding – Workshop Summary",
    api: "/api/outstanding/cash_sa_outstanding",
    branchPath: "/DashboardHome/cash_branch_outstanding",
    filename: "Cash_Outstanding_Workshop_Summary"
  },
  total: {
    title: "Total Outstanding – Workshop Summary",
    api: "/api/outstanding/total_sa_outstanding",
    branchPath: "/DashboardHome/total_branch_outstanding",
    filename: "Total_Outstanding_Workshop_Summary"
  },
  invoice: {
    title: "Invoice Outstanding – Workshop Summary",
    api: "/api/outstanding/invoice_sa_outstanding",
    branchPath: "/DashboardHome/invoice_branch_outstanding",
    filename: "Invoice_Outstanding_Workshop_Summary"
  },
  insurance: {
    title: "Insurance Outstanding – Workshop Summary",
    api: "/api/outstanding/insurance_sa_outstanding",
    branchPath: "/DashboardHome/insurance_branch_outstanding",
    filename: "Insurance_Outstanding_Workshop_Summary"
  },
  others: {
    title: "Others Outstanding – Workshop Summary",
    api: "/api/outstanding/others_sa_outstanding",
    branchPath: "/DashboardHome/others_branch_outstanding",
    filename: "Others_Outstanding_Workshop_Summary"
  },
  id: {
    title: "Insurance Outstanding – Workshop Summary",
    api: "/api/outstanding/id_sa_outstanding",
    branchPath: "/DashboardHome/id_branch_outstanding",
    filename: "ID_Outstanding_Workshop_Summary"
  },
  // ✅ NEW: CustomerCollect configuration
  customercollect: {
    title: "Customer Collect Outstanding – Workshop Summary",
    api: "/api/outstanding/cc_sa_outstanding",
    branchPath: "/DashboardHome/customercollect_branch_outstanding",
    filename: "CustomerCollect_Outstanding_Workshop_Summary"
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

const SAOutstandingPage = ({ type }) => {
  const config = NAVIGATION_MAP[type];
  const navigate = useNavigate();
  const location = useLocation();
  const COLUMNS = getColumns(type);

  // ✅ ALL STATE FIRST - CRITICAL ORDER
  const pageKey = useMemo(() => `${type}-${location.pathname}`, [type, location.pathname]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredData, setFilteredData] = useState([]);
  const [workshopFilter, setWorkshopFilter] = useState([]);
  const [advisorFilter, setAdvisorFilter] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'balanceAmt', direction: 'asc' });
  const [workshopOptions, setWorkshopOptions] = useState([]);
  const [advisorOptions, setAdvisorOptions] = useState([]);
  const [allAdvisorOptions, setAllAdvisorOptions] = useState([]);

  // ✅ totals AFTER all state declarations
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

  // ✅ FIXED: Dynamic first columns count based on type
  const getFirstColumnsCount = () => {
    if (type === 'id') return 3; // S.No + Workshop + InsuranceParty
    return 3; // S.No + Workshop + Service Advisor
  };

  const totalRowColSpan = getFirstColumnsCount();

  // ✅ downloadExcel AFTER totals - Updated for ID type
  const downloadExcel = useCallback(() => {
    try {
      console.log('Starting download...', { filteredDataLength: filteredData.length });
      
      const excelData = filteredData.map((row, index) => ({
        'S.No': index + 1,
        'Workshop': row.segment || '',
        ...(type === 'id' ? { 'Insurance Party': row.insuranceParty || '' } : { 'Service Advisor': row.salesMan || '' }),
        ...COLUMNS.reduce((acc, col) => {
          acc[col.label] = row[col.key] || 0;
          return acc;
        }, {})
      }));

      const totalsRow = {
        'S.No': '',
        'Workshop': '',
        ...(type === 'id' ? { 'Insurance Party': 'GRAND TOTAL' } : { 'Service Advisor': 'GRAND TOTAL' }),
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
        { wch: 25 }, // Workshop
        ...(type === 'id' ? [{ wch: 25 }] : [{ wch: 25 }]), // Insurance Party or Service Advisor
        ...COLUMNS.map(() => ({ wch: 15 })) // Data columns
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Summary');
      
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

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchData(config.api);
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
  }, [config.api]);

  useEffect(() => {
    setData([]);
    setFilteredData([]);
    setWorkshopFilter([]);
    setAdvisorFilter([]);
    setSortConfig({ key: 'balanceAmt', direction: 'asc' });
    setWorkshopOptions([]);
    setAdvisorOptions([]);
    setAllAdvisorOptions([]);
    setLoading(true);
    loadData();
  }, [type, location.pathname, loadData]);

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
    if (workshopFilter.length > 0) {
      filtered = filtered.filter(row => workshopFilter.includes(row.segment || "null"));
    }
    if (advisorFilter.length > 0) {
      filtered = filtered.filter(row => advisorFilter.includes(row.salesMan || "null"));
    }
    if (sortConfig.key) {
      filtered.sort(sortData);
    }
    setFilteredData(filtered);
  }, [workshopFilter, advisorFilter, data, sortConfig, sortData]);

  const formatCurrency = useCallback((value) => 
    new Intl.NumberFormat('en-IN', { style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 0 })
      .format(value || 0), []);

  const clearFilters = useCallback(() => {
    setWorkshopFilter([]);
    setAdvisorFilter([]);
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
      <Button variant="contained" onClick={() => navigate("/DashboardHome/total_sa_outstanding")} size="small">Total</Button>
      <Button variant="contained" onClick={() => navigate("/DashboardHome/cash_sa_outstanding")} size="small">Cash</Button>
      <Button variant="contained" onClick={() => navigate("/DashboardHome/invoice_sa_outstanding")} size="small">Invoice</Button>
      <Button variant="contained" onClick={() => navigate("/DashboardHome/others_sa_outstanding")} size="small">Others</Button>
      <Button variant="contained" onClick={() => navigate("/DashboardHome/id_sa_outstanding")} size="small">Insurance</Button>
      <Button variant="contained" onClick={() => navigate("/DashboardHome/customercollect_sa_outstanding")} size="small">Customer Collect</Button>
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
    if (sortConfig.key) parts.push(`Sorted by: ${sortConfig.key.replace(/([A-Z])/g, ' $1').trim()} (${sortConfig.direction.toUpperCase()})`);
    return parts;
  };

  return (
    <Box sx={{ p: 3 }} key={pageKey}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>{config.title}</Typography>
        {renderNavigationButtons()}
      </Box>

      <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "end", flexWrap: "wrap" }}>
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel id="workshop-label">Workshops</InputLabel>
          <Select labelId="workshop-label" multiple value={workshopFilter} onChange={handleWorkshopChange}
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
          <InputLabel id="advisor-label">Service Advisors</InputLabel>
          <Select labelId="advisor-label" multiple value={advisorFilter} onChange={handleAdvisorChange}
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

        {(workshopFilter.length > 0 || advisorFilter.length > 0) && (
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
              <TableCell sx={{ color: "#fff", fontWeight: 800, minWidth: 250 }}>Workshop</TableCell>
              
              {/* ✅ ID TYPE: Show InsuranceParty instead of Service Advisor */}
              {type === 'id' ? (
                <TableCell sx={{ color: "#fff", fontWeight: 800, minWidth: 250 }}>Insurance Party</TableCell>
              ) : (
                <TableCell sx={{ color: "#fff", fontWeight: 800, minWidth: 250 }}>Service Advisor</TableCell>
              )}
              
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
            {filteredData.map((row, index) => {
              const workshopForFilter = row.segment || "null";
              const advisorForFilter = row.salesMan || "null";
              return (
                <TableRow key={`${workshopForFilter}-${advisorForFilter}-${index}`} sx={{ background: index % 2 ? "#fafafa" : "#fff" }}>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{index + 1}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{row.segment || ''}</TableCell>
                  
                  {/* ✅ ID TYPE: Show InsuranceParty instead of Service Advisor */}
                  {type === 'id' ? (
                    <TableCell sx={{ fontWeight: 700 }}>{row.insuranceParty || ''}</TableCell>
                  ) : (
                    <TableCell sx={{ fontWeight: 700 }}>{row.salesMan || ''}</TableCell>
                  )}
                  
                  {COLUMNS.map((column) => (
                    <TableCell key={column.key} align="right" sx={{ fontWeight: 600 }}>
                      {formatCurrency(row[column.key])}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
            
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

export default SAOutstandingPage;
