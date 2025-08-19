// src/features/marketplace/store/enterpriseStore.ts
// ✅ CORRIGIDO: EnterpriseStore com carregamento correto dos dados mock

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Enterprise, EnterpriseFilters, EnterpriseMetrics, EnterpriseEconomicData } from '../types/enterprise.types'
import { mockEnterprises } from '@app/data/mockMarketplaceData'
import { mockEnterprisesExtended } from '@app/data/mockEnterpriseTokenizationData'

interface EnterpriseState {
  enterprises: Enterprise[]
  myEnterprises: Enterprise[]
  currentEnterprise: Enterprise | null
  filters: EnterpriseFilters
  isLoading: boolean
  metrics: EnterpriseMetrics | null
  isInitialized: boolean // ✅ NOVO: flag para controlar inicialização
  
  // ✅ NOVO: dados econômicos históricos
  economicData: { [enterpriseId: string]: EnterpriseEconomicData[] }
  
  // Actions
  setEnterprises: (enterprises: Enterprise[]) => void
  addEnterprise: (enterprise: Enterprise) => void
  addOrMerge: (enterprise: Enterprise) => void
  updateEnterprise: (id: string, updates: Partial<Enterprise>) => void
  removeEnterprise: (id: string) => void
  setCurrentEnterprise: (enterprise: Enterprise | null) => void
  setFilters: (filters: EnterpriseFilters) => void
  setLoading: (loading: boolean) => void
  setMetrics: (metrics: EnterpriseMetrics) => void
  
  // API Actions
  fetchEnterprises: (filters?: EnterpriseFilters) => Promise<void>
  fetchEnterpriseById: (id: string) => Promise<void>
  createEnterprise: (enterpriseData: Omit<Enterprise, 'id' | 'createdAt' | 'updatedAt' | 'stats'>) => Promise<string>
  searchEnterprises: (query: string) => Promise<void>
  toggleEnterpriseTokenization: (id: string, enabled: boolean) => Promise<void>
  updateEnterpriseVerification: (id: string, verified: boolean) => Promise<void>
  
  // ✅ NOVOS MÉTODOS para funcionalidades econômicas
  fetchEconomicData: (enterpriseId: string) => Promise<void>
  updateTokenMetrics: (enterpriseId: string, metrics: Partial<Enterprise>) => Promise<void>
  
  // ✅ MÉTODO para inicialização
  initializeMockData: () => void
}

// ✅ Combinar todos os dados mock
const getAllMockEnterprises = (): Enterprise[] => {
  const allEnterprises = [...mockEnterprises, ...mockEnterprisesExtended]
  
  // Remover duplicados
  const uniqueEnterprises = allEnterprises.reduce((acc, enterprise) => {
    const existingIndex = acc.findIndex(e => e.id === enterprise.id)
    if (existingIndex >= 0) {
      acc[existingIndex] = enterprise // Substituir com a versão mais recente
    } else {
      acc.push(enterprise)
    }
    return acc
  }, [] as Enterprise[])
  
  return uniqueEnterprises
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
      economicData: {},
      isInitialized: false,

      setEnterprises: (enterprises: Enterprise[]) => {
        set({ enterprises, isInitialized: true })
      },

      addEnterprise: (enterprise: Enterprise) => {
        set(state => ({
          enterprises: [enterprise, ...state.enterprises],
          myEnterprises: [enterprise, ...state.myEnterprises]
        }))
      },

      addOrMerge: (enterprise: Enterprise) => {
        set(state => {
          const existingIndex = state.enterprises.findIndex(e => e.id === enterprise.id)
          
          if (existingIndex >= 0) {
            // Atualizar existente
            const updatedEnterprises = [...state.enterprises]
            updatedEnterprises[existingIndex] = enterprise
            
            const myExistingIndex = state.myEnterprises.findIndex(e => e.id === enterprise.id)
            const updatedMyEnterprises = myExistingIndex >= 0 
              ? state.myEnterprises.map(e => e.id === enterprise.id ? enterprise : e)
              : state.myEnterprises
            
            return {
              enterprises: updatedEnterprises,
              myEnterprises: updatedMyEnterprises
            }
          } else {
            // Adicionar novo
            return {
              enterprises: [enterprise, ...state.enterprises],
              myEnterprises: [enterprise, ...state.myEnterprises]
            }
          }
        })
      },

      updateEnterprise: (id: string, updates: Partial<Enterprise>) => {
        const updatedEnterprise = { 
          ...updates, 
          updatedAt: new Date().toISOString() 
        }
        
        set(state => {
          const updateFn = (e: Enterprise) => 
            e.id === id ? { ...e, ...updatedEnterprise } : e
          
          return {
            enterprises: state.enterprises.map(updateFn),
            myEnterprises: state.myEnterprises.map(updateFn),
            currentEnterprise: state.currentEnterprise?.id === id 
              ? { ...state.currentEnterprise, ...updatedEnterprise }
              : state.currentEnterprise
          }
        })
      },

      removeEnterprise: (id: string) => {
        set(state => ({
          enterprises: state.enterprises.filter(e => e.id !== id),
          myEnterprises: state.myEnterprises.filter(e => e.id !== id),
          currentEnterprise: state.currentEnterprise?.id === id ? null : state.currentEnterprise
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

      // ✅ MÉTODO para inicializar dados mock
      initializeMockData: () => {
        const state = get()
        if (!state.isInitialized || state.enterprises.length === 0) {
          const allMockEnterprises = getAllMockEnterprises()
          console.log('Inicializando enterprises mock:', allMockEnterprises.length, 'enterprises')
          set({ 
            enterprises: allMockEnterprises, 
            isInitialized: true 
          })
        }
      },

      fetchEnterprises: async (filters?: EnterpriseFilters) => {
        set({ isLoading: true })
        try {
          // ✅ CORRIGIDO: Inicializar dados mock se necessário
          const state = get()
          if (!state.isInitialized || state.enterprises.length === 0) {
            state.initializeMockData()
          }
          
          // Mock API delay
          await new Promise(resolve => setTimeout(resolve, 500))
          
          let filteredEnterprises = [...get().enterprises]
          
          // ✅ Se ainda não tem dados, carregar dos mocks
          if (filteredEnterprises.length === 0) {
            filteredEnterprises = getAllMockEnterprises()
            console.log('Carregando enterprises mock diretamente:', filteredEnterprises.length)
          }
          
          if (filters) {
            if (filters.search) {
              const query = filters.search.toLowerCase()
              filteredEnterprises = filteredEnterprises.filter(e => 
                e.name.toLowerCase().includes(query) ||
                e.description.toLowerCase().includes(query) ||
                e.categories.some(cat => cat.toLowerCase().includes(query))
              )
            }
            
            if (filters.category) {
              filteredEnterprises = filteredEnterprises.filter(e => 
                e.categories.includes(filters.category!)
              )
            }
            
            if (filters.verified !== undefined) {
              filteredEnterprises = filteredEnterprises.filter(e => 
                e.verification?.verified === filters.verified
              )
            }
            
            if (filters.tokenized !== undefined) {
              filteredEnterprises = filteredEnterprises.filter(e => 
                e.tokenized === filters.tokenized
              )
            }
            
            if (filters.minRating) {
              filteredEnterprises = filteredEnterprises.filter(e => 
                (e.reputation?.rating || 0) >= filters.minRating!
              )
            }
            
            // Ordenação
            switch (filters.sortBy) {
              case 'rating':
                filteredEnterprises.sort((a, b) => (b.reputation?.rating || 0) - (a.reputation?.rating || 0))
                break
              case 'sales':
                filteredEnterprises.sort((a, b) => (b.reputation?.totalSales || 0) - (a.reputation?.totalSales || 0))
                break
              case 'newest':
                filteredEnterprises.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                break
              default:
                // relevance
                break
            }
          }
          
          // ✅ Se não há filtros, carregar todos os dados
          if (!filters) {
            set({ 
              enterprises: filteredEnterprises, 
              filters: {},
              isInitialized: true 
            })
          } else {
            set({ filters: filters || {} })
          }
          
        } catch (error) {
          console.error('Error fetching enterprises:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      fetchEnterpriseById: async (id: string) => {
        set({ isLoading: true })
        try {
          // ✅ Garantir que dados estão carregados
          const state = get()
          if (!state.isInitialized || state.enterprises.length === 0) {
            state.initializeMockData()
          }
          
          await new Promise(resolve => setTimeout(resolve, 300))
          
          const enterprise = get().enterprises.find(e => e.id === id)
          if (enterprise) {
            set({ currentEnterprise: enterprise })
            console.log('Enterprise encontrado:', enterprise.name, `(${enterprise.id})`)
          } else {
            console.error('Enterprise não encontrado:', id)
            set({ currentEnterprise: null })
          }
        } catch (error) {
          console.error('Error fetching enterprise:', error)
          set({ currentEnterprise: null })
        } finally {
          set({ isLoading: false })
        }
      },

      createEnterprise: async (enterpriseData) => {
        set({ isLoading: true })
        try {
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          const newEnterprise: Enterprise = {
            ...enterpriseData,
            id: `enterprise_${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            stats: {
              totalListings: 0,
              activeListings: 0,
              soldListings: 0,
              totalViews: 0,
              totalRevenue: { BZR: 0, BRL: 0 },
              avgResponseTime: 0
            },
            reputation: {
              rating: 0,
              reviewCount: 0,
              totalSales: 0,
              completionRate: 0
            },
            verification: {
              verified: false,
              documents: []
            }
          }
          
          get().addEnterprise(newEnterprise)
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
        set({ isLoading: true })
        try {
          await new Promise(resolve => setTimeout(resolve, 500))
          
          get().updateEnterprise(id, { 
            tokenized: enabled,
            tokenizable: true
          })
        } catch (error) {
          console.error('Error toggling tokenization:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      updateEnterpriseVerification: async (id: string, verified: boolean) => {
        set({ isLoading: true })
        try {
          await new Promise(resolve => setTimeout(resolve, 500))
          
          get().updateEnterprise(id, { 
            verification: { verified, documents: ['cnpj'] }
          })
        } catch (error) {
          console.error('Error updating verification:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      fetchEconomicData: async (enterpriseId: string) => {
        set({ isLoading: true })
        try {
          await new Promise(resolve => setTimeout(resolve, 300))
          
          // Mock economic data
          const mockData: EnterpriseEconomicData[] = []
          for (let i = 0; i < 12; i++) {
            const date = new Date()
            date.setMonth(date.getMonth() - i)
            mockData.push({
              enterpriseId,
              period: date.toISOString().slice(0, 7), // YYYY-MM
              revenue: Math.floor(Math.random() * 50000) + 20000,
              profit: Math.floor(Math.random() * 8000) + 2000,
              profitMarginPct: Math.random() * 15 + 10,
              holders: Math.floor(Math.random() * 100) + 200,
              tokenPrice: Math.random() * 20 + 40
            })
          }
          
          set(state => ({
            economicData: {
              ...state.economicData,
              [enterpriseId]: mockData
            }
          }))
        } catch (error) {
          console.error('Error fetching economic data:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      updateTokenMetrics: async (enterpriseId: string, metrics: Partial<Enterprise>) => {
        set({ isLoading: true })
        try {
          await new Promise(resolve => setTimeout(resolve, 300))
          
          get().updateEnterprise(enterpriseId, metrics)
        } catch (error) {
          console.error('Error updating token metrics:', error)
        } finally {
          set({ isLoading: false })
        }
      }
    }),
    {
      name: 'enterprise-storage',
      partialize: (state) => ({
        enterprises: state.enterprises,
        myEnterprises: state.myEnterprises,
        filters: state.filters,
        economicData: state.economicData,
        isInitialized: state.isInitialized
      })
    }
  )
)