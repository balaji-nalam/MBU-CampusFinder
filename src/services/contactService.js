import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../api/firebase'
import { getReportById } from './reportService'

export async function getActiveContactRequestForUser(reportId, requesterUid) {
  if (!reportId || !requesterUid) {
    return null
  }

  const q = query(
    collection(db, 'contactRequests'),
    where('reportId', '==', reportId),
    where('requesterUid', '==', requesterUid),
    where('status', 'in', ['pending', 'accepted']),
  )

  const snapshot = await getDocs(q)
  if (snapshot.empty) {
    return null
  }

  const first = snapshot.docs[0]
  return { id: first.id, ...first.data() }
}

export async function createContactRequest({ reportId, requesterUid, message }) {
  if (!reportId || !requesterUid) {
    throw new Error('Unable to create this contact request.')
  }

  const trimmedMessage = (message || '').trim()
  if (!trimmedMessage || trimmedMessage.length < 10) {
    throw new Error('Please include a short explanation so the owner can review your request.')
  }

  const report = await getReportById(reportId)
  if (!report) {
    throw new Error('This report is no longer available.')
  }

  if (report.status !== 'approved' || report.visibility !== 'public') {
    throw new Error('Only active public reports can receive contact requests.')
  }

  if (report.reportedByUid === requesterUid) {
    throw new Error('You cannot contact your own report.')
  }

  const existing = await getActiveContactRequestForUser(reportId, requesterUid)
  if (existing) {
    throw new Error('You already have an active request for this report.')
  }

  const requestRef = doc(collection(db, 'contactRequests'))
  const payload = {
    requestId: requestRef.id,
    reportId,
    requesterUid,
    ownerUid: report.reportedByUid,
    message: trimmedMessage,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  await setDoc(requestRef, payload)
  return { id: requestRef.id, ...payload }
}

export async function getContactRequestsForReport(reportId) {
  if (!reportId) {
    return []
  }

  const q = query(collection(db, 'contactRequests'), where('reportId', '==', reportId))
  const snapshot = await getDocs(q)
  return snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .sort((a, b) => {
      const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0
      const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0
      return bTime - aTime
    })
}

export async function getContactRequestsForUser(uid) {
  if (!uid) {
    return []
  }

  const requesterQuery = query(collection(db, 'contactRequests'), where('requesterUid', '==', uid))
  const ownerQuery = query(collection(db, 'contactRequests'), where('ownerUid', '==', uid))

  const [requesterSnapshot, ownerSnapshot] = await Promise.all([
    getDocs(requesterQuery),
    getDocs(ownerQuery),
  ])

  const list = [...requesterSnapshot.docs, ...ownerSnapshot.docs]
  const deduped = new Map()

  list.forEach((docSnapshot) => {
    deduped.set(docSnapshot.id, { id: docSnapshot.id, ...docSnapshot.data() })
  })

  return Array.from(deduped.values()).sort((a, b) => {
    const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0
    const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0
    return bTime - aTime
  })
}

export async function updateContactRequestStatus({ requestId, actorUid, status, note = '' }) {
  if (!requestId || !actorUid) {
    throw new Error('Unable to update this contact request.')
  }

  const allowedStatuses = ['accepted', 'declined', 'cancelled']
  if (!allowedStatuses.includes(status)) {
    throw new Error('Invalid request status.')
  }

  const requestRef = doc(db, 'contactRequests', requestId)
  const snapshot = await getDoc(requestRef)
  if (!snapshot.exists()) {
    throw new Error('This contact request could not be found.')
  }

  const requestData = snapshot.data()

  if (status === 'cancelled') {
    if (requestData.requesterUid !== actorUid) {
      throw new Error('You can only cancel your own contact request.')
    }
  } else if (requestData.ownerUid !== actorUid) {
    throw new Error('Only the report owner can accept or decline a contact request.')
  }

  await updateDoc(requestRef, {
    status,
    note: note.trim(),
    updatedAt: serverTimestamp(),
  })

  return true
}

export async function resolveReportFromContact({ reportId, actorUid }) {
  if (!reportId || !actorUid) {
    throw new Error('Unable to resolve this report.')
  }

  const report = await getReportById(reportId)
  if (!report) {
    throw new Error('The report no longer exists.')
  }

  if (report.reportedByUid !== actorUid) {
    throw new Error('Only the report owner can mark this item as resolved.')
  }

  if (report.status !== 'approved') {
    throw new Error('Only approved reports can be marked as resolved.')
  }

  const reportRef = doc(db, 'reports', reportId)
  await updateDoc(reportRef, {
    status: 'resolved',
    resolvedAt: serverTimestamp(),
    resolvedByUid: actorUid,
    visibility: 'restricted',
    updatedAt: serverTimestamp(),
  })

  return true
}
