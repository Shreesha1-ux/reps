/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { hasSupabaseConfig } from './lib/supabase';
import { SetupRequired } from './components/SetupRequired';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Verify } from './pages/Verify';
import { Dashboard } from './pages/Dashboard';
import { Progress } from './pages/Progress';
import { Community } from './pages/Community';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
  }
  
  if (!session) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify" element={<Verify />} />
      
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="progress" element={<Progress />} />
        <Route path="community" element={<Community />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  if (!hasSupabaseConfig) {
    return <SetupRequired />;
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
