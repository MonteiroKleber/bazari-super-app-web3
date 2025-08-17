// src/features/marketplace/store/marketplaceStore.ts

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import categories from '@app/data/categories.json'

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
          // Mock API call
          await new Promise(resolve => setTimeout(resolve, 800))
          
          // Generate mock listings with enhanced features
          const mockListings: Listing[] = [
            {
              id: 'listing_1',
              title: 'iPhone 15 Pro Max 256GB Titanium Blue',
              description: 'iPhone 15 Pro Max em perfeito estado, apenas 3 meses de uso. Acompanha caixa original, carregador e película de proteção já instalada.',
              price: 6500,
              currency: 'BRL',
              category: 'electronics',
              subcategory: 'smartphones',
              subsubcategory: 'iphone',
              images: ['/mock-iphone.jpg'],
              sellerId: 'user_1',
              sellerName: 'João Silva',
              sellerRating: 4.8,
              enterpriseId: 'ent_1',
              enterpriseName: 'Tech Solutions Pro',
              status: 'active',
              createdAt: '2024-08-15T10:00:00.000Z',
              updatedAt: '2024-08-15T10:00:00.000Z',
              views: 156,
              metadata: {
                condition: 'used',
                brand: 'Apple',
                model: 'iPhone 15 Pro Max',
                warranty: '9 meses restantes',
                shipping: {
                  free: false,
                  methods: ['Entrega Rápida (até 2h)', 'Entrega Municipal (cidade)'],
                  estimatedDays: 2,
                  cost: 25
                },
                location: {
                  city: 'São Paulo',
                  state: 'SP',
                  country: 'Brasil'
                }
              }
            },
            {
              id: 'listing_2',
              title: 'Curso de React Avançado - Do Zero ao Expert',
              description: 'Curso completo de React com mais de 40 horas de conteúdo. Inclui projetos práticos, testes, deploy e muito mais.',
              price: 297,
              currency: 'BRL',
              category: 'digital',
              subcategory: 'courses',
              images: ['/mock-course.jpg'],
              sellerId: 'user_2',
              sellerName: 'Maria Santos',
              sellerRating: 4.9,
              enterpriseId: 'ent_2',
              enterpriseName: 'CodeAcademy Brasil',
              status: 'active',
              createdAt: '2024-08-14T15:00:00.000Z',
              updatedAt: '2024-08-14T15:00:00.000Z',
              views: 89,
              digital: {
                type: 'course',
                deliveryInstructions: 'Acesso liberado imediatamente após o pagamento. Login será enviado por email.',
                tokenizable: true,
                tokenization: {
                  quantity: 100,
                  royaltyPercentage: 10,
                  sellDuration: 60,
                  transferable: true,
                  currentSupply: 25,
                  pricePerToken: 2.97
                }
              },
              metadata: {
                shipping: {
                  free: true,
                  methods: ['Digital/Download'],
                  estimatedDays: 0
                },
                location: {
                  city: 'Rio de Janeiro',
                  state: 'RJ',
                  country: 'Brasil'
                }
              }
            },
            {
              id: 'listing_3',
              title: 'Tênis Nike Air Max 270 Masculino',
              description: 'Tênis Nike Air Max 270 na cor preta, tamanho 42. Novo na caixa, nunca usado.',
              price: 450,
              currency: 'BRL',
              category: 'fashion',
              subcategory: 'shoes',
              subsubcategory: 'sneakers',
              images: ['/mock-sneaker.jpg'],
              sellerId: 'user_3',
              sellerName: 'Pedro Costa',
              sellerRating: 4.6,
              status: 'active',
              createdAt: '2024-08-13T09:00:00.000Z',
              updatedAt: '2024-08-13T09:00:00.000Z',
              views: 234,
              metadata: {
                condition: 'new',
                brand: 'Nike',
                model: 'Air Max 270',
                shipping: {
                  free: true,
                  methods: ['Entrega Nacional', 'Retirada no Local'],
                  estimatedDays: 5
                },
                location: {
                  city: 'Belo Horizonte',
                  state: 'MG',
                  country: 'Brasil'
                }
              }
            },
            {
              id: 'listing_4',
              title: 'E-book: Guia Completo de Marketing Digital',
              description: 'E-book com 200 páginas sobre estratégias de marketing digital que realmente funcionam.',
              price: 50,
              currency: 'BZR',
              category: 'digital',
              subcategory: 'ebooks',
              images: ['/mock-ebook.jpg'],
              sellerId: 'user_4',
              sellerName: 'Ana Oliveira',
              sellerRating: 4.7,
              status: 'active',
              createdAt: '2024-08-12T14:00:00.000Z',
              updatedAt: '2024-08-12T14:00:00.000Z',
              views: 67,
              digital: {
                type: 'ebook',
                deliveryInstructions: 'PDF será enviado por email após confirmação do pagamento.',
                tokenizable: false
              },
              metadata: {
                shipping: {
                  free: true,
                  methods: ['Digital/Download'],
                  estimatedDays: 0
                }
              }
            }
          ]

          // Apply filters
          let filteredListings = mockListings

          if (filters) {
            // Category filters
            if (filters.category) {
              filteredListings = filteredListings.filter(l => l.category === filters.category)
            }
            if (filters.subcategory) {
              filteredListings = filteredListings.filter(l => l.subcategory === filters.subcategory)
            }
            if (filters.subsubcategory) {
              filteredListings = filteredListings.filter(l => l.subsubcategory === filters.subsubcategory)
            }
            if (filters.subsubsubcategory) {
              filteredListings = filteredListings.filter(l => l.subsubsubcategory === filters.subsubsubcategory)
            }

            // Price filters
            if (filters.minPrice !== undefined) {
              filteredListings = filteredListings.filter(l => l.price >= filters.minPrice!)
            }
            if (filters.maxPrice !== undefined) {
              filteredListings = filteredListings.filter(l => l.price <= filters.maxPrice!)
            }

            // Currency filter
            if (filters.currency) {
              filteredListings = filteredListings.filter(l => l.currency === filters.currency)
            }

            // Digital/Tokenizable filters
            if (filters.digitalOnly) {
              filteredListings = filteredListings.filter(l => !!l.digital)
            }
            if (filters.tokenizableOnly) {
              filteredListings = filteredListings.filter(l => l.digital?.tokenizable)
            }

            // Shipping filters
            if (filters.freeShippingOnly) {
              filteredListings = filteredListings.filter(l => l.metadata?.shipping?.free)
            }

            // Condition filter
            if (filters.condition) {
              filteredListings = filteredListings.filter(l => l.metadata?.condition === filters.condition)
            }

            // Enterprise filter
            if (filters.enterpriseId) {
              filteredListings = filteredListings.filter(l => l.enterpriseId === filters.enterpriseId)
            }

            // Location filter
            if (filters.location?.city) {
              filteredListings = filteredListings.filter(l => 
                l.metadata?.location?.city?.toLowerCase().includes(filters.location!.city!.toLowerCase())
              )
            }

            // Search filter
            if (filters.search) {
              const query = filters.search.toLowerCase()
              filteredListings = filteredListings.filter(l =>
                l.title.toLowerCase().includes(query) ||
                l.description.toLowerCase().includes(query) ||
                l.sellerName.toLowerCase().includes(query) ||
                l.enterpriseName?.toLowerCase().includes(query)
              )
            }

            // Sorting
            if (filters.sortBy) {
              switch (filters.sortBy) {
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
                case 'newest':
                default:
                  filteredListings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  break
              }
            }
          }

          set({ listings: filteredListings })
        } catch (error) {
          console.error('Error fetching listings:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      fetchMyListings: async () => {
        set({ isLoading: true })
        
        try {
          await new Promise(resolve => setTimeout(resolve, 500))
          
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
        const listing = get().listings.find(l => l.id === id)
        if (listing) {
          // Increment views
          get().incrementViews(id)
          return listing
        }
        
        // If not found in store, try to fetch from API
        try {
          await new Promise(resolve => setTimeout(resolve, 300))
          // Mock API call would go here
          return null
        } catch (error) {
          console.error('Error fetching listing:', error)
          return null
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
            l.status === 'active' &&
            (l.category === currentListing.category || 
             l.subcategory === currentListing.subcategory)
          )
          .sort((a, b) => b.views - a.views)
          .slice(0, limit)
      },

      getListingsByEnterprise: (enterpriseId: string) => {
        return get().listings.filter(l => 
          l.enterpriseId === enterpriseId && l.status === 'active'
        )
      },

      getPopularListings: (limit = 10) => {
        return get().listings
          .filter(l => l.status === 'active')
          .sort((a, b) => b.views - a.views)
          .slice(0, limit)
      },

      getRecentListings: (limit = 10) => {
        return get().listings
          .filter(l => l.status === 'active')
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, limit)
      }
    }),
    {
      name: 'bazari-marketplace-store',
      partialize: (state) => ({
        listings: state.listings,
        myListings: state.myListings,
        filters: state.filters
      })
    }
  )
)