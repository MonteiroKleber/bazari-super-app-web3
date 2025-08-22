import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Token } from '../types/wallet.types'
import { tokenService } from '../services/tokenService'
import { useAccountsStore } from './accountsStore'

type BalancesMap = Record<string, Record<string, string>> // accountRef -> tokenKey -> raw

interface WalletState {
  tokens: Token[]
  customTokens: Token[]

  balances: BalancesMap
  isLoadingBalances: boolean

  getAllTokens: () => Token[]
  getTokenByKey: (key: string) => Token | undefined
  getTokenByAssetId: (assetId: number | string) => Token | undefined

  // agora aceita id OU address (resolve internamente)
  getTokenBalance: (tokenOrKey: string | Token, accountRef: string) => Promise<string>

  setTokens: (tokens: Token[]) => void
  addCustomToken: (t: Token) => void
  removeCustomToken: (key: string) => void

  loadBalances: (accountRef: string) => Promise<void>
  refreshBalances: (accountRef: string) => Promise<void>
  getTotalBalanceInBZR: (accountRef: string) => number

  formatTokenAmount: (key: string, raw: string) => string
  parseTokenAmount: (key: string, display: string) => string
}

const DEFAULT_NATIVE: Token = {
  key: 'BZR',
  type: 'native',
  symbol: 'BZR',
  decimals: 12,
  name: 'BazariChain Native Token',
}

function resolveAddress(accountRef: string): string {
  try {
    const st = useAccountsStore.getState()
    const byId = st.getById?.(accountRef)
    if (byId?.address) return byId.address
    const byAddr = st.getByAddress?.(accountRef)
    if (byAddr?.address) return byAddr.address
  } catch {}
  return accountRef // já é address
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      tokens: [DEFAULT_NATIVE],
      customTokens: [],
      balances: {},
      isLoadingBalances: false,

      getAllTokens: () => {
        const s = get()
        return [...(s.tokens || []), ...(s.customTokens || [])]
      },

      getTokenByKey: (key) => get().getAllTokens().find(t => t.key === key),

      getTokenByAssetId: (assetId) => {
        const idStr = String(assetId)
        return get().getAllTokens().find((t: any) => t.assetId !== undefined && String(t.assetId) === idStr)
      },

      async getTokenBalance(tokenOrKey, accountRef) {
        const address = resolveAddress(accountRef)
        if (!address) return '0'
        const token =
          typeof tokenOrKey === 'string'
            ? (get().getTokenByKey(tokenOrKey) || DEFAULT_NATIVE)
            : tokenOrKey
        try {
          const raw = await tokenService.getTokenBalance(token as any, { address } as any)
          return raw || '0'
        } catch {
          return '0'
        }
      },

      setTokens: (tokens) => set({ tokens }),

      addCustomToken: (t) => {
        if (!t?.key) return
        const exists = get().customTokens.some(x => x.key === t.key)
        set({
          customTokens: exists
            ? get().customTokens.map(x => (x.key === t.key ? t : x))
            : [...get().customTokens, t],
        })
      },

      removeCustomToken: (key) => {
        set({ customTokens: get().customTokens.filter(x => x.key !== key) })
      },

      loadBalances: async (accountRef: string) => {
        const address = resolveAddress(accountRef)
        if (!address) return
        set({ isLoadingBalances: true })
        try {
          let base = get().tokens
          if (!base || base.length === 0 || (base.length === 1 && base[0].key === DEFAULT_NATIVE.key)) {
            try {
              const normalized = await tokenService.normalizeTokens()
              if (normalized?.length) {
                set({ tokens: normalized })
                base = normalized
              }
            } catch { /* mantém fallback */ }
          }

          const next = { ...(get().balances[address] || {}) }
          const all = [...(base || []), ...(get().customTokens || [])]
          for (const tok of all) {
            try {
              const raw = await tokenService.getTokenBalance(tok as any, { address } as any)
              next[tok.key] = raw
            } catch { /* ignora token com falha */ }
          }
          set({ balances: { ...get().balances, [address]: next } })
        } finally {
          set({ isLoadingBalances: false })
        }
      },

      refreshBalances: async (accountRef: string) => {
        await get().loadBalances(accountRef)
      },

      getTotalBalanceInBZR: (accountRef: string) => {
        const address = resolveAddress(accountRef)
        const map = get().balances[address] || {}
        const raw = map['BZR']
        if (!raw) return 0
        const t = get().getTokenByKey('BZR') || DEFAULT_NATIVE
        const dec = t.decimals ?? 12
        const num = parseFloat(raw) / Math.pow(10, dec)
        return Number.isFinite(num) ? num : 0
      },

      formatTokenAmount: (key: string, raw: string) => {
        const t = get().getTokenByKey(key) || DEFAULT_NATIVE
        const dec = t.decimals ?? 12
        const num = parseFloat(raw || '0') / Math.pow(10, dec)
        return Number.isFinite(num) ? num.toFixed(6) : '0.000000'
      },

      parseTokenAmount: (key: string, display: string) => {
        const t = get().getTokenByKey(key) || DEFAULT_NATIVE
        const dec = t.decimals ?? 12
        const val = parseFloat(display || '0')
        if (!Number.isFinite(val) || val <= 0) return '0'
        const raw = Math.round(val * Math.pow(10, dec)).toString()
        return raw
      },
    }),
    { name: 'bazari-wallet' }
  )
)
