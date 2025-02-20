import { Routes, Route } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { ProjectsList } from '../components/ProjectsList';
import { Settings } from './Settings';
import { Teams } from './Teams';
import { useAuthStore } from '../stores/authStore';

interface DashboardProps {
  children?: React.ReactNode;
}

export function Dashboard({ children }: DashboardProps) {
  const { profile } = useAuthStore();
  
  if (!profile) return null;

  const userInitial = profile.full_name?.[0]?.toUpperCase() || profile.email[0].toUpperCase();
  const displayName = profile.email.split('@')[0];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar userName={displayName} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header userInitial={userInitial} />
        <main className="flex-1 relative">
          {children || (
            <div className="absolute inset-0">
              <Routes>
                <Route path="/projects" element={<ProjectsList />} />
                <Route path="/team" element={<Teams />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/import" element={<div>Import Page</div>} />
              </Routes>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}