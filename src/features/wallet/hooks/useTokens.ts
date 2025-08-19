// src/features/wallet/hooks/useTokens.ts

import { useMemo } from 'react'
import { useWalletStore } from '../store/walletStore'
import { useActiveAccount } from './useActiveAccount'
import { Token } from '../types/wallet.types'

export interface TokenWithBalance extends Token {
  balance: string
  formattedBalance: string
  balanceInFiat?: number
  priceUSD?: number
}

export const useTokens = () => {
  const { 
    tokens, 
    customTokens, 
    balances, 
    getTokenBalance, 
    getAllTokens,
    getTotalBalanceInBZR,
    loadBalances,
    isLoadingBalances
  } = useWalletStore()
  
  const { activeAccount } = useActiveAccount()
  
  const allTokens = getAllTokens()
  
  const tokensWithBalances: TokenWithBalance[] = useMemo(() => {
    if (!activeAccount) return []
    
    return allTokens.map(token => {
      const balance = getTokenBalance(activeAccount.id, token.key)
      const balanceNum = parseFloat(balance) / Math.pow(10, token.decimals)
      
      return {
        ...token,
        balance,
        formattedBalance: balanceNum.toFixed(6),
        balanceInFiat: balanceNum * (token.key === 'BZR' ? 1 : Math.random() * 2), // Mock price
        priceUSD: token.key === 'BZR' ? 1 : Math.random() * 2
      }
    })
  }, [allTokens, activeAccount, balances])
  
  const nativeToken = useMemo(() => {
    return tokensWithBalances.find(token => token.type === 'native')
  }, [tokensWithBalances])
  
  const assetTokens = useMemo(() => {
    return tokensWithBalances.filter(token => token.type === 'asset')
  }, [tokensWithBalances])
  
  const totalBalance = useMemo(() => {
    return activeAccount ? getTotalBalanceInBZR(activeAccount.id) : 0
  }, [activeAccount, balances, getTotalBalanceInBZR])
  
  const refreshBalances = async () => {
    if (activeAccount) {
      await loadBalances(activeAccount.id)
    }
  }
  
  const getTokenByKey = (key: string): TokenWithBalance | undefined => {
    return tokensWithBalances.find(token => token.key === key)
  }
  
  const getTokenByAssetId = (assetId: string | number): TokenWithBalance | undefined => {
    return tokensWithBalances.find(token => token.assetId === assetId)
  }
  
  const formatTokenAmount = (amount: string, token: Token): string => {
    const amountNum = parseFloat(amount) / Math.pow(10, token.decimals)
    return `${amountNum.toFixed(6)} ${token.symbol}`
  }
  
  const parseTokenAmount = (amount: string, token: Token): string => {
    const amountNum = parseFloat(amount)
    return Math.floor(amountNum * Math.pow(10, token.decimals)).toString()
  }
  
  return {
    tokens: tokensWithBalances,
    nativeToken,
    assetTokens,
    customTokens,
    totalBalance,
    isLoading: isLoadingBalances,
    refreshBalances,
    getTokenByKey,
    getTokenByAssetId,
    formatTokenAmount,
    parseTokenAmount
  }
}