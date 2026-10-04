import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import HealthCheck from './pages/HealthCheck';

// Import Pages
import DashboardRouter from './pages/DashboardRouter';
import StudentManagement from './pages/StudentManagement';
import RoomManagement from './pages/RoomManagement';
import BillingInvoices from './pages/BillingInvoices';
import ComplaintManagement from './pages/ComplaintManagement';
import VisitorManagement from './pages/VisitorManagement';
import AttendanceTracking from './pages/AttendanceTracking';
import AnalyticsInsights from './pages/AnalyticsInsights';
import AuditLogs from './pages/AuditLogs';

import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Auth & System Health Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/health" element={<HealthCheck />} />

          {/* Authenticated Routes wrapped in ProtectedRoute */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardRouter />} />

              {/* General Staff & Student pages with inner role rendering */}
              <Route path="rooms" element={<RoomManagement />} />
              <Route path="fees" element={<BillingInvoices />} />
              <Route path="complaints" element={<ComplaintManagement />} />
              <Route path="visitors" element={<VisitorManagement />} />
              <Route path="attendance" element={<AttendanceTracking />} />

              {/* Staff/Admin restricted routes */}
              <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HOSTEL_MANAGER']} />}>
                <Route path="students" element={<StudentManagement />} />
                <Route path="audit-logs" element={<AuditLogs />} />
              </Route>

              {/* Super Admin restricted routes */}
              <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
                <Route path="analytics" element={<AnalyticsInsights />} />
              </Route>
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
