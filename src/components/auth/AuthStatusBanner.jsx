import { useAuth } from '../../context/AuthContext'

function AuthStatusBanner() {
  const { currentUser } = useAuth()

  if (!currentUser || currentUser.emailVerified) {
    return null
  }

  return (
    <div className="page-card" style={{ marginBottom: '1rem', borderColor: '#f59e0b' }}>
      <h2 style={{ marginBottom: '0.5rem' }}>Verify your email</h2>
      <p style={{ marginBottom: 0 }}>
        Please verify your email address to access full CampusFinder features.
      </p>
    </div>
  )
}

export default AuthStatusBanner
