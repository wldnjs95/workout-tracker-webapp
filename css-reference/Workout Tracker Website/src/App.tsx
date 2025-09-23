import { useState } from "react";
import { Navigation } from "./components/Navigation";
import { Dashboard } from "./components/Dashboard";
import { WorkoutTracker } from "./components/WorkoutTracker";
import { ProgressAnalytics } from "./components/ProgressAnalytics";
import { Card, CardContent } from "./components/ui/card";

interface ExerciseRow {
  id: string;
  exercise: string;
  intensity: string;
  unit: string;
  sets: Array<{
    plan: string;
    actual?: string;
  }>;
}

interface WorkoutPlan {
  id: string;
  date: string;
  category: string;
  exercises: ExerciseRow[];
  status?: 'planned' | 'in-progress' | 'completed';
}

export default function App() {
  const [activeView, setActiveView] = useState("dashboard");
  const [activeWorkoutPlan, setActiveWorkoutPlan] = useState<WorkoutPlan | null>(null);

  const handleStartWorkout = (plan: WorkoutPlan) => {
    setActiveWorkoutPlan(plan);
    setActiveView("workout");
  };

  const handleBackToDashboard = () => {
    setActiveWorkoutPlan(null);
    setActiveView("dashboard");
  };

  const handleWorkoutComplete = (completedPlan: WorkoutPlan) => {
    setActiveWorkoutPlan(null);
    setActiveView("dashboard");
  };

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return <Dashboard onStartWorkout={handleStartWorkout} />;
      case "workout":
        return (
          <WorkoutTracker 
            selectedPlan={activeWorkoutPlan}
            onBackToDashboard={handleBackToDashboard}
            onWorkoutComplete={handleWorkoutComplete}
          />
        );
      case "progress":
        return <ProgressAnalytics />;
      case "profile":
      case "settings":
        return (
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  {activeView.charAt(0).toUpperCase() + activeView.slice(1)} feature coming soon!
                </p>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return <Dashboard onStartWorkout={handleStartWorkout} />;
    }
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar Navigation */}
      <div className="w-64 border-r bg-card">
        <Navigation activeView={activeView} onViewChange={setActiveView} />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {renderView()}
        </div>
      </div>
    </div>
  );
}