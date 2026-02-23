import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper 
} from "@mui/material";
import { TableSortLabel } from "@mui/material";

const sortLabelSx = {
  color: "#fff !important",
  "&:hover": { color: "#fff !important" },
  "&.MuiTableSortLabel-active": { color: "#fff !important" },
  "& .MuiTableSortLabel-icon": { color: "#fff !important" }
};

const OutstandingTable = (props) => {
  // ✅ ALL HOOKS AT TOP LEVEL
  const [localSortConfig, setLocalSortConfig] = useState({ key: 'balanceAmt', direction: 'asc' });

  // ✅ FIXED: Extract ALL props including secondLayerHeader
  const {
    data = [],
    filteredData = [],
    totals,
    loading = false,
    level = "branch",
    type = "cash",
    secondLayerHeader, 
    onRowClick,
    onSort,
    sortConfig = { key: 'balanceAmt', direction: 'asc' },
    formatCurrency,
    showContactColumn = false,
    getRowKey = (row, index) => index,
    getDisplayName = (row) => row.branchName || row.salesMan || row.partyName || 'N/A',
    getSegmentName = (row) => row.segment || row.branchName || '',
    getAdvisorName = (row) => row.salesMan || ''
  } = props;

  // Sync local sort with prop sort
  useEffect(() => {
    setLocalSortConfig(sortConfig);
  }, [sortConfig]);

  const handleSort = useCallback((key) => {
    let direction = 'asc';
    if (localSortConfig.key === key && localSortConfig.direction === 'asc') {
      direction = 'desc';
    }
    const newConfig = { key, direction };
    setLocalSortConfig(newConfig);
    onSort?.(newConfig);
  }, [localSortConfig, onSort]);

  // ✅ NEW: Branch name sorting - alphabetical ASC but Spares last
  const sortedBranchNames = useMemo(() => {
    if (level !== 'branch') return [];
    
    const names = filteredData.map(row => ({
      row,
      name: getDisplayName(row).toLowerCase(),
      isSpares: getDisplayName(row).toLowerCase().includes('spares')
    }));

    const spares = names.filter(item => item.isSpares);
    const nonSpares = names.filter(item => !item.isSpares);

    nonSpares.sort((a, b) => a.name.localeCompare(b.name));

    spares.sort((a, b) => {
      const aIndex = filteredData.findIndex(row => getDisplayName(row) === a.row.branchName);
      const bIndex = filteredData.findIndex(row => getDisplayName(row) === b.row.branchName);
      return aIndex - bIndex;
    });

    return [...nonSpares.map(item => item.row), ...spares.map(item => item.row)];
  }, [filteredData, level, getDisplayName]);

  const sortedData = useMemo(() => {
    if (level === 'branch') {
      return sortedBranchNames;
    }

    let result = [...filteredData];
    if (localSortConfig.key) {
      result.sort((a, b) => {
        const aValue = Number(a[localSortConfig.key]) || 0;
        const bValue = Number(b[localSortConfig.key]) || 0;
        if (aValue < bValue) return localSortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return localSortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [filteredData, localSortConfig, level, sortedBranchNames]);

  const defaultFormatCurrency = (value) => new Intl.NumberFormat('en-IN').format(value || 0);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  const isIDType = type === 'id';

  return (
    <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 4 }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ background: "#455a64" }}>
            <TableCell sx={{ 
              color: "#fff", 
              fontWeight: 800, 
              minWidth: 60, 
              width: 60 
            }}>
              S.No
            </TableCell>
            
            {/* ✅ Dynamic first column */}
            <TableCell sx={{ 
              color: "#fff", 
              fontWeight: 800, 
              minWidth: level === 'branch' ? 250 : 200
            }}>
              {level === 'branch' ? 'Branch/Workshop' : 
               level === 'sa' ? (secondLayerHeader || 'Service Advisor') : 'Party Name'}
            </TableCell>

            {/* ✅ NEW: Additional columns ONLY for ID type at party level */}
            {isIDType && level === 'party' && (
              <>
                <TableCell sx={{ color: "#fff", fontWeight: 800, minWidth: 180 }}>
                  Service Advisor
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 800, minWidth: 120 }}>
                  Bill No
                </TableCell>
              </>
            )}

            {level === 'sa' && (
              <TableCell sx={{ color: "#fff", fontWeight: 800, minWidth: 250 }}>
                Workshop
              </TableCell>
            )}

            {/* Amount columns with sorting */}
            <TableCell align="right" sx={{ color: "#fff", fontWeight: 800 }}>
              <TableSortLabel
                active={localSortConfig.key === 'billAmt'}
                direction={localSortConfig.direction}
                onClick={() => handleSort('billAmt')}
                sx={sortLabelSx}
              >
                Bill Amt
              </TableSortLabel>
            </TableCell>
            
            <TableCell align="right" sx={{ color: "#fff", fontWeight: 800 }}>
              <TableSortLabel
                active={localSortConfig.key === 'balanceAmt'}
                direction={localSortConfig.direction}
                onClick={() => handleSort('balanceAmt')}
                sx={sortLabelSx}
              >
                Balance Amt
              </TableSortLabel>
            </TableCell>

            {isIDType && (
              <>
                <TableCell align="right" sx={{ color: "#fff", fontWeight: 800 }}>
                  <TableSortLabel
                    active={localSortConfig.key === 'insuranceAmt'}
                    direction={localSortConfig.direction}
                    onClick={() => handleSort('insuranceAmt')}
                    sx={sortLabelSx}
                  >
                    Insurance
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right" sx={{ color: "#fff", fontWeight: 800 }}>
                  <TableSortLabel
                    active={localSortConfig.key === 'differenceAmt'}
                    direction={localSortConfig.direction}
                    onClick={() => handleSort('differenceAmt')}
                    sx={sortLabelSx}
                  >
                    Difference
                  </TableSortLabel>
                </TableCell>
              </>
            )}
            
            <TableCell align="right" sx={{ color: "#fff", fontWeight: 800 }}>
              <TableSortLabel
                active={localSortConfig.key === 'upToSeven'}
                direction={localSortConfig.direction}
                onClick={() => handleSort('upToSeven')}
                sx={sortLabelSx}
              >
                Upto 7 Days
              </TableSortLabel>
            </TableCell>
            
            <TableCell align="right" sx={{ color: "#fff", fontWeight: 800 }}>
              <TableSortLabel
                active={localSortConfig.key === 'eightToThirty'}
                direction={localSortConfig.direction}
                onClick={() => handleSort('eightToThirty')}
                sx={sortLabelSx}
              >
                8-30 Days
              </TableSortLabel>
            </TableCell>
            
            <TableCell align="right" sx={{ color: "#fff", fontWeight: 800 }}>
              <TableSortLabel
                active={localSortConfig.key === 'thirtyOneToNinty'}
                direction={localSortConfig.direction}
                onClick={() => handleSort('thirtyOneToNinty')}
                sx={sortLabelSx}
              >
                31-90 Days
              </TableSortLabel>
            </TableCell>
            
            <TableCell align="right" sx={{ color: "#fff", fontWeight: 800 }}>
              <TableSortLabel
                active={localSortConfig.key === 'grtNinty'}
                direction={localSortConfig.direction}
                onClick={() => handleSort('grtNinty')}
                sx={sortLabelSx}
              >
                90+ Days
              </TableSortLabel>
            </TableCell>
          </TableRow>
        </TableHead>
        
        <TableBody>
          {sortedData.map((row, index) => (
            <TableRow 
              key={getRowKey(row, index)}
              sx={{ 
                background: index % 2 ? "#fafafa" : "#fff",
                cursor: level === 'party' ? 'default' : 'pointer',
                '&:hover': { 
                  backgroundColor: level === 'party' ? 'transparent' : '#e3f2fd !important' 
                }
              }}
              onClick={level === 'party' ? undefined : () => onRowClick?.(getDisplayName(row, level))}
            >
              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                {index + 1}
              </TableCell>
              
              <TableCell sx={{ fontWeight: 700 }}>
                {getDisplayName(row, level)}
              </TableCell>

              {/* ✅ NEW: Additional data columns ONLY for ID type at party level */}
              {isIDType && level === 'party' && (
                <>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {row.salesMan || ''}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {row.billNo || ''}
                  </TableCell>
                </>
              )}

              {level === 'sa' && (
                <TableCell sx={{ fontWeight: 600 }}>
                  {getSegmentName(row)}
                </TableCell>
              )}

              <TableCell align="right" sx={{ fontWeight: 600 }}>
                {formatCurrency ? formatCurrency(row.billAmt) : defaultFormatCurrency(row.billAmt)}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                {formatCurrency ? formatCurrency(row.balanceAmt) : defaultFormatCurrency(row.balanceAmt)}
              </TableCell>

              {isIDType && (
                <>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    {formatCurrency ? formatCurrency(row.insuranceAmt) : defaultFormatCurrency(row.insuranceAmt)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    {formatCurrency ? formatCurrency(row.differenceAmt) : defaultFormatCurrency(row.differenceAmt)}
                  </TableCell>
                </>
              )}

              <TableCell align="right" sx={{ fontWeight: 600 }}>
                {formatCurrency ? formatCurrency(row.upToSeven) : defaultFormatCurrency(row.upToSeven)}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                {formatCurrency ? formatCurrency(row.eightToThirty) : defaultFormatCurrency(row.eightToThirty)}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                {formatCurrency ? formatCurrency(row.thirtyOneToNinty) : defaultFormatCurrency(row.thirtyOneToNinty)}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                {formatCurrency ? formatCurrency(row.grtNinty) : defaultFormatCurrency(row.grtNinty)}
              </TableCell>
            </TableRow>
          ))}

          {/* ✅ FIXED: TOTAL ROW - Correct colspan logic */}
          {totals && (
            <TableRow sx={{ background: "#e3f2fd" }}>
              <TableCell 
                sx={{ fontWeight: 900, fontSize: '1.1em' }} 
                colSpan={isIDType && level === 'party' ? 4 :  // ✅ S.No + Party + SA + BillNo
                        level === 'sa' ? 3 :                    // S.No + Header + Workshop
                        2}                                      // S.No + Header
              >
                {level === 'branch' ? 'GRAND TOTAL' : 'TOTAL'}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 900, fontSize: '1.1em', color: '#1976d2' }}>
                {formatCurrency ? formatCurrency(totals.billAmt) : defaultFormatCurrency(totals.billAmt)}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 900, fontSize: '1.1em', color: '#1976d2' }}>
                {formatCurrency ? formatCurrency(totals.balanceAmt) : defaultFormatCurrency(totals.balanceAmt)}
              </TableCell>
              
              {isIDType && (
                <>
                  <TableCell align="right" sx={{ fontWeight: 900, fontSize: '1.1em', color: '#1976d2' }}>
                    {formatCurrency ? formatCurrency(totals.insuranceAmt) : defaultFormatCurrency(totals.insuranceAmt)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 900, fontSize: '1.1em', color: '#1976d2' }}>
                    {formatCurrency ? formatCurrency(totals.differenceAmt) : defaultFormatCurrency(totals.differenceAmt)}
                  </TableCell>
                </>
              )}
              
              <TableCell align="right" sx={{ fontWeight: 900, fontSize: '1.1em', color: '#1976d2' }}>
                {formatCurrency ? formatCurrency(totals.upToSeven) : defaultFormatCurrency(totals.upToSeven)}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 900, fontSize: '1.1em', color: '#1976d2' }}>
                {formatCurrency ? formatCurrency(totals.eightToThirty) : defaultFormatCurrency(totals.eightToThirty)}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 900, fontSize: '1.1em', color: '#1976d2' }}>
                {formatCurrency ? formatCurrency(totals.thirtyOneToNinty) : defaultFormatCurrency(totals.thirtyOneToNinty)}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 900, fontSize: '1.1em', color: '#1976d2' }}>
                {formatCurrency ? formatCurrency(totals.grtNinty) : defaultFormatCurrency(totals.grtNinty)}
              </TableCell>
            </TableRow>
          )}

          {/* ✅ FIXED: NO DATA ROW - Correct colspan logic */}
          {sortedData.length === 0 && (
            <TableRow>
              <TableCell 
                colSpan={isIDType && level === 'party' ? 12 :  // ✅ 4 headers + 8 amounts
                        level === 'sa' ? (isIDType ? 11 : 9) : 
                        (isIDType ? 10 : 8)} 
                align="center" 
                sx={{ py: 4 }}
              >
                <Typography color="textSecondary">No data available</Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default OutstandingTable;
