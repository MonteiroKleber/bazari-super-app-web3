// src/features/wallet/hooks/useActiveAccount.ts
import { useMemo, useCallback } from 'react'
import { useAccountsStore, type Account } from '../store/accountsStore'
import { useAuthStore } from '@features/auth/store/authStore'
import { formatWalletAddress } from '@shared/lib/formatters'

/**
 * Fonte única de contas para a Wallet:
 * - Lê as contas locais do módulo Auth (ExistingAccountLogin.tsx usa useAuthStore.localAccounts)
 * - Mapeia para o tipo Account da Wallet
 * - Garante que AccountSwitcher mostre exatamente as mesmas contas
 */
export function useActiveAccount() {
  // 1) Contas do AUTH (mesma origem da tela "Acessar sua conta existente")
  const localAccounts = useAuthStore(s => s.localAccounts)

  // 2) Estado interno da Wallet (ativo, setActive)
  const setActive = useAccountsStore(s => s.setActive)
  const getByAddress = useAccountsStore(s => s.getByAddress)
  const addWatchOnly = useAccountsStore(s => s.addWatchOnly)
  const activeState = useAccountsStore(s => s.active)

  // 3) Normaliza lista do AUTH -> tipo Account (id = address para estabilidade)
  const accounts: Account[] = useMemo(() => {
    return (localAccounts || []).map(a => ({
      id: a.address,
      address: a.address,
      name: a.name,
      type: 'local' as const,
    }))
  }, [localAccounts])

  // 4) Conta ativa: mantém a ativa se compatível, senão usa a primeira local
  const activeAccount: Account | undefined = useMemo(() => {
    if (activeState && accounts.find(x => x.address === activeState.address)) {
      return activeState
    }
    return accounts[0]
  }, [activeState, accounts])

  // 5) switchAccount: recebe id (address) e ativa no store da Wallet
  const switchAccount = useCallback((id: string) => {
    if (!id) return
    const existing = getByAddress?.(id)
    if (!existing) {
      // insere placeholder mínimo para permitir setActive
      addWatchOnly?.(id, accounts.find(a => a.address === id)?.name || 'Conta')
    }
    try { setActive(id) } catch {}
  }, [setActive, getByAddress, addWatchOnly, accounts])

  // 6) isWatchOnly como FUNÇÃO (compat com componentes que chamam isWatchOnly(...))
  const isWatchOnly = useCallback((acct?: Account) => {
    const a = acct ?? activeAccount
    if (!a) return false
    return a.type === 'watch'
  }, [activeAccount])

  // 7) formatAddress como FUNÇÃO
  const formatAddress = useCallback((address: string, length = 8) => {
    return formatWalletAddress(address ?? '', length)
  }, [])

  return {
    activeAccount,
    accounts,
    switchAccount,
    isWatchOnly,
    formatAddress,
  }
}
