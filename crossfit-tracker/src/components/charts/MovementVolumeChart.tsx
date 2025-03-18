'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { 
  Paper, 
  Box, 
  Typography, 
  CircularProgress, 
  useTheme 
} from '@mui/material';
import { format } from 'date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface VolumeDataPoint {
  date: string;
  volume: number;
  unit?: string;
}

interface MovementVolumeChartProps {
  data: VolumeDataPoint[];
  isLoading?: boolean;
  isError?: boolean;
}

const MovementVolumeChart: React.FC<MovementVolumeChartProps> = ({ 
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
          Error loading movement volume data
        </Typography>
      </Paper>
    );
  }
  
  // Sort data by date
  const sortedData = [...data].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // Use all data instead of limiting to the last 20 sessions
  const allData = sortedData;
  
  // Determine if we have a consistent unit
  const unit = allData.length > 0 && allData[0].unit 
    ? allData[0].unit 
    : '';
  
  const chartData = {
    labels: allData.map(item => format(new Date(item.date), 'MMM d, yyyy')),
    datasets: [
      {
        label: `Volume${unit ? ` (${unit})` : ''}`,
        data: allData.map(item => item.volume),
        borderColor: theme.palette.secondary.main,
        backgroundColor: theme.palette.secondary.main + '33', // Add transparency
        tension: 0.1, // Slight curve to the line
        fill: false,
        pointRadius: 4,
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
        text: 'Volume Progression',
        color: theme.palette.text.primary,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.raw;
            return `Volume: ${value}${unit ? ` ${unit}` : ''}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          color: theme.palette.divider
        },
        ticks: {
          color: theme.palette.text.secondary,
          maxRotation: 45,
          minRotation: 45
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
          text: `Volume${unit ? ` (${unit})` : ''}`,
          color: theme.palette.text.secondary
        },
      },
    },
  };
  
  return (
    <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
      <Box sx={{ height: 320 }}>
        <Line data={chartData} options={chartOptions} />
      </Box>
    </Paper>
  );
};

export default MovementVolumeChart;
