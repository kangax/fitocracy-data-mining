'use client';

import React from 'react';
import Layout from '@/components/layout/Layout';
import MovementProficiencyTable from '@/components/movements/MovementProficiencyTable';
import { Typography, Stack, Box } from '@mui/material';

export default function SkillsPage() {
  return (
    <Layout>
      <Stack spacing={4}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Movement Skills
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Track your proficiency across different CrossFit movements
          </Typography>
        </Box>
        
        <MovementProficiencyTable />
      </Stack>
    </Layout>
  );
}
