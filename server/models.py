from pydantic import BaseModel
from typing import List, Optional

class SetRow(BaseModel):
    plan: str
    actual: str
    setNumber: int

class Exercise(BaseModel):
    name: str
    intensity: str
    sets: List[SetRow]
    notes: Optional[str] = None

class Workout(BaseModel):
    id: str
    date: str
    category: str
    exercises: List[Exercise]

class DeleteExerciseRequest(BaseModel):
    date: str
    exerciseName: str