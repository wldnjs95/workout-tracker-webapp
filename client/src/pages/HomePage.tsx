import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../components/ui/pagination";

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

function HomePage() {
  const [groupedWorkouts, setGroupedWorkouts] = useState<Workout[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [expandedWorkoutDate, setExpandedWorkoutDate] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 10;

  const fetchWorkouts = async (page: number) => {
    try {
      setError(null);
      const response = await fetch(`http://localhost:8000/api/workouts?page=${page}&limit=${limit}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setGroupedWorkouts(result.data);
      setTotalPages(Math.ceil(result.total / result.limit));
    } catch (e: any) {
      setError(e.message);
    }
  };

  useEffect(() => {
    fetchWorkouts(currentPage);
  }, [currentPage]);

  const toggleWorkoutDetails = (date: string) => {
    setExpandedWorkoutDate(expandedWorkoutDate === date ? null : date);
  };

  const handleDeleteWorkout = async (e: React.MouseEvent, date: string) => {
    e.stopPropagation();

    if (window.confirm(`Are you sure you want to delete all workouts for ${date}?`)) {
      try {
        const response = await fetch(`http://localhost:8000/api/workouts/date/${date}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        fetchWorkouts(currentPage);
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const handleDeleteExercise = async (date: string, exerciseName: string) => {
    if (window.confirm(`Are you sure you want to delete "${exerciseName}" from the workout on ${date}?`)) {
      try {
        const response = await fetch(`http://localhost:8000/api/workouts/delete-exercise`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ date, exerciseName }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        fetchWorkouts(currentPage);
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);

      if (currentPage <= 3) {
        startPage = 1;
        endPage = maxPagesToShow;
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - maxPagesToShow + 1;
        endPage = totalPages;
      }
      
      if (startPage > 1) {
        pageNumbers.push(1);
        if (startPage > 2) {
          pageNumbers.push('...');
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pageNumbers.push('...');
        }
        pageNumbers.push(totalPages);
      }
    }
    return pageNumbers;
  }

  return (
    <div className="App container mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Workout Tracker</h1>
        <Link to="/add">
          <button className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 transition-colors">
            Add New Workout
          </button>
        </Link>
      </div>
      {error && (
        <div role="alert" className="alert alert-error mb-4">
          Error: {error}
        </div>
      )}

      <div className="workouts-container card shadow-md rounded-lg border">
        <div className="card-header border-b p-4">
          <h2 className="card-title text-lg font-semibold">Workout Calendar</h2>
          <p className="card-description text-muted-foreground text-sm">
            Click on any workout to view the detailed log.
          </p>
        </div>
        <div className="card-content p-4">
          <div className="relative w-full overflow-x-auto">
            <table className="main-workout-table w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr>
                  <th style={{ width: '50px' }} className="px-2 py-2"></th>
                  <th className="px-2 py-2 text-left">Date</th>
                  <th className="px-2 py-2 text-left">Category</th>
                  <th className="px-2 py-2 text-left">Exercises</th>
                  <th style={{ width: '150px' }} className="px-2 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {groupedWorkouts.length > 0 ? (
                  groupedWorkouts.map(workout => (
                    <React.Fragment key={workout.date}>
                      <tr
                        className="workout-summary-row hover:bg-muted/50 transition-colors border-b cursor-pointer"
                        onClick={() => toggleWorkoutDetails(workout.date)}
                        aria-expanded={expandedWorkoutDate === workout.date}
                      >
                        <td className="px-2 py-2">
                          <span className="expand-icon mr-2">
                            {expandedWorkoutDate === workout.date ? '▼' : '▶'}
                          </span>
                        </td>
                        <td className="px-2 py-2">{workout.date}</td>
                        <td className="px-2 py-2">
                          <span className="category-badge">{workout.category}</span>
                        </td>
                        <td className="px-2 py-2">
                          <span className="exercise-count-badge">{workout.exercises.length} exercises</span>
                        </td>
                        <td className="px-2 py-2">
                          <div className="actions-cell flex items-center gap-2">
                            <Link to={`/workout/${workout.id}`} className="edit-button inline-flex items-center rounded-md border px-3 py-1.5 hover:bg-accent">
                              Edit
                            </Link>
                            <button
                              onClick={(e) => handleDeleteWorkout(e, workout.date)}
                              className="delete-button inline-flex items-center rounded-md border px-3 py-1.5 text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedWorkoutDate === workout.date && (
                        <tr className="workout-details-row">
                          <td colSpan={5} className="details-cell p-0">
                            <div className="details-content p-4 space-y-4 bg-muted/20">
                              <h4 className="text-base font-semibold">Workout Log Details</h4>
                              {workout.exercises.map((exercise, index) => {
                                const sortedSets = exercise.sets.sort((a,b) => parseInt(a.setNumber) - parseInt(b.setNumber));
                                return (
                                  <div key={index} className="exercise-log-item rounded-md border p-4 bg-background">
                                    <div className="exercise-log-header flex items-center justify-between mb-2">
                                      <h5 className="font-medium">{exercise.name}</h5>
                                      <div className="exercise-header-actions flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">{exercise.intensity}</span>
                                        <button
                                          aria-label={`Delete ${exercise.name}`}
                                          onClick={() => handleDeleteExercise(workout.date, exercise.name)}
                                          className="delete-exercise-button inline-flex h-6 w-6 items-center justify-center rounded hover:bg-red-50 text-red-600"
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    </div>
                                    <div className="overflow-x-auto w-fit">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            {sortedSets.map((set, index) => (
                                              <TableHead key={`${set.setNumber}-${index}`} colSpan={2} className="text-center">Set {set.setNumber}</TableHead>
                                            ))}
                                          </TableRow>
                                          <TableRow>
                                            {sortedSets.map((set, index) => (
                                              <React.Fragment key={`${set.setNumber}-${index}`}>
                                                <TableHead className="text-center w-16">Plan</TableHead>
                                                <TableHead className="text-center w-16">Actual</TableHead>
                                              </React.Fragment>
                                            ))}
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          <TableRow>
                                            {sortedSets.map((set, index) => (
                                              <React.Fragment key={`${set.setNumber}-${index}`}>
                                                <TableCell className="text-center">{set.plan}</TableCell>
                                                <TableCell className="text-center">{set.actual}</TableCell>
                                              </React.Fragment>
                                            ))}
                                          </TableRow>
                                        </TableBody>
                                      </Table>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
          {totalPages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }} />
                </PaginationItem>
                {renderPageNumbers().map((page, index) => (
                  <PaginationItem key={index}>
                    {page === '...' ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink href="#" isActive={page === currentPage} onClick={(e) => { e.preventDefault(); handlePageChange(page as number); }}>
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
