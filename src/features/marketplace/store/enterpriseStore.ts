// src/features/marketplace/store/enterpriseStore.ts

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Enterprise, EnterpriseFilters, EnterpriseMetrics, EnterpriseEconomicData } from '../types/enterprise.types'
import { mockEnterprises } from '@app/data/mockMarketplaceData'

interface EnterpriseState {
  enterprises: Enterprise[]
  myEnterprises: Enterprise[]
  currentEnterprise: Enterprise | null
  filters: EnterpriseFilters
  isLoading: boolean
  metrics: EnterpriseMetrics | null
  
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

      setEnterprises: (enterprises: Enterprise[]) => {
        set({ enterprises })
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

      fetchEnterprises: async (filters?: EnterpriseFilters) => {
        set({ isLoading: true })
        try {
          // Mock API call
          await new Promise(resolve => setTimeout(resolve, 500))
          
          let filteredEnterprises = [...mockEnterprises]
          
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
            
            if (filters.tokenizable !== undefined) {
              filteredEnterprises = filteredEnterprises.filter(e => 
                e.tokenizable === filters.tokenizable
              )
            }
            
            // ✅ NOVO: filtro por tokenizado
            if (filters.tokenized !== undefined) {
              filteredEnterprises = filteredEnterprises.filter(e => 
                (e.tokenizable && e.tokenization?.enabled) === filters.tokenized
              )
            }
            
            if (filters.verified !== undefined) {
              filteredEnterprises = filteredEnterprises.filter(e => 
                e.verification.verified === filters.verified
              )
            }
            
            if (filters.minRating) {
              filteredEnterprises = filteredEnterprises.filter(e => 
                e.reputation.rating >= filters.minRating!
              )
            }
            
            // Ordenação
            switch (filters.sortBy) {
              case 'rating':
                filteredEnterprises.sort((a, b) => b.reputation.rating - a.reputation.rating)
                break
              case 'sales':
                filteredEnterprises.sort((a, b) => b.reputation.totalSales - a.reputation.totalSales)
                break
              case 'newest':
                filteredEnterprises.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                break
              default:
                // relevance - manter ordem original
                break
            }
          }
          
          set({ enterprises: filteredEnterprises, filters: filters || {} })
        } catch (error) {
          console.error('Error fetching enterprises:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      fetchEnterpriseById: async (id: string) => {
        set({ isLoading: true })
        try {
          await new Promise(resolve => setTimeout(resolve, 300))
          
          const enterprise = get().enterprises.find(e => e.id === id) || 
                           mockEnterprises.find(e => e.id === id)
          
          if (enterprise) {
            set({ currentEnterprise: enterprise })
            
            // Se não estava na lista, adicionar
            if (!get().enterprises.find(e => e.id === id)) {
              get().addOrMerge(enterprise)
            }
          } else {
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
          await new Promise(resolve => setTimeout(resolve, 800))
          
          const newEnterprise: Enterprise = {
            ...enterpriseData,
            id: `enterprise_${Date.now()}`,
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
            },
            tokenized: enabled // ✅ Atualizar campo alias também
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
      },

      // ✅ NOVOS MÉTODOS

      fetchEconomicData: async (enterpriseId: string) => {
        try {
          await new Promise(resolve => setTimeout(resolve, 200))
          
          // Mock data - últimos 12 meses
          const months = 12
          const mockData: EnterpriseEconomicData[] = []
          const baseRevenue = 10000
          
          for (let i = months - 1; i >= 0; i--) {
            const date = new Date()
            date.setMonth(date.getMonth() - i)
            
            const growth = Math.random() * 0.3 + 0.85 // 85% a 115% do mês anterior
            const revenue = Math.round(baseRevenue * (1 + i * 0.1) * growth)
            const profitMargin = Math.random() * 10 + 5 // 5% a 15%
            const profit = Math.round(revenue * (profitMargin / 100))
            
            mockData.push({
              enterpriseId,
              period: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
              revenue,
              profit,
              profitMarginPct: profitMargin,
              holders: Math.round(50 + i * 5 + Math.random() * 10),
              tokenPrice: 100 + Math.random() * 50,
              dividendsPaid: Math.round(profit * 0.3) // 30% do lucro como dividendos
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
        }
      },

      updateTokenMetrics: async (enterpriseId: string, metrics: Partial<Enterprise>) => {
        try {
          await new Promise(resolve => setTimeout(resolve, 200))
          
          get().updateEnterprise(enterpriseId, metrics)
        } catch (error) {
          console.error('Error updating token metrics:', error)
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
        metrics: state.metrics,
        economicData: state.economicData
      })
    }
  )
)