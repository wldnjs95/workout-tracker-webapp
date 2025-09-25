// client/src/App.tsx
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AddWorkoutPage from './pages/AddWorkoutPage';
import EditWorkoutPage from './pages/EditWorkoutPage';
import AppLayout from './components/AppLayout';
import ComingSoonPage from './pages/ComingSoonPage';

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/add" element={<AddWorkoutPage />} />
        <Route path="/workout/:id" element={<EditWorkoutPage />} />
        <Route path="/progress" element={<ComingSoonPage />} />
      </Routes>
    </AppLayout>
  );
}

export default App;