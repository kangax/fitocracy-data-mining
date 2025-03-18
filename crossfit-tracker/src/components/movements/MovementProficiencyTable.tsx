'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useMovementProficiency } from '@/hooks/useWorkoutData';
import type { MovementProficiency } from '@/lib/calculations';
import {
  Paper,
  Typography,
  TextField,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Skeleton,
  TableSortLabel,
  Chip,
  Alert,
  Stack
} from '@mui/material';

const MovementProficiencyTable: React.FC = () => {
  const { proficiencyData, isLoading, isError } = useMovementProficiency();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<keyof MovementProficiency>('proficiencyScore');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Handle sorting
  const handleSort = (column: keyof MovementProficiency) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('desc');
    }
  };
  
  // Filter and sort data
  const filteredAndSortedData = [...(proficiencyData || [])]
    .filter((movement) => 
      movement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (movement.category && movement.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (movement.equipment && movement.equipment.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      } else if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      return 0;
    });
  
  if (isError) {
    return <Alert severity="error">Error loading movement proficiency data</Alert>;
  }
  
  return (
    <Paper elevation={2} sx={{ overflow: 'hidden' }}>
      <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Movement Proficiency
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Track your skill development across different movements
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search movements..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          margin="normal"
          size="small"
        />
      </Box>
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'name'}
                  direction={sortBy === 'name' ? sortDirection : 'asc'}
                  onClick={() => handleSort('name')}
                >
                  Movement
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'frequency'}
                  direction={sortBy === 'frequency' ? sortDirection : 'asc'}
                  onClick={() => handleSort('frequency')}
                >
                  Frequency
                </TableSortLabel>
                <Typography variant="caption" display="block" color="text.secondary">
                  <Box component="span" sx={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); handleSort('sessionCount'); }}>
                    Sessions
                    {sortBy === 'sessionCount' && (
                      <Box component="span" sx={{ ml: 0.5 }}>
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </Box>
                    )}
                  </Box>
                  {' • '}
                  <Box component="span" sx={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); handleSort('frequency'); }}>
                    Sets
                    {sortBy === 'frequency' && (
                      <Box component="span" sx={{ ml: 0.5 }}>
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </Box>
                    )}
                  </Box>
                </Typography>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'lastPerformed'}
                  direction={sortBy === 'lastPerformed' ? sortDirection : 'asc'}
                  onClick={() => handleSort('lastPerformed')}
                >
                  Last Performed
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'proficiencyScore'}
                  direction={sortBy === 'proficiencyScore' ? sortDirection : 'asc'}
                  onClick={() => handleSort('proficiencyScore')}
                >
                  Proficiency
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton variant="text" width="75%" /></TableCell>
                  <TableCell><Skeleton variant="text" width="50%" /></TableCell>
                  <TableCell><Skeleton variant="text" width="50%" /></TableCell>
                  <TableCell><Skeleton variant="text" width="25%" /></TableCell>
                </TableRow>
              ))
            ) : (
              filteredAndSortedData.map((movement) => (
                <TableRow key={movement.exerciseId}>
                  <TableCell>
                    <Link 
                      href={`/movements/${movement.exerciseId}`}
                      style={{ color: 'inherit', textDecoration: 'none' }}
                    >
                      <Typography color="primary" sx={{ '&:hover': { textDecoration: 'underline' } }}>
                        {movement.name}
                      </Typography>
                    </Link>
                    <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                      {movement.category && (
                        <Chip 
                          label={movement.category} 
                          size="small" 
                          variant="outlined" 
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      )}
                      {movement.equipment && (
                        <Chip 
                          label={movement.equipment} 
                          size="small" 
                          variant="outlined" 
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography>{movement.frequency} sets</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {movement.sessionCount} sessions • {movement.totalReps} total reps
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography>{new Date(movement.lastPerformed).toLocaleDateString()}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {movement.daysAgo} days ago
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: 100, mr: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.min(100, movement.proficiencyScore)} 
                          color="primary"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {movement.proficiencyScore.toFixed(1)}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default MovementProficiencyTable;
