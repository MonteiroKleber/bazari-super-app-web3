// src/features/marketplace/store/enterpriseStore.ts

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Enterprise, EnterpriseFilters, EnterpriseMetrics } from '../types/enterprise.types'

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
      },

      addEnterprise: (enterprise: Enterprise) => {
        set(state => ({
          enterprises: [enterprise, ...state.enterprises],
          myEnterprises: [enterprise, ...state.myEnterprises]
        }))
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
          // Mock API call - replace with actual API
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Mock data for demonstration
          const mockEnterprises: Enterprise[] = [
            {
              id: 'ent_1',
              ownerId: 'user_1',
              ownerName: 'João Silva',
              name: 'Tech Solutions Pro',
              description: 'Especializada em soluções tecnológicas inovadoras para empresas.',
              categories: ['digital', 'services'],
              subcategories: ['software', 'consulting'],
              tokenizable: true,
              tokenization: {
                enabled: true,
                totalSupply: 10000,
                currentSupply: 2500,
                royaltyPercentage: 5,
                transferable: true,
                mintPrice: 100,
                mintCurrency: 'BZR'
              },
              contact: {
                email: 'contato@techsolutions.com',
                phone: '+55 11 99999-9999',
                website: 'https://techsolutions.com'
              },
              reputation: {
                rating: 4.8,
                reviewCount: 156,
                totalSales: 1200,
                completionRate: 98.5
              },
              verification: {
                verified: true,
                verifiedAt: '2024-01-15T10:00:00.000Z',
                documents: ['cnpj', 'address', 'identity']
              },
              settings: {
                autoAcceptOrders: false,
                minOrderValue: 50,
                acceptedCurrencies: ['BZR', 'BRL'],
                deliveryMethods: ['digital', 'express']
              },
              stats: {
                totalListings: 45,
                activeListings: 32,
                soldListings: 13,
                totalViews: 15420,
                totalRevenue: { BZR: 50000, BRL: 120000 },
                avgResponseTime: 15
              },
              status: 'active',
              createdAt: '2023-06-15T00:00:00.000Z',
              updatedAt: '2024-08-15T12:00:00.000Z'
            }
          ]

          // Apply filters if provided
          let filteredEnterprises = mockEnterprises
          if (filters) {
            if (filters.category) {
              filteredEnterprises = filteredEnterprises.filter(e => 
                e.categories.includes(filters.category!)
              )
            }
            if (filters.verified !== undefined) {
              filteredEnterprises = filteredEnterprises.filter(e => 
                e.verification.verified === filters.verified
              )
            }
            if (filters.search) {
              const query = filters.search.toLowerCase()
              filteredEnterprises = filteredEnterprises.filter(e =>
                e.name.toLowerCase().includes(query) ||
                e.description.toLowerCase().includes(query)
              )
            }
          }

          set({ enterprises: filteredEnterprises })
        } catch (error) {
          console.error('Error fetching enterprises:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      fetchMyEnterprises: async () => {
        set({ isLoading: true })
        try {
          // Mock API call - filter by current user
          await new Promise(resolve => setTimeout(resolve, 500))
          
          const allEnterprises = get().enterprises
          const currentUserId = 'user_1' // Get from auth store in real app
          
          const myEnterprises = allEnterprises.filter(e => e.ownerId === currentUserId)
          set({ myEnterprises })
        } catch (error) {
          console.error('Error fetching my enterprises:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      fetchEnterpriseById: async (id: string) => {
        set({ isLoading: true })
        try {
          await new Promise(resolve => setTimeout(resolve, 300))
          
          const enterprise = get().enterprises.find(e => e.id === id)
          if (enterprise) {
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
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
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
        await get().fetchEnterprises({ search: query })
      },

      toggleEnterpriseTokenization: async (id: string, enabled: boolean) => {
        set({ isLoading: true })
        try {
          await new Promise(resolve => setTimeout(resolve, 500))
          
          const updates: Partial<Enterprise> = {
            tokenization: {
              enabled,
              totalSupply: enabled ? 10000 : undefined,
              currentSupply: enabled ? 0 : undefined,
              royaltyPercentage: enabled ? 5 : undefined,
              transferable: enabled,
              mintPrice: enabled ? 100 : undefined,
              mintCurrency: enabled ? 'BZR' : undefined
            }
          }
          
          get().updateEnterprise(id, updates)
        } catch (error) {
          console.error('Error toggling tokenization:', error)
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      updateEnterpriseVerification: async (id: string, verified: boolean) => {
        set({ isLoading: true })
        try {
          await new Promise(resolve => setTimeout(resolve, 300))
          
          const updates: Partial<Enterprise> = {
            verification: {
              verified,
              verifiedAt: verified ? new Date().toISOString() : undefined,
              documents: verified ? ['cnpj', 'address', 'identity'] : []
            }
          }
          
          get().updateEnterprise(id, updates)
        } catch (error) {
          console.error('Error updating verification:', error)
          throw error
        } finally {
          set({ isLoading: false })
        }
      }
    }),
    {
      name: 'bazari-enterprise-store',
      partialize: (state) => ({
        enterprises: state.enterprises,
        myEnterprises: state.myEnterprises,
        filters: state.filters
      })
    }
  )
)