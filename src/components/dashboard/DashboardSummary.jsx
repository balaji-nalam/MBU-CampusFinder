function DashboardSummary({ reports = [], activeFilter = 'all', onFilterChange }) {
  const totals = {
    all: reports.length,
    pending: reports.filter((report) => report.status === 'pending').length,
    approved: reports.filter((report) => report.status === 'approved').length,
    resolved: reports.filter((report) => report.status === 'resolved').length,
  }

  const summaryItems = [
    { key: 'all', label: 'Total Reports', value: totals.all, hint: 'Show every report' },
    { key: 'pending', label: 'Pending', value: totals.pending, hint: 'Waiting for review' },
    { key: 'approved', label: 'Approved / Active', value: totals.approved, hint: 'Visible on campus' },
    { key: 'resolved', label: 'Resolved', value: totals.resolved, hint: 'Closed and returned' },
  ]

  return (
    <div className="summary-grid" role="tablist" aria-label="Filter reports by status">
      {summaryItems.map((item) => {
        const selected = activeFilter === item.key
        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={selected}
            className={selected ? 'summary-card is-active' : 'summary-card'}
            onClick={() => onFilterChange?.(item.key)}
          >
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small>{item.hint}</small>
          </button>
        )
      })}
    </div>
  )
}

export default DashboardSummary
