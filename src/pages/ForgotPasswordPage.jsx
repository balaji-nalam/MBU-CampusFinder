import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthForm from '../components/auth/AuthForm'
import { useAuth } from '../context/AuthContext'
import { getAuthErrorMessage } from '../utils/authErrorMessages'

function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    const trimmedEmail = email.trim().toLowerCase()

    if (!trimmedEmail) {
      setError('Please enter your email address.')
      return
    }

    setIsSubmitting(true)

    try {
      await resetPassword(trimmedEmail)
      setSuccess('A password reset email has been sent. Please check your inbox.')
      setEmail('')
    } catch (submissionError) {
      setError(submissionError?.message || getAuthErrorMessage(submissionError?.code))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthForm
      title="Reset password"
      subtitle="Enter your email to receive a password reset link."
      onSubmit={handleSubmit}
      submitLabel="Send reset link"
      isSubmitting={isSubmitting}
      footer={
        <p>
          <Link to="/login">Back to login</Link>
        </p>
      }
    >
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      <label className="form-field">
        <span>Email</span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
      </label>
    </AuthForm>
  )
}

export default ForgotPasswordPage
