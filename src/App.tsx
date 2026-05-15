import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/hooks/useAuth'
import Navbar from '@/components/layout/Navbar'
import HomePage from '@/pages/HomePage'
import PlayPage from '@/pages/PlayPage'
import DailyPage from '@/pages/DailyPage'
import LeaderboardPage from '@/pages/LeaderboardPage'
import ProfilePage from '@/pages/ProfilePage'
import ProPage from '@/pages/ProPage'
import LoginPage from '@/pages/LoginPage'
import ModesPage from '@/pages/ModesPage'
import RushPage from '@/pages/RushPage'
import RankedGamePage from '@/pages/RankedGamePage'
import LevelsPage from '@/pages/LevelsPage'
import CampaignGamePage from '@/pages/CampaignGamePage'
import UsernameSetupModal from '@/components/auth/UsernameSetupModal'

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Not logged in — only landing + login
  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    )
  }

  // Logged in — full dashboard
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/modes" replace />} />
      <Route path="/modes" element={<ModesPage />} />
      <Route path="/play" element={<PlayPage />} />
      <Route path="/daily" element={<DailyPage />} />
      <Route path="/ranked" element={<RankedGamePage />} />
      <Route path="/leaderboard" element={<LeaderboardPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/pro" element={<ProPage />} />
      <Route path="/rush" element={<RushPage />} />
      <Route path="/levels" element={<LevelsPage />} />
      <Route path="/campaign/:level" element={<CampaignGamePage />} />
      <Route path="/login" element={<Navigate to="/modes" replace />} />
      <Route path="*" element={<Navigate to="/modes" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen text-foreground">
          <Navbar />
          <AppRoutes />
        </div>
      </BrowserRouter>
      <UsernameSetupModal />
    </AuthProvider>
  )
}
