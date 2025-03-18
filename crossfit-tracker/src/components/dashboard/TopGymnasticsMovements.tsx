'use client';

import React from 'react';
import { 
  Paper, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Box
} from '@mui/material';

// Sample data for the table
const sampleData = [
  { movement: 'Pull-ups', score: 95, sessions: 42 },
  { movement: 'Muscle-ups', score: 87, sessions: 28 },
  { movement: 'Handstand Push-ups', score: 82, sessions: 35 },
  { movement: 'Pistol Squats', score: 78, sessions: 31 },
  { movement: 'Toes to Bar', score: 75, sessions: 39 },
];

const TopGymnasticsMovements: React.FC = () => {
  return (
    <Paper elevation={2} sx={{ p: 3, bgcolor: 'background.paper' }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Top Gymnastics Movements
      </Typography>
      
      <TableContainer component={Box}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Movement</TableCell>
              <TableCell align="right">Proficiency Score</TableCell>
              <TableCell align="right">Sessions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sampleData.map((row) => (
              <TableRow key={row.movement}>
                <TableCell component="th" scope="row">
                  {row.movement}
                </TableCell>
                <TableCell align="right">{row.score}</TableCell>
                <TableCell align="right">{row.sessions}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default TopGymnasticsMovements;
