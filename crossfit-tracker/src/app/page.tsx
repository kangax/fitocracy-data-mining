'use client';

import React from 'react';
import Layout from '@/components/layout/Layout';
import PerformanceMetrics from '@/components/dashboard/PerformanceMetrics';
import MovementProficiencyTable from '@/components/movements/MovementProficiencyTable';
import ConsistencyChart from '@/components/charts/ConsistencyChart';
import { 
  Typography, 
  Stack, 
  Grid, 
  Paper, 
  Box, 
  List, 
  ListItem, 
  ListItemText,
  Divider 
} from '@mui/material';

export default function Home() {
  return (
    <Layout>
      <Stack spacing={4}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Track your CrossFit progress and movement proficiency
          </Typography>
        </Box>
        
        <PerformanceMetrics />
        
        <Grid container spacing={3}>
          <Grid item xs={12} lg={6}>
            <ConsistencyChart />
          </Grid>
          <Grid item xs={12} lg={6}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Recent PRs
              </Typography>
              <List>
                <ListItem 
                  sx={{ 
                    borderLeft: 4, 
                    borderColor: 'success.main', 
                    pl: 3, 
                    mb: 2 
                  }}
                >
                  <ListItemText 
                    primary={
                      <Typography variant="body1" fontWeight="medium">
                        Back Squat: 315 lbs
                      </Typography>
                    }
                    secondary="March 12, 2025"
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
                
                <ListItem 
                  sx={{ 
                    borderLeft: 4, 
                    borderColor: 'success.main', 
                    pl: 3, 
                    mb: 2,
                    mt: 2 
                  }}
                >
                  <ListItemText 
                    primary={
                      <Typography variant="body1" fontWeight="medium">
                        Deadlift: 405 lbs
                      </Typography>
                    }
                    secondary="March 5, 2025"
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
                
                <ListItem 
                  sx={{ 
                    borderLeft: 4, 
                    borderColor: 'success.main', 
                    pl: 3,
                    mt: 2 
                  }}
                >
                  <ListItemText 
                    primary={
                      <Typography variant="body1" fontWeight="medium">
                        Clean & Jerk: 225 lbs
                      </Typography>
                    }
                    secondary="February 28, 2025"
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
        
        <MovementProficiencyTable />
      </Stack>
    </Layout>
  );
}
