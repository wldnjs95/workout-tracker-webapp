import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { FormData, SetRow } from './AddWorkoutPage';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Trash2, Plus, X } from 'lucide-react';

interface ExerciseCardProps {
  exerciseIndex: number;
  removeExercise: (index: number) => void;
  isEditing: boolean;
  isDragging: boolean;
  dragPreview: number;
  dragProgress: number;
  originalSets: SetRow[];
  onMouseDown: (e: React.MouseEvent) => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ 
  exerciseIndex, 
  removeExercise, 
  isEditing, 
  isDragging, 
  dragPreview, 
  dragProgress, 
  originalSets, 
  onMouseDown 
}) => {
  const { control, register, watch } = useFormContext<FormData>();

  const { fields: setFields, append: appendSet, remove: removeSet } = useFieldArray({
    control,
    name: `exercises.${exerciseIndex}.sets`,
  });

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Input placeholder="e.g. Bench Press" {...register(`exercises.${exerciseIndex}.name` as const)} className="font-medium bg-transparent border-none p-0 h-auto focus:ring-0 text-base w-48" />
            <Input placeholder="e.g. 185lbs" {...register(`exercises.${exerciseIndex}.intensity` as const)} className="w-32 h-7 text-sm text-muted-foreground" />
          </div>
          <Button variant="ghost" size="icon" onClick={() => removeExercise(exerciseIndex)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isEditing && (
          <div className="mb-4">
            <label htmlFor={`exercises.${exerciseIndex}.notes`}>Notes</label>
            <Textarea id={`exercises.${exerciseIndex}.notes`} placeholder="e.g., Felt strong today..." {...register(`exercises.${exerciseIndex}.notes` as const)} />
          </div>
        )}

        <div className="w-fit flex items-end gap-2">
          <Table>
            <TableHeader>
              <TableRow>
                {watch(`exercises.${exerciseIndex}.sets`).map((_, setIndex) => {
                  const isPreviewHeader = isDragging && originalSets.length > 0 && setIndex >= originalSets.length;
                  return (
                    <TableHead key={setIndex} className={`text-center w-32 text-xs ${isPreviewHeader ? 'opacity-60 text-primary' : ''}`}>
                      Set {setIndex + 1}
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                {watch(`exercises.${exerciseIndex}.sets`).map((set, setIndex) => {
                  const isPreviewSet = isDragging && originalSets.length > 0 && setIndex >= originalSets.length;
                  return (
                    <TableCell key={setIndex} className={`text-center w-32 px-2 text-xs ${isPreviewSet ? 'opacity-60 animate-pulse' : ''}`}>
                      <Input
                        {...register(`exercises.${exerciseIndex}.sets.${setIndex}.plan` as const)}
                        className={`w-full h-6 text-xs px-1 text-center ${isPreviewSet ? 'bg-primary/10 border-primary/30 border-dashed' : ''}`}
                        placeholder="Plan"
                      />
                      {isEditing && (
                        <Input
                          {...register(`exercises.${exerciseIndex}.sets.${setIndex}.actual` as const)}
                          className={`w-full h-6 text-xs px-1 text-center mt-1 ${isPreviewSet ? 'bg-primary/10 border-primary/30 border-dashed' : ''}`}
                          placeholder="Actual"
                        />
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableBody>
          </Table>
          <button
            type="button"
            onClick={() => appendSet({ plan: '', actual: '' })}
            onMouseDown={onMouseDown}
            className={`h-8 w-8 rounded-md flex items-center justify-center transition-colors cursor-pointer mb-1 relative ${
              isDragging
                ? 'bg-primary text-primary-foreground scale-110'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            }`}
            title="Click to add set • Drag right to add multiple • Drag left to remove"
          >
            <Plus className="h-4 w-4" />
            {isDragging && (
              <>
                <div 
                  className="absolute inset-0 rounded-md border-2 border-primary/30"
                  style={{
                    background: `conic-gradient(from 0deg, rgb(var(--primary)) ${dragProgress * 360}deg, transparent ${dragProgress * 360}deg)`
                  }}
                />
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                  {dragPreview > 0 ? `+${dragPreview} sets` : 
                   dragPreview < 0 ? `${dragPreview} sets` : 
                   dragProgress > 0 ? `${Math.round(dragProgress * 100)}% to next` : 
                   'Drag to add/remove sets'}
                </div>
              </>
            )}
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExerciseCard;
