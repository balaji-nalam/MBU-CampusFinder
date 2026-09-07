import { addDoc, collection, doc, getDoc, getDocs, orderBy, query, serverTimestamp, where, writeBatch } from 'firebase/firestore'
import { db } from '../api/firebase'
import { getReportImageUrl } from '../assets/items'

function mapReport(snapshot) {
  const report = { id: snapshot.id, ...snapshot.data() }
  return {
    ...report,
    imageUrl: getReportImageUrl(report),
  }
}

export async function getAdminReportStats() {
  const reportsSnapshot = await getDocs(collection(db, 'reports'))
  const reports = reportsSnapshot.docs.map((snapshot) => ({ id: snapshot.id, ...snapshot.data() }))

  return {
    totalReports: reports.length,
    pending: reports.filter((report) => report.status === 'pending').length,
    approved: reports.filter((report) => report.status === 'approved').length,
    rejected: reports.filter((report) => report.status === 'rejected').length,
    resolved: reports.filter((report) => report.status === 'resolved').length,
    removed: reports.filter((report) => report.status === 'removed').length,
  }
}

export async function getPendingReports() {
  const pendingQuery = query(collection(db, 'reports'), orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(pendingQuery)

  return snapshot.docs
    .map(mapReport)
    .filter((report) => report.status === 'pending')
}

export async function getAllAdminReports() {
  const reportsSnapshot = await getDocs(query(collection(db, 'reports'), orderBy('createdAt', 'desc')))
  return Promise.all(reportsSnapshot.docs.map(async (reportSnapshot) => {
    const report = mapReport(reportSnapshot)
    const reporterSnapshot = report.reportedByUid
      ? await getDoc(doc(db, 'users', report.reportedByUid))
      : null
    return {
      ...report,
      reporter: reporterSnapshot?.exists() ? reporterSnapshot.data() : null,
    }
  }))
}

export async function getAdminReportDetails(reportId) {
  if (!reportId) {
    return null
  }

  const reportSnapshot = await getDoc(doc(db, 'reports', reportId))
  if (!reportSnapshot.exists()) {
    return null
  }

  const report = mapReport(reportSnapshot)
  const reporterSnapshot = report.reportedByUid
    ? await getDoc(doc(db, 'users', report.reportedByUid))
    : null
  const auditSnapshot = await getDocs(query(
    collection(db, 'adminActions'),
    where('reportId', '==', reportId),
  ))

  return {
    report,
    reporter: reporterSnapshot?.exists() ? reporterSnapshot.data() : null,
    auditRecords: auditSnapshot.docs
      .map((snapshot) => ({ id: snapshot.id, ...snapshot.data() }))
      .sort((first, second) => {
        const firstTime = first.createdAt?.toDate ? first.createdAt.toDate().getTime() : 0
        const secondTime = second.createdAt?.toDate ? second.createdAt.toDate().getTime() : 0
        return secondTime - firstTime
      }),
  }
}

async function createAdminAuditRecord({ actionType, reportId, actorUid, note }) {
  await addDoc(collection(db, 'adminActions'), {
    actionType,
    reportId,
    actorUid,
    note,
    createdAt: serverTimestamp(),
  })
}

export async function approveReport({ reportId, actorUid, adminNote = 'Approved by admin review.' }) {
  if (!reportId || !actorUid) {
    throw new Error('Missing report or admin reference.')
  }

  const reportRef = doc(db, 'reports', reportId)
  const batch = writeBatch(db)

  batch.update(reportRef, {
    status: 'approved',
    approvedByUid: actorUid,
    approvedAt: serverTimestamp(),
    visibility: 'public',
    updatedAt: serverTimestamp(),
    rejectionReason: null,
  })

  const auditRef = doc(collection(db, 'adminActions'))
  batch.set(auditRef, {
    actionType: 'APPROVE_REPORT',
    reportId,
    actorUid,
    note: adminNote,
    createdAt: serverTimestamp(),
  })

  await batch.commit()
}

export async function rejectReport({ reportId, actorUid, reason }) {
  if (!reportId || !actorUid) {
    throw new Error('Missing report or admin reference.')
  }

  const trimmedReason = (reason || '').trim()
  if (!trimmedReason) {
    throw new Error('A rejection reason is required.')
  }

  const reportRef = doc(db, 'reports', reportId)
  const batch = writeBatch(db)

  batch.update(reportRef, {
    status: 'rejected',
    rejectionReason: trimmedReason,
    approvedByUid: null,
    approvedAt: null,
    visibility: 'restricted',
    updatedAt: serverTimestamp(),
  })

  const auditRef = doc(collection(db, 'adminActions'))
  batch.set(auditRef, {
    actionType: 'REJECT_REPORT',
    reportId,
    actorUid,
    note: trimmedReason,
    createdAt: serverTimestamp(),
  })

  await batch.commit()
}

export async function removeReport({ reportId, actorUid, reason }) {
  if (!reportId || !actorUid) {
    throw new Error('Missing report or admin reference.')
  }

  const reportRef = doc(db, 'reports', reportId)
  const batch = writeBatch(db)

  batch.update(reportRef, {
    status: 'removed',
    removedByUid: actorUid,
    removedAt: serverTimestamp(),
    visibility: 'restricted',
    updatedAt: serverTimestamp(),
    rejectionReason: reason || null,
  })

  const auditRef = doc(collection(db, 'adminActions'))
  batch.set(auditRef, {
    actionType: 'REMOVE_REPORT',
    reportId,
    actorUid,
    note: reason || 'Removed by admin review.',
    createdAt: serverTimestamp(),
  })

  await batch.commit()
}

export { createAdminAuditRecord }
