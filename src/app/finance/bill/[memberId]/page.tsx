'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, Divider, Button, TextField } from '@mui/material';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

const BillPage = () => {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const { tenantId, token } = useAuth();
  const [logoSrc, setLogoSrc] = useState('/default-logo.png');
  
  // Adjustment state
  const [adjustment, setAdjustment] = useState<{ name: string; value: number }>({
    name: 'Adjustment',
    value: 0
  });

  const [tenantName, setTenantName] = useState<string | null>(null);

  useEffect(() => {
    const fetchTenantDetails = async () => {
      try {
        const res = await fetch('/api/tenant', {
          headers: {
            Authorization: `Bearer ${token}`, // from your auth context
          },
        });

        if (!res.ok) throw new Error('Failed to fetch tenant info');

        const data = await res.json();
        setTenantName(data.name); // or whatever key your API returns
      } catch (err) {
        console.error('Could not fetch tenant info:', err);
      }
    };

    if (token) fetchTenantDetails();
  }, [token]);

  useEffect(() => {
      if (!tenantId) return;
  
      const basePath = `/uploads/${tenantId}/logo`;
      
      const testImage = async (ext: string) => {
        const url = `${basePath}.${ext}`;
        try {
          const res = await fetch(url, { method: 'HEAD' });
          if (res.ok) {
            setLogoSrc(url);
            return true;
          }
        } catch (_) {}
        return false;
      };

    const loadLogo = async () => {
      const found = await testImage('png') || await testImage('jpg') || await testImage('jpeg');
      if (!found) setLogoSrc('/default-logo.png');
    };

    loadLogo();
  }, [tenantId]);

  useEffect(() => {
    const raw = sessionStorage.getItem('billData');
    if (raw) {
      setData(JSON.parse(raw));
    } else {
      router.push('/');
    }
  }, [router]);

  if (!data) return null;
  if (!data) return <Typography>Loading...</Typography>;

  const { memberName, structures, records, amountPaid, paidDate } = data;

  const totalExpected = structures.reduce((acc: number, s: any) => acc + Number(s.amount), 0);
  // const totalPaid = records.reduce((acc: number, r: any) => acc + Number(r.amountPaid), 0);

  return (
    <Box id="bill-content" sx={{ p: 4, maxWidth: 600, margin: '0 auto' }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
    <Image 
      src={logoSrc}
      alt="Organisation Logo"
      width={100}
      height={100}
      style={{ objectFit: 'contain' }}
    />        <Typography variant="h5" fontWeight={700}>Payment Receipt</Typography>
        <Typography variant="caption" color="text.secondary">{tenantName}</Typography>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Typography><strong>Member:</strong> {memberName}</Typography>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2" gutterBottom>Components</Typography>
      {structures.map((s: any, idx: number) => (
        <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography>{s.name}</Typography>
          <Typography>₹{s.amount}</Typography>
        </Box>
      ))}

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2" gutterBottom>Payments</Typography>
      {/* {records.map((r: any, idx: number) => (
        <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography>{new Date(r.paidDate).toLocaleDateString()}</Typography>
          <Typography>₹{r.amountPaid}</Typography>
        </Box>
      ))} */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography>{new Date(paidDate).toLocaleDateString()}</Typography>
                <Typography>{amountPaid}</Typography>
          </Box>

      <Divider sx={{ my: 2 }} />

      {/* <Typography variant="subtitle2" gutterBottom>Adjustment</Typography> */}
      <Box className="print-hide" sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, '@media print': { display: 'none' } }}>
        <TextField
          // label="Name"
          size="small"
          value={adjustment.name}
          onChange={(e) => setAdjustment(prev => ({ ...prev, name: e.target.value }))}
          sx={{ flex: 1, mr: 1 }}
        />
        <TextField
          label="Amount"
          size="small"
          type="number"
          value={adjustment.value}
          onChange={(e) => setAdjustment(prev => ({ ...prev, value: Number(e.target.value) }))}
          sx={{ width: 120 }}
        />
      </Box>

      {/* <Divider sx={{ my: 2 }} /> */}

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography>Total Expected</Typography>
        <Typography>₹{totalExpected}</Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography>Total Paid</Typography>
        <Typography fontWeight={600}>₹{amountPaid}</Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography>{adjustment.name || 'Adjustment'}</Typography>
        <Typography fontWeight={600}>₹{adjustment.value}</Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Typography variant="caption" display="block" textAlign="center">
        This is a system-generated receipt.
      </Typography>

      <Box className="print-hide" sx={{ mt: 3, display: 'flex', gap: 1, '@media print': { display: 'none' } }}>
        <Button variant="outlined" onClick={() => router.back()}>Back</Button>
        <Button variant="contained" onClick={() => window.print()}>Print</Button>
      </Box>
    </Box>
  );
};

export default BillPage;
