import { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const mbuLogo = 'https://ik.imagekit.io/syustaging/SYU_PREPROD/Logo_43Bbnt4I-.webp?tr=w-3840'

function isNavActive(item, pathname, search) {
  if (item.to.includes('?')) {
    return pathname + search === item.to
  }

  if (item.to === '/') {
    return pathname === '/'
  }

  return pathname === item.to || pathname.startsWith(`${item.to}/`)
}

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser, logout, loading, isAdmin } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const navItems = [
    { to: '/', label: 'Home' },
    { to: '/items', label: 'Find items' },
    { to: '/dashboard', label: 'Dashboard', authRequired: true },
    { to: '/profile', label: 'Profile', authRequired: true },
    { to: '/reports/new?type=lost', label: 'Report lost', authRequired: true, verifiedRequired: true, action: true },
    { to: '/reports/new?type=found', label: 'Report found', authRequired: true, verifiedRequired: true, action: true },
    { to: '/admin', label: 'Admin', authRequired: true, verifiedRequired: true, adminOnly: true },
    { to: '/login', label: 'Login', publicOnly: true },
  ]

  const visibleItems = navItems.filter((item) => {
    if (loading) return false
    if (item.publicOnly) return !currentUser
    if (!item.authRequired) return true
    if (!currentUser) return false
    if (item.verifiedRequired && !currentUser.emailVerified) return false
    if (item.adminOnly && !isAdmin) return false
    return true
  })

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname, location.search])

  useEffect(() => {
    if (!menuOpen) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className={`topbar ${location.pathname === '/' ? 'topbar-home' : ''}`}>
      <div className="container nav-wrap">
        <NavLink to="/" className="brand" aria-label="MBU CampusFinder home" end>
          <img className="brand-logo" src={mbuLogo} alt="MBU" />
          <span className="brand-label">
            <strong>MBU CampusFinder</strong>
            <small>Find it. Report it. Return it.</small>
          </span>
        </NavLink>

        <button
          type="button"
          className={menuOpen ? 'nav-menu-button is-open' : 'nav-menu-button'}
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="app-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav id="app-navigation" className={menuOpen ? 'nav is-open' : 'nav'} aria-label="Main navigation">
          {visibleItems.map((item) => {
            const active = isNavActive(item, location.pathname, location.search)
            const classes = [
              'nav-link',
              item.action ? 'nav-link-action' : '',
              active ? 'nav-link-active' : '',
            ].filter(Boolean).join(' ')

            return (
              <NavLink key={item.to} to={item.to} className={classes} end={item.to === '/'}>
                {item.label}
              </NavLink>
            )
          })}

          {currentUser && (
            <button type="button" className="nav-link nav-button nav-link-logout" onClick={handleLogout}>
              Log out
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Navbar
