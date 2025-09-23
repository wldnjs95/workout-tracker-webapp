import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AddWorkoutPage from './AddWorkoutPage';
import type { FormData } from './AddWorkoutPage';

// This is a simplified version of the interfaces from HomePage
// In a real app, these would be in a shared types file.
interface Set {
  setNumber: string;
  plan: string;
  actual: string;
}

interface Exercise {
  name: string;
  intensity: string;
  notes: string;
  sets: Set[];
}

interface Workout {
  id: string;
  date: string;
  category: string;
  exercises: Exercise[];
}

interface WorkoutRow {
  id: string;
  date: string;
  category: string;
  intensity: string;
  exercise: string; // This is the exercise name
  set_number: string;
  plan: string;
  actual: string;
  notes: string;
}

function EditWorkoutPage() {
  const { id } = useParams<{ id: string }>();
  const [workoutData, setWorkoutData] = useState<FormData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/workouts/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const rows: WorkoutRow[] = data.data;

        if (!rows || rows.length === 0) {
          throw new Error('Workout not found');
        }

        // Transform the flat rows back into a nested FormData object
        const grouped = rows.reduce((acc: Record<string, Workout>, row: WorkoutRow) => {
          const { id, date, category, intensity, exercise: exName, set_number: setNum, plan, actual, notes } = row;

          if (!id) return acc;

          // Group by id, not date, for editing a specific session
          if (!acc[id]) {
            acc[id] = { id, date, category, exercises: [] };
          }

          let exercise = acc[id].exercises.find(e => e.name === exName && e.intensity === intensity && e.notes === notes);
          if (!exercise) {
            exercise = { name: exName, intensity, notes, sets: [] };
            acc[id].exercises.push(exercise);
          }

          exercise.sets.push({ setNumber: setNum, plan, actual });
          return acc;
        }, {});
        
        const workout = Object.values(grouped)[0];
        
        const formattedWorkout = {
          ...workout,
          exercises: workout.exercises.map(ex => ({
            ...ex,
            sets: ex.sets.map(({plan, actual}) => ({plan, actual}))
          }))
        }

        setWorkoutData(formattedWorkout as FormData);

      } catch (e: any) {
        setError(e.message);
      }
    };

    if (id) {
      fetchWorkout();
    }
  }, [id]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!workoutData) {
    return <div>Loading workout data...</div>;
  }

  return <AddWorkoutPage isEditing={true} initialData={workoutData} />;
}

export default EditWorkoutPage;
