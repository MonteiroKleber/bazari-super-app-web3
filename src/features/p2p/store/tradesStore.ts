// ==========================================
// src/features/p2p/store/tradesStore.ts
// ==========================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { p2pService, type CreateTradeParams } from '../services/p2pService'
import type { P2PTrade } from '../types/p2p.types'

interface TradesState {
  trades: P2PTrade[]
  loading: boolean
  error: string | null
}

interface TradesActions {
  fetchTrades: (userId?: string) => Promise<void>
  createTrade: (params: CreateTradeParams) => Promise<P2PTrade>
  updateTrade: (id: string, patch: Partial<P2PTrade>) => Promise<void>
  appendTimeline: (id: string, evt: { ts: number; type: string; payload?: any }) => void
  lockEscrow: (tradeId: string, escrowData: any) => void
  markPayment: (tradeId: string, proof: string) => void
  releaseFunds: (tradeId: string) => void
  refundFunds: (tradeId: string) => void
  cancelTrade: (tradeId: string, reason: string) => void
  openDispute: (tradeId: string, reason: string, attachments?: string[]) => void
  getTradeById: (id: string) => P2PTrade | undefined
  getTradesByUser: (userId: string) => P2PTrade[]
  getActiveTradesCount: () => number
}

export const useTradesStore = create<TradesState & TradesActions>()(
  persist(
    (set, get) => ({
      trades: [],
      loading: false,
      error: null,

      fetchTrades: async (userId) => {
        set({ loading: true, error: null })
        try {
          const trades = userId ? 
            await p2pService.fetchTrades(userId) : 
            p2pService.getAllTrades()
          set({ trades, loading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Erro ao buscar trades',
            loading: false 
          })
        }
      },

      createTrade: async (params) => {
        set({ loading: true, error: null })
        try {
          const trade = await p2pService.createTrade(params)
          set(state => ({ 
            trades: [trade, ...state.trades],
            loading: false 
          }))
          return trade
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro ao criar trade'
          set({ error: message, loading: false })
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
      name: 'bazari-p2p-trades'
    }
  )
)