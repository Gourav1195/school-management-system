'use client';
import { useState } from 'react';
import {
  Button, Grid, Typography, Snackbar, CircularProgress, Paper, Box,
  Stack, Alert, AlertTitle, IconButton
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import BusinessIcon from '@mui/icons-material/Business';
import StorageIcon from '@mui/icons-material/Storage';
import HistoryIcon from '@mui/icons-material/History';

const allTables = [
  'tenant', 'users', 'members', 'groups',
  'attendance', 'attendancerecords',
  'finance', 'fees', 'salaries', 'userfavgroups'
];

const ranges = ['daily', 'weekly', 'monthly', 'yearly'];

export default function DataBackupRestore() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [selectedTables, setSelectedTables] = useState<string[]>(allTables);
  const [range, setRange] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await fetch('/api/restore', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (res.ok) {
        setSnackbarOpen(true);
        setFile(null);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleExport = async () => {
    const params = new URLSearchParams();
    params.append('tables', selectedTables.join(','));
    if (range) params.append('range', range);

    try {
      const res = await fetch(`/api/backup?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'backup.zip');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const toggleTable = (table: string) => {
    setSelectedTables(prev =>
      prev.includes(table) ? prev.filter(t => t !== table) : [...prev, table]
    );
  };

  const toggleAllTables = () => {
    setSelectedTables(selectedTables.length === allTables.length ? [] : allTables);
  };

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', p: 3 }}>
      <Stack direction="row" alignItems="center" spacing={2} mb={4} justifyContent="center">
        <BusinessIcon fontSize="large" color="primary" />
        <Typography variant="h4" fontWeight={600} color="text.primary">
         Data Management
        </Typography>
      </Stack>
      <Typography variant="body1" color="text.secondary" paragraph mb={4} sx={{ 
        textAlign: 'center', 
        maxWidth: 800,
        margin: '0 auto'
      }}>
        Secure and efficient data operations for enterprise systems
      </Typography>

      <Grid container spacing={3}>
        {/* Restore Section - md:4, xs:12 (Green Theme) */}
        <Grid size={{ xs:12, md:4}}>
          <Paper elevation={0} sx={{ 
            p: 3, 
            borderRadius: 2,
            border: '1px solid #e0e0e0',
            height: '100%'
          }}>
            <Stack spacing={3}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <UploadFileIcon color="success" />
                <Typography variant="h6" fontWeight={600} color="text.primary">
                  Data Restoration
                </Typography>
              </Stack>
              
              <Typography variant="body2" color="text.secondary">
                Restore system data from a secure backup archive
              </Typography>
              
              <Box>
                <input
                  type="file"
                  accept=".zip"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  id="upload-input"
                />
                <label htmlFor="upload-input">
                  <Button
                    variant="outlined"
                    component="span"
                    fullWidth
                    startIcon={<StorageIcon />}
                    sx={{ 
                      py: 1.5, 
                      mb: 1,
                      borderColor: '#c8e6c9',
                      color: '#2e7d32',
                      '&:hover': {
                        borderColor: '#81c784',
                        backgroundColor: '#f1f8e9'
                      }
                    }}
                  >
                    Select Zip File
                  </Button>
                </label>
                
                {file && (
                  <Alert 
                    severity="info"
                    icon={<StorageIcon />}
                    action={
                      <IconButton size="small" onClick={() => setFile(null)}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    }
                    sx={{ 
                      mt: 1,
                      backgroundColor: '#f1f8e9',
                      border: '1px solid #c8e6c9'
                    }}
                  >
                    <AlertTitle>Selected File</AlertTitle>
                    {file.name}
                  </Alert>
                )}
              </Box>

              <Button
                variant="contained"
                size="large"
                disabled={!file || uploading}
                onClick={handleUpload}
                fullWidth
                sx={{ 
                  mt: 1,
                  backgroundColor: '#4caf50',
                  '&:hover': {
                    backgroundColor: '#388e3c'
                  }
                }}
              >
                {uploading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Restore Data'
                )}
              </Button>
            </Stack>
          </Paper>
        </Grid>

        {/* Backup Section - md:8, xs:12 (Blue Theme) */}
        <Grid size={{ xs:12, md:8}}>
          <Paper elevation={0} sx={{ 
            p: 3, 
            borderRadius: 2,
            border: '1px solid #e0e0e0',
            height: '100%'
          }}>
            <Stack spacing={3}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <CloudDownloadIcon color="primary" />
                <Typography variant="h6" fontWeight={600} color="text.primary">
                  Data Export
                </Typography>
              </Stack>
              
              <Typography variant="body2" color="text.secondary">
                Create a secure backup of system data
              </Typography>
              
              <Box>
                <Typography variant="subtitle1" fontWeight={500} gutterBottom>
                  Database Tables
                </Typography>
                
                <Grid container spacing={1} sx={{ mt: 1 }}>
                  {allTables.map(table => (
                    <Grid size={{ xs:12, md:3, sm:4}} key={table}>
                      <Button
                        variant={selectedTables.includes(table) ? "contained" : "outlined"}
                        onClick={() => toggleTable(table)}
                        sx={{
                          textTransform: 'none',
                          width: '100%',
                          mb: 1,
                          borderRadius: '4px',
                          backgroundColor: selectedTables.includes(table) ? '#e3f2fd' : 'transparent',
                          borderColor: selectedTables.includes(table) ? '#2196f3' : '#bbdefb',
                          color: selectedTables.includes(table) ? '#1565c0' : '#2196f3',
                          fontWeight: selectedTables.includes(table) ? 500 : 400,
                          '&:hover': {
                            backgroundColor: selectedTables.includes(table) ? '#bbdefb' : '#e3f2fd',
                            borderColor: '#2196f3'
                          }
                        }}
                      >
                        {table}
                        {selectedTables.includes(table) && (
                          <CheckIcon sx={{ fontSize: 16, ml: 1, color: '#1565c0' }} />
                        )}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
                
                <Button
                  variant="text"
                  size="small"
                  onClick={toggleAllTables}
                  sx={{ 
                    mt: 1, 
                    color: '#2196f3',
                    fontWeight: 500
                  }}
                >
                  {selectedTables.length === allTables.length ? 
                    'Deselect All Tables' : 'Select All Tables'}
                </Button>
              </Box>

              <Box>
                <Typography variant="subtitle1" fontWeight={500} gutterBottom>
                  Time Range
                </Typography>
                <Box sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1,
                  mb: 1
                }}>
                  <Button
                    variant={range === '' ? "contained" : "outlined"}
                    onClick={() => setRange('')}
                    sx={{
                      borderRadius: '4px',
                      backgroundColor: range === '' ? '#e3f2fd' : 'transparent',
                      borderColor: '#bbdefb',
                      color: range === '' ? '#1565c0' : '#2196f3',
                      fontWeight: range === '' ? 500 : 400,
                      '&:hover': {
                        backgroundColor: range === '' ? '#bbdefb' : '#e3f2fd'
                      }
                    }}
                  >
                    All Time Periods
                  </Button>
                  {ranges.map(r => (
                    <Button
                      key={r}
                      variant={range === r ? "contained" : "outlined"}
                      onClick={() => setRange(r)}
                      sx={{
                        borderRadius: '4px',
                        backgroundColor: range === r ? '#e3f2fd' : 'transparent',
                        borderColor: '#bbdefb',
                        color: range === r ? '#1565c0' : '#2196f3',
                        fontWeight: range === r ? 500 : 400,
                        '&:hover': {
                          backgroundColor: range === r ? '#bbdefb' : '#e3f2fd'
                        }
                      }}
                    >
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </Button>
                  ))}
                </Box>
              </Box>

              <Button
                variant="contained"
                size="large"
                onClick={handleExport}
                fullWidth
                startIcon={<CloudDownloadIcon />}
                sx={{ 
                  py: 1.5,
                  backgroundColor: '#2196f3',
                  '&:hover': {
                    backgroundColor: '#1976d2'
                  }
                }}
              >
                Export Data Package
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity="success" 
          onClose={() => setSnackbarOpen(false)}
          sx={{ 
            width: '100%',
            backgroundColor: '#e3f2fd',
            color: '#1565c0',
            border: '1px solid #bbdefb'
          }}
          icon={<CheckIcon color="success" />}
        >
          <AlertTitle>Data Restored Successfully</AlertTitle>
          System data has been fully restored
        </Alert>
      </Snackbar>

      <Typography variant="body2" color="text.secondary" mt={4} sx={{ 
        textAlign: 'center', 
        fontStyle: 'italic'
      }}>
        Enterprise Data Management System v2.4 • Secure • Compliant • Reliable
      </Typography>
    </Box>
  );
}