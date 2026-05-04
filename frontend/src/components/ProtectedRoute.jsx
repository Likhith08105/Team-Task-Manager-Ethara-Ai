// ProtectedRoute component - handles authentication check for protected pages
import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/helpers';

const ProtectedRoute = ({ children }) => {
  // If user is not authenticated, redirect to login
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // If user is authenticated, render the component
  return children;
};

export default ProtectedRoute;
