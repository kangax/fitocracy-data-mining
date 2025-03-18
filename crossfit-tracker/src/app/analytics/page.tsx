'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import ConsistencyChart from '@/components/charts/ConsistencyChart';
import { useTrainingConsistency, useSessions } from '@/hooks/useWorkoutData';
import * as calculations from '@/lib/calculations';
import TopGymnasticsMovements from '@/components/dashboard/TopGymnasticsMovements';
import { 
  Typography, 
  Stack, 
  Paper, 
  Box 
} from '@mui/material';

interface ConsistencyData {
    month: string;
    sessionCount: number;
    exerciseTypes: number;
    totalDuration: number;
}

export default function AnalyticsPage() {
  const { monthlyMetrics, isLoading: isLoadingConsistency } = useTrainingConsistency();
  const { sessions, isLoading } = useSessions();
  const [consistencyData, setConsistencyData] = useState<ConsistencyData[]>([]);

  useEffect(() => {
    if (!sessions || sessions.length === 0) return;

    const consistency = calculations.calculateTrainingConsistency(sessions) as ConsistencyData[];
    setConsistencyData(consistency);
  }, [sessions]);

  return (
    <Layout>
      <Stack spacing={4}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Analytics
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Track your training consistency and performance metrics
          </Typography>
        </Box>

        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Training Consistency
          </Typography>
          <Box sx={{ height: 400 }}>
            <ConsistencyChart data={consistencyData} />
          </Box>
        </Paper>
        
        <TopGymnasticsMovements />
      </Stack>
    </Layout>
  );
}
