function AuthForm({ title, subtitle, onSubmit, submitLabel, isSubmitting, children, footer }) {
  return (
    <section className="page-card auth-card">
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}

      <form onSubmit={onSubmit} className="auth-form">
        {children}

        <button className="primary-button auth-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Please wait...' : submitLabel}
        </button>
      </form>

      {footer && <div className="auth-footer">{footer}</div>}
    </section>
  )
}

export default AuthForm
