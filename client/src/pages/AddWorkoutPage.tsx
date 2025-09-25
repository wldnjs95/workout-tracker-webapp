import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import './AddWorkoutPage.css';
import ExerciseCard from './ExerciseCard';

type SetRow = {
  plan: string;
  actual: string;
}

type Exercise = {
  name: string;
  intensity: string;
  sets: SetRow[];
  notes?: string;
}

export type FormData = {
  id: string;
  date: string;
  category: string;
  exercises: Exercise[];
};

type AddWorkoutPageProps = {
  isEditing?: boolean;
  initialData?: FormData;
};

function AddWorkoutPage({ isEditing = false, initialData }: AddWorkoutPageProps) {
  const navigate = useNavigate();
  const methods = useForm<FormData>({
    defaultValues: initialData || {
      id: `wk-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      category: '',
      exercises: [{ name: '', intensity: '', sets: [{ plan: '', actual: '' }], notes: '' }],
    },
  });
  const { control, handleSubmit, reset } = methods;

  React.useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const { fields: exerciseFields, append: appendExercise, remove: removeExercise } = useFieldArray({
    control,
    name: 'exercises',
  });

  const onSubmit = async (data: FormData) => {
    const withSetNumbers = {
      ...data,
      exercises: data.exercises.map(ex => ({
        ...ex,
        sets: ex.sets.map((set, index) => ({
          ...set,
          setNumber: (index + 1).toString(),
        })),
      })),
    };

    const url = isEditing
      ? `http://localhost:8000/api/workouts/${data.id}`
      : 'http://localhost:8000/api/workouts';

    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(withSetNumbers),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Workout saved successfully', result);
      navigate('/');
    } catch (error: any) {
      console.error('Error saving workout:', error);
      alert(`Error saving workout: ${error.message}`); // Show error to user
    }
  };

  return (
    <div className="add-workout-page container mx-auto p-4">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-semibold tracking-tight">
              {isEditing ? 'Edit Workout' : 'Add New Workout'}
            </h1>
            <div className="flex items-center gap-2">
              <button type="submit" className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 transition-colors">
                Save Workout
              </button>
              <Link to="/" className="inline-flex items-center rounded-md border px-4 py-2 hover:bg-accent">
                Back to Home
              </Link>
            </div>
          </div>

          <div className="form-grid">
            <label>
              ID
              <input type="text" {...methods.register('id')} readOnly className="readonly-input" />
            </label>

            <label>
              Date
              <input type="date" {...methods.register('date')} />
            </label>

            <label>
              Category
              <input type="text" placeholder="e.g., Push, Pull, Legs" {...methods.register('category')} />
            </label>
          </div>

          <div className="add-exercise-btn-container">
            <button
              type="button"
              onClick={() =>
                appendExercise({
                  name: '',
                  intensity: '',
                  sets: [{ plan: '', actual: '' }],
                  notes: '',
                })
              }
            >
              + Add Exercise
            </button>
          </div>

          {exerciseFields.map((exercise, exIdx) => (
            <ExerciseCard
              key={exercise.id}
              exerciseIndex={exIdx}
              removeExercise={removeExercise}
              isEditing={isEditing}
            />
          ))}
        </form>
      </FormProvider>
    </div>
  );
}

export default AddWorkoutPage;
