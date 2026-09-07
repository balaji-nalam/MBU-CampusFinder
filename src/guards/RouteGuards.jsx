import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function LoadingScreen() {
  return (
    <section className="page-card">
      <h1>Loading</h1>
      <p>Please wait while we load your session.</p>
    </section>
  )
}

export function PublicRoute({ children }) {
  const { currentUser, loading, isEmailVerified } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  if (currentUser) {
    return <Navigate to={isEmailVerified ? '/dashboard' : '/verify-email'} replace />
  }

  return children
}

export function AuthenticatedRoute({ children }) {
  const { currentUser, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  return children
}

export function VerifiedRoute({ children }) {
  const { currentUser, loading, isEmailVerified } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  if (!isEmailVerified) {
    return <Navigate to="/verify-email" replace />
  }

  return children
}

export function AdminRoute({ children }) {
  const { currentUser, loading, isAdmin, isEmailVerified } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  if (!isEmailVerified) {
    return <Navigate to="/verify-email" replace />
  }

  if (!isAdmin) {
    return (
      <section className="page-card">
        <h1>Access denied</h1>
        <p>You do not have permission to access this page.</p>
      </section>
    )
  }

  return children
}
