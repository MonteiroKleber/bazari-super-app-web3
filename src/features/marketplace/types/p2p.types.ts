// ==========================================
// src/features/p2p/types/p2p.types.ts
// ==========================================

export type PaymentMethod = 'PIX' | 'TED' | 'DINHEIRO' | 'OUTRO'

export interface P2POffer {
  id: string
  side: 'BUY' | 'SELL'
  priceBZR: number
  minAmount: string
  maxAmount: string
  availableAmount: string
  fiatCurrency: 'BRL'
  paymentMethods: PaymentMethod[]
  location?: {
    country?: string
    state?: string
    city?: string
  }
  ownerId: string
  ownerName?: string
  ownerAvatarUrl?: string
  terms?: string
  createdAt: number
  stats?: {
    completed: number
    cancelRatePct: number
    avgReleaseTimeSec?: number
  }
  reputation?: {
    score: number
    level: 'new' | 'trusted' | 'pro'
  }
}

export interface P2PTrade {
  id: string
  offerId: string
  buyerId: string
  sellerId: string
  amountBZR: string
  priceBZR: number
  paymentMethod: PaymentMethod
  status: 'CREATED' | 'ESCROW_LOCKED' | 'PAYMENT_MARKED' | 'RELEASED' | 'REFUNDED' | 'DISPUTE' | 'CANCELLED'
  escrow?: {
    escrowId?: string
    from: string
    to: string
    amountBZR: string
    createdAt: number
    expiresAt?: number
  }
  timeline: Array<{
    ts: number
    type: string
    payload?: any
  }>
}

export interface P2PFilters {
  side?: 'BUY' | 'SELL'
  payment?: PaymentMethod
  priceMin?: number
  priceMax?: number
  reputationMin?: number
  city?: string
  state?: string
  q?: string
  ownerId?: string
}

export interface P2PChatMessage {
  id: string
  tradeId: string
  senderId: string
  text?: string
  type: 'text' | 'image' | 'payment_proof' | 'system'
  timestamp: number
  attachments?: {
    url: string
    type: string
    name?: string
  }[]
}

export interface P2PUserProfile {
  id: string
  name: string
  avatarUrl?: string
  joinedAt: number
  location?: {
    city?: string
    state?: string
    country?: string
  }
  verification: {
    email: boolean
    phone: boolean
    kyc: boolean
  }
  preferences: {
    currency: string
    language: string
    notifications: boolean
  }
}

export interface P2PMarketStats {
  totalVolume24h: {
    BZR: number
    BRL: number
  }
  avgPrice24h: number
  activeOrders: number
  activeTrades: number
  priceChange24h: number
}