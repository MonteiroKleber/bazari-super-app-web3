import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Transaction {
  id: string
  type: 'send' | 'receive' | 'escrow' | 'release'
  amount: number
  currency: 'BZR' | 'BRL'
  fromAddress?: string
  toAddress?: string
  status: 'pending' | 'confirmed' | 'failed'
  timestamp: string
  description?: string
  escrowId?: string
}

export interface WalletBalance {
  BZR: number
  BRL: number
}

interface WalletState {
  balance: WalletBalance
  transactions: Transaction[]
  isLoading: boolean
  
  // Actions
  setBalance: (balance: WalletBalance) => void
  addTransaction: (transaction: Transaction) => void
  updateTransaction: (id: string, updates: Partial<Transaction>) => void
  setLoading: (loading: boolean) => void
  refreshBalance: () => Promise<void>
  sendMoney: (to: string, amount: number, currency: 'BZR' | 'BRL') => Promise<string>
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      balance: { BZR: 1000, BRL: 0 }, // Mock initial balance
      transactions: [],
      isLoading: false,

      setBalance: (balance: WalletBalance) => {
        set({ balance })
      },

      addTransaction: (transaction: Transaction) => {
        set(state => ({
          transactions: [transaction, ...state.transactions]
        }))
      },

      updateTransaction: (id: string, updates: Partial<Transaction>) => {
        set(state => ({
          transactions: state.transactions.map(tx =>
            tx.id === id ? { ...tx, ...updates } : tx
          )
        }))
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading })
      },

      refreshBalance: async () => {
        set({ isLoading: true })
        try {
          // Mock API call - replace with real wallet service
          await new Promise(resolve => setTimeout(resolve, 1000))
          // Balance would be fetched from blockchain/backend
        } finally {
          set({ isLoading: false })
        }
      },

      sendMoney: async (to: string, amount: number, currency: 'BZR' | 'BRL') => {
        const state = get()
        if (state.balance[currency] < amount) {
          throw new Error('Insufficient balance')
        }

        const transaction: Transaction = {
          id: crypto.randomUUID(),
          type: 'send',
          amount,
          currency,
          toAddress: to,
          status: 'pending',
          timestamp: new Date().toISOString(),
          description: `Sent ${amount} ${currency} to ${to}`
        }

        // Update balance optimistically
        set(state => ({
          balance: {
            ...state.balance,
            [currency]: state.balance[currency] - amount
          }
        }))

        // Add transaction
        get().addTransaction(transaction)

        // Mock sending - replace with real wallet service
        setTimeout(() => {
          get().updateTransaction(transaction.id, { status: 'confirmed' })
        }, 2000)

        return transaction.id
      }
    }),
    {
      name: 'bazari-wallet',
      partialize: (state) => ({
        balance: state.balance,
        transactions: state.transactions
      })
    }
  )
)
