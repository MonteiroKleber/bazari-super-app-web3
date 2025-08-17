// src/features/marketplace/hooks/useP2P.ts

import { useState, useEffect, useCallback } from 'react'
import { 
  P2POrder, 
  P2PTrade, 
  P2PChatMessage, 
  P2PFilters, 
  P2PMetrics, 
  P2PUserLimits,
  P2PMarketData
} from '../types/p2p.types'
import { p2pService } from '../services/p2pService'

interface UseP2PState {
  // Data
  orders: P2POrder[]
  myOrders: P2POrder[]
  trades: P2PTrade[]
  myTrades: P2PTrade[]
  currentTrade: P2PTrade | null
  messages: P2PChatMessage[]
  marketData: P2PMarketData | null
  userMetrics: P2PMetrics | null
  userLimits: P2PUserLimits | null
  
  // Loading states
  loading: boolean
  loadingOrders: boolean
  loadingTrades: boolean
  loadingMessages: boolean
  loadingMetrics: boolean
  
  // Error states
  error: string | null
  
  // Pagination
  pagination: {
    currentPage: number
    totalPages: number
    hasMore: boolean
  }
}

interface UseP2PActions {
  // Order actions
  fetchOrders: (filters?: P2PFilters, page?: number) => Promise<void>
  createOrder: (orderData: Partial<P2POrder>) => Promise<string>
  updateOrder: (orderId: string, updates: Partial<P2POrder>) => Promise<void>
  cancelOrder: (orderId: string) => Promise<void>
  searchOrders: (query: string) => Promise<void>
  
  // Trade actions
  initiateTrade: (orderId: string, amount: number) => Promise<string>
  acceptTrade: (tradeId: string) => Promise<void>
  lockEscrow: (tradeId: string) => Promise<string>
  releaseEscrow: (tradeId: string) => Promise<string>
  cancelTrade: (tradeId: string, reason?: string) => Promise<void>
  disputeTrade: (tradeId: string, reason: string) => Promise<void>
  
  // Chat actions
  sendMessage: (tradeId: string, text: string) => Promise<string>
  loadMessages: (tradeId: string) => Promise<void>
  
  // Filter and pagination
  setFilters: (filters: P2PFilters) => void
  resetFilters: () => void
  loadMore: () => Promise<void>
  
  // Utilities
  formatCurrency: (amount: number, currency?: 'BZR' | 'BRL') => string
  formatPrice: (price: number) => string
  calculateTotal: (amount: number, unitPrice: number) => number
  validateTradeAmount: (orderId: string, amount: number) => { valid: boolean; message?: string }
  canInitiateTrade: (order: P2POrder, userId: string) => { can: boolean; reason?: string }
  
  // Real-time updates (future WebSocket integration)
  subscribeToOrderUpdates: (orderId: string) => () => void
  subscribeToTradeUpdates: (tradeId: string) => () => void
}

export const useP2P = (userId?: string): UseP2PState & UseP2PActions => {
  const [state, setState] = useState<UseP2PState>({
    orders: [],
    myOrders: [],
    trades: [],
    myTrades: [],
    currentTrade: null,
    messages: [],
    marketData: null,
    userMetrics: null,
    userLimits: null,
    loading: false,
    loadingOrders: false,
    loadingTrades: false,
    loadingMessages: false,
    loadingMetrics: false,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      hasMore: false
    }
  })

  const [filters, setFiltersState] = useState<P2PFilters>({})

  // Error handler
  const handleError = useCallback((error: any, context: string) => {
    console.error(`P2P Error in ${context}:`, error)
    setState(prev => ({ 
      ...prev, 
      error: error.message || `Error in ${context}`,
      loading: false,
      loadingOrders: false,
      loadingTrades: false,
      loadingMessages: false,
      loadingMetrics: false
    }))
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  // Fetch orders
  const fetchOrders = useCallback(async (newFilters?: P2PFilters, page = 1) => {
    setState(prev => ({ ...prev, loadingOrders: true, error: null }))
    
    try {
      const appliedFilters = newFilters || filters
      const orders = await p2pService.listP2POrders(appliedFilters)
      
      setState(prev => ({
        ...prev,
        orders,
        loadingOrders: false,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(orders.length / 20), // Mock pagination
          hasMore: orders.length >= 20
        }
      }))
    } catch (error) {
      handleError(error, 'fetchOrders')
    }
  }, [filters, handleError])

  // Create order
  const createOrder = useCallback(async (orderData: Partial<P2POrder>): Promise<string> => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const orderId = await p2pService.createP2POrder(orderData)
      await fetchOrders() // Refresh orders
      setState(prev => ({ ...prev, loading: false }))
      return orderId
    } catch (error) {
      handleError(error, 'createOrder')
      throw error
    }
  }, [fetchOrders, handleError])

  // Initiate trade
  const initiateTrade = useCallback(async (orderId: string, amount: number): Promise<string> => {
    if (!userId) throw new Error('User not authenticated')
    
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const tradeId = await p2pService.initiateTrade(orderId, amount, userId, 'Current User') // Get user name from auth
      setState(prev => ({ ...prev, loading: false }))
      return tradeId
    } catch (error) {
      handleError(error, 'initiateTrade')
      throw error
    }
  }, [userId, handleError])

  // Lock escrow
  const lockEscrow = useCallback(async (tradeId: string): Promise<string> => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const txHash = await p2pService.lockEscrow(tradeId)
      setState(prev => ({ ...prev, loading: false }))
      return txHash
    } catch (error) {
      handleError(error, 'lockEscrow')
      throw error
    }
  }, [handleError])

  // Release escrow
  const releaseEscrow = useCallback(async (tradeId: string): Promise<string> => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const txHash = await p2pService.releaseEscrow(tradeId)
      setState(prev => ({ ...prev, loading: false }))
      return txHash
    } catch (error) {
      handleError(error, 'releaseEscrow')
      throw error
    }
  }, [handleError])

  // Cancel trade
  const cancelTrade = useCallback(async (tradeId: string, reason?: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      await p2pService.cancelTrade(tradeId, reason)
      setState(prev => ({ ...prev, loading: false }))
    } catch (error) {
      handleError(error, 'cancelTrade')
    }
  }, [handleError])

  // Send message
  const sendMessage = useCallback(async (tradeId: string, text: string): Promise<string> => {
    if (!userId) throw new Error('User not authenticated')
    
    try {
      const messageId = await p2pService.postChatMessage(tradeId, userId, 'Current User', text)
      await loadMessages(tradeId) // Refresh messages
      return messageId
    } catch (error) {
      handleError(error, 'sendMessage')
      throw error
    }
  }, [userId, handleError])

  // Load messages
  const loadMessages = useCallback(async (tradeId: string) => {
    setState(prev => ({ ...prev, loadingMessages: true, error: null }))
    
    try {
      const messages = await p2pService.listChatMessages(tradeId)
      setState(prev => ({ ...prev, messages, loadingMessages: false }))
    } catch (error) {
      handleError(error, 'loadMessages')
    }
  }, [handleError])

  // Load user metrics
  const loadUserMetrics = useCallback(async (targetUserId?: string) => {
    const userIdToLoad = targetUserId || userId
    if (!userIdToLoad) return
    
    setState(prev => ({ ...prev, loadingMetrics: true, error: null }))
    
    try {
      const [metrics, limits] = await Promise.all([
        p2pService.getUserP2PMetrics(userIdToLoad),
        p2pService.getDailyUserLimits(userIdToLoad)
      ])
      
      setState(prev => ({ 
        ...prev, 
        userMetrics: metrics, 
        userLimits: limits,
        loadingMetrics: false 
      }))
    } catch (error) {
      handleError(error, 'loadUserMetrics')
    }
  }, [userId, handleError])

  // Load market data
  const loadMarketData = useCallback(async () => {
    try {
      const marketData = await p2pService.getMarketData()
      setState(prev => ({ ...prev, marketData }))
    } catch (error) {
      handleError(error, 'loadMarketData')
    }
  }, [handleError])

  // Set filters
  const setFilters = useCallback((newFilters: P2PFilters) => {
    setFiltersState(newFilters)
    fetchOrders(newFilters, 1)
  }, [fetchOrders])

  // Reset filters
  const resetFilters = useCallback(() => {
    setFiltersState({})
    fetchOrders({}, 1)
  }, [fetchOrders])

  // Utility functions
  const formatCurrency = useCallback((amount: number, currency = 'BRL'): string => {
    if (currency === 'BRL') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(amount)
    }
    return `${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} BZR`
  }, [])

  const formatPrice = useCallback((price: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 3
    }).format(price)
  }, [])

  const calculateTotal = useCallback((amount: number, unitPrice: number): number => {
    return amount * unitPrice
  }, [])

  const validateTradeAmount = useCallback((orderId: string, amount: number) => {
    const order = state.orders.find(o => o.id === orderId)
    if (!order) return { valid: false, message: 'Order not found' }
    
    if (amount < order.minAmount) {
      return { valid: false, message: `Minimum amount is ${formatCurrency(order.minAmount, 'BZR')}` }
    }
    
    if (amount > order.maxAmount) {
      return { valid: false, message: `Maximum amount is ${formatCurrency(order.maxAmount, 'BZR')}` }
    }
    
    return { valid: true }
  }, [state.orders, formatCurrency])

  const canInitiateTrade = useCallback((order: P2POrder, currentUserId: string) => {
    if (order.ownerId === currentUserId) {
      return { can: false, reason: 'Cannot trade with yourself' }
    }
    
    if (order.status !== 'active') {
      return { can: false, reason: 'Order is not active' }
    }
    
    // Check user limits if available
    if (state.userLimits) {
      const usage = state.userLimits.currentUsage
      if (usage.tradesToday >= state.userLimits.maxTradesPerDay) {
        return { can: false, reason: 'Daily trade limit reached' }
      }
    }
    
    return { can: true }
  }, [state.userLimits])

  // Mock WebSocket subscriptions (future implementation)
  const subscribeToOrderUpdates = useCallback((orderId: string) => {
    // Future WebSocket implementation
    console.log(`Subscribing to order updates for ${orderId}`)
    return () => console.log(`Unsubscribing from order ${orderId}`)
  }, [])

  const subscribeToTradeUpdates = useCallback((tradeId: string) => {
    // Future WebSocket implementation
    console.log(`Subscribing to trade updates for ${tradeId}`)
    return () => console.log(`Unsubscribing from trade ${tradeId}`)
  }, [])

  // Load initial data
  useEffect(() => {
    fetchOrders()
    loadMarketData()
    if (userId) {
      loadUserMetrics()
    }
  }, []) // Only on mount

  // Placeholder implementations for missing actions
  const updateOrder = useCallback(async (orderId: string, updates: Partial<P2POrder>) => {
    // Implementation would go here
    console.log('Update order:', orderId, updates)
  }, [])

  const cancelOrder = useCallback(async (orderId: string) => {
    // Implementation would go here
    console.log('Cancel order:', orderId)
  }, [])

  const searchOrders = useCallback(async (query: string) => {
    await fetchOrders({ search: query })
  }, [fetchOrders])

  const acceptTrade = useCallback(async (tradeId: string) => {
    // Implementation would go here
    console.log('Accept trade:', tradeId)
  }, [])

  const disputeTrade = useCallback(async (tradeId: string, reason: string) => {
    // Implementation would go here
    console.log('Dispute trade:', tradeId, reason)
  }, [])

  const loadMore = useCallback(async () => {
    const nextPage = state.pagination.currentPage + 1
    await fetchOrders(filters, nextPage)
  }, [state.pagination.currentPage, filters, fetchOrders])

  return {
    // State
    ...state,
    
    // Actions
    fetchOrders,
    createOrder,
    updateOrder,
    cancelOrder,
    searchOrders,
    initiateTrade,
    acceptTrade,
    lockEscrow,
    releaseEscrow,
    cancelTrade,
    disputeTrade,
    sendMessage,
    loadMessages,
    setFilters,
    resetFilters,
    loadMore,
    
    // Utilities
    formatCurrency,
    formatPrice,
    calculateTotal,
    validateTradeAmount,
    canInitiateTrade,
    subscribeToOrderUpdates,
    subscribeToTradeUpdates
  }
}