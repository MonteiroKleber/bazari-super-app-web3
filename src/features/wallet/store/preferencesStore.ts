
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PreferencesState {
  fiatCurrency: 'BRL' | 'USD' | 'EUR'
  networkId: string
  locale?: string
  ui: {
    showZeroBalances: boolean
    defaultTab: 'tokens' | 'nfts'
    theme: 'light' | 'dark' | 'auto'
    compactMode: boolean
  }
  
  // Actions
  set: <K extends keyof PreferencesState>(key: K, value: PreferencesState[K]) => void
  setUiPreference: <K extends keyof PreferencesState['ui']>(key: K, value: PreferencesState['ui'][K]) => void
  reset: () => void
}

const DEFAULT_PREFERENCES: Omit<PreferencesState, 'set' | 'setUiPreference' | 'reset'> = {
  fiatCurrency: 'BRL',
  networkId: 'polkadot',
  locale: 'pt',
  ui: {
    showZeroBalances: false,
    defaultTab: 'tokens',
    theme: 'light',
    compactMode: false
  }
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_PREFERENCES,

      set: <K extends keyof PreferencesState>(key: K, value: PreferencesState[K]) => {
        set(state => ({
          ...state,
          [key]: value
        }))
      },

      setUiPreference: <K extends keyof PreferencesState['ui']>(
        key: K, 
        value: PreferencesState['ui'][K]
      ) => {
        set(state => ({
          ui: {
            ...state.ui,
            [key]: value
          }
        }))
      },

      reset: () => {
        set(DEFAULT_PREFERENCES)
      }
    }),
    {
      name: 'bazari-wallet-preferences'
    }
  )
)