export interface P2POrder {
  id: string
  ownerId: string
  ownerName: string
  ownerRating: number
  orderType: 'buy' | 'sell'
  unitPriceBRL: number
  minAmount: number
  maxAmount: number
  paymentMethods: string[]
  escrowEnabled: boolean
  escrowTimeLimitMinutes: number
  status: 'active' | 'paused' | 'completed' | 'cancelled'
  createdAt: string
  updatedAt: string
}

export interface P2PTrade {
  id: string
  orderId: string
  buyerId: string
  sellerId: string
  amount: number
  unitPriceBRL: number
  totalBRL: number
  escrowStatus: 'pending' | 'locked' | 'released' | 'disputed'
  escrowExpiresAt?: string
  status: 'initiated' | 'payment_pending' | 'payment_confirmed' | 'completed' | 'cancelled' | 'disputed'
  createdAt: string
  updatedAt: string
  messages: P2PChatMessage[]
  paymentProof?: {
    type: 'receipt' | 'screenshot' | 'bank_statement'
    url: string
    uploadedAt: string
  }
}

export interface P2PChatMessage {
  id: string
  tradeId: string
  senderId: string
  senderName: string
  text: string
  type: 'text' | 'image' | 'file' | 'system'
  createdAt: string
  metadata?: {
    fileName?: string
    fileSize?: number
    fileType?: string
  }
}
