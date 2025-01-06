import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { LoadingSpinner } from './ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'department')[];
}

export function ProtectedRoute({ 
  children, 
  allowedRoles = ['admin', 'department'] 
}: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <LoadingSpinner />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Allow admin@admin.com to access everything
  if (user.email === 'admin@admin.com') {
    return <>{children}</>;
  }

  // Check role-based access for other users
  if (!profile || (allowedRoles.length > 0 && !allowedRoles.includes(profile.role))) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}