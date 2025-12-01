import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import {
  Card,
  CardContent,
  Box,
  CircularProgress,
  Select,
  MenuItem,
  Skeleton
} from '@mui/material';
import { apiClient } from '@/app/utils/apiClient';
import { useAuth } from '@/context/AuthContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const PendingChart: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<'FEE' | 'SALARY'>('FEE');
  const [sessionYear, setSessionYear] = useState(new Date().getFullYear());
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;

    async function load() {
      setLoading(true);
      try {
        const res = await apiClient(`/api/dashboard/pending?type=${type}&sessionYear=${sessionYear}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res) return; 
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const json = await res.json();
        setData(json.groupWise ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [token, type, sessionYear]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <Skeleton />
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
        <CardContent>
          No data available for this selection.
        </CardContent>
      </Card>
    );
  }

  const chartData = {
    labels: data.map(g => g.groupName),
    datasets: [
      {
        label: 'Paid',
        data: data.map(g => g.paid),
        backgroundColor: '#4CAF50'
      },
      {
        label: 'Pending',
        data: data.map(g => g.pending),
        backgroundColor: '#F97316'
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' as const },
      title: { display: true, text: `${type} Group Summary - ${sessionYear}` }
    },
    scales: {
      x: {
        stacked: true,  // 🟢 stack Paid + Pending side-by-side as one bar
        grid: { display: false },
        ticks: { autoSkip: false, maxRotation: 45, minRotation: 30 }
      },
      y: {
        stacked: true,  // 🟢 stack Paid + Pending values
        beginAtZero: true
      }
    }
  };

  return (
    <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
      <CardContent>
        <Box mb={2} display="flex" gap={2}>
          <Select value={type} onChange={e => setType(e.target.value as 'FEE' | 'SALARY')} size="small">
            <MenuItem value="FEE">Fee</MenuItem>
            <MenuItem value="SALARY">Salary</MenuItem>
          </Select>
          <Select value={sessionYear} onChange={e => setSessionYear(Number(e.target.value))} size="small">
            {[2022, 2023, 2024, 2025].map(yr => (
              <MenuItem key={yr} value={yr}>{yr}</MenuItem>
            ))}
          </Select>
        </Box>
        <Box sx={{ height: { xs: 300, md: 500 } }}>
          <Bar data={chartData} options={options} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default PendingChart;