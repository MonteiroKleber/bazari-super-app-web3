
import { Chain, Account, SignAndSendParams } from '../types/wallet.types'

export interface SubstrateService {
  connect(networkId: string): Promise<void>
  disconnect(): Promise<void>
  getChainInfo(): Promise<Chain>
  getBalance(accountId: string): Promise<string>
  getAssetBalance(assetId: string | number, accountId: string): Promise<string>
  estimateFee(extrinsic: any): Promise<string>
  signAndSend(params: SignAndSendParams): Promise<{ hash: string }>
  isConnected(): boolean
}

class MockSubstrateService implements SubstrateService {
  private connected = false
  private currentChain?: Chain

  async connect(networkId: string): Promise<void> {
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    this.connected = true
    
    // Mock chain info based on networkId
    this.currentChain = {
      name: networkId === 'polkadot' ? 'Polkadot' : 'Kusama',
      symbol: networkId === 'polkadot' ? 'DOT' : 'KSM',
      decimals: 10,
      ss58Prefix: networkId === 'polkadot' ? 0 : 2,
      networkId
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false
    this.currentChain = undefined
  }

  async getChainInfo(): Promise<Chain> {
    if (!this.connected || !this.currentChain) {
      throw new Error('Not connected to chain')
    }
    return this.currentChain
  }

  async getBalance(accountId: string): Promise<string> {
    if (!this.connected) {
      throw new Error('Not connected to chain')
    }
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Return mock balance (in smallest unit)
    return (Math.floor(Math.random() * 1000000) + 100000).toString()
  }

  async getAssetBalance(assetId: string | number, accountId: string): Promise<string> {
    if (!this.connected) {
      throw new Error('Not connected to chain')
    }
    
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Return mock asset balance
    return (Math.floor(Math.random() * 500000) + 10000).toString()
  }

  async estimateFee(extrinsic: any): Promise<string> {
    if (!this.connected) {
      throw new Error('Not connected to chain')
    }
    
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Return mock fee (in smallest unit)
    return (Math.floor(Math.random() * 1000) + 100).toString()
  }

  async signAndSend(params: SignAndSendParams): Promise<{ hash: string }> {
    const { account, extrinsic } = params
    
    if (!this.connected) {
      throw new Error('Not connected to chain')
    }

    if (account.type === 'watch') {
      throw new Error('Cannot sign with watch-only account')
    }
    
    // Simulate signing and sending
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Generate mock transaction hash
    const hash = `0x${Array.from(
      crypto.getRandomValues(new Uint8Array(32)), 
      b => b.toString(16).padStart(2, '0')
    ).join('')}`
    
    return { hash }
  }

  isConnected(): boolean {
    return this.connected
  }
}

// Export singleton instance
export const substrateService = new MockSubstrateService()

// Auto-connect to default network on import
substrateService.connect('polkadot').catch(console.error)