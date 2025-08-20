
// ==========================================
// src/features/p2p/services/escrowService.ts
// ==========================================

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

interface EscrowRecord {
  id: string
  from: string
  to: string
  amount: string
  state: 'LOCKED' | 'RELEASED' | 'REFUNDED'
  createdAt: number
  updatedAt: number
  expiresAt?: number
  metadata?: Record<string, any>
}

class EscrowService {
  private escrows = new Map<string, EscrowRecord>()
  
  private mockDelay = (min: number, max: number) => 
    new Promise(resolve => setTimeout(resolve, min + Math.random() * (max - min)))

  async lock(params: EscrowLockParams): Promise<EscrowLockResponse> {
    await this.mockDelay(800, 2000)
    
    const escrowId = `escrow_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`
    const now = Date.now()
    
    // Simular falhas ocasionais (5%)
    if (Math.random() < 0.05) {
      throw new Error('Saldo insuficiente para escrow')
    }
    
    this.escrows.set(escrowId, {
      id: escrowId,
      from: params.from,
      to: params.to,
      amount: params.amount,
      state: 'LOCKED',
      createdAt: now,
      updatedAt: now,
      expiresAt: now + (24 * 60 * 60 * 1000)
    })
    
    console.log('🔒 Escrow Locked:', { escrowId, amount: params.amount })
    return { escrowId }
  }

  async release(params: EscrowReleaseParams): Promise<void> {
    await this.mockDelay(600, 1500)
    
    const escrow = this.escrows.get(params.escrowId)
    if (!escrow) throw new Error('Escrow não encontrado')
    if (escrow.state !== 'LOCKED') throw new Error('Escrow não pode ser liberado')
    
    escrow.state = 'RELEASED'
    escrow.updatedAt = Date.now()
    
    console.log('✅ Escrow Released:', params.escrowId)
  }

  async refund(params: EscrowRefundParams): Promise<void> {
    await this.mockDelay(700, 1800)
    
    const escrow = this.escrows.get(params.escrowId)
    if (!escrow) throw new Error('Escrow não encontrado')
    if (escrow.state !== 'LOCKED') throw new Error('Escrow não pode ser reembolsado')
    
    escrow.state = 'REFUNDED'
    escrow.updatedAt = Date.now()
    
    console.log('↩️ Escrow Refunded:', params.escrowId)
  }

  async getStatus(params: EscrowStatusParams): Promise<EscrowStatusResponse> {
    await this.mockDelay(200, 500)
    
    const escrow = this.escrows.get(params.escrowId)
    if (!escrow) throw new Error('Escrow não encontrado')
    
    return { state: escrow.state }
  }

  getAllEscrows(): EscrowRecord[] {
    return Array.from(this.escrows.values())
  }
  
  clearMockData(): void {
    this.escrows.clear()
  }
}

export const escrowService = new EscrowService()