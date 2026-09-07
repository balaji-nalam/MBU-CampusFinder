import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthForm from '../components/auth/AuthForm'
import GoogleSignInButton from '../components/auth/GoogleSignInButton'
import { useAuth } from '../context/AuthContext'
import { getAuthErrorMessage } from '../utils/authErrorMessages'

const AUTH_BACKGROUND_VIDEO =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4'

const initialForm = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
}

function RegisterPage() {
  const navigate = useNavigate()
  const { register, loginWithGoogle } = useAuth()
  const [form, setForm] = useState(initialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    const trimmedName = form.fullName.trim()
    const trimmedEmail = form.email.trim().toLowerCase()

    if (!trimmedName) {
      setError('Full name is required.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address.')
      return
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)

    try {
      await register({
        fullName: trimmedName,
        email: trimmedEmail,
        password: form.password,
      })

      navigate('/verify-email', { replace: true })
    } catch (submissionError) {
      const message = submissionError?.code
        ? getAuthErrorMessage(submissionError.code)
        : submissionError?.message || 'Registration failed. Please try again.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignIn = async () => {
    if (isSubmitting || isGoogleSubmitting) return
    setError('')
    setIsGoogleSubmitting(true)

    try {
      await loginWithGoogle()
      navigate('/dashboard', { replace: true })
    } catch (googleError) {
      console.error('Google sign-in error:', googleError)
      const message = googleError?.code
        ? getAuthErrorMessage(googleError.code)
        : googleError?.message || 'Google sign-in could not be completed. Please try again.'
      setError(message)
    } finally {
      setIsGoogleSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <video
        className="auth-background-video"
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
        tabIndex="-1"
      >
        <source src="/auth-bg.mp4" type="video/mp4" />
        <source src={AUTH_BACKGROUND_VIDEO} type="video/mp4" />
      </video>
      <div className="auth-background-overlay" aria-hidden="true" />
      <div className="auth-background-content">
        <AuthForm
          title="Create account"
          subtitle="Register with your email to get started."
          onSubmit={handleSubmit}
          submitLabel="Create account"
          isSubmitting={isSubmitting || isGoogleSubmitting}
          extraContent={
            <>
              <div className="auth-divider">
                <span>or</span>
              </div>
              <GoogleSignInButton
                onClick={handleGoogleSignIn}
                isLoading={isGoogleSubmitting}
                disabled={isSubmitting || isGoogleSubmitting}
              />
            </>
          }
          footer={
            <p>
              Already have an account? <Link to="/login">Login</Link>
            </p>
          }
        >
          {error && <p className="error-message">{error}</p>}

          <label className="form-field">
            <span>Full name</span>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Full name"
              autoComplete="name"
              required
              disabled={isSubmitting || isGoogleSubmitting}
            />
          </label>

          <label className="form-field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              required
              disabled={isSubmitting || isGoogleSubmitting}
            />
          </label>

          <label className="form-field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              autoComplete="new-password"
              required
              disabled={isSubmitting || isGoogleSubmitting}
            />
          </label>

          <label className="form-field">
            <span>Confirm password</span>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat your password"
              autoComplete="new-password"
              required
              disabled={isSubmitting || isGoogleSubmitting}
            />
          </label>
        </AuthForm>
      </div>
    </div>
  )
}

export default RegisterPage
