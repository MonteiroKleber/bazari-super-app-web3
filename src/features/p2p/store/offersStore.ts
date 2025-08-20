// ==========================================
// src/features/p2p/store/offersStore.ts - COMPLETO
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
  
  // Paginação
  currentPage: number
  pageSize: number
  totalPages: number
  hasMore: boolean
  
  // Estatísticas
  stats: {
    total: number
    sell: number
    buy: number
    filtered: number
    avgPrice: string
    paymentMethods: Record<string, number>
  }
}

interface OffersActions {
  // Core CRUD
  fetchOffers: (filters?: Partial<P2PFilters>) => Promise<void>
  createOffer: (params: CreateOfferParams) => Promise<P2POffer>
  updateOffer: (id: string, patch: Partial<P2POffer>) => Promise<void>
  removeOffer: (id: string) => Promise<void>
  
  // ✅ NOVO: Método específico para buscar oferta por ID
  fetchOfferById: (id: string) => Promise<P2POffer | null>
  
  // Filtros
  setFilters: (patch: Partial<P2PFilters>) => void
  clearFilters: () => void
  applyLocalFilters: () => void
  
  // Paginação
  setCurrentPage: (page: number) => void
  setPageSize: (size: number) => void
  
  // Getters
  getOfferById: (id: string) => P2POffer | undefined
  getOffersByOwner: (ownerId: string) => P2POffer[]
  getFilteredOffers: () => P2POffer[]
  getPaginatedOffers: () => P2POffer[]
  
  // Estatísticas
  updateStats: () => void
  
  // Utilitários
  resetStore: () => void
  forceRefresh: () => Promise<void>
}

const initialState: OffersState = {
  offers: [],
  filteredOffers: [],
  loading: false,
  error: null,
  filters: initialFilters,
  initialized: false,
  currentPage: 1,
  pageSize: 20,
  totalPages: 1,
  hasMore: false,
  stats: {
    total: 0,
    sell: 0,
    buy: 0,
    filtered: 0,
    avgPrice: '0.00',
    paymentMethods: {}
  }
}

export const useOffersStore = create<OffersState & OffersActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      fetchOffers: async (filters) => {
        set({ loading: true, error: null })
        try {
          console.log('🏪 Store: fetchOffers chamado com filtros:', filters)
          
          const currentFilters = { ...get().filters, ...filters }
          
          // Atualizar filtros primeiro
          if (filters) {
            set({ filters: currentFilters })
          }
          
          // Buscar ofertas com filtros
          const offers = await p2pService.fetchOffers(currentFilters)
          
          console.log('🏪 Store: Ofertas recebidas:', offers.length)
          
          set({ 
            offers,
            loading: false,
            initialized: true,
            currentPage: 1 // Reset para primeira página
          })
          
          // Aplicar filtros locais e atualizar stats
          get().applyLocalFilters()
          get().updateStats()
          
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro ao buscar ofertas'
          set({ 
            error: message,
            loading: false,
            initialized: true
          })
          console.error('❌ Store: Erro ao buscar ofertas:', error)
        }
      },

      /**
       * ✅ NOVO: Método específico para buscar oferta por ID
       */
      fetchOfferById: async (id: string) => {
        console.log(`🔍 Store: Buscando oferta por ID: ${id}`)
        
        // Primeiro verificar se já temos a oferta no estado local
        const localOffer = get().offers.find(offer => offer.id === id)
        if (localOffer) {
          console.log(`📋 Store: Oferta encontrada no estado local`)
          return localOffer
        }
        
        console.log(`📊 Store: Estado local tem ${get().offers.length} ofertas, mas não contém ${id}`)
        
        // Se não tiver, buscar via service
        try {
          console.log(`🔄 Store: Buscando com p2pService.fetchOfferById...`)
          const offer = await p2pService.fetchOfferById(id)
          
          if (offer) {
            console.log(`✅ Store: Oferta encontrada via service`)
            // Adicionar ao estado local se encontrada
            set(state => ({
              offers: [offer, ...state.offers.filter(o => o.id !== offer.id)]
            }))
            
            // Reaplicar filtros
            get().applyLocalFilters()
            get().updateStats()
            
            return offer
          } else {
            console.log(`❌ Store: fetchOfferById retornou null`)
            console.log(`❌ Store: Oferta não existe`)
            return null
          }
        } catch (error) {
          console.error('❌ Store: Erro ao buscar oferta por ID:', error)
          return null
        }
      },

      createOffer: async (params) => {
        set({ loading: true, error: null })
        try {
          console.log('🏪 Store: Criando nova oferta:', params)
          
          const offer = await p2pService.createOffer(params)
          
          set(state => ({ 
            offers: [offer, ...state.offers],
            loading: false 
          }))
          
          get().applyLocalFilters()
          get().updateStats()
          
          console.log('✅ Store: Oferta criada com sucesso:', offer.id)
          return offer
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro ao criar oferta'
          set({ 
            error: message,
            loading: false 
          })
          console.error('❌ Store: Erro ao criar oferta:', error)
          throw error
        }
      },

      updateOffer: async (id, patch) => {
        try {
          console.log('🏪 Store: Atualizando oferta:', id, patch)
          
          // Em produção, chamar API
          await new Promise(resolve => setTimeout(resolve, 300))
          
          set(state => ({
            offers: state.offers.map(offer => 
              offer.id === id ? { ...offer, ...patch } : offer
            )
          }))
          
          get().applyLocalFilters()
          get().updateStats()
          
          console.log('✅ Store: Oferta atualizada:', id)
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro ao atualizar oferta'
          set({ error: message })
          console.error('❌ Store: Erro ao atualizar oferta:', error)
          throw error
        }
      },

      removeOffer: async (id) => {
        try {
          console.log('🏪 Store: Removendo oferta:', id)
          
          await p2pService.removeOffer(id)
          
          set(state => ({
            offers: state.offers.filter(offer => offer.id !== id)
          }))
          
          get().applyLocalFilters()
          get().updateStats()
          
          console.log('✅ Store: Oferta removida:', id)
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro ao remover oferta'
          set({ error: message })
          console.error('❌ Store: Erro ao remover oferta:', error)
          throw error
        }
      },

      setFilters: (patch) => {
        console.log('🏪 Store: Atualizando filtros:', patch)
        
        set(state => ({ 
          filters: { ...state.filters, ...patch },
          currentPage: 1 // Reset para primeira página
        }))
        
        get().applyLocalFilters()
        get().updateStats()
      },

      clearFilters: () => {
        console.log('🏪 Store: Limpando filtros')
        
        set({ 
          filters: initialFilters,
          currentPage: 1
        })
        
        get().applyLocalFilters()
        get().updateStats()
      },

      applyLocalFilters: () => {
        const { offers, filters } = get()
        let filtered = [...offers]

        console.log('🏪 Store: Aplicando filtros locais:', filters)
        console.log('🏪 Store: Total de ofertas antes dos filtros:', filtered.length)

        // Aplicar filtro de lado (BUY/SELL)
        if (filters.side) {
          filtered = filtered.filter(offer => offer.side === filters.side)
          console.log(`🏪 Store: Após filtro side=${filters.side}:`, filtered.length)
        }

        // Aplicar filtro de método de pagamento
        if (filters.payment) {
          filtered = filtered.filter(offer => 
            offer.paymentMethods.includes(filters.payment!)
          )
          console.log(`🏪 Store: Após filtro payment=${filters.payment}:`, filtered.length)
        }

        // Aplicar filtro de preço mínimo
        if (filters.priceMin) {
          filtered = filtered.filter(offer => offer.priceBZR >= filters.priceMin!)
          console.log(`🏪 Store: Após filtro priceMin=${filters.priceMin}:`, filtered.length)
        }

        // Aplicar filtro de preço máximo
        if (filters.priceMax) {
          filtered = filtered.filter(offer => offer.priceBZR <= filters.priceMax!)
          console.log(`🏪 Store: Após filtro priceMax=${filters.priceMax}:`, filtered.length)
        }

        // Aplicar filtro de reputação mínima
        if (filters.reputationMin) {
          filtered = filtered.filter(offer => 
            offer.reputation?.score && offer.reputation.score >= filters.reputationMin!
          )
          console.log(`🏪 Store: Após filtro reputationMin=${filters.reputationMin}:`, filtered.length)
        }

        // Aplicar filtro de cidade
        if (filters.city) {
          const city = filters.city.toLowerCase()
          filtered = filtered.filter(offer => 
            offer.location?.city?.toLowerCase().includes(city)
          )
          console.log(`🏪 Store: Após filtro city=${filters.city}:`, filtered.length)
        }

        // Aplicar filtro de estado
        if (filters.state) {
          const state = filters.state.toLowerCase()
          filtered = filtered.filter(offer => 
            offer.location?.state?.toLowerCase().includes(state)
          )
          console.log(`🏪 Store: Após filtro state=${filters.state}:`, filtered.length)
        }

        // Aplicar filtro de proprietário
        if (filters.ownerId) {
          filtered = filtered.filter(offer => offer.ownerId === filters.ownerId)
          console.log(`🏪 Store: Após filtro ownerId=${filters.ownerId}:`, filtered.length)
        }

        // Aplicar filtro de busca
        if (filters.q) {
          const query = filters.q.toLowerCase()
          filtered = filtered.filter(offer => 
            offer.ownerName?.toLowerCase().includes(query) ||
            offer.terms?.toLowerCase().includes(query) ||
            offer.location?.city?.toLowerCase().includes(query)
          )
          console.log(`🏪 Store: Após filtro query=${filters.q}:`, filtered.length)
        }

        // Ordenação (se especificada no filtro)
        if (filters.sortBy) {
          switch (filters.sortBy) {
            case 'price_asc':
              filtered.sort((a, b) => a.priceBZR - b.priceBZR)
              break
            case 'price_desc':
              filtered.sort((a, b) => b.priceBZR - a.priceBZR)
              break
            case 'reputation_desc':
              filtered.sort((a, b) => (b.reputation?.score || 0) - (a.reputation?.score || 0))
              break
            case 'amount_desc':
              filtered.sort((a, b) => parseFloat(b.maxAmount) - parseFloat(a.maxAmount))
              break
            case 'newest':
            default:
              filtered.sort((a, b) => b.createdAt - a.createdAt)
              break
          }
        }

        // Calcular paginação
        const { pageSize, currentPage } = get()
        const totalPages = Math.ceil(filtered.length / pageSize)
        const hasMore = currentPage < totalPages

        set({ 
          filteredOffers: filtered,
          totalPages,
          hasMore
        })

        console.log('✅ Store: Filtros aplicados. Resultado final:', filtered.length)
      },

      // Paginação
      setCurrentPage: (page) => {
        set({ currentPage: page })
      },

      setPageSize: (size) => {
        set({ 
          pageSize: size,
          currentPage: 1 // Reset para primeira página
        })
        get().applyLocalFilters()
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
      },

      getPaginatedOffers: () => {
        const { filteredOffers, currentPage, pageSize } = get()
        const startIndex = (currentPage - 1) * pageSize
        const endIndex = startIndex + pageSize
        return filteredOffers.slice(startIndex, endIndex)
      },

      // Estatísticas
      updateStats: () => {
        const { offers, filteredOffers } = get()
        
        // Contar por tipo
        const sellCount = offers.filter(o => o.side === 'SELL').length
        const buyCount = offers.filter(o => o.side === 'BUY').length
        
        // Preço médio
        const avgPrice = offers.length > 0 
          ? (offers.reduce((sum, o) => sum + o.priceBZR, 0) / offers.length).toFixed(2)
          : '0.00'
        
        // Métodos de pagamento
        const paymentMethods: Record<string, number> = {}
        offers.forEach(offer => {
          offer.paymentMethods.forEach(method => {
            paymentMethods[method] = (paymentMethods[method] || 0) + 1
          })
        })
        
        set({
          stats: {
            total: offers.length,
            sell: sellCount,
            buy: buyCount,
            filtered: filteredOffers.length,
            avgPrice,
            paymentMethods
          }
        })
      },

      // Utilitários
      resetStore: () => {
        console.log('🏪 Store: Resetando store')
        set(initialState)
      },

      forceRefresh: async () => {
        console.log('🏪 Store: Forçando refresh completo')
        
        // Limpar cache do service
        p2pService.clearMockCache()
        
        // Recarregar ofertas
        const { filters } = get()
        await get().fetchOffers(filters)
      }
    }),
    {
      name: 'bazari-p2p-offers',
      partialize: (state) => ({
        // Persistir apenas os filtros e configurações de UI
        filters: state.filters,
        pageSize: state.pageSize,
        currentPage: 1 // Sempre começar na primeira página
      })
    }
  )
)