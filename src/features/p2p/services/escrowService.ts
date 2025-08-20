// ==========================================
// src/features/p2p/services/escrowService.ts - COMPLETO
// ==========================================

import type { 
  EscrowCreateParams, 
  EscrowState, 
  DisputeParams, 
  DisputeState 
} from '../types/p2p.types'

/**
 * Parâmetros para liberação de escrow
 */
export interface EscrowReleaseParams {
  escrowId: string
  signature?: string
  reason?: string
}

/**
 * Parâmetros para reembolso de escrow
 */
export interface EscrowRefundParams {
  escrowId: string
  reason: string
  signature?: string
}

/**
 * Service para operações de escrow no sistema P2P
 * 
 * Em produção, isso seria integrado com:
 * - Smart contracts na blockchain
 * - Sistema de assinatura digital
 * - Oracle para resolução de disputas
 */
class EscrowService {
  private escrows: Map<string, EscrowState> = new Map()
  private disputes: Map<string, DisputeState> = new Map()
  
  // Configurações do sistema
  private readonly DEFAULT_TIMEOUT_MINUTES = 60 // 1 hora
  private readonly MAX_TIMEOUT_MINUTES = 1440 // 24 horas
  private readonly ESCROW_FEE_PERCENTAGE = 0.5 // 0.5%

  /**
   * Cria um novo escrow para uma negociação
   */
  async createEscrow(params: EscrowCreateParams): Promise<EscrowState> {
    try {
      console.log('🔒 EscrowService: Criando escrow para trade:', params.tradeId)
      
      // Validações
      this.validateCreateParams(params)
      
      // Simular delay de blockchain
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const now = Date.now()
      const timeoutMinutes = params.timeoutMinutes || this.DEFAULT_TIMEOUT_MINUTES
      
      const escrow: EscrowState = {
        id: this.generateEscrowId(),
        tradeId: params.tradeId,
        amountBZR: params.amountBZR,
        status: 'LOCKED',
        lockTimestamp: now,
        timeoutTimestamp: now + (timeoutMinutes * 60 * 1000),
        buyerId: params.buyerId,
        sellerId: params.sellerId
      }
      
      // Armazenar no estado
      this.escrows.set(escrow.id, escrow)
      
      console.log('✅ EscrowService: Escrow criado:', escrow.id)
      return escrow
    } catch (error) {
      console.error('❌ EscrowService: Erro ao criar escrow:', error)
      throw error
    }
  }

  /**
   * Libera fundos do escrow (normalmente chamado pelo vendedor após confirmar pagamento)
   */
  async releaseEscrow(params: EscrowReleaseParams): Promise<EscrowState> {
    try {
      console.log('🔓 EscrowService: Liberando escrow:', params.escrowId)
      
      const escrow = this.escrows.get(params.escrowId)
      if (!escrow) {
        throw new Error('Escrow não encontrado')
      }
      
      if (escrow.status !== 'LOCKED') {
        throw new Error(`Escrow não pode ser liberado. Status atual: ${escrow.status}`)
      }
      
      // Verificar timeout
      if (Date.now() > escrow.timeoutTimestamp) {
        throw new Error('Escrow expirado. Use refund para recuperar fundos.')
      }
      
      // Simular delay de blockchain
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Atualizar estado
      const updatedEscrow: EscrowState = {
        ...escrow,
        status: 'RELEASED',
        releaseTimestamp: Date.now()
      }
      
      this.escrows.set(escrow.id, updatedEscrow)
      
      console.log('✅ EscrowService: Escrow liberado:', escrow.id)
      return updatedEscrow
    } catch (error) {
      console.error('❌ EscrowService: Erro ao liberar escrow:', error)
      throw error
    }
  }

  /**
   * Reembolsa fundos do escrow (em caso de cancelamento ou timeout)
   */
  async refundEscrow(params: EscrowRefundParams): Promise<EscrowState> {
    try {
      console.log('↩️ EscrowService: Reembolsando escrow:', params.escrowId)
      
      const escrow = this.escrows.get(params.escrowId)
      if (!escrow) {
        throw new Error('Escrow não encontrado')
      }
      
      if (escrow.status !== 'LOCKED') {
        throw new Error(`Escrow não pode ser reembolsado. Status atual: ${escrow.status}`)
      }
      
      // Verificar se pode reembolsar
      const canRefund = this.canRefundEscrow(escrow)
      if (!canRefund.allowed) {
        throw new Error(canRefund.reason)
      }
      
      // Simular delay de blockchain
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Atualizar estado
      const updatedEscrow: EscrowState = {
        ...escrow,
        status: 'REFUNDED',
        releaseTimestamp: Date.now()
      }
      
      this.escrows.set(escrow.id, updatedEscrow)
      
      console.log('✅ EscrowService: Escrow reembolsado:', escrow.id)
      return updatedEscrow
    } catch (error) {
      console.error('❌ EscrowService: Erro ao reembolsar escrow:', error)
      throw error
    }
  }

  /**
   * Abre uma disputa para um escrow
   */
  async openDispute(params: DisputeParams): Promise<DisputeState> {
    try {
      console.log('⚖️ EscrowService: Abrindo disputa para trade:', params.tradeId)
      
      // Encontrar escrow relacionado
      const escrow = Array.from(this.escrows.values())
        .find(e => e.tradeId === params.tradeId)
      
      if (!escrow) {
        throw new Error('Escrow não encontrado para este trade')
      }
      
      if (escrow.status !== 'LOCKED') {
        throw new Error('Só é possível abrir disputa para escrow ativo')
      }
      
      // Verificar se já existe disputa
      const existingDispute = Array.from(this.disputes.values())
        .find(d => d.tradeId === params.tradeId && d.status !== 'CLOSED')
      
      if (existingDispute) {
        throw new Error('Já existe uma disputa ativa para este trade')
      }
      
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const dispute: DisputeState = {
        id: this.generateDisputeId(),
        tradeId: params.tradeId,
        openedBy: 'user_123', // Em produção, pegar do authStore
        reason: params.reason,
        description: params.description,
        evidence: params.evidence || [],
        status: 'OPEN',
        openedAt: Date.now()
      }
      
      // Atualizar status do escrow
      const updatedEscrow: EscrowState = {
        ...escrow,
        status: 'DISPUTED'
      }
      
      this.escrows.set(escrow.id, updatedEscrow)
      this.disputes.set(dispute.id, dispute)
      
      console.log('✅ EscrowService: Disputa aberta:', dispute.id)
      return dispute
    } catch (error) {
      console.error('❌ EscrowService: Erro ao abrir disputa:', error)
      throw error
    }
  }

  /**
   * Resolve uma disputa (normalmente feito por moderador)
   */
  async resolveDispute(
    disputeId: string, 
    resolution: string, 
    favorBuyer: boolean
  ): Promise<DisputeState> {
    try {
      console.log('✅ EscrowService: Resolvendo disputa:', disputeId)
      
      const dispute = this.disputes.get(disputeId)
      if (!dispute) {
        throw new Error('Disputa não encontrada')
      }
      
      if (dispute.status !== 'OPEN' && dispute.status !== 'INVESTIGATING') {
        throw new Error('Disputa já foi resolvida')
      }
      
      // Encontrar escrow relacionado
      const escrow = Array.from(this.escrows.values())
        .find(e => e.tradeId === dispute.tradeId)
      
      if (!escrow) {
        throw new Error('Escrow não encontrado')
      }
      
      // Simular delay de moderação
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Atualizar disputa
      const updatedDispute: DisputeState = {
        ...dispute,
        status: 'RESOLVED',
        resolution,
        resolvedBy: 'moderator_001', // ID do moderador
        resolvedAt: Date.now()
      }
      
      // Atualizar escrow baseado na resolução
      const updatedEscrow: EscrowState = {
        ...escrow,
        status: favorBuyer ? 'REFUNDED' : 'RELEASED',
        releaseTimestamp: Date.now()
      }
      
      this.disputes.set(disputeId, updatedDispute)
      this.escrows.set(escrow.id, updatedEscrow)
      
      console.log('✅ EscrowService: Disputa resolvida:', disputeId, 'favor:', favorBuyer ? 'comprador' : 'vendedor')
      return updatedDispute
    } catch (error) {
      console.error('❌ EscrowService: Erro ao resolver disputa:', error)
      throw error
    }
  }

  /**
   * Obtém estado atual de um escrow
   */
  async getEscrow(escrowId: string): Promise<EscrowState | null> {
    try {
      await new Promise(resolve => setTimeout(resolve, 100)) // Simular delay
      return this.escrows.get(escrowId) || null
    } catch (error) {
      console.error('❌ EscrowService: Erro ao buscar escrow:', error)
      throw error
    }
  }

  /**
   * Obtém escrow por ID do trade
   */
  async getEscrowByTradeId(tradeId: string): Promise<EscrowState | null> {
    try {
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const escrow = Array.from(this.escrows.values())
        .find(e => e.tradeId === tradeId)
      
      return escrow || null
    } catch (error) {
      console.error('❌ EscrowService: Erro ao buscar escrow por trade:', error)
      throw error
    }
  }

  /**
   * Obtém disputa por ID do trade
   */
  async getDisputeByTradeId(tradeId: string): Promise<DisputeState | null> {
    try {
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const dispute = Array.from(this.disputes.values())
        .find(d => d.tradeId === tradeId && d.status !== 'CLOSED')
      
      return dispute || null
    } catch (error) {
      console.error('❌ EscrowService: Erro ao buscar disputa:', error)
      throw error
    }
  }

  /**
   * Lista todas as disputas (para moderadores)
   */
  async listDisputes(status?: DisputeState['status']): Promise<DisputeState[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 200))
      
      let disputes = Array.from(this.disputes.values())
      
      if (status) {
        disputes = disputes.filter(d => d.status === status)
      }
      
      // Ordenar por data (mais recentes primeiro)
      disputes.sort((a, b) => b.openedAt - a.openedAt)
      
      return disputes
    } catch (error) {
      console.error('❌ EscrowService: Erro ao listar disputas:', error)
      throw error
    }
  }

  /**
   * Verifica se um escrow expirou
   */
  isEscrowExpired(escrow: EscrowState): boolean {
    return Date.now() > escrow.timeoutTimestamp
  }

  /**
   * Verifica se é possível reembolsar um escrow
   */
  canRefundEscrow(escrow: EscrowState): { allowed: boolean; reason?: string } {
    if (escrow.status !== 'LOCKED') {
      return { allowed: false, reason: 'Escrow não está ativo' }
    }
    
    if (this.isEscrowExpired(escrow)) {
      return { allowed: true }
    }
    
    // Em produção, aqui teria lógicas mais complexas:
    // - Mutual agreement
    // - Cancellation policies
    // - Emergency conditions
    
    return { allowed: false, reason: 'Escrow ainda está dentro do prazo' }
  }

  /**
   * Calcula taxa de escrow
   */
  calculateEscrowFee(amountBZR: string): number {
    const amount = parseFloat(amountBZR)
    return (amount * this.ESCROW_FEE_PERCENTAGE) / 100
  }

  /**
   * Obtém estatísticas do escrow
   */
  getEscrowStats(): {
    total: number
    locked: number
    released: number
    refunded: number
    disputed: number
  } {
    const escrows = Array.from(this.escrows.values())
    
    return {
      total: escrows.length,
      locked: escrows.filter(e => e.status === 'LOCKED').length,
      released: escrows.filter(e => e.status === 'RELEASED').length,
      refunded: escrows.filter(e => e.status === 'REFUNDED').length,
      disputed: escrows.filter(e => e.status === 'DISPUTED').length
    }
  }

  // Métodos privados

  private validateCreateParams(params: EscrowCreateParams): void {
    if (!params.tradeId) {
      throw new Error('Trade ID é obrigatório')
    }
    
    if (!params.amountBZR || parseFloat(params.amountBZR) <= 0) {
      throw new Error('Quantidade deve ser maior que zero')
    }
    
    if (!params.buyerId || !params.sellerId) {
      throw new Error('IDs do comprador e vendedor são obrigatórios')
    }
    
    if (params.buyerId === params.sellerId) {
      throw new Error('Comprador e vendedor devem ser diferentes')
    }
    
    if (params.timeoutMinutes && params.timeoutMinutes > this.MAX_TIMEOUT_MINUTES) {
      throw new Error(`Timeout máximo é ${this.MAX_TIMEOUT_MINUTES} minutos`)
    }
    
    // Verificar se já existe escrow para este trade
    const existingEscrow = Array.from(this.escrows.values())
      .find(e => e.tradeId === params.tradeId)
    
    if (existingEscrow) {
      throw new Error('Já existe um escrow para este trade')
    }
  }

  private generateEscrowId(): string {
    return `escrow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateDisputeId(): string {
    return `dispute_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Limpa dados mock (útil para desenvolvimento)
   */
  clearMockData(): void {
    this.escrows.clear()
    this.disputes.clear()
    console.log('🧹 EscrowService: Dados mock limpos')
  }
}

// Instância singleton
export const escrowService = new EscrowService()