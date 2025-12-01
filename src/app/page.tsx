'use client'
import React, { JSX } from 'react'
import { useAuth } from '@/context/AuthContext'
import AdminDashboard from '@/app/components/Charts/AdminDashboard'
import MemberDashboard from '@/app/components/Charts/MemberDashboard'
import StartingPage from '@/app/components/Charts/StartingPage'
import SuperAdminDashboard from '@/app/components/System/SuperAdminDashboard'

const Dashboard = () => {
  const { role, token, loading :authLoading } = useAuth()

  if (authLoading) return null // or a loader if you’re feeling fancy

  if (!role || !token) {
    return <StartingPage />
  }

  const dashboards: Record<string, JSX.Element> = {
    SuperAdmin: <SuperAdminDashboard />,
    Admin: <AdminDashboard />,
    Member: <MemberDashboard />
  }
  return dashboards[role] || <StartingPage />
}

export default Dashboard
