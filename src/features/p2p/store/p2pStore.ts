import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
}

export interface P2PChatMessage {
  id: string
  tradeId: string
  senderId: string
  senderName: string
  text: string
  createdAt: string
}

interface P2PState {
  orders: P2POrder[]
  myOrders: P2POrder[]
  trades: P2PTrade[]
  myTrades: P2PTrade[]
  isLoading: boolean
  
  // Actions
  setOrders: (orders: P2POrder[]) => void
  addOrder: (order: P2POrder) => void
  updateOrder: (id: string, updates: Partial<P2POrder>) => void
  removeOrder: (id: string) => void
  
  setTrades: (trades: P2PTrade[]) => void
  addTrade: (trade: P2PTrade) => void
  updateTrade: (id: string, updates: Partial<P2PTrade>) => void
  
  addMessage: (tradeId: string, message: Omit<P2PChatMessage, 'id' | 'createdAt'>) => void
  
  setLoading: (loading: boolean) => void
  fetchOrders: () => Promise<void>
  fetchMyTrades: () => Promise<void>
  createOrder: (order: Omit<P2POrder, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>
  initiateTrade: (orderId: string, amount: number) => Promise<string>
}

export const useP2PStore = create<P2PState>()(
  persist(
    (set, get) => ({
      orders: [],
      myOrders: [],
      trades: [],
      myTrades: [],
      isLoading: false,

      setOrders: (orders: P2POrder[]) => set({ orders }),
      
      addOrder: (order: P2POrder) => {
        set(state => ({
          orders: [order, ...state.orders],
          myOrders: [order, ...state.myOrders]
        }))
      },

      updateOrder: (id: string, updates: Partial<P2POrder>) => {
        set(state => ({
          orders: state.orders.map(o => o.id === id ? { ...o, ...updates } : o),
          myOrders: state.myOrders.map(o => o.id === id ? { ...o, ...updates } : o)
        }))
      },

      removeOrder: (id: string) => {
        set(state => ({
          orders: state.orders.filter(o => o.id !== id),
          myOrders: state.myOrders.filter(o => o.id !== id)
        }))
      },

      setTrades: (trades: P2PTrade[]) => set({ trades }),
      
      addTrade: (trade: P2PTrade) => {
        set(state => ({
          trades: [trade, ...state.trades],
          myTrades: [trade, ...state.myTrades]
        }))
      },

      updateTrade: (id: string, updates: Partial<P2PTrade>) => {
        set(state => ({
          trades: state.trades.map(t => t.id === id ? { ...t, ...updates } : t),
          myTrades: state.myTrades.map(t => t.id === id ? { ...t, ...updates } : t)
        }))
      },

      addMessage: (tradeId: string, message: Omit<P2PChatMessage, 'id' | 'createdAt'>) => {
        const newMessage: P2PChatMessage = {
          ...message,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString()
        }

        set(state => ({
          trades: state.trades.map(t => 
            t.id === tradeId 
              ? { ...t, messages: [...t.messages, newMessage] }
              : t
          ),
          myTrades: state.myTrades.map(t => 
            t.id === tradeId 
              ? { ...t, messages: [...t.messages, newMessage] }
              : t
          )
        }))
      },

      setLoading: (isLoading: boolean) => set({ isLoading }),

      fetchOrders: async () => {
        set({ isLoading: true })
        try {
          // Mock API call
          await new Promise(resolve => setTimeout(resolve, 1000))
          // Would fetch from API
        } finally {
          set({ isLoading: false })
        }
      },

      fetchMyTrades: async () => {
        set({ isLoading: true })
        try {
          // Mock API call
          await new Promise(resolve => setTimeout(resolve, 500))
          // Would fetch user's trades
        } finally {
          set({ isLoading: false })
        }
      },

      createOrder: async (orderData) => {
        const order: P2POrder = {
          ...orderData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        get().addOrder(order)
        return order.id
      },

      initiateTrade: async (orderId: string, amount: number) => {
        const order = get().orders.find(o => o.id === orderId)
        if (!order) throw new Error('Order not found')

        const trade: P2PTrade = {
          id: crypto.randomUUID(),
          orderId,
          buyerId: order.orderType === 'sell' ? 'current-user' : order.ownerId,
          sellerId: order.orderType === 'buy' ? 'current-user' : order.ownerId,
          amount,
          unitPriceBRL: order.unitPriceBRL,
          totalBRL: amount * order.unitPriceBRL,
          escrowStatus: 'pending',
          status: 'initiated',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: []
        }

        if (order.escrowEnabled) {
          trade.escrowExpiresAt = new Date(Date.now() + order.escrowTimeLimitMinutes * 60000).toISOString()
        }

        get().addTrade(trade)
        return trade.id
      }
    }),
    {
      name: 'bazari-p2p',
      partialize: (state) => ({
        myOrders: state.myOrders,
        myTrades: state.myTrades
      })
    }
  )
)