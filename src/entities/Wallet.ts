export interface Transaction {
  id: string
  type: 'send' | 'receive' | 'escrow' | 'release' | 'fee' | 'reward'
  amount: number
  currency: 'BZR' | 'BRL'
  fromAddress?: string
  toAddress?: string
  status: 'pending' | 'confirmed' | 'failed' | 'cancelled'
  timestamp: string
  blockHash?: string
  transactionHash?: string
  gasUsed?: number
  description?: string
  escrowId?: string
  metadata?: {
    orderId?: string
    listingId?: string
    chatId?: string
    fee?: number
    exchangeRate?: number
  }
}

export interface WalletBalance {
  BZR: number
  BRL: number
  locked?: {
    BZR: number
    BRL: number
  }
}
