import { Box, Button, TextField } from "@mui/material";

export default function FilterByDate({
  selectedDate,
  handleDateChange,
  handleFilter,
  handleViewAll,
}) {
  return (
    <>
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Button variant="contained" onClick={handleViewAll}>
          📄 View All
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField
          type="date"
          size="small"
          value={selectedDate}
          onChange={(e) => handleDateChange(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <Button variant="contained" onClick={handleFilter}>
          🔎 Apply Filter
        </Button>
      </Box>
    </>
  );
}
