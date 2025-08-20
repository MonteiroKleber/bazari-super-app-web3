// ==========================================
// src/features/p2p/store/tradesStore.ts - COMPLETO
// ==========================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { p2pService, type CreateTradeParams } from '../services/p2pService'
import type { P2PTrade, P2PTradeStatus } from '../types/p2p.types'

interface TradesState {
  trades: P2PTrade[]
  myTrades: P2PTrade[]
  activeTrades: P2PTrade[]
  loading: boolean
  error: string | null
  initialized: boolean
  
  // Estado do trade ativo (para TradeRoom)
  currentTrade: P2PTrade | null
  currentTradeLoading: boolean
}

interface TradesActions {
  // Core CRUD
  fetchTrades: (filters?: { userId?: string; status?: P2PTradeStatus; offerId?: string }) => Promise<void>
  fetchMyTrades: () => Promise<void>
  fetchTradeById: (id: string) => Promise<P2PTrade | null>
  createTrade: (params: CreateTradeParams) => Promise<P2PTrade>
  updateTradeStatus: (tradeId: string, status: P2PTradeStatus, payload?: any) => Promise<void>
  
  // Trade específico
  setCurrentTrade: (trade: P2PTrade | null) => void
  refreshCurrentTrade: () => Promise<void>
  
  // Getters
  getTradeById: (id: string) => P2PTrade | undefined
  getTradesByOffer: (offerId: string) => P2PTrade[]
  getActiveTradesCount: () => number
  getUserTradesCount: (userId: string) => number
  
  // Utilitários
  resetStore: () => void
  clearError: () => void
}

const initialState: TradesState = {
  trades: [],
  myTrades: [],
  activeTrades: [],
  loading: false,
  error: null,
  initialized: false,
  currentTrade: null,
  currentTradeLoading: false
}

export const useTradesStore = create<TradesState & TradesActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      fetchTrades: async (filters) => {
        set({ loading: true, error: null })
        try {
          console.log('🏪 TradesStore: Buscando trades com filtros:', filters)
          
          const trades = await p2pService.fetchTrades(filters)
          
          set({ 
            trades,
            loading: false,
            initialized: true
          })
          
          // Atualizar trades ativos
          const activeTrades = trades.filter(trade => 
            ['CREATED', 'PAID', 'CONFIRMED'].includes(trade.status)
          )
          set({ activeTrades })
          
          console.log('✅ TradesStore: Trades carregados:', trades.length)
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro ao buscar negociações'
          set({ 
            error: message,
            loading: false,
            initialized: true
          })
          console.error('❌ TradesStore: Erro ao buscar trades:', error)
        }
      },

      fetchMyTrades: async () => {
        set({ loading: true, error: null })
        try {
          console.log('🏪 TradesStore: Buscando minhas trades')
          
          // Em produção, pegar userId do authStore
          const userId = 'user_123' // Mock
          
          const trades = await p2pService.fetchTrades({ userId })
          
          set({ 
            myTrades: trades,
            loading: false
          })
          
          console.log('✅ TradesStore: Minhas trades carregadas:', trades.length)
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro ao buscar suas negociações'
          set({ 
            error: message,
            loading: false
          })
          console.error('❌ TradesStore: Erro ao buscar minhas trades:', error)
        }
      },

      fetchTradeById: async (id) => {
        set({ currentTradeLoading: true, error: null })
        try {
          console.log('🏪 TradesStore: Buscando trade por ID:', id)
          
          // Primeiro verificar estado local
          const localTrade = get().trades.find(trade => trade.id === id)
          if (localTrade) {
            console.log('📋 TradesStore: Trade encontrado no estado local')
            set({ 
              currentTrade: localTrade,
              currentTradeLoading: false
            })
            return localTrade
          }
          
          // Buscar via service
          const trade = await p2pService.fetchTradeById(id)
          
          if (trade) {
            console.log('✅ TradesStore: Trade encontrado via service')
            
            // Adicionar ao estado local
            set(state => ({
              trades: [trade, ...state.trades.filter(t => t.id !== trade.id)],
              currentTrade: trade,
              currentTradeLoading: false
            }))
            
            return trade
          } else {
            console.log('❌ TradesStore: Trade não encontrado')
            set({ 
              currentTrade: null,
              currentTradeLoading: false
            })
            return null
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro ao buscar negociação'
          set({ 
            error: message,
            currentTradeLoading: false
          })
          console.error('❌ TradesStore: Erro ao buscar trade por ID:', error)
          return null
        }
      },

      createTrade: async (params) => {
        set({ loading: true, error: null })
        try {
          console.log('🏪 TradesStore: Criando novo trade:', params)
          
          const trade = await p2pService.createTrade(params)
          
          set(state => ({ 
            trades: [trade, ...state.trades],
            myTrades: [trade, ...state.myTrades],
            activeTrades: [trade, ...state.activeTrades],
            currentTrade: trade,
            loading: false 
          }))
          
          console.log('✅ TradesStore: Trade criado com sucesso:', trade.id)
          return trade
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro ao criar negociação'
          set({ 
            error: message,
            loading: false 
          })
          console.error('❌ TradesStore: Erro ao criar trade:', error)
          throw error
        }
      },

      updateTradeStatus: async (tradeId, status, payload) => {
        set({ loading: true, error: null })
        try {
          console.log('🏪 TradesStore: Atualizando status do trade:', tradeId, 'para', status)
          
          const updatedTrade = await p2pService.updateTradeStatus(tradeId, status, payload)
          
          // Atualizar em todos os arrays
          const updateTradeInArray = (trades: P2PTrade[]) => 
            trades.map(trade => trade.id === tradeId ? updatedTrade : trade)
          
          set(state => ({
            trades: updateTradeInArray(state.trades),
            myTrades: updateTradeInArray(state.myTrades),
            activeTrades: status === 'COMPLETED' || status === 'CANCELLED'
              ? state.activeTrades.filter(t => t.id !== tradeId)
              : updateTradeInArray(state.activeTrades),
            currentTrade: state.currentTrade?.id === tradeId ? updatedTrade : state.currentTrade,
            loading: false
          }))
          
          console.log('✅ TradesStore: Status do trade atualizado:', tradeId, 'para', status)
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro ao atualizar negociação'
          set({ 
            error: message,
            loading: false 
          })
          console.error('❌ TradesStore: Erro ao atualizar status:', error)
          throw error
        }
      },

      // Trade específico
      setCurrentTrade: (trade) => {
        set({ currentTrade: trade })
      },

      refreshCurrentTrade: async () => {
        const { currentTrade } = get()
        if (!currentTrade) return
        
        console.log('🔄 TradesStore: Atualizando trade atual:', currentTrade.id)
        
        try {
          const updatedTrade = await p2pService.fetchTradeById(currentTrade.id)
          if (updatedTrade) {
            set({ currentTrade: updatedTrade })
            
            // Atualizar também nos arrays
            set(state => ({
              trades: state.trades.map(t => t.id === updatedTrade.id ? updatedTrade : t),
              myTrades: state.myTrades.map(t => t.id === updatedTrade.id ? updatedTrade : t),
              activeTrades: state.activeTrades.map(t => t.id === updatedTrade.id ? updatedTrade : t)
            }))
          }
        } catch (error) {
          console.error('❌ TradesStore: Erro ao atualizar trade atual:', error)
        }
      },

      // Getters
      getTradeById: (id) => {
        return get().trades.find(trade => trade.id === id)
      },

      getTradesByOffer: (offerId) => {
        return get().trades.filter(trade => trade.offerId === offerId)
      },

      getActiveTradesCount: () => {
        return get().activeTrades.length
      },

      getUserTradesCount: (userId) => {
        return get().trades.filter(trade => 
          trade.buyerId === userId || trade.sellerId === userId
        ).length
      },

      // Utilitários
      resetStore: () => {
        console.log('🏪 TradesStore: Resetando store')
        set(initialState)
      },

      clearError: () => {
        set({ error: null })
      }
    }),
    {
      name: 'bazari-p2p-trades',
      partialize: (state) => ({
        // Não persistir dados, apenas estado de UI se necessário
        // trades e currentTrade devem ser sempre carregados frescos
      })
    }
  )
)