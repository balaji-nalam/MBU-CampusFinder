import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdminReportStats } from '../services/adminService'

function StatCard({ label, value }) {
  return (
    <div className="summary-card">
      <p>{label}</p>
      <h3>{value}</h3>
    </div>
  )
}

function AdminPage() {
  const [stats, setStats] = useState({
    totalReports: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    resolved: 0,
    removed: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getAdminReportStats()
        setStats(data)
      } catch (loadError) {
        setError(loadError.message || 'Unable to load admin stats.')
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  return (
    <section className="page-card">
      <h1>Admin Dashboard</h1>
      <p>Moderation overview from live Firestore data.</p>

      {loading && <p className="info-message">Loading moderation stats...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (
        <div className="summary-grid">
          <StatCard label="Total Reports" value={stats.totalReports} />
          <StatCard label="Pending" value={stats.pending} />
          <StatCard label="Approved" value={stats.approved} />
          <StatCard label="Rejected" value={stats.rejected} />
          <StatCard label="Resolved" value={stats.resolved} />
          <StatCard label="Removed" value={stats.removed} />
        </div>
      )}

      <div className="auth-actions" style={{ marginTop: '1.5rem' }}>
        <Link to="/admin/reports" className="primary-button">Open moderation queue</Link>
      </div>
    </section>
  )
}

export default AdminPage
