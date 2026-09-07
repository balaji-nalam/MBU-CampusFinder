function FirebaseErrorFallback({ error }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f2ea',
        padding: '2rem',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: '600px',
          textAlign: 'center',
          background: 'rgba(255, 253, 248, 0.9)',
          border: '1px solid rgba(220, 229, 220, 0.95)',
          borderRadius: '16px',
          padding: '3rem 2rem',
        }}
      >
        <h1 style={{ fontSize: '2rem', color: '#0b6b53', marginBottom: '1rem' }}>
          Configuration Required
        </h1>
        <p style={{ color: '#6b7369', fontSize: '1rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
          Firebase credentials are not configured. The application cannot start without valid Firebase credentials.
        </p>
        <pre
          style={{
            background: '#f0f0f0',
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '1rem',
            overflow: 'auto',
            textAlign: 'left',
            fontSize: '0.85rem',
            color: '#333',
          }}
        >
          {error?.message || 'Firebase is not configured'}
        </pre>
        <p style={{ color: '#999', fontSize: '0.9rem', marginTop: '1.5rem' }}>
          Contact your administrator for Firebase credentials.
        </p>
      </div>
    </div>
  )
}

export default FirebaseErrorFallback
