
export type PaymentMethod = 'PIX' | 'TED' | 'DINHEIRO' | 'OUTRO'

export type P2POffer = {
  id: string
  side: 'BUY' | 'SELL'                // Oferta quer COMPRAR ou VENDER BZR
  priceBZR: number                    // BRL por 1 BZR
  minAmount: string                   // mín em BZR
  maxAmount: string                   // máx em BZR
  availableAmount: string             // SELL: saldo disponível
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

export type P2PTrade = {
  id: string
  offerId: string
  buyerId: string
  sellerId: string
  amountBZR: string                   // quantidade negociada (BZR)
  priceBZR: number                    // preço fechado (snapshot)
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

export type P2PFilters = {
  side: 'BUY' | 'SELL'
  payment?: PaymentMethod
  priceMin?: number
  priceMax?: number
  reputationMin?: number
  city?: string
  state?: string
  q?: string
  ownerId?: string
}

export type P2PDispute = {
  id: string
  tradeId: string
  openedBy: string
  reason: string
  attachments?: string[]
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'CLOSED'
  createdAt: number
  resolvedAt?: number
  resolution?: string
}

export type P2PSettings = {
  defaultCurrency: 'BRL'
  defaultLocation?: {
    country?: string
    state?: string
    city?: string
  }
  defaultPaymentMethods: PaymentMethod[]
  defaultLimits: {
    minAmount: string
    maxAmount: string
  }
  autoCancel: {
    enabled: boolean
    timeoutMinutes: number
  }
}