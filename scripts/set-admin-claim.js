import { getAuth } from 'firebase-admin/auth'
import { initializeApp } from 'firebase-admin/app'

const projectId = process.env.FIREBASE_PROJECT_ID || 'mbu-campusfinder'
const identifier = process.argv[2]?.trim()

if (!identifier) {
  console.error('Usage: npm run set-admin -- <firebase-auth-uid-or-email>')
  process.exit(1)
}

initializeApp({ projectId })

const auth = getAuth()
const user = identifier.includes('@')
  ? await auth.getUserByEmail(identifier)
  : await auth.getUser(identifier)
const existingClaims = user.customClaims || {}

await auth.setCustomUserClaims(user.uid, {
  ...existingClaims,
  admin: true,
})

console.log(`Admin claim set for Firebase Auth UID ${user.uid} in project ${projectId}.`)
console.log('The user must sign out and sign back in, or refresh their ID token, before the claim is visible in the client.')