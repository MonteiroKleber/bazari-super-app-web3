// src/features/marketplace/hooks/useEnterpriseListings.ts

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
    fetchListings 
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
  }, [searchQuery, debounceMs, debouncedSearchQuery])

  // Get all listings for this enterprise
  const allListings = React.useMemo(() => {
    return getListingsByEnterprise(enterpriseId)
  }, [getListingsByEnterprise, enterpriseId, listings])

  // Apply filters and search
  const filteredListings = React.useMemo(() => {
    let filtered = [...allListings]

    // Apply search
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase()
      filtered = filtered.filter(listing =>
        listing.title.toLowerCase().includes(query) ||
        listing.description.toLowerCase().includes(query) ||
        listing.category.toLowerCase().includes(query) ||
        listing.subcategory.toLowerCase().includes(query) ||
        (listing.metadata?.brand && listing.metadata.brand.toLowerCase().includes(query))
      )
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(listing => listing.category === filters.category)
    }

    // Apply subcategory filter
    if (filters.subcategory) {
      filtered = filtered.filter(listing => listing.subcategory === filters.subcategory)
    }

    // Apply price filters
    if (filters.priceMin) {
      const minPrice = parseFloat(filters.priceMin)
      if (!isNaN(minPrice)) {
        filtered = filtered.filter(listing => listing.price >= minPrice)
      }
    }

    if (filters.priceMax) {
      const maxPrice = parseFloat(filters.priceMax)
      if (!isNaN(maxPrice)) {
        filtered = filtered.filter(listing => listing.price <= maxPrice)
      }
    }

    // Apply condition filter
    if (filters.condition) {
      filtered = filtered.filter(listing => listing.metadata?.condition === filters.condition)
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'rating_desc':
        filtered.sort((a, b) => b.sellerRating - a.sellerRating)
        break
      case 'views_desc':
        filtered.sort((a, b) => b.views - a.views)
        break
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
    }

    return filtered
  }, [allListings, debouncedSearchQuery, filters])

  // Apply pagination
  const paginatedListings = React.useMemo(() => {
    const startIndex = 0
    const endIndex = currentPage * itemsPerPage
    return filteredListings.slice(startIndex, endIndex)
  }, [filteredListings, currentPage, itemsPerPage])

  // Pagination calculations
  const totalPages = Math.ceil(filteredListings.length / itemsPerPage)
  const hasMorePages = currentPage < totalPages

  // Check if there are active filters
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

  // Load more items (for infinite scroll)
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

  // Auto-refresh when enterprise changes
  React.useEffect(() => {
    if (enterpriseId && allListings.length === 0) {
      refresh()
    }
  }, [enterpriseId, allListings.length, refresh])

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

// Hook adicional para estatísticas dos listings
export const useEnterpriseListingsStats = (listings: Listing[]) => {
  return React.useMemo(() => {
    const totalListings = listings.length
    const digitalListings = listings.filter(l => l.digital).length
    const tokenizableListings = listings.filter(l => l.digital?.tokenizable).length
    
    const averagePrice = listings.length > 0 
      ? listings.reduce((sum, l) => sum + l.price, 0) / listings.length 
      : 0
    
    const categoriesCount = listings.reduce((acc, listing) => {
      acc[listing.category] = (acc[listing.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const mostPopularCategory = Object.entries(categoriesCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0]
    
    const totalViews = listings.reduce((sum, l) => sum + l.views, 0)
    
    const priceRange = listings.length > 0 ? {
      min: Math.min(...listings.map(l => l.price)),
      max: Math.max(...listings.map(l => l.price))
    } : { min: 0, max: 0 }

    return {
      totalListings,
      digitalListings,
      tokenizableListings,
      averagePrice,
      categoriesCount,
      mostPopularCategory,
      totalViews,
      priceRange
    }
  }, [listings])
}