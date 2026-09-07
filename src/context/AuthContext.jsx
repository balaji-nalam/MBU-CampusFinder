import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db, googleProvider } from '../api/firebase'

const AuthContext = createContext(null)

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  const fetchUserProfile = useCallback(async (uid) => {
    if (!db || !uid) {
      setUserProfile(null)
      return null
    }

    try {
      const profileRef = doc(db, 'users', uid)
      const profileSnapshot = await getDoc(profileRef)
      const profile = profileSnapshot.exists() ? profileSnapshot.data() : null
      setUserProfile(profile)
      return profile
    } catch (error) {
      console.error('Failed to load user profile:', error)
      setUserProfile(null)
      return null
    }
  }, [])

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      setCurrentUser(null)
      setUserProfile(null)
      return undefined
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      if (user) {
        const token = await user.getIdTokenResult(true)
        setIsAdmin(Boolean(token.claims.admin))
        await fetchUserProfile(user.uid)
      } else {
        setIsAdmin(false)
        setUserProfile(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [fetchUserProfile])

  const register = useCallback(
    async ({ fullName, email, password }) => {
      if (!auth || !db) {
        throw new Error('Firebase is not configured. Please add your project environment variables.')
      }

      const trimmedName = fullName.trim()
      const trimmedEmail = email.trim().toLowerCase()

      if (!trimmedName) {
        throw new Error('Full name is required.')
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        throw new Error('Please enter a valid email address.')
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long.')
      }

      const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password)
      const { user } = userCredential

      await updateProfile(user, { displayName: trimmedName })

      const profileRef = doc(db, 'users', user.uid)
      await setDoc(profileRef, {
        uid: user.uid,
        fullName: trimmedName,
        email: trimmedEmail,
        role: 'user',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      await sendEmailVerification(user)
      await fetchUserProfile(user.uid)

      return user
    },
    [fetchUserProfile],
  )

  const login = useCallback(async ({ email, password }) => {
    if (!auth) {
      throw new Error('Firebase is not configured. Please add your project environment variables.')
    }

    const userCredential = await signInWithEmailAndPassword(
      auth,
      email.trim().toLowerCase(),
      password,
    )

    if (!userCredential.user.emailVerified) {
      await signOut(auth)
      throw new Error('Please verify your email before logging in.')
    }

    await fetchUserProfile(userCredential.user.uid)
    return userCredential.user
  }, [fetchUserProfile])

  const loginWithGoogle = useCallback(async () => {
    if (!auth) {
      throw new Error('Firebase is not configured. Please add your project environment variables.')
    }

    const provider = googleProvider || new GoogleAuthProvider()
    const userCredential = await signInWithPopup(auth, provider)
    const { user } = userCredential

    if (db && user) {
      try {
        const profileRef = doc(db, 'users', user.uid)
        const profileSnapshot = await getDoc(profileRef)

        if (!profileSnapshot.exists()) {
          await setDoc(profileRef, {
            uid: user.uid,
            fullName: user.displayName?.trim() || 'Campus User',
            email: user.email?.trim().toLowerCase() || '',
            photoURL: user.photoURL || null,
            role: 'user',
            authProvider: 'google.com',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
        }
      } catch (profileError) {
        console.error('Failed to initialize user profile for Google user:', profileError)
      }
    }

    const token = await user.getIdTokenResult(true)
    setIsAdmin(Boolean(token.claims.admin))
    await fetchUserProfile(user.uid)
    setCurrentUser(user)

    return user
  }, [fetchUserProfile])

  const logout = useCallback(async () => {
    if (!auth) {
      return
    }

    await signOut(auth)
    setCurrentUser(null)
    setUserProfile(null)
  }, [])

  const resendVerificationEmail = useCallback(async () => {
    if (!auth || !auth.currentUser) {
      throw new Error('You must be signed in before requesting a new verification email.')
    }

    await sendEmailVerification(auth.currentUser)
  }, [])

  const resetPassword = useCallback(async (email) => {
    if (!auth) {
      throw new Error('Firebase is not configured. Please add your project environment variables.')
    }

    await sendPasswordResetEmail(auth, email.trim().toLowerCase())
  }, [])

  const refreshUser = useCallback(async () => {
    if (!auth || !auth.currentUser) {
      return null
    }

    await auth.currentUser.reload()
    const refreshedUser = auth.currentUser
    setCurrentUser({ ...refreshedUser })
    await fetchUserProfile(refreshedUser.uid)
    return refreshedUser
  }, [fetchUserProfile])

  const isGoogleUser = Boolean(
    currentUser?.providerData?.some((provider) => provider.providerId === 'google.com'),
  )

  const isEmailVerified = Boolean(currentUser?.emailVerified || isGoogleUser)

  const value = useMemo(
    () => ({
      currentUser,
      userProfile,
      loading,
      isAuthenticated: Boolean(currentUser),
      isEmailVerified,
      isGoogleUser,
      isAdmin,
      register,
      login,
      loginWithGoogle,
      logout,
      resendVerificationEmail,
      resetPassword,
      refreshUser,
      fetchUserProfile,
    }),
    [
      currentUser,
      fetchUserProfile,
      isAdmin,
      isEmailVerified,
      isGoogleUser,
      loading,
      login,
      loginWithGoogle,
      logout,
      refreshUser,
      register,
      resendVerificationEmail,
      resetPassword,
      userProfile,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext
