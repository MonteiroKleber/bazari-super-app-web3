// Interface para futura integração com blockchain
export interface WalletService {
  // Balance operations
  getBalance(): Promise<WalletBalance>
  refreshBalance(): Promise<WalletBalance>
  
  // Transaction operations
  sendTransaction(to: string, amount: number, currency: 'BZR' | 'BRL'): Promise<string>
  getTransactionHistory(limit?: number): Promise<Transaction[]>
  getTransaction(id: string): Promise<Transaction | null>
  
  // Escrow operations
  createEscrow(amount: number, currency: 'BZR' | 'BRL', timeoutMinutes: number): Promise<string>
  releaseEscrow(escrowId: string): Promise<void>
  disputeEscrow(escrowId: string): Promise<void>
  
  // Address operations
  generateAddress(): Promise<string>
  validateAddress(address: string): boolean
  
  // Seed phrase operations
  generateSeedPhrase(): string[]
  importFromSeedPhrase(seedPhrase: string[]): Promise<string>
  exportSeedPhrase(): string[]
}

// Mock implementation
export class MockWalletService implements WalletService {
  private balance: WalletBalance = { BZR: 1000, BRL: 0 }
  private transactions: Transaction[] = []
  
  async getBalance(): Promise<WalletBalance> {
    return this.balance
  }
  
  async refreshBalance(): Promise<WalletBalance> {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return this.balance
  }
  
  async sendTransaction(to: string, amount: number, currency: 'BZR' | 'BRL'): Promise<string> {
    const txId = crypto.randomUUID()
    
    const transaction: Transaction = {
      id: txId,
      type: 'send',
      amount,
      currency,
      toAddress: to,
      status: 'pending',
      timestamp: new Date().toISOString(),
      description: `Sent ${amount} ${currency} to ${to}`
    }
    
    this.transactions.unshift(transaction)
    this.balance[currency] -= amount
    
    // Simulate confirmation after 2 seconds
    setTimeout(() => {
      const tx = this.transactions.find(t => t.id === txId)
      if (tx) tx.status = 'confirmed'
    }, 2000)
    
    return txId
  }
  
  async getTransactionHistory(limit: number = 50): Promise<Transaction[]> {
    return this.transactions.slice(0, limit)
  }
  
  async getTransaction(id: string): Promise<Transaction | null> {
    return this.transactions.find(t => t.id === id) || null
  }
  
  async createEscrow(amount: number, currency: 'BZR' | 'BRL', timeoutMinutes: number): Promise<string> {
    const escrowId = crypto.randomUUID()
    
    const transaction: Transaction = {
      id: crypto.randomUUID(),
      type: 'escrow',
      amount,
      currency,
      status: 'confirmed',
      timestamp: new Date().toISOString(),
      escrowId,
      description: `Escrow created for ${amount} ${currency}`
    }
    
    this.transactions.unshift(transaction)
    this.balance[currency] -= amount
    
    return escrowId
  }
  
  async releaseEscrow(escrowId: string): Promise<void> {
    const escrowTx = this.transactions.find(t => t.escrowId === escrowId && t.type === 'escrow')
    if (!escrowTx) throw new Error('Escrow not found')
    
    const transaction: Transaction = {
      id: crypto.randomUUID(),
      type: 'release',
      amount: escrowTx.amount,
      currency: escrowTx.currency,
      status: 'confirmed',
      timestamp: new Date().toISOString(),
      escrowId,
      description: `Escrow released for ${escrowTx.amount} ${escrowTx.currency}`
    }
    
    this.transactions.unshift(transaction)
  }
  
  async disputeEscrow(escrowId: string): Promise<void> {
    // Implementation for escrow dispute
    console.log('Escrow disputed:', escrowId)
  }
  
  async generateAddress(): Promise<string> {
    return `0x${Array.from(crypto.getRandomValues(new Uint8Array(20)), b => b.toString(16).padStart(2, '0')).join('')}`
  }
  
  validateAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }
  
  generateSeedPhrase(): string[] {
    const words = [
      'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
      'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
      'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual'
    ]
    
    const seedPhrase: string[] = []
    for (let i = 0; i < 12; i++) {
      const randomIndex = Math.floor(Math.random() * words.length)
      seedPhrase.push(words[randomIndex])
    }
    return seedPhrase
  }
  
  async importFromSeedPhrase(seedPhrase: string[]): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 2000))
    return await this.generateAddress()
  }
  
  exportSeedPhrase(): string[] {
    // In real implementation, this would export the actual seed phrase
    return this.generateSeedPhrase()
  }
}

export const walletService = new MockWalletService()
