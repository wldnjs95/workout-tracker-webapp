import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { FormData } from './AddWorkoutPage';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { Trash2, Plus, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableSetProps {
  id: string;
  children: React.ReactNode;
}

const SortableSet: React.FC<SortableSetProps> = ({ id, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="flex items-center gap-2 bg-background rounded-md p-2 border">
      <button type="button" {...listeners} className="cursor-grab">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </button>
      {children}
    </div>
  );
};


interface ExerciseCardProps {
  exerciseIndex: number;
  removeExercise: (index: number) => void;
  isEditing: boolean;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exerciseIndex, removeExercise, isEditing }) => {
  const { control, register } = useFormContext<FormData>();

  const { fields: setFields, append: appendSet, remove: removeSet, move: moveSet } = useFieldArray({
    control,
    name: `exercises.${exerciseIndex}.sets`,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const {active, over} = event;
    
    if (active.id !== over?.id) {
      const oldIndex = setFields.findIndex((field) => field.id === active.id);
      const newIndex = setFields.findIndex((field) => field.id === over!.id);
      moveSet(oldIndex, newIndex);
    }
  }

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

        <div>
          <label>Sets</label>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={setFields.map(field => field.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2 mt-2">
                {setFields.map((setField, setIdx) => (
                  <SortableSet key={setField.id} id={setField.id}>
                    <span className="font-medium text-sm">#{setIdx + 1}</span>
                    <Input placeholder="Plan (e.g., 5 reps @ 100lb)" {...register(`exercises.${exerciseIndex}.sets.${setIdx}.plan` as const)} />
                    {isEditing && <Input placeholder="Actual (e.g., 5 reps @ 100lb)" {...register(`exercises.${exerciseIndex}.sets.${setIdx}.actual` as const)} />}
                    <Button variant="ghost" size="icon" onClick={() => removeSet(setIdx)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </SortableSet>
                ))}
              </div>
            </SortableContext>
          </DndContext>
          <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendSet({ plan: '', actual: '' })}>
            + Add Set
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExerciseCard;
