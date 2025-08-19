// src/features/marketplace/hooks/useEnterpriseListings.ts
// ✅ CORRIGIDO: Hook para gerenciar listings de um empreendimento específico

import React from 'react'
import { useMarketplaceStore, Listing } from '../store/marketplaceStore'

interface UseEnterpriseListingsFilters {
  category: string
  subcategory: string
  priceMin: string
  priceMax: string
  condition: string
  sortBy: 'newest' | 'price_asc' | 'price_desc' | 'rating_desc' | 'views_desc'
}

interface UseEnterpriseListingsOptions {
  enterpriseId: string
  initialFilters?: Partial<UseEnterpriseListingsFilters>
  itemsPerPage?: number
  debounceMs?: number
}

interface UseEnterpriseListingsReturn {
  // Data
  allListings: Listing[]
  filteredListings: Listing[]
  paginatedListings: Listing[]
  
  // Search & Filters
  searchQuery: string
  setSearchQuery: (query: string) => void
  debouncedSearchQuery: string
  filters: UseEnterpriseListingsFilters
  setFilters: (filters: UseEnterpriseListingsFilters) => void
  clearFilters: () => void
  hasActiveFilters: boolean
  
  // Pagination
  currentPage: number
  setCurrentPage: (page: number) => void
  hasMorePages: boolean
  totalPages: number
  
  // Loading
  isLoading: boolean
  
  // Actions
  loadMore: () => void
  refresh: () => void
}

const defaultFilters: UseEnterpriseListingsFilters = {
  category: '',
  subcategory: '',
  priceMin: '',
  priceMax: '',
  condition: '',
  sortBy: 'newest'
}

export const useEnterpriseListings = ({
  enterpriseId,
  initialFilters = {},
  itemsPerPage = 12,
  debounceMs = 250
}: UseEnterpriseListingsOptions): UseEnterpriseListingsReturn => {
  
  const { 
    listings, 
    getListingsByEnterprise, 
    isLoading: storeLoading,
    fetchListings,
    initializeMockData,
    isInitialized
  } = useMarketplaceStore()

  // States
  const [searchQuery, setSearchQuery] = React.useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState('')
  const [filters, setFilters] = React.useState<UseEnterpriseListingsFilters>({
    ...defaultFilters,
    ...initialFilters
  })
  const [currentPage, setCurrentPage] = React.useState(1)
  const [isLoading, setIsLoading] = React.useState(false)

  // ✅ Garantir que dados estão inicializados
  React.useEffect(() => {
    if (!isInitialized || listings.length === 0) {
      console.log('Inicializando dados no hook...')
      initializeMockData()
    }
  }, [isInitialized, listings.length, initializeMockData])

  // Debounce search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
      // Reset pagination when search changes
      if (searchQuery !== debouncedSearchQuery) {
        setCurrentPage(1)
      }
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [searchQuery, debounceMs])

  // ✅ Get all listings for this enterprise
  const allListings = React.useMemo(() => {
    if (!enterpriseId || listings.length === 0) {
      console.log('Sem enterprise ID ou listings vazios')
      return []
    }
    
    const result = getListingsByEnterprise(enterpriseId)
    console.log(`Hook: ${result.length} listings para enterprise ${enterpriseId}`)
    return result
  }, [enterpriseId, listings, getListingsByEnterprise])

  // Apply search and filters
  const filteredListings = React.useMemo(() => {
    let result = [...allListings]

    // Apply search
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase()
      result = result.filter(listing =>
        listing.title.toLowerCase().includes(query) ||
        listing.description.toLowerCase().includes(query) ||
        listing.category.toLowerCase().includes(query) ||
        listing.subcategory.toLowerCase().includes(query) ||
        (listing.metadata?.brand && listing.metadata.brand.toLowerCase().includes(query))
      )
    }

    // Apply filters
    if (filters.category) {
      result = result.filter(l => l.category === filters.category)
    }

    if (filters.subcategory) {
      result = result.filter(l => l.subcategory === filters.subcategory)
    }

    if (filters.priceMin) {
      const minPrice = parseFloat(filters.priceMin)
      if (!isNaN(minPrice)) {
        result = result.filter(l => l.price >= minPrice)
      }
    }

    if (filters.priceMax) {
      const maxPrice = parseFloat(filters.priceMax)
      if (!isNaN(maxPrice)) {
        result = result.filter(l => l.price <= maxPrice)
      }
    }

    if (filters.condition) {
      result = result.filter(l => l.metadata?.condition === filters.condition)
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price_desc':
        result.sort((a, b) => b.price - a.price)
        break
      case 'rating_desc':
        result.sort((a, b) => b.sellerRating - a.sellerRating)
        break
      case 'views_desc':
        result.sort((a, b) => b.views - a.views)
        break
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
    }

    console.log(`Filtered listings: ${result.length}`)
    return result
  }, [allListings, debouncedSearchQuery, filters])

  // Pagination
  const totalPages = Math.ceil(filteredListings.length / itemsPerPage)
  const hasMorePages = currentPage < totalPages

  const paginatedListings = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredListings.slice(0, endIndex) // Load more pattern
  }, [filteredListings, currentPage, itemsPerPage])

  // Check if filters are active
  const hasActiveFilters = React.useMemo(() => {
    return Object.entries(filters).some(([key, value]) => {
      if (key === 'sortBy') return value !== 'newest'
      return value !== ''
    }) || debouncedSearchQuery.trim() !== ''
  }, [filters, debouncedSearchQuery])

  // Clear all filters
  const clearFilters = React.useCallback(() => {
    setFilters(defaultFilters)
    setSearchQuery('')
    setCurrentPage(1)
  }, [])

  // Load more for infinite scroll
  const loadMore = React.useCallback(() => {
    if (hasMorePages && !isLoading) {
      setCurrentPage(prev => prev + 1)
    }
  }, [hasMorePages, isLoading])

  // Refresh data
  const refresh = React.useCallback(async () => {
    setIsLoading(true)
    try {
      await fetchListings()
      setCurrentPage(1)
    } catch (error) {
      console.error('Error refreshing listings:', error)
    } finally {
      setIsLoading(false)
    }
  }, [fetchListings])

  // Reset pagination when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  return {
    // Data
    allListings,
    filteredListings,
    paginatedListings,
    
    // Search & Filters
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,
    filters,
    setFilters,
    clearFilters,
    hasActiveFilters,
    
    // Pagination
    currentPage,
    setCurrentPage,
    hasMorePages,
    totalPages,
    
    // Loading
    isLoading: isLoading || storeLoading,
    
    // Actions
    loadMore,
    refresh
  }
}