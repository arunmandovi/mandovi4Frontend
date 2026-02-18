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
  TextField,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { fetchData } from "../../../api/uploadService";

const InvoicePartyOutstandingPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredData, setFilteredData] = useState([]);
  const [workshopFilter, setWorkshopFilter] = useState([]);
  const [advisorFilter, setAdvisorFilter] = useState([]);
  const [partyFilter, setPartyFilter] = useState(""); // Party search input value
  const [searchParty, setSearchParty] = useState(""); // Actual party value sent to backend
  // Set default sort to balanceAmt ASC so arrow always shows
  const [sortConfig, setSortConfig] = useState({ key: 'balanceAmt', direction: 'asc' });
  const navigate = useNavigate();

  /* ---------------- OPTIONS ---------------- */
  const [workshopOptions, setWorkshopOptions] = useState([]);
  const [advisorOptions, setAdvisorOptions] = useState([]);
  const [allAdvisorOptions, setAllAdvisorOptions] = useState([]);

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

  /* ---------------- FETCH DATA ---------------- */
  const fetchDataWithFilters = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (workshopFilter.length > 0) {
        workshopFilter.forEach(w => params.append('segments', w));
      }
      if (advisorFilter.length > 0) {
        advisorFilter.forEach(a => params.append('salesMans', a));
      }
      if (searchParty.trim()) {
        params.append('party', searchParty.trim());
      }
      
      const res = await fetchData(`/api/outstanding/invoice_party_outstanding?${params.toString()}`);
      if (Array.isArray(res)) {
       setData(res);
       
       // Extract unique workshops and sort alphabetically
       const workshops = res.reduce((acc, row) => {
         const workshop = row.segment || null;
         const workshopValue = workshop || "null";
         if (workshopValue && !acc.find(w => w.value === workshopValue)) {
           acc.push({ label: workshopValue === "null" ? "No Workshop" : workshopValue, value: workshopValue });
         }
         return acc;
       }, []).sort((a, b) => a.label.localeCompare(b.label));
       setWorkshopOptions(workshops);
       
       // Store ALL advisors initially and sort alphabetically
       const allAdvisors = res.reduce((acc, row) => {
         const advisorValue = row.salesMan || "null";
         if (advisorValue && !acc.find(a => a.value === advisorValue)) {
           acc.push({ 
             label: advisorValue === "null" ? "No Advisor" : advisorValue, 
             value: advisorValue 
           });
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

  useEffect(() => {
    fetchDataWithFilters();
  }, []); // Only fetch once on mount

  /* ---------------- UPDATE ADVISOR OPTIONS ---------------- */
  const updateAdvisorOptions = useCallback((selectedWorkshops) => {
    let advisorsData = data;
    
    if (selectedWorkshops && selectedWorkshops.length > 0) {
      advisorsData = data.filter(row => selectedWorkshops.includes(row.segment || "null"));
    } else {
      setAdvisorOptions(allAdvisorOptions);
      return;
    }
    
    // Filter advisors and sort alphabetically
    const advisors = advisorsData.reduce((acc, row) => {
      const advisorValue = row.salesMan || "null";
      if (advisorValue && !acc.find(a => a.value === advisorValue)) {
        acc.push({ 
         label: advisorValue === "null" ? "No Advisor" : advisorValue, 
         value: advisorValue 
        });
      }
      return acc;
    }, []).sort((a, b) => a.label.localeCompare(b.label));
    
    setAdvisorOptions(advisors);
    
    if (advisorFilter.length > 0 && !advisors.some(a => advisorFilter.includes(a.value))) {
      setAdvisorFilter([]);
    }
  }, [data, advisorFilter, allAdvisorOptions]);

  /* ---------------- HANDLE FILTER CHANGES ---------------- */
  const handleWorkshopChange = useCallback((event) => {
    const value = event.target.value;
    if (typeof value === 'string') value = [value];
    const newValue = value || [];
    setWorkshopFilter(newValue);
    updateAdvisorOptions(newValue);
  }, [updateAdvisorOptions]);

  const handleAdvisorChange = useCallback((event) => {
    const value = event.target.value;
    if (typeof value === 'string') value = [value];
    setAdvisorFilter(value || []);
  }, []);

  const handlePartyChange = useCallback((event) => {
    setPartyFilter(event.target.value);
  }, []);

  // NEW: Handle Find button click - only THEN trigger search
  const handleFindParty = useCallback(() => {
    setSearchParty(partyFilter.trim());
  }, [partyFilter]);

  /* ---------------- SORTING FUNCTION ---------------- */
  const sortData = (a, b) => {
    const aValue = a[sortConfig.key] || 0;
    const bValue = b[sortConfig.key] || 0;
    
    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  };

  /* ---------------- HANDLE SORT ---------------- */
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  /* ---------------- REFETCH DATA ON FILTER CHANGE ---------------- */
  useEffect(() => {
    fetchDataWithFilters();
  }, [workshopFilter, advisorFilter, searchParty]); // Only searchParty triggers refetch, not partyFilter

  /* ---------------- CLIENT-SIDE SORTING ---------------- */
  useEffect(() => {
    let filtered = data;

    // Apply sorting (always runs due to default sortConfig)
    if (sortConfig.key) {
      filtered.sort(sortData);
    }

    setFilteredData(filtered);
  }, [sortConfig, data]);

  /* ---------------- CALCULATE TOTALS ---------------- */
  const totals = useMemo(() => {
    return filteredData.reduce((acc, row) => {
      acc.balanceAmt += row.balanceAmt || 0;
      acc.upToSeven += row.upToSeven || 0;
      acc.eightToThirty += row.eightToThirty || 0;
      acc.thirtyOneToNinty += row.thirtyOneToNinty || 0;
      acc.grtNinty += row.grtNinty || 0;
      return acc;
    }, {
      balanceAmt: 0,
      upToSeven: 0,
      eightToThirty: 0,
      thirtyOneToNinty: 0,
      grtNinty: 0
    });
  }, [filteredData]);

  /* ---------------- FORMAT CURRENCY ---------------- */
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  /* ---------------- CLEAR FILTERS ---------------- */
  const clearFilters = () => {
    setWorkshopFilter([]);
    setAdvisorFilter([]);
    setPartyFilter("");
    setSearchParty(""); // Clear the actual search value
    setAdvisorOptions(allAdvisorOptions);
    // Reset to default sort (balanceAmt ASC) so arrow remains visible
    setSortConfig({ key: 'balanceAmt', direction: 'asc' });
  };

  /* ---------------- RENDER ---------------- */
  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Title + Buttons */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Invoice Outstanding – Party Summary
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/invoice_branch_outstanding")}>BranchWise View</Button>  
          <Button variant="contained" onClick={() => navigate("/DashboardHome/total_party_outstanding")}>Total</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/cash_party_outstanding")}>Cash</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/invoice_party_outstanding")}>Invoice</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/insurance_party_outstanding")}>Insurance</Button>
          <Button variant="contained" onClick={() => navigate("/DashboardHome/others_party_outstanding")}>Others</Button>
        </Box>
      </Box>

      {/* FILTERS */}
      <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "end", flexWrap: "wrap" }}>
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel id="workshop-label">Workshops</InputLabel>
          <Select
            labelId="workshop-label"
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

        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel id="advisor-label">Service Advisors</InputLabel>
          <Select
            labelId="advisor-label"
            multiple
            value={advisorFilter}
            onChange={handleAdvisorChange}
            input={<OutlinedInput label="Service Advisors" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value === "null" ? "No Advisor" : value} size="small" />
                ))}
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

        {/* PARTY SEARCH WITH FIND BUTTON */}
        <Box sx={{ display: 'flex', gap: 1, minWidth: 300 }}>
          <TextField
            size="small"
            label="Party Name"
            value={partyFilter}
            onChange={handlePartyChange}
            sx={{ flex: 1 }}
            placeholder="Enter party name..."
          />
          <Button
            variant="contained"
            size="small"
            onClick={handleFindParty}
            disabled={!partyFilter.trim()}
            sx={{ height: 40, minWidth: 80 }}
          >
            Find
          </Button>
        </Box>

        {(workshopFilter.length > 0 || advisorFilter.length > 0 || searchParty.trim()) && (
          <Chip 
            label="Clear All Filters" 
            onClick={clearFilters}
            color="error"
            variant="outlined"
            sx={{ height: 40 }}
          />
        )}
      </Box>

      {/* Results count */}
      <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
        Showing {filteredData.length} of {data.length} records
        {(workshopFilter.length > 0 || advisorFilter.length > 0 || searchParty.trim()) && (
          <>
            {workshopFilter.length > 0 && ` | Workshops: ${workshopFilter.map(w => w === "null" ? "No Workshop" : w).join(', ')}`}
            {advisorFilter.length > 0 && ` | Advisors: ${advisorFilter.map(a => a === "null" ? "No Advisor" : a).join(', ')}`}
            {searchParty.trim() && ` | Party: "${searchParty}"`}
            {sortConfig.key && ` | Sorted by: ${sortConfig.key.replace(/([A-Z])/g, ' $1').trim()} (${sortConfig.direction.toUpperCase()})`}
          </>
        )}
      </Typography>

      {/* TABLE */}
      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 4 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ background: "#455a64" }}>
              <TableCell sx={{ color: "#fff", fontWeight: 800, minWidth: 60, width: 60 }}>
                S.No
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: 800, minWidth: 200 }}>
                Workshop
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: 800, minWidth: 200 }}>
                Service Advisor
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: 800, minWidth: 250 }}>
                Party Name
              </TableCell>
              <TableCell align="right" sx={{ color: "#fff", fontWeight: 800 }}>
                <TableSortLabel
                  active={sortConfig.key === 'balanceAmt'}
                  direction={sortConfig.direction}
                  onClick={() => handleSort('balanceAmt')}
                  sx={sortLabelSx}
                >
                  Balance Amt
                </TableSortLabel>
              </TableCell>
              <TableCell align="right" sx={{ color: "#fff", fontWeight: 800 }}>
                <TableSortLabel
                  active={sortConfig.key === 'upToSeven'}
                  direction={sortConfig.direction}
                  onClick={() => handleSort('upToSeven')}
                  sx={sortLabelSx}
                >
                  Upto 7 Days
                </TableSortLabel>
              </TableCell>
              <TableCell align="right" sx={{ color: "#fff", fontWeight: 800 }}>
                <TableSortLabel
                  active={sortConfig.key === 'eightToThirty'}
                  direction={sortConfig.direction}
                  onClick={() => handleSort('eightToThirty')}
                  sx={sortLabelSx}
                >
                  8-30 Days
                </TableSortLabel>
              </TableCell>
              <TableCell align="right" sx={{ color: "#fff", fontWeight: 800 }}>
                <TableSortLabel
                  active={sortConfig.key === 'thirtyOneToNinty'}
                  direction={sortConfig.direction}
                  onClick={() => handleSort('thirtyOneToNinty')}
                  sx={sortLabelSx}
                >
                  31-90 Days
                </TableSortLabel>
              </TableCell>
              <TableCell align="right" sx={{ color: "#fff", fontWeight: 800 }}>
                <TableSortLabel
                  active={sortConfig.key === 'grtNinty'}
                  direction={sortConfig.direction}
                  onClick={() => handleSort('grtNinty')}
                  sx={sortLabelSx}
                >
                  >90 Days
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((row, index) => {
              const advisorForFilter = row.salesMan || "null";
              const workshopForFilter = row.segment || "null";
              
              return (
                <TableRow key={`${workshopForFilter}-${advisorForFilter}-${row.partyName || 'unknown'}-${index}`} sx={{ background: index % 2 ? "#fafafa" : "#fff" }}>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                    {index + 1}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>
                    {row.segment || ''}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>
                    {row.salesMan || ''}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {row.partyName || ''}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(row.balanceAmt)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(row.upToSeven)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(row.eightToThirty)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(row.thirtyOneToNinty)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(row.grtNinty)}</TableCell>
                </TableRow>
              );
            })}
            <TableRow sx={{ background: "#e3f2fd" }}>
              <TableCell sx={{ fontWeight: 900, fontSize: '1.1em' }} colSpan={4}>GRAND TOTAL</TableCell>
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
    </Box>
  );
};

export default InvoicePartyOutstandingPage;
