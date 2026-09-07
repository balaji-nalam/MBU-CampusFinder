import GoogleIcon from '../common/GoogleIcon'

function GoogleSignInButton({
  onClick,
  isLoading = false,
  disabled = false,
  text = 'Continue with Google',
  loadingText = 'Signing in...',
}) {
  return (
    <button
      type="button"
      className="google-auth-button"
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
    >
      <GoogleIcon />
      <span>{isLoading ? loadingText : text}</span>
    </button>
  )
}

export default GoogleSignInButton
