import React, { useState, useRef } from 'react';
import { Card, CardContent, Typography, Button } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';


export default function ModuleCard({ mod, onUpload, onView }) {
const [file, setFile] = useState(null);
const [uploading, setUploading] = useState(false);
const inputRef = useRef();


const handleChange = (e) => setFile(e.target.files[0]);


const handleUploadClick = async () => {
if (!file) return alert('Please select a file');
setUploading(true);
try {
await onUpload(mod.upload, mod.name, file, (progress) => {});
setFile(null);
inputRef.current.value = null; // clear input visual
} catch (err) {
// parent already alerts
} finally {
setUploading(false);
}
};


return (
<Card sx={{ boxShadow: 4, borderRadius: 3, textAlign: 'center' }}>
<CardContent>
<Typography variant="h6" gutterBottom>{mod.name}</Typography>


<input ref={inputRef} type="file" onChange={handleChange} style={{ display: 'block', margin: '8px auto' }} />


<Button variant="contained" startIcon={<UploadFileIcon />} sx={{ mr: 1 }} onClick={handleUploadClick} disabled={uploading}>
{uploading ? 'Uploading...' : 'Upload'}
</Button>


<Button variant="outlined" onClick={() => onView(mod.get, mod.name)}>View Data</Button>
</CardContent>
</Card>
);
}