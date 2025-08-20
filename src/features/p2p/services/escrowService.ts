
export interface EscrowLockParams {
  from: string
  to: string
  amount: string
}

export interface EscrowReleaseParams {
  escrowId: string
}

export interface EscrowRefundParams {
  escrowId: string
}

export interface EscrowStatusParams {
  escrowId: string
}

export interface EscrowLockResponse {
  escrowId: string
}

export interface EscrowStatusResponse {
  state: 'LOCKED' | 'RELEASED' | 'REFUNDED'
}

/**
 * Escrow Service - Adapter para lock/release/refund/status
 * Mock para desenvolvimento, com interface preparada para integração
 * com substrateService ou pallet específico
 */
class EscrowService {
  private mockEscrows: Map<string, {
    id: string
    from: string
    to: string
    amount: string
    state: 'LOCKED' | 'RELEASED' | 'REFUNDED'
    createdAt: number
    updatedAt: number
  }> = new Map()

  /**
   * Bloqueia BZR em escrow
   */
  async lock(params: EscrowLockParams): Promise<EscrowLockResponse> {
    try {
      const escrowId = `escrow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Simular delay de blockchain
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock - em produção, usar substrateService.extrinsic ou similar
      this.mockEscrows.set(escrowId, {
        id: escrowId,
        from: params.from,
        to: params.to,
        amount: params.amount,
        state: 'LOCKED',
        createdAt: Date.now(),
        updatedAt: Date.now()
      })
      
      console.log('🔒 Mock Escrow Lock:', { escrowId, ...params })
      return { escrowId }
    } catch (error) {
      console.error('❌ Escrow lock failed:', error)
      throw new Error('Falha ao bloquear BZR em escrow')
    }
  }

  /**
   * Libera BZR do escrow para o destinatário
   */
  async release(params: EscrowReleaseParams): Promise<void> {
    try {
      const escrow = this.mockEscrows.get(params.escrowId)
      if (!escrow) {
        throw new Error('Escrow não encontrado')
      }
      
      if (escrow.state !== 'LOCKED') {
        throw new Error('Escrow não está no estado LOCKED')
      }
      
      // Simular delay de blockchain
      await new Promise(resolve => setTimeout(resolve, 1200))
      
      // Mock - em produção, usar substrateService.extrinsic
      escrow.state = 'RELEASED'
      escrow.updatedAt = Date.now()
      
      console.log('✅ Mock Escrow Release:', params.escrowId)
    } catch (error) {
      console.error('❌ Escrow release failed:', error)
      throw new Error('Falha ao liberar BZR do escrow')
    }
  }

  /**
   * Reembolsa BZR do escrow para o remetente
   */
  async refund(params: EscrowRefundParams): Promise<void> {
    try {
      const escrow = this.mockEscrows.get(params.escrowId)
      if (!escrow) {
        throw new Error('Escrow não encontrado')
      }
      
      if (escrow.state !== 'LOCKED') {
        throw new Error('Escrow não está no estado LOCKED')
      }
      
      // Simular delay de blockchain
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock - em produção, usar substrateService.extrinsic
      escrow.state = 'REFUNDED'
      escrow.updatedAt = Date.now()
      
      console.log('🔄 Mock Escrow Refund:', params.escrowId)
    } catch (error) {
      console.error('❌ Escrow refund failed:', error)
      throw new Error('Falha ao reembolsar BZR do escrow')
    }
  }

  /**
   * Verifica status do escrow
   */
  async status(params: EscrowStatusParams): Promise<EscrowStatusResponse> {
    try {
      const escrow = this.mockEscrows.get(params.escrowId)
      if (!escrow) {
        throw new Error('Escrow não encontrado')
      }
      
      return { state: escrow.state }
    } catch (error) {
      console.error('❌ Escrow status check failed:', error)
      throw new Error('Falha ao verificar status do escrow')
    }
  }

  /**
   * Método helper para debugging (mock only)
   */
  getMockEscrows() {
    return Array.from(this.mockEscrows.values())
  }

  /**
   * Limpa escrows mock (útil para testes)
   */
  clearMockEscrows() {
    this.mockEscrows.clear()
  }
}

export const escrowService = new EscrowService()