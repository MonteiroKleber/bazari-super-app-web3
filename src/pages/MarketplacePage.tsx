import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AppShell } from '@shared/layout/AppShell'
import { MarketplaceHome } from '@features/marketplace/components/MarketplaceHome'
import { MarketplaceListing } from '@features/marketplace/components/MarketplaceListing'
import { MarketplaceCreate } from '@features/marketplace/components/MarketplaceCreate'
import { MarketplaceMyListings } from '@features/marketplace/components/MarketplaceMyListings'
import { P2PHome } from '@features/marketplace/p2p/components/P2PHome'
import { P2PCreate } from '@features/marketplace/p2p/components/P2PCreate'
import { P2PPDP } from '@features/marketplace/p2p/components/P2PPDP'

const MarketplacePage: React.FC = () => {
  return (
    <AppShell returnTo="/dashboard">
      <Routes>
        <Route path="/" element={<MarketplaceHome />} />
        <Route path="/listing/:id" element={<MarketplaceListing />} />
        <Route path="/create" element={<MarketplaceCreate />} />
        <Route path="/my-listings" element={<MarketplaceMyListings />} />
        
        {/* P2P Routes */}
        <Route path="/p2p" element={<P2PHome />} />
        <Route path="/p2p/create" element={<P2PCreate />} />
        <Route path="/p2p/order/:id" element={<P2PPDP />} />
      </Routes>
    </AppShell>
  )
}

export default MarketplacePage
