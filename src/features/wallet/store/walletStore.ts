
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Token, Nft, Tx, Account, TransferParams, NftTransferParams, AddTokenParams, AddNftParams } from '../types/wallet.types'

interface WalletState {
  // Core data
  tokens: Token[]
  customTokens: Token[]
  nfts: Nft[]
  customNfts: Nft[]
  balances: Record<string, Record<string, string>> // accountId -> assetKey -> balance
  history: Record<string, Tx[]> // accountId -> transactions
  
  // Loading states
  isLoading: boolean
  isLoadingBalances: boolean
  isLoadingHistory: boolean
  
  // Actions
  loadBalances: (accountId: string) => Promise<void>
  transferToken: (params: TransferParams) => Promise<Tx>
  transferNft: (params: NftTransferParams) => Promise<Tx>
  addCustomToken: (token: AddTokenParams) => void
  addCustomNft: (nft: AddNftParams) => void
  appendHistory: (accountId: string, tx: Tx) => void
  setLoading: (loading: boolean) => void
  
  // Getters
  getTokenBalance: (accountId: string, tokenKey: string) => string
  getAccountHistory: (accountId: string) => Tx[]
  getAllTokens: () => Token[]
  getTotalBalanceInBZR: (accountId: string) => number
}

// Mock default tokens (native BZR + some assets)
const DEFAULT_TOKENS: Token[] = [
  {
    key: 'BZR',
    type: 'native',
    symbol: 'BZR',
    decimals: 12,
    name: 'Bazari Token'
  },
  {
    key: 'USDT',
    type: 'asset',
    assetId: 1,
    symbol: 'USDT',
    decimals: 6,
    name: 'Tether USD'
  },
  {
    key: 'DOT',
    type: 'asset', 
    assetId: 2,
    symbol: 'DOT',
    decimals: 10,
    name: 'Polkadot'
  }
]

// Utility functions
const generateTxHash = () => `0x${Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, '0')).join('')}`

const formatBalance = (balance: string, decimals: number): string => {
  const num = parseFloat(balance) / Math.pow(10, decimals)
  return num.toFixed(6)
}

const createMockBalance = (): string => {
  // Generate random balance between 0-10000
  const randomBalance = Math.floor(Math.random() * 10000)
  return randomBalance.toString()
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      // Initial state
      tokens: DEFAULT_TOKENS,
      customTokens: [],
      nfts: [],
      customNfts: [],
      balances: {},
      history: {},
      isLoading: false,
      isLoadingBalances: false,
      isLoadingHistory: false,

      // Load balances for an account
      loadBalances: async (accountId: string) => {
        set({ isLoadingBalances: true })
        
        try {
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          const tokens = get().getAllTokens()
          const newBalances: Record<string, string> = {}
          
          // Generate mock balances for each token
          tokens.forEach(token => {
            newBalances[token.key] = createMockBalance()
          })
          
          set(state => ({
            balances: {
              ...state.balances,
              [accountId]: newBalances
            },
            isLoadingBalances: false
          }))
          
        } catch (error) {
          console.error('Failed to load balances:', error)
          set({ isLoadingBalances: false })
        }
      },

      // Transfer token
      transferToken: async (params: TransferParams) => {
        const { from, to, token, amount } = params
        
        set({ isLoading: true })
        
        try {
          // Simulate transaction processing
          await new Promise(resolve => setTimeout(resolve, 2000))
          
          const tx: Tx = {
            hash: generateTxHash(),
            time: Date.now(),
            kind: 'send',
            assetKey: token.key,
            amount,
            from: from.address,
            to,
            status: 'pending'
          }
          
          // Add to history
          get().appendHistory(from.id, tx)
          
          // Update balance (subtract amount)
          const currentBalance = get().getTokenBalance(from.id, token.key)
          const newBalance = (parseFloat(currentBalance) - parseFloat(amount)).toString()
          
          set(state => ({
            balances: {
              ...state.balances,
              [from.id]: {
                ...state.balances[from.id],
                [token.key]: newBalance
              }
            },
            isLoading: false
          }))
          
          // Simulate confirmation after 3 seconds
          setTimeout(() => {
            set(state => ({
              history: {
                ...state.history,
                [from.id]: state.history[from.id]?.map(t => 
                  t.hash === tx.hash ? { ...t, status: 'finalized' } : t
                ) || []
              }
            }))
          }, 3000)
          
          return tx
          
        } catch (error) {
          set({ isLoading: false })
          throw new Error(`Transfer failed: ${error.message}`)
        }
      },

      // Transfer NFT
      transferNft: async (params: NftTransferParams) => {
        const { from, to, nft } = params
        
        set({ isLoading: true })
        
        try {
          await new Promise(resolve => setTimeout(resolve, 2000))
          
          const tx: Tx = {
            hash: generateTxHash(),
            time: Date.now(),
            kind: 'send',
            assetKey: `nft_${nft.collection}_${nft.id}`,
            from: from.address,
            to,
            status: 'pending'
          }
          
          get().appendHistory(from.id, tx)
          
          set({ isLoading: false })
          
          return tx
          
        } catch (error) {
          set({ isLoading: false })
          throw new Error(`NFT transfer failed: ${error.message}`)
        }
      },

      // Add custom token
      addCustomToken: (tokenParams: AddTokenParams) => {
        const token: Token = {
          key: `asset_${tokenParams.assetId}`,
          type: 'asset',
          assetId: tokenParams.assetId,
          symbol: tokenParams.symbol,
          decimals: tokenParams.decimals,
          name: tokenParams.name,
          iconUrl: tokenParams.iconUrl
        }
        
        set(state => ({
          customTokens: [...state.customTokens, token]
        }))
      },

      // Add custom NFT
      addCustomNft: (nftParams: AddNftParams) => {
        const nft: Nft = {
          id: `custom_${Date.now()}`,
          collection: nftParams.collectionId,
          name: nftParams.name,
          meta: {
            external_url: nftParams.endpoint,
            description: `Custom NFT from ${nftParams.collectionId}`
          }
        }
        
        set(state => ({
          customNfts: [...state.customNfts, nft]
        }))
      },

      // Append transaction to history
      appendHistory: (accountId: string, tx: Tx) => {
        set(state => ({
          history: {
            ...state.history,
            [accountId]: [tx, ...(state.history[accountId] || [])]
          }
        }))
      },

      // Set loading state
      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      // Get token balance for account
      getTokenBalance: (accountId: string, tokenKey: string) => {
        const state = get()
        return state.balances[accountId]?.[tokenKey] || '0'
      },

      // Get transaction history for account
      getAccountHistory: (accountId: string) => {
        const state = get()
        return state.history[accountId] || []
      },

      // Get all tokens (default + custom)
      getAllTokens: () => {
        const state = get()
        return [...state.tokens, ...state.customTokens]
      },

      // Calculate total balance in BZR
      getTotalBalanceInBZR: (accountId: string) => {
        const state = get()
        const tokens = state.getAllTokens()
        let total = 0
        
        tokens.forEach(token => {
          const balance = state.getTokenBalance(accountId, token.key)
          const formattedBalance = parseFloat(formatBalance(balance, token.decimals))
          
          // For demo, assume 1:1 exchange rate to BZR for simplicity
          // In real app, you'd fetch actual exchange rates
          total += formattedBalance
        })
        
        return total
      }
    }),
    {
      name: 'bazari-wallet-main',
      partialize: (state) => ({
        customTokens: state.customTokens,
        customNfts: state.customNfts,
        balances: state.balances,
        history: state.history
      })
    }
  )
)