import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext'
import { BuildProvider } from './contexts/BuildContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BuildProvider>
        <App />
      </BuildProvider>
    </AuthProvider>
  </StrictMode>,
)
