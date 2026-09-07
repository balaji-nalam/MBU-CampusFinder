import { Link } from 'react-router-dom'
import { getReportImageUrl, handleReportImageError } from '../../assets/items'

function formatReportDate(value) {
  if (!value) return 'Date not set'
  const date = typeof value?.toDate === 'function' ? value.toDate() : new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
}

function ReportCard({ report }) {
  if (!report) return null

  const dateValue = report.lastSeenDate || report.foundDate || report.createdAt
  const route = `/reports/${report.reportId || report.id}`
  const typeLabel = report.type === 'lost' ? 'Lost' : 'Found'
  const statusLabel = report.status || 'approved'
  const imageUrl = getReportImageUrl(report)

  const hasUploadedPhoto = Boolean(report?.imageUrls?.find(Boolean))
  const title = report.itemName || report.title || 'Untitled item'

  return (
    <Link to={route} className="report-card" aria-label={`View ${title}`}>
      <div className="report-card-media">
        <img
          src={imageUrl}
          alt=""
          className={hasUploadedPhoto ? 'report-card-image is-photo' : 'report-card-image is-illustration'}
          loading="lazy"
          onError={(event) => handleReportImageError(event, report.itemCategory)}
        />
      </div>

      <div className="report-card-body">
        <div className="report-type-row">
          <span className={`status-pill type-pill ${report.type === 'lost' ? 'lost' : 'found'}`}>
            {typeLabel}
          </span>
          <span className={`status-pill status-pill-${statusLabel}`}>{statusLabel}</span>
        </div>

        <h3>{title}</h3>
        <p className="report-meta">{report.itemCategory || 'Other'} · {report.itemLocation || 'Location not set'}</p>
        <p className="report-meta">{formatReportDate(dateValue)}</p>
        <span className="secondary-button report-link">View details</span>
      </div>
    </Link>
  )
}

export default ReportCard
