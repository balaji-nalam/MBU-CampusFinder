import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const HIDDEN_FOOTER_PATHS = new Set(['/login', '/register'])

function Footer() {
  const location = useLocation()
  const { currentUser, isAdmin, loading } = useAuth()

  if (currentUser || HIDDEN_FOOTER_PATHS.has(location.pathname)) {
    return null
  }

  return (
    <footer className="footer campus-footer">
      <div className="campus-footer-grid">
        <section className="footer-brand" aria-labelledby="footer-brand-title">
          <img src="https://ik.imagekit.io/syustaging/SYU_PREPROD/Logo_43Bbnt4I-.webp?tr=w-3840" alt="Mohan Babu University logo" className="mbu-logo" />
          <div className="footer-product-row">
            <h2 id="footer-brand-title">CampusFinder</h2>
          </div>
          <p className="footer-subtitle">MBU Campus Lost &amp; Found Management System</p>
          <p>A secure campus platform for reporting, discovering and recovering lost and found items.</p>
        </section>

        <nav className="footer-column" aria-labelledby="footer-quick-links">
          <h3 id="footer-quick-links">Quick Links</h3>
          <Link to="/">Home</Link>
          <Link to="/items">Find Items</Link>
          <Link to="/reports/new?type=lost">Report Item</Link>
          <Link to="/#contact">Contact</Link>
          {!loading && !currentUser && <Link to="/login">Sign In</Link>}
          {currentUser && <Link to="/dashboard">Dashboard</Link>}
          {currentUser && isAdmin && <Link to="/admin">Admin</Link>}
        </nav>

        <nav className="footer-column" aria-labelledby="footer-platform">
          <h3 id="footer-platform">Platform</h3>
          <Link to="/reports/new?type=lost">Report Lost Item</Link>
          <Link to="/reports/new?type=found">Report Found Item</Link>
          <Link to="/items">Search Lost &amp; Found</Link>
          <Link to="/#contact">Contact &amp; Recovery</Link>
          <span>Secure Moderation</span>
        </nav>

        <section className="footer-column footer-university" aria-labelledby="footer-university-title">
          <h3 id="footer-university-title">University</h3>
          <strong>Mohan Babu University</strong>
          <span>Tirupati, Andhra Pradesh</span>
        </section>
      </div>
      <div className="campus-footer-bottom">
        <span>© 2026 CampusFinder · Mohan Babu University</span>
        <span>Built for MBU Campus</span>
      </div>
    </footer>
  )
}

export default Footer
