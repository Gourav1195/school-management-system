// app/superadmin/dashboard/page.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, Skeleton, Table, TableHead, TableRow, TableCell, TableBody, Select, MenuItem } from '@mui/material';
import { apiClient } from '@/app/utils/apiClient';
import SalesTable from '../Sales/SalesTable';

export default function SuperAdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiClient('/api/superadmin/summary');
        if(!res) return;
        const json = await res.json();
        setSummary(json);
        console.log('summary', summary)
      } catch (err) {
        console.error('Error loading super admin summary:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <Skeleton variant="rectangular" width="100%" height={300} />;
  }

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>Super Admin Dashboard</Typography>

      <Grid container spacing={2}>
        <Grid size={{xs:12, md:3}} >
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="subtitle2">Total Tenants</Typography>
            <Typography variant="h5">{summary?.tenantsCount}</Typography>
          </Paper>
        </Grid>
        <Grid size={{xs:12, md:3}}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="subtitle2">Sales Users</Typography>
            <Typography variant="h5">{summary?.salesCount}</Typography>
          </Paper>
        </Grid>
        <Grid size={{xs:12, md:3}}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="subtitle2">Total Revenue</Typography>
            <Typography variant="h5">₹{summary?.revenue ?? 0}</Typography>
          </Paper>
        </Grid>
        <Grid size={{xs:12, md:3}}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="subtitle2">WhatsApp Credits Used</Typography>
            <Typography variant="h5">{summary?.whatsappUsed ?? 0}</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Box mt={4}>
        <Typography variant="h6" gutterBottom>Tenants</Typography>
        <Paper elevation={2}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Plan</TableCell>
                <TableCell>Created</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {summary?.tenants?.map((t: any) => (
                <TableRow key={t.id}>
                  <TableCell>{t.name}</TableCell>
                  <TableCell>{t.email}</TableCell>
                  <TableCell>{t.plan}</TableCell>
                  <TableCell>{new Date(t.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
        <SalesTable />
      </Box>
    </Box>
  );
}
