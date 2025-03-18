import React, { Fragment } from 'react';

interface ExerciseMastery {
  exerciseId: number;
  name: string;
  sessionCount: number;
  remaining: number;
  mastered: boolean;
}

const CrossfitMastery: React.FC = () => {
  const exercises: ExerciseMastery[] = [
    { exerciseId: 1, name: 'Squats', sessionCount: 120, remaining: 0, mastered: true },
    { exerciseId: 2, name: 'Push-ups', sessionCount: 80, remaining: 20, mastered: false },
    { exerciseId: 3, name: 'Pull-ups', sessionCount: 50, remaining: 50, mastered: false },
  ];

  const masteredExercises = exercises.filter(ex => ex.mastered);
  const practiceExercises = exercises.filter(ex => !ex.mastered);

  return React.createElement(
    React.Fragment,
    null,
    React.createElement(
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
        )
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
    )
  );
};

export default CrossfitMastery;
