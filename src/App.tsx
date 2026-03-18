import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import AuthGuard from './components/AuthGuard'
import AuthCallback from './components/AuthCallback'
import EventDashboardPage from './pages/EventDashboardPage'
import DashboardSwitcher from './components/DashboardSwitcher'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route
          path="/"
          element={
            <AuthGuard>
              <DashboardPage />
            </AuthGuard>
          }
        />
        <Route
          path="/event"
          element={
            <AuthGuard>
              <EventDashboardPage />
            </AuthGuard>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <DashboardSwitcher />
    </BrowserRouter>
  )
}
