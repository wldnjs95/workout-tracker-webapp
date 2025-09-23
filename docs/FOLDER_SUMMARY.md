# Repository overview (brief)

- client/: React + TypeScript frontend for a Workout Tracker.
  - Pages like AddWorkoutPage, EditWorkoutPage, and HomePage define types (e.g., WorkoutRow, FormData) and handle workout creation/editing flows.
  - Likely served via Vite at http://localhost:5173 and communicates with the backend API.

- server/: FastAPI backend.
  - CORS allows requests from the frontend.
  - Integrates with Google Sheets (via service account, spreadsheet ID, and range in config.py) to store/fetch workout data.
  - workouts router includes logic to transform sheet rows into objects.

- css-reference/Workout Tracker Website/: Reference UI and example app.
  - A collection of reusable UI components built with Radix primitives and utility classes (e.g., accordion, dialog, table, sidebar, etc.), plus demo pages/components like Dashboard and WorkoutTracker.
  - Serves as a design/system reference rather than the primary app used under client/.

Overall: This is a monorepo-style setup with a React frontend (client), a FastAPI + Google Sheets backend (server), and a UI component reference library (css-reference).
