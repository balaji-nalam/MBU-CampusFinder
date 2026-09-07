import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ReportForm from '../components/reports/ReportForm'
import { useAuth } from '../context/AuthContext'
import { getReportById } from '../services/reportService'
import { db } from '../api/firebase'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'

function ReportEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await getReportById(id)
        if (!data) {
          setError('Report not found.')
          return
        }

        if (!currentUser || data.reportedByUid !== currentUser.uid) {
          setError('You can only edit your own reports.')
          return
        }

        if (!['pending', 'approved'].includes(data.status)) {
          setError('This report can no longer be edited.')
          return
        }

        setReport(data)
      } catch (loadError) {
        setError(loadError.message || 'Unable to load report.')
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [currentUser, id])

  const handleSubmit = async (formData) => {
    if (!currentUser || !report || report.reportedByUid !== currentUser.uid) {
      throw new Error('You can only edit your own reports.')
    }

    if (!formData.title || !formData.itemName || !formData.itemLocation || !formData.description) {
      throw new Error('Please fill in all required fields.')
    }

    const payload = {
      title: formData.title.trim(),
      itemName: formData.itemName.trim(),
      itemCategory: formData.itemCategory,
      description: formData.description.trim(),
      itemBrand: formData.itemBrand?.trim() || '',
      itemColor: formData.itemColor?.trim() || '',
      itemLocation: formData.itemLocation.trim(),
      campusZone: formData.campusZone,
      additionalInfo: formData.additionalInfo?.trim() || '',
      contactPreference: formData.contactPreference,
      lastSeenDate: formData.type === 'lost' ? formData.lastSeenDate || null : null,
      foundDate: formData.type === 'found' ? formData.foundDate || null : null,
      updatedAt: serverTimestamp(),
      searchText: [
        formData.title,
        formData.itemName,
        formData.itemCategory,
        formData.description,
        formData.itemLocation,
        formData.campusZone,
        formData.itemBrand,
        formData.itemColor,
        formData.additionalInfo,
      ].join(' ').toLowerCase(),
    }

    const reportRef = doc(db, 'reports', report.id)
    await updateDoc(reportRef, payload)
    navigate(`/reports/${report.id}`)
  }

  if (loading) {
    return (
      <section className="page-card">
        <h1>Loading report</h1>
        <p>Please wait while your report loads.</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="page-card">
        <h1>Unable to edit report</h1>
        <p>{error}</p>
      </section>
    )
  }

  return (
    <section className="page-card">
      <h1>Edit report</h1>
      <ReportForm
        onSubmit={handleSubmit}
        isSubmitting={false}
        submitLabel="Save changes"
        initialType={report.type}
        initialValues={{
          type: report.type,
          title: report.title,
          itemName: report.itemName,
          itemCategory: report.itemCategory,
          description: report.description,
          itemBrand: report.itemBrand,
          itemColor: report.itemColor,
          itemLocation: report.itemLocation,
          campusZone: report.campusZone,
          contactPreference: report.contactPreference,
          lastSeenDate: report.lastSeenDate || '',
          foundDate: report.foundDate || '',
          additionalInfo: report.additionalInfo || '',
        }}
      />
    </section>
  )
}

export default ReportEditPage
