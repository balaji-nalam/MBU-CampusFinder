import { useEffect, useMemo, useState } from 'react'
import { onSnapshot, query, where, collection } from 'firebase/firestore'
import { useSearchParams } from 'react-router-dom'
import ReportCard from '../components/reports/ReportCard'
import CategoryGrid from '../components/reports/CategoryGrid'
import { CAMPUS_ZONES, REPORT_CATEGORIES } from '../services/reportService'
import { db } from '../api/firebase'

const sortOptions = {
  newest: 'desc',
  oldest: 'asc',
}

function getDiscoveryErrorMessage(queryError) {
  if (queryError?.code === 'permission-denied') {
    return 'You do not have permission to load campus reports. Please sign in with a verified account.'
  }

  if (queryError?.code === 'failed-precondition') {
    return 'Firestore needs additional configuration before reports can load. Contact the project administrator.'
  }

  if (queryError?.code === 'unavailable') {
    return 'Firestore is temporarily unavailable. Check your connection and try again.'
  }

  return queryError?.message || 'Unable to load approved reports. Please try again.'
}

function DiscoveryPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialCategory = REPORT_CATEGORIES.includes(searchParams.get('category')) ? searchParams.get('category') : 'all'
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState(initialCategory)
  const [zoneFilter, setZoneFilter] = useState('all')
  const [sortOption, setSortOption] = useState('newest')

  useEffect(() => {
    if (!db) {
      setError('Firebase is not configured. Add the required environment variables and restart the app.')
      setLoading(false)
      return undefined
    }

    let isMounted = true
    let unsubscribe = () => {}

    try {
      const baseQuery = query(
        collection(db, 'reports'),
        where('status', '==', 'approved'),
        where('visibility', '==', 'public'),
      )

      unsubscribe = onSnapshot(
        baseQuery,
        (snapshot) => {
          if (!isMounted) return

          const items = snapshot.docs
            .map((docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() }))
            .sort((first, second) => {
              const firstTime = first.createdAt?.toMillis?.() || 0
              const secondTime = second.createdAt?.toMillis?.() || 0
              return sortOptions[sortOption] === 'desc'
                ? secondTime - firstTime
                : firstTime - secondTime
            })

          setReports(items)
          setLoading(false)
          setError('')
        },
        (queryError) => {
          if (!isMounted) return
          setError(getDiscoveryErrorMessage(queryError))
          setLoading(false)
        },
      )
    } catch (queryError) {
      setError(getDiscoveryErrorMessage(queryError))
      setLoading(false)
    }

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [sortOption])

  const filteredReports = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return reports.filter((report) => {
      const matchesType = typeFilter === 'all' || report.type === typeFilter
      const matchesCategory = categoryFilter === 'all' || report.itemCategory === categoryFilter
      const matchesZone = zoneFilter === 'all' || report.campusZone === zoneFilter

      const haystack = [
        report.title,
        report.description,
        report.itemName,
        report.itemCategory,
        report.itemLocation,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      const matchesSearch = !normalizedSearch || haystack.includes(normalizedSearch)

      return matchesType && matchesCategory && matchesZone && matchesSearch
    })
  }, [categoryFilter, reports, search, typeFilter, zoneFilter])

  const hasFilters = Boolean(search || typeFilter !== 'all' || categoryFilter !== 'all' || zoneFilter !== 'all' || sortOption !== 'newest')

  const setCategory = (category) => {
    setCategoryFilter(category)
    const next = new URLSearchParams(searchParams)
    if (!category || category === 'all') next.delete('category')
    else next.set('category', category)
    setSearchParams(next, { replace: true })
  }

  const clearFilters = () => {
    setSearch('')
    setTypeFilter('all')
    setCategory('all')
    setZoneFilter('all')
    setSortOption('newest')
  }

  return (
    <section className="page-card discovery-page">
      <div className="page-intro-row">
        <div>
          <p className="eyebrow">The campus board</p>
          <h1>Find what you’re looking for.</h1>
          <p className="lead">Search approved lost and found reports across MBU, then use a private contact request to reconnect.</p>
        </div>
        <div className="page-intro-mark">⌕</div>
      </div>

      <div className="dashboard-section category-section">
        <h2>Browse by category</h2>
        <p className="dashboard-filter-note">Every campus item type, fitted to a card. Select one to filter the board.</p>
        <CategoryGrid value={categoryFilter} onSelect={setCategory} allowAll />
      </div>

      <div className="search-panel">
        <label className="form-field search-field">
          <span>Search items</span>
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by item, category, or location"
          />
        </label>

        <div className="filter-grid">
          <label className="form-field">
            <span>Type</span>
            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
              <option value="all">All</option>
              <option value="lost">Lost</option>
              <option value="found">Found</option>
            </select>
          </label>

          <label className="form-field">
            <span>Category</span>
            <select value={categoryFilter} onChange={(event) => setCategory(event.target.value)}>
              <option value="all">All categories</option>
              {REPORT_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>Campus zone</span>
            <select value={zoneFilter} onChange={(event) => setZoneFilter(event.target.value)}>
              <option value="all">All zones</option>
              {CAMPUS_ZONES.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>Sort</span>
            <select value={sortOption} onChange={(event) => setSortOption(event.target.value)}>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </label>
        </div>
        <div className="search-toolbar">
          <span>{loading ? 'Searching the campus board…' : `${filteredReports.length} ${filteredReports.length === 1 ? 'report' : 'reports'} found`}</span>
          {hasFilters && <button type="button" className="text-button" onClick={clearFilters}>Clear filters</button>}
        </div>
      </div>

      {loading && <p className="info-message">Loading approved reports...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && filteredReports.length === 0 && (
        <div className="empty-state">
          <h2>No items found.</h2>
          <p>No items match your search.</p>
        </div>
      )}

      {!loading && !error && filteredReports.length > 0 && (
        <div className="report-grid">
          {filteredReports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </section>
  )
}

export default DiscoveryPage
