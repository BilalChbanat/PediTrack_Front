import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

// You'll need to implement your authentication logic here
// This could be a context, Redux store, or any state management solution
const useAuth = () => {
  // Replace this with your actual authentication logic
  // This could check localStorage, cookies, context, etc.
  const token = localStorage.getItem('token');
  const isAuth = localStorage.getItem('isAuth');
  
  return {
    isAuthenticated: !!(token && isAuth), // Check if token and isAuth exist

  };
};

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/auth/sign-in" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;