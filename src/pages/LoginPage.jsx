import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthForm from '../components/auth/AuthForm'
import { useAuth } from '../context/AuthContext'
import { getAuthErrorMessage } from '../utils/authErrorMessages'

const AUTH_BACKGROUND_VIDEO =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4'

const initialForm = {
  email: '',
  password: '',
}

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState(initialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    const trimmedEmail = form.email.trim().toLowerCase()

    if (!trimmedEmail) {
      setError('Email is required.')
      return
    }

    if (!form.password) {
      setError('Password is required.')
      return
    }

    setIsSubmitting(true)

    try {
      await login({ email: trimmedEmail, password: form.password })
      navigate('/dashboard', { replace: true })
    } catch (submissionError) {
      const message = submissionError?.message || getAuthErrorMessage(submissionError?.code)
      setError(message)
    } finally {
      setIsSubmitting(false)
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
          title="Login"
          subtitle="Welcome back to MBU CampusFinder."
          onSubmit={handleSubmit}
          submitLabel="Login"
          isSubmitting={isSubmitting}
          footer={
            <>
              <p>
                Need an account? <Link to="/register">Create one</Link>
              </p>
              <p>
                <Link to="/forgot-password">Forgot password?</Link>
              </p>
            </>
          }
        >
          {error && <p className="error-message">{error}</p>}

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
            />
          </label>

          <label className="form-field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </label>
        </AuthForm>
      </div>
    </div>
  )
}

export default LoginPage
