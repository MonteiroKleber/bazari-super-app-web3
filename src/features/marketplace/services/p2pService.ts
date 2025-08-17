// src/features/marketplace/services/p2pService.ts

import { 
  P2POrder, 
  P2PTrade, 
  P2PChatMessage, 
  P2PFilters, 
  P2PMetrics, 
  P2PUserLimits,
  P2PMarketData,
  P2PTradeEvent
} from '../types/p2p.types'

// Escrow Adapter Interface - Future on-chain implementation
interface EscrowAdapter {
  lockEscrow(tradeId: string, amount: number, currency: 'BZR' | 'BRL'): Promise<string>
  releaseEscrow(tradeId: string): Promise<string>
  disputeEscrow(tradeId: string, reason: string): Promise<string>
  getEscrowStatus(tradeId: string): Promise<'locked' | 'released' | 'disputed'>
}

// Mock Escrow Adapter - In-memory implementation
class MockEscrowAdapter implements EscrowAdapter {
  private escrows = new Map<string, { status: 'locked' | 'released' | 'disputed', amount: number }>()

  async lockEscrow(tradeId: string, amount: number): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate on-chain delay
    this.escrows.set(tradeId, { status: 'locked', amount })
    return `mock_tx_${crypto.randomUUID()}`
  }

  async releaseEscrow(tradeId: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 800))
    const escrow = this.escrows.get(tradeId)
    if (escrow) {
      escrow.status = 'released'
    }
    return `mock_release_tx_${crypto.randomUUID()}`
  }

  async disputeEscrow(tradeId: string, reason: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1200))
    const escrow = this.escrows.get(tradeId)
    if (escrow) {
      escrow.status = 'disputed'
    }
    return `mock_dispute_tx_${crypto.randomUUID()}`
  }

  async getEscrowStatus(tradeId: string): Promise<'locked' | 'released' | 'disputed'> {
    const escrow = this.escrows.get(tradeId)
    return escrow?.status || 'released'
  }
}

class P2PService {
  private escrowAdapter: EscrowAdapter
  private orders: P2POrder[] = []
  private trades: P2PTrade[] = []
  private messages: P2PChatMessage[] = []

  constructor() {
    this.escrowAdapter = new MockEscrowAdapter()
    this.initMockData()
  }

  private initMockData() {
    // Initialize with some mock data for demonstration
    this.orders = [
      {
        id: 'p2p_order_1',
        ownerId: 'user_2',
        ownerName: 'Maria Santos',
        ownerRating: 4.8,
        orderType: 'sell',
        asset: 'BZR',
        unitPriceBRL: 0.85,
        minAmount: 100,
        maxAmount: 10000,
        paymentMethods: ['PIX', 'TED'],
        escrowEnabled: true,
        escrowTimeLimitMinutes: 60,
        status: 'active',
        createdAt: '2024-08-15T10:00:00.000Z',
        updatedAt: '2024-08-15T10:00:00.000Z',
        reputationSnapshot: {
          rating: 4.8,
          reviewCount: 45,
          completionRate: 98.5,
          avgReleaseTime: 25
        },
        location: {
          city: 'São Paulo',
          state: 'SP',
          country: 'Brasil'
        },
        description: 'Vendo BZR com pagamento rápido via PIX. Escrow disponível.',
        termsAndConditions: 'Pagamento deve ser feito em até 30 minutos após confirmação.'
      },
      {
        id: 'p2p_order_2',
        ownerId: 'user_3',
        ownerName: 'João Silva',
        ownerRating: 4.6,
        orderType: 'buy',
        asset: 'BZR',
        unitPriceBRL: 0.82,
        minAmount: 500,
        maxAmount: 50000,
        paymentMethods: ['PIX', 'TED', 'DOC'],
        escrowEnabled: true,
        escrowTimeLimitMinutes: 90,
        status: 'active',
        createdAt: '2024-08-15T09:30:00.000Z',
        updatedAt: '2024-08-15T09:30:00.000Z',
        reputationSnapshot: {
          rating: 4.6,
          reviewCount: 23,
          completionRate: 96.0,
          avgReleaseTime: 35
        }
      }
    ]
  }

  // Core P2P Operations
  async listP2POrders(filters: P2PFilters = {}): Promise<P2POrder[]> {
    await new Promise(resolve => setTimeout(resolve, 300)) // Simulate API delay

    let filteredOrders = [...this.orders]

    // Apply filters
    if (filters.direction && filters.direction !== 'all') {
      filteredOrders = filteredOrders.filter(order => order.orderType === filters.direction)
    }

    if (filters.priceRange) {
      filteredOrders = filteredOrders.filter(order => 
        order.unitPriceBRL >= filters.priceRange!.min && 
        order.unitPriceBRL <= filters.priceRange!.max
      )
    }

    if (filters.amountRange) {
      filteredOrders = filteredOrders.filter(order => 
        order.maxAmount >= filters.amountRange!.min && 
        order.minAmount <= filters.amountRange!.max
      )
    }

    if (filters.paymentMethod) {
      filteredOrders = filteredOrders.filter(order => 
        order.paymentMethods.includes(filters.paymentMethod!)
      )
    }

    if (filters.minReputationRating) {
      filteredOrders = filteredOrders.filter(order => 
        order.ownerRating >= filters.minReputationRating!
      )
    }

    if (filters.escrowOnly) {
      filteredOrders = filteredOrders.filter(order => order.escrowEnabled)
    }

    if (filters.search) {
      const query = filters.search.toLowerCase()
      filteredOrders = filteredOrders.filter(order =>
        order.ownerName.toLowerCase().includes(query) ||
        order.description?.toLowerCase().includes(query)
      )
    }

    // Apply sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price_asc':
          filteredOrders.sort((a, b) => a.unitPriceBRL - b.unitPriceBRL)
          break
        case 'price_desc':
          filteredOrders.sort((a, b) => b.unitPriceBRL - a.unitPriceBRL)
          break
        case 'amount_asc':
          filteredOrders.sort((a, b) => a.maxAmount - b.maxAmount)
          break
        case 'amount_desc':
          filteredOrders.sort((a, b) => b.maxAmount - a.maxAmount)
          break
        case 'rating_desc':
          filteredOrders.sort((a, b) => b.ownerRating - a.ownerRating)
          break
        case 'newest':
        default:
          filteredOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          break
      }
    }

    return filteredOrders.filter(order => order.status === 'active')
  }

  async createP2POrder(payload: Partial<P2POrder>): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 500))

    const newOrder: P2POrder = {
      id: crypto.randomUUID(),
      ownerId: payload.ownerId!,
      ownerName: payload.ownerName!,
      ownerRating: payload.ownerRating || 0,
      orderType: payload.orderType!,
      asset: 'BZR',
      unitPriceBRL: payload.unitPriceBRL!,
      minAmount: payload.minAmount!,
      maxAmount: payload.maxAmount!,
      paymentMethods: payload.paymentMethods!,
      escrowEnabled: payload.escrowEnabled || false,
      escrowTimeLimitMinutes: payload.escrowTimeLimitMinutes || 60,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reputationSnapshot: payload.reputationSnapshot,
      location: payload.location,
      description: payload.description,
      termsAndConditions: payload.termsAndConditions
    }

    this.orders.push(newOrder)
    return newOrder.id
  }

  async getP2POrderById(id: string): Promise<P2POrder | null> {
    await new Promise(resolve => setTimeout(resolve, 200))
    return this.orders.find(order => order.id === id) || null
  }

  async initiateTrade(orderId: string, amount: number, buyerId: string, buyerName: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 400))

    const order = this.orders.find(o => o.id === orderId)
    if (!order) throw new Error('Order not found')

    if (amount < order.minAmount || amount > order.maxAmount) {
      throw new Error('Amount outside order limits')
    }

    const tradeId = crypto.randomUUID()
    const totalBRL = amount * order.unitPriceBRL

    const newTrade: P2PTrade = {
      id: tradeId,
      orderId,
      buyerId: order.orderType === 'sell' ? buyerId : order.ownerId,
      sellerId: order.orderType === 'buy' ? buyerId : order.ownerId,
      buyerName: order.orderType === 'sell' ? buyerName : order.ownerName,
      sellerName: order.orderType === 'buy' ? buyerName : order.ownerName,
      amount,
      unitPriceBRL: order.unitPriceBRL,
      totalBRL,
      escrowStatus: 'none',
      status: 'initiated',
      paymentMethod: order.paymentMethods[0], // Default to first method
      deadlines: {
        paymentDeadline: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min
        escrowReleaseDeadline: order.escrowEnabled 
          ? new Date(Date.now() + order.escrowTimeLimitMinutes * 60 * 1000).toISOString()
          : undefined
      },
      timeline: [{
        id: crypto.randomUUID(),
        type: 'initiated',
        description: 'Trade initiated',
        actor: 'buyer',
        actorId: buyerId,
        actorName: buyerName,
        timestamp: new Date().toISOString(),
        metadata: { amount, txHash: undefined }
      }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    this.trades.push(newTrade)

    // Lock order temporarily
    const orderIndex = this.orders.findIndex(o => o.id === orderId)
    if (orderIndex !== -1) {
      this.orders[orderIndex].status = 'locked'
    }

    return tradeId
  }

  // Chat Operations
  async postChatMessage(tradeId: string, senderId: string, senderName: string, text: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 200))

    const message: P2PChatMessage = {
      id: crypto.randomUUID(),
      tradeId,
      senderId,
      senderName,
      text,
      type: 'text',
      createdAt: new Date().toISOString()
    }

    this.messages.push(message)
    return message.id
  }

  async listChatMessages(tradeId: string): Promise<P2PChatMessage[]> {
    await new Promise(resolve => setTimeout(resolve, 150))
    return this.messages
      .filter(msg => msg.tradeId === tradeId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }

  // Escrow Operations
  async lockEscrow(tradeId: string): Promise<string> {
    const trade = this.trades.find(t => t.id === tradeId)
    if (!trade) throw new Error('Trade not found')

    const txHash = await this.escrowAdapter.lockEscrow(tradeId, trade.totalBRL, 'BRL')
    
    // Update trade
    const tradeIndex = this.trades.findIndex(t => t.id === tradeId)
    if (tradeIndex !== -1) {
      this.trades[tradeIndex].escrowStatus = 'locked'
      this.trades[tradeIndex].metadata = { 
        ...this.trades[tradeIndex].metadata, 
        escrowTxHash: txHash 
      }
      this.trades[tradeIndex].timeline.push({
        id: crypto.randomUUID(),
        type: 'escrow_locked',
        description: 'Escrow locked successfully',
        actor: 'system',
        actorId: 'system',
        actorName: 'System',
        timestamp: new Date().toISOString(),
        metadata: { txHash }
      })
    }

    return txHash
  }

  async releaseEscrow(tradeId: string): Promise<string> {
    const trade = this.trades.find(t => t.id === tradeId)
    if (!trade) throw new Error('Trade not found')

    const txHash = await this.escrowAdapter.releaseEscrow(tradeId)
    
    // Update trade
    const tradeIndex = this.trades.findIndex(t => t.id === tradeId)
    if (tradeIndex !== -1) {
      this.trades[tradeIndex].escrowStatus = 'released'
      this.trades[tradeIndex].status = 'completed'
      this.trades[tradeIndex].timeline.push({
        id: crypto.randomUUID(),
        type: 'escrow_released',
        description: 'Escrow released and trade completed',
        actor: 'system',
        actorId: 'system',
        actorName: 'System',
        timestamp: new Date().toISOString(),
        metadata: { txHash }
      })
    }

    return txHash
  }

  async cancelTrade(tradeId: string, reason?: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300))

    const tradeIndex = this.trades.findIndex(t => t.id === tradeId)
    if (tradeIndex !== -1) {
      this.trades[tradeIndex].status = 'cancelled'
      this.trades[tradeIndex].metadata = {
        ...this.trades[tradeIndex].metadata,
        cancelReason: reason
      }
      this.trades[tradeIndex].timeline.push({
        id: crypto.randomUUID(),
        type: 'cancelled',
        description: `Trade cancelled${reason ? `: ${reason}` : ''}`,
        actor: 'system',
        actorId: 'system',
        actorName: 'System',
        timestamp: new Date().toISOString(),
        metadata: { reason }
      })

      // Unlock the order
      const trade = this.trades[tradeIndex]
      const orderIndex = this.orders.findIndex(o => o.id === trade.orderId)
      if (orderIndex !== -1) {
        this.orders[orderIndex].status = 'active'
      }
    }
  }

  // User Limits and Metrics
  async getDailyUserLimits(userId: string): Promise<P2PUserLimits> {
    await new Promise(resolve => setTimeout(resolve, 200))

    // Mock calculation based on user reputation and history
    return {
      dailyOrdersLimit: 10,
      dailyVolumeLimit: { BZR: 100000, BRL: 50000 },
      maxActiveOrders: 5,
      maxTradesPerDay: 20,
      currentUsage: {
        ordersToday: 2,
        volumeToday: { BZR: 5000, BRL: 4250 },
        activeOrders: 1,
        tradesToday: 3
      },
      reputationRequirements: {
        minRatingForLargeOrders: 4.5,
        minTradesForEscrow: 5,
        minRatingForNoEscrow: 4.8
      }
    }
  }

  async checkPostLimit(userId: string): Promise<boolean> {
    const limits = await this.getDailyUserLimits(userId)
    return limits.currentUsage.ordersToday < limits.dailyOrdersLimit
  }

  async getUserP2PMetrics(userId: string): Promise<P2PMetrics> {
    await new Promise(resolve => setTimeout(resolve, 250))

    const userTrades = this.trades.filter(t => 
      t.buyerId === userId || t.sellerId === userId
    )

    const completedTrades = userTrades.filter(t => t.status === 'completed')
    const disputedTrades = userTrades.filter(t => t.status === 'disputed')

    return {
      userTradesCount: userTrades.length,
      completionRate: userTrades.length > 0 ? (completedTrades.length / userTrades.length) * 100 : 0,
      avgReleaseTime: 28, // Mock average
      disputesCount: disputedTrades.length,
      totalVolume: { BZR: 25000, BRL: 21250 },
      avgRating: 4.7,
      responseTime: 15,
      trustScore: 85
    }
  }

  async getMarketData(): Promise<P2PMarketData> {
    await new Promise(resolve => setTimeout(resolve, 300))

    const activeOrders = this.orders.filter(o => o.status === 'active')
    const buyOrders = activeOrders.filter(o => o.orderType === 'buy')
    const sellOrders = activeOrders.filter(o => o.orderType === 'sell')

    return {
      averagePrice: 0.835,
      priceRange: { min: 0.80, max: 0.87 },
      volume24h: { BZR: 125000, BRL: 104375, trades: 47 },
      activeOrders: {
        buy: buyOrders.length,
        sell: sellOrders.length,
        total: activeOrders.length
      },
      priceHistory: [
        { timestamp: '2024-08-15T08:00:00.000Z', price: 0.82, volume: 15000 },
        { timestamp: '2024-08-15T12:00:00.000Z', price: 0.835, volume: 22000 },
        { timestamp: '2024-08-15T16:00:00.000Z', price: 0.84, volume: 18000 }
      ]
    }
  }
}

// Export singleton instance
export const p2pService = new P2PService()