import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import ReportForm from '../components/reports/ReportForm'
import { useAuth } from '../context/AuthContext'
import { DEMO_MODE } from '../config/appMode'
import {
  REPORT_CATEGORIES,
  createReportDocument,
  updateReportImage,
  uploadReportImage,
  validateReportImage,
} from '../services/reportService'

function ReportCreatePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { currentUser } = useAuth()
  const initialType = searchParams.get('type') === 'found' ? 'found' : 'lost'
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notice, setNotice] = useState('')

  const handleSubmit = async (formData) => {
    if (!currentUser || !currentUser.emailVerified) {
      throw new Error('Only verified users can submit reports.')
    }

    const requiredImageError = validateReportImage(formData.imageFile, formData.demoImageUrl)
    if (requiredImageError) {
      throw new Error(requiredImageError)
    }

    if (!formData.itemName || !formData.itemLocation || !formData.description || !formData.title) {
      throw new Error('Please complete all required fields.')
    }

    if (!REPORT_CATEGORIES.includes(formData.itemCategory)) {
      throw new Error('Please select a valid item category.')
    }

    setIsSubmitting(true)
    setNotice('')

    try {
      const imageUrl = DEMO_MODE ? formData.demoImageUrl : ''
      const reportId = await createReportDocument({
        uid: currentUser.uid,
        formData,
        imageUrl,
      })

      if (!DEMO_MODE) {
        const uploadedImageUrl = await uploadReportImage(formData.imageFile, currentUser.uid, reportId)
        await updateReportImage(reportId, uploadedImageUrl)
      }

      setNotice('Report submitted successfully. Your report is pending admin review.')
      navigate(`/reports/${reportId}`, { replace: true })
    } catch (error) {
      throw new Error(error.message || 'Unable to submit the report. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="page-card report-create-page">
      <p className="eyebrow">Make a useful report</p>
      <h1>{initialType === 'lost' ? 'Report a lost item' : 'Report a found item'}</h1>
      <p className="lead">Share the details that help a fellow student recognise it. Your report will be reviewed before it appears on the campus board.</p>
      {notice && <p className="success-message">{notice}</p>}
      <ReportForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        initialType={initialType}
        submitLabel={initialType === 'lost' ? 'Submit lost report' : 'Submit found report'}
      />
    </section>
  )
}

export default ReportCreatePage
