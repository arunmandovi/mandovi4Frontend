import React from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { red } from "@mui/material/colors";


function NegativeTableView({
  selectedBranches,
  tableData,
  growthKeyMap,
  tableContainerSx,
  tableSx,
  tableHeadRowSx,
  getNegativeCellSx,
}) {
  const isBelowAverage = (cellValue, row, label) => {
    if (cellValue === "--" || cellValue === null) return false;
    
    const num = parseFloat(String(cellValue).replace("%", ""));
    if (isNaN(num)) return false;
    
    const averages = row._overallAverages;
    if (!averages) return false;
    
    const apiKey = growthKeyMap[label];
    if (!apiKey || averages[apiKey] === undefined) return false;
    
    return num < averages[apiKey];
  };

  const getCellSx = (cellValue, row, label) => {
    if (isBelowAverage(cellValue, row, label)) {
      return {
        backgroundColor: red[100],
        color: red[800],
        fontWeight: 800,
        borderLeft: `4px solid ${red[400]}`,
      };
    }
    
    return getNegativeCellSx(cellValue);
  };

  return (
    <Box sx={{ mt: 3 }}>
      {selectedBranches.length === 0 ? (
        <Typography color="error" sx={{ mt: 2 }}>
          Please select at least one branch.
        </Typography>
      ) : tableData.length === 0 ? (
        <Typography sx={{ mt: 2 }}>No data available.</Typography>
      ) : (
        <TableContainer component={Paper} sx={tableContainerSx}>
          <Table size="small" sx={tableSx}>
            <TableHead>
              <TableRow sx={tableHeadRowSx}>
                <TableCell>Branch</TableCell>
                <TableCell>City</TableCell>
                {Object.keys(growthKeyMap).map((label) => (
                  <TableCell key={label} align="center">
                    {label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData.map((row, i) => (
                <TableRow
                  key={i}
                  sx={{
                    background: i % 2 ? "#fafafa" : "#fff",
                  }}
                >
                  <TableCell sx={{ fontWeight: 800 }}>{row.branch}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{row.city}</TableCell>
                  {Object.keys(growthKeyMap).map((label) => (
                    <TableCell
                      key={label}
                      align="center"
                      sx={getCellSx(row[label], row, label)}
                    >
                      {row[label]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export default NegativeTableView;