// ==========================================
// src/features/p2p/utils/mockGenerator.ts
// ==========================================

import type { P2PUserProfile, P2PMarketStats, P2PChatMessage } from '../types/p2p.types'

export class P2PMockGenerator {
  static generateUser(): P2PUserProfile {
    const names = ['Ana Silva', 'Carlos Mendes', 'Lucia Santos', 'Pedro Costa']
    const cities = ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Salvador']
    
    return {
      id: `user_${crypto.randomUUID().slice(0, 8)}`,
      name: names[Math.floor(Math.random() * names.length)],
      joinedAt: Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000,
      location: {
        city: cities[Math.floor(Math.random() * cities.length)],
        country: 'Brasil'
      },
      verification: {
        email: true,
        phone: Math.random() > 0.3,
        kyc: Math.random() > 0.7
      },
      preferences: {
        currency: 'BRL',
        language: 'pt',
        notifications: true
      }
    }
  }

  static generateTradeChat(tradeId: string, userIds: string[]): P2PChatMessage[] {
    const messages: P2PChatMessage[] = []
    const baseTime = Date.now() - 2 * 60 * 60 * 1000
    
    messages.push({
      id: crypto.randomUUID(),
      tradeId,
      senderId: 'system',
      text: 'Trade iniciado. Vendedor deve bloquear BZR em escrow.',
      type: 'system',
      timestamp: baseTime
    })
    
    const conversation = [
      { from: userIds[0], text: 'Olá! Já bloqueei o BZR no escrow.' },
      { from: userIds[1], text: 'Perfeito! Vou fazer o PIX agora.' },
      { from: userIds[1], text: 'PIX enviado! Segue o comprovante.', type: 'payment_proof' },
      { from: userIds[0], text: 'Recebido! Liberando o BZR agora.' }
    ]
    
    conversation.forEach((msg, i) => {
      messages.push({
        id: crypto.randomUUID(),
        tradeId,
        senderId: msg.from,
        text: msg.text,
        type: (msg as any).type || 'text',
        timestamp: baseTime + (i + 1) * 15 * 60 * 1000,
        ...(msg.type === 'payment_proof' && {
          attachments: [{
            url: 'mock://comprovante.jpg',
            type: 'image/jpeg',
            name: 'comprovante_pix.jpg'
          }]
        })
      })
    })
    
    return messages
  }

  static generateMarketStats(): P2PMarketStats {
    return {
      totalVolume24h: {
        BZR: 15420 + Math.random() * 5000,
        BRL: 78500 + Math.random() * 25000
      },
      avgPrice24h: 5.15 + (Math.random() - 0.5) * 0.3,
      activeOrders: 45 + Math.floor(Math.random() * 20),
      activeTrades: 12 + Math.floor(Math.random() * 8),
      priceChange24h: (Math.random() - 0.5) * 10
    }
  }
}