import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { initSampleData } from './services/initData'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { TenderDetailPage } from './pages/TenderDetailPage'
import { PublishPage } from './pages/PublishPage'
import { BidPage } from './pages/BidPage'
import { OwnerDashboard } from './pages/OwnerDashboard'
import { BidderDashboard } from './pages/BidderDashboard'
import { ROLES } from './utils/constants'

initSampleData()

function ProtectedRoute({ user, allowedRoles, children }) {
  if (!user) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

function App() {
  const { user, loading, login, register, logout } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        加载中…
      </div>
    )
  }

  return (
    <Layout user={user} logout={logout}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tender/:id" element={<TenderDetailPage user={user} />} />
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage login={login} />} />
        <Route path="/register" element={user ? <Navigate to="/" replace /> : <RegisterPage register={register} />} />
        <Route path="/publish" element={
          <ProtectedRoute user={user} allowedRoles={[ROLES.OWNER]}>
            <PublishPage user={user} />
          </ProtectedRoute>
        } />
        <Route path="/bid/:id" element={
          <ProtectedRoute user={user} allowedRoles={[ROLES.BIDDER]}>
            <BidPage user={user} />
          </ProtectedRoute>
        } />
        <Route path="/owner-dashboard" element={
          <ProtectedRoute user={user} allowedRoles={[ROLES.OWNER]}>
            <OwnerDashboard user={user} />
          </ProtectedRoute>
        } />
        <Route path="/bidder-dashboard" element={
          <ProtectedRoute user={user} allowedRoles={[ROLES.BIDDER]}>
            <BidderDashboard user={user} />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default App
