import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ProtectedRoute } from './layouts/AppShell'
import Login from './pages/Login'

import AdminDashboard from './pages/admin/Dashboard'
import RecyclerManagement from './pages/admin/RecyclerManagement'
import RecyclerDetails from './pages/admin/RecyclerDetails'
import CollectorMonitoring from './pages/admin/CollectorMonitoring'
import CollectorDetails from './pages/admin/CollectorDetails'
import AdminLots from './pages/admin/Lots'
import AdminTransactions from './pages/admin/Transactions'
import AdminTraceability from './pages/admin/Traceability'
import PriceBoard from './pages/admin/PriceBoard'
import Analytics from './pages/admin/Analytics'
import ActivityLog from './pages/admin/ActivityLog'
import Settings from './pages/admin/Settings'
import AdminProfile from './pages/admin/AdminProfile'
import LotDetails from './pages/LotDetails'

import RecyclerDashboard from './pages/recycler/Dashboard'
import ReceivedLots from './pages/recycler/ReceivedLots'
import ActiveLots from './pages/recycler/ActiveLots'
import Pickups from './pages/recycler/Pickups'
import RecyclerTransactions from './pages/recycler/Transactions'
import RecyclerTraceability from './pages/recycler/Traceability'
import RecyclerProfile from './pages/recycler/Profile'

function RootRedirect() {
  const { session, ready } = useAuth()
  if (!ready) return null
  if (!session) return <Navigate to="/login" replace />
  return <Navigate to={session.role === 'ADMIN' ? '/admin' : '/recycler'} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute role="ADMIN" />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/recyclers" element={<RecyclerManagement />} />
            <Route path="/admin/recyclers/:id" element={<RecyclerDetails />} />
            <Route path="/admin/collectors" element={<CollectorMonitoring />} />
            <Route path="/admin/collectors/:id" element={<CollectorDetails />} />
            <Route path="/admin/lots" element={<AdminLots />} />
            <Route path="/admin/lots/:id" element={<LotDetails backTo="/admin/lots" />} />
            <Route path="/admin/transactions" element={<AdminTransactions />} />
            <Route path="/admin/traceability" element={<AdminTraceability />} />
            <Route path="/admin/prices" element={<PriceBoard />} />
            <Route path="/admin/analytics" element={<Analytics />} />
            <Route path="/admin/activity" element={<ActivityLog />} />
            <Route path="/admin/settings" element={<Settings />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
          </Route>

          <Route element={<ProtectedRoute role="RECYCLER" />}>
            <Route path="/recycler" element={<RecyclerDashboard />} />
            <Route path="/recycler/received-lots" element={<ReceivedLots />} />
            <Route path="/recycler/active-lots" element={<ActiveLots />} />
            <Route path="/recycler/pickups" element={<Pickups />} />
            <Route path="/recycler/transactions" element={<RecyclerTransactions />} />
            <Route path="/recycler/traceability" element={<RecyclerTraceability />} />
            <Route path="/recycler/lots/:id" element={<LotDetails backTo="/recycler/received-lots" recyclerScoped />} />
            <Route path="/recycler/profile" element={<RecyclerProfile />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
