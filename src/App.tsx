import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import EventDashboardPage from './pages/EventDashboardPage'
import DashboardSwitcher from './components/DashboardSwitcher'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/event" element={<EventDashboardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <DashboardSwitcher />
    </BrowserRouter>
  )
}
