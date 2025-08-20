// ==========================================
// src/features/p2p/hooks/useEscrow.ts
// ==========================================

import { useState, useCallback } from 'react'
import { escrowService, type EscrowLockParams, type EscrowStatusResponse } from '../services/escrowService'
import { useTradesStore } from '../store/tradesStore'

export interface UseEscrowReturn {
  loading: boolean
  error: string | null
  lockEscrow: (params: EscrowLockParams, tradeId: string) => Promise<string>
  releaseEscrow: (escrowId: string, tradeId: string) => Promise<void>
  refundEscrow: (escrowId: string, tradeId: string) => Promise<void>
  checkEscrowStatus: (escrowId: string) => Promise<EscrowStatusResponse>
  clearError: () => void
}

export const useEscrow = (): UseEscrowReturn => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { lockEscrow: lockEscrowInStore, releaseFunds, refundFunds, appendTimeline } = useTradesStore()

  const lockEscrow = useCallback(async (
    params: EscrowLockParams, 
    tradeId: string
  ): Promise<string> => {
    setLoading(true)
    setError(null)
    
    try {
      const { escrowId } = await escrowService.lock(params)
      
      const escrowData = {
        escrowId,
        from: params.from,
        to: params.to,
        amountBZR: params.amount,
        createdAt: Date.now(),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000)
      }
      
      lockEscrowInStore(tradeId, escrowData)
      
      setLoading(false)
      return escrowId
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao bloquear escrow'
      setError(errorMessage)
      setLoading(false)
      
      appendTimeline(tradeId, {
        ts: Date.now(),
        type: 'ESCROW_LOCK_FAILED',
        payload: { error: errorMessage }
      })
      
      throw err
    }
  }, [lockEscrowInStore, appendTimeline])

  const releaseEscrow = useCallback(async (
    escrowId: string, 
    tradeId: string
  ): Promise<void> => {
    setLoading(true)
    setError(null)
    
    try {
      await escrowService.release({ escrowId })
      releaseFunds(tradeId)
      setLoading(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao liberar escrow'
      setError(errorMessage)
      setLoading(false)
      throw err
    }
  }, [releaseFunds])

  const refundEscrow = useCallback(async (
    escrowId: string, 
    tradeId: string
  ): Promise<void> => {
    setLoading(true)
    setError(null)
    
    try {
      await escrowService.refund({ escrowId })
      refundFunds(tradeId)
      setLoading(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao reembolsar escrow'
      setError(errorMessage)
      setLoading(false)
      throw err
    }
  }, [refundFunds])

  const checkEscrowStatus = useCallback(async (
    escrowId: string
  ): Promise<EscrowStatusResponse> => {
    setLoading(true)
    setError(null)
    
    try {
      const status = await escrowService.getStatus({ escrowId })
      setLoading(false)
      return status
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao verificar status do escrow'
      setError(errorMessage)
      setLoading(false)
      throw err
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    loading,
    error,
    lockEscrow,
    releaseEscrow,
    refundEscrow,
    checkEscrowStatus,
    clearError
  }
}