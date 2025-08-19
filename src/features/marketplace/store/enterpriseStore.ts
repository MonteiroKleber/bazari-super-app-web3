// src/features/marketplace/store/enterpriseStore.ts

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Enterprise, EnterpriseFilters, EnterpriseMetrics } from '../types/enterprise.types'
import { mockEnterprises } from '@app/data/mockMarketplaceData'

interface EnterpriseState {
  enterprises: Enterprise[]
  myEnterprises: Enterprise[]
  currentEnterprise: Enterprise | null
  filters: EnterpriseFilters
  isLoading: boolean
  metrics: EnterpriseMetrics | null
  
  // Actions
  setEnterprises: (enterprises: Enterprise[]) => void
  addEnterprise: (enterprise: Enterprise) => void
  addOrMerge: (enterprise: Enterprise) => void // ✅ NOVO MÉTODO
  updateEnterprise: (id: string, updates: Partial<Enterprise>) => void
  removeEnterprise: (id: string) => void
  setCurrentEnterprise: (enterprise: Enterprise | null) => void
  setFilters: (filters: EnterpriseFilters) => void
  setLoading: (loading: boolean) => void
  setMetrics: (metrics: EnterpriseMetrics) => void
  
  // API Actions
  fetchEnterprises: (filters?: EnterpriseFilters) => Promise<void>
  fetchMyEnterprises: () => Promise<void>
  fetchEnterpriseById: (id: string) => Promise<Enterprise | null>
  createEnterprise: (data: Omit<Enterprise, 'id' | 'createdAt' | 'updatedAt' | 'stats' | 'reputation'>) => Promise<string>
  searchEnterprises: (query: string) => Promise<void>
  toggleEnterpriseTokenization: (id: string, enabled: boolean) => Promise<void>
  updateEnterpriseVerification: (id: string, verified: boolean) => Promise<void>
}

export const useEnterpriseStore = create<EnterpriseState>()(
  persist(
    (set, get) => ({
      enterprises: [],
      myEnterprises: [],
      currentEnterprise: null,
      filters: {},
      isLoading: false,
      metrics: null,

      setEnterprises: (enterprises: Enterprise[]) => {
        set({ enterprises })
        
        // Atualizar myEnterprises baseado no usuário atual (se disponível)
        // Nota: idealmente receberia userId como parâmetro ou do contexto
        set(state => ({
          myEnterprises: state.enterprises.filter(e => {
            // Esta lógica será refinada no MarketplaceCreate
            return e.ownerId // placeholder
          })
        }))
      },

      addEnterprise: (enterprise: Enterprise) => {
        set(state => ({
          enterprises: [enterprise, ...state.enterprises],
          myEnterprises: [enterprise, ...state.myEnterprises]
        }))
      },

      // ✅ NOVO MÉTODO: addOrMerge conforme especificado no documento
      addOrMerge: (enterprise: Enterprise) => {
        set(state => {
          const enterprisesCopy = [...state.enterprises]
          const myEnterprisesCopy = [...state.myEnterprises]
          
          // Verificar se já existe nos enterprises
          const enterpriseIdx = enterprisesCopy.findIndex(x => x.id === enterprise.id)
          if (enterpriseIdx >= 0) {
            // Merge: atualizar existente
            enterprisesCopy[enterpriseIdx] = { ...enterprisesCopy[enterpriseIdx], ...enterprise }
          } else {
            // Add: adicionar novo
            enterprisesCopy.unshift(enterprise)
          }
          
          // Verificar se já existe nos myEnterprises
          const myIdx = myEnterprisesCopy.findIndex(x => x.id === enterprise.id)
          if (myIdx >= 0) {
            // Merge: atualizar existente
            myEnterprisesCopy[myIdx] = { ...myEnterprisesCopy[myIdx], ...enterprise }
          } else {
            // Add: adicionar novo (se pertencer ao usuário)
            myEnterprisesCopy.unshift(enterprise)
          }
          
          return {
            enterprises: enterprisesCopy,
            myEnterprises: myEnterprisesCopy
          }
        })
      },

      updateEnterprise: (id: string, updates: Partial<Enterprise>) => {
        const updatedEnterprise = { 
          ...updates, 
          updatedAt: new Date().toISOString() 
        }
        
        set(state => ({
          enterprises: state.enterprises.map(e => 
            e.id === id ? { ...e, ...updatedEnterprise } : e
          ),
          myEnterprises: state.myEnterprises.map(e => 
            e.id === id ? { ...e, ...updatedEnterprise } : e
          ),
          currentEnterprise: state.currentEnterprise?.id === id 
            ? { ...state.currentEnterprise, ...updatedEnterprise }
            : state.currentEnterprise
        }))
      },

      removeEnterprise: (id: string) => {
        set(state => ({
          enterprises: state.enterprises.filter(e => e.id !== id),
          myEnterprises: state.myEnterprises.filter(e => e.id !== id),
          currentEnterprise: state.currentEnterprise?.id === id 
            ? null 
            : state.currentEnterprise
        }))
      },

      setCurrentEnterprise: (enterprise: Enterprise | null) => {
        set({ currentEnterprise: enterprise })
      },

      setFilters: (filters: EnterpriseFilters) => {
        set({ filters })
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading })
      },

      setMetrics: (metrics: EnterpriseMetrics) => {
        set({ metrics })
      },

      fetchEnterprises: async (filters?: EnterpriseFilters) => {
        set({ isLoading: true })
        try {
          // Simula delay de API
          await new Promise(resolve => setTimeout(resolve, 300))
          
          // Usa dados mock
          let filteredEnterprises = [...mockEnterprises]
          
          // Aplica filtros se fornecidos
          if (filters) {
            if (filters.category) {
              filteredEnterprises = filteredEnterprises.filter(e => 
                e.categories.includes(filters.category!)
              )
            }
            if (filters.subcategory) {
              filteredEnterprises = filteredEnterprises.filter(e => 
                e.subcategories.includes(filters.subcategory!)
              )
            }
            if (filters.verified !== undefined) {
              filteredEnterprises = filteredEnterprises.filter(e => 
                e.verification.verified === filters.verified
              )
            }
            if (filters.tokenizable !== undefined) {
              filteredEnterprises = filteredEnterprises.filter(e => 
                e.tokenizable === filters.tokenizable
              )
            }
            if (filters.search) {
              const query = filters.search.toLowerCase()
              filteredEnterprises = filteredEnterprises.filter(e =>
                e.name.toLowerCase().includes(query) ||
                e.description.toLowerCase().includes(query)
              )
            }
            if (filters.minRating) {
              filteredEnterprises = filteredEnterprises.filter(e => 
                e.reputation.rating >= filters.minRating!
              )
            }
            if (filters.location) {
              if (filters.location.city) {
                filteredEnterprises = filteredEnterprises.filter(e =>
                  e.address?.city?.toLowerCase().includes(filters.location!.city!.toLowerCase())
                )
              }
              if (filters.location.state) {
                filteredEnterprises = filteredEnterprises.filter(e =>
                  e.address?.state?.toLowerCase().includes(filters.location!.state!.toLowerCase())
                )
              }
            }
            
            // Ordenação
            if (filters.sortBy) {
              switch (filters.sortBy) {
                case 'newest':
                  filteredEnterprises.sort((a, b) => 
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                  )
                  break
                case 'rating':
                  filteredEnterprises.sort((a, b) => b.reputation.rating - a.reputation.rating)
                  break
                case 'sales':
                  filteredEnterprises.sort((a, b) => b.reputation.totalSales - a.reputation.totalSales)
                  break
                default:
                  // 'relevance' - manter ordem padrão
                  break
              }
            }
          }
          
          set({ enterprises: filteredEnterprises, filters })
        } catch (error) {
          console.error('Error fetching enterprises:', error)
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      fetchMyEnterprises: async () => {
        // Esta função assumiria algum contexto do usuário
        // Por ora, usa a lista completa e filtra por ownerId
        // (será refinado no MarketplaceCreate.tsx)
        await get().fetchEnterprises()
      },

      // ✅ MELHORADO: fetchEnterpriseById mais robusto
      fetchEnterpriseById: async (id: string) => {
        set({ isLoading: true })
        try {
          // Primeiro verifica se já está no store
          const existing = get().enterprises.find(e => e.id === id)
          if (existing) {
            set({ currentEnterprise: existing, isLoading: false })
            return existing
          }
          
          // Simula delay de API para buscar por ID específico
          await new Promise(resolve => setTimeout(resolve, 300))
          
          // Busca nos dados mock
          const enterprise = mockEnterprises.find(e => e.id === id)
          
          if (enterprise) {
            // Usa addOrMerge para atualizar o store
            get().addOrMerge(enterprise)
            set({ currentEnterprise: enterprise })
            return enterprise
          }
          
          return null
        } catch (error) {
          console.error('Error fetching enterprise:', error)
          return null
        } finally {
          set({ isLoading: false })
        }
      },

      createEnterprise: async (data) => {
        set({ isLoading: true })
        try {
          await new Promise(resolve => setTimeout(resolve, 800))
          
          const newEnterprise: Enterprise = {
            ...data,
            id: crypto.randomUUID(),
            reputation: {
              rating: 0,
              reviewCount: 0,
              totalSales: 0,
              completionRate: 0
            },
            stats: {
              totalListings: 0,
              activeListings: 0,
              soldListings: 0,
              totalViews: 0,
              totalRevenue: { BZR: 0, BRL: 0 },
              avgResponseTime: 0
            },
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          
          // ✅ USA addOrMerge em vez de addEnterprise
          get().addOrMerge(newEnterprise)
          return newEnterprise.id
        } catch (error) {
          console.error('Error creating enterprise:', error)
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      searchEnterprises: async (query: string) => {
        const filters = { ...get().filters, search: query }
        await get().fetchEnterprises(filters)
      },

      toggleEnterpriseTokenization: async (id: string, enabled: boolean) => {
        try {
          await new Promise(resolve => setTimeout(resolve, 300))
          
          get().updateEnterprise(id, {
            tokenization: {
              ...get().enterprises.find(e => e.id === id)?.tokenization,
              enabled
            }
          })
        } catch (error) {
          console.error('Error toggling tokenization:', error)
          throw error
        }
      },

      updateEnterpriseVerification: async (id: string, verified: boolean) => {
        try {
          await new Promise(resolve => setTimeout(resolve, 300))
          
          get().updateEnterprise(id, {
            verification: {
              ...get().enterprises.find(e => e.id === id)?.verification,
              verified,
              verifiedAt: verified ? new Date().toISOString() : undefined
            }
          })
        } catch (error) {
          console.error('Error updating verification:', error)
          throw error
        }
      }
    }),
    {
      name: 'enterprise-storage',
      partialize: (state) => ({
        enterprises: state.enterprises,
        myEnterprises: state.myEnterprises,
        filters: state.filters,
        metrics: state.metrics
      })
    }
  )
)