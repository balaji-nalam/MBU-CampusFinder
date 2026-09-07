import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getReportImageUrl, handleReportImageError } from '../assets/items'
import {
  approveReport,
  getAdminReportDetails,
  removeReport,
  rejectReport,
} from '../services/adminService'
import { getContactRequestsForReport, resolveReportFromContact } from '../services/contactService'

function formatDate(value) {
  if (!value) return 'Not recorded'
  const date = typeof value?.toDate === 'function' ? value.toDate() : new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString()
}

function DetailRow({ label, value }) {
  return (
    <div className="admin-detail-row">
      <dt>{label}</dt>
      <dd>{value || 'Not recorded'}</dd>
    </div>
  )
}

function StatusBadge({ status }) {
  return <span className={`status-pill status-pill-${status}`}>{status}</span>
}

function ConfirmDialog({ dialog, isUpdating, onCancel, onConfirm }) {
  if (!dialog) return null

  return (
    <div className="admin-dialog-backdrop" role="presentation">
      <section className="admin-dialog" role="dialog" aria-modal="true" aria-labelledby="admin-dialog-title">
        <p className="eyebrow">Confirm action</p>
        <h2 id="admin-dialog-title">{dialog.title}</h2>
        <p>{dialog.message}</p>
        <div className="admin-dialog-actions">
          <button type="button" className="secondary-button" onClick={onCancel} disabled={isUpdating}>Cancel</button>
          <button type="button" className={dialog.danger ? 'danger-button' : 'primary-button'} onClick={onConfirm} disabled={isUpdating}>
            {isUpdating ? 'Working...' : dialog.confirmLabel}
          </button>
        </div>
      </section>
    </div>
  )
}

function AdminReportDetailsPage() {
  const { id } = useParams()
  const { currentUser } = useAuth()
  const [data, setData] = useState(null)
  const [contactRequests, setContactRequests] = useState([])
  const [selectedImage, setSelectedImage] = useState(0)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [dialog, setDialog] = useState(null)

  const loadDetails = async () => {
    setLoading(true)
    try {
      const result = await getAdminReportDetails(id)
      setData(result)
      setSelectedImage(0)
      setContactRequests(result?.report ? await getContactRequestsForReport(id) : [])
      setError('')
    } catch (loadError) {
      setError(loadError.message || 'Unable to load report details.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDetails()
  }, [id])

  const report = data?.report
  const reporter = data?.reporter
  const auditRecords = data?.auditRecords || []
  const images = useMemo(() => {
    if (report?.imageUrls?.length) return report.imageUrls.filter(Boolean)
    return [getReportImageUrl(report)]
  }, [report])
  const isOwner = Boolean(currentUser && report?.reportedByUid === currentUser.uid)

  const runAction = async (action, successMessage) => {
    if (!currentUser || !report) return
    setIsUpdating(true)
    setError('')
    setNotice('')
    try {
      await action()
      setDialog(null)
      setNotice(successMessage)
      await loadDetails()
    } catch (actionError) {
      setError(actionError.message || 'Unable to update this report.')
    } finally {
      setIsUpdating(false)
    }
  }

  const requestConfirmation = ({ title, message, confirmLabel, danger = false, action, successMessage }) => {
    setDialog({ title, message, confirmLabel, danger, action, successMessage })
  }

  const handleImageError = (event) => {
    handleReportImageError(event, report?.itemCategory)
  }

  if (loading) {
    return (
      <section className="admin-detail-page" aria-busy="true">
        <div className="admin-skeleton admin-skeleton-short" />
        <div className="admin-skeleton admin-skeleton-heading" />
        <div className="admin-detail-layout">
          <div className="admin-skeleton admin-skeleton-image" />
          <div className="admin-skeleton admin-skeleton-panel" />
        </div>
      </section>
    )
  }

  if (error && !report) {
    return (
      <section className="page-card admin-error-state">
        <p className="eyebrow">Admin report details</p>
        <h1>Unable to load this report</h1>
        <p className="error-message" role="alert">{error}</p>
        <div className="admin-action-bar">
          <button type="button" className="primary-button" onClick={loadDetails}>Try again</button>
          <Link to="/admin/reports" className="secondary-button">Back to reports</Link>
        </div>
      </section>
    )
  }

  if (!report) {
    return (
      <section className="page-card admin-error-state">
        <p className="eyebrow">Admin report details</p>
        <h1>Report not found</h1>
        <p>This report is unavailable to the administrator.</p>
        <Link to="/admin/reports" className="secondary-button">Back to reports</Link>
      </section>
    )
  }

  return (
    <section className="admin-detail-page">
      <div className="admin-breadcrumbs">
        <Link to="/admin">Admin Dashboard</Link><span>/</span><Link to="/admin/reports">Admin Reports</Link><span>/</span><span>Report details</span>
      </div>

      <header className="admin-detail-heading">
        <div>
          <Link to="/admin/reports" className="detail-back-link">← Back to Admin Reports</Link>
          <p className="eyebrow">Report management</p>
          <h1>{report.title || report.itemName}</h1>
          <div className="admin-detail-subline">
            <span className={`status-pill type-pill ${report.type}`}>{report.type}</span>
            <span className="admin-report-id">Report ID: {report.id}</span>
            <span className="admin-report-id">Created {formatDate(report.createdAt)}</span>
          </div>
        </div>
        <StatusBadge status={report.status} />
      </header>

      {error && <p className="error-message" role="alert">{error}</p>}
      {notice && <p className="success-message" role="status">{notice}</p>}

      <div className="admin-detail-layout">
        <main className="admin-detail-main">
          <section className="admin-detail-image-wrap" aria-label="Report images">
            <button type="button" className="admin-image-button" onClick={() => setIsPreviewOpen(true)} aria-label="Open item image preview">
              <img src={images[selectedImage]} alt={report.itemName || 'Reported item'} className="admin-detail-image" onError={handleImageError} />
              <span className="admin-image-zoom-label">Open preview</span>
            </button>
            {images.length > 1 && (
              <div className="admin-image-gallery" aria-label="Select report image">
                {images.map((image, index) => (
                  <button type="button" className={index === selectedImage ? 'admin-image-thumb is-selected' : 'admin-image-thumb'} key={image} onClick={() => setSelectedImage(index)} aria-label={`Show image ${index + 1}`}>
                    <img src={image} alt="" onError={handleImageError} />
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="admin-detail-panel">
            <div className="admin-panel-heading"><h2>Item information</h2><span className={`status-pill type-pill ${report.type}`}>{report.type}</span></div>
            <dl className="admin-detail-list">
              <DetailRow label="Item name" value={report.itemName} />
              <DetailRow label="Category" value={report.itemCategory} />
              <DetailRow label="Location" value={report.itemLocation} />
              <DetailRow label="Campus zone" value={report.campusZone} />
              <DetailRow label="Date and time reported" value={formatDate(report.createdAt)} />
              <DetailRow label="Visibility" value={report.visibility} />
              <DetailRow label="Contact preference" value={report.contactPreference} />
            </dl>
            <div className="admin-description"><h3>Description</h3><p>{report.description || 'No description provided.'}</p></div>
            <div className="admin-description"><h3>Additional information</h3><p>{report.additionalInfo || 'No additional information provided.'}</p></div>
          </section>
        </main>

        <aside className="admin-detail-side">
          <section className="admin-detail-panel admin-moderation-panel">
            <div className="admin-panel-heading"><h2>Moderation</h2><StatusBadge status={report.status} /></div>
            <dl className="admin-detail-list">
              <DetailRow label="Current status" value={report.status} />
              <DetailRow label="Visibility" value={report.visibility} />
              <DetailRow label="Approved by" value={report.approvedByUid} />
              <DetailRow label="Approved at" value={formatDate(report.approvedAt)} />
              <DetailRow label="Rejection reason" value={report.rejectionReason} />
              <DetailRow label="Removed by" value={report.removedByUid} />
              <DetailRow label="Removed at" value={formatDate(report.removedAt)} />
              <DetailRow label="Resolved by" value={report.resolvedByUid} />
              <DetailRow label="Resolved at" value={formatDate(report.resolvedAt)} />
            </dl>
            <div className="admin-action-stack">
              {report.status === 'pending' && <>
                <button type="button" className="primary-button" disabled={isUpdating} onClick={() => requestConfirmation({ title: 'Approve this report?', message: 'This will make the report public and visible in Find Items.', confirmLabel: 'Approve report', action: () => approveReport({ reportId: report.id, actorUid: currentUser.uid }), successMessage: 'Report approved.' })}>Approve</button>
                <input value={rejectReason} onChange={(event) => setRejectReason(event.target.value)} placeholder="Rejection reason" aria-label="Rejection reason" />
                <button type="button" className="secondary-button" disabled={isUpdating || !rejectReason.trim()} onClick={() => requestConfirmation({ title: 'Reject this report?', message: 'The report will remain private and the reason will be recorded in the moderation audit.', confirmLabel: 'Reject report', action: () => rejectReport({ reportId: report.id, actorUid: currentUser.uid, reason: rejectReason.trim() }), successMessage: 'Report rejected.' })}>Reject</button>
              </>}
              {report.status === 'approved' && <>
                {isOwner && <button type="button" className="primary-button" disabled={isUpdating} onClick={() => requestConfirmation({ title: 'Mark this report resolved?', message: 'Only the report owner can complete recovery. The report will become restricted.', confirmLabel: 'Resolve report', action: () => resolveReportFromContact({ reportId: report.id, actorUid: currentUser.uid }), successMessage: 'Report resolved.' })}>Resolve</button>}
                <button type="button" className="danger-button" disabled={isUpdating} onClick={() => requestConfirmation({ title: 'Remove this report?', message: 'This will remove it from public visibility and record the moderation action.', confirmLabel: 'Remove report', danger: true, action: () => removeReport({ reportId: report.id, actorUid: currentUser.uid, reason: 'Removed by admin moderation.' }), successMessage: 'Report removed.' })}>Remove</button>
              </>}
              {report.status === 'rejected' && <p className="admin-action-note">Rejected reports are read-only. Rejection history is preserved below.</p>}
              {report.status === 'resolved' && <p className="admin-action-note">Resolved reports are read-only. Recovery details are preserved below.</p>}
              {report.status === 'removed' && <p className="admin-action-note">Removed reports are read-only.</p>}
            </div>
          </section>

          <section className="admin-detail-panel">
            <h2>Reporter information</h2>
            <p className="admin-private-label">Admin-only information</p>
            <dl className="admin-detail-list">
              <DetailRow label="Full name" value={reporter?.fullName || reporter?.displayName} />
              <DetailRow label="Email" value={reporter?.email} />
              <DetailRow label="Reporter UID" value={report.reportedByUid} />
            </dl>
          </section>
        </aside>
      </div>

      <section className="admin-detail-panel admin-contact-panel">
        <div className="admin-panel-heading"><div><h2>Contact and recovery</h2><p className="admin-panel-caption">Private requests associated with this report.</p></div><span>{contactRequests.length} request{contactRequests.length === 1 ? '' : 's'}</span></div>
        {contactRequests.length === 0 ? <p className="admin-empty-note">No contact requests recorded.</p> : contactRequests.map((request) => (
          <div className="admin-contact-row" key={request.id}><strong>{request.status}</strong><span>{request.message}</span><small>{request.requesterUid}<br />{formatDate(request.createdAt)}</small></div>
        ))}
      </section>

      <section className="admin-detail-panel admin-timeline-panel">
        <div className="admin-panel-heading"><div><h2>Moderation timeline</h2><p className="admin-panel-caption">Recorded events only. No inferred actions are added.</p></div></div>
        <div className="admin-timeline">
          <div className="admin-timeline-item"><span className="admin-timeline-dot" /><div><strong>Report created</strong><span>{formatDate(report.createdAt)}</span><small>Submitted by {report.reportedByUid || 'unknown reporter'}</small></div></div>
          {auditRecords.map((record) => (
            <div className="admin-timeline-item" key={record.id}><span className="admin-timeline-dot" /><div><strong>{record.actionType}</strong><span>{formatDate(record.createdAt)}</span><small>Actor: {record.actorUid}</small>{record.note && <p>{record.note}</p>}</div></div>
          ))}
          {report.resolvedAt && <div className="admin-timeline-item"><span className="admin-timeline-dot" /><div><strong>Resolved</strong><span>{formatDate(report.resolvedAt)}</span><small>Resolved by {report.resolvedByUid || 'report owner'}</small></div></div>}
        </div>
      </section>

      <div className="admin-detail-footer-actions"><Link to="/admin" className="secondary-button">Return to Admin Dashboard</Link><Link to="/admin/reports" className="secondary-button">Back to Admin Reports</Link></div>

      {isPreviewOpen && (
        <div className="admin-dialog-backdrop" role="presentation" onClick={() => setIsPreviewOpen(false)}>
          <section className="admin-image-preview" role="dialog" aria-modal="true" aria-label="Image preview" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="admin-preview-close" onClick={() => setIsPreviewOpen(false)} aria-label="Close image preview">×</button>
            <img src={images[selectedImage]} alt={report.itemName || 'Reported item'} onError={handleImageError} />
          </section>
        </div>
      )}

      <ConfirmDialog dialog={dialog} isUpdating={isUpdating} onCancel={() => setDialog(null)} onConfirm={() => runAction(dialog.action, dialog.successMessage)} />
    </section>
  )
}

export default AdminReportDetailsPage
