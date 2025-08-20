// ==========================================
// src/features/p2p/types/p2p.types.ts - COMPLETO
// ==========================================

/**
 * Métodos de pagamento suportados
 */
export type PaymentMethod = 'PIX' | 'TED' | 'DOC' | 'DINHEIRO' | 'CARTAO' | 'OUTRO'

/**
 * Tipos de ofertas P2P
 */
export type P2PSide = 'BUY' | 'SELL'

/**
 * Status de uma negociação P2P
 */
export type P2PTradeStatus = 
  | 'CREATED'     // Negociação criada
  | 'PAID'        // Pagamento enviado
  | 'CONFIRMED'   // Pagamento confirmado
  | 'COMPLETED'   // Negociação concluída
  | 'CANCELLED'   // Cancelada
  | 'DISPUTED'    // Em disputa

/**
 * Níveis de reputação de usuários
 */
export type ReputationLevel = 'new' | 'regular' | 'pro' | 'trusted'

/**
 * Localização geográfica
 */
export interface P2PLocation {
  country?: string
  state?: string
  city?: string
}

/**
 * Estatísticas de performance de um usuário
 */
export interface P2PUserStats {
  completed: number           // Negociações completadas
  cancelRatePct: number      // Taxa de cancelamento (%)
  avgReleaseTimeSec: number  // Tempo médio de liberação (segundos)
}

/**
 * Sistema de reputação
 */
export interface P2PReputation {
  score: number              // Score de reputação (0-5)
  level: ReputationLevel     // Nível de reputação
}

/**
 * Oferta P2P
 */
export interface P2POffer {
  id: string
  side: P2PSide
  priceBZR: number                    // Preço por BZR em BRL
  minAmount: string                   // Quantidade mínima de BZR
  maxAmount: string                   // Quantidade máxima de BZR
  availableAmount: string             // Quantidade disponível (para SELL)
  fiatCurrency: 'BRL'                // Moeda fiat
  paymentMethods: PaymentMethod[]     // Métodos de pagamento aceitos
  location?: P2PLocation             // Localização do usuário
  ownerId: string                    // ID do proprietário
  ownerName: string                  // Nome do proprietário
  ownerAvatarUrl?: string           // Avatar do proprietário
  terms?: string                     // Termos da oferta
  createdAt: number                  // Timestamp de criação
  updatedAt?: number                 // Timestamp de atualização
  stats: P2PUserStats               // Estatísticas do usuário
  reputation?: P2PReputation        // Reputação do usuário
}

/**
 * Evento na timeline de uma negociação
 */
export interface P2PTradeEvent {
  ts: number                        // Timestamp
  type: string                      // Tipo do evento
  payload?: any                     // Dados do evento
  userId?: string                   // ID do usuário que executou
}

/**
 * Negociação P2P
 */
export interface P2PTrade {
  id: string
  offerId: string                   // ID da oferta relacionada
  buyerId: string                   // ID do comprador
  sellerId: string                  // ID do vendedor
  amountBZR: string                // Quantidade de BZR
  priceBZR: number                 // Preço por BZR
  paymentMethod: PaymentMethod     // Método de pagamento escolhido
  status: P2PTradeStatus           // Status atual
  timeline: P2PTradeEvent[]        // Histórico de eventos
  createdAt?: number               // Timestamp de criação
  completedAt?: number             // Timestamp de conclusão
  
  // Dados de pagamento (se aplicável)
  paymentData?: {
    method: PaymentMethod
    details?: Record<string, any>
    proof?: string[]              // URLs de comprovantes
  }
  
  // Chat da negociação
  chatId?: string                 // ID do chat relacionado
  
  // Disputa (se aplicável)
  dispute?: {
    reason: string
    description: string
    openedAt: number
    resolvedAt?: number
    resolution?: string
  }
}

/**
 * Filtros para busca de ofertas P2P
 */
export interface P2PFilters {
  side?: P2PSide                   // Tipo de oferta
  payment?: PaymentMethod          // Método de pagamento
  priceMin?: number               // Preço mínimo
  priceMax?: number               // Preço máximo
  amountMin?: number              // Quantidade mínima
  amountMax?: number              // Quantidade máxima
  reputationMin?: number          // Reputação mínima
  city?: string                   // Cidade
  state?: string                  // Estado
  country?: string                // País
  ownerId?: string                // ID do proprietário
  q?: string                      // Busca por texto
  sortBy?: 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'reputation_desc' | 'amount_desc'
  page?: number                   // Página
  limit?: number                  // Limite por página
}

/**
 * Resposta paginada de ofertas
 */
export interface P2POffersResponse {
  offers: P2POffer[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

/**
 * Estatísticas globais do P2P
 */
export interface P2PGlobalStats {
  totalOffers: number
  totalTrades: number
  volumeBRL: number
  volumeBZR: number
  avgPrice: number
  activeUsers: number
}

/**
 * Configurações de usuário para P2P
 */
export interface P2PUserSettings {
  defaultPaymentMethods: PaymentMethod[]
  autoAcceptTrades: boolean
  notifications: {
    newTrade: boolean
    paymentReceived: boolean
    tradeCompleted: boolean
    disputes: boolean
  }
  privacy: {
    showLocation: boolean
    showStats: boolean
    showOnlineStatus: boolean
  }
}

/**
 * Dados de reputação de usuário
 */
export interface UserReputation {
  userId: string
  score: number                    // Score geral (0-5)
  level: ReputationLevel
  totalTrades: number
  successRate: number             // Taxa de sucesso (%)
  avgReleaseTime: number          // Tempo médio de liberação
  reviews: UserReview[]
  badges: ReputationBadge[]
}

/**
 * Review de usuário
 */
export interface UserReview {
  id: string
  fromUserId: string
  fromUserName: string
  tradeId: string
  rating: number                  // 1-5
  comment?: string
  createdAt: number
  type: 'positive' | 'neutral' | 'negative'
}

/**
 * Badges de reputação
 */
export interface ReputationBadge {
  id: string
  name: string
  description: string
  icon?: string
  color?: string
  earnedAt: number
}

/**
 * Dados para criação de escrow
 */
export interface EscrowCreateParams {
  tradeId: string
  amountBZR: string
  buyerId: string
  sellerId: string
  timeoutMinutes?: number
}

/**
 * Estado do escrow
 */
export interface EscrowState {
  id: string
  tradeId: string
  amountBZR: string
  status: 'LOCKED' | 'RELEASED' | 'REFUNDED' | 'DISPUTED'
  lockTimestamp: number
  releaseTimestamp?: number
  timeoutTimestamp: number
  buyerId: string
  sellerId: string
}

/**
 * Parâmetros de disputa
 */
export interface DisputeParams {
  tradeId: string
  reason: string
  description: string
  evidence?: string[]
}

/**
 * Estado de uma disputa
 */
export interface DisputeState {
  id: string
  tradeId: string
  openedBy: string
  reason: string
  description: string
  evidence: string[]
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED'
  resolution?: string
  resolvedBy?: string
  openedAt: number
  resolvedAt?: number
}

/**
 * Notificação P2P
 */
export interface P2PNotification {
  id: string
  userId: string
  type: 'TRADE_CREATED' | 'PAYMENT_RECEIVED' | 'TRADE_COMPLETED' | 'DISPUTE_OPENED'
  title: string
  message: string
  data?: Record<string, any>
  read: boolean
  createdAt: number
}

/**
 * Configurações de mercado P2P
 */
export interface P2PMarketConfig {
  minTradeAmount: number          // Quantidade mínima por trade
  maxTradeAmount: number          // Quantidade máxima por trade
  maxOpenTrades: number           // Máximo de trades abertas por usuário
  escrowTimeoutMinutes: number    // Timeout do escrow em minutos
  feePercentage: number           // Taxa de serviço (%)
  supportedPaymentMethods: PaymentMethod[]
  enabledFeatures: {
    escrow: boolean
    disputes: boolean
    reputation: boolean
    chat: boolean
  }
}

// Tipos de eventos para websocket/real-time
export type P2PEventType = 
  | 'OFFER_CREATED'
  | 'OFFER_UPDATED'
  | 'OFFER_REMOVED'
  | 'TRADE_CREATED'
  | 'TRADE_UPDATED'
  | 'PAYMENT_SENT'
  | 'PAYMENT_CONFIRMED'
  | 'TRADE_COMPLETED'
  | 'DISPUTE_OPENED'
  | 'CHAT_MESSAGE'

export interface P2PEvent {
  type: P2PEventType
  data: any
  timestamp: number
  userId?: string
}