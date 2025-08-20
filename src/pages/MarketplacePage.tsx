// src/pages/MarketplacePage.tsx

import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AppShell } from '@shared/layout/AppShell'

// Marketplace Components
import { MarketplaceHome } from '@features/marketplace/components/MarketplaceHome'
import { MarketplaceListing } from '@features/marketplace/components/MarketplaceListing'
import { MarketplaceCreate } from '@features/marketplace/components/MarketplaceCreate'
import { MarketplaceMyListings } from '@features/marketplace/components/MarketplaceMyListings'

// Nova página de navegação completa
const MarketplaceBrowse = React.lazy(() => import('@features/marketplace/components/MarketplaceBrowse'))



// Enterprise Components (lazy loaded for better performance)
const EnterpriseList = React.lazy(() => import('@pages/marketplace/enterprise/EnterpriseList').then(module => ({ default: module.EnterpriseList })))
const EnterpriseCreate = React.lazy(() => import('@pages/marketplace/enterprise/EnterpriseCreate').then(module => ({ default: module.EnterpriseCreate })))
const EnterpriseDetail = React.lazy(() => import('@pages/marketplace/enterprise/EnterpriseDetail').then(module => ({ default: module.EnterpriseDetail })))


const MarketplacePage: React.FC = () => {
  return (
    <AppShell returnTo="/dashboard">
      <React.Suspense fallback={
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bazari-red"></div>
        </div>
      }>
        <Routes>
          {/* Main Marketplace Routes */}
          <Route path="/" element={<MarketplaceHome />} />
          <Route path="/browse" element={<MarketplaceBrowse />} />
          <Route path="/listing/:id" element={<MarketplaceListing />} />
          <Route path="/create" element={<MarketplaceCreate />} />
          <Route path="/my-listings" element={<MarketplaceMyListings />} />
          
          {/* Enterprise Routes */}
          <Route path="/enterprises" element={<EnterpriseList />} />
          <Route path="/enterprises/create" element={<EnterpriseCreate />} />
          <Route path="/enterprises/:id" element={<EnterpriseDetail />} />
        </Routes>
      </React.Suspense>
    </AppShell>
  )
}

export default MarketplacePage