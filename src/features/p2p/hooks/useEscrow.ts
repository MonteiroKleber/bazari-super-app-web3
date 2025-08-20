// ==========================================
// src/features/p2p/hooks/useEscrow.ts - COMPLETO
// ==========================================

import { useState, useEffect, useCallback } from 'react'
import { escrowService } from '../services/escrowService'
import type { 
  EscrowState, 
  EscrowCreateParams, 
  EscrowReleaseParams, 
  EscrowRefundParams,
  DisputeParams,
  DisputeState 
} from '../types/p2p.types'

interface UseEscrowOptions {
  tradeId?: string
  autoRefresh?: boolean
  refreshInterval?: number
}

/**
 * Hook para gerenciar operações de escrow
 */
export function useEscrow(options: UseEscrowOptions = {}) {
  const { tradeId, autoRefresh = false, refreshInterval = 30000 } = options
  
  // Estado
  const [escrow, setEscrow] = useState<EscrowState | null>(null)
  const [dispute, setDispute] = useState<DisputeState | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Loading states específicos
  const [creating, setCreating] = useState(false)
  const [releasing, setReleasing] = useState(false)
  const [refunding, setRefunding] = useState(false)
  const [disputing, setDisputing] = useState(false)

  /**
   * Buscar escrow por trade ID
   */
  const fetchEscrow = useCallback(async (id?: string) => {
    const targetTradeId = id || tradeId
    if (!targetTradeId) return
    
    setLoading(true)
    setError(null)
    
    try {
      console.log('🔍 useEscrow: Buscando escrow para trade:', targetTradeId)
      
      const escrowData = await escrowService.getEscrowByTradeId(targetTradeId)
      setEscrow(escrowData)
      
      // Buscar disputa se existir
      if (escrowData?.status === 'DISPUTED') {
        const disputeData = await escrowService.getDisputeByTradeId(targetTradeId)
        setDispute(disputeData)
      } else {
        setDispute(null)
      }
      
      console.log('✅ useEscrow: Escrow carregado:', escrowData?.id || 'não encontrado')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar escrow'
      setError(message)
      console.error('❌ useEscrow: Erro ao buscar escrow:', err)
    } finally {
      setLoading(false)
    }
  }, [tradeId])

  /**
   * Criar novo escrow
   */
  const createEscrow = useCallback(async (params: EscrowCreateParams) => {
    setCreating(true)
    setError(null)
    
    try {
      console.log('🔒 useEscrow: Criando escrow:', params)
      
      const newEscrow = await escrowService.createEscrow(params)
      setEscrow(newEscrow)
      
      console.log('✅ useEscrow: Escrow criado:', newEscrow.id)
      return newEscrow
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar escrow'
      setError(message)
      console.error('❌ useEscrow: Erro ao criar escrow:', err)
      throw err
    } finally {
      setCreating(false)
    }
  }, [])

  /**
   * Liberar escrow
   */
  const releaseEscrow = useCallback(async (params: EscrowReleaseParams) => {
    setReleasing(true)
    setError(null)
    
    try {
      console.log('🔓 useEscrow: Liberando escrow:', params.escrowId)
      
      const updatedEscrow = await escrowService.releaseEscrow(params)
      setEscrow(updatedEscrow)
      
      console.log('✅ useEscrow: Escrow liberado:', updatedEscrow.id)
      return updatedEscrow
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao liberar escrow'
      setError(message)
      console.error('❌ useEscrow: Erro ao liberar escrow:', err)
      throw err
    } finally {
      setReleasing(false)
    }
  }, [])

  /**
   * Reembolsar escrow
   */
  const refundEscrow = useCallback(async (params: EscrowRefundParams) => {
    setRefunding(true)
    setError(null)
    
    try {
      console.log('↩️ useEscrow: Reembolsando escrow:', params.escrowId)
      
      const updatedEscrow = await escrowService.refundEscrow(params)
      setEscrow(updatedEscrow)
      
      console.log('✅ useEscrow: Escrow reembolsado:', updatedEscrow.id)
      return updatedEscrow
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao reembolsar escrow'
      setError(message)
      console.error('❌ useEscrow: Erro ao reembolsar escrow:', err)
      throw err
    } finally {
      setRefunding(false)
    }
  }, [])

  /**
   * Abrir disputa
   */
  const openDispute = useCallback(async (params: DisputeParams) => {
    setDisputing(true)
    setError(null)
    
    try {
      console.log('⚖️ useEscrow: Abrindo disputa:', params)
      
      const newDispute = await escrowService.openDispute(params)
      setDispute(newDispute)
      
      // Atualizar escrow se necessário
      if (escrow && escrow.tradeId === params.tradeId) {
        setEscrow({ ...escrow, status: 'DISPUTED' })
      }
      
      console.log('✅ useEscrow: Disputa aberta:', newDispute.id)
      return newDispute
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao abrir disputa'
      setError(message)
      console.error('❌ useEscrow: Erro ao abrir disputa:', err)
      throw err
    } finally {
      setDisputing(false)
    }
  }, [escrow])

  /**
   * Atualizar dados do escrow
   */
  const refreshEscrow = useCallback(() => {
    if (tradeId) {
      fetchEscrow(tradeId)
    }
  }, [fetchEscrow, tradeId])

  /**
   * Verificar se escrow expirou
   */
  const isExpired = useCallback(() => {
    if (!escrow) return false
    return escrowService.isEscrowExpired(escrow)
  }, [escrow])

  /**
   * Verificar se pode reembolsar
   */
  const canRefund = useCallback(() => {
    if (!escrow) return { allowed: false, reason: 'Escrow não encontrado' }
    return escrowService.canRefundEscrow(escrow)
  }, [escrow])

  /**
   * Calcular tempo restante
   */
  const getTimeRemaining = useCallback(() => {
    if (!escrow) return 0
    return Math.max(0, escrow.timeoutTimestamp - Date.now())
  }, [escrow])

  /**
   * Formatar tempo restante
   */
  const formatTimeRemaining = useCallback(() => {
    const remaining = getTimeRemaining()
    
    if (remaining <= 0) return 'Expirado'
    
    const hours = Math.floor(remaining / (1000 * 60 * 60))
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }, [getTimeRemaining])

  /**
   * Obter status formatado
   */
  const getStatusLabel = useCallback(() => {
    if (!escrow) return 'Não criado'
    
    switch (escrow.status) {
      case 'LOCKED':
        return isExpired() ? 'Expirado' : 'Ativo'
      case 'RELEASED':
        return 'Liberado'
      case 'REFUNDED':
        return 'Reembolsado'
      case 'DISPUTED':
        return 'Em disputa'
      default:
        return escrow.status
    }
  }, [escrow, isExpired])

  /**
   * Obter cor do status
   */
  const getStatusColor = useCallback(() => {
    if (!escrow) return 'text-gray-500'
    
    switch (escrow.status) {
      case 'LOCKED':
        return isExpired() ? 'text-red-600' : 'text-yellow-600'
      case 'RELEASED':
        return 'text-green-600'
      case 'REFUNDED':
        return 'text-blue-600'
      case 'DISPUTED':
        return 'text-orange-600'
      default:
        return 'text-gray-600'
    }
  }, [escrow, isExpired])

  /**
   * Calcular progresso (para UI)
   */
  const getProgress = useCallback(() => {
    if (!escrow) return 0
    
    const total = escrow.timeoutTimestamp - escrow.lockTimestamp
    const elapsed = Date.now() - escrow.lockTimestamp
    
    return Math.min(100, Math.max(0, (elapsed / total) * 100))
  }, [escrow])

  // Effect para carregar escrow inicial
  useEffect(() => {
    if (tradeId) {
      fetchEscrow(tradeId)
    }
  }, [fetchEscrow, tradeId])

  // Effect para auto-refresh
  useEffect(() => {
    if (!autoRefresh || !tradeId) return
    
    const interval = setInterval(() => {
      fetchEscrow(tradeId)
    }, refreshInterval)
    
    return () => clearInterval(interval)
  }, [autoRefresh, tradeId, refreshInterval, fetchEscrow])

  // Limpar erro quando escrow muda
  useEffect(() => {
    if (escrow) {
      setError(null)
    }
  }, [escrow])

  return {
    // Estado
    escrow,
    dispute,
    loading,
    error,
    
    // Loading states específicos
    creating,
    releasing,
    refunding,
    disputing,
    
    // Actions
    createEscrow,
    releaseEscrow,
    refundEscrow,
    openDispute,
    refreshEscrow,
    
    // Utilities
    isExpired: isExpired(),
    canRefund: canRefund(),
    timeRemaining: getTimeRemaining(),
    timeRemainingFormatted: formatTimeRemaining(),
    statusLabel: getStatusLabel(),
    statusColor: getStatusColor(),
    progress: getProgress(),
    
    // Helpers
    clearError: () => setError(null)
  }
}