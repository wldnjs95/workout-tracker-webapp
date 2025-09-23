import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { 
  Play, 
  Pause, 
  Plus, 
  X, 
  Check, 
  Timer, 
  Lock,
  Unlock,
  ArrowLeft,
  Trash2
} from "lucide-react";

interface ExerciseRow {
  id: string;
  exercise: string;
  intensity: string;
  unit: string;
  sets: Array<{
    plan: string;
    actual: string;
  }>;
}

interface WorkoutPlan {
  id: string;
  date: string;
  category: string;
  exercises: ExerciseRow[];
  status?: 'planned' | 'in-progress' | 'completed';
}

interface WorkoutTrackerProps {
  selectedPlan?: WorkoutPlan;
  onBackToDashboard?: () => void;
  onWorkoutComplete?: (completedPlan: WorkoutPlan) => void;
}

export function WorkoutTracker({ selectedPlan, onBackToDashboard, onWorkoutComplete }: WorkoutTrackerProps) {
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [workoutTime, setWorkoutTime] = useState(0);
  const [isEditingEnabled, setIsEditingEnabled] = useState(false);
  const [currentWorkoutPlan, setCurrentWorkoutPlan] = useState<WorkoutPlan | null>(null);

  // Initialize workout plan from props
  useEffect(() => {
    if (selectedPlan && !currentWorkoutPlan) {
      // Convert plan to workout format (add actual fields)
      const workoutPlan: WorkoutPlan = {
        ...selectedPlan,
        exercises: selectedPlan.exercises.map(exercise => ({
          ...exercise,
          sets: exercise.sets.map(set => ({
            plan: set.plan,
            actual: '' // Start with empty actual values
          }))
        })),
        status: 'in-progress'
      };
      setCurrentWorkoutPlan(workoutPlan);
      setIsWorkoutActive(true); // Auto-start timer when plan is loaded
    }
  }, [selectedPlan, currentWorkoutPlan]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isWorkoutActive) {
      interval = setInterval(() => {
        setWorkoutTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWorkoutActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const updateActualValue = (exerciseId: string, setIndex: number, value: string) => {
    if (!currentWorkoutPlan) return;
    
    const updatedExercises = currentWorkoutPlan.exercises.map(exercise => {
      if (exercise.id === exerciseId) {
        const updatedSets = exercise.sets.map((set, index) =>
          index === setIndex ? { ...set, actual: value } : set
        );
        return { ...exercise, sets: updatedSets };
      }
      return exercise;
    });
    
    setCurrentWorkoutPlan({
      ...currentWorkoutPlan,
      exercises: updatedExercises
    });
  };

  // Functions for editing mode (adding exercises/sets)
  const addExercise = () => {
    if (!currentWorkoutPlan) return;
    
    const newExercise: ExerciseRow = {
      id: Date.now().toString(),
      exercise: '',
      intensity: '',
      unit: 'count',
      sets: [{ plan: '', actual: '' }]
    };
    
    setCurrentWorkoutPlan({
      ...currentWorkoutPlan,
      exercises: [...currentWorkoutPlan.exercises, newExercise]
    });
  };

  const removeExercise = (exerciseId: string) => {
    if (!currentWorkoutPlan) return;
    
    setCurrentWorkoutPlan({
      ...currentWorkoutPlan,
      exercises: currentWorkoutPlan.exercises.filter(ex => ex.id !== exerciseId)
    });
  };

  const addSetToExercise = (exerciseId: string) => {
    if (!currentWorkoutPlan) return;
    
    const updatedExercises = currentWorkoutPlan.exercises.map(exercise => {
      if (exercise.id === exerciseId) {
        return {
          ...exercise,
          sets: [...exercise.sets, { plan: '', actual: '' }]
        };
      }
      return exercise;
    });
    
    setCurrentWorkoutPlan({
      ...currentWorkoutPlan,
      exercises: updatedExercises
    });
  };

  const removeSetFromExercise = (exerciseId: string) => {
    if (!currentWorkoutPlan) return;
    
    const updatedExercises = currentWorkoutPlan.exercises.map(exercise => {
      if (exercise.id === exerciseId && exercise.sets.length > 1) {
        return {
          ...exercise,
          sets: exercise.sets.slice(0, -1)
        };
      }
      return exercise;
    });
    
    setCurrentWorkoutPlan({
      ...currentWorkoutPlan,
      exercises: updatedExercises
    });
  };

  const updateExercise = (exerciseId: string, field: keyof ExerciseRow, value: any) => {
    if (!currentWorkoutPlan) return;
    
    const updatedExercises = currentWorkoutPlan.exercises.map(exercise =>
      exercise.id === exerciseId ? { ...exercise, [field]: value } : exercise
    );
    setCurrentWorkoutPlan({
      ...currentWorkoutPlan,
      exercises: updatedExercises
    });
  };

  const updatePlanValue = (exerciseId: string, setIndex: number, value: string) => {
    if (!currentWorkoutPlan) return;
    
    const updatedExercises = currentWorkoutPlan.exercises.map(exercise => {
      if (exercise.id === exerciseId) {
        const updatedSets = exercise.sets.map((set, index) =>
          index === setIndex ? { ...set, plan: value } : set
        );
        return { ...exercise, sets: updatedSets };
      }
      return exercise;
    });
    
    setCurrentWorkoutPlan({
      ...currentWorkoutPlan,
      exercises: updatedExercises
    });
  };

  const handleFinishWorkout = () => {
    if (currentWorkoutPlan && onWorkoutComplete) {
      const completedPlan = {
        ...currentWorkoutPlan,
        status: 'completed' as const
      };
      onWorkoutComplete(completedPlan);
    }
  };

  const getMaxSets = () => {
    if (!currentWorkoutPlan) return 0;
    return Math.max(...currentWorkoutPlan.exercises.map(ex => ex.sets.length));
  };

  const getCompletedActualSets = () => {
    if (!currentWorkoutPlan) return 0;
    return currentWorkoutPlan.exercises.reduce((total, exercise) => 
      total + exercise.sets.filter(set => set.actual.trim() !== '').length, 0
    );
  };

  const getTotalSets = () => {
    if (!currentWorkoutPlan) return 0;
    return currentWorkoutPlan.exercises.reduce((total, exercise) => total + exercise.sets.length, 0);
  };

  const progress = getTotalSets() > 0 ? (getCompletedActualSets() / getTotalSets()) * 100 : 0;

  if (!currentWorkoutPlan) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No workout plan selected. Please select a plan from the dashboard.</p>
            {onBackToDashboard && (
              <div className="flex justify-center mt-4">
                <Button onClick={onBackToDashboard}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Workout Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBackToDashboard && (
                <Button variant="outline" onClick={onBackToDashboard}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              )}
              <div>
                <CardTitle>{currentWorkoutPlan.category} Workout</CardTitle>
                <p className="text-muted-foreground">{currentWorkoutPlan.exercises.length} exercises • {currentWorkoutPlan.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={isEditingEnabled ? "default" : "outline"}
                onClick={() => setIsEditingEnabled(!isEditingEnabled)}
              >
                {isEditingEnabled ? <Unlock className="h-4 w-4 mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
                {isEditingEnabled ? "Lock Plan" : "Edit Plan"}
              </Button>
              <Button
                variant={isWorkoutActive ? "destructive" : "default"}
                onClick={() => setIsWorkoutActive(!isWorkoutActive)}
              >
                {isWorkoutActive ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                {isWorkoutActive ? "Pause" : "Resume"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4" />
                <span>Time: {formatTime(workoutTime)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                <span>{getCompletedActualSets()}/{getTotalSets()} sets completed</span>
              </div>
            </div>
            <Badge variant={isEditingEnabled ? "destructive" : "secondary"}>
              {isEditingEnabled ? "Editing Mode" : "Workout Mode"}
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Edit Mode Actions */}
      {isEditingEnabled && (
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={addExercise}>
            <Plus className="h-4 w-4 mr-1" />
            Add Exercise
          </Button>
        </div>
      )}

      {/* Workout Table */}
      <Card>
        <CardHeader>
          <CardTitle>Workout Execution</CardTitle>
          <p className="text-muted-foreground">
            {isEditingEnabled ? "Edit your workout plan or log actual values" : "Log your actual performance"}
          </p>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {isEditingEnabled && <TableHead className="w-4"></TableHead>}
                  <TableHead className="min-w-48">Exercise</TableHead>
                  <TableHead className="min-w-32">Intensity</TableHead>
                  <TableHead className="min-w-24">Unit</TableHead>
                  {isEditingEnabled && <TableHead className="min-w-24">Sets</TableHead>}
                  {Array.from({ length: getMaxSets() }, (_, index) => (
                    <TableHead key={index} className="min-w-48 text-center">
                      Set {index + 1}
                    </TableHead>
                  ))}
                </TableRow>
                <TableRow>
                  {isEditingEnabled && <TableHead></TableHead>}
                  <TableHead></TableHead>
                  <TableHead></TableHead>
                  <TableHead></TableHead>
                  {isEditingEnabled && <TableHead></TableHead>}
                  {Array.from({ length: getMaxSets() }, (_, index) => (
                    <TableHead key={index} className="min-w-48">
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <span>Plan</span>
                        <span>Actual</span>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentWorkoutPlan.exercises.map((exercise) => (
                  <TableRow key={exercise.id}>
                    {isEditingEnabled && (
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeExercise(exercise.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    )}
                    <TableCell>
                      {isEditingEnabled ? (
                        <Input
                          value={exercise.exercise}
                          onChange={(e) => updateExercise(exercise.id, 'exercise', e.target.value)}
                          className="min-w-48"
                        />
                      ) : (
                        <span className="font-medium">{exercise.exercise}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditingEnabled ? (
                        <Input
                          value={exercise.intensity}
                          onChange={(e) => updateExercise(exercise.id, 'intensity', e.target.value)}
                          className="min-w-32"
                        />
                      ) : (
                        <span>{exercise.intensity}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditingEnabled ? (
                        <Select
                          value={exercise.unit}
                          onValueChange={(value) => updateExercise(exercise.id, 'unit', value)}
                        >
                          <SelectTrigger className="min-w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="count">Count</SelectItem>
                            <SelectItem value="seconds">Seconds</SelectItem>
                            <SelectItem value="minutes">Minutes</SelectItem>
                            <SelectItem value="lbs">Pounds</SelectItem>
                            <SelectItem value="kg">Kilograms</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="outline">{exercise.unit}</Badge>
                      )}
                    </TableCell>
                    {isEditingEnabled && (
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addSetToExercise(exercise.id)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          {exercise.sets.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeSetFromExercise(exercise.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                    {Array.from({ length: getMaxSets() }, (_, setIndex) => {
                      const set = exercise.sets[setIndex];
                      return (
                        <TableCell key={setIndex}>
                          {set ? (
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                value={set.plan}
                                onChange={(e) => updatePlanValue(exercise.id, setIndex, e.target.value)}
                                className="min-w-20"
                                disabled={!isEditingEnabled}
                              />
                              <Input
                                value={set.actual}
                                onChange={(e) => updateActualValue(exercise.id, setIndex, e.target.value)}
                                className="min-w-20"
                              />
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-2">
                              <div className="min-w-20"></div>
                              <div className="min-w-20"></div>
                            </div>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Finish Workout */}
      <Card>
        <CardContent className="pt-6">
          <Button className="w-full" size="lg" onClick={handleFinishWorkout}>
            <Check className="h-4 w-4 mr-2" />
            Finish Workout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}