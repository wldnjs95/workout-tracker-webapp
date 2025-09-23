import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form@7.55.0";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Activity, TrendingUp, Clock, Calendar, Plus, X, Trash2, ArrowLeft, Play, ChevronDown, ChevronRight, Edit } from "lucide-react";

interface ExerciseRow {
  id: string;
  exercise: string;
  intensity: string;
  unit: string;
  sets: Array<{
    plan: string;
    actual?: string; // Optional for execution phase
  }>;
}

interface WorkoutPlan {
  id: string;
  date: string;
  category: string;
  exercises: ExerciseRow[];
  status?: 'planned' | 'in-progress' | 'completed';
}

interface WorkoutFormData {
  date: string;
  category: string;
  exercises: {
    exercise: string;
    intensity: string;
    unit: string;
    sets: { plan: string }[];
  }[];
}

interface DashboardProps {
  onStartWorkout?: (plan: WorkoutPlan) => void;
}

export function Dashboard({ onStartWorkout }: DashboardProps) {
  const [expandedWorkout, setExpandedWorkout] = useState<number | null>(null);
  const [showAddPlanForm, setShowAddPlanForm] = useState(false);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);

  // Default categories
  const defaultCategories = ["Push", "Pull", "Legs", "Cardio", "Full Body"];

  // React Hook Form setup
  const form = useForm<WorkoutFormData>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      category: '',
      exercises: [
        {
          exercise: '',
          intensity: '',
          unit: 'count',
          sets: [{ plan: '' }]
        }
      ]
    }
  });

  const { control, handleSubmit, reset, watch, setValue } = form;
  const { fields: exerciseFields, append: appendExercise, remove: removeExercise } = useFieldArray({
    control,
    name: "exercises"
  });

  const dashboardStats = [
    { 
      label: "Total Workouts", 
      value: "48", 
      unit: "logged", 
      icon: Activity, 
      color: "text-blue-500" 
    },
    { 
      label: "Strength Progress", 
      value: "+12", 
      unit: "lbs gained", 
      icon: TrendingUp, 
      color: "text-green-500" 
    },
    { 
      label: "Average Duration", 
      value: "42", 
      unit: "minutes", 
      icon: Clock, 
      color: "text-orange-500" 
    },
  ];

  const workoutCalendar = [
    { 
      id: 1, 
      date: "2024-01-17", 
      category: "Push", 
      status: "completed",
      duration: "45 min",
      exercises: [
        { name: "Bench Press", sets: [{ plan: "12", actual: "12" }, { plan: "10", actual: "11" }, { plan: "8", actual: "8" }], intensity: "185lbs", unit: "count" },
        { name: "Shoulder Press", sets: [{ plan: "10", actual: "10" }, { plan: "8", actual: "8" }], intensity: "45lbs", unit: "count" },
        { name: "Push-ups", sets: [{ plan: "15", actual: "15" }, { plan: "12", actual: "14" }], intensity: "Bodyweight", unit: "count" }
      ]
    },
    { 
      id: 2, 
      date: "2024-01-16", 
      category: "Pull", 
      status: "completed",
      duration: "38 min",
      exercises: [
        { name: "Pull-ups", sets: [{ plan: "8", actual: "7" }, { plan: "6", actual: "6" }, { plan: "5", actual: "5" }], intensity: "Bodyweight", unit: "count" },
        { name: "Barbell Rows", sets: [{ plan: "12", actual: "12" }, { plan: "10", actual: "10" }], intensity: "135lbs", unit: "count" },
        { name: "Face Pulls", sets: [{ plan: "15", actual: "15" }], intensity: "30lbs", unit: "count" }
      ]
    },
    { 
      id: 3, 
      date: "2024-01-15", 
      category: "Legs", 
      status: "completed",
      duration: "52 min",
      exercises: [
        { name: "Squats", sets: [{ plan: "15", actual: "15" }, { plan: "12", actual: "12" }, { plan: "10", actual: "10" }], intensity: "225lbs", unit: "count" },
        { name: "Deadlifts", sets: [{ plan: "8", actual: "8" }, { plan: "6", actual: "6" }], intensity: "275lbs", unit: "count" },
        { name: "Lunges", sets: [{ plan: "12", actual: "12" }, { plan: "12", actual: "10" }], intensity: "Bodyweight", unit: "count" }
      ]
    },
    { 
      id: 4, 
      date: "2024-01-14", 
      category: "Push", 
      status: "missed",
      duration: "0 min",
      exercises: []
    },
    { 
      id: 5, 
      date: "2024-01-13", 
      category: "Pull", 
      status: "failed",
      duration: "15 min",
      exercises: [
        { name: "Pull-ups", sets: [{ plan: "8", actual: "4" }, { plan: "6", actual: "3" }], intensity: "Bodyweight", unit: "count" },
        { name: "Barbell Rows", sets: [{ plan: "12", actual: "8" }], intensity: "135lbs", unit: "count" }
      ]
    },
    { 
      id: 6, 
      date: "2024-01-12", 
      category: "Legs", 
      status: "completed",
      duration: "48 min",
      exercises: [
        { name: "Squats", sets: [{ plan: "12", actual: "12" }, { plan: "10", actual: "10" }], intensity: "205lbs", unit: "count" },
        { name: "Leg Press", sets: [{ plan: "15", actual: "15" }, { plan: "12", actual: "12" }], intensity: "315lbs", unit: "count" },
        { name: "Calf Raises", sets: [{ plan: "20", actual: "20" }], intensity: "135lbs", unit: "count" }
      ]
    },
    { 
      id: 7, 
      date: "2024-01-11", 
      category: "Push", 
      status: "completed",
      duration: "42 min",
      exercises: [
        { name: "Incline Press", sets: [{ plan: "10", actual: "10" }, { plan: "8", actual: "8" }], intensity: "165lbs", unit: "count" },
        { name: "Dips", sets: [{ plan: "12", actual: "12" }, { plan: "10", actual: "11" }], intensity: "Bodyweight", unit: "count" },
        { name: "Lateral Raises", sets: [{ plan: "15", actual: "15" }], intensity: "25lbs", unit: "count" }
      ]
    },
    { 
      id: 8, 
      date: "2024-01-10", 
      category: "Pull", 
      status: "completed",
      duration: "40 min",
      exercises: [
        { name: "Lat Pulldowns", sets: [{ plan: "12", actual: "12" }, { plan: "10", actual: "10" }], intensity: "150lbs", unit: "count" },
        { name: "Cable Rows", sets: [{ plan: "12", actual: "12" }, { plan: "10", actual: "10" }], intensity: "120lbs", unit: "count" },
        { name: "Bicep Curls", sets: [{ plan: "15", actual: "15" }], intensity: "35lbs", unit: "count" }
      ]
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: { variant: "default" as const, className: "bg-green-500 text-white", text: "Completed" },
      missed: { variant: "secondary" as const, className: "bg-orange-500 text-white", text: "Missed" },
      failed: { variant: "destructive" as const, className: "bg-orange-500 text-white", text: "Failed" },
    };
    
    const config = variants[status as keyof typeof variants] || variants.missed;
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.text}
      </Badge>
    );
  };

  const getPlanStatusBadge = (status: 'planned' | 'in-progress' | 'completed') => {
    const variants = {
      planned: { className: "bg-blue-500 text-white", text: "Planned" },
      'in-progress': { className: "bg-orange-500 text-white", text: "In Progress" },
      completed: { className: "bg-green-500 text-white", text: "Completed" },
    };
    
    const config = variants[status];
    
    return (
      <Badge className={config.className}>
        {config.text}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // React Hook Form functions
  const addExercise = () => {
    appendExercise({
      exercise: '',
      intensity: '',
      unit: 'count',
      sets: [{ plan: '' }]
    });
  };

  const addSetToExercise = (exerciseIndex: number) => {
    const currentExercise = watch(`exercises.${exerciseIndex}`);
    const updatedSets = [...currentExercise.sets, { plan: '' }];
    setValue(`exercises.${exerciseIndex}.sets`, updatedSets);
  };

  const removeSetFromExercise = (exerciseIndex: number) => {
    const currentExercise = watch(`exercises.${exerciseIndex}`);
    if (currentExercise.sets.length > 1) {
      const updatedSets = currentExercise.sets.slice(0, -1);
      setValue(`exercises.${exerciseIndex}.sets`, updatedSets);
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

  const onSubmit = (data: WorkoutFormData) => {
    const planWithId: WorkoutPlan = {
      id: editingPlanId || Date.now().toString(),
      date: data.date,
      category: data.category,
      exercises: data.exercises.map((exercise, index) => ({
        id: editingPlanId ? `${editingPlanId}-${index}` : `${Date.now()}-${index}`,
        exercise: exercise.exercise,
        intensity: exercise.intensity,
        unit: exercise.unit,
        sets: exercise.sets
      })),
      status: 'planned' as const
    };

    if (editingPlanId) {
      // Update existing plan
      setWorkoutPlans(workoutPlans.map(plan => 
        plan.id === editingPlanId ? planWithId : plan
      ));
      setEditingPlanId(null);
    } else {
      // Add new plan
      setWorkoutPlans([...workoutPlans, planWithId]);
    }
    
    handleCancelForm();
  };

  const handleCancelForm = () => {
    reset({
      date: new Date().toISOString().split('T')[0],
      category: '',
      exercises: [
        {
          exercise: '',
          intensity: '',
          unit: 'count',
          sets: [{ plan: '' }]
        }
      ]
    });
    setShowNewCategoryInput(false);
    setNewCategoryInput("");
    setShowAddPlanForm(false);
    setEditingPlanId(null);
  };

  const handleStartWorkout = (plan: WorkoutPlan) => {
    if (onStartWorkout) {
      onStartWorkout(plan);
    }
  };

  const handleDeletePlan = (planId: string) => {
    setWorkoutPlans(workoutPlans.filter(plan => plan.id !== planId));
  };

  const handleEditPlan = (planId: string) => {
    const planToEdit = workoutPlans.find(plan => plan.id === planId);
    if (planToEdit) {
      reset({
        date: planToEdit.date,
        category: planToEdit.category,
        exercises: planToEdit.exercises.map(exercise => ({
          exercise: exercise.exercise,
          intensity: exercise.intensity,
          unit: exercise.unit,
          sets: exercise.sets.map(set => ({ plan: set.plan }))
        }))
      });
      setEditingPlanId(planId);
      setShowAddPlanForm(true);
    }
  };

  // Get maximum number of sets across all exercises for table headers
  const getMaxSets = () => {
    const exercises = watch("exercises");
    return Math.max(...exercises.map(ex => ex.sets.length));
  };

  const toggleWorkoutLog = (workoutId: number) => {
    setExpandedWorkout(expandedWorkout === workoutId ? null : workoutId);
  };

  // If showing the add plan form, render that instead of the dashboard
  if (showAddPlanForm) {
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button type="button" variant="outline" onClick={handleCancelForm}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1>{editingPlanId ? 'Edit Workout Plan' : 'Add New Workout Plan'}</h1>
              <p className="text-muted-foreground">{editingPlanId ? 'Update your workout plan' : 'Create your workout plan'}</p>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Workout Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input 
                  type="date"
                  {...form.register("date")}
                />
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
              <div className="space-y-2">
                <Label>ID</Label>
                <Input 
                  value={editingPlanId ? editingPlanId : "Auto-generated on save"} 
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-2 justify-start">
          <Button type="button" variant="outline" onClick={addExercise}>
            <Plus className="h-4 w-4 mr-1" />
            Add Exercise
          </Button>
        </div>

        {/* Excel-like Table - Planning Phase (No Actual Column) */}
        <Card>
          <CardHeader>
            <CardTitle>Exercise Planning</CardTitle>
            <p className="text-muted-foreground">Plan your exercises and sets</p>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-4"></TableHead>
                    <TableHead className="min-w-48">Exercise</TableHead>
                    <TableHead className="min-w-32">Intensity</TableHead>
                    <TableHead className="min-w-24">Unit</TableHead>
                    <TableHead className="min-w-24">Sets</TableHead>
                    {Array.from({ length: getMaxSets() }, (_, index) => (
                      <TableHead key={index} className="min-w-32 text-center">
                        Set {index + 1} Plan
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exerciseFields.map((exercise, exerciseIndex) => (
                    <TableRow key={exercise.id}>
                      <TableCell>
                        {exerciseFields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeExercise(exerciseIndex)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="e.g. Bench Press"
                          {...form.register(`exercises.${exerciseIndex}.exercise`)}
                          className="min-w-48"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="e.g. 23lbs, one step back"
                          {...form.register(`exercises.${exerciseIndex}.intensity`)}
                          className="min-w-32"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={watch(`exercises.${exerciseIndex}.unit`)}
                          onValueChange={(value) => setValue(`exercises.${exerciseIndex}.unit`, value)}
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
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addSetToExercise(exerciseIndex)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          {watch(`exercises.${exerciseIndex}.sets`).length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeSetFromExercise(exerciseIndex)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      {Array.from({ length: getMaxSets() }, (_, setIndex) => {
                        const sets = watch(`exercises.${exerciseIndex}.sets`);
                        const set = sets[setIndex];
                        return (
                          <TableCell key={setIndex}>
                            {set ? (
                              <Input
                                {...form.register(`exercises.${exerciseIndex}.sets.${setIndex}.plan`)}
                                className="min-w-32"
                              />
                            ) : (
                              <div className="min-w-32"></div>
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

        {/* Save Button */}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={handleCancelForm}>
            Cancel
          </Button>
          <Button type="submit">
            {editingPlanId ? 'Update Workout Plan' : 'Save Workout Plan'}
          </Button>
        </div>
      </form>
    );
  }

  // Normal dashboard view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Workout Dashboard</h1>
          <p className="text-muted-foreground">Track your fitness journey</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddPlanForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Workout Plan
          </Button>
          
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Workout
          </Button>
        </div>
      </div>

      {/* Dashboard Stats - Only 3 cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {dashboardStats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stat.value}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  {stat.unit}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button variant="outline" className="flex-1">
            <Activity className="mr-2 h-4 w-4" />
            Start Workout
          </Button>
          <Button variant="outline" className="flex-1">
            <TrendingUp className="mr-2 h-4 w-4" />
            Log Exercise
          </Button>
          <Button variant="outline" className="flex-1">
            <Calendar className="mr-2 h-4 w-4" />
            View Progress
          </Button>
        </CardContent>
      </Card>

      {/* Saved Workout Plans */}
      {workoutPlans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Workout Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workoutPlans.map((plan) => (
                <div key={plan.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{plan.category} - {plan.date}</h4>
                        {plan.status && getPlanStatusBadge(plan.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {plan.exercises.length} exercises
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {plan.status === 'planned' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleStartWorkout(plan)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Start
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditPlan(plan.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeletePlan(plan.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {plan.exercises.map((exercise, index) => (
                      <div key={index} className="flex items-center gap-4 text-sm">
                        <span className="font-medium min-w-32">{exercise.exercise}</span>
                        <Badge variant="outline">{exercise.unit}</Badge>
                        <span className="text-muted-foreground">Intensity: {exercise.intensity}</span>
                        <div className="flex gap-2">
                          {exercise.sets.map((set, setIndex) => (
                            <span key={setIndex} className="text-muted-foreground">
                              Set {setIndex + 1}: {set.plan}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workout Calendar Table */}
      <Card>
        <CardHeader>
          <CardTitle>Workout Calendar</CardTitle>
          <p className="text-muted-foreground">Click on any workout to view detailed log</p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-4"></TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Workout</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workoutCalendar.map((workout) => (
                <>
                  <TableRow 
                    key={workout.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => toggleWorkoutLog(workout.id)}
                  >
                    <TableCell>
                      {expandedWorkout === workout.id ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </TableCell>
                    <TableCell>{formatDate(workout.date)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{workout.category}</Badge>
                        <span className="text-muted-foreground">• {workout.duration}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(workout.status)}</TableCell>
                  </TableRow>
                  
                  {expandedWorkout === workout.id && (
                    <TableRow key={`${workout.id}-expanded`}>
                      <TableCell colSpan={4} className="p-0">
                        <div className="px-6 py-4 bg-muted/20 border-t">
                          {workout.status === "missed" ? (
                            <div className="text-center text-muted-foreground py-4">
                              <p>Workout was missed - no log available</p>
                            </div>
                          ) : workout.exercises.length === 0 ? (
                            <div className="text-center text-muted-foreground py-4">
                              <p>No exercises logged</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">Workout Log Details</h4>
                                <Badge variant="secondary">{workout.exercises.length} exercises</Badge>
                              </div>
                              
                              <div className="space-y-4">
                                {workout.exercises.map((exercise, index) => (
                                  <div key={index} className="border rounded-lg overflow-hidden bg-background">
                                    <div className="flex items-center justify-between p-3 border-b bg-muted/20">
                                      <h5 className="font-medium">{exercise.name}</h5>
                                      <div className="flex items-center gap-2">
                                        <Badge variant="outline">{exercise.unit}</Badge>
                                        <span className="text-sm text-muted-foreground">{exercise.intensity}</span>
                                      </div>
                                    </div>
                                    
                                    <div className="w-fit">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            {exercise.sets.map((_, setIndex) => (
                                              <TableHead key={setIndex} className="text-center w-32 text-xs" colSpan={2}>
                                                Set {setIndex + 1}
                                              </TableHead>
                                            ))}
                                          </TableRow>
                                          <TableRow>
                                            {exercise.sets.map((_, setIndex) => (
                                              <>
                                                <TableHead key={`${setIndex}-plan`} className="text-center w-16 text-xs text-muted-foreground px-2">
                                                  Plan
                                                </TableHead>
                                                <TableHead key={`${setIndex}-actual`} className="text-center w-16 text-xs text-muted-foreground px-2">
                                                  Actual
                                                </TableHead>
                                              </>
                                            ))}
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          <TableRow>
                                            {exercise.sets.map((set, setIndex) => (
                                              <>
                                                <TableCell key={`${setIndex}-plan`} className="text-center w-16 px-2 text-xs">
                                                  {set.plan}
                                                </TableCell>
                                                <TableCell 
                                                  key={`${setIndex}-actual`} 
                                                  className={`text-center w-16 px-2 text-xs ${
                                                    set.actual && set.plan && parseInt(set.actual) < parseInt(set.plan) 
                                                      ? 'bg-orange-100' 
                                                      : ''
                                                  }`}
                                                >
                                                  <span className="font-medium">{set.actual}</span>
                                                </TableCell>
                                              </>
                                            ))}
                                          </TableRow>
                                        </TableBody>
                                      </Table>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              
                              {workout.status === "failed" && (
                                <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                  <p className="text-sm text-orange-800">
                                    <strong>Note:</strong> This workout was marked as failed - some planned exercises may not have been completed.
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}