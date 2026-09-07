import { useEffect, useMemo, useState } from 'react'
import { REPORT_CATEGORIES, REPORT_TYPES, CAMPUS_ZONES, CONTACT_PREFERENCES } from '../../services/reportService'
import { DEMO_MODE } from '../../config/appMode'
import { getDemoImageForCategory } from '../../assets/items'
import CategoryGrid from './CategoryGrid'
import ImageUploader from './ImageUploader'

const createInitialState = (type = 'lost', initialValues = {}) => ({
  type: initialValues.type || type,
  title: initialValues.title || '',
  itemName: initialValues.itemName || '',
  itemCategory: initialValues.itemCategory || REPORT_CATEGORIES[0],
  description: initialValues.description || '',
  itemBrand: initialValues.itemBrand || '',
  itemColor: initialValues.itemColor || '',
  itemLocation: initialValues.itemLocation || '',
  campusZone: initialValues.campusZone || CAMPUS_ZONES[0],
  contactPreference: initialValues.contactPreference || CONTACT_PREFERENCES[0],
  lastSeenDate: initialValues.lastSeenDate || '',
  foundDate: initialValues.foundDate || '',
  additionalInfo: initialValues.additionalInfo || '',
})

function ReportForm({ onSubmit, isSubmitting, submitLabel = 'Submit report', initialType = 'lost', initialValues = null }) {
  const [form, setForm] = useState(createInitialState(initialType, initialValues || {}))
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const nextForm = createInitialState(initialType, initialValues || {})
    setForm(nextForm)
    setImagePreview(getDemoImageForCategory(nextForm.itemCategory))
  }, [initialType, initialValues])

  const typeOptions = useMemo(() => REPORT_TYPES, [])
  const zoneOptions = useMemo(() => CAMPUS_ZONES, [])
  const preferenceOptions = useMemo(() => CONTACT_PREFERENCES, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    if (name === 'itemCategory') {
      setImagePreview(getDemoImageForCategory(value))
    }
  }

  const handleImageChange = (file) => {
    setImageFile(file)
    setImagePreview(file ? URL.createObjectURL(file) : '')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    const payload = {
      ...form,
      type: form.type || initialType,
      title: form.title.trim(),
      itemName: form.itemName.trim(),
      description: form.description.trim(),
      itemLocation: form.itemLocation.trim(),
      additionalInfo: form.additionalInfo.trim(),
      itemBrand: form.itemBrand.trim(),
      itemColor: form.itemColor.trim(),
    }

    const submitData = {
      ...payload,
      imageFile,
      demoImageUrl: getDemoImageForCategory(payload.itemCategory),
    }

    try {
      await onSubmit(submitData)
    } catch (submissionError) {
      setError(submissionError.message || 'Unable to submit the report.')
    }
  }

  return (
    <form className="report-form" onSubmit={handleSubmit}>
      {error && <p className="error-message" role="alert">{error}</p>}

      <div className="form-section-heading">
        <span>01</span>
        <div><strong>Item information</strong><small>Give the item a clear, recognisable identity.</small></div>
      </div>

      <div className="field-row">
        <label className="form-field">
          <span>Report type</span>
          <select name="type" value={form.type} onChange={handleChange}>
            {typeOptions.map((type) => (
              <option key={type} value={type}>{type === 'lost' ? 'Lost item' : 'Found item'}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="field-row two-col">
        <label className="form-field">
          <span>Title <i>*</i></span>
          <input type="text" name="title" value={form.title} onChange={handleChange} placeholder="Black leather wallet" required />
        </label>
        <label className="form-field">
          <span>Item name <i>*</i></span>
          <input type="text" name="itemName" value={form.itemName} onChange={handleChange} placeholder="Wallet" required />
        </label>
      </div>

      <div className="field-row two-col">
        <label className="form-field">
          <span>Contact preference</span>
          <select name="contactPreference" value={form.contactPreference} onChange={handleChange}>
            {preferenceOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
      </div>

      <fieldset className="category-picker">
        <legend>Category <i>*</i></legend>
        <CategoryGrid
          value={form.itemCategory}
          onSelect={(category) => {
            setForm((current) => ({ ...current, itemCategory: category }))
            setImagePreview(getDemoImageForCategory(category))
          }}
        />
      </fieldset>

      <div className="field-row two-col">
        <label className="form-field">
          <span>Brand</span>
          <input type="text" name="itemBrand" value={form.itemBrand} onChange={handleChange} placeholder="Optional" />
        </label>
        <label className="form-field">
          <span>Color</span>
          <input type="text" name="itemColor" value={form.itemColor} onChange={handleChange} placeholder="Optional" />
        </label>
      </div>

      <label className="form-field">
        <span>Description <i>*</i></span>
        <textarea name="description" value={form.description} onChange={handleChange} rows="4" placeholder="Add key identifying details: marks, stickers, contents, or distinctive features." required />
      </label>

      <div className="form-section-heading">
        <span>02</span>
        <div><strong>Location & date</strong><small>Help someone recognise where the handoff starts.</small></div>
      </div>

      <div className="field-row two-col">
        <label className="form-field">
          <span>{form.type === 'lost' ? 'Last seen location' : 'Found location'} <i>*</i></span>
          <input type="text" name="itemLocation" value={form.itemLocation} onChange={handleChange} placeholder="Library, admin block, hostel..." required />
        </label>
        <label className="form-field">
          <span>Campus zone</span>
          <select name="campusZone" value={form.campusZone} onChange={handleChange}>
            {zoneOptions.map((zone) => <option key={zone} value={zone}>{zone}</option>)}
          </select>
        </label>
      </div>

      <div className="field-row two-col">
        <label className="form-field">
          <span>{form.type === 'lost' ? 'Date lost' : 'Date found'} <i>*</i></span>
          <input type="date" name={form.type === 'lost' ? 'lastSeenDate' : 'foundDate'} value={form.type === 'lost' ? form.lastSeenDate : form.foundDate} onChange={handleChange} required />
        </label>
      </div>

      <label className="form-field">
        <span>Additional information</span>
        <textarea name="additionalInfo" value={form.additionalInfo} onChange={handleChange} rows="3" placeholder="Any other useful notes for the person reviewing your report." />
      </label>

      <div className="form-section-heading">
        <span>03</span>
        <div><strong>Add a photo</strong><small>A clear image makes a good match much more likely.</small></div>
      </div>

      <ImageUploader
        file={imageFile}
        previewUrl={imagePreview}
        onFileChange={handleImageChange}
        demoMode={DEMO_MODE}
        category={form.itemCategory}
      />

      <div className="form-submit-row">
        <p><i>*</i> Required fields · Reports are reviewed before they appear publicly.</p>
        <button type="submit" className="primary-button" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : submitLabel}
        </button>
      </div>
    </form>
  )
}

export default ReportForm
