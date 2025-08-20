// ==========================================
// src/features/p2p/utils/profileRoute.ts - COMPLETO
// ==========================================

/**
 * Utilitários para roteamento de perfis no módulo P2P
 */

/**
 * Constrói rota para perfil de usuário
 */
export function buildProfileRoute(userId: string): string {
  if (!userId) {
    console.warn('buildProfileRoute: userId não fornecido')
    return '/profile'
  }
  
  return `/profile/${userId}`
}

/**
 * Constrói rota para chat com usuário específico
 */
export function buildChatRoute(userId: string, context?: string): string {
  if (!userId) {
    console.warn('buildChatRoute: userId não fornecido')
    return '/chat'
  }
  
  let route = `/chat/${userId}`
  
  // Adicionar contexto se fornecido (ex: tradeId)
  if (context) {
    route += `?context=${encodeURIComponent(context)}`
  }
  
  return route
}

/**
 * Constrói rota para avaliações de um usuário
 */
export function buildUserReviewsRoute(userId: string): string {
  if (!userId) {
    console.warn('buildUserReviewsRoute: userId não fornecido')
    return '/reviews'
  }
  
  return `/profile/${userId}/reviews`
}

/**
 * Constrói rota para ofertas de um usuário específico
 */
export function buildUserOffersRoute(userId: string): string {
  if (!userId) {
    console.warn('buildUserOffersRoute: userId não fornecido')
    return '/p2p/offers'
  }
  
  return `/p2p/offers?ownerId=${encodeURIComponent(userId)}`
}

/**
 * Constrói rota para histórico de trades de um usuário
 */
export function buildUserTradesRoute(userId: string): string {
  if (!userId) {
    console.warn('buildUserTradesRoute: userId não fornecido')
    return '/p2p/my-trades'
  }
  
  // Para outros usuários, redirecionar para perfil
  return `/profile/${userId}/trades`
}

/**
 * Extrai userId de uma rota de perfil
 */
export function extractUserIdFromProfileRoute(pathname: string): string | null {
  const match = pathname.match(/^\/profile\/([^\/]+)/)
  return match ? match[1] : null
}

/**
 * Verifica se uma rota é de perfil
 */
export function isProfileRoute(pathname: string): boolean {
  return /^\/profile\/[^\/]+/.test(pathname)
}

/**
 * Constrói rota para reportar usuário
 */
export function buildReportUserRoute(userId: string, context?: { 
  type?: 'trade' | 'offer' | 'profile',
  id?: string 
}): string {
  if (!userId) {
    console.warn('buildReportUserRoute: userId não fornecido')
    return '/report'
  }
  
  let route = `/report/user/${userId}`
  
  if (context) {
    const params = new URLSearchParams()
    if (context.type) params.set('type', context.type)
    if (context.id) params.set('id', context.id)
    
    if (params.toString()) {
      route += `?${params.toString()}`
    }
  }
  
  return route
}

/**
 * Constrói rota para bloquear/desbloquear usuário
 */
export function buildBlockUserRoute(userId: string): string {
  if (!userId) {
    console.warn('buildBlockUserRoute: userId não fornecido')
    return '/settings/blocked-users'
  }
  
  return `/settings/blocked-users?action=block&userId=${encodeURIComponent(userId)}`
}

/**
 * Constrói URL para compartilhar perfil
 */
export function buildShareProfileUrl(userId: string, baseUrl?: string): string {
  if (!userId) {
    console.warn('buildShareProfileUrl: userId não fornecido')
    return baseUrl || window.location.origin
  }
  
  const base = baseUrl || window.location.origin
  return `${base}/profile/${userId}`
}

/**
 * Constrói rota para configurações de privacidade do próprio perfil
 */
export function buildProfilePrivacyRoute(): string {
  return '/profile/settings/privacy'
}

/**
 * Constrói rota para editar próprio perfil
 */
export function buildEditProfileRoute(): string {
  return '/profile/edit'
}

/**
 * Utilitários para parâmetros de query
 */
export const ProfileQueryParams = {
  /**
   * Adiciona parâmetro de origem para tracking
   */
  withSource: (route: string, source: string): string => {
    const separator = route.includes('?') ? '&' : '?'
    return `${route}${separator}source=${encodeURIComponent(source)}`
  },
  
  /**
   * Adiciona parâmetro de contexto P2P
   */
  withP2PContext: (route: string, context: {
    offerId?: string
    tradeId?: string
    action?: 'view_offers' | 'start_trade' | 'view_reputation'
  }): string => {
    const params = new URLSearchParams()
    
    if (context.offerId) params.set('offerId', context.offerId)
    if (context.tradeId) params.set('tradeId', context.tradeId)
    if (context.action) params.set('action', context.action)
    
    if (params.toString()) {
      const separator = route.includes('?') ? '&' : '?'
      return `${route}${separator}${params.toString()}`
    }
    
    return route
  },
  
  /**
   * Adiciona tab específica do perfil
   */
  withTab: (route: string, tab: 'overview' | 'offers' | 'reviews' | 'trades'): string => {
    const separator = route.includes('?') ? '&' : '?'
    return `${route}${separator}tab=${tab}`
  }
}

/**
 * Constantes de rotas relacionadas a perfil
 */
export const ProfileRoutes = {
  // Rotas base
  PROFILE_BASE: '/profile',
  PROFILE_EDIT: '/profile/edit',
  PROFILE_SETTINGS: '/profile/settings',
  
  // Settings específicas
  PRIVACY_SETTINGS: '/profile/settings/privacy',
  NOTIFICATION_SETTINGS: '/profile/settings/notifications',
  SECURITY_SETTINGS: '/profile/settings/security',
  
  // P2P relacionadas
  MY_OFFERS: '/p2p/my-offers',
  MY_TRADES: '/p2p/my-trades',
  MY_REVIEWS: '/profile/reviews',
  
  // Moderação
  BLOCKED_USERS: '/settings/blocked-users',
  REPORT_USER: '/report/user',
  
  // Chat
  CHAT_BASE: '/chat',
  
  // Construir com ID
  profile: (userId: string) => buildProfileRoute(userId),
  chat: (userId: string, context?: string) => buildChatRoute(userId, context),
  reviews: (userId: string) => buildUserReviewsRoute(userId),
  offers: (userId: string) => buildUserOffersRoute(userId),
  report: (userId: string, context?: { type?: string, id?: string }) => 
    buildReportUserRoute(userId, context)
} as const

/**
 * Helpers para navegação
 */
export const ProfileNavigation = {
  /**
   * Navegar para perfil com analytics
   */
  goToProfile: (userId: string, source?: string) => {
    let route = buildProfileRoute(userId)
    
    if (source) {
      route = ProfileQueryParams.withSource(route, source)
    }
    
    // Em um app real, você usaria useNavigate ou router.push
    console.log('Navegando para:', route)
    return route
  },
  
  /**
   * Navegar para chat com contexto
   */
  goToChat: (userId: string, context?: { tradeId?: string, offerId?: string }) => {
    const contextStr = context?.tradeId || context?.offerId
    const route = buildChatRoute(userId, contextStr)
    
    console.log('Navegando para chat:', route)
    return route
  },
  
  /**
   * Abrir perfil em nova aba
   */
  openProfileInNewTab: (userId: string) => {
    const url = buildShareProfileUrl(userId)
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}

/**
 * Validadores
 */
export const ProfileValidators = {
  /**
   * Valida se um userId é válido
   */
  isValidUserId: (userId: string): boolean => {
    if (!userId || typeof userId !== 'string') return false
    
    // Validações básicas
    if (userId.length < 3 || userId.length > 50) return false
    if (userId.includes(' ') || userId.includes('/')) return false
    
    return true
  },
  
  /**
   * Sanitiza userId para uso em URL
   */
  sanitizeUserId: (userId: string): string => {
    if (!userId) return ''
    
    return userId
      .trim()
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .substring(0, 50)
  }
}