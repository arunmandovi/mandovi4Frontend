import React from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
} from "@mui/material";
import { BRANCH_CITY_MAP } from "../../../helpers/SortByCityAndBranch";

function NegativeFilters({
  cityOptions,
  selectedCities,
  handleCityChange,
  cityCountLabel,
  selectedBranches,
  handleBranchChange,
  branchGroups = [],
}) {
  return (
    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mb: 3, flexWrap: "wrap" }}>
      <FormControl size="small" sx={{ minWidth: 200 }}>
        <InputLabel>Select Cities</InputLabel>
        <Select
          multiple
          label="Select Cities"
          value={selectedCities}
          onChange={handleCityChange}
          renderValue={(selected) => 
            selected.length === 0 ? "All Cities" : 
            selected.length === cityOptions.length ? "All Cities" : 
            `${selected.length} Cities`
          }
        >
          {cityOptions.map((city) => (
            <MenuItem value={city} key={city}>
              <Checkbox checked={selectedCities.includes(city)} />
              <ListItemText primary={city} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    
        <FormControl size="small" sx={{ minWidth: 260 }}>
        <InputLabel>Select Branches</InputLabel>
        <Select
          multiple
          label="Select Branches"
          value={selectedBranches}
          onChange={handleBranchChange}
          displayEmpty
          renderValue={() => selectedCities.length > 0 ? `${selectedBranches.length} Branches` : "Select Branches"}
          MenuProps={{
            PaperProps: {
              style: { maxHeight: 300 },
            },
          }}
        >
          <ListItemText primary="Bangalore" sx={{ pl: 2, fontWeight: "bold" }} />
          {Object.entries(BRANCH_CITY_MAP)
            .filter(([_, c]) => c === "Bangalore")
            .map(([br]) => (
              <MenuItem value={br} key={br}>
                <Checkbox checked={selectedBranches.includes(br)} />
                <ListItemText primary={br} />
              </MenuItem>
            ))}
         
          <ListItemText primary="Mysore" sx={{ pl: 2, fontWeight: "bold" }} />
          {Object.entries(BRANCH_CITY_MAP)
            .filter(([_, c]) => c === "Mysore")
            .map(([br]) => (
              <MenuItem value={br} key={br}>
                <Checkbox checked={selectedBranches.includes(br)} />
                <ListItemText primary={br} />
              </MenuItem>
            ))}
         
          <ListItemText primary="Mangalore" sx={{ pl: 2, fontWeight: "bold" }} />
          {Object.entries(BRANCH_CITY_MAP)
            .filter(([_, c]) => c === "Mangalore")
            .map(([br]) => (
              <MenuItem value={br} key={br}>
                <Checkbox checked={selectedBranches.includes(br)} />
                <ListItemText primary={br} />
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    </Box>
  );
}

export default NegativeFilters;