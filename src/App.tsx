import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from './components/AuthGuard';
import { AuthForm } from './components/AuthForm';
import { Dashboard } from './pages/Dashboard';
import { ProjectDetails } from './pages/ProjectDetails';
import { CreateProject } from './pages/CreateProject';
import { CompanySetup } from './components/CompanySetup';
import { useAuthStore } from './stores/authStore';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, profile } = useAuthStore();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (profile && !profile.company_id && window.location.pathname !== '/setup') {
    return <Navigate to="/setup" replace />;
  }

  return <>{children}</>;
}

function SetupGuard({ children }: { children: React.ReactNode }) {
  const { profile } = useAuthStore();

  if (profile?.company_id) {
    return <Navigate to="/projects" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <AuthGuard>
        <Routes>
          <Route
            path="/login"
            element={<AuthForm type="login" />}
          />
          <Route
            path="/register"
            element={<AuthForm type="register" />}
          />
          <Route
            path="/setup"
            element={
              <PrivateRoute>
                <SetupGuard>
                  <CompanySetup />
                </SetupGuard>
              </PrivateRoute>
            }
          />
          <Route
            path="/projects/new"
            element={
              <PrivateRoute>
                <CreateProject />
              </PrivateRoute>
            }
          />
          <Route
            path="/projects/:projectId"
            element={
              <PrivateRoute>
                <Dashboard>
                  <ProjectDetails />
                </Dashboard>
              </PrivateRoute>
            }
          />
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthGuard>
    </Router>
  );
}

export default App;