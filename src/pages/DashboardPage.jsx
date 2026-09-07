import { useEffect, useMemo, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { Link, useNavigate } from 'react-router-dom'
import DashboardSummary from '../components/dashboard/DashboardSummary'
import ReportCard from '../components/reports/ReportCard'
import CategoryGrid from '../components/reports/CategoryGrid'
import { useAuth } from '../context/AuthContext'
import { db } from '../api/firebase'
import { getContactRequestsForUser, updateContactRequestStatus } from '../services/contactService'

function DashboardPage() {
  const { currentUser, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [reports, setReports] = useState([])
  const [contactRequests, setContactRequests] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (authLoading) {
      return undefined
    }

    if (!currentUser) {
      setLoading(false)
      return undefined
    }

    const reportsQuery = query(
      collection(db, 'reports'),
      where('reportedByUid', '==', currentUser.uid),
    )

    const unsubscribe = onSnapshot(
      reportsQuery,
      async (snapshot) => {
        const items = snapshot.docs
          .map((docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() }))
          .sort((a, b) => {
            const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0
            const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0
            return bTime - aTime
          })
        setReports(items)

        try {
          const requests = await getContactRequestsForUser(currentUser.uid)
          setContactRequests(requests)
          setError('')
        } catch (requestError) {
          setError(requestError.message || 'Unable to load your contact requests.')
        } finally {
          setLoading(false)
        }
      },
      (queryError) => {
        setError(queryError.message || 'Unable to load your reports.')
        setLoading(false)
      },
    )

    return unsubscribe
  }, [authLoading, currentUser])

  const visibleReports = useMemo(() => {
    if (statusFilter === 'all') return reports
    return reports.filter((report) => report.status === statusFilter)
  }, [reports, statusFilter])

  const lostReports = useMemo(
    () => visibleReports.filter((report) => report.type === 'lost'),
    [visibleReports],
  )

  const foundReports = useMemo(
    () => visibleReports.filter((report) => report.type === 'found'),
    [visibleReports],
  )

  const filterLabel = {
    all: 'all reports',
    pending: 'pending reports',
    approved: 'approved reports',
    resolved: 'resolved reports',
  }[statusFilter]

  if (!currentUser) {
    return (
      <section className="page-card">
        <h1>Access denied</h1>
        <p>Please sign in to view your dashboard.</p>
      </section>
    )
  }

  return (
    <section className="page-card">
      <div className="dashboard-intro">
        <h1>My Dashboard</h1>
        <p>Welcome back, {currentUser.displayName || currentUser.email}.</p>
      </div>

      {loading && <p className="info-message">Loading your reports...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (
        <DashboardSummary
          reports={reports}
          activeFilter={statusFilter}
          onFilterChange={setStatusFilter}
        />
      )}

      {!loading && !error && (
        <div className="dashboard-section">
          <h2>Item categories</h2>
          <p className="dashboard-filter-note">Choose a category to browse matching campus reports.</p>
          <CategoryGrid
            onSelect={(category) => navigate(`/items?category=${encodeURIComponent(category)}`)}
          />
        </div>
      )}

      {!loading && !error && reports.length === 0 && (
        <div className="empty-state">
          <h2>You haven&apos;t reported any items yet.</h2>
          <div className="auth-actions">
            <Link to="/reports/new" className="primary-button">Report Lost Item</Link>
            <Link to="/reports/new" className="secondary-button">Report Found Item</Link>
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="dashboard-section">
          <h2>My Contact Requests</h2>
          {contactRequests.length > 0 ? (
            <div className="report-grid">
              {contactRequests.map((request) => (
                <article key={request.id} className="report-card contact-card">
                  <div className="report-card-body">
                    <p className="report-meta">Status: {request.status}</p>
                    <p className="report-meta">Report: {request.reportId}</p>
                    <p className="report-meta">Message: {request.message}</p>
                    {request.ownerUid === currentUser.uid ? (
                      <p className="report-meta">This request is for one of your reports.</p>
                    ) : (
                      <p className="report-meta">Request sent to the report owner.</p>
                    )}
                    {request.status === 'pending' && request.ownerUid === currentUser.uid && (
                      <div className="auth-actions">
                        <button
                          type="button"
                          className="primary-button"
                          onClick={async () => {
                            await updateContactRequestStatus({ requestId: request.id, actorUid: currentUser.uid, status: 'accepted' })
                            setContactRequests(await getContactRequestsForUser(currentUser.uid))
                          }}
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={async () => {
                            await updateContactRequestStatus({ requestId: request.id, actorUid: currentUser.uid, status: 'declined' })
                            setContactRequests(await getContactRequestsForUser(currentUser.uid))
                          }}
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state empty-state-quiet">
              <h2>No contact requests yet</h2>
              <p>When someone reaches out about an item, it will show up here.</p>
            </div>
          )}
        </div>
      )}

      {!loading && !error && reports.length > 0 && (
        <>
          <div className="dashboard-section">
            <h2>My Lost Items</h2>
            {statusFilter !== 'all' && (
              <p className="dashboard-filter-note">Showing {filterLabel}.</p>
            )}
            {lostReports.length > 0 ? (
              <div className="report-grid">
                {lostReports.map((report) => (
                  <ReportCard key={report.id} report={report} />
                ))}
              </div>
            ) : (
              <p>No lost item reports yet.</p>
            )}
          </div>

          <div className="dashboard-section">
            <h2>My Found Items</h2>
            {foundReports.length > 0 ? (
              <div className="report-grid">
                {foundReports.map((report) => (
                  <ReportCard key={report.id} report={report} />
                ))}
              </div>
            ) : (
              <p>No found item reports yet.</p>
            )}
          </div>
        </>
      )}
    </section>
  )
}

export default DashboardPage
