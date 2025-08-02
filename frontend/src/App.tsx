import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';

// Auth Components
import RegisterForm from './components/auth/RegisterForm';
import LoginForm from './components/auth/LoginForm';

// Pages
import HomePage from './pages/HomePage';

// User Components
import ReportIssueForm from './components/user/ReportIssueForm';
import MapView from './components/user/MapView';
import IssueDetail from './components/user/IssueDetail';
import UserDashboard from './components/user/UserDashboard';

// Admin Components
import AdminDashboard from './components/admin/AdminDashboard';
import FlaggedReportsAdmin from './components/admin/FlaggedReportsAdmin';
import AdminAnalytics from './components/admin/AdminAnalytics';
import UserManagementAdmin from './components/admin/UserManagementAdmin';

const AppContent: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {user && <Navbar />}
      
      <main className={user ? 'pt-4' : ''}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={
            user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace /> : <RegisterForm />
          } />
          <Route path="/login" element={
            user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace /> : <LoginForm />
          } />
          
          {/* User Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute requiredRole="user">
              <UserDashboard />
            </ProtectedRoute>
          } />
          <Route path="/report" element={
            <ProtectedRoute requiredRole="user">
              <ReportIssueForm />
            </ProtectedRoute>
          } />
          <Route path="/map" element={
            <ProtectedRoute requiredRole="user">
              <MapView />
            </ProtectedRoute>
          } />
          <Route path="/issue/:id" element={
            <ProtectedRoute requiredRole="user">
              <IssueDetail />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/analytics" element={
            <ProtectedRoute requiredRole="admin">
              <AdminAnalytics />
            </ProtectedRoute>
          } />
          <Route path="/admin/flagged" element={
            <ProtectedRoute requiredRole="admin">
              <FlaggedReportsAdmin />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute requiredRole="admin">
              <UserManagementAdmin />
            </ProtectedRoute>
          } />
          
          {/* Default Redirects */}
          <Route path="/home" element={<Navigate to="/" replace />} />
          
          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;