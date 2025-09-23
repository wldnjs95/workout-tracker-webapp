// client/src/App.tsx
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AddWorkoutPage from './pages/AddWorkoutPage';
import EditWorkoutPage from './pages/EditWorkoutPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/add" element={<AddWorkoutPage />} />
      <Route path="/workout/:id" element={<EditWorkoutPage />} />
    </Routes>
  );
}

export default App;