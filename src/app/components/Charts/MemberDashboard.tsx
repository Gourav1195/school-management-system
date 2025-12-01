'use client'

import React, { useEffect, useState } from 'react'
import { Box, Typography, CircularProgress, Grid, Card, CardContent, Divider } from '@mui/material'
import AttendanceCalendar from '@/app/components/Charts/AttendanceCalendar'
import { apiClient } from '@/app/utils/apiClient'
import toast from 'react-hot-toast'
import Head from 'next/head'

type AttendanceRecord = {
  attendance: { date: string }
  present: boolean
}

type MemberDashboardData = {
  attendance: {
    total: number
    present: number
    percentage: string
  }
  fee: {
    expected: number
    paid: number
    pending: number
    pendingMonthNames?: string[]
  }
  member: {
    name: string
    email: string
    group: string
    attendanceRecords: AttendanceRecord[]
  }
}

const StatCard = ({
  title,
  value,
  color = 'primary'
}: {
  title: string
  value: string | number
  color?: 'primary' | 'secondary' | 'error' | 'success' | 'warning'
}) => (
  <Card variant="outlined" sx={{ minWidth: 120 }}>
    <CardContent>
      <Typography color="text.secondary" variant="caption">
        {title}
      </Typography>
      <Typography variant="h6" color={`${color}.main`}>
        {value}
      </Typography>
    </CardContent>
  </Card>
)

const MemberDashboard = () => {
  const [memberData, setMemberData] = useState<MemberDashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAttendance() {
      try {
        const res = await apiClient('/api/member/dashboard')
        if (!res) {
          toast.error('Failed to fetch dashboard data')
          return
        }
        const data = await res.json()
        setMemberData(data)
        console.log('📦 Dashboard data:', data)
      } catch (error) {
        console.error('❌ Error fetching member dashboard:', error)
        toast.error('Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    fetchAttendance()
  }, [])

  if (loading || !memberData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
        <CircularProgress />
      </Box>
    )
  }

  const { member, attendance, fee } = memberData

  return (
        <>
      <Head>
        <title>Equaseed | Member Dashboard</title>
        <meta name="description" content="Track your attendance, monitor your progress, and stay updated with everything that matters—right from your personalized dashboard. Designed for clarity, built for action." />
      </Head>
      <main>
        {/* Alt: “Your command center for attendance, tasks, and real-time updates. Stay organized, stay ahead.” */}
    <Box p={3}>
      <Typography variant="h5" fontWeight="bold" mb={1}>
        Welcome back, {member.name} 👋
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" mb={3}>
        Group: {member.group} | Email: {member.email}
      </Typography>

      {/* Stats */}
      <Grid container spacing={2} mb={4}>
        <Grid size={{xs:12, md:3}}>
          <StatCard title="Total Days" value={attendance.total} />
        </Grid>
        <Grid size={{xs:12, md:3}}>
          <StatCard title="Present Days" value={attendance.present} color="success" />
        </Grid>
        <Grid size={{xs:12, md:3}}>
          <StatCard title="Attendance %" value={`${attendance.percentage}%`} color="primary" />
        </Grid>
       
        <Grid size={{xs:12, md:3}}>
          <StatCard title="Pending Fees" value={`₹${fee.pending < 0 ? 0 : fee.pending}`} color= {fee.pending <= 0 ? 'success' : 'error'} />
        </Grid>
      </Grid>

      <Divider sx={{ mb: 3 }} />

      {/* Calendar */}
      <Typography variant="h6" mb={2}>
        Attendance Calendar
      </Typography>
      <AttendanceCalendar attendanceRecords={member.attendanceRecords} />
    </Box>
    </main>
    </>
  )
}

export default MemberDashboard
