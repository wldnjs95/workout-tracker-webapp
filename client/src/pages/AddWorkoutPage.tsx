import React, { useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import './AddWorkoutPage.css';
import ExerciseCard from './ExerciseCard';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Plus, X } from 'lucide-react';

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
  const { control, handleSubmit, reset, watch, setValue, register } = methods;

  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const defaultCategories = ["Push", "Pull", "Legs", "Cardio", "Full Body"];

  const [isDragging, setIsDragging] = useState(false);
  const [dragExerciseIndex, setDragExerciseIndex] = useState<number | null>(null);
  const [dragPreview, setDragPreview] = useState(0);
  const [dragProgress, setDragProgress] = useState(0);
  const [originalSets, setOriginalSets] = useState<SetRow[]>([]);
  const dragStartX = useRef(0);
  const dragCurrentX = useRef(0);

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

  const handleCategorySelect = (value: string) => {
    if (value === "add-new") {
      setShowNewCategoryInput(true);
    } else {
      setValue("category", value);
    }
  };

  const handleAddNewCategory = () => {
    if (newCategoryInput.trim() && !customCategories.includes(newCategoryInput.trim())) {
      const newCategory = newCategoryInput.trim();
      setCustomCategories([...customCategories, newCategory]);
      setValue("category", newCategory);
      setNewCategoryInput("");
      setShowNewCategoryInput(false);
    }
  };

  const handleMouseDown = useCallback((e: React.MouseEvent, exerciseIndex: number) => {
    e.preventDefault();
    
    const currentExercise = watch(`exercises.${exerciseIndex}`);
    const originalSetsArray = [...currentExercise.sets];
    
    setIsDragging(true);
    setDragExerciseIndex(exerciseIndex);
    setDragPreview(0);
    setOriginalSets(originalSetsArray);
    dragStartX.current = e.clientX;
    dragCurrentX.current = e.clientX;

    document.body.classList.add('drag-active');

    const handleMouseMove = (e: MouseEvent) => {
      dragCurrentX.current = e.clientX;
      const deltaX = e.clientX - dragStartX.current;
      
      const setWidth = 100;
      const deadZone = 20;
      
      let setChange = 0;
      let progress = 0;
      
      if (Math.abs(deltaX) > deadZone) {
        const adjustedDelta = deltaX - Math.sign(deltaX) * deadZone;
        setChange = Math.round(adjustedDelta / setWidth);
        const remainder = Math.abs(adjustedDelta) % setWidth;
        progress = remainder / setWidth;
      }
      
      setDragPreview(setChange);
      setDragProgress(progress);

      const originalLength = originalSetsArray.length;
      const newLength = Math.max(1, originalLength + setChange);
      
      if (newLength !== watch(`exercises.${exerciseIndex}.sets`).length) {
        const newSets = [...originalSetsArray];
        
        if (newLength > originalLength) {
          for (let i = originalLength; i < newLength; i++) {
            newSets.push({ plan: '', actual: '' });
          }
        } else {
          newSets.splice(newLength);
        }
        
        setValue(`exercises.${exerciseIndex}.sets`, newSets);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDragExerciseIndex(null);
      setDragPreview(0);
      setDragProgress(0);
      setOriginalSets([]);
      document.body.classList.remove('drag-active');
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [watch, setValue]);

  return (
    <div className="add-workout-page container mx-auto p-4">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-semibold tracking-tight">
              {isEditing ? 'Edit Workout' : 'Add New Workout'}
            </h1>
            <div className="flex items-center gap-2">
              <Button type="submit">
                Save Workout
              </Button>
              <Link to="/">
                <Button variant="outline">Back to Home</Button>
              </Link>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Workout Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>ID</Label>
                  <Input value={isEditing ? watch('id') : "Auto-generated on save"} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" {...register("date")} />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  {showNewCategoryInput ? (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter new category"
                        value={newCategoryInput}
                        onChange={(e) => setNewCategoryInput(e.target.value)}
                      />
                      <Button type="button" size="sm" onClick={handleAddNewCategory}>
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button 
                        type="button"
                        size="sm" 
                        variant="outline" 
                        onClick={() => {
                          setShowNewCategoryInput(false);
                          setNewCategoryInput("");
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Select value={watch("category")} onValueChange={handleCategorySelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {defaultCategories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                        {customCategories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                        <SelectItem value="add-new">
                          <Plus className="h-4 w-4 mr-2" />
                          Add New Category
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Exercise Planning</CardTitle>
              <p className="text-muted-foreground">Plan your exercises and sets</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {exerciseFields.map((exercise, exIdx) => (
                  <ExerciseCard
                    key={exercise.id}
                    exerciseIndex={exIdx}
                    removeExercise={removeExercise}
                    isEditing={isEditing}
                    isDragging={isDragging && dragExerciseIndex === exIdx}
                    dragPreview={dragPreview}
                    dragProgress={dragProgress}
                    originalSets={originalSets}
                    onMouseDown={(e) => handleMouseDown(e, exIdx)}
                  />
                ))}
                {exerciseFields.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No exercises added yet. Click "Add Exercise" to get started.</p>
                  </div>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                className="mt-4"
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
              </Button>
            </CardContent>
          </Card>
        </form>
      </FormProvider>
    </div>
  );
}

export default AddWorkoutPage;
