import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import React from 'react'

createRoot(document.getElementById('root')!).render(

  <StrictMode>
 <AuthProvider>
  <App />
</AuthProvider>
  </StrictMode>

)
