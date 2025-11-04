import { Box, Button } from "@mui/material";

export default function UploadSection({ file, setFile, onUpload }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <Button variant="contained" color="success" onClick={onUpload}>
        ⬆ Upload Excel
      </Button>
    </Box>
  );
}
