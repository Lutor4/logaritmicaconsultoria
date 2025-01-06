import { createBrowserRouter } from 'react-router-dom';
import { App } from './App';
import { LoginForm } from './auth/LoginForm';
import { RegisterForm } from './auth/RegisterForm';
import { DashboardPage } from './pages/Dashboard';
import { DepartmentsPage } from './pages/Departments';
import { EmployeesPage } from './pages/Employees';
import { ProjectsPage } from './pages/Projects';
import { FormTemplatesPage } from './pages/FormTemplates';
import { SettingsPage } from './pages/Settings';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { AuthProvider } from './auth/AuthContext';

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ErrorBoundary>
        <AuthProvider>
          <ProtectedRoute>
            <App />
          </ProtectedRoute>
        </AuthProvider>
      </ErrorBoundary>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      {
        path: 'departments',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <DepartmentsPage />
          </ProtectedRoute>
        ),
      },
      { path: 'employees', element: <EmployeesPage /> },
      { path: 'projects', element: <ProjectsPage /> },
      { path: 'forms', element: <FormTemplatesPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
  {
    path: '/login',
    element: (
      <ErrorBoundary>
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      </ErrorBoundary>
    ),
  },
  {
    path: '/register',
    element: (
      <ErrorBoundary>
        <AuthProvider>
          <RegisterForm />
        </AuthProvider>
      </ErrorBoundary>
    ),
  },
]);