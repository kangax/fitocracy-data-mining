import React, { Fragment } from 'react';
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
    return React.createElement(
      React.Fragment,
      null,
      React.createElement("div", null, "Loading...")
    );
  }

  if (error) {
    return React.createElement(
      React.Fragment,
      null,
      React.createElement("div", null, "Error loading data")
    );
  }

  const masteredExercises = exercises ? exercises.filter(ex => ex.mastered) : [];
  const practiceExercises = exercises ? exercises.filter(ex => !ex.mastered) : [];

  return React.createElement(
    "div",
    { className: "bg-gray-800 rounded-lg shadow p-4 space-y-4" },
    React.createElement("h2", { className: "text-xl font-bold text-white" }, "Crossfit Mastery"),
    React.createElement(
      "div",
      null,
      React.createElement("h3", { className: "text-lg font-semibold text-gray-300" }, "Mastery (100+)"),
      React.createElement(
        "ul",
        { className: "list-disc list-inside text-gray-400" },
        masteredExercises.map(exercise =>
          React.createElement("li", { key: exercise.exerciseId }, `${exercise.name} (${exercise.sessionCount} sessions)`)
        )
      ),
    ),
    React.createElement(
      "div",
      null,
      React.createElement("h3", { className: "text-lg font-semibold text-gray-300" }, "Practice → Mastery (<100)"),
      React.createElement(
        "ul",
        { className: "list-disc list-inside text-gray-400" },
        practiceExercises.map(exercise =>
          React.createElement("li", { key: exercise.exerciseId }, `${exercise.name} (${exercise.sessionCount} sessions, ${exercise.remaining} left)`)
        )
      )
    )
  );
};

export default CrossfitMastery;
