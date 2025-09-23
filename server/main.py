from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import workouts

app = FastAPI()

origins = [
    "http://localhost:5173" # front server
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(workouts.router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Hello from the backend!"}
