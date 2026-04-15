import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  role: 'admin' | 'teacher' | 'student';
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ role, children }) => {
  const { user, profile, loading } = useAuthContext();

  // Show a minimal loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-on-surface-variant text-sm font-mono uppercase tracking-widest">
            Loading…
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated → login
  if (!user || !profile) {
    return <Navigate to="/login" replace />;
  }

  // Wrong role → redirect to the user's correct dashboard
  if (profile.role !== role) {
    return <Navigate to={`/${profile.role}`} replace />;
  }

  return <>{children}</>;
};
