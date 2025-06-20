import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from './Layout';

interface ProtectedRouteProps {
  allowedRoles?: string[]; // Array of allowed roles
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { currentUser, userRole, loading } = useAuth();

  // If still loading auth state, show a loading indicator or nothing
  if (loading) {
    return <div>Carregando...</div>; // Or a proper spinner component
  }

  // If no user is logged in, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If roles are specified and the user's role is not in the allowed list, redirect
  if (allowedRoles && (!userRole || !allowedRoles.includes(userRole))) {
    // Redirect to home or an "unauthorized" page
    // Redirecting to home is safer to not reveal the existence of a protected page
    return <Navigate to="/" replace />; 
  }

  // Render the protected content within the main layout
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
} 