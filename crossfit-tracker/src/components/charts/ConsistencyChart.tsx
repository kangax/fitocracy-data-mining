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

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ConsistencyChart: React.FC = () => {
  const { monthlyMetrics, isLoading, isError } = useTrainingConsistency();
  
  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg shadow p-4 h-80 flex items-center justify-center">
        <div className="animate-pulse h-4 bg-gray-600 rounded w-1/2"></div>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="bg-gray-800 rounded-lg shadow p-4 h-80 flex items-center justify-center text-red-500">
        Error loading training consistency data
      </div>
    );
  }
  
  // Sort metrics by month
  const sortedMetrics = [...monthlyMetrics].sort((a, b) => a.month.localeCompare(b.month));
  
  // Get the last 12 months of data
  const recentMetrics = sortedMetrics.slice(-12);
  
  // Format month labels (e.g., "2023-01" to "Jan 2023")
  const formatMonthLabel = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };
  
  const chartData = {
    labels: recentMetrics.map(metric => formatMonthLabel(metric.month)),
    datasets: [
      {
        label: 'Workout Sessions',
        data: recentMetrics.map(metric => metric.sessionCount),
        backgroundColor: 'rgba(59, 130, 246, 0.8)', // Blue
      },
      {
        label: 'Exercise Variety',
        data: recentMetrics.map(metric => metric.exerciseTypes),
        backgroundColor: 'rgba(16, 185, 129, 0.8)', // Green
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
          color: '#fff'
        }
      },
      title: {
        display: true,
        text: 'Training Consistency',
        color: '#fff',
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
          color: '#374151'
        },
        ticks: {
          color: '#9CA3AF'
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#374151'
        },
        ticks: {
          color: '#9CA3AF'
        },
        title: {
          display: true,
          text: 'Count',
          color: '#9CA3AF'
        },
      },
    },
  };
  
  return (
    <div className="bg-gray-800 rounded-lg shadow p-4">
      <div className="h-80">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default ConsistencyChart;
