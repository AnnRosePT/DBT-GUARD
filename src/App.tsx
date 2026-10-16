import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Home } from './pages/Home';
import { Cases } from './pages/Cases';
import { CaseDetail } from './pages/CaseDetail';
import { PaymentStatus } from './pages/PaymentStatus';
import { VoiceAssist } from './pages/VoiceAssist';
import { MyTasks } from './pages/MyTasks';
import { Escalations } from './pages/Escalations';
import { Revalidate } from './pages/Revalidate';
import { ImportSync } from './pages/ImportSync';
import { Reports } from './pages/Reports';
import { QABenchmark } from './pages/QABenchmark';
import { Presentation } from './pages/Presentation';
import { useAuthStore } from './store/useAuthStore';

// Role-aware intelligent root redirection
function RootRedirect() {
  const { isAuthenticated, currentUser } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  switch (currentUser.role) {
    case 'krishi_bhavan':
      return <Navigate to="/dashboard" replace />;
    case 'bank_branch':
    case 'akshaya':
    case 'village_office':
      return <Navigate to="/tasks" replace />;
    case 'district_nodal':
      return <Navigate to="/escalations" replace />;
    case 'farmer':
      return <Navigate to="/cases" replace />;
    default:
      return <Navigate to="/dashboard" replace />;
  }
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Presentation & Pitch Deck Mode */}
        <Route path="/presentation" element={<Presentation />} />

        {/* Public Gateway Login Route (First Landing Page) */}
        <Route path="/login" element={<Login />} />

        {/* Protected Application Routes guarded by Session & Strict RBAC */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<RootRedirect />} />

          {/* Common Payment Processing Status — Accessible to ALL roles */}
          <Route path="payment-status" element={<PaymentStatus />} />

          {/* Cases & Beneficiary Dossier — Farmer strictly identity-isolated */}
          <Route path="cases" element={<Cases />} />
          <Route path="cases/:id" element={<CaseDetail />} />

          {/* Krishi Bhavan & District Nodal Desks */}
          <Route
            path="dashboard"
            element={
              <ProtectedRoute allowedRoles={['krishi_bhavan', 'district_nodal']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="home"
            element={
              <ProtectedRoute allowedRoles={['krishi_bhavan', 'district_nodal']}>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="escalations"
            element={
              <ProtectedRoute allowedRoles={['district_nodal', 'krishi_bhavan']}>
                <Escalations />
              </ProtectedRoute>
            }
          />
          <Route
            path="reports"
            element={
              <ProtectedRoute allowedRoles={['krishi_bhavan', 'district_nodal']}>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="import"
            element={
              <ProtectedRoute allowedRoles={['district_nodal', 'krishi_bhavan']}>
                <ImportSync />
              </ProtectedRoute>
            }
          />
          <Route
            path="qa"
            element={
              <ProtectedRoute allowedRoles={['district_nodal', 'krishi_bhavan']}>
                <QABenchmark />
              </ProtectedRoute>
            }
          />

          {/* Partner Agency Desks: Bank, Akshaya, Village Office */}
          <Route
            path="tasks"
            element={
              <ProtectedRoute allowedRoles={['bank_branch', 'akshaya', 'village_office']}>
                <MyTasks />
              </ProtectedRoute>
            }
          />

          {/* Inter-Agency Clearinghouse Revalidation */}
          <Route
            path="revalidate"
            element={
              <ProtectedRoute allowedRoles={['krishi_bhavan', 'bank_branch', 'district_nodal']}>
                <Revalidate />
              </ProtectedRoute>
            }
          />

          {/* Voice Assist (Officer Triage or Farmer Personal Audio Advice) */}
          <Route path="voice" element={<Navigate to="/voice/K104" replace />} />
          <Route path="voice/:id" element={<VoiceAssist />} />

          {/* Catch-all Fallback */}
          <Route path="*" element={<RootRedirect />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
