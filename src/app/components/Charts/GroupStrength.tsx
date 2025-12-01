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
import { Card, CardContent, Box, CircularProgress, Typography, Skeleton } from '@mui/material';
import { apiClient } from '@/app/utils/apiClient';
import { useAuth } from '@/context/AuthContext';
import { DropDownKey } from '@/types/all'
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface StrengthPoint {
  date: string;
  groups: {
    groupId: string;
    groupName: string;
    memberCount: number;
  }[];
}

interface MemberStrengthByDateAndGroupChartProps {
    range: DropDownKey
}

const MemberStrengthByDateAndGroupChart: React.FC<MemberStrengthByDateAndGroupChartProps> = ({range}) => {
  const [data, setData] = useState<StrengthPoint[]>([]);
  const [loading, setLoading] = useState(false);

  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;
    async function load() {
      setLoading(true);
      try {
        const res = await apiClient(`/api/dashboard/groupStrength?range=${range}`, { method: 'GET' });
        if (!res) return; 
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const json = await res.json();
        setData(json.strength ?? []);
      } catch (err) {
        console.error(err);
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

  if (!data.length) {
    return (
      <Card>
        <CardContent>No member strength data available.</CardContent>
      </Card>
    );
  }

  // Build datasets
  const groupIds = Array.from(
    new Set(data.flatMap(d => d.groups.map(g => g.groupId)))
  );

  const groupNames = new Map<string, string>();
  data.forEach(d => {
    d.groups.forEach(g => {
      groupNames.set(g.groupId, g.groupName);
    });
  });

  const colors = ['#3f51b5', '#ff9800', '#009688', '#f44336', '#9c27b0', '#4caf50'];

  const datasets = groupIds.map((gid, idx) => ({
    label: groupNames.get(gid) || 'Unknown',
    data: data.map(d =>
      d.groups.find(g => g.groupId === gid)?.memberCount || 0
    ),
    backgroundColor: colors[idx % colors.length]
  }));

  const chartData = {
    labels: data.map(d => d.date),
    datasets
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: `Member Strength by Group (${range})`
      }
    },
    scales: {
      x: { stacked: true },
      y: { stacked: true, beginAtZero: true }
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" sx={{flexDirection:{xs:'column', md:'row'}}} alignItems="center" mb={2}>
          {/* <Typography variant="h6" >Member Admission By Group</Typography> */}
          </Box>
        {/* <Box mb={2}>
          <Select
            value={granularity}
            onChange={e => setGranularity(e.target.value)}
            size="small"
          >
            <MenuItem value="day">Daily</MenuItem>
            <MenuItem value="month">Monthly</MenuItem>
            <MenuItem value="year">Yearly</MenuItem>
          </Select>
        </Box> */}
        <Box sx={{ height: { xs: 300, md: 400 } }}>
          <Bar data={chartData} options={options} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default MemberStrengthByDateAndGroupChart;
