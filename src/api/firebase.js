import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export let app = null
export let auth = null
export let db = null
export let storage = null
export let firebaseInitError = null
export let googleProvider = null

// Check if config is valid before initializing
const isConfigValid =
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId

if (isConfigValid) {
  try {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)
    storage = getStorage(app)
    googleProvider = new GoogleAuthProvider()
    googleProvider.setCustomParameters({ prompt: 'select_account' })
  } catch (error) {
    firebaseInitError = error
    console.error('Firebase initialization error:', error)
  }
} else {
  firebaseInitError = new Error(
    'Firebase is not configured. Please add your Firebase credentials to .env.local:\n' +
    'VITE_FIREBASE_API_KEY\n' +
    'VITE_FIREBASE_AUTH_DOMAIN\n' +
    'VITE_FIREBASE_PROJECT_ID\n' +
    'VITE_FIREBASE_STORAGE_BUCKET\n' +
    'VITE_FIREBASE_MESSAGING_SENDER_ID\n' +
    'VITE_FIREBASE_APP_ID'
  )
  console.error(firebaseInitError.message)
}

export default app
