'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useTrainingConsistency } from '@/hooks/useWorkoutData';
import { 
  Paper, 
  Box, 
  Typography, 
  CircularProgress, 
  useTheme 
} from '@mui/material';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ConsistencyChartProps {
    data?: { month: string; sessionCount: number; exerciseTypes: number; totalDuration: number }[];
}

const ConsistencyChart: React.FC<ConsistencyChartProps> = ({ data }) => {
  const { monthlyMetrics, isLoading, isError } = useTrainingConsistency();
  const theme = useTheme();
  
  if (isLoading) {
    return (
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          height: 320, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
      >
        <CircularProgress />
      </Paper>
    );
  }
  
  if (isError) {
    return (
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          height: 320, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
      >
        <Typography color="error">
          Error loading training consistency data
        </Typography>
      </Paper>
    );
  }
  
  // Sort metrics by month
  const sortedMetrics = [...monthlyMetrics].sort((a, b) => a.month.localeCompare(b.month));
  
  // Get the last 12 months of data
  const recentMetrics = sortedMetrics.slice(-12);
  
  const chartData = {
    labels: recentMetrics.map(metric => {
      // Format month labels (e.g., "2023-01" to "Jan 2023")
      const formatMonthLabel = (monthKey: string) => {
        const [year, month] = monthKey.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      };
      return formatMonthLabel(metric.month)
    }),
    datasets: [
      {
        label: 'Workout Sessions',
        data: recentMetrics.map(metric => metric.sessionCount),
        backgroundColor: theme.palette.primary.main,
      },
      {
        label: 'Exercise Variety',
        data: recentMetrics.map(metric => metric.exerciseTypes),
        backgroundColor: theme.palette.secondary.main,
      },
    ],
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: theme.palette.text.primary
        }
      },
      title: {
        display: true,
        text: 'Training Consistency',
        color: theme.palette.text.primary,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        callbacks: {
          afterBody: (tooltipItems: any[]) => {
            const index = tooltipItems[0].dataIndex;
            const metric = recentMetrics[index];
            return `Total Duration: ${Math.round(metric.totalDuration / 60)} minutes`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
          color: theme.palette.divider
        },
        ticks: {
          color: theme.palette.text.secondary
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: theme.palette.divider
        },
        ticks: {
          color: theme.palette.text.secondary
        },
        title: {
          display: true,
          text: 'Count',
          color: theme.palette.text.secondary
        },
      },
    },
  };
  
  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box sx={{ height: 320 }}>
        <Bar data={chartData} options={chartOptions} />
      </Box>
    </Paper>
  );
};

export default ConsistencyChart;
