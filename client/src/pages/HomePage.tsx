import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
import './HomePage.css';

// These types should ideally be in a shared file
interface Set {
  setNumber: string;
  plan: string;
  actual: string;
}

interface Exercise {
  name: string;
  intensity: string;
  notes: string;
  sets: Set[];
}

interface Workout {
  id: string; // ID of the first row for that date
  date: string;
  category: string;
  exercises: Exercise[];
}

interface WorkoutRow {
  id: string;
  date: string;
  category: string;
  intensity: string;
  exercise: string; // This is the exercise name
  set_number: string;
  plan: string;
  actual: string;
  notes: string;
}

function HomePage() {
  const [groupedWorkouts, setGroupedWorkouts] = useState<Workout[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [expandedWorkoutDate, setExpandedWorkoutDate] = useState<string | null>(null);

  const fetchWorkouts = async () => {
    try {
      setError(null); // Clear previous errors
      const response = await fetch('http://localhost:8000/api/workouts');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const rows: WorkoutRow[] = data.data;

      if (!rows || rows.length === 0) {
        setGroupedWorkouts([]);
        return;
      }

      const grouped = rows.reduce((acc: Record<string, Workout>, row: WorkoutRow) => {
        const { id, date, category, intensity, exercise: exName, set_number: setNum, plan, actual, notes } = row;

        if (!date || !id) return acc; // Skip rows without date or id

        if (!acc[date]) {
          acc[date] = { id, date, category, exercises: [] };
        }

        let exercise = acc[date].exercises.find(e => e.name === exName && e.intensity === intensity);
        if (!exercise) {
          exercise = { name: exName, intensity, notes, sets: [] };
          acc[date].exercises.push(exercise);
        }

        exercise.sets.push({ setNumber: setNum, plan, actual });
        return acc;
      }, {});

      setGroupedWorkouts(Object.values(grouped).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (e: any) {
      setError(e.message);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const toggleWorkoutDetails = (date: string) => {
    setExpandedWorkoutDate(expandedWorkoutDate === date ? null : date);
  };

  const handleDeleteWorkout = async (e: React.MouseEvent, date: string) => {
    e.stopPropagation(); // Prevent row from expanding

    if (window.confirm(`Are you sure you want to delete all workouts for ${date}?`)) {
      try {
        const response = await fetch(`http://localhost:8000/api/workouts/date/${date}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        fetchWorkouts(); // Refetch workouts to get the updated list
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const handleDeleteExercise = async (date: string, exerciseName: string) => {
    if (window.confirm(`Are you sure you want to delete "${exerciseName}" from the workout on ${date}?`)) {
      try {
        const response = await fetch(`http://localhost:8000/api/workouts/delete-exercise`, {
          method: 'POST', // Using POST to send a body easily
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ date, exerciseName }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        fetchWorkouts(); // Refetch workouts to get the updated list
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  return (
    <div className="App">
      <h1>Workout Tracker</h1>
      <Link to="/add">
        <button>Add New Workout</button>
      </Link>
      {error && <p className="error-message">Error: {error}</p>}
      
      <div className="workouts-container card">
        <div className="card-header">
          <h2 className="card-title">Workout Calendar</h2>
          <p className="card-description">Click on any workout to view the detailed log.</p>
        </div>
        <div className="card-content">
          <table className="main-workout-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}></th>
                <th>Date</th>
                <th>Category</th>
                <th>Exercises</th>
                <th style={{ width: '150px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {groupedWorkouts.length > 0 ? (
                groupedWorkouts.map(workout => (
                  <>
                    <tr key={workout.date} className="workout-summary-row" onClick={() => toggleWorkoutDetails(workout.date)}>
                      <td>
                        <span className="expand-icon">
                          {expandedWorkoutDate === workout.date ? '▼' : '▶'}
                        </span>
                      </td>
                      <td>{workout.date}</td>
                      <td>
                        <span className="category-badge">{workout.category}</span>
                      </td>
                      <td>
                        <span className="exercise-count-badge">{workout.exercises.length} exercises</span>
                      </td>
                      <td>
                        <div className="actions-cell">
                          <Link to={`/workout/${workout.id}`} className="edit-button">Edit</Link>
                          <button onClick={(e) => handleDeleteWorkout(e, workout.date)} className="delete-button">Delete</button>
                        </div>
                      </td>
                    </tr>
                    {expandedWorkoutDate === workout.date && (
                      <tr className="workout-details-row">
                        <td colSpan={5} className="details-cell">
                          <div className="details-content">
                            <h4>Workout Log Details</h4>
                            {workout.exercises.map((exercise, index) => (
                              <div key={index} className="exercise-log-item">
                                <div className="exercise-log-header">
                                  <h5>{exercise.name}</h5>
                                  <div className="exercise-header-actions">
                                    <span>{exercise.intensity}</span>
                                    <button onClick={() => handleDeleteExercise(workout.date, exercise.name)} className="delete-exercise-button">
                                      ✕
                                    </button>
                                  </div>
                                </div>
                                <table className="sets-table">
                                  <thead>
                                    <tr>
                                      <th>Set</th>
                                      <th>Plan</th>
                                      <th>Actual</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {exercise.sets.sort((a,b) => parseInt(a.setNumber) - parseInt(b.setNumber)).map((set, setIndex) => (
                                      <tr key={setIndex}>
                                        <td>{set.setNumber}</td>
                                        <td>{set.plan}</td>
                                        <td>{set.actual}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>
                    Loading workouts or no workouts found...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default HomePage;