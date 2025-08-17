import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { I18nProvider } from './I18nProvider'
import { NotificationProvider } from './NotificationProvider'

interface AppProvidersProps {
  children: React.ReactNode
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <BrowserRouter>
      <I18nProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </I18nProvider>
    </BrowserRouter>
  )
}
