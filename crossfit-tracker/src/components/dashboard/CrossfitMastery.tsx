import React from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface ExerciseMastery {
  exerciseId: number;
  name: string;
  sessionCount: number;
  remaining: number;
  mastered: boolean;
}

const CrossfitMastery: React.FC = () => {
  const { data: exercises, error, isLoading } = useSWR<ExerciseMastery[]>('/api/exercises/mastery', fetcher);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading data</div>;
  }

  const masteredExercises = exercises ? exercises.filter(ex => ex.mastered) : [];
  const practiceExercises = exercises ? exercises.filter(ex => !ex.mastered) : [];

  return (
    <div className="bg-gray-800 rounded-lg shadow p-4 space-y-4">
      <h2 className="text-xl font-bold text-white">Crossfit Mastery</h2>

      <div>
        <h3 className="text-lg font-semibold text-gray-300">Mastery (100+)</h3>
        <ul className="list-disc list-inside text-gray-400">
          {masteredExercises.map(exercise => (
            <li key={exercise.exerciseId}>
              {exercise.name} ({exercise.sessionCount} sessions)
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-300">Practice → Mastery (<100)</h3>
        <ul className="list-disc list-inside text-gray-400">
          {practiceExercises.map(exercise => (
            <li key={exercise.exerciseId}>
              {exercise.name} ({exercise.sessionCount} sessions, {exercise.remaining} left)
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CrossfitMastery;
