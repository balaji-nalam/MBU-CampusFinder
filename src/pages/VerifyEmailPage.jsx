import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function VerifyEmailPage() {
  const { currentUser, loading, resendVerificationEmail, refreshUser, logout, isEmailVerified } = useAuth()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  if (loading) {
    return (
      <section className="page-card">
        <h1>Verifying session</h1>
        <p>Please wait while we check your account.</p>
      </section>
    )
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  if (isEmailVerified) {
    return <Navigate to="/dashboard" replace />
  }

  const handleResend = async () => {
    setError('')
    setMessage('')
    setIsSubmitting(true)

    try {
      await resendVerificationEmail()
      setMessage('A new verification email has been sent.')
    } catch (submissionError) {
      setError(submissionError.message || 'Unable to send the verification email right now.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRefresh = async () => {
    setError('')
    setMessage('')
    setIsSubmitting(true)

    try {
      const refreshedUser = await refreshUser()

      if (refreshedUser?.emailVerified) {
        setMessage('Your email has been verified successfully.')
        navigate('/dashboard', { replace: true })
        return
      }

      setMessage('Your email is still unverified. Please check your inbox and try again.')
    } catch (submissionError) {
      setError(submissionError.message || 'Unable to refresh your verification status.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <section className="page-card auth-card">
      <h1>Verify your email</h1>
      <p>
        We sent a verification email to <strong>{currentUser.email}</strong>.
      </p>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}

      <div className="auth-actions">
        <button className="primary-button" type="button" onClick={handleResend} disabled={isSubmitting}>
          {isSubmitting ? 'Sending...' : 'Resend verification email'}
        </button>

        <button className="secondary-button" type="button" onClick={handleRefresh} disabled={isSubmitting}>
          Refresh verification status
        </button>
      </div>

      <div className="auth-footer">
        <button type="button" className="text-button" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </section>
  )
}

export default VerifyEmailPage
