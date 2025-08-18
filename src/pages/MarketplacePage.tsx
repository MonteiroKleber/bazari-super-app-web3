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

// P2P Components
import { P2PHome } from '@features/marketplace/p2p/components/P2PHome'
import { P2PCreate } from '@features/marketplace/p2p/components/P2PCreate'
import { P2PPDP } from '@features/marketplace/p2p/components/P2PPDP'


// Enterprise Components (lazy loaded for better performance)
const EnterpriseList = React.lazy(() => import('@pages/marketplace/enterprise/EnterpriseList').then(module => ({ default: module.EnterpriseList })))
const EnterpriseCreate = React.lazy(() => import('@pages/marketplace/enterprise/EnterpriseCreate').then(module => ({ default: module.EnterpriseCreate })))
const EnterpriseDetail = React.lazy(() => import('@pages/marketplace/enterprise/EnterpriseDetail').then(module => ({ default: module.EnterpriseDetail })))

// P2P Additional Components (lazy loaded)
const P2PList = React.lazy(() => import('@features/marketplace/components/p2p/P2PList').then(module => ({ default: module.P2PList })))
const P2PMyOrders = React.lazy(() => import('@features/marketplace/components/p2p/P2PMyOrders').then(module => ({ default: module.P2PMyOrders })))

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
          
          {/* P2P Routes */}
          <Route path="/p2p" element={<P2PHome />} />
          <Route path="/p2p/list" element={<P2PList />} />
          <Route path="/p2p/create" element={<P2PCreate />} />
          <Route path="/p2p/my" element={<P2PMyOrders />} />
          <Route path="/p2p/:id" element={<P2PPDP />} />
          <Route path="/p2p/order/:id" element={<P2PPDP />} />
          
          {/* Legacy P2P route support */}
          <Route path="/p2p/order/:id" element={<P2PPDP />} />
        </Routes>
      </React.Suspense>
    </AppShell>
  )
}

export default MarketplacePage