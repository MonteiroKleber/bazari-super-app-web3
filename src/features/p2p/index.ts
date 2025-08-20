// ==========================================
// src/features/p2p/index.ts - COMPLETO
// Barrel exports para o módulo P2P
// ==========================================

// ===================
// TYPES
// ===================
export type * from './types/p2p.types'

// ===================
// SERVICES
// ===================
export { p2pService } from './services/p2pService'
export type { 
  CreateOfferParams, 
  CreateTradeParams 
} from './services/p2pService'

export { escrowService } from './services/escrowService'
export type {
  EscrowReleaseParams,
  EscrowRefundParams
} from './services/escrowService'

export { 
  getPaymentMethodInfo, 
  getEnabledPaymentMethods,
  getRecommendedPaymentMethods,
  isPaymentMethodAvailable,
  validatePaymentData,
  formatPaymentData,
  getPaymentMethodIcon,
  getPaymentMethodColor,
  isInstantPaymentMethod,
  getProcessingTime,
  generateMockPaymentData,
  getBrazilianBanks,
  getAccountTypes
} from './services/payments'

export type { 
  PaymentMethodInfo,
  PaymentValidationData
} from './services/payments'

// ===================
// STORES (ZUSTAND)
// ===================
export { useOffersStore } from './store/offersStore'
export { useTradesStore } from './store/tradesStore'
export { useReputationStore } from './store/reputationStore'

// ===================
// HOOKS
// ===================
export { useP2PFilters } from './hooks/useP2PFilters'
export { useEscrow } from './hooks/useEscrow'

// ===================
// UTILS
// ===================
export { 
  buildProfileRoute,
  buildChatRoute,
  buildUserReviewsRoute,
  buildUserOffersRoute,
  buildUserTradesRoute,
  extractUserIdFromProfileRoute,
  isProfileRoute,
  buildReportUserRoute,
  buildBlockUserRoute,
  buildShareProfileUrl,
  buildProfilePrivacyRoute,
  buildEditProfileRoute,
  ProfileQueryParams,
  ProfileRoutes,
  ProfileNavigation,
  ProfileValidators
} from './utils/profileRoute'

// ===================
// COMPONENTS
// ===================

// Páginas principais
export { P2PHome } from './components/P2PHome'
export { OffersBrowse } from './components/OffersBrowse'
export { OfferCreate } from './components/OfferCreate'
export { OfferDetail } from './components/OfferDetail'
export { TradeRoom } from './components/TradeRoom'
export { MyTrades } from './components/MyTrades'
export { DisputesCenter } from './components/DisputesCenter'
export { P2PSettings } from './components/P2PSettings'

// ===================
// CONSTANTES
// ===================

/**
 * Configurações padrão do módulo P2P
 */
export const P2P_CONFIG = {
  // Filtros
  DEFAULT_SIDE: 'SELL' as const,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // Ofertas
  MIN_OFFER_AMOUNT: 10,
  MAX_OFFER_AMOUNT: 100000,
  MIN_PRICE_BZR: 0.01,
  MAX_PRICE_BZR: 100,
  
  // Trades
  MIN_TRADE_AMOUNT: 5,
  MAX_TRADE_AMOUNT: 50000,
  DEFAULT_TIMEOUT_MINUTES: 60,
  MAX_TIMEOUT_MINUTES: 1440, // 24 horas
  
  // Reputação
  MIN_REPUTATION_SCORE: 0,
  MAX_REPUTATION_SCORE: 5,
  NEW_USER_THRESHOLD: 5, // trades para sair de "new"
  TRUSTED_SCORE_THRESHOLD: 4.7,
  PRO_SCORE_THRESHOLD: 4.3,
  
  // Escrow
  ESCROW_FEE_PERCENTAGE: 0.5,
  
  // Refresh intervals
  OFFERS_REFRESH_INTERVAL: 30000, // 30 segundos
  TRADES_REFRESH_INTERVAL: 15000, // 15 segundos
  ESCROW_REFRESH_INTERVAL: 10000, // 10 segundos
  
  // Debounce
  SEARCH_DEBOUNCE_MS: 300,
  FILTER_DEBOUNCE_MS: 500,
  
  // Limits
  MAX_CONCURRENT_TRADES: 10,
  MAX_ACTIVE_OFFERS: 20,
  MAX_DISPUTE_EVIDENCE_FILES: 5,
  MAX_EVIDENCE_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  
  // Timeouts
  API_TIMEOUT_MS: 10000,
  WEBSOCKET_RECONNECT_MS: 5000,
  
  // Features flags
  FEATURES: {
    ESCROW_ENABLED: true,
    DISPUTES_ENABLED: true,
    REPUTATION_ENABLED: true,
    CHAT_ENABLED: true,
    GEOLOCATION_ENABLED: true,
    PAYMENT_VERIFICATION_ENABLED: false,
    ADVANCED_FILTERS_ENABLED: true,
    ANALYTICS_ENABLED: true
  }
} as const

/**
 * Mensagens de erro padrão
 */
export const P2P_ERROR_MESSAGES = {
  // Ofertas
  OFFER_NOT_FOUND: 'Oferta não encontrada',
  OFFER_EXPIRED: 'Esta oferta expirou',
  OFFER_UNAVAILABLE: 'Oferta não está mais disponível',
  INSUFFICIENT_BALANCE: 'Saldo insuficiente',
  
  // Trades
  TRADE_NOT_FOUND: 'Negociação não encontrada',
  TRADE_ALREADY_EXISTS: 'Já existe uma negociação para esta oferta',
  INVALID_TRADE_AMOUNT: 'Quantidade inválida para negociação',
  TRADE_CANCELLED: 'Negociação foi cancelada',
  
  // Escrow
  ESCROW_NOT_FOUND: 'Escrow não encontrado',
  ESCROW_EXPIRED: 'Escrow expirado',
  ESCROW_ALREADY_RELEASED: 'Escrow já foi liberado',
  ESCROW_CREATION_FAILED: 'Falha ao criar escrow',
  
  // Validação
  INVALID_PRICE: 'Preço inválido',
  INVALID_AMOUNT: 'Quantidade inválida',
  INVALID_PAYMENT_METHOD: 'Método de pagamento inválido',
  MISSING_REQUIRED_FIELDS: 'Campos obrigatórios não preenchidos',
  
  // Rede/API
  NETWORK_ERROR: 'Erro de conexão',
  API_ERROR: 'Erro no servidor',
  TIMEOUT_ERROR: 'Tempo limite excedido',
  
  // Autenticação
  UNAUTHORIZED: 'Não autorizado',
  FORBIDDEN: 'Ação não permitida',
  
  // Geral
  UNKNOWN_ERROR: 'Erro desconhecido'
} as const

/**
 * Mensagens de sucesso padrão
 */
export const P2P_SUCCESS_MESSAGES = {
  OFFER_CREATED: 'Oferta criada com sucesso',
  OFFER_UPDATED: 'Oferta atualizada com sucesso',
  OFFER_DELETED: 'Oferta removida com sucesso',
  
  TRADE_CREATED: 'Negociação iniciada com sucesso',
  TRADE_COMPLETED: 'Negociação concluída com sucesso',
  TRADE_CANCELLED: 'Negociação cancelada',
  
  ESCROW_CREATED: 'Escrow criado com sucesso',
  ESCROW_RELEASED: 'Fundos liberados com sucesso',
  ESCROW_REFUNDED: 'Reembolso processado com sucesso',
  
  DISPUTE_OPENED: 'Disputa aberta com sucesso',
  DISPUTE_RESOLVED: 'Disputa resolvida',
  
  REVIEW_SUBMITTED: 'Avaliação enviada com sucesso',
  SETTINGS_UPDATED: 'Configurações atualizadas'
} as const

/**
 * Status de cores para UI
 */
export const P2P_STATUS_COLORS = {
  // Trade status
  CREATED: 'text-blue-600 bg-blue-50 border-blue-200',
  PAID: 'text-orange-600 bg-orange-50 border-orange-200',
  CONFIRMED: 'text-purple-600 bg-purple-50 border-purple-200',
  COMPLETED: 'text-green-600 bg-green-50 border-green-200',
  CANCELLED: 'text-red-600 bg-red-50 border-red-200',
  DISPUTED: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  
  // Escrow status
  LOCKED: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  RELEASED: 'text-green-600 bg-green-50 border-green-200',
  REFUNDED: 'text-blue-600 bg-blue-50 border-blue-200',
  
  // Reputation levels
  new: 'text-gray-600 bg-gray-50 border-gray-200',
  regular: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  pro: 'text-blue-600 bg-blue-50 border-blue-200',
  trusted: 'text-green-600 bg-green-50 border-green-200'
} as const

/**
 * Ícones padrão para diferentes elementos
 */
export const P2P_ICONS = {
  // Sides
  BUY: '🔺',
  SELL: '🔻',
  
  // Payment methods
  PIX: '⚡',
  TED: '🏦',
  DOC: '📄',
  DINHEIRO: '💵',
  CARTAO: '💳',
  OUTRO: '🔄',
  
  // Status
  SUCCESS: '✅',
  ERROR: '❌',
  WARNING: '⚠️',
  INFO: 'ℹ️',
  LOADING: '⏳',
  
  // Actions
  CREATE: '➕',
  EDIT: '✏️',
  DELETE: '🗑️',
  VIEW: '👁️',
  CHAT: '💬',
  SHARE: '📤',
  
  // Reputation
  STAR: '⭐',
  SHIELD: '🛡️',
  AWARD: '🏆',
  BADGE: '🎖️'
} as const

/**
 * Utilitários para desenvolvimento e debug
 */
export const P2P_DEV_UTILS = {
  /**
   * Limpar todos os caches do módulo P2P
   */
  clearAllCaches: () => {
    p2pService.clearMockCache()
    escrowService.clearMockData()
    console.log('🧹 P2P: Todos os caches limpos')
  },
  
  /**
   * Gerar dados mock para testes
   */
  generateMockData: () => {
    console.log('🎭 P2P: Gerando dados mock...')
    // Força regeneração dos dados
    p2pService.forceReinitialize()
  },
  
  /**
   * Log de estado atual dos stores
   */
  logStoreStates: () => {
    console.group('📊 P2P Store States')
    console.log('Offers Store:', useOffersStore.getState())
    console.log('Trades Store:', useTradesStore.getState())
    console.log('Reputation Store:', useReputationStore.getState())
    console.groupEnd()
  }
}

// ===================
// VERSION INFO
// ===================
export const P2P_MODULE_INFO = {
  version: '1.0.0',
  lastUpdated: '2024-01-20',
  features: [
    'Ofertas P2P de compra/venda',
    'Sistema de escrow automatizado',
    'Reputação e reviews',
    'Chat integrado',
    'Resolução de disputas',
    'Múltiplos métodos de pagamento',
    'Filtros avançados',
    'Sincronização com URL'
  ],
  dependencies: [
    'zustand (state management)',
    'react-router-dom (routing)',
    'framer-motion (animations)'
  ]
} as const