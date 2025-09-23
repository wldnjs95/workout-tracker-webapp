import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

export function ProgressAnalytics() {
  // Monthly workout frequency by category
  const monthlyWorkoutData = [
    { month: "Jan", Push: 8, Pull: 7, Legs: 6, Rest: 10 },
    { month: "Feb", Push: 9, Pull: 8, Legs: 7, Rest: 8 },
    { month: "Mar", Push: 7, Pull: 9, Legs: 8, Rest: 7 },
    { month: "Apr", Push: 10, Pull: 8, Legs: 9, Rest: 5 },
    { month: "May", Push: 8, Pull: 10, Legs: 7, Rest: 6 },
    { month: "Jun", Push: 9, Pull: 7, Legs: 10, Rest: 5 },
  ];

  // Rest days vs workout days
  const restDaysData = [
    { month: "Jan", workoutDays: 21, restDays: 10 },
    { month: "Feb", workoutDays: 24, restDays: 8 },
    { month: "Mar", workoutDays: 24, restDays: 7 },
    { month: "Apr", workoutDays: 27, restDays: 5 },
    { month: "May", workoutDays: 25, restDays: 6 },
    { month: "Jun", workoutDays: 26, restDays: 5 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Progress Analytics</h1>
          <p className="text-muted-foreground">
            Track your workout frequency and patterns
          </p>
        </div>
        <Select defaultValue="6months">
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3months">3 Months</SelectItem>
            <SelectItem value="6months">6 Months</SelectItem>
            <SelectItem value="1year">1 Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Monthly Workout Frequency by Category */}
      <Card>
        <CardHeader>
          <CardTitle>
            Monthly Workout Frequency by Category
          </CardTitle>
          <p className="text-muted-foreground">
            Track how often you work each muscle group
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={monthlyWorkoutData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="Push" fill="#8884d8" name="Push" />
              <Bar dataKey="Pull" fill="#82ca9d" name="Pull" />
              <Bar dataKey="Legs" fill="#ffc658" name="Legs" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Rest Days vs Workout Days */}
      <Card>
        <CardHeader>
          <CardTitle>Workout vs Rest Days</CardTitle>
          <p className="text-muted-foreground">
            Monitor your activity and recovery balance
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={restDaysData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="workoutDays"
                stroke="#8884d8"
                strokeWidth={3}
                name="Workout Days"
              />
              <Line
                type="monotone"
                dataKey="restDays"
                stroke="#ff7c7c"
                strokeWidth={3}
                name="Rest Days"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Most Frequent Category
              </p>
              <div className="text-2xl font-bold">Push</div>
              <p className="text-xs text-muted-foreground">
                54 workouts this period
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Average Rest Days
              </p>
              <div className="text-2xl font-bold">6.8</div>
              <p className="text-xs text-muted-foreground">
                per month
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Consistency Score
              </p>
              <div className="text-2xl font-bold">85%</div>
              <p className="text-xs text-muted-foreground">
                workout completion rate
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}