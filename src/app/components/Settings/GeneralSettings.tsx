'use client';

import {
  Box,
  Typography,
  TextField,
  Grid,
  Button,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { apiClient } from '@/app/utils/apiClient';
import { useAuth } from '@/context/AuthContext';

const GeneralSettings = () => {
  const { token, loading: tokenLoading } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    logoUrl: '',
    logoFile: null as File | null,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tokenLoading && token) {
      fetchTenant();
    }
  }, [tokenLoading, token]);

  const fetchTenant = async () => {
    try {
      const res = await apiClient('/api/tenant', {
        // headers: {
        //   Authorization: `Bearer ${token}`,
        // },
      });
      if(!res) return;
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load tenant');
      setForm({
        name: data.name || '',
        email: data.email || '',
        logoUrl: data.logoUrl || '',
        logoFile: null,
      });
    } catch (err: any) {
      toast.error(err.message || 'Error fetching tenant');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (file.type !== 'image/png' && file.type !== 'image/jpeg') {
    toast.error('Only PNG or JPEG files are allowed');
    return;
  }

  if (file.size > 100 * 1024) {
    toast.error('File must be under 100KB');
    return;
  }

  setForm((prev) => ({ ...prev, logoFile: file }));
};


  const uploadLogoToServer = async (file: File,) => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/tenant/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Upload failed');
    }

    const data = await res.json();
    return data.logoUrl;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let logoUrl = form.logoUrl;

      if (form.logoFile) {
        logoUrl = await uploadLogoToServer(form.logoFile);
      }

      const res = await apiClient('/api/tenant', {
        method: 'PUT',
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          logoUrl,
        }),
      });
      if(!res) return;
      const data = await res.json();
      // if (!res.ok) throw new Error(data.error || 'Failed to update tenant');

      toast.success('Tenant info updated successfully');

      setForm((prev) => ({
        ...prev,
        logoUrl,
        logoFile: null,
      }));
    } catch (err: any) {
      toast.error(err.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
  <Box sx={{ p: 3 }}>
    <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
      <SettingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
      System Preferences
    </Typography>

    {loading ? (
      <Grid container spacing={3}>
        <Grid size={{xs:12, md:6}} >
          <Skeleton variant="text" width="60%" height={40} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" width="100%" height={56} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="60%" height={40} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" width="100%" height={56} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" width={160} height={160} sx={{ mb: 2, borderRadius: 2 }} />
          <Skeleton variant="rectangular" width={120} height={40} sx={{ mt: 2 }} />
        </Grid>
        <Grid size={{xs:12, md:6}} ></Grid>
      </Grid>
    ) : (
      <Grid container spacing={3}>
        <Grid size={{xs:12, md:6}} >
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
            School Information
          </Typography>

          <TextField
            fullWidth
            label="School Name"
            name="name"
            variant="outlined"
            sx={{ mb: 2 }}
            value={form.name}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            label="Contact Email"
            name="email"
            variant="outlined"
            sx={{ mb: 2 }}
            value={form.email}
            onChange={handleChange}
          />

          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ marginBottom: '16px' }}
          />

          {form.logoUrl && (
            <Box mt={2}>
              <Typography
                variant="caption"
                sx={{ mb: 1, display: 'block', color: 'text.secondary' }}
              >
                Logo Preview
              </Typography>
              <Box
                component="img"
                src={form.logoUrl}
                alt="Logo preview"
                sx={{
                  width: 160,
                  height: 160,
                  objectFit: 'contain',
                  border: '1px solid #ddd',
                  borderRadius: 2,
                  p: 1,
                  backgroundColor: '#f9f9f9',
                }}
              />
            </Box>
          )}

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={20} /> : 'Save Changes'}
          </Button>
        </Grid>

        <Grid size={{xs:12, md:6}} ></Grid>
      </Grid>
    )}
  </Box>
)}


export default GeneralSettings;
