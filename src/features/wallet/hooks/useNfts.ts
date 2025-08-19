// src/features/wallet/hooks/useNfts.ts

import { useState, useEffect, useMemo } from 'react'
import { useActiveAccount } from './useActiveAccount'
import { nftService } from '../services/nftService'
import { Nft } from '../types/wallet.types'

export interface NftWithMetadata extends Nft {
  metadata?: any
  isLoading?: boolean
}

export const useNfts = () => {
  const { activeAccount } = useActiveAccount()
  const [nfts, setNfts] = useState<NftWithMetadata[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCollection, setSelectedCollection] = useState<string>('')
  
  // Load NFTs for active account
  useEffect(() => {
    const loadNfts = async () => {
      if (!activeAccount) {
        setNfts([])
        return
      }
      
      setIsLoading(true)
      setError(null)
      
      try {
        const accountNfts = await nftService.getNftsByAccount(activeAccount)
        setNfts(accountNfts.map(nft => ({ ...nft, isLoading: false })))
      } catch (err) {
        setError(err.message || 'Failed to load NFTs')
        setNfts([])
      } finally {
        setIsLoading(false)
      }
    }
    
    loadNfts()
  }, [activeAccount])
  
  // Get unique collections
  const collections = useMemo(() => {
    const collectionSet = new Set(nfts.map(nft => nft.collection))
    return Array.from(collectionSet).sort()
  }, [nfts])
  
  // Filter NFTs based on search and collection
  const filteredNfts = useMemo(() => {
    return nfts.filter(nft => {
      const matchesSearch = !searchQuery || 
        nft.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nft.collection.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nft.id.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCollection = !selectedCollection || nft.collection === selectedCollection
      
      return matchesSearch && matchesCollection
    })
  }, [nfts, searchQuery, selectedCollection])
  
  // Load metadata for an NFT
  const loadNftMetadata = async (nft: Nft) => {
    try {
      setNfts(prev => prev.map(n => 
        n.id === nft.id && n.collection === nft.collection 
          ? { ...n, isLoading: true }
          : n
      ))
      
      const metadata = await nftService.getNftMetadata(nft)
      
      setNfts(prev => prev.map(n => 
        n.id === nft.id && n.collection === nft.collection 
          ? { ...n, metadata, isLoading: false }
          : n
      ))
      
      return metadata
      
    } catch (err) {
      setNfts(prev => prev.map(n => 
        n.id === nft.id && n.collection === nft.collection 
          ? { ...n, isLoading: false }
          : n
      ))
      throw err
    }
  }
  
  // Refresh NFTs
  const refreshNfts = async () => {
    if (!activeAccount) return
    
    setIsLoading(true)
    try {
      const accountNfts = await nftService.getNftsByAccount(activeAccount)
      setNfts(accountNfts.map(nft => ({ ...nft, isLoading: false })))
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to refresh NFTs')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Get NFTs by collection
  const getNftsByCollection = (collectionId: string): NftWithMetadata[] => {
    return nfts.filter(nft => nft.collection === collectionId)
  }
  
  // Search functions
  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }
  
  const handleCollectionFilter = (collection: string) => {
    setSelectedCollection(collection)
  }
  
  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCollection('')
  }
  
  return {
    nfts: filteredNfts,
    allNfts: nfts,
    collections,
    isLoading,
    error,
    searchQuery,
    selectedCollection,
    loadNftMetadata,
    refreshNfts,
    getNftsByCollection,
    handleSearch,
    handleCollectionFilter,
    clearFilters,
    hasNfts: nfts.length > 0,
    totalCount: nfts.length,
    filteredCount: filteredNfts.length
  }
}