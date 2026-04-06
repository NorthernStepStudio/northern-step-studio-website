import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BuildProvider } from './contexts/BuildContext'

// Note: AuthProvider removed for Amazon-compliant public site
// Login/Register features are for paying members only

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BuildProvider>
      <App />
    </BuildProvider>
  </StrictMode>,
)
