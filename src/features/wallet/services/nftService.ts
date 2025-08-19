
import { Nft, Account, NftTransferParams } from '../types/wallet.types'
import { substrateService } from './substrateService'

export interface NftService {
  getNftsByAccount(account: Account): Promise<Nft[]>
  getNftsByCollection(collectionId: string, account: Account): Promise<Nft[]>
  transferNft(params: NftTransferParams): Promise<string>
  estimateNftTransferFee(params: NftTransferParams): Promise<string>
  validateNftTransfer(params: NftTransferParams): Promise<{ valid: boolean; error?: string }>
  getNftMetadata(nft: Nft): Promise<any>
}

class NftServiceImpl implements NftService {
  
  async getNftsByAccount(account: Account): Promise<Nft[]> {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Return mock NFTs for demo
      return this.generateMockNfts(account.id)
      
    } catch (error) {
      console.error('Failed to get NFTs:', error)
      return []
    }
  }

  async getNftsByCollection(collectionId: string, account: Account): Promise<Nft[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const allNfts = await this.getNftsByAccount(account)
      return allNfts.filter(nft => nft.collection === collectionId)
      
    } catch (error) {
      console.error('Failed to get NFTs by collection:', error)
      return []
    }
  }

  async transferNft(params: NftTransferParams): Promise<string> {
    const { from, to, nft } = params
    
    // Validate transfer first
    const validation = await this.validateNftTransfer(params)
    if (!validation.valid) {
      throw new Error(validation.error || 'NFT transfer validation failed')
    }

    try {
      // Create mock extrinsic for NFT transfer
      const extrinsic = this.createNftTransferExtrinsic(params)
      
      // Sign and send transaction
      const result = await substrateService.signAndSend({
        account: from,
        extrinsic
      })
      
      return result.hash
      
    } catch (error) {
      throw new Error(`NFT transfer failed: ${error.message}`)
    }
  }

  async estimateNftTransferFee(params: NftTransferParams): Promise<string> {
    try {
      const extrinsic = this.createNftTransferExtrinsic(params)
      return await substrateService.estimateFee(extrinsic)
    } catch (error) {
      console.error('Failed to estimate NFT transfer fee:', error)
      // Return default fee estimate
      return (Math.floor(Math.random() * 500) + 50).toString()
    }
  }

  async validateNftTransfer(params: NftTransferParams): Promise<{ valid: boolean; error?: string }> {
    const { from, to, nft } = params

    // Validate addresses
    if (!from.address || !to) {
      return { valid: false, error: 'Invalid addresses' }
    }

    // Validate NFT ownership (mock check)
    try {
      const accountNfts = await this.getNftsByAccount(from)
      const ownsNft = accountNfts.some(n => n.id === nft.id && n.collection === nft.collection)
      
      if (!ownsNft) {
        return { valid: false, error: 'NFT not owned by sender' }
      }

      // Check if NFT is transferable
      if (nft.meta?.tokenized === false) {
        return { valid: false, error: 'NFT is not transferable' }
      }

      return { valid: true }
      
    } catch (error) {
      return { valid: false, error: 'Failed to validate NFT transfer' }
    }
  }

  async getNftMetadata(nft: Nft): Promise<any> {
    try {
      // Simulate metadata fetch
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Return mock metadata
      return {
        name: nft.name || `NFT #${nft.id}`,
        description: nft.meta?.description || `NFT from ${nft.collection} collection`,
        image: nft.image || this.generateMockImage(),
        attributes: nft.meta?.attributes || [
          { trait_type: 'Rarity', value: this.getRandomRarity() },
          { trait_type: 'Collection', value: nft.collection },
          { trait_type: 'Type', value: 'Digital Art' }
        ],
        external_url: nft.meta?.external_url,
        collection: {
          name: nft.collection,
          description: `Collection ${nft.collection}`,
          floor_price: Math.floor(Math.random() * 100) + 10
        }
      }
      
    } catch (error) {
      console.error('Failed to get NFT metadata:', error)
      return null
    }
  }

  private generateMockNfts(accountId: string): Nft[] {
    const collections = ['CryptoArt', 'PixelPunks', 'AiGenerated', 'Photography']
    const nfts: Nft[] = []
    
    // Generate 5-15 random NFTs
    const nftCount = Math.floor(Math.random() * 10) + 5
    
    for (let i = 0; i < nftCount; i++) {
      const collection = collections[Math.floor(Math.random() * collections.length)]
      const id = `${collection}_${Math.floor(Math.random() * 10000)}`
      
      nfts.push({
        id,
        collection,
        name: `${collection} #${Math.floor(Math.random() * 999) + 1}`,
        image: this.generateMockImage(),
        meta: {
          description: `A unique NFT from the ${collection} collection`,
          attributes: [
            { trait_type: 'Rarity', value: this.getRandomRarity() },
            { trait_type: 'Generation', value: Math.floor(Math.random() * 5) + 1 }
          ],
          tokenized: Math.random() > 0.2 // 80% are transferable
        }
      })
    }
    
    return nfts
  }

  private createNftTransferExtrinsic(params: NftTransferParams): any {
    const { to, nft } = params
    
    return {
      method: 'uniques.transfer',
      args: [nft.collection, nft.id, to],
      meta: {
        nftId: nft.id,
        collection: nft.collection
      }
    }
  }

  private generateMockImage(): string {
    // Generate random placeholder image
    const colors = ['ff6b6b', '4ecdc4', '45b7d1', '96ceb4', 'feca57', 'ff9ff3', '54a0ff']
    const color = colors[Math.floor(Math.random() * colors.length)]
    const size = 400
    
    return `https://via.placeholder.com/${size}x${size}/${color}/ffffff?text=NFT`
  }

  private getRandomRarity(): string {
    const rarities = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary']
    const weights = [40, 30, 20, 8, 2] // Percentage weights
    
    const random = Math.random() * 100
    let cumulative = 0
    
    for (let i = 0; i < rarities.length; i++) {
      cumulative += weights[i]
      if (random <= cumulative) {
        return rarities[i]
      }
    }
    
    return 'Common'
  }
}

// Export singleton instance
export const nftService = new NftServiceImpl()