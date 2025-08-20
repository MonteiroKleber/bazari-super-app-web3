// src/pages/P2PPage.tsx
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AppShell } from '@shared/layout/AppShell'
import { 
  P2PHome,
  OffersBrowse,
  OfferCreate,
  OfferDetail,
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

// ================================
// INTEGRAÇÃO COM AppRoutes.tsx
// ================================

/*
Para integrar o módulo P2P ao projeto, adicione estas linhas ao arquivo src/app/routes/AppRoutes.tsx:

1. Import no topo do arquivo:
```typescript
const P2PPage = React.lazy(() => import('@pages/P2PPage'))
```

2. Adicione a rota dentro do componente AppRoutes, na seção de rotas privadas:
```typescript
// P2P Routes - New standalone module
<Route path="/p2p/*" element={
  <AuthGuard>
    <P2PPage />
  </AuthGuard>
} />
```

3. Certifique-se de que a rota P2P vem ANTES da rota do marketplace (se existir conflito):
```typescript
// P2P deve vir antes de /marketplace/* se houver conflito
<Route path="/p2p/*" element={<AuthGuard><P2PPage /></AuthGuard>} />
<Route path="/marketplace/*" element={<AuthGuard><MarketplacePage /></AuthGuard>} />
```

Estrutura final das rotas P2P:
- /p2p                    -> P2PHome (landing + atalhos)
- /p2p/offers             -> OffersBrowse (abas, filtros, listagem)  
- /p2p/offers/new         -> OfferCreate (criar anúncio BUY/SELL)
- /p2p/offers/:id         -> OfferDetail (detalhe + iniciar trade)
- /p2p/trade/:id          -> TradeRoom (sala da negociação + escrow)
- /p2p/disputes           -> DisputesCenter (listagem de disputas)
- /p2p/settings           -> P2PSettings (preferências do módulo)

Links para perfil: todos usam buildProfileRoute(userId) que aponta para /profile/:userId
*/