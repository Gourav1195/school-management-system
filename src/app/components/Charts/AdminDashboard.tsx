'use client';

import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, Container, Grid, Skeleton, FormControl, Select, MenuItem } from '@mui/material';
import AttendanceChart from '@/app/components/Charts/AttendanceChart';
import FinanceChart, { FinancePoint } from '@/app/components/Charts/FinanceChart';
import { apiClient } from '@/app/utils/apiClient';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { toIST, getCurrentISTDate } from '@/app/utils/dateTime'
import GroupStrengthChart from '@/app/components/Charts/GroupStrength';
import DashboardCard from '@/app/components/Charts/DashboardCard';
import PendingChart from '@/app/components/Charts/PendingChart';
import { DropDownKey } from '@/types/all';
import Head from 'next/head';

interface GroupDailyStat {
  date: string;
  percent: number;
  present: number;
  absent: number;
  total: number;
  percentPresent: number;
}

interface DashboardResponse {
  attendance: {
    dailyGrouped: Record<string, GroupDailyStat[]>;
  };
  finance: {
    feesSalary: FinancePoint[];
  };
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<DropDownKey>('monthly')
  
  const { token, loading: authLoading } = useAuth();
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !token) {
      router.push('/auth/login');
    }
  }, [authLoading, token, router]); // ✅ Include router


  useEffect(() => {
    if (!authLoading && token) {
      async function load() {
        setLoading(true);
        try {
          const to = toIST(new Date(Date.now() + 1.2 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
          const fromDate = getCurrentISTDate();
          fromDate.setDate(fromDate.getDate() - 7);
          const from = fromDate.toISOString().split('T')[0];
          // console.log(to, ' :to, from: ', from)

          // — explicitly pass GET so apiClient returns a proper Response
          const res = await apiClient(
            `/api/dashboard?from=${from}&to=${to}`,
            { method: 'GET' }
          );
          if (!res) return;
          if (!res.ok) throw new Error(`Status ${res.status}`);

          const json: DashboardResponse = await res.json();
          setDashboardData(json);
        } catch (err: any) {
          console.error(err);
          setError(err.message || 'Failed to load dashboard data');
        } finally {
          setLoading(false);
        }
      }
      load();
    }
  }, [authLoading, token]);

  // if (loading) {
  //   return (
  //     <Box display="flex" alignItems={'center'} justifyContent="center" mt={8}sx={{minWidth:100, maxWidth:100, minHeight:100,maxHeight:100}}>
  //     <Box sx={{minWidth:100, maxWidth:100, minHeight:100,maxHeight:100}}>
  //       <CircularProgress  />
  //     </Box>
  //     </Box>
  //   );
  // }
  // if (error || !dashboardData) {
  //   return (
  //     <Box textAlign="center" mt={8}>
  //       <Typography color="error">Error: {error || 'No data'}</Typography>
  //     </Box>
  //   );
  // }

  // — safe defaults
  const dailyGrouped = dashboardData?.attendance?.dailyGrouped ?? {};
  const financeStats = dashboardData?.finance?.feesSalary ?? [];

  return (
    <>
      <Head>
        <title>Equaseed | Admin Dashboard</title>
        <meta name="description" content="Get a bird’s-eye view of your entire institution—groups, finances, attendance, and more. One place. All control. No chaos." />
      </Head>
      <main>
        {/* Alt: “Manage your school like a pro. From fees to faculty, your admin dashboard handles it all—without the headaches.” */}
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
  <Typography variant="h4" gutterBottom>
    Dashboard
  </Typography>
   <FormControl sx={{ width: 100 }}>
      <Select
        value={range}
        onChange={(e) => setRange(e.target.value as DropDownKey)}
        sx={{ fontSize: 14, height: 40, color: 'text.secondary' }}
      >
        <MenuItem value="daily">Daily</MenuItem>
        <MenuItem value="weekly">Weekly</MenuItem>
        <MenuItem value="monthly">Monthly</MenuItem>
        <MenuItem value="yearly">Yearly</MenuItem>
      </Select>
    </FormControl>
    </Box>

  {loading ? (
    <>
      <Grid container direction="row" spacing={2}>
        {[...Array(3)].map((_, idx) => (
          <Grid size={{xs:12, md:4}} key={idx}>
            <Skeleton
              variant="rounded"
              height={190}
              sx={{ width: '100%' }}
            />
          </Grid>
        ))}
      </Grid>

    </>
  ) : (
    <DashboardCard range={range} />
  )}

  <Grid container spacing={4}>
    {/* Attendance by Group */}
    <Grid size={{xs:12, md:6}}>
      <Typography variant="h6" gutterBottom>
        Attendance by Group 
      </Typography>
      {loading ? (
        <Skeleton variant="rounded" height={300} />
      ) : (
        <>      
        <AttendanceChart range={range} />
         </>
      )}
    </Grid>

    {/* Finance Chart */}
    <Grid size={{xs:12, md:6}}>
      <Typography variant="h6" gutterBottom>
        Fees vs Salary
      </Typography>
      {loading ? (
        <Skeleton variant="rounded" height={300} />
      ) : (
        <>
          <FinanceChart range={range} />
        </>
      )}
    </Grid>

    {/* Group Strength */}
    <Grid size={{xs:12, md:6}}>
      <Typography variant="h6" >Member Admission By Group</Typography>
      {loading ? (
        <Skeleton variant="rounded" height={250} />
      ) : (
        <>
          <GroupStrengthChart range={range} />
        </>
      )}
    </Grid>

    {/* Pending Fees */}
    <Grid size={{xs:12, md:6}}>
      <Typography variant="h6" gutterBottom>
        Pending Fees by Group
      </Typography>
      {loading ? (
        <Skeleton variant="rounded" height={250} />
      ) : (
        <PendingChart />
      )}
    </Grid>
  </Grid>
</Container>
 </main>
    </>
  );
}
