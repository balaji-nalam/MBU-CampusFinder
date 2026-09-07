import { Routes, Route } from 'react-router-dom'
import AuthStatusBanner from './components/auth/AuthStatusBanner'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import { PublicRoute, AuthenticatedRoute, VerifiedRoute, AdminRoute } from './guards/RouteGuards'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import DashboardPage from './pages/DashboardPage'
import ReportCreatePage from './pages/ReportCreatePage'
import ReportEditPage from './pages/ReportEditPage'
import ReportDetailsPage from './pages/ReportDetailsPage'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/AdminPage'
import AdminReportsPage from './pages/AdminReportsPage'
import AdminReportDetailsPage from './pages/AdminReportDetailsPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import DiscoveryPage from './pages/DiscoveryPage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="page-shell">
        <AuthStatusBanner />
        <Routes>
          <Route path="/" element={<PublicRoute><HomePage /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
          <Route path="/verify-email" element={<AuthenticatedRoute><VerifyEmailPage /></AuthenticatedRoute>} />
          <Route path="/dashboard" element={<AuthenticatedRoute><DashboardPage /></AuthenticatedRoute>} />
          <Route path="/items" element={<AuthenticatedRoute><DiscoveryPage /></AuthenticatedRoute>} />
          <Route path="/reports/new" element={<VerifiedRoute><ReportCreatePage /></VerifiedRoute>} />
          <Route path="/reports/:id" element={<ReportDetailsPage />} />
          <Route path="/reports/:id/edit" element={<AuthenticatedRoute><ReportEditPage /></AuthenticatedRoute>} />
          <Route path="/profile" element={<AuthenticatedRoute><ProfilePage /></AuthenticatedRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
          <Route path="/admin/reports" element={<AdminRoute><AdminReportsPage /></AdminRoute>} />
          <Route path="/admin/reports/:id" element={<AdminRoute><AdminReportDetailsPage /></AdminRoute>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
