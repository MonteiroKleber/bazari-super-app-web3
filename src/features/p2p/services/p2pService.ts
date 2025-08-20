
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

/**
 * P2P Service - CRUD de ofertas e trades
 * Mock persistido em Zustand com hooks para integração backend/pallet futura
 */
class P2PService {
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getCurrentUserId(): string {
    // Em produção, pegar do authStore
    return 'user_123' // Mock
  }

  /**
   * Cria uma nova oferta P2P
   */
  async createOffer(params: CreateOfferParams): Promise<P2POffer> {
    try {
      const userId = this.getCurrentUserId()
      const now = Date.now()
      
      // Validações básicas
      if (parseFloat(params.minAmount) > parseFloat(params.maxAmount)) {
        throw new Error('Valor mínimo não pode ser maior que o máximo')
      }
      
      if (params.priceBZR <= 0) {
        throw new Error('Preço deve ser maior que zero')
      }
      
      if (params.paymentMethods.length === 0) {
        throw new Error('Selecione pelo menos um método de pagamento')
      }
      
      // Simular delay de API/blockchain
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const offer: P2POffer = {
        id: this.generateId(),
        side: params.side,
        priceBZR: params.priceBZR,
        minAmount: params.minAmount,
        maxAmount: params.maxAmount,
        availableAmount: params.side === 'SELL' ? params.maxAmount : '0',
        fiatCurrency: 'BRL',
        paymentMethods: params.paymentMethods,
        location: params.location,
        ownerId: userId,
        ownerName: 'João Silva', // Mock - em produção, buscar do profile
        ownerAvatarUrl: undefined,
        terms: params.terms,
        createdAt: now,
        stats: {
          completed: Math.floor(Math.random() * 50),
          cancelRatePct: Math.random() * 10,
          avgReleaseTimeSec: 300 + Math.random() * 1200
        },
        reputation: {
          score: 4.2 + Math.random() * 0.8,
          level: Math.random() > 0.5 ? 'trusted' : 'new'
        }
      }
      
      console.log('✅ P2P Offer Created:', offer.id)
      return offer
    } catch (error) {
      console.error('❌ Failed to create P2P offer:', error)
      throw error
    }
  }

  /**
   * Busca ofertas com filtros
   */
  async fetchOffers(filters?: Partial<P2PFilters>): Promise<P2POffer[]> {
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Mock - ofertas de exemplo
      const mockOffers: P2POffer[] = this.generateMockOffers()
      
      let filtered = mockOffers
      
      if (filters) {
        // Aplicar filtros
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
        
        if (filters.state) {
          filtered = filtered.filter(offer => 
            offer.location?.state?.toLowerCase().includes(filters.state!.toLowerCase())
          )
        }
        
        if (filters.ownerId) {
          filtered = filtered.filter(offer => offer.ownerId === filters.ownerId)
        }
        
        if (filters.q) {
          const query = filters.q.toLowerCase()
          filtered = filtered.filter(offer => 
            offer.ownerName?.toLowerCase().includes(query) ||
            offer.terms?.toLowerCase().includes(query) ||
            offer.location?.city?.toLowerCase().includes(query)
          )
        }
      }
      
      // Ordenar por reputação e data
      filtered.sort((a, b) => {
        const scoreA = a.reputation?.score || 0
        const scoreB = b.reputation?.score || 0
        if (scoreA !== scoreB) return scoreB - scoreA
        return b.createdAt - a.createdAt
      })
      
      return filtered
    } catch (error) {
      console.error('❌ Failed to fetch P2P offers:', error)
      throw new Error('Falha ao buscar ofertas')
    }
  }

  /**
   * Busca oferta por ID
   */
  async fetchOfferById(id: string): Promise<P2POffer | null> {
    try {
      const offers = await this.fetchOffers()
      return offers.find(offer => offer.id === id) || null
    } catch (error) {
      console.error('❌ Failed to fetch P2P offer:', error)
      throw new Error('Falha ao buscar oferta')
    }
  }

  /**
   * Cria um novo trade
   */
  async createTrade(params: CreateTradeParams): Promise<P2PTrade> {
    try {
      const now = Date.now()
      
      // Validações
      if (parseFloat(params.amountBZR) <= 0) {
        throw new Error('Quantidade deve ser maior que zero')
      }
      
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 600))
      
      const trade: P2PTrade = {
        id: this.generateId(),
        offerId: params.offerId,
        buyerId: params.buyerId,
        sellerId: params.sellerId,
        amountBZR: params.amountBZR,
        priceBZR: params.priceBZR,
        paymentMethod: params.paymentMethod,
        status: 'CREATED',
        timeline: [{
          ts: now,
          type: 'TRADE_CREATED',
          payload: {
            amountBZR: params.amountBZR,
            priceBZR: params.priceBZR,
            paymentMethod: params.paymentMethod
          }
        }]
      }
      
      console.log('✅ P2P Trade Created:', trade.id)
      return trade
    } catch (error) {
      console.error('❌ Failed to create P2P trade:', error)
      throw error
    }
  }

  /**
   * Atualiza status de um trade
   */
  async updateTradeStatus(
    tradeId: string, 
    status: P2PTrade['status'],
    payload?: any
  ): Promise<void> {
    try {
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 400))
      
      console.log('🔄 P2P Trade Status Updated:', { tradeId, status, payload })
    } catch (error) {
      console.error('❌ Failed to update trade status:', error)
      throw new Error('Falha ao atualizar status do trade')
    }
  }

  /**
   * Gera ofertas mock para desenvolvimento
   */
  private generateMockOffers(): P2POffer[] {
    const locations = [
      { city: 'São Paulo', state: 'SP' },
      { city: 'Rio de Janeiro', state: 'RJ' },
      { city: 'Belo Horizonte', state: 'MG' },
      { city: 'Brasília', state: 'DF' },
      { city: 'Curitiba', state: 'PR' }
    ]
    
    const names = [
      'João Silva', 'Maria Santos', 'Pedro Costa', 'Ana Oliveira',
      'Carlos Souza', 'Julia Lima', 'Rafael Alves', 'Fernanda Rocha'
    ]
    
    const paymentCombos: PaymentMethod[][] = [
      ['PIX'], ['TED'], ['PIX', 'TED'], ['PIX', 'DINHEIRO'], 
      ['DINHEIRO'], ['PIX', 'TED', 'DINHEIRO'], ['OUTRO']
    ]
    
    return Array.from({ length: 25 }, (_, i) => ({
      id: `offer_${i + 1}`,
      side: Math.random() > 0.5 ? 'BUY' : 'SELL',
      priceBZR: 4.8 + Math.random() * 0.6, // 4.8 a 5.4 BRL/BZR
      minAmount: (10 + Math.random() * 40).toFixed(2),
      maxAmount: (100 + Math.random() * 400).toFixed(2),
      availableAmount: (50 + Math.random() * 200).toFixed(2),
      fiatCurrency: 'BRL' as const,
      paymentMethods: paymentCombos[Math.floor(Math.random() * paymentCombos.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      ownerId: `user_${i + 1}`,
      ownerName: names[Math.floor(Math.random() * names.length)],
      terms: i % 3 === 0 ? 'Pagamento rápido, resposta em até 15 min' : undefined,
      createdAt: Date.now() - Math.random() * 86400000 * 7, // Última semana
      stats: {
        completed: Math.floor(Math.random() * 100),
        cancelRatePct: Math.random() * 15,
        avgReleaseTimeSec: 180 + Math.random() * 600
      },
      reputation: {
        score: 3.5 + Math.random() * 1.5,
        level: ['new', 'trusted', 'pro'][Math.floor(Math.random() * 3)] as any
      }
    }))
  }
}

export const p2pService = new P2PService()