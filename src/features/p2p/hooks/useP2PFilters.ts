// ==========================================
// src/features/p2p/hooks/useP2PFilters.ts
// Correção do hook de filtros
// ==========================================

import { useState, useCallback, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { P2PFilters, PaymentMethod } from '../types/p2p.types'
import { useOffersStore } from '../store/offersStore'

export interface UseP2PFiltersReturn {
  filters: P2PFilters
  setFilters: (patch: Partial<P2PFilters>) => void
  clearFilters: () => void
  applyFilters: () => void
  resetFilters: () => void
  
  // Helpers específicos
  setSide: (side: 'BUY' | 'SELL') => void
  setPaymentMethod: (method?: PaymentMethod) => void
  setPriceRange: (min?: number, max?: number) => void
  setLocationFilter: (city?: string, state?: string) => void
  setSearchQuery: (q?: string) => void
  setOwnerFilter: (ownerId?: string) => void
  
  // Estado de URL sync
  syncWithUrl: boolean
  urlFilters: Partial<P2PFilters>
}

export const useP2PFilters = (options?: {
  syncWithUrl?: boolean
  debounceMs?: number
  onFiltersChange?: (filters: P2PFilters) => void
}): UseP2PFiltersReturn => {
  const {
    syncWithUrl = false,
    debounceMs = 300,
    onFiltersChange
  } = options || {}

  const [searchParams, setSearchParams] = useSearchParams()
  const { filters, setFilters: setStoreFilters, clearFilters: clearStoreFilters } = useOffersStore()
  
  // Debounce timer
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null)

  // Parse filters from URL
  const urlFilters = useMemo((): Partial<P2PFilters> => {
    if (!syncWithUrl) return {}
    
    const urlFilters: Partial<P2PFilters> = {}
    
    const side = searchParams.get('side')
    if (side === 'BUY' || side === 'SELL') {
      urlFilters.side = side
    }
    
    const payment = searchParams.get('payment')
    if (payment && ['PIX', 'TED', 'DINHEIRO', 'OUTRO'].includes(payment)) {
      urlFilters.payment = payment as PaymentMethod
    }
    
    const priceMin = searchParams.get('priceMin')
    if (priceMin && !isNaN(Number(priceMin))) {
      urlFilters.priceMin = Number(priceMin)
    }
    
    const priceMax = searchParams.get('priceMax')
    if (priceMax && !isNaN(Number(priceMax))) {
      urlFilters.priceMax = Number(priceMax)
    }
    
    const reputationMin = searchParams.get('reputationMin')
    if (reputationMin && !isNaN(Number(reputationMin))) {
      urlFilters.reputationMin = Number(reputationMin)
    }
    
    const city = searchParams.get('city')
    if (city) urlFilters.city = city
    
    const state = searchParams.get('state')
    if (state) urlFilters.state = state
    
    const q = searchParams.get('q')
    if (q) urlFilters.q = q
    
    const ownerId = searchParams.get('ownerId')
    if (ownerId) urlFilters.ownerId = ownerId
    
    return urlFilters
  }, [searchParams, syncWithUrl])

  // Merge store filters with URL filters
  const mergedFilters = useMemo((): P2PFilters => {
    return { ...filters, ...urlFilters }
  }, [filters, urlFilters])

  // Sync URL filters on mount
  useEffect(() => {
    if (syncWithUrl && Object.keys(urlFilters).length > 0) {
      setStoreFilters(urlFilters)
    }
  }, []) // Only on mount

  // Update filters with debounce
  const debouncedSetFilters = useCallback((patch: Partial<P2PFilters>) => {
    // Clear previous timer
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
    
    // Update store immediately for UI responsiveness
    setStoreFilters(patch)
    
    // Set debounced timer for URL sync and callback
    const timer = setTimeout(() => {
      const newFilters = { ...mergedFilters, ...patch }
      
      // Update URL if sync enabled
      if (syncWithUrl) {
        const newSearchParams = new URLSearchParams(searchParams)
        
        Object.entries(patch).forEach(([key, value]) => {
          if (value === undefined || value === null || value === '') {
            newSearchParams.delete(key)
          } else {
            newSearchParams.set(key, String(value))
          }
        })
        
        setSearchParams(newSearchParams, { replace: true })
      }
      
      // Callback
      onFiltersChange?.(newFilters)
    }, debounceMs)
    
    setDebounceTimer(timer)
  }, [
    debounceTimer, 
    mergedFilters, 
    setStoreFilters, 
    syncWithUrl, 
    searchParams, 
    setSearchParams, 
    onFiltersChange, 
    debounceMs
  ])

  // Clear all filters
  const clearFilters = useCallback(() => {
    clearStoreFilters()
    
    if (syncWithUrl) {
      // Keep only non-filter params
      const newSearchParams = new URLSearchParams()
      searchParams.forEach((value, key) => {
        const isFilterParam = [
          'side', 'payment', 'priceMin', 'priceMax', 
          'reputationMin', 'city', 'state', 'q', 'ownerId'
        ].includes(key)
        
        if (!isFilterParam) {
          newSearchParams.set(key, value)
        }
      })
      
      setSearchParams(newSearchParams, { replace: true })
    }
  }, [clearStoreFilters, syncWithUrl, searchParams, setSearchParams])

  // Helper methods
  const setSide = useCallback((side: 'BUY' | 'SELL') => {
    console.log('🎯 setSide called with:', side) // Debug log
    debouncedSetFilters({ side })
  }, [debouncedSetFilters])

  const setPaymentMethod = useCallback((method?: PaymentMethod) => {
    debouncedSetFilters({ payment: method })
  }, [debouncedSetFilters])

  const setPriceRange = useCallback((min?: number, max?: number) => {
    debouncedSetFilters({ priceMin: min, priceMax: max })
  }, [debouncedSetFilters])

  const setLocationFilter = useCallback((city?: string, state?: string) => {
    debouncedSetFilters({ city, state })
  }, [debouncedSetFilters])

  const setSearchQuery = useCallback((q?: string) => {
    debouncedSetFilters({ q })
  }, [debouncedSetFilters])

  const setOwnerFilter = useCallback((ownerId?: string) => {
    debouncedSetFilters({ ownerId })
  }, [debouncedSetFilters])

  // Apply current filters (for manual trigger)
  const applyFilters = useCallback(() => {
    onFiltersChange?.(mergedFilters)
  }, [mergedFilters, onFiltersChange])

  // Reset to default filters
  const resetFilters = useCallback(() => {
    const defaultFilters: P2PFilters = { side: 'SELL' }
    debouncedSetFilters(defaultFilters)
  }, [debouncedSetFilters])

  return {
    filters: mergedFilters,
    setFilters: debouncedSetFilters,
    clearFilters,
    applyFilters,
    resetFilters,
    
    // Helpers
    setSide,
    setPaymentMethod,
    setPriceRange,
    setLocationFilter,
    setSearchQuery,
    setOwnerFilter,
    
    // URL sync
    syncWithUrl,
    urlFilters
  }
}