import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getReportImageUrl, handleReportImageError } from '../assets/items'
import { getReportById } from '../services/reportService'
import { createContactRequest, getContactRequestsForReport, resolveReportFromContact, updateContactRequestStatus } from '../services/contactService'

function ReportDetailsPage() {
  const { id } = useParams()
  const { currentUser } = useAuth()
  const [report, setReport] = useState(null)
  const [contactRequests, setContactRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionError, setActionError] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [requestMessage, setRequestMessage] = useState('')
  const [showContactForm, setShowContactForm] = useState(false)

  const loadReport = async () => {
    try {
      const result = await getReportById(id)
      setReport(result)
      if (result && currentUser?.uid === result.reportedByUid) {
        const requests = await getContactRequestsForReport(result.id)
        setContactRequests(requests)
      }
    } catch (error) {
      console.error('Failed to load report:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReport()
  }, [currentUser, id])

  const isOwner = currentUser && report?.reportedByUid === currentUser.uid
  const isPublicApproved = report?.status === 'approved' && report?.visibility === 'public'

  const handleMarkResolved = async () => {
    if (!report || !currentUser || report.reportedByUid !== currentUser.uid) {
      setActionError('You can only update your own reports.')
      return
    }

    setIsUpdating(true)
    setActionError('')

    try {
      await resolveReportFromContact({ reportId: report.id, actorUid: currentUser.uid })
      await loadReport()
    } catch (error) {
      setActionError(error.message || 'Unable to update this report.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleContactRequest = async (event) => {
    event.preventDefault()
    if (!currentUser) {
      setActionError('Please sign in to contact the reporter.')
      return
    }

    try {
      setActionError('')
      setIsUpdating(true)
      await createContactRequest({
        reportId: report.id,
        requesterUid: currentUser.uid,
        message: requestMessage,
      })
      setRequestMessage('')
      setShowContactForm(false)
      setActionError('')
      await loadReport()
    } catch (error) {
      setActionError(error.message || 'Unable to create this contact request.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUpdateRequestStatus = async (requestId, status) => {
    if (!currentUser || !report) {
      return
    }

    try {
      setActionError('')
      setIsUpdating(true)
      await updateContactRequestStatus({ requestId, actorUid: currentUser.uid, status })
      if (status === 'accepted') {
        await resolveReportFromContact({ reportId: report.id, actorUid: currentUser.uid })
      }
      await loadReport()
    } catch (error) {
      setActionError(error.message || 'Unable to update this contact request.')
    } finally {
      setIsUpdating(false)
    }
  }

  if (loading) {
    return (
      <section className="page-card">
        <h1>Loading report</h1>
        <p>Please wait while your report loads.</p>
      </section>
    )
  }

  if (!report) {
    return (
      <section className="page-card">
        <h1>Report not found</h1>
        <p>The report you requested does not exist or is no longer available.</p>
      </section>
    )
  }

  return (
    <section className="page-card">
      <h1>{report.title}</h1>
      <img
        src={getReportImageUrl(report)}
        alt={report.itemName}
        className="report-detail-image"
        onError={(event) => handleReportImageError(event, report.itemCategory)}
      />

      <div className="report-detail-grid">
        <p><strong>Type:</strong> {report.type}</p>
        <p><strong>Item:</strong> {report.itemName}</p>
        <p><strong>Category:</strong> {report.itemCategory}</p>
        <p><strong>Status:</strong> {report.status}</p>
        <p><strong>Location:</strong> {report.itemLocation}</p>
        <p><strong>Campus zone:</strong> {report.campusZone}</p>
        <p><strong>Date:</strong> {report.lastSeenDate || report.foundDate || 'Not specified'}</p>
        <p><strong>Contact preference:</strong> {report.contactPreference}</p>
      </div>

      <div className="report-detail-section">
        <h2>Description</h2>
        <p>{report.description}</p>
      </div>

      {report.additionalInfo && (
        <div className="report-detail-section">
          <h2>Additional information</h2>
          <p>{report.additionalInfo}</p>
        </div>
      )}

      {!isOwner && currentUser && isPublicApproved && (
        <div className="report-detail-section">
          <h2>Contact reporter</h2>
          {!showContactForm ? (
            <button type="button" className="primary-button" onClick={() => setShowContactForm(true)}>
              Contact Reporter
            </button>
          ) : (
            <form onSubmit={handleContactRequest}>
              <label className="form-field">
                <span>Message</span>
                <textarea
                  rows="4"
                  value={requestMessage}
                  onChange={(event) => setRequestMessage(event.target.value)}
                  placeholder="I believe this may be my wallet. The wallet has my college ID inside it."
                  required
                />
              </label>
              <div className="auth-actions">
                <button type="submit" className="primary-button" disabled={isUpdating}>Submit request</button>
                <button type="button" className="secondary-button" onClick={() => setShowContactForm(false)}>Cancel</button>
              </div>
            </form>
          )}
        </div>
      )}

      {isOwner && (
        <div className="report-detail-section">
          <h2>Contact Requests</h2>
          {contactRequests.length === 0 ? (
            <p>No contact requests yet for this report.</p>
          ) : (
            contactRequests.map((request) => (
              <div key={request.id} className="report-card" style={{ marginBottom: '1rem' }}>
                <div className="report-card-body">
                  <p className="report-meta">From: {request.requesterUid}</p>
                  <p className="report-meta">Status: {request.status}</p>
                  <p className="report-meta">Message: {request.message}</p>
                  {request.status === 'pending' && (
                    <div className="auth-actions">
                      <button type="button" className="primary-button" onClick={() => handleUpdateRequestStatus(request.id, 'accepted')} disabled={isUpdating}>Accept</button>
                      <button type="button" className="secondary-button" onClick={() => handleUpdateRequestStatus(request.id, 'declined')} disabled={isUpdating}>Decline</button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {isOwner && (
        <div className="action-row">
          <Link to={`/reports/${report.id}/edit`} className="secondary-button">Edit</Link>
          {report.status === 'approved' && (
            <button type="button" className="primary-button" onClick={handleMarkResolved} disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Mark as Resolved'}
            </button>
          )}
        </div>
      )}

      {actionError && <p className="error-message">{actionError}</p>}
      {isOwner && <p className="success-message">This is your report and can only be managed by you.</p>}
    </section>
  )
}

export default ReportDetailsPage
