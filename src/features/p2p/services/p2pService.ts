// ==========================================
// src/features/p2p/services/p2pService.ts - COMPLETO
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

/**
 * P2P Service - CRUD de ofertas e trades
 * ✅ CORRIGIDO: Geração consistente de dados mock
 */
class P2PService {
  // ✅ CORREÇÃO: Cache estático para dados mock consistentes
  private static mockOffersCache: P2POffer[] | null = null
  private static mockTradesCache: P2PTrade[] = []
  private static initialized = false

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getCurrentUserId(): string {
    // Em produção, pegar do authStore
    return 'user_123' // Mock
  }

  /**
   * ✅ CORREÇÃO: Gerar ofertas mock com IDs consistentes
   */
  private generateMockOffers(): P2POffer[] {
    // ✅ Se já foi inicializado, retornar cache
    if (P2PService.mockOffersCache && P2PService.initialized) {
      console.log('📋 Retornando cache de ofertas:', P2PService.mockOffersCache.length)
      return P2PService.mockOffersCache
    }

    console.log('🏭 Gerando ofertas mock...')

    const users = [
      { id: 'user_001', name: 'Ana Silva', rating: 4.8, trades: 45, avatar: undefined },
      { id: 'user_002', name: 'Carlos Mendes', rating: 4.6, trades: 23, avatar: undefined },
      { id: 'user_003', name: 'Lucia Santos', rating: 4.9, trades: 78, avatar: undefined },
      { id: 'user_004', name: 'Pedro Costa', rating: 4.3, trades: 12, avatar: undefined },
      { id: 'user_005', name: 'Maria Oliveira', rating: 4.7, trades: 34, avatar: undefined }
    ]

    const cities = [
      { city: 'São Paulo', state: 'SP' },
      { city: 'Rio de Janeiro', state: 'RJ' },
      { city: 'Belo Horizonte', state: 'MG' },
      { city: 'Salvador', state: 'BA' },
      { city: 'Brasília', state: 'DF' }
    ]

    const paymentMethodCombos = [
      ['PIX'],
      ['PIX', 'TED'],
      ['PIX', 'DINHEIRO'],
      ['TED', 'DINHEIRO'],
      ['PIX', 'TED', 'DINHEIRO']
    ]

    const terms = [
      'Pagamento em até 30 minutos. Somente pessoas verificadas.',
      'Aceito pagamento rápido. Boa reputação necessária.',
      'Transação segura e rápida. Escrow disponível.',
      'Negociação apenas com usuários verificados.',
      'Pagamento instantâneo. Sem burocracia.',
      null,
      'Aceito grandes volumes. Preços negociáveis.',
      'Transação rápida e segura.',
      null,
      'Experiência comprovada no mercado P2P.'
    ]

    const offers: P2POffer[] = []
    // ✅ CORREÇÃO: Base timestamp fixa para IDs consistentes
    const baseTimestamp = 1755707000000 // Timestamp fixo

    // Gerar ofertas SELL (vendas) - 8 ofertas
    users.forEach((user, index) => {
      if (index < 8) { // 8 ofertas de venda
        const location = cities[index % cities.length] // Distribuição sequencial
        const paymentMethods = paymentMethodCombos[index % paymentMethodCombos.length]
        
        offers.push({
          // ✅ CORREÇÃO: ID consistente baseado em índice fixo
          id: `sell_${user.id}_${baseTimestamp}_${index}`,
          side: 'SELL',
          priceBZR: Number((5.05 + (index * 0.05)).toFixed(2)), // Preços incrementais
          minAmount: String(50 + (index * 10)), // 50, 60, 70...
          maxAmount: String(500 + (index * 100)), // 500, 600, 700...
          availableAmount: String(400 + (index * 80)), // 400, 480, 560...
          fiatCurrency: 'BRL',
          paymentMethods: paymentMethods as PaymentMethod[],
          location: {
            city: location.city,
            state: location.state,
            country: 'Brasil'
          },
          ownerId: user.id,
          ownerName: user.name,
          ownerAvatarUrl: user.avatar,
          terms: terms[index % terms.length],
          createdAt: baseTimestamp - (index * 60 * 60 * 1000), // Intervalos de 1h
          stats: {
            completed: user.trades,
            cancelRatePct: Math.round(index * 0.5 * 100) / 100, // 0.0, 0.5, 1.0...
            avgReleaseTimeSec: 300 + (index * 60) // 300, 360, 420...
          },
          reputation: {
            score: user.rating,
            level: user.rating > 4.7 ? 'trusted' : user.rating > 4.5 ? 'pro' : 'new'
          }
        })
      }
    })

    // Gerar ofertas BUY (compras) - 7 ofertas
    users.forEach((user, index) => {
      if (index < 7) { // 7 ofertas de compra
        const location = cities[index % cities.length]
        const paymentMethods = paymentMethodCombos[index % paymentMethodCombos.length]
        
        offers.push({
          // ✅ CORREÇÃO: ID consistente baseado em índice fixo
          id: `buy_${user.id}_${baseTimestamp}_${index}`,
          side: 'BUY',
          priceBZR: Number((4.95 + (index * 0.04)).toFixed(2)), // Preços incrementais
          minAmount: String(100 + (index * 20)), // 100, 120, 140...
          maxAmount: String(1000 + (index * 200)), // 1000, 1200, 1400...
          availableAmount: '0', // BUY não tem amount disponível
          fiatCurrency: 'BRL',
          paymentMethods: paymentMethods as PaymentMethod[],
          location: {
            city: location.city,
            state: location.state,
            country: 'Brasil'
          },
          ownerId: user.id,
          ownerName: user.name,
          ownerAvatarUrl: user.avatar,
          terms: terms[index % terms.length],
          createdAt: baseTimestamp - (index * 90 * 60 * 1000), // Intervalos de 1.5h
          stats: {
            completed: user.trades,
            cancelRatePct: Math.round(index * 0.3 * 100) / 100,
            avgReleaseTimeSec: 300 + (index * 45)
          },
          reputation: {
            score: user.rating,
            level: user.rating > 4.7 ? 'trusted' : user.rating > 4.5 ? 'pro' : 'new'
          }
        })
      }
    })

    // ✅ CORREÇÃO: Cachear resultados
    P2PService.mockOffersCache = offers
    P2PService.initialized = true

    console.log('✅ Ofertas mock geradas:', offers.length)
    console.log('📋 IDs gerados:', offers.map(o => `${o.id} (${o.side})`))

    return offers
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
      
      // Adicionar ao cache
      if (P2PService.mockOffersCache) {
        P2PService.mockOffersCache.unshift(offer)
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
      console.log('🔍 fetchOffers chamado com filtros:', filters)
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // ✅ CORREÇÃO: Usar gerador consistente
      const mockOffers: P2POffer[] = this.generateMockOffers()
      
      let filtered = mockOffers
      
      if (filters) {
        // Aplicar filtros
        if (filters.side) {
          filtered = filtered.filter(offer => offer.side === filters.side)
          console.log(`📊 Filtro side=${filters.side}: ${filtered.length} ofertas`)
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
      
      console.log('✅ fetchOffers retornando:', filtered.length, 'ofertas')
      return filtered
    } catch (error) {
      console.error('❌ Failed to fetch P2P offers:', error)
      throw new Error('Falha ao buscar ofertas')
    }
  }

  /**
   * ✅ CORREÇÃO: Busca oferta por ID com debug melhorado
   */
  async fetchOfferById(id: string): Promise<P2POffer | null> {
    try {
      console.log(`🔍 Iniciando busca para ID: ${id}`)
      
      // ✅ CORREÇÃO: Usar cache/dados consistentes
      const offers = this.generateMockOffers()
      console.log(`📋 Total de ofertas disponíveis: ${offers.length}`)
      console.log(`📋 IDs disponíveis:`, offers.slice(0, 5).map(o => o.id))
      
      const offer = offers.find(offer => offer.id === id)
      
      if (offer) {
        console.log(`✅ Oferta encontrada:`, offer.id)
        return offer
      } else {
        console.log(`❌ Oferta não encontrada para ID: ${id}`)
        console.log(`❌ Verificando se ID contém padrão esperado...`)
        console.log(`❌ Ofertas SELL disponíveis:`, offers.filter(o => o.side === 'SELL').map(o => o.id))
        console.log(`❌ Ofertas BUY disponíveis:`, offers.filter(o => o.side === 'BUY').map(o => o.id))
        return null
      }
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
      
      // Adicionar ao cache
      P2PService.mockTradesCache.unshift(trade)
      
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
  ): Promise<P2PTrade> {
    try {
      await new Promise(resolve => setTimeout(resolve, 400))
      
      const tradeIndex = P2PService.mockTradesCache.findIndex(t => t.id === tradeId)
      if (tradeIndex === -1) {
        throw new Error('Trade não encontrado')
      }
      
      const trade = P2PService.mockTradesCache[tradeIndex]
      const now = Date.now()
      
      // Mapeamento de status para eventos
      const statusEventMap: Record<P2PTrade['status'], string> = {
        CREATED: 'TRADE_CREATED',
        PAID: 'PAYMENT_SENT',
        CONFIRMED: 'PAYMENT_CONFIRMED',
        COMPLETED: 'TRADE_COMPLETED',
        CANCELLED: 'TRADE_CANCELLED',
        DISPUTED: 'DISPUTE_OPENED'
      }
      
      const updatedTrade: P2PTrade = {
        ...trade,
        status,
        timeline: [
          ...trade.timeline,
          {
            ts: now,
            type: statusEventMap[status] || 'STATUS_UPDATED',
            payload
          }
        ]
      }
      
      P2PService.mockTradesCache[tradeIndex] = updatedTrade
      
      console.log('✅ P2P Trade Updated:', tradeId, 'to', status)
      return updatedTrade
    } catch (error) {
      console.error('❌ Failed to update P2P trade:', error)
      throw error
    }
  }

  /**
   * Busca trades por filtros
   */
  async fetchTrades(filters?: { 
    userId?: string 
    status?: P2PTrade['status']
    offerId?: string 
  }): Promise<P2PTrade[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      
      let trades = [...P2PService.mockTradesCache]
      
      if (filters) {
        if (filters.userId) {
          trades = trades.filter(trade => 
            trade.buyerId === filters.userId || trade.sellerId === filters.userId
          )
        }
        
        if (filters.status) {
          trades = trades.filter(trade => trade.status === filters.status)
        }
        
        if (filters.offerId) {
          trades = trades.filter(trade => trade.offerId === filters.offerId)
        }
      }
      
      // Ordenar por data mais recente
      trades.sort((a, b) => {
        const latestA = Math.max(...a.timeline.map(t => t.ts))
        const latestB = Math.max(...b.timeline.map(t => t.ts))
        return latestB - latestA
      })
      
      return trades
    } catch (error) {
      console.error('❌ Failed to fetch P2P trades:', error)
      throw new Error('Falha ao buscar negociações')
    }
  }

  /**
   * Busca trade por ID
   */
  async fetchTradeById(id: string): Promise<P2PTrade | null> {
    try {
      await new Promise(resolve => setTimeout(resolve, 200))
      
      const trade = P2PService.mockTradesCache.find(t => t.id === id)
      return trade || null
    } catch (error) {
      console.error('❌ Failed to fetch P2P trade:', error)
      throw new Error('Falha ao buscar negociação')
    }
  }

  /**
   * Remove uma oferta
   */
  async removeOffer(id: string): Promise<void> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      
      if (P2PService.mockOffersCache) {
        const index = P2PService.mockOffersCache.findIndex(o => o.id === id)
        if (index !== -1) {
          P2PService.mockOffersCache.splice(index, 1)
          console.log('✅ Oferta removida:', id)
        }
      }
    } catch (error) {
      console.error('❌ Failed to remove P2P offer:', error)
      throw new Error('Falha ao remover oferta')
    }
  }

  /**
   * ✅ NOVO: Método para limpar cache (desenvolvimento)
   */
  clearMockCache(): void {
    P2PService.mockOffersCache = null
    P2PService.mockTradesCache = []
    P2PService.initialized = false
    console.log('🧹 Cache de ofertas e trades limpo')
  }

  /**
   * ✅ NOVO: Método para forçar reinicialização
   */
  forceReinitialize(): void {
    this.clearMockCache()
    this.generateMockOffers() // Regenerar
    console.log('🔄 P2P Service reinicializado')
  }
}

// ✅ CORREÇÃO: Instância singleton para manter consistência
export const p2pService = new P2PService()