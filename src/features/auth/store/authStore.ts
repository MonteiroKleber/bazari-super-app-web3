import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  name: string
  email?: string
  avatar?: string
  walletAddress: string
  reputation: {
    rating: number
    reviewCount: number
  }
  createdAt: string
  lastLoginAt: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  seedPhrase?: string[]
  
  // Actions
  login: (user: User) => void
  logout: () => void
  setUser: (user: User) => void
  setSeedPhrase: (seedPhrase: string[]) => void
  clearSeedPhrase: () => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      seedPhrase: undefined,

      login: (user: User) => {
        set({ 
          user, 
          isAuthenticated: true,
          isLoading: false 
        })
      },

      logout: () => {
        set({ 
          user: null, 
          isAuthenticated: false, 
          seedPhrase: undefined,
          isLoading: false 
        })
        // Clear all persisted data
        localStorage.removeItem('bazari-auth')
        localStorage.removeItem('bazari-wallet')
        localStorage.removeItem('bazari-notifications')
      },

      setUser: (user: User) => {
        set({ user })
      },

      setSeedPhrase: (seedPhrase: string[]) => {
        set({ seedPhrase })
      },

      clearSeedPhrase: () => {
        set({ seedPhrase: undefined })
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading })
      }
    }),
    {
      name: 'bazari-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)
