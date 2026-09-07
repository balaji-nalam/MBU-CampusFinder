import { getDemoImageForCategory } from '../../assets/items'
import { REPORT_CATEGORIES } from '../../services/reportService'

function CategoryGrid({ value = 'all', onSelect, allowAll = false }) {
  const items = allowAll ? ['all', ...REPORT_CATEGORIES] : REPORT_CATEGORIES

  return (
    <div className="category-card-grid" role="list">
      {items.map((category) => {
        const selected = value === category
        const isAll = category === 'all'

        return (
          <button
            key={category}
            type="button"
            role="listitem"
            className={selected ? 'category-card is-active' : 'category-card'}
            onClick={() => onSelect?.(category)}
            aria-pressed={selected}
          >
            <span className="category-card-media" aria-hidden="true">
              {isAll ? <span className="category-card-all">All</span> : (
                <img src={getDemoImageForCategory(category)} alt="" />
              )}
            </span>
            <span className="category-card-label">{isAll ? 'All items' : category}</span>
          </button>
        )
      })}
    </div>
  )
}

export default CategoryGrid
