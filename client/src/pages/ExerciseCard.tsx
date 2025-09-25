import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { FormData } from './AddWorkoutPage';

interface ExerciseCardProps {
  exerciseIndex: number;
  removeExercise: (index: number) => void;
  isEditing: boolean;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exerciseIndex, removeExercise, isEditing }) => {
  const { control, register } = useFormContext<FormData>();

  const { fields: setFields, append: appendSet, remove: removeSet } = useFieldArray({
    control,
    name: `exercises.${exerciseIndex}.sets`,
  });

  return (
    <div className="exercise-card">
      <div className="exercise-header">
        <strong>Exercise #{exerciseIndex + 1}</strong>
        <button
          type="button"
          onClick={() => removeExercise(exerciseIndex)}
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
            {...register(`exercises.${exerciseIndex}.name` as const)}
          />
        </label>

        <label>
          Intensity
          <input
            type="text"
            placeholder="e.g., RPE 8 / 70%"
            {...register(`exercises.${exerciseIndex}.intensity` as const)}
          />
        </label>
      </div>

      {isEditing && (
        <div className="notes-container">
          <label>
            Notes
            <textarea
              placeholder="e.g., Felt strong today, went up in weight."
              {...register(`exercises.${exerciseIndex}.notes` as const)}
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
                  `exercises.${exerciseIndex}.sets.${setIdx}.plan` as const
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
                    `exercises.${exerciseIndex}.sets.${setIdx}.actual` as const
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
};

export default ExerciseCard;
