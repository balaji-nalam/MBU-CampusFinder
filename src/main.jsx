import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import FirebaseErrorFallback from './components/FirebaseErrorFallback.jsx'
import { firebaseInitError } from './api/firebase.js'
import './styles/globals.css'
import './styles/layout.css'
import './styles/responsive.css'
import './styles/landing.css'
import './styles/auth.css'

const rootContent = firebaseInitError ? (
  <FirebaseErrorFallback error={firebaseInitError} />
) : (
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)

ReactDOM.createRoot(document.getElementById('root')).render(rootContent)
