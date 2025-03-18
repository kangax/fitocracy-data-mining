'use client';

import React from 'react';
import { useSessions } from '@/hooks/useWorkoutData';
import type { Session, ExerciseSession, Set } from '@/lib/data';
import { Grid, Card, CardContent, Typography, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';

interface MetricCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  isLoading: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, subValue, isLoading }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="subtitle2" color="textSecondary">{title}</Typography>
        {isLoading ? (
          <div className="animate-pulse h-8 bg-gray-700 rounded mt-2"></div>
        ) : (
          <div>
            <Typography variant="h5" component="div">
              {value}
            </Typography>
            {subValue && (
              <Typography variant="caption" color="textSecondary">
                {subValue}
              </Typography>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const PerformanceMetrics: React.FC = () => {
  const { sessions, isLoading } = useSessions();
  
  // Calculate metrics
  const totalWorkouts = sessions.length;
  
  // Calculate workout frequency (average per week over the last 4 weeks)
  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
  
  const recentSessions = sessions.filter((session: Session) => {
    const sessionDate = new Date(session.date);
    return sessionDate >= fourWeeksAgo;
  });
  
  const workoutsPerWeek = recentSessions.length / 4;
  
  // Calculate total exercise types
  const uniqueExercises = new Set();
  sessions.forEach((session: Session) => {
    session.exercises.forEach((exercise: ExerciseSession) => {
      uniqueExercises.add(exercise.exerciseId);
    });
  });
  
  // Calculate total volume (simplified)
  let totalVolume = 0;
  sessions.forEach((session: Session) => {
    session.exercises.forEach((exercise: ExerciseSession) => {
      exercise.sets.forEach((set: Set) => {
        if (set.reps && set.weight) {
          totalVolume += set.reps * set.weight.value;
        } else if (set.reps && set.primaryLoad) {
          totalVolume += set.reps * set.primaryLoad.value;
        }
      });
    });
  });
  
  // Calculate total distance
  let totalDistance = 0;
  sessions.forEach((session: Session) => {
    session.exercises.forEach((exercise: ExerciseSession) => {
      exercise.sets.forEach((set: Set) => {
        if (set.distance) {
          // Convert all distances to miles for consistency
          if (set.distance.unit === 'mile') {
            totalDistance += set.distance.value;
          } else if (set.distance.unit === 'kilometer' || set.distance.unit === 'km') {
            totalDistance += set.distance.value * 0.621371;
          } else if (set.distance.unit === 'meter' || set.distance.unit === 'm') {
            totalDistance += (set.distance.value / 1000) * 0.621371;
          }
        }
      });
    });
  });
  
  const gymnasticsSkills = [
    { movement: 'Pull-ups', maxReps: 25 },
    { movement: 'Push-ups', maxReps: 50 },
    { movement: 'Air Squats', maxReps: 100 },
    { movement: 'Handstand Push-ups', maxReps: 12 },
    { movement: 'Toes to Bar', maxReps: 15 },
    { movement: 'Muscle Ups', maxReps: 5 },
    { movement: 'Pistol Squats', maxReps: 10 },
  ];

  return (
    <Grid container spacing={2} direction="column" className="mb-8">
      <Grid item>
        <Typography variant="h5" component="h2">
          Performance Metrics
        </Typography>
      </Grid>
      <Grid item container spacing={2}>
        <Grid item xs={12} md={6} lg={4}>
          <MetricCard
            title="TRAINING DAYS"
            value={totalWorkouts}
            isLoading={isLoading}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <MetricCard
            title="WORKOUT FREQUENCY"
            value={workoutsPerWeek.toFixed(1)}
            subValue="per week"
            isLoading={isLoading}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <MetricCard
            title="SKILL DEVELOPMENT"
            value={`${uniqueExercises.size} movements`}
            isLoading={isLoading}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <MetricCard
            title="METCON CAPACITY"
            value={`${Math.round(totalDistance)} mi`}
            isLoading={isLoading}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <MetricCard
            title="TOTAL VOLUME"
            value={`${Math.round(totalVolume / 1000)}K lbs`}
            isLoading={isLoading}
          />
        </Grid>
      </Grid>
      <Grid item>
        <Card>
          <CardContent>
            <Typography variant="h6" component="h2">
              Gymnastics Skills
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Top 10 Movements (Max Reps)
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Movement</TableCell>
                  <TableCell>Max Reps</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {gymnasticsSkills.map((skill) => (
                  <TableRow key={skill.movement}>
                    <TableCell>{skill.movement}</TableCell>
                    <TableCell>{skill.maxReps}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default PerformanceMetrics;
