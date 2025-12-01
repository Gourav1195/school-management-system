'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import {
  Card,
  CardContent,
  Box,
  CircularProgress,
  Skeleton,
} from '@mui/material'
import { DropDownKey } from '@/types/all'
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

type DailyStat = {
  label: string
  present: number
  absent: number
  total: number
  percentPresent: number
}

interface AttendanceChartProps {
    range: DropDownKey
}

type AttendanceGroupedData = Record<string, DailyStat[]>

const AttendanceChart: React.FC<AttendanceChartProps> = ({range}) => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<AttendanceGroupedData>({})
  const [labels, setLabels] = useState<string[]>([])

  const fetchAttendance = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/dashboard?range=${range}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`
        }
      })
      const result = await res.json()
      setData(result.attendance.grouped)
      setLabels(result.attendance.labels)
    } catch (err) {
      console.error('Failed to fetch attendance:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAttendance()
  }, [range])

  const chartData = useMemo(() => {
    const colors = ['#0057D9', '#00B386', '#F97316', '#8B5CF6', '#E11D48']
    const datasets = Object.entries(data).map(([groupName, stats], idx) => {
      const percentSeries = labels.map(label => {
        const match = stats.find(s => s.label === label)
        return match ? match.percentPresent : 0
      })

      return {
        label: groupName,
        data: percentSeries,
        borderColor: colors[idx % colors.length],
        backgroundColor: colors[idx % colors.length],
        fill: false,
        tension: 0.3,
        pointRadius: 3
      }
    })

    return {
      labels,
      datasets
    }
  }, [data, labels])

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        {/* <Typography variant="h6">Attendance (% Present)</Typography> */}
        <Box sx={{ height: { xs: 300, md: 400 }, position: 'relative' }}>
          {loading ? (
            <Skeleton />
          ) : (
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom' },
                  title: { display: false }
                },
                scales: {
                  x: {
                    title: { display: true, text: 'Date / Range' },
                    grid: { display: false }
                  },
                  y: {
                    title: { display: true, text: '% Present' },
                    beginAtZero: true,
                    max: 100,
                    ticks: { stepSize: 10 }
                  }
                }
              }}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

export default AttendanceChart
