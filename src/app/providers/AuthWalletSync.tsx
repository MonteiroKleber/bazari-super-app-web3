import { useEffect, useRef } from 'react'
import { useAuthStore } from '@features/auth/store/authStore'
import { useAccountsStore } from '@features/wallet/store/accountsStore'

/**
 * Mantém a conta do auth refletida na wallet (accountsStore) de forma idempotente.
 * - adiciona (watch-only) se não existir
 * - seleciona como ativa
 * - evita duplicar em StrictMode/HMR
 * - faz uma deduplicação suave por address na montagem
 */
export function AuthWalletSync() {
  const user = useAuthStore(s => s.user)

  const addWatchOnly = useAccountsStore(s => s.addWatchOnly)
  const setActive = useAccountsStore(s => s.setActive)
  const getByAddress = useAccountsStore(s => (s as any).getByAddress) as
    | ((addr: string) => { id: string } | undefined)
    | undefined

  const active = useAccountsStore(s => (s as any).active)
  const activeAddr: string | undefined = active?.address

  // evita rodar sincronização 2x em StrictMode
  const lastSyncedRef = useRef<string | null>(null)
  const didDedupeRef = useRef(false)

  // 1) Dedupe por address (uma vez)
  useEffect(() => {
    if (didDedupeRef.current) return
    didDedupeRef.current = true

    try {
      const st: any = (useAccountsStore as any).getState?.()
      if (!st) return

      const listKey = Array.isArray(st.all) ? 'all' : (Array.isArray(st.accounts) ? 'accounts' : null)
      if (!listKey) return

      const list = st[listKey] as Array<{ address: string, id: string }>
      if (!Array.isArray(list) || list.length <= 1) return

      const seen = new Set<string>()
      const deduped: typeof list = []
      for (const acc of list) {
        const addr = acc?.address
        if (!addr) continue
        if (!seen.has(addr)) {
          seen.add(addr)
          deduped.push(acc)
        }
      }
      if (deduped.length !== list.length) {
        ;(useAccountsStore as any).setState?.({ [listKey]: deduped })
      }
    } catch {
      // silencioso: se a store não expõe getState/setState, ignoramos
    }
  }, [])

  // 2) Sincroniza a conta do auth -> accountsStore (idempotente)
  useEffect(() => {
    const addr = user?.walletAddress
    if (!addr) return

    // se já ativo e é o mesmo endereço, nada a fazer
    if (activeAddr === addr) {
      lastSyncedRef.current = addr
      return
    }

    // evita rodar 2x (StrictMode/HMR)
    if (lastSyncedRef.current === addr) return

    // verifica se já existe na store
    let exists: { id: string } | undefined
    try {
      exists = typeof getByAddress === 'function'
        ? getByAddress(addr)
        : (() => {
            const st: any = (useAccountsStore as any).getState?.()
            const list: any[] = st?.all ?? st?.accounts ?? []
            return Array.isArray(list) ? list.find((a) => a?.address === addr) : undefined
          })()
    } catch {
      exists = undefined
    }

    try {
      const acc = exists ?? addWatchOnly(addr, user?.name || 'Conta')
      setActive(acc.id)
      lastSyncedRef.current = addr
    } catch {
      // fallback: se falhar addWatchOnly por já existir, tenta ativar
      try {
        const st: any = (useAccountsStore as any).getState?.()
        const list: any[] = st?.all ?? st?.accounts ?? []
        const found = Array.isArray(list) ? list.find((a) => a?.address === addr) : undefined
        if (found?.id) setActive(found.id)
        lastSyncedRef.current = addr
      } catch {
        // ignora
      }
    }
  }, [user?.walletAddress, user?.name, activeAddr, addWatchOnly, setActive, getByAddress])

  return null
}
