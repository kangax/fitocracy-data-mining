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

interface MovementFrequencyChartProps {
  data: {
    month: string;
    sessionCount: number;
  }[];
  isLoading?: boolean;
  isError?: boolean;
}

const MovementFrequencyChart: React.FC<MovementFrequencyChartProps> = ({ 
  data, 
  isLoading = false, 
  isError = false 
}) => {
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
          Error loading movement frequency data
        </Typography>
      </Paper>
    );
  }
  
  // Sort data by month
  const sortedData = [...data].sort((a, b) => a.month.localeCompare(b.month));
  
  // Use all data instead of limiting to the last 12 months
  const allData = sortedData;
  
  const chartData = {
    labels: allData.map(item => {
      // Format month labels (e.g., "2023-01" to "Jan 2023")
      const formatMonthLabel = (monthKey: string) => {
        const [year, month] = monthKey.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      };
      return formatMonthLabel(item.month);
    }),
    datasets: [
      {
        label: 'Sessions',
        data: allData.map(item => item.sessionCount),
        backgroundColor: theme.palette.primary.main,
      }
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
        text: 'Training Frequency',
        color: theme.palette.text.primary,
        font: {
          size: 16,
          weight: 'bold' as const,
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
          color: theme.palette.text.secondary,
          stepSize: 1, // Ensure whole numbers for session counts
        },
        title: {
          display: true,
          text: 'Sessions',
          color: theme.palette.text.secondary
        },
      },
    },
  };
  
  return (
    <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
      <Box sx={{ height: 320 }}>
        <Bar data={chartData} options={chartOptions} />
      </Box>
    </Paper>
  );
};

export default MovementFrequencyChart;
