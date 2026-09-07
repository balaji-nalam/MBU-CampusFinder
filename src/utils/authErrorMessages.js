export function getAuthErrorMessage(code) {
  switch (code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.'
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password.'
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.'
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.'
    case 'auth/requires-recent-login':
      return 'Please sign in again and try that action.'
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again.'
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was cancelled.'
    case 'auth/cancelled-popup-request':
      return 'Google sign-in request was cancelled.'
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked by your browser. Please allow popups for this site and try again.'
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email using a different sign-in method. Please sign in with your email and password.'
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized for Google sign-in. Please ensure it is added to Authorized Domains in Firebase Console.'
    case 'auth/operation-not-allowed':
      return 'Google sign-in is not enabled in Firebase Console. Please enable Google provider in Firebase Authentication.'
    case 'auth/credential-already-in-use':
      return 'This credential is already linked to another user account.'
    default:
      return 'Something went wrong. Please try again.'
  }
}
