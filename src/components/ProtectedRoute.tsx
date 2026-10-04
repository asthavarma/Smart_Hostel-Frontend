import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  allowedRoles?: Array<'SUPER_ADMIN' | 'HOSTEL_MANAGER' | 'WARDEN' | 'STUDENT'>;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  const userJson = localStorage.getItem('user');

  if (!token || !userJson) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userJson);
    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      // Role is not permitted to access this route -> redirect to their dashboard
      return <Navigate to="/dashboard" replace />;
    }
  } catch (e) {
    localStorage.clear();
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
