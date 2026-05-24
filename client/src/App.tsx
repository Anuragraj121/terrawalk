import { BrowserRouter, Routes, Route } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import MapScreen from './screens/MapScreen'
import FeedScreen from './screens/FeedScreen'
import LeaderboardScreen from './screens/LeaderboardScreen'
import ProfileScreen from './screens/ProfileScreen'
import AuthScreen from './screens/AuthScreen'
import { useAuthStore } from './stores/authStore'

export default function App() {
  const { token } = useAuthStore()

  if (!token) return <AuthScreen />

  return (
    <BrowserRouter>
      <div className="h-full">
        <Routes>
          <Route path="/" element={<MapScreen />} />
          <Route path="/feed" element={<FeedScreen />} />
          <Route path="/leaderboard" element={<LeaderboardScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  )
}
