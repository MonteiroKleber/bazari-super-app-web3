// ==========================================
// ⚙️ CONFIGURAÇÕES ADICIONAIS NECESSÁRIAS
// ==========================================

// 1. ✅ VERIFICAR: src/pages/P2PPage.tsx
// Certifique-se de que a rota está configurada corretamente:

import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AppShell } from '@shared/layout/AppShell'
import { 
  P2PHome,
  OffersBrowse,
  OfferCreate,
  OfferDetail,  // ← Certifique-se de que está importado
  TradeRoom,
  MyTrades,
  DisputesCenter,
  P2PSettings
} from '@features/p2p'

const P2PPage: React.FC = () => {
  return (
    <AppShell>
      <React.Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<P2PHome />} />
          <Route path="/offers" element={<OffersBrowse />} />
          <Route path="/offers/new" element={<OfferCreate />} />
          {/* ↓ ROTA CRÍTICA - deve estar ANTES de outras rotas dinâmicas */}
          <Route path="/offers/:id" element={<OfferDetail />} />
          <Route path="/trade/:id" element={<TradeRoom />} />
          <Route path="/my-trades" element={<MyTrades />} />
          <Route path="/disputes" element={<DisputesCenter />} />
          <Route path="/settings" element={<P2PSettings />} />
        </Routes>
      </React.Suspense>
    </AppShell>
  )
}

export default P2PPage