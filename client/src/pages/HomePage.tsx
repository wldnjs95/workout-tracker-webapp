import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../components/ui/pagination";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { ChevronDown, ChevronRight, Activity, TrendingUp, Clock } from 'lucide-react';

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
  status: string;
}

function HomePage() {
  const [groupedWorkouts, setGroupedWorkouts] = useState<Workout[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [expandedWorkoutDate, setExpandedWorkoutDate] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [mostFrequentCategory, setMostFrequentCategory] = useState("N/A");
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
      setTotalWorkouts(result.total);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/workouts/stats`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setMostFrequentCategory(result.most_frequent_category);
    } catch (e: any) {
      console.error("Error fetching stats:", e.message);
    }
  };

  useEffect(() => {
    fetchWorkouts(currentPage);
  }, [currentPage]);

  useEffect(() => {
    fetchStats();
  }, []);

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
        fetchStats(); // Refetch stats after deleting a workout
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

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Success':
        return 'default';
      case 'Partially Missed':
        return 'secondary';
      case 'Not Started':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="App container mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Workout Tracker</h1>
        
      </div>
      {error && (
        <div role="alert" className="alert alert-error mb-4">
          Error: {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3 mb-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWorkouts}</div>
            <p className="text-xs text-muted-foreground">logged</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Frequent Category</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mostFrequentCategory}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">minutes</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Workout Calendar</h2>
          <p className="text-sm text-muted-foreground">
            Click on any workout to view the detailed log.
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead style={{ width: '50px' }}></TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead style={{ width: '150px' }}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupedWorkouts.length > 0 ? (
                groupedWorkouts.map(workout => (
                  <React.Fragment key={workout.date}>
                    <TableRow
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleWorkoutDetails(workout.date)}
                    >
                      <TableCell>
                        {expandedWorkoutDate === workout.date ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </TableCell>
                      <TableCell>{workout.date}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{workout.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(workout.status)}>{workout.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:bg-red-50 hover:text-red-600"
                            onClick={(e) => handleDeleteWorkout(e, workout.date)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedWorkoutDate === workout.date && (
                      <TableRow>
                        <TableCell colSpan={5} className="p-0">
                          <div className={`collapsible-content ${expandedWorkoutDate === workout.date ? 'open' : ''}`}>
                            <div className="p-4 space-y-4 bg-[#f9f9f9]">
                              <div className="flex justify-between items-center">
                              <h4 className="text-base font-semibold">Workout Log Details</h4>
                              <Link to={`/workout/${workout.id}`}>
                                <Button variant="outline" size="sm">Edit</Button>
                              </Link>
                            </div>
                              {workout.exercises.map((exercise, index) => {
                                const sortedSets = exercise.sets.sort((a,b) => parseInt(a.setNumber) - parseInt(b.setNumber));
                                return (
                                  <div key={index} className="rounded-lg border bg-background">
                                    <div className="flex items-center justify-between px-8 py-3 border-b bg-muted/50">
                                      <div className="flex items-center gap-2">
                                        <h5 className="font-medium">{exercise.name}</h5>
                                        <span className="text-sm text-muted-foreground">· {exercise.intensity}</span>
                                      </div>
                                      <button
                                        aria-label={`Delete ${exercise.name}`}
                                        onClick={() => handleDeleteExercise(workout.date, exercise.name)}
                                        className="inline-flex h-6 w-6 items-center justify-center rounded hover:bg-red-50 text-red-600"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                    <div className="p-4">
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
                                                  <TableHead className="text-center w-16 font-normal text-muted-foreground">Plan</TableHead>
                                                  <TableHead className="text-center w-16 font-normal text-muted-foreground">Actual</TableHead>
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
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center p-10">
                    Loading workouts or no workouts found...
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
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
        </CardContent>
      </Card>
    </div>
  );
}

export default HomePage;
