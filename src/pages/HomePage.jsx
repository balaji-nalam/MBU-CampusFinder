import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Reveal from '../components/common/Reveal'
import CampusAssistant3D from '../components/landing/CampusAssistant3D'
import mentorPhoto from '../assets/team/mentor-basi-reddy-m.jpeg'
import awardPhoto from '../assets/achievements/pbl-excellence-award.png'
import balajiPhoto from '../assets/team/balaji-kiran-santhosh.jpeg'
import chandraPhoto from '../assets/team/chandra-shakher.jpeg'
import prasanthPhoto from '../assets/team/prasanth.jpeg'
import satyaPhoto from '../assets/team/satya-sai.jpeg'
import sravanPhoto from '../assets/team/sravan.jpeg'

const backgroundVideo = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260809_012548_ef22562c-c0ae-4816-ad9d-f8922af4e6a7.mp4'
const mbuLogo = 'https://ik.imagekit.io/syustaging/SYU_PREPROD/Logo_43Bbnt4I-.webp?tr=w-3840'

function HomeLandingNav() {
  const navigate = useNavigate()
  const { currentUser, isAdmin, loading, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)
  const isVerified = Boolean(currentUser?.emailVerified)

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
    closeMenu()
  }

  return (
    <header className="landing-header">
      <Link to="/" className="landing-logo" aria-label="MBU CampusFinder home">
        <img className="landing-logo-image" src={mbuLogo} alt="MBU" />
        <span className="landing-logo-copy"><strong><span>Campus</span><span>Finder</span></strong><small>MBU LOST &amp; FOUND</small></span>
      </Link>

      <nav className={menuOpen ? 'landing-nav is-open' : 'landing-nav'} aria-label="CampusFinder navigation">
        <Link to="/" onClick={closeMenu}>Home</Link>
        <Link to="/items" onClick={closeMenu}>Find Items</Link>
        <Link to="/reports/new?type=lost" onClick={closeMenu}>Report Item</Link>
        <a href="#contact" onClick={closeMenu}>Contact</a>
        {currentUser && isVerified && <Link to="/dashboard" onClick={closeMenu}>Dashboard</Link>}
        {currentUser && isVerified && isAdmin && <Link to="/admin" onClick={closeMenu}>Admin</Link>}
        {!loading && !currentUser && <Link to="/login" className="landing-sign-in" onClick={closeMenu}>Sign In</Link>}
        {currentUser && <button type="button" className="landing-sign-in landing-nav-button" onClick={handleLogout}>Sign Out</button>}
      </nav>

      <button
        type="button"
        className={menuOpen ? 'landing-menu-button is-open' : 'landing-menu-button'}
        aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span /><span /><span />
      </button>
    </header>
  )
}

function HomePage() {
  return (
    <div className="landing-home">
      <section className="landing-hero" aria-labelledby="landing-title">
        <video className="landing-video" autoPlay muted loop playsInline preload="metadata" aria-hidden="true">
          <source src={backgroundVideo} type="video/mp4" />
        </video>
        <div className="landing-video-overlay" aria-hidden="true" />
        <HomeLandingNav />

        <div className="landing-content">
          <div className="landing-trust-row" aria-label="Built for the MBU campus">
            <span className="trust-orbit trust-orbit-green">⌁</span>
            <span className="trust-orbit trust-orbit-gold">✦</span>
            <span className="trust-orbit trust-orbit-coral">↗</span>
            <span>Built for the MBU Campus</span>
          </div>
          <p className="landing-kicker">Secure campus lost &amp; found</p>
          <h1 id="landing-title"><span>Lost Something?</span><span>Find It On Campus.</span></h1>
          <p className="landing-description">CampusFinder helps MBU students report, discover and recover lost items through one secure campus platform.</p>
          <div className="landing-actions">
            <Link to="/reports/new?type=lost" className="landing-primary-button">Report an Item <span>↗</span></Link>
            <Link to="/items" className="landing-secondary-button">Find Items <span>↗</span></Link>
          </div>
          <div className="landing-capabilities" aria-label="CampusFinder capabilities">
            <div><strong>22</strong><span>Item categories</span></div>
            <div><strong>24/7</strong><span>Report access</span></div>
            <div><strong>1</strong><span>Campus platform</span></div>
            <div><strong>100%</strong><span>Firebase secured</span></div>
          </div>
        </div>

        <div className="landing-scroll-cue" aria-hidden="true"><span /> Scroll to explore</div>
      </section>

      <section className="landing-followup" id="contact">
        <div className="landing-followup-copy">
          <p className="landing-kicker">A clearer way home</p>
          <h2>One campus. More things found.</h2>
          <p>Search approved reports, share the details that matter, and reconnect through private recovery requests.</p>
        </div>
        <div className="landing-followup-visual">
          <CampusAssistant3D />
          <Link to="/items" className="landing-followup-link">Explore campus items ↗</Link>
        </div>
      </section>

      <section className="award-section" aria-labelledby="award-title">
        <Reveal className="award-layout">
          <figure className="award-photo-frame">
            <img
              src={awardPhoto}
              alt="CampusFinder MBU Lost & Found PBL team receiving the PBL Excellence Award at Mohan Babu University"
              loading="lazy"
            />
            <figcaption>CampusFinder PBL team · Mohan Babu University</figcaption>
          </figure>

          <div className="award-copy">
            <p className="landing-kicker">PBL EXCELLENCE AWARD</p>
            <h2 id="award-title">Built for campus.<br />Recognized at MBU.</h2>
            <p className="award-brand">CampusFinder — MBU Lost &amp; Found</p>
            <p>CampusFinder — MBU Lost &amp; Found was developed as a practical PBL project focused on helping students report, discover, and recover lost belongings across campus.</p>
            <p className="award-supporting-text">Recognized for building a practical campus-focused solution that helps students reconnect with their lost belongings.</p>
            <div className="award-divider" aria-hidden="true" />
            <dl className="award-meta">
              <div><dt>MBU</dt><dd>MOHAN BABU UNIVERSITY</dd></div>
              <div><dt>PBL PROJECT</dt><dd>CAMPUSFINDER</dd></div>
              <div><dt>LOST &amp; FOUND</dt><dd>BUILT FOR THE CAMPUS COMMUNITY</dd></div>
            </dl>
          </div>
        </Reveal>
      </section>

      <section className="team-section" aria-labelledby="team-title">
        <div className="team-heading">
          <p className="landing-kicker team-kicker">The people behind the platform</p>
          <h2 id="team-title">Meet the Team Behind CampusFinder</h2>
          <p className="team-subtitle">A collaborative PBL project built for the MBU campus community.</p>
        </div>

        <article className="mentor-block">
          <div className="mentor-label">PBL Mentor</div>
          <div className="mentor-layout">
            <div className="mentor-photo-frame"><img src={mentorPhoto} alt="BASI REDDY A" /></div>
            <div className="mentor-copy">
              <h3>BASI REDDY A</h3>
              <p className="mentor-role">Assistant Professor · PBL Mentor</p>
              <p className="mentor-university">Mohan Babu University</p>
              <h4>A Message of Gratitude</h4>
              <blockquote>“With the guidance and encouragement of Basi Reddy M, our team transformed an idea into a practical campus solution. We sincerely thank him for his valuable guidance, support, and motivation throughout this project.”</blockquote>
            </div>
          </div>
        </article>

        <div className="team-heading team-members-heading">
          <p className="landing-kicker team-kicker">PROJECT TEAM</p>
          <div className="team-heading-accent" aria-hidden="true" />
        </div>

        <div className="team-grid">
          <article className="team-card">
            <div className="team-card-inner">
              <div className="team-photo-frame">
                <img className="team-photo" src={satyaPhoto} alt="Satya Sai" />
              </div>
              <h3 className="team-member-name">Satya Sai</h3>
              <p className="team-member-role">Authentication</p>
            </div>
          </article>

          <article className="team-card">
            <div className="team-card-inner">
              <div className="team-photo-frame">
                <img className="team-photo" src={prasanthPhoto} alt="Prasanth" />
              </div>
              <h3 className="team-member-name">Prashanth</h3>
              <p className="team-member-role">Lost/Found Reporting</p>
            </div>
          </article>

          <article className="team-card">
            <div className="team-card-inner">
              <div className="team-photo-frame">
                <img className="team-photo" src={balajiPhoto} alt="Balaji Kiran Santhosh" />
              </div>
              <h3 className="team-member-name">Balaji Kiran Santhosh</h3>
              <p className="team-member-role">UI &amp; Frontend</p>
            </div>
          </article>

          <article className="team-card">
            <div className="team-card-inner">
              <div className="team-photo-frame">
                <img className="team-photo" src={sravanPhoto} alt="Sravan" />
              </div>
              <h3 className="team-member-name">Sravan</h3>
              <p className="team-member-role">Admin Panel &amp; Moderation</p>
            </div>
          </article>

          <article className="team-card">
            <div className="team-card-inner">
              <div className="team-photo-frame">
                <img className="team-photo" src={chandraPhoto} alt="Chandra Shakher" />
              </div>
              <h3 className="team-member-name">Chander Shekhar</h3>
              <p className="team-member-role">Search &amp; Student Dashboard</p>
            </div>
          </article>
        </div>
      </section>
    </div>
  )
}

export default HomePage
