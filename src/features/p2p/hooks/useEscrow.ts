
import { useState, useCallback } from 'react'
import { escrowService, type EscrowLockParams, type EscrowStatusResponse } from '../services/escrowService'
import { useTradesStore } from '../store/tradesStore'

export interface UseEscrowReturn {
  // Estado
  loading: boolean
  error: string | null
  
  // Ações
  lockEscrow: (params: EscrowLockParams, tradeId: string) => Promise<string>
  releaseEscrow: (escrowId: string, tradeId: string) => Promise<void>
  refundEscrow: (escrowId: string, tradeId: string) => Promise<void>
  checkEscrowStatus: (escrowId: string) => Promise<EscrowStatusResponse>
  
  // Helpers
  clearError: () => void
}

/**
 * Hook para gerenciar operações de escrow
 * Integra com escrowService e atualiza o store de trades
 */
export const useEscrow = (): UseEscrowReturn => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { lockEscrow: lockEscrowInStore, releaseFunds, refundFunds, appendTimeline } = useTradesStore()

  /**
   * Bloqueia BZR em escrow para um trade
   */
  const lockEscrow = useCallback(async (
    params: EscrowLockParams, 
    tradeId: string
  ): Promise<string> => {
    setLoading(true)
    setError(null)
    
    try {
      const { escrowId } = await escrowService.lock(params)
      
      // Atualizar trade no store
      const escrowData = {
        escrowId,
        from: params.from,
        to: params.to,
        amountBZR: params.amount,
        createdAt: Date.now(),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24h timeout
      }
      
      lockEscrowInStore(tradeId, escrowData)
      
      setLoading(false)
      return escrowId
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao bloquear escrow'
      setError(errorMessage)
      setLoading(false)
      
      // Adicionar timeline de erro
      appendTimeline(tradeId, {
        ts: Date.now(),
        type: 'ESCROW_LOCK_FAILED',
        payload: { error: errorMessage }
      })
      
      throw err
    }
  }, [lockEscrowInStore, appendTimeline])

  /**
   * Libera BZR do escrow para o comprador
   */
  const releaseEscrow = useCallback(async (
    escrowId: string, 
    tradeId: string
  ): Promise<void> => {
    setLoading(true)
    setError(null)
    
    try {
      await escrowService.release({ escrowId })
      
      // Atualizar trade no store
      releaseFunds(tradeId)
      
      setLoading(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao liberar escrow'
      setError(errorMessage)
      setLoading(false)
      
      // Adicionar timeline de erro
      appendTimeline(tradeId, {
        ts: Date.now(),
        type: 'ESCROW_RELEASE_FAILED',
        payload: { error: errorMessage }
      })
      
      throw err
    }
  }, [releaseFunds, appendTimeline])

  /**
   * Reembolsa BZR do escrow para o vendedor
   */
  const refundEscrow = useCallback(async (
    escrowId: string, 
    tradeId: string
  ): Promise<void> => {
    setLoading(true)
    setError(null)
    
    try {
      await escrowService.refund({ escrowId })
      
      // Atualizar trade no store
      refundFunds(tradeId)
      
      setLoading(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao reembolsar escrow'
      setError(errorMessage)
      setLoading(false)
      
      // Adicionar timeline de erro
      appendTimeline(tradeId, {
        ts: Date.now(),
        type: 'ESCROW_REFUND_FAILED',
        payload: { error: errorMessage }
      })
      
      throw err
    }
  }, [refundFunds, appendTimeline])

  /**
   * Verifica status do escrow
   */
  const checkEscrowStatus = useCallback(async (
    escrowId: string
  ): Promise<EscrowStatusResponse> => {
    setLoading(true)
    setError(null)
    
    try {
      const status = await escrowService.status({ escrowId })
      setLoading(false)
      return status
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao verificar status do escrow'
      setError(errorMessage)
      setLoading(false)
      throw err
    }
  }, [])

  /**
   * Limpa erros
   */
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