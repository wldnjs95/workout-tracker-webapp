import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Navigation } from './Navigation';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveView = () => {
    if (location.pathname === '/') return 'dashboard';
    if (location.pathname.startsWith('/add')) return 'add-workout';
    if (location.pathname.startsWith('/progress')) return 'progress';
    return 'dashboard';
  };

  const handleViewChange = (view: string) => {
    if (view === 'dashboard') {
      navigate('/');
    } else if (view === 'add-workout') {
      navigate('/add');
    } else if (view === 'progress') {
      navigate('/progress');
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <div className="w-64 border-r">
        <Navigation activeView={getActiveView()} onViewChange={handleViewChange} />
      </div>
      <main className="flex-1 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
