import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { approveReport, getAllAdminReports, rejectReport, removeReport } from '../services/adminService'
import { useAuth } from '../context/AuthContext'
import { getReportImageUrl, handleReportImageError } from '../assets/items'

function AdminReportsPage() {
  const { currentUser } = useAuth()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [rejectingId, setRejectingId] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const loadReports = async () => {
    try {
      const allReports = await getAllAdminReports()
      setReports(allReports)
      setError('')
    } catch (loadError) {
      setError(loadError.message || 'Unable to load pending reports.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReports()
  }, [])

  const handleApprove = async (reportId) => {
    if (!currentUser) {
      setError('You must be signed in to moderate reports.')
      return
    }

    try {
      setNotice('')
      setError('')
      await approveReport({ reportId, actorUid: currentUser.uid, adminNote: 'Approved via admin review.' })
      setNotice('Report approved successfully.')
      await loadReports()
    } catch (approveError) {
      setError(approveError.message || 'Unable to approve this report.')
    }
  }

  const handleReject = async (reportId) => {
    if (!currentUser) {
      setError('You must be signed in to moderate reports.')
      return
    }

    const trimmedReason = rejectReason.trim()
    if (!trimmedReason) {
      setError('A rejection reason is required.')
      return
    }

    try {
      setNotice('')
      setError('')
      await rejectReport({ reportId, actorUid: currentUser.uid, reason: trimmedReason })
      setRejectReason('')
      setRejectingId('')
      setNotice('Report rejected successfully.')
      await loadReports()
    } catch (rejectError) {
      setError(rejectError.message || 'Unable to reject this report.')
    }
  }

  const handleRemove = async (reportId) => {
    if (!currentUser) {
      setError('You must be signed in to moderate reports.')
      return
    }

    const confirmed = window.confirm('Remove this report from public visibility?')
    if (!confirmed) {
      return
    }

    try {
      setNotice('')
      setError('')
      await removeReport({ reportId, actorUid: currentUser.uid, reason: 'Removed by admin moderation.' })
      setNotice('Report removed successfully.')
      await loadReports()
    } catch (removeError) {
      setError(removeError.message || 'Unable to remove this report.')
    }
  }

  const visibleReports = statusFilter === 'all'
    ? reports
    : reports.filter((report) => report.status === statusFilter)

  return (
    <section className="page-card">
      <div className="admin-list-heading">
        <div>
          <p className="eyebrow">Admin workspace</p>
          <h1>Reports management</h1>
          <p className="lead">Review every report, inspect its history, and keep the campus board trustworthy.</p>
        </div>
        <label className="admin-filter">
          <span>Filter reports</span>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="resolved">Resolved</option>
            <option value="removed">Removed</option>
          </select>
        </label>
      </div>
      {loading && <p className="info-message">Loading reports...</p>}
      {error && <p className="error-message">{error}</p>}
      {notice && <p className="success-message">{notice}</p>}

      {!loading && visibleReports.length === 0 && (
        <div className="empty-state">
          <h2>No reports found.</h2>
          <p>There are no reports matching this status.</p>
        </div>
      )}

      {!loading && visibleReports.length > 0 && (
        <div className="admin-report-list">
          {visibleReports.map((report) => (
            <article key={report.id} className="admin-report-row">
              <img
                src={report.imageUrl || getReportImageUrl(report)}
                alt={report.itemName}
                className="admin-report-thumb"
                loading="lazy"
                onError={(event) => handleReportImageError(event, report.itemCategory)}
              />

              <div className="admin-report-content">
                <div className="admin-report-topline">
                  <div className="report-type-row">
                  <span className={`status-pill type-pill ${report.type === 'lost' ? 'lost' : 'found'}`}>
                    {report.type === 'lost' ? 'Lost' : 'Found'}
                  </span>
                    <span className={`status-pill status-pill-${report.status}`}>{report.status}</span>
                  </div>
                  <span className="admin-report-date">{report.createdAt?.toDate ? report.createdAt.toDate().toLocaleDateString() : 'Unknown'}</span>
                </div>

                <h2>{report.itemName || report.title}</h2>
                <div className="admin-report-facts">
                  <span>{report.title}</span>
                  <span>{report.itemLocation || 'Location not set'}</span>
                  <span>{report.reporter?.fullName || 'Reporter profile unavailable'}</span>
                  <span>{report.reporter?.email || 'Email unavailable'}</span>
                  <span>{report.visibility || 'private'}</span>
                </div>

                <div className="admin-report-actions">
                  <Link to={`/admin/reports/${report.id}`} className="secondary-button">View details</Link>
                  {report.status === 'pending' && <>
                    <button type="button" className="primary-button" onClick={() => handleApprove(report.id)}>Approve</button>
                    <button type="button" className="secondary-button" onClick={() => setRejectingId(report.id)}>Reject</button>
                  </>}
                  {report.status === 'approved' && <button type="button" className="danger-button" onClick={() => handleRemove(report.id)}>Remove</button>}
                </div>

                {rejectingId === report.id && (
                  <div style={{ marginTop: '1rem' }}>
                    <label className="form-field">
                      <span>Rejection reason</span>
                      <textarea
                        rows="3"
                        value={rejectReason}
                        onChange={(event) => setRejectReason(event.target.value)}
                        placeholder="Reason for rejection"
                      />
                    </label>
                    <div className="auth-actions">
                      <button type="button" className="primary-button" onClick={() => handleReject(report.id)}>Submit rejection</button>
                      <button type="button" className="secondary-button" onClick={() => setRejectingId('')}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default AdminReportsPage
