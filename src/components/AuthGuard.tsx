import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { LoadingSpinner } from './LoadingSpinner';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, initialized, checkAuth } = useAuthStore();

  useEffect(() => {
    if (!initialized) {
      checkAuth();
    }
  }, [initialized, checkAuth]);

  useEffect(() => {
    if (initialized && !loading) {
      const isAuthRoute = ['/login', '/register'].includes(location.pathname);
      
      if (!user && !isAuthRoute) {
        navigate('/login');
      } else if (user && isAuthRoute) {
        navigate('/projects');
      }
    }
  }, [user, loading, initialized, location.pathname, navigate]);

  if (loading || !initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return <>{children}</>;
}