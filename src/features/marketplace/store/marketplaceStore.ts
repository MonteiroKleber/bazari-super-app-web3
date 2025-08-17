import { create } from 'zustand'
import categories from '@app/data/categories.json'

export interface Listing {
  id: string
  title: string
  description: string
  price: number
  currency: 'BZR' | 'BRL'
  category: string
  subcategory: string
  images: string[]
  sellerId: string
  sellerName: string
  sellerRating: number
  status: 'active' | 'paused' | 'sold' | 'expired'
  createdAt: string
  updatedAt: string
  views: number
  digital?: {
    type: 'course' | 'ebook' | 'software' | 'media' | 'template' | 'other'
    deliveryInstructions: string
    downloadUrl?: string
    accessKey?: string
  }
}

interface MarketplaceFilters {
  category?: string
  subcategory?: string
  minPrice?: number
  maxPrice?: number
  currency?: 'BZR' | 'BRL'
  digitalOnly?: boolean
  search?: string
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
  fetchListings: () => Promise<void>
  fetchMyListings: () => Promise<void>
}

export const useMarketplaceStore = create<MarketplaceState>((set, get) => ({
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
    set(state => ({
      listings: state.listings.map(l => l.id === id ? { ...l, ...updates } : l),
      myListings: state.myListings.map(l => l.id === id ? { ...l, ...updates } : l)
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
    get().fetchListings()
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading })
  },

  searchListings: async (query: string) => {
    set({ isLoading: true, filters: { ...get().filters, search: query } })
    try {
      // Mock search - replace with real API
      await new Promise(resolve => setTimeout(resolve, 500))
      // Would filter listings based on query
    } finally {
      set({ isLoading: false })
    }
  },

  fetchListings: async () => {
    set({ isLoading: true })
    try {
      // Mock fetch - replace with real API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data
      const mockListings: Listing[] = [
        {
          id: '1',
          title: 'iPhone 15 Pro Max 256GB',
          description: 'Novo, na caixa, com nota fiscal',
          price: 7500,
          currency: 'BRL',
          category: 'electronics',
          subcategory: 'smartphones',
          images: ['/mock-iphone.jpg'],
          sellerId: 'user1',
          sellerName: 'João Silva',
          sellerRating: 4.8,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          views: 125
        }
      ]
      
      set({ listings: mockListings })
    } finally {
      set({ isLoading: false })
    }
  },

  fetchMyListings: async () => {
    set({ isLoading: true })
    try {
      // Mock fetch user's listings
      await new Promise(resolve => setTimeout(resolve, 500))
      set({ myListings: [] }) // Empty for now
    } finally {
      set({ isLoading: false })
    }
  }
}))
