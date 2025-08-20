
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { P2POffer, P2PFilters, PaymentMethod } from '../types/p2p.types'
import { p2pService } from '../services/p2pService'

interface OffersState {
  // State
  offers: P2POffer[]
  loading: boolean
  error?: string
  filters: P2PFilters
  
  // Actions
  fetchOffers: (filters?: Partial<P2PFilters>) => Promise<void>
  createOffer: (offer: Omit<P2POffer, 'id' | 'ownerId' | 'createdAt' | 'stats' | 'reputation'>) => Promise<void>
  updateOffer: (id: string, patch: Partial<P2POffer>) => Promise<void>
  removeOffer: (id: string) => Promise<void>
  setFilters: (patch: Partial<P2PFilters>) => void
  clearFilters: () => void
  
  // Getters
  getOfferById: (id: string) => P2POffer | undefined
  getOffersByOwner: (ownerId: string) => P2POffer[]
  getFilteredOffers: () => P2POffer[]
}

const initialFilters: P2PFilters = {
  side: 'BUY'
}

export const useOffersStore = create<OffersState>()(
  persist(
    (set, get) => ({
      // Initial state
      offers: [],
      loading: false,
      error: undefined,
      filters: initialFilters,

      // Actions
      fetchOffers: async (filters) => {
        set({ loading: true, error: undefined })
        
        try {
          const currentFilters = { ...get().filters, ...filters }
          const offers = await p2pService.fetchOffers(currentFilters)
          
          set({ 
            offers,
            loading: false,
            filters: currentFilters
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro ao buscar ofertas'
          set({ 
            loading: false, 
            error: message 
          })
          throw error
        }
      },

      createOffer: async (offerData) => {
        set({ loading: true, error: undefined })
        
        try {
          const offer = await p2pService.createOffer({
            side: offerData.side,
            priceBZR: offerData.priceBZR,
            minAmount: offerData.minAmount,
            maxAmount: offerData.maxAmount,
            paymentMethods: offerData.paymentMethods,
            terms: offerData.terms,
            location: offerData.location
          })
          
          set(state => ({
            offers: [offer, ...state.offers],
            loading: false
          }))
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro ao criar oferta'
          set({ 
            loading: false, 
            error: message 
          })
          throw error
        }
      },

      updateOffer: async (id, patch) => {
        try {
          // Simular API call
          await new Promise(resolve => setTimeout(resolve, 300))
          
          set(state => ({
            offers: state.offers.map(offer => 
              offer.id === id ? { ...offer, ...patch } : offer
            )
          }))
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro ao atualizar oferta'
          set({ error: message })
          throw error
        }
      },

      removeOffer: async (id) => {
        try {
          // Simular API call
          await new Promise(resolve => setTimeout(resolve, 200))
          
          set(state => ({
            offers: state.offers.filter(offer => offer.id !== id)
          }))
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro ao remover oferta'
          set({ error: message })
          throw error
        }
      },

      setFilters: (patch) => {
        set(state => ({
          filters: { ...state.filters, ...patch }
        }))
      },

      clearFilters: () => {
        set({ filters: initialFilters })
      },

      // Getters
      getOfferById: (id) => {
        return get().offers.find(offer => offer.id === id)
      },

      getOffersByOwner: (ownerId) => {
        return get().offers.filter(offer => offer.ownerId === ownerId)
      },

      getFilteredOffers: () => {
        const { offers, filters } = get()
        let filtered = [...offers]

        // Aplicar filtros locais (para performance)
        if (filters.side) {
          filtered = filtered.filter(offer => offer.side === filters.side)
        }

        if (filters.payment) {
          filtered = filtered.filter(offer => 
            offer.paymentMethods.includes(filters.payment!)
          )
        }

        if (filters.priceMin) {
          filtered = filtered.filter(offer => offer.priceBZR >= filters.priceMin!)
        }

        if (filters.priceMax) {
          filtered = filtered.filter(offer => offer.priceBZR <= filters.priceMax!)
        }

        if (filters.reputationMin) {
          filtered = filtered.filter(offer => 
            offer.reputation?.score && offer.reputation.score >= filters.reputationMin!
          )
        }

        if (filters.city) {
          const city = filters.city.toLowerCase()
          filtered = filtered.filter(offer => 
            offer.location?.city?.toLowerCase().includes(city)
          )
        }

        if (filters.state) {
          const state = filters.state.toLowerCase()
          filtered = filtered.filter(offer => 
            offer.location?.state?.toLowerCase().includes(state)
          )
        }

        if (filters.ownerId) {
          filtered = filtered.filter(offer => offer.ownerId === filters.ownerId)
        }

        if (filters.q) {
          const query = filters.q.toLowerCase()
          filtered = filtered.filter(offer => 
            offer.ownerName?.toLowerCase().includes(query) ||
            offer.terms?.toLowerCase().includes(query) ||
            offer.location?.city?.toLowerCase().includes(query)
          )
        }

        return filtered
      }
    }),
    {
      name: 'bazari-p2p-offers',
      partialize: (state) => ({
        // Persistir apenas os dados, não loading/error
        offers: state.offers,
        filters: state.filters
      })
    }
  )
)