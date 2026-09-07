import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProfilePage() {
  const { currentUser, userProfile, isEmailVerified } = useAuth()

  if (!currentUser) {
    return (
      <section className="page-card">
        <p className="eyebrow">Account</p>
        <h1>Sign in to view your profile.</h1>
        <Link to="/login" className="primary-button">Go to login</Link>
      </section>
    )
  }

  const displayName = currentUser.displayName || userProfile?.fullName || 'MBU student'
  const initials = displayName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()

  return (
    <section className="page-card profile-page">
      <p className="eyebrow">Your account</p>
      <div className="profile-hero">
        <div className="profile-avatar" aria-hidden="true">{initials}</div>
        <div>
          <h1>{displayName}</h1>
          <p>Keep your account details close and your contact information private.</p>
        </div>
      </div>

      <div className="profile-grid">
        <div className="profile-detail">
          <span>Full name</span>
          <strong>{displayName}</strong>
        </div>
        <div className="profile-detail">
          <span>Email address</span>
          <strong>{currentUser.email}</strong>
        </div>
        <div className="profile-detail">
          <span>Account status</span>
          <strong className={isEmailVerified ? 'profile-status verified' : 'profile-status'}>
            {isEmailVerified ? 'Verified MBU account' : 'Email verification required'}
          </strong>
        </div>
      </div>

      <div className="profile-note">
        <strong>Privacy by design</strong>
        <p>Your email and other personal details are not shown on public item reports. Contact happens through a private request.</p>
      </div>
    </section>
  )
}

export default ProfilePage
