'use client'

import {
  Box,
  Card,
  CardContent,
  FormControl,
  Grid,
  MenuItem,
  Select,
  Typography,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import ErrorIcon from '@mui/icons-material/Error'
import { DropDownKey } from '@/types/all';

interface Summary {
  totalFees: number
  newMembers: number
  pendingFees: number
  feeGrowthPercent: number
  memberGrowthPercent: number
  pendingGrowthPercent: number
}

type DashboardCardProps = {
  range: DropDownKey
}
const DashboardCard: React.FC<DashboardCardProps> = ({range}) => {
  const [summary, setSummary] = useState<Summary | null>(null)

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch(`/api/dashboard/summary?range=${range}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`, // or get from cookie/session
          },
        })
        const data = await res.json()
        setSummary(data.summary)
      } catch (err) {
        console.error('Failed to fetch dashboard summary', err)
      }
    }

    fetchSummary()
  }, [range])

  return (
    <Box>
      <Grid container spacing={3} mb={3}>
        {/* Total Fees Collected */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box m={1}>
                  <AccountBalanceWalletIcon fontSize="large" sx={{ color: '#98d611' }} />
                </Box>
                {/* <FormControl sx={{ width: 100 }}>
                  <Select
                    value={range}
                    onChange={(e) => setRange(e.target.value as DropDownKey)}
                    sx={{ fontSize: 10, height: 30, color: '#495057' }}
                  >
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="yearly">Yearly</MenuItem>
                  </Select>
                </FormControl> */}
                <Typography
                  variant="body2"
                  color="#2B8A3E"
                  bgcolor="#ECFDF3"
                  border="1px solid #D3F9D8"
                  borderRadius="6px"
                  p="4px"
                >
                  ↑ {summary?.feeGrowthPercent ?? 0}%
                </Typography>
              </Box>
              <Typography color="text.secondary" fontSize="14px" py={1}>
                Total Fees
              </Typography>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h4" fontWeight="bold">
                  ₹{summary?.totalFees?.toFixed(2) ?? '0.00'}
                </Typography>
                
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* New Members */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box m={1}>
                  <CalendarMonthIcon fontSize="large" sx={{ color: 'lightblue' }} />
                </Box>
                {/* <FormControl sx={{ width: 100 }}>
                  <Select
                    value={range}
                    onChange={(e) => setRange(e.target.value as DropDownKey)}
                    sx={{ fontSize: 10, height: 30, color: '#495057' }}
                  >
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="yearly">Yearly</MenuItem>
                  </Select>
                </FormControl> */}
                <Typography
                  variant="body2"
                  color="#2B8A3E"
                  bgcolor="#ECFDF3"
                  border="1px solid #D3F9D8"
                  borderRadius="6px"
                  p="4px"
                >
                  ↑ {summary?.memberGrowthPercent ?? 0}%
                </Typography>
              </Box>
              <Typography color="text.secondary" fontSize="14px" py={1}>
                New Members
              </Typography>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h4" fontWeight="bold">
                  {summary?.newMembers ?? 0}
                </Typography>
                
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Pending Fees */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box m={1}>
                  <ErrorIcon fontSize="large" sx={{ color: 'orange' }} />
                </Box>
                {/* <FormControl sx={{ width: 100 }}>
                  <Select
                    value={range}
                    onChange={(e) => setRange(e.target.value as DropDownKey)}
                    sx={{ fontSize: 10, height: 30, color: '#495057' }}
                  >
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="yearly">Yearly</MenuItem>
                  </Select>
                </FormControl> */}
                
                <Typography
                  variant="body2"
                  color="#2B8A3E"
                  bgcolor="#ECFDF3"
                  border="1px solid #D3F9D8"
                  borderRadius="6px"
                  p="4px"
                >
                  ↑ {summary?.pendingGrowthPercent ?? 0}%
                </Typography>
              </Box>
              <Typography color="text.secondary" fontSize="14px" py={1}>
                Pending Fees
              </Typography>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h4" fontWeight="bold">
                  ₹{summary?.pendingFees?.toFixed(2) ?? '0.00'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default DashboardCard
