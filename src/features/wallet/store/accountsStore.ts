import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'

export type Account = {
  id: string
  address: string
  name?: string
  type: 'local' | 'watch' | 'extension'
}

type AccountsState = {
  // SSOT
  all: Account[]           // fonte de verdade
  accounts: Account[]      // alias p/ compatibilidade (hooks/UX legados)
  active?: Account

  // helpers
  getByAddress: (address: string) => Account | undefined
  getById: (id: string) => Account | undefined

  // mutations
  addWatchOnly: (address: string, name?: string) => Account  // idempotente por address
  setActive: (id: string) => void
  clearActive: () => void
}

function dedupeByAddress(list: Account[]): Account[] {
  const seen = new Set<string>()
  const out: Account[] = []
  for (const a of list) {
    if (!a?.address) continue
    if (seen.has(a.address)) continue
    seen.add(a.address)
    out.push(a)
  }
  return out
}

export const useAccountsStore = create<AccountsState>()(
  persist(
    (set, get) => ({
      all: [],
      accounts: [],   // alias
      active: undefined,

      getByAddress: (address) => {
        const list = get().accounts || get().all || []
        return list.find(a => a.address === address)
      },

      getById: (id) => {
        const list = get().accounts || get().all || []
        return list.find(a => a.id === id)
      },

      addWatchOnly: (address, name) => {
        const list = get().accounts || get().all || []
        const existing = list.find(a => a.address === address)
        if (existing) return existing

        const acc: Account = { id: nanoid(), address, name, type: 'watch' }
        const deduped = dedupeByAddress([...(get().all || []), acc])

        set({ all: deduped, accounts: deduped })
        return acc
      },

      setActive: (id) => {
        const list = get().accounts || get().all || []
        const acc = list.find(a => a.id === id)
        if (acc) set({ active: acc })
      },

      clearActive: () => set({ active: undefined }),
    }),
    {
      name: 'bazari-accounts',
      version: 3,
      migrate: (state: any) => {
        const prev = state?.state ?? {}
        const rawList: Account[] =
          Array.isArray(prev.accounts) ? prev.accounts :
          Array.isArray(prev.all) ? prev.all : []

        const deduped = dedupeByAddress(rawList)

        let active: Account | undefined = prev.active
        if (active && !deduped.find(a => a.address === active.address)) {
          active = deduped[0]
        }

        return {
          ...state,
          state: {
            ...prev,
            all: deduped,
            accounts: deduped,
            active,
          },
        }
      },
    }
  )
)
