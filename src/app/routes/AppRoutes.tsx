// src/app/routes/AppRoutes.tsx

import React, { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { LoadingSpinner } from '@shared/ui/LoadingSpinner'
import { AuthGuard } from '@shared/guards/AuthGuard'

// Lazy load pages
const LandingPage = React.lazy(() => import('@pages/LandingPage'))
const LoginPage = React.lazy(() => import('@pages/LoginPage'))
const DashboardPage = React.lazy(() => import('@pages/DashboardPage'))
const WalletPage = React.lazy(() => import('@pages/WalletPage')) // Updated wallet
const MarketplacePage = React.lazy(() => import('@pages/MarketplacePage'))
const ProfilePage = React.lazy(() => import('@pages/ProfilePage'))
const ChatPage = React.lazy(() => import('@pages/ChatPage'))
const DAOPage = React.lazy(() => import('@pages/DAOPage'))
const SocialPage = React.lazy(() => import('@pages/SocialPage'))
const WorkPage = React.lazy(() => import('@pages/WorkPage'))
const HelpPage = React.lazy(() => import('@pages/HelpPage'))
const AboutPage = React.lazy(() => import('@pages/AboutPage'))

const P2PPage = React.lazy(() => import('@pages/P2PPage'))

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/about" element={<AboutPage />} />

        {/* Private Routes */}
        <Route path="/dashboard" element={
          <AuthGuard>
            <DashboardPage />
          </AuthGuard>
        } />
        
        {/* New Wallet Routes - Updated implementation */}
        <Route path="/wallet/*" element={
          <AuthGuard>
            <WalletPage />
          </AuthGuard>
        } />

        {/* P2P Routes - New standalone module */}
        <Route path="/p2p/*" element={
          <AuthGuard>
            <P2PPage />
          </AuthGuard>
        } />
        
        <Route path="/marketplace/*" element={
          <AuthGuard>
            <MarketplacePage />
          </AuthGuard>
        } />
        
        <Route path="/profile/:id" element={
          <AuthGuard>
            <ProfilePage />
          </AuthGuard>
        } />
        
        <Route path="/me/profile" element={
          <AuthGuard>
            <ProfilePage />
          </AuthGuard>
        } />
        
        <Route path="/chat/:userId" element={
          <AuthGuard>
            <ChatPage />
          </AuthGuard>
        } />
        
        <Route path="/dao/*" element={
          <AuthGuard>
            <DAOPage />
          </AuthGuard>
        } />
        
        <Route path="/social/*" element={
          <AuthGuard>
            <SocialPage />
          </AuthGuard>
        } />
        
        <Route path="/work/*" element={
          <AuthGuard>
            <WorkPage />
          </AuthGuard>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}