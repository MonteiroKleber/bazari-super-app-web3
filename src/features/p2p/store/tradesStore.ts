
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { P2PTrade, PaymentMethod } from '../types/p2p.types'
import { p2pService } from '../services/p2pService'

export interface CreateTradeParams {
  offerId: string
  buyerId: string
  sellerId: string
  amountBZR: string
  paymentMethod: PaymentMethod
  priceBZR: number
}

interface TradesState {
  // State
  trades: P2PTrade[]
  loading: boolean
  error?: string
  
  // Actions
  fetchTrades: () => Promise<void>
  createTrade: (params: CreateTradeParams) => Promise<P2PTrade>
  updateTrade: (id: string, patch: Partial<P2PTrade>) => Promise<void>
  appendTimeline: (id: string, evt: { ts: number; type: string; payload?: any }) => void
  
  // Trade flow actions
  lockEscrow: (tradeId: string, escrowData: any) => void
  markPayment: (tradeId: string, proof?: string) => void
  releaseFunds: (tradeId: string) => void
  refundFunds: (tradeId: string) => void
  cancelTrade: (tradeId: string, reason?: string) => void
  openDispute: (tradeId: string, reason: string, attachments?: string[]) => void
  
  // Getters
  getTradeById: (id: string) => P2PTrade | undefined
  getTradesByUser: (userId: string) => P2PTrade[]
  getActiveTradesCount: () => number
}

export const useTradesStore = create<TradesState>()(
  persist(
    (set, get) => ({
      // Initial state
      trades: [],
      loading: false,
      error: undefined,

      // Actions
      fetchTrades: async () => {
        set({ loading: true, error: undefined })
        
        try {
          // Mock - em produção, buscar trades do usuário via API
          await new Promise(resolve => setTimeout(resolve, 400))
          
          const mockTrades: P2PTrade[] = [] // Por enquanto vazio
          
          set({ 
            trades: mockTrades,
            loading: false 
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro ao buscar negociações'
          set({ 
            loading: false, 
            error: message 
          })
          throw error
        }
      },

      createTrade: async (params) => {
        set({ loading: true, error: undefined })
        
        try {
          const trade = await p2pService.createTrade(params)
          
          set(state => ({
            trades: [trade, ...state.trades],
            loading: false
          }))
          
          return trade
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro ao criar negociação'
          set({ 
            loading: false, 
            error: message 
          })
          throw error
        }
      },

      updateTrade: async (id, patch) => {
        try {
          set(state => ({
            trades: state.trades.map(trade => 
              trade.id === id ? { ...trade, ...patch } : trade
            )
          }))
          
          // Sync with backend
          if (patch.status) {
            await p2pService.updateTradeStatus(id, patch.status, patch)
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro ao atualizar negociação'
          set({ error: message })
          throw error
        }
      },

      appendTimeline: (id, evt) => {
        set(state => ({
          trades: state.trades.map(trade => 
            trade.id === id 
              ? { ...trade, timeline: [...trade.timeline, evt] }
              : trade
          )
        }))
      },

      // Trade flow actions
      lockEscrow: (tradeId, escrowData) => {
        const now = Date.now()
        
        get().updateTrade(tradeId, {
          status: 'ESCROW_LOCKED',
          escrow: escrowData
        })
        
        get().appendTimeline(tradeId, {
          ts: now,
          type: 'ESCROW_LOCKED',
          payload: escrowData
        })
      },

      markPayment: (tradeId, proof) => {
        const now = Date.now()
        
        get().updateTrade(tradeId, {
          status: 'PAYMENT_MARKED'
        })
        
        get().appendTimeline(tradeId, {
          ts: now,
          type: 'PAYMENT_MARKED',
          payload: { proof }
        })
      },

      releaseFunds: (tradeId) => {
        const now = Date.now()
        
        get().updateTrade(tradeId, {
          status: 'RELEASED'
        })
        
        get().appendTimeline(tradeId, {
          ts: now,
          type: 'FUNDS_RELEASED',
          payload: {}
        })
      },

      refundFunds: (tradeId) => {
        const now = Date.now()
        
        get().updateTrade(tradeId, {
          status: 'REFUNDED'
        })
        
        get().appendTimeline(tradeId, {
          ts: now,
          type: 'FUNDS_REFUNDED',
          payload: {}
        })
      },

      cancelTrade: (tradeId, reason) => {
        const now = Date.now()
        
        get().updateTrade(tradeId, {
          status: 'CANCELLED'
        })
        
        get().appendTimeline(tradeId, {
          ts: now,
          type: 'TRADE_CANCELLED',
          payload: { reason }
        })
      },

      openDispute: (tradeId, reason, attachments) => {
        const now = Date.now()
        
        get().updateTrade(tradeId, {
          status: 'DISPUTE'
        })
        
        get().appendTimeline(tradeId, {
          ts: now,
          type: 'DISPUTE_OPENED',
          payload: { reason, attachments }
        })
      },

      // Getters
      getTradeById: (id) => {
        return get().trades.find(trade => trade.id === id)
      },

      getTradesByUser: (userId) => {
        return get().trades.filter(trade => 
          trade.buyerId === userId || trade.sellerId === userId
        )
      },

      getActiveTradesCount: () => {
        return get().trades.filter(trade => 
          !['RELEASED', 'REFUNDED', 'CANCELLED'].includes(trade.status)
        ).length
      }
    }),
    {
      name: 'bazari-p2p-trades',
      partialize: (state) => ({
        // Persistir apenas os dados essenciais
        trades: state.trades
      })
    }
  )
)