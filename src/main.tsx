import '@app/polyfills'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { AppProviders } from '@app/providers/AppProviders'
import { AppRoutes } from '@app/routes/AppRoutes'
import './index.css'

// Remove loading screen when app loads
document.body.classList.add('app-loaded')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  </React.StrictMode>,
)
