
import { useAccountsStore } from '../store/accountsStore'
import { Account } from '../types/wallet.types'

export const useActiveAccount = () => {
  const { accounts, activeAccountId, setActive } = useAccountsStore()
  
  const activeAccount = accounts.find(acc => acc.id === activeAccountId)
  
  const switchAccount = (accountId: string) => {
    setActive(accountId)
  }
  
  const getAccountByAddress = (address: string): Account | undefined => {
    return accounts.find(acc => acc.address === address)
  }
  
  const getAccountById = (id: string): Account | undefined => {
    return accounts.find(acc => acc.id === id)
  }
  
  const formatAddress = (address: string, length = 8): string => {
    if (!address) return ''
    if (address.length <= length * 2) return address
    return `${address.slice(0, length)}...${address.slice(-length)}`
  }
  
  const isWatchOnly = (account?: Account): boolean => {
    return account?.type === 'watch'
  }
  
  return {
    activeAccount,
    accounts,
    switchAccount,
    getAccountByAddress,
    getAccountById,
    formatAddress,
    isWatchOnly,
    hasAccounts: accounts.length > 0
  }
}



