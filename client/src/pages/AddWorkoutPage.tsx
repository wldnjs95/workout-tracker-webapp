import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import './AddWorkoutPage.css';

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
  const { register, handleSubmit, control, reset } = useForm<FormData>({
    defaultValues: initialData || {
      id: `wk-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      category: '',
      exercises: [{ name: '', intensity: '', sets: [{ plan: '', actual: '' }], notes: '' }],
    },
  });

  React.useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const { fields: exerciseFields, append: appendExercise, remove: removeExercise } = useFieldArray({
    control,
    name: 'exercises',
  });

  const makeSetArrayHelpers = (exerciseIndex: number) => {
    return useFieldArray({
      control,
      name: `exercises.${exerciseIndex}.sets` as const,
    });
  };

  const addSetNumbers = (sets: SetRow[]) => {
    return sets.map((set, index) => ({
      ...set,
      setNumber: index + 1,
    }));
  };

  const normalizeExercises = (exercises: Exercise[]) => {
    return exercises.map((ex) => ({
      ...ex,
      sets: addSetNumbers(ex.sets),
    }));
  };

  const onSubmit = async (data: FormData) => {
    const withSetNumbers = {
      ...data,
      exercises: normalizeExercises(data.exercises),
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
    <div className="add-workout-page">
      <h1>{isEditing ? 'Edit Workout' : 'Add New Workout'}</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-grid">
          <label>
            ID
            <input type="text" {...register('id')} readOnly className="readonly-input" />
          </label>

          <label>
            Date
            <input type="date" {...register('date')} />
          </label>

          <label>
            Category
            <input type="text" placeholder="e.g., Push, Pull, Legs" {...register('category')} />
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

        {exerciseFields.map((exercise, exIdx) => {
          const { fields: setFields, append: appendSet, remove: removeSet } =
            makeSetArrayHelpers(exIdx);

          return (
            <div key={exercise.id} className="exercise-card">
              <div className="exercise-header">
                <strong>Exercise #{exIdx + 1}</strong>
                <button
                  type="button"
                  onClick={() => removeExercise(exIdx)}
                  className="remove-exercise-btn"
                >
                  Remove Exercise
                </button>
              </div>

              <div className="exercise-inputs">
                <label>
                  Exercise
                  <input
                    type="text"
                    placeholder="e.g., Squat"
                    {...register(`exercises.${exIdx}.name` as const)}
                  />
                </label>

                <label>
                  Intensity
                  <input
                    type="text"
                    placeholder="e.g., RPE 8 / 70%"
                    {...register(`exercises.${exIdx}.intensity` as const)}
                  />
                </label>
              </div>

              {isEditing && (
                <div className="notes-container">
                  <label>
                    Notes
                    <textarea
                      placeholder="e.g., Felt strong today, went up in weight."
                      {...register(`exercises.${exIdx}.notes` as const)}
                    />
                  </label>
                </div>
              )}

              <div className="set-list-container">
                <div className="add-set-btn-container">
                  <button
                    type="button"
                    onClick={() => appendSet({ plan: '', actual: '' })}
                  >
                    + Add Set
                  </button>
                </div>

                {setFields.map((setField, setIdx) => (
                  <div key={setField.id} className="set-row">
                    <div>
                      <label>Set #</label>
                      <div className="set-number-display">
                        {setIdx + 1}
                      </div>
                    </div>

                    <label>
                      Plan
                      <input
                        type="text"
                        placeholder="e.g., 5 reps @ 100lb"
                        {...register(
                          `exercises.${exIdx}.sets.${setIdx}.plan` as const
                        )}
                      />
                    </label>

                    {isEditing && (
                      <label>
                        Actual
                        <input
                          type="text"
                          placeholder="e.g., 5 reps @ 100lb"
                          {...register(
                            `exercises.${exIdx}.sets.${setIdx}.actual` as const
                          )}
                        />
                      </label>
                    )}

                    <button type="button" onClick={() => removeSet(setIdx)}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <button type="submit">Save Workout</button>
      </form>

      <br />
      <Link to="/">Back to Home</Link>
    </div>
  );
}

export default AddWorkoutPage;