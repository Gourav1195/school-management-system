import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import {
  Card, CardContent, Box, Typography, CircularProgress,
  ButtonGroup, Button,
  Skeleton
} from '@mui/material';
import { apiClient } from '@/app/utils/apiClient';
import { useAuth } from '@/context/AuthContext';
import { DropDownKey } from '@/types/all'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export interface FinancePoint {
  date: string;
  fees: number;
  salary: number;
}

interface FinanceChartProps {
    range: DropDownKey
}

const FinanceChart: React.FC<FinanceChartProps> = ({range}) => {
  const today = new Date();
  today.setDate(today.getDate() + 1);
  const defaultFrom = new Date(today.getFullYear(), today.getMonth(), 1);
  const defaultTo = today;

  const [from] = useState<string>(defaultFrom.toISOString().split('T')[0]);
  const [to] = useState<string>(defaultTo.toISOString().split('T')[0]);
  const [data, setData] = useState<FinancePoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;

    async function load() {
      setLoading(true);
      try {
        const res = await apiClient(`/api/dashboard/finance?range=${range}`, {
          method: 'GET'
        });
        if (!res) return; 
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const json: any = await res.json();
        const fetchedData = json.finance?.feesSalary ?? [];
        setData(fetchedData);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to load finance data');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [token, range]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <Skeleton />
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
        <CardContent>
          <Typography variant="h6">No finance data available.</Typography>
        </CardContent>
      </Card>
    );
  }

  const labels = data.map(pt => pt.date);
  const feesData = data.map(pt => pt.fees);
  const salaryData = data.map(pt => pt.salary);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Fees Collected',
        data: feesData,
        borderColor: '#3f51b5',
        backgroundColor: '#3f51b5',
        fill: false,
        tension: 0.4
      },
      {
        label: 'Salary Paid',
        data: salaryData,
        borderColor: '#ff9800',
        backgroundColor: '#ff9800',
        fill: false,
        tension: 0.4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      title: {
        display: true,
        text: `${range.charAt(0).toUpperCase() + range.slice(1)} Finance Overview`
      }
    },
    scales: {
      x: {
        grid: { display: false }
      },
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1000 }
      }
    }
  };

  return (
    <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
      <CardContent>        
          {/* <Typography variant="h6">Fees vs Salary</Typography> */}
          
        <Box sx={{ height: { xs: 300, md: 400 } }}>
          <Line data={chartData} options={options} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default FinanceChart;
