// ==========================================
// src/features/p2p/store/offersStore.ts
// Correção do store de ofertas
// ==========================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { p2pService, type CreateOfferParams } from '../services/p2pService'
import type { P2POffer, P2PFilters } from '../types/p2p.types'

// Filtros iniciais corrigidos
const initialFilters: P2PFilters = {
  side: 'SELL' // Iniciar com SELL como padrão
}

interface OffersState {
  offers: P2POffer[]
  filteredOffers: P2POffer[]
  loading: boolean
  error: string | null
  filters: P2PFilters
  initialized: boolean
}

interface OffersActions {
  fetchOffers: (filters?: Partial<P2PFilters>) => Promise<void>
  createOffer: (params: CreateOfferParams) => Promise<P2POffer>
  updateOffer: (id: string, patch: Partial<P2POffer>) => Promise<void>
  removeOffer: (id: string) => Promise<void>
  setFilters: (patch: Partial<P2PFilters>) => void
  clearFilters: () => void
  applyLocalFilters: () => void
  
  // Getters
  getOfferById: (id: string) => P2POffer | undefined
  getOffersByOwner: (ownerId: string) => P2POffer[]
  getFilteredOffers: () => P2POffer[]
}

export const useOffersStore = create<OffersState & OffersActions>()(
  persist(
    (set, get) => ({
      offers: [],
      filteredOffers: [],
      loading: false,
      error: null,
      filters: initialFilters,
      initialized: false,

      fetchOffers: async (filters) => {
        set({ loading: true, error: null })
        try {
          const currentFilters = { ...get().filters, ...filters }
          
          // Atualizar filtros primeiro
          if (filters) {
            set({ filters: currentFilters })
          }
          
          // Buscar ofertas com filtros
          const offers = await p2pService.fetchOffers(currentFilters)
          
          set({ 
            offers,
            loading: false,
            initialized: true
          })
          
          // Aplicar filtros locais
          get().applyLocalFilters()
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro ao buscar ofertas'
          set({ 
            error: message,
            loading: false,
            initialized: true
          })
        }
      },

      createOffer: async (params) => {
        set({ loading: true, error: null })
        try {
          const offer = await p2pService.createOffer(params)
          set(state => ({ 
            offers: [offer, ...state.offers],
            loading: false 
          }))
          
          get().applyLocalFilters()
          return offer
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
          await new Promise(resolve => setTimeout(resolve, 300))
          
          set(state => ({
            offers: state.offers.map(offer => 
              offer.id === id ? { ...offer, ...patch } : offer
            )
          }))
          
          get().applyLocalFilters()
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro ao atualizar oferta'
          set({ error: message })
          throw error
        }
      },

      removeOffer: async (id) => {
        try {
          await new Promise(resolve => setTimeout(resolve, 200))
          
          set(state => ({
            offers: state.offers.filter(offer => offer.id !== id)
          }))
          
          get().applyLocalFilters()
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro ao remover oferta'
          set({ error: message })
          throw error
        }
      },

      setFilters: (patch) => {
        const newFilters = { ...get().filters, ...patch }
        set({ filters: newFilters })
        
        // Aplicar filtros locais imediatamente
        get().applyLocalFilters()
        
        // Para mudanças significativas, refazer fetch
        if (patch.side || patch.payment || patch.city) {
          get().fetchOffers(newFilters)
        }
      },

      clearFilters: () => {
        set({ filters: initialFilters })
        get().applyLocalFilters()
        get().fetchOffers(initialFilters)
      },

      applyLocalFilters: () => {
        const { offers, filters } = get()
        let filtered = [...offers]

        // Aplicar filtro de side (BUY/SELL)
        if (filters.side) {
          filtered = filtered.filter(offer => offer.side === filters.side)
        }

        // Aplicar filtro de método de pagamento
        if (filters.payment) {
          filtered = filtered.filter(offer => 
            offer.paymentMethods.includes(filters.payment!)
          )
        }

        // Aplicar filtro de preço mínimo
        if (filters.priceMin) {
          filtered = filtered.filter(offer => offer.priceBZR >= filters.priceMin!)
        }

        // Aplicar filtro de preço máximo
        if (filters.priceMax) {
          filtered = filtered.filter(offer => offer.priceBZR <= filters.priceMax!)
        }

        // Aplicar filtro de reputação mínima
        if (filters.reputationMin) {
          filtered = filtered.filter(offer => 
            offer.reputation?.score && offer.reputation.score >= filters.reputationMin!
          )
        }

        // Aplicar filtro de cidade
        if (filters.city) {
          const city = filters.city.toLowerCase()
          filtered = filtered.filter(offer => 
            offer.location?.city?.toLowerCase().includes(city)
          )
        }

        // Aplicar filtro de estado
        if (filters.state) {
          const state = filters.state.toLowerCase()
          filtered = filtered.filter(offer => 
            offer.location?.state?.toLowerCase().includes(state)
          )
        }

        // Aplicar filtro de proprietário
        if (filters.ownerId) {
          filtered = filtered.filter(offer => offer.ownerId === filters.ownerId)
        }

        // Aplicar filtro de busca
        if (filters.q) {
          const query = filters.q.toLowerCase()
          filtered = filtered.filter(offer => 
            offer.ownerName?.toLowerCase().includes(query) ||
            offer.terms?.toLowerCase().includes(query) ||
            offer.location?.city?.toLowerCase().includes(query)
          )
        }

        set({ filteredOffers: filtered })
      },

      // Getters
      getOfferById: (id) => {
        return get().offers.find(offer => offer.id === id)
      },

      getOffersByOwner: (ownerId) => {
        return get().offers.filter(offer => offer.ownerId === ownerId)
      },

      getFilteredOffers: () => {
        return get().filteredOffers
      }
    }),
    {
      name: 'bazari-p2p-offers',
      partialize: (state) => ({
        // Persistir apenas os filtros, não os dados
        filters: state.filters
      })
    }
  )
)