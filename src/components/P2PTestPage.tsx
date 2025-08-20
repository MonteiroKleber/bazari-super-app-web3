// ==========================================
// TESTE RÁPIDO - Adicione esta rota temporária
// src/components/P2PTestPage.tsx
// ==========================================

import React, { useEffect, useState } from 'react'
import { p2pService } from '@features/p2p/services/p2pService'
import type { P2POffer } from '@features/p2p/types/p2p.types'

export const P2PTestPage: React.FC = () => {
  const [allOffers, setAllOffers] = useState<P2POffer[]>([])
  const [specificOffer, setSpecificOffer] = useState<P2POffer | null>(null)
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    console.log(message)
    setLogs(prev => [...prev, message])
  }

  useEffect(() => {
    const runTest = async () => {
      try {
        addLog('🧪 Iniciando teste P2P...')
        
        // Teste 1: Buscar todas as ofertas
        addLog('📊 Buscando todas as ofertas...')
        const offers = await p2pService.fetchOffers()
        addLog(`✅ Carregadas ${offers.length} ofertas`)
        setAllOffers(offers)
        
        // Teste 2: Buscar oferta específica
        const targetId = 'buy_user_004_1755707350436_3'
        addLog(`🔍 Buscando oferta específica: ${targetId}`)
        
        const found = await p2pService.fetchOfferById(targetId)
        if (found) {
          addLog(`✅ SUCESSO! Oferta encontrada: ${found.ownerName}`)
          setSpecificOffer(found)
        } else {
          addLog(`❌ FALHA! Oferta não encontrada`)
          
          // Debug: mostrar IDs similares
          const buyOffers = offers.filter(o => o.side === 'BUY')
          const user004Offers = offers.filter(o => o.ownerId === 'user_004')
          
          addLog(`📋 Ofertas BUY: ${buyOffers.length}`)
          addLog(`👤 Ofertas user_004: ${user004Offers.length}`)
          
          if (buyOffers.length > 0) {
            addLog(`🔍 Primeiro ID BUY: ${buyOffers[0].id}`)
          }
        }
        
      } catch (error) {
        addLog(`❌ Erro: ${error}`)
      } finally {
        setLoading(false)
      }
    }

    runTest()
  }, [])

  if (loading) {
    return <div>Carregando teste...</div>
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🧪 Teste P2P Service</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>📊 Logs:</h2>
        <div style={{ background: '#f0f0f0', padding: '10px', borderRadius: '5px' }}>
          {logs.map((log, i) => (
            <div key={i}>{log}</div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>📋 Todas as ofertas ({allOffers.length}):</h2>
        <table style={{ border: '1px solid #ccc', borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: '5px' }}>ID</th>
              <th style={{ border: '1px solid #ccc', padding: '5px' }}>Tipo</th>
              <th style={{ border: '1px solid #ccc', padding: '5px' }}>Proprietário</th>
              <th style={{ border: '1px solid #ccc', padding: '5px' }}>Preço</th>
            </tr>
          </thead>
          <tbody>
            {allOffers.map(offer => (
              <tr key={offer.id}>
                <td style={{ border: '1px solid #ccc', padding: '5px' }}>{offer.id}</td>
                <td style={{ border: '1px solid #ccc', padding: '5px' }}>{offer.side}</td>
                <td style={{ border: '1px solid #ccc', padding: '5px' }}>{offer.ownerName}</td>
                <td style={{ border: '1px solid #ccc', padding: '5px' }}>R$ {offer.priceBZR}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {specificOffer && (
        <div>
          <h2>🎯 Oferta específica encontrada:</h2>
          <pre style={{ background: '#e8f5e8', padding: '10px', borderRadius: '5px' }}>
            {JSON.stringify(specificOffer, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <h3>🔗 Links de teste:</h3>
        <ul>
          <li>
            <a href="/p2p/offers/buy_user_004_1755707350436_3">
              Oferta específica (original)
            </a>
          </li>
          {allOffers.filter(o => o.side === 'BUY').slice(0, 3).map(offer => (
            <li key={offer.id}>
              <a href={`/p2p/offers/${offer.id}`}>
                {offer.id} - {offer.ownerName}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// ==========================================
// PARA USAR: Adicione esta rota temporária em AppRoutes.tsx:
// ==========================================

/*
import { P2PTestPage } from '@components/P2PTestPage'

// Dentro das rotas:
<Route path="/test-p2p" element={<P2PTestPage />} />

// Depois acesse: http://localhost:3000/test-p2p
*/