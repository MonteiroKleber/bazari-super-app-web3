
import { Token, Account, TransferParams } from '../types/wallet.types'
import { substrateService } from './substrateService'

export interface TokenService {
  getTokenBalance(token: Token, account: Account): Promise<string>
  getFormattedBalance(token: Token, account: Account): Promise<string>
  transferToken(params: TransferParams): Promise<string>
  estimateTransferFee(params: TransferParams): Promise<string>
  validateTransfer(params: TransferParams): Promise<{ valid: boolean; error?: string }>
  normalizeTokens(): Promise<Token[]>
}

class TokenServiceImpl implements TokenService {
  
  async getTokenBalance(token: Token, account: Account): Promise<string> {
    try {
      if (token.type === 'native') {
        return await substrateService.getBalance(account.id)
      } else {
        return await substrateService.getAssetBalance(token.assetId!, account.id)
      }
    } catch (error) {
      console.error('Failed to get token balance:', error)
      return '0'
    }
  }

  async getFormattedBalance(token: Token, account: Account): Promise<string> {
    const balance = await this.getTokenBalance(token, account)
    const balanceNum = parseFloat(balance) / Math.pow(10, token.decimals)
    return balanceNum.toFixed(6)
  }

  async transferToken(params: TransferParams): Promise<string> {
    const { from, to, token, amount } = params
    
    // Validate transfer first
    const validation = await this.validateTransfer(params)
    if (!validation.valid) {
      throw new Error(validation.error || 'Transfer validation failed')
    }

    try {
      // Create mock extrinsic based on token type
      const extrinsic = this.createTransferExtrinsic(params)
      
      // Sign and send transaction
      const result = await substrateService.signAndSend({
        account: from,
        extrinsic
      })
      
      return result.hash
    } catch (error) {
      throw new Error(`Transfer failed: ${error.message}`)
    }
  }

  async estimateTransferFee(params: TransferParams): Promise<string> {
    try {
      const extrinsic = this.createTransferExtrinsic(params)
      return await substrateService.estimateFee(extrinsic)
    } catch (error) {
      console.error('Failed to estimate fee:', error)
      // Return default fee estimate
      return (Math.floor(Math.random() * 1000) + 100).toString()
    }
  }

  async validateTransfer(params: TransferParams): Promise<{ valid: boolean; error?: string }> {
    const { from, to, token, amount } = params

    // Validate addresses
    if (!from.address || !to) {
      return { valid: false, error: 'Invalid addresses' }
    }

    // Validate amount
    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      return { valid: false, error: 'Invalid amount' }
    }

    // Check balance
    try {
      const balance = await this.getTokenBalance(token, from)
      const balanceNum = parseFloat(balance) / Math.pow(10, token.decimals)
      
      if (amountNum > balanceNum) {
        return { valid: false, error: 'Insufficient balance' }
      }

      // Estimate fee and check if user has enough for fee
      const fee = await this.estimateTransferFee(params)
      const feeNum = parseFloat(fee) / Math.pow(10, token.decimals)
      
      if (token.type === 'native' && (amountNum + feeNum) > balanceNum) {
        return { valid: false, error: 'Insufficient balance for amount + fee' }
      }

      return { valid: true }
      
    } catch (error) {
      return { valid: false, error: 'Failed to validate transfer' }
    }
  }

  async normalizeTokens(): Promise<Token[]> {
    try {
      // Get chain info for native token
      const chainInfo = await substrateService.getChainInfo()
      
      const nativeToken: Token = {
        key: chainInfo.symbol,
        type: 'native',
        symbol: chainInfo.symbol,
        decimals: chainInfo.decimals,
        name: `${chainInfo.name} Native Token`
      }

      // Mock asset tokens for demo
      const assetTokens: Token[] = [
        {
          key: 'USDT',
          type: 'asset',
          assetId: 1,
          symbol: 'USDT',
          decimals: 6,
          name: 'Tether USD'
        },
        {
          key: 'USDC',
          type: 'asset',
          assetId: 2,
          symbol: 'USDC',
          decimals: 6,
          name: 'USD Coin'
        }
      ]

      return [nativeToken, ...assetTokens]
      
    } catch (error) {
      console.error('Failed to normalize tokens:', error)
      
      // Return default tokens on error
      return [
        {
          key: 'BZR',
          type: 'native',
          symbol: 'BZR',
          decimals: 12,
          name: 'Bazari Token'
        }
      ]
    }
  }

  private createTransferExtrinsic(params: TransferParams): any {
    const { to, token, amount } = params
    
    // Convert amount to smallest unit
    const amountInSmallestUnit = Math.floor(
      parseFloat(amount) * Math.pow(10, token.decimals)
    ).toString()

    // Mock extrinsic object
    return {
      method: token.type === 'native' ? 'balances.transfer' : 'assets.transfer',
      args: token.type === 'native' 
        ? [to, amountInSmallestUnit]
        : [token.assetId, to, amountInSmallestUnit],
      meta: {
        tokenType: token.type,
        tokenKey: token.key
      }
    }
  }
}

// Export singleton instance
export const tokenService = new TokenServiceImpl()