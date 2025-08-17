// src/features/marketplace/types/p2p.types.ts

export interface P2POrder {
  id: string
  ownerId: string
  ownerName: string
  ownerRating: number
  orderType: 'buy' | 'sell'
  asset: 'BZR' // Fixed to BZR for now, extensible for future
  unitPriceBRL: number
  minAmount: number
  maxAmount: number
  paymentMethods: string[]
  escrowEnabled: boolean
  escrowTimeLimitMinutes: number
  status: 'active' | 'locked' | 'completed' | 'cancelled'
  createdAt: string
  updatedAt: string
  reputationSnapshot?: {
    rating: number
    reviewCount: number
    completionRate: number
    avgReleaseTime: number // minutes
  }
  location?: {
    city: string
    state: string
    country: string
  }
  description?: string
  termsAndConditions?: string
}

export interface P2PTrade {
  id: string
  orderId: string
  buyerId: string
  sellerId: string
  buyerName: string
  sellerName: string
  amount: number
  unitPriceBRL: number
  totalBRL: number
  escrowStatus: 'none' | 'locked' | 'released' | 'dispute'
  status: 'initiated' | 'payment_pending' | 'payment_confirmed' | 'completed' | 'cancelled' | 'disputed'
  paymentMethod: string
  deadlines: {
    paymentDeadline?: string
    escrowReleaseDeadline?: string
    disputeDeadline?: string
  }
  timeline: P2PTradeEvent[]
  createdAt: string
  updatedAt: string
  metadata?: {
    escrowTxHash?: string
    paymentProof?: string[]
    disputeReason?: string
    cancelReason?: string
  }
}

export interface P2PTradeEvent {
  id: string
  type: 'initiated' | 'payment_sent' | 'payment_confirmed' | 'escrow_locked' | 'escrow_released' | 'disputed' | 'cancelled' | 'completed'
  description: string
  actor: 'buyer' | 'seller' | 'system'
  actorId: string
  actorName: string
  timestamp: string
  metadata?: {
    txHash?: string
    amount?: number
    reason?: string
  }
}

export interface P2PChatMessage {
  id: string
  tradeId: string
  senderId: string
  senderName: string
  text: string
  type: 'text' | 'image' | 'payment_proof' | 'system'
  createdAt: string
  metadata?: {
    imageUrl?: string
    fileName?: string
    proofType?: string
  }
}

export interface P2PFilters {
  direction?: 'all' | 'buy' | 'sell'
  priceRange?: {
    min: number
    max: number
  }
  amountRange?: {
    min: number
    max: number
  }
  paymentMethod?: string
  minReputationRating?: number
  location?: {
    city?: string
    state?: string
    radius?: number // km
  }
  escrowOnly?: boolean
  search?: string
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'amount_asc' | 'amount_desc' | 'rating_desc'
}

export interface P2PMetrics {
  userTradesCount: number
  completionRate: number // 0-100
  avgReleaseTime: number // minutes
  disputesCount: number
  totalVolume: {
    BZR: number
    BRL: number
  }
  avgRating: number
  responseTime: number // minutes
  trustScore: number // 0-100, calculated metric
}

export interface P2PUserLimits {
  dailyOrdersLimit: number
  dailyVolumeLimit: {
    BZR: number
    BRL: number
  }
  maxActiveOrders: number
  maxTradesPerDay: number
  currentUsage: {
    ordersToday: number
    volumeToday: {
      BZR: number
      BRL: number
    }
    activeOrders: number
    tradesToday: number
  }
  reputationRequirements: {
    minRatingForLargeOrders: number
    minTradesForEscrow: number
    minRatingForNoEscrow: number
  }
}

export interface P2PMarketData {
  averagePrice: number
  priceRange: {
    min: number
    max: number
  }
  volume24h: {
    BZR: number
    BRL: number
    trades: number
  }
  activeOrders: {
    buy: number
    sell: number
    total: number
  }
  priceHistory: {
    timestamp: string
    price: number
    volume: number
  }[]
}

export interface P2PNotification {
  id: string
  userId: string
  type: 'trade_initiated' | 'payment_received' | 'escrow_locked' | 'escrow_released' | 'trade_completed' | 'trade_disputed' | 'order_matched'
  title: string
  message: string
  tradeId?: string
  orderId?: string
  actionRequired: boolean
  read: boolean
  createdAt: string
  expiresAt?: string
}