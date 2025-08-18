// src/features/marketplace/store/marketplaceStore.ts

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import categories from '@app/data/categories.json'
import { mockListings } from '@app/data/mockMarketplaceData'

export interface Listing {
  id: string
  title: string
  description: string
  price: number
  currency: 'BZR' | 'BRL'
  category: string
  subcategory: string
  subsubcategory?: string
  subsubsubcategory?: string
  images: string[]
  sellerId: string
  sellerName: string
  sellerRating: number
  enterpriseId?: string
  enterpriseName?: string
  status: 'active' | 'paused' | 'sold' | 'expired'
  createdAt: string
  updatedAt: string
  views: number
  digital?: {
    type: 'course' | 'ebook' | 'software' | 'media' | 'template' | 'other'
    deliveryInstructions: string
    downloadUrl?: string
    accessKey?: string
    tokenizable?: boolean
    tokenization?: {
      quantity: number
      royaltyPercentage: number
      sellDuration: number // days
      transferable: boolean
      currentSupply?: number
      pricePerToken?: number
    }
  }
  metadata?: {
    condition?: 'new' | 'used' | 'refurbished'
    brand?: string
    model?: string
    warranty?: string
    shipping?: {
      free: boolean
      methods: string[]
      estimatedDays: number
      cost?: number
    }
    location?: {
      city?: string
      state?: string
      country?: string
    }
  }
}

interface MarketplaceFilters {
  category?: string
  subcategory?: string
  subsubcategory?: string
  subsubsubcategory?: string
  minPrice?: number
  maxPrice?: number
  currency?: 'BZR' | 'BRL'
  digitalOnly?: boolean
  tokenizableOnly?: boolean
  freeShippingOnly?: boolean
  condition?: 'new' | 'used' | 'refurbished'
  enterpriseId?: string
  location?: {
    city?: string
    state?: string
    radius?: number // km
  }
  search?: string
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'rating_desc' | 'views_desc' | 'relevance'
}

interface MarketplaceState {
  listings: Listing[]
  myListings: Listing[]
  filters: MarketplaceFilters
  isLoading: boolean
  categories: typeof categories.categories
  
  // Actions
  setListings: (listings: Listing[]) => void
  addListing: (listing: Listing) => void
  updateListing: (id: string, updates: Partial<Listing>) => void
  removeListing: (id: string) => void
  setFilters: (filters: MarketplaceFilters) => void
  setLoading: (loading: boolean) => void
  searchListings: (query: string) => Promise<void>
  fetchListings: (filters?: MarketplaceFilters) => Promise<void>
  fetchMyListings: () => Promise<void>
  fetchListingById: (id: string) => Promise<Listing | null>
  incrementViews: (id: string) => void
  getRelatedListings: (listingId: string, limit?: number) => Listing[]
  getListingsByEnterprise: (enterpriseId: string) => Listing[]
  getPopularListings: (limit?: number) => Listing[]
  getRecentListings: (limit?: number) => Listing[]
}

export const useMarketplaceStore = create<MarketplaceState>()(
  persist(
    (set, get) => ({
      listings: [],
      myListings: [],
      filters: {},
      isLoading: false,
      categories: categories.categories,

      setListings: (listings: Listing[]) => {
        set({ listings })
      },

      addListing: (listing: Listing) => {
        set(state => ({
          listings: [listing, ...state.listings],
          myListings: [listing, ...state.myListings]
        }))
      },

      updateListing: (id: string, updates: Partial<Listing>) => {
        const updatedListing = { 
          ...updates, 
          updatedAt: new Date().toISOString() 
        }
        
        set(state => ({
          listings: state.listings.map(l => 
            l.id === id ? { ...l, ...updatedListing } : l
          ),
          myListings: state.myListings.map(l => 
            l.id === id ? { ...l, ...updatedListing } : l
          )
        }))
      },

      removeListing: (id: string) => {
        set(state => ({
          listings: state.listings.filter(l => l.id !== id),
          myListings: state.myListings.filter(l => l.id !== id)
        }))
      },

      setFilters: (filters: MarketplaceFilters) => {
        set({ filters })
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading })
      },

      searchListings: async (query: string) => {
        const filters = { ...get().filters, search: query }
        await get().fetchListings(filters)
      },

      fetchListings: async (filters?: MarketplaceFilters) => {
        set({ isLoading: true })
        
        try {
          // Simula delay de API
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // Usa dados mock ao invés de API
          let filteredListings = [...mockListings]
          
          // Aplica filtros se fornecidos
          if (filters) {
            if (filters.category) {
              filteredListings = filteredListings.filter(l => 
                l.category === filters.category
              )
            }
            if (filters.subcategory) {
              filteredListings = filteredListings.filter(l => 
                l.subcategory === filters.subcategory
              )
            }
            if (filters.search) {
              const query = filters.search.toLowerCase()
              filteredListings = filteredListings.filter(l =>
                l.title.toLowerCase().includes(query) ||
                l.description.toLowerCase().includes(query) ||
                l.sellerName.toLowerCase().includes(query)
              )
            }
            if (filters.digitalOnly) {
              filteredListings = filteredListings.filter(l => l.digital)
            }
            if (filters.minPrice || filters.maxPrice) {
              filteredListings = filteredListings.filter(l => {
                const price = l.price
                if (filters.minPrice && price < filters.minPrice) return false
                if (filters.maxPrice && price > filters.maxPrice) return false
                return true
              })
            }
            if (filters.currency) {
              filteredListings = filteredListings.filter(l => 
                l.currency === filters.currency
              )
            }
            if (filters.condition) {
              filteredListings = filteredListings.filter(l => 
                l.metadata?.condition === filters.condition
              )
            }
            if (filters.enterpriseId) {
              filteredListings = filteredListings.filter(l => 
                l.enterpriseId === filters.enterpriseId
              )
            }
          }
          
          // Aplica ordenação
          if (filters?.sortBy) {
            switch (filters.sortBy) {
              case 'newest':
                filteredListings.sort((a, b) => 
                  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                )
                break
              case 'price_asc':
                filteredListings.sort((a, b) => a.price - b.price)
                break
              case 'price_desc':
                filteredListings.sort((a, b) => b.price - a.price)
                break
              case 'rating_desc':
                filteredListings.sort((a, b) => b.sellerRating - a.sellerRating)
                break
              case 'views_desc':
                filteredListings.sort((a, b) => b.views - a.views)
                break
            }
          }
          
          set({ listings: filteredListings, filters: filters || {} })
        } catch (error) {
          console.error('Error fetching listings:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      fetchMyListings: async () => {
        set({ isLoading: true })
        try {
          // Mock API call - filter by current user
          await new Promise(resolve => setTimeout(resolve, 300))
          
          const allListings = get().listings
          const currentUserId = 'user_1' // Get from auth store in real app
          
          const myListings = allListings.filter(l => l.sellerId === currentUserId)
          set({ myListings })
        } catch (error) {
          console.error('Error fetching my listings:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      fetchListingById: async (id: string) => {
        set({ isLoading: true })
        try {
          await new Promise(resolve => setTimeout(resolve, 200))
          
          const listing = get().listings.find(l => l.id === id)
          return listing || null
        } catch (error) {
          console.error('Error fetching listing:', error)
          return null
        } finally {
          set({ isLoading: false })
        }
      },

      incrementViews: (id: string) => {
        set(state => ({
          listings: state.listings.map(l => 
            l.id === id ? { ...l, views: l.views + 1 } : l
          )
        }))
      },

      getRelatedListings: (listingId: string, limit = 4) => {
        const listings = get().listings
        const currentListing = listings.find(l => l.id === listingId)
        
        if (!currentListing) return []
        
        return listings
          .filter(l => 
            l.id !== listingId && 
            (l.category === currentListing.category || 
             l.subcategory === currentListing.subcategory)
          )
          .slice(0, limit)
      },

      getListingsByEnterprise: (enterpriseId: string) => {
        return get().listings.filter(l => l.enterpriseId === enterpriseId)
      },

      getPopularListings: (limit = 6) => {
        return get().listings
          .filter(l => l.status === 'active')
          .sort((a, b) => b.views - a.views)
          .slice(0, limit)
      },

      getRecentListings: (limit = 8) => {
        return get().listings
          .filter(l => l.status === 'active')
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, limit)
      }
    }),
    {
      name: 'marketplace-storage',
      partialize: (state) => ({
        listings: state.listings,
        myListings: state.myListings,
        filters: state.filters
      })
    }
  )
)