import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { collection, doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { db, storage } from '../api/firebase'

export const REPORT_CATEGORIES = [
  'ID Card',
  'Wallet',
  'Keys',
  'Phone',
  'Laptop',
  'Charger',
  'Earbuds',
  'Headphones',
  'Books',
  'Notebook',
  'Backpack',
  'Water Bottle',
  'Umbrella',
  'Calculator',
  'Watch',
  'Glasses',
  'Pen/Pencil Case',
  'USB Drive',
  'College Access Card',
  'Clothing',
  'Documents',
  'Other',
]

export const REPORT_TYPES = ['lost', 'found']
export const REPORT_STATUSES = ['pending', 'approved', 'rejected', 'resolved', 'removed']
export const CAMPUS_ZONES = ['Main Campus', 'Library', 'Hostels', 'Admin Block', 'Lecture Hall', 'Sports Ground', 'Other']
export const CONTACT_PREFERENCES = ['Email', 'Phone', 'In-App Chat']

export function normalizeSearchText(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function validateReportImage(file, demoImageUrl = '') {
  if (demoImageUrl) {
    return ''
  }

  if (!file) {
    return 'Please choose an image.'
  }

  if (!file.type.startsWith('image/')) {
    return 'Only image files are allowed.'
  }

  if (file.size > 5 * 1024 * 1024) {
    return 'Image size must be 5MB or less.'
  }

  return ''
}

export async function uploadReportImage(file, uid, reportId) {
  if (!file || !uid || !reportId) {
    return ''
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_')
  const imageRef = ref(storage, `reports/${uid}/${reportId}/${safeName}`)
  const uploadTask = uploadBytesResumable(imageRef, file)

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      () => {},
      (error) => reject(error),
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref)
          resolve(downloadUrl)
        } catch (error) {
          reject(error)
        }
      },
    )
  })
}

export async function createReportDocument({ uid, formData, imageUrl = '' }) {
  const reportCollection = collection(db, 'reports')
  const reportRef = doc(reportCollection)
  const reportId = reportRef.id

  const searchText = normalizeSearchText([
    formData.title,
    formData.itemName,
    formData.itemCategory,
    formData.description,
    formData.itemLocation,
    formData.campusZone,
    formData.itemBrand,
    formData.itemColor,
    formData.additionalInfo,
  ].join(' '))

  const payload = {
    reportId,
    type: formData.type,
    title: formData.title.trim(),
    description: formData.description.trim(),
    itemName: formData.itemName.trim(),
    itemCategory: formData.itemCategory,
    itemBrand: formData.itemBrand?.trim() || '',
    itemColor: formData.itemColor?.trim() || '',
    itemLocation: formData.itemLocation.trim(),
    campusZone: formData.campusZone,
    reportedByUid: uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    status: 'pending',
    approvedByUid: null,
    approvedAt: null,
    rejectionReason: null,
    resolvedAt: null,
    resolvedByUid: null,
    removedAt: null,
    removedByUid: null,
    imageUrls: imageUrl ? [imageUrl] : [],
    lastSeenDate: formData.type === 'lost' ? formData.lastSeenDate || null : null,
    foundDate: formData.type === 'found' ? formData.foundDate || null : null,
    contactPreference: formData.contactPreference,
    searchText,
    visibility: 'private',
    additionalInfo: formData.additionalInfo?.trim() || '',
  }

  await setDoc(reportRef, payload)
  return reportId
}

export async function updateReportImage(reportId, imageUrl) {
  if (!reportId || !imageUrl) {
    return
  }

  const reportRef = doc(db, 'reports', reportId)
  await updateDoc(reportRef, {
    imageUrls: [imageUrl],
    updatedAt: serverTimestamp(),
  })
}

export async function getReportById(reportId) {
  if (!reportId) {
    return null
  }

  const reportRef = doc(db, 'reports', reportId)
  const snapshot = await getDoc(reportRef)

  if (!snapshot.exists()) {
    return null
  }

  return { id: snapshot.id, ...snapshot.data() }
}
