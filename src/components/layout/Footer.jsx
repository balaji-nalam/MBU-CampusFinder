import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const HIDDEN_FOOTER_PATHS = new Set(['/login', '/register'])

const SOCIAL_LINKS = [
  {
    platform: 'LinkedIn',
    url: 'https://www.linkedin.com/in/balaji-nalam16/',
    ariaLabel: 'Balaji Kiran Santhosh on LinkedIn',
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.64a1.66 1.66 0 0 0-1.66 1.66 1.66 1.66 0 0 0 1.66 1.66 1.66 1.66 0 0 0 1.66-1.66Z" />
      </svg>
    )
  },
  {
    platform: 'X',
    url: 'https://x.com/balaji_X16',
    ariaLabel: 'Balaji on X',
    icon: (
      <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    )
  },
  {
    platform: 'GitHub',
    url: 'https://github.com/balaji-nalam',
    ariaLabel: 'Balaji on GitHub',
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
      </svg>
    )
  },
  {
    platform: 'Instagram',
    url: 'https://www.instagram.com/_mr.champ_68/',
    ariaLabel: 'Balaji on Instagram',
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    )
  },
  {
    platform: 'Telegram',
    url: 'https://t.me/mbucampusfind',
    ariaLabel: 'MBU CampusFinder on Telegram',
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
      </svg>
    )
  }
]

function Footer() {
  const location = useLocation()
  const { currentUser, isAdmin, loading } = useAuth()

  if (currentUser || HIDDEN_FOOTER_PATHS.has(location.pathname)) {
    return null
  }

  return (
    <footer className="footer campus-footer">
      <div className="campus-footer-grid">
        {/* Brand column */}
        <section className="footer-brand" aria-labelledby="footer-brand-title">
          <img
            src="https://ik.imagekit.io/syustaging/SYU_PREPROD/Logo_43Bbnt4I-.webp?tr=w-3840"
            alt="Mohan Babu University logo"
            className="mbu-logo"
          />
          <div className="footer-product-row">
            <h2 id="footer-brand-title">CampusFinder</h2>
          </div>
          <p className="footer-subtitle">MBU Campus Lost &amp; Found Management System</p>
          <p>A secure campus platform for reporting, discovering and recovering lost and found items.</p>

          <div className="footer-connect-row">
            <span className="footer-connect-label">Connect</span>
            <div className="footer-social-icons">
              {SOCIAL_LINKS.map((item) => (
                <a
                  key={item.platform}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-btn"
                  aria-label={item.ariaLabel}
                  title={item.platform}
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Links */}
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

        {/* Platform */}
        <nav className="footer-column" aria-labelledby="footer-platform">
          <h3 id="footer-platform">Platform</h3>
          <Link to="/reports/new?type=lost">Report Lost Item</Link>
          <Link to="/reports/new?type=found">Report Found Item</Link>
          <Link to="/items">Search Lost &amp; Found</Link>
          <Link to="/#contact">Contact &amp; Recovery</Link>
          <span>Secure Moderation</span>
        </nav>

        {/* University */}
        <section className="footer-column footer-university" aria-labelledby="footer-university-title">
          <h3 id="footer-university-title">University</h3>
          <strong>Mohan Babu University</strong>
          <span>Tirupati, Andhra Pradesh</span>
        </section>
      </div>

      {/* Support Sentence + Neon Heart & Copyright */}
      <div className="campus-footer-bottom">
        <div className="footer-made-with-center">
          <span>Made with</span>{' '}
          <svg
            className="footer-neon-heart"
            viewBox="0 0 24 24"
            width="15"
            height="15"
            fill="currentColor"
            aria-label="love"
            role="img"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>{' '}
          <span>for MBU students.</span>
        </div>
        <div className="footer-bottom-sublines">
          <span className="footer-dedication-text">Built with dedication for the MBU campus community.</span>
          <span className="footer-copyright-text">© 2026 MBU CampusFinder · MBU Campus Lost &amp; Found Management System</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
