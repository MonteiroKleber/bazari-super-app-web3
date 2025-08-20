// ==========================================
// src/features/p2p/services/p2pService.ts
// ==========================================

import type { P2POffer, P2PTrade, PaymentMethod, P2PFilters } from '../types/p2p.types'

export interface CreateOfferParams {
  side: 'BUY' | 'SELL'
  priceBZR: number
  minAmount: string
  maxAmount: string
  paymentMethods: PaymentMethod[]
  terms?: string
  location?: {
    country?: string
    state?: string
    city?: string
  }
}

export interface CreateTradeParams {
  offerId: string
  buyerId: string
  sellerId: string
  amountBZR: string
  paymentMethod: PaymentMethod
  priceBZR: number
}

class P2PService {
  private mockOffers: P2POffer[] = []
  private mockTrades: P2PTrade[] = []
  private lastOfferId = 1000
  private lastTradeId = 2000

  constructor() {
    this.initializeMockData()
  }

  private generateMockOffers(): P2POffer[] {
    const users = [
      { id: 'user_001', name: 'Ana Silva', rating: 4.8, trades: 45 },
      { id: 'user_002', name: 'Carlos Mendes', rating: 4.6, trades: 23 },
      { id: 'user_003', name: 'Lucia Santos', rating: 4.9, trades: 78 },
      { id: 'user_004', name: 'Pedro Costa', rating: 4.3, trades: 12 },
      { id: 'user_005', name: 'Maria Oliveira', rating: 4.7, trades: 34 }
    ]

    const cities = ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Salvador', 'Brasília']
    const states = ['SP', 'RJ', 'MG', 'BA', 'DF']

    return users.flatMap(user => [
      // Ofertas de VENDA
      {
        id: `offer_sell_${this.lastOfferId++}`,
        side: 'SELL' as const,
        priceBZR: 5.10 + Math.random() * 0.40,
        minAmount: (50 + Math.random() * 50).toFixed(0),
        maxAmount: (500 + Math.random() * 1500).toFixed(0),
        availableAmount: (400 + Math.random() * 1100).toFixed(0),
        fiatCurrency: 'BRL' as const,
        paymentMethods: Math.random() > 0.5 ? ['PIX', 'TED'] : ['PIX'],
        location: {
          city: cities[Math.floor(Math.random() * cities.length)],
          state: states[Math.floor(Math.random() * states.length)],
          country: 'Brasil'
        },
        ownerId: user.id,
        ownerName: user.name,
        terms: Math.random() > 0.6 ? 'Pagamento em até 30 minutos. Somente pessoas verificadas.' : undefined,
        createdAt: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
        stats: {
          completed: user.trades,
          cancelRatePct: Math.random() * 5,
          avgReleaseTimeSec: 300 + Math.random() * 900
        },
        reputation: {
          score: user.rating,
          level: user.rating > 4.7 ? 'trusted' : user.rating > 4.4 ? 'pro' : 'new'
        }
      },
      // Ofertas de COMPRA
      {
        id: `offer_buy_${this.lastOfferId++}`,
        side: 'BUY' as const,
        priceBZR: 5.00 + Math.random() * 0.30,
        minAmount: (100 + Math.random() * 100).toFixed(0),
        maxAmount: (800 + Math.random() * 1200).toFixed(0),
        availableAmount: '0',
        fiatCurrency: 'BRL' as const,
        paymentMethods: ['PIX', 'TED'].slice(0, Math.floor(Math.random() * 2) + 1) as PaymentMethod[],
        location: {
          city: cities[Math.floor(Math.random() * cities.length)],
          state: states[Math.floor(Math.random() * states.length)],
          country: 'Brasil'
        },
        ownerId: user.id,
        ownerName: user.name,
        terms: Math.random() > 0.7 ? 'Compro BZR em grandes quantidades. Preferência para vendedores com boa reputação.' : undefined,
        createdAt: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
        stats: {
          completed: user.trades,
          cancelRatePct: Math.random() * 5,
          avgReleaseTimeSec: 300 + Math.random() * 900
        },
        reputation: {
          score: user.rating,
          level: user.rating > 4.7 ? 'trusted' : user.rating > 4.4 ? 'pro' : 'new'
        }
      }
    ])
  }

  private initializeMockData(): void {
    this.mockOffers = this.generateMockOffers()
  }

  async createOffer(params: CreateOfferParams): Promise<P2POffer> {
    await new Promise(resolve => setTimeout(resolve, 800))
    
    if (parseFloat(params.minAmount) > parseFloat(params.maxAmount)) {
      throw new Error('Valor mínimo não pode ser maior que o máximo')
    }
    if (params.priceBZR <= 0) {
      throw new Error('Preço deve ser maior que zero')
    }
    if (params.paymentMethods.length === 0) {
      throw new Error('Selecione pelo menos um método de pagamento')
    }

    const offer: P2POffer = {
      id: `offer_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`,
      side: params.side,
      priceBZR: params.priceBZR,
      minAmount: params.minAmount,
      maxAmount: params.maxAmount,
      availableAmount: params.side === 'SELL' ? params.maxAmount : '0',
      fiatCurrency: 'BRL',
      paymentMethods: params.paymentMethods,
      location: params.location,
      ownerId: 'current_user',
      ownerName: 'Você',
      terms: params.terms,
      createdAt: Date.now(),
      stats: {
        completed: 0,
        cancelRatePct: 0,
        avgReleaseTimeSec: 0
      },
      reputation: {
        score: 4.5,
        level: 'new'
      }
    }

    this.mockOffers.unshift(offer)
    return offer
  }

  async fetchOffers(filters?: Partial<P2PFilters>): Promise<P2POffer[]> {
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700))
    
    let filtered = [...this.mockOffers]

    if (filters) {
      if (filters.side) {
        filtered = filtered.filter(offer => offer.side === filters.side)
      }
      if (filters.payment) {
        filtered = filtered.filter(offer => 
          offer.paymentMethods.includes(filters.payment!)
        )
      }
      if (filters.priceMin) {
        filtered = filtered.filter(offer => offer.priceBZR >= filters.priceMin!)
      }
      if (filters.priceMax) {
        filtered = filtered.filter(offer => offer.priceBZR <= filters.priceMax!)
      }
      if (filters.reputationMin) {
        filtered = filtered.filter(offer => 
          offer.reputation?.score && offer.reputation.score >= filters.reputationMin!
        )
      }
      if (filters.city) {
        filtered = filtered.filter(offer =>
          offer.location?.city?.toLowerCase().includes(filters.city!.toLowerCase())
        )
      }
      if (filters.q) {
        const query = filters.q.toLowerCase()
        filtered = filtered.filter(offer =>
          offer.ownerName?.toLowerCase().includes(query) ||
          offer.terms?.toLowerCase().includes(query)
        )
      }
    }

    return filtered
  }

  async createTrade(params: CreateTradeParams): Promise<P2PTrade> {
    await new Promise(resolve => setTimeout(resolve, 600))
    
    const trade: P2PTrade = {
      id: `trade_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`,
      offerId: params.offerId,
      buyerId: params.buyerId,
      sellerId: params.sellerId,
      amountBZR: params.amountBZR,
      priceBZR: params.priceBZR,
      paymentMethod: params.paymentMethod,
      status: 'CREATED',
      timeline: [{
        ts: Date.now(),
        type: 'CREATED',
        payload: { 
          amount: params.amountBZR, 
          price: params.priceBZR,
          total: (parseFloat(params.amountBZR) * params.priceBZR).toFixed(2)
        }
      }]
    }

    this.mockTrades.unshift(trade)
    return trade
  }

  async fetchTrades(userId: string): Promise<P2PTrade[]> {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    return this.mockTrades.filter(trade => 
      trade.buyerId === userId || trade.sellerId === userId
    )
  }

  async getTradeById(id: string): Promise<P2PTrade | undefined> {
    await new Promise(resolve => setTimeout(resolve, 200))
    return this.mockTrades.find(trade => trade.id === id)
  }

  async updateTradeStatus(
    tradeId: string, 
    status: P2PTrade['status'], 
    data?: Record<string, any>
  ): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const trade = this.mockTrades.find(t => t.id === tradeId)
    if (trade) {
      trade.status = status
      trade.timeline.push({
        ts: Date.now(),
        type: status,
        payload: data
      })
    }
  }

  getAllOffers(): P2POffer[] {
    return [...this.mockOffers]
  }
  
  getAllTrades(): P2PTrade[] {
    return [...this.mockTrades]
  }
  
  clearMockData(): void {
    this.mockOffers = []
    this.mockTrades = []
  }

  regenerateMockOffers(): void {
    this.mockOffers = this.generateMockOffers()
  }
}

export const p2pService = new P2PService()