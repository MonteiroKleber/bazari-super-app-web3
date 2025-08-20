// ==========================================
// src/features/p2p/store/reputationStore.ts - COMPLETO
// ==========================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { 
  UserReputation, 
  UserReview, 
  ReputationBadge, 
  ReputationLevel 
} from '../types/p2p.types'

interface ReputationState {
  userReputations: Record<string, UserReputation>
  myReputation: UserReputation | null
  loading: boolean
  error: string | null
  initialized: boolean
}

interface ReputationActions {
  // Core
  fetchUserReputation: (userId: string) => Promise<UserReputation | null>
  fetchMyReputation: () => Promise<void>
  updateUserReputation: (userId: string, updates: Partial<UserReputation>) => void
  
  // Reviews
  addReview: (tradeId: string, toUserId: string, rating: number, comment?: string) => Promise<void>
  fetchUserReviews: (userId: string) => Promise<UserReview[]>
  
  // Badges
  awardBadge: (userId: string, badge: ReputationBadge) => Promise<void>
  
  // Getters
  getUserReputation: (userId: string) => UserReputation | null
  getReputationLevel: (score: number) => ReputationLevel
  getReputationColor: (level: ReputationLevel) => string
  getReputationLabel: (level: ReputationLevel) => string
  
  // Utilitários
  calculateReputationScore: (reviews: UserReview[]) => number
  resetStore: () => void
}

// Mock data para desenvolvimento
const generateMockReputation = (userId: string): UserReputation => {
  const scores = [4.2, 4.5, 4.8, 3.9, 4.7, 4.1, 4.9, 4.3]
  const score = scores[Math.floor(Math.random() * scores.length)]
  
  const totalTrades = Math.floor(10 + Math.random() * 100)
  const successRate = 85 + Math.random() * 14 // 85-99%
  const avgReleaseTime = 300 + Math.random() * 900 // 5-20 minutes
  
  const getLevel = (score: number): ReputationLevel => {
    if (score >= 4.7) return 'trusted'
    if (score >= 4.3) return 'pro'
    if (score >= 4.0) return 'regular'
    return 'new'
  }
  
  const mockReviews: UserReview[] = Array.from({ length: Math.min(totalTrades, 10) }, (_, i) => ({
    id: `review_${userId}_${i}`,
    fromUserId: `user_${Math.floor(Math.random() * 100)}`,
    fromUserName: `Usuário ${Math.floor(Math.random() * 100)}`,
    tradeId: `trade_${Date.now()}_${i}`,
    rating: Math.floor(3 + Math.random() * 3), // 3-5
    comment: Math.random() > 0.5 ? 'Transação rápida e segura.' : undefined,
    createdAt: Date.now() - (i * 24 * 60 * 60 * 1000),
    type: score >= 4 ? 'positive' : score >= 3 ? 'neutral' : 'negative'
  }))
  
  const mockBadges: ReputationBadge[] = []
  if (totalTrades >= 50) {
    mockBadges.push({
      id: 'veteran',
      name: 'Veterano',
      description: '50+ negociações completadas',
      icon: '🏆',
      color: 'gold',
      earnedAt: Date.now() - (30 * 24 * 60 * 60 * 1000)
    })
  }
  if (score >= 4.8) {
    mockBadges.push({
      id: 'trusted_trader',
      name: 'Negociador Confiável',
      description: 'Reputação acima de 4.8',
      icon: '⭐',
      color: 'blue',
      earnedAt: Date.now() - (15 * 24 * 60 * 60 * 1000)
    })
  }
  
  return {
    userId,
    score: Number(score.toFixed(1)),
    level: getLevel(score),
    totalTrades,
    successRate: Number(successRate.toFixed(1)),
    avgReleaseTime: Number(avgReleaseTime.toFixed(0)),
    reviews: mockReviews,
    badges: mockBadges
  }
}

const initialState: ReputationState = {
  userReputations: {},
  myReputation: null,
  loading: false,
  error: null,
  initialized: false
}

export const useReputationStore = create<ReputationState & ReputationActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      fetchUserReputation: async (userId) => {
        set({ loading: true, error: null })
        try {
          console.log('🏪 ReputationStore: Buscando reputação do usuário:', userId)
          
          // Verificar cache local primeiro
          const cached = get().userReputations[userId]
          if (cached) {
            console.log('📋 ReputationStore: Reputação encontrada no cache')
            set({ loading: false })
            return cached
          }
          
          // Simular delay de API
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // Gerar dados mock
          const reputation = generateMockReputation(userId)
          
          set(state => ({
            userReputations: {
              ...state.userReputations,
              [userId]: reputation
            },
            loading: false,
            initialized: true
          }))
          
          console.log('✅ ReputationStore: Reputação carregada:', reputation.score)
          return reputation
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro ao buscar reputação'
          set({ 
            error: message,
            loading: false
          })
          console.error('❌ ReputationStore: Erro ao buscar reputação:', error)
          return null
        }
      },

      fetchMyReputation: async () => {
        set({ loading: true, error: null })
        try {
          console.log('🏪 ReputationStore: Buscando minha reputação')
          
          // Em produção, pegar userId do authStore
          const userId = 'user_123' // Mock
          
          const reputation = await get().fetchUserReputation(userId)
          
          set({ 
            myReputation: reputation,
            loading: false
          })
          
          console.log('✅ ReputationStore: Minha reputação carregada')
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro ao buscar sua reputação'
          set({ 
            error: message,
            loading: false
          })
          console.error('❌ ReputationStore: Erro ao buscar minha reputação:', error)
        }
      },

      updateUserReputation: (userId, updates) => {
        console.log('🏪 ReputationStore: Atualizando reputação:', userId, updates)
        
        set(state => ({
          userReputations: {
            ...state.userReputations,
            [userId]: {
              ...state.userReputations[userId],
              ...updates
            }
          }
        }))
        
        // Se for minha reputação, atualizar também
        const { myReputation } = get()
        if (myReputation?.userId === userId) {
          set({ 
            myReputation: { ...myReputation, ...updates }
          })
        }
      },

      addReview: async (tradeId, toUserId, rating, comment) => {
        set({ loading: true, error: null })
        try {
          console.log('🏪 ReputationStore: Adicionando review:', { tradeId, toUserId, rating })
          
          // Simular delay de API
          await new Promise(resolve => setTimeout(resolve, 300))
          
          const newReview: UserReview = {
            id: `review_${Date.now()}`,
            fromUserId: 'user_123', // Em produção, pegar do authStore
            fromUserName: 'Meu Nome', // Em produção, pegar do authStore
            tradeId,
            rating,
            comment,
            createdAt: Date.now(),
            type: rating >= 4 ? 'positive' : rating >= 3 ? 'neutral' : 'negative'
          }
          
          // Atualizar reputação do usuário
          const userReputation = get().userReputations[toUserId]
          if (userReputation) {
            const updatedReviews = [newReview, ...userReputation.reviews]
            const newScore = get().calculateReputationScore(updatedReviews)
            const newLevel = get().getReputationLevel(newScore)
            
            get().updateUserReputation(toUserId, {
              reviews: updatedReviews,
              score: newScore,
              level: newLevel,
              totalTrades: userReputation.totalTrades + 1
            })
          }
          
          set({ loading: false })
          console.log('✅ ReputationStore: Review adicionado com sucesso')
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro ao adicionar avaliação'
          set({ 
            error: message,
            loading: false 
          })
          console.error('❌ ReputationStore: Erro ao adicionar review:', error)
          throw error
        }
      },

      fetchUserReviews: async (userId) => {
        try {
          console.log('🏪 ReputationStore: Buscando reviews do usuário:', userId)
          
          const reputation = await get().fetchUserReputation(userId)
          return reputation?.reviews || []
        } catch (error) {
          console.error('❌ ReputationStore: Erro ao buscar reviews:', error)
          return []
        }
      },

      awardBadge: async (userId, badge) => {
        set({ loading: true, error: null })
        try {
          console.log('🏪 ReputationStore: Concedendo badge:', badge.name, 'para', userId)
          
          // Simular delay de API
          await new Promise(resolve => setTimeout(resolve, 200))
          
          const userReputation = get().userReputations[userId]
          if (userReputation) {
            const updatedBadges = [...userReputation.badges, badge]
            
            get().updateUserReputation(userId, {
              badges: updatedBadges
            })
          }
          
          set({ loading: false })
          console.log('✅ ReputationStore: Badge concedido com sucesso')
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro ao conceder badge'
          set({ 
            error: message,
            loading: false 
          })
          console.error('❌ ReputationStore: Erro ao conceder badge:', error)
          throw error
        }
      },

      // Getters
      getUserReputation: (userId) => {
        return get().userReputations[userId] || null
      },

      getReputationLevel: (score) => {
        if (score >= 4.7) return 'trusted'
        if (score >= 4.3) return 'pro'
        if (score >= 4.0) return 'regular'
        return 'new'
      },

      getReputationColor: (level) => {
        switch (level) {
          case 'trusted': return 'text-green-600 bg-green-50 border-green-200'
          case 'pro': return 'text-blue-600 bg-blue-50 border-blue-200'
          case 'regular': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
          case 'new': return 'text-gray-600 bg-gray-50 border-gray-200'
          default: return 'text-gray-600 bg-gray-50 border-gray-200'
        }
      },

      getReputationLabel: (level) => {
        switch (level) {
          case 'trusted': return 'Confiável'
          case 'pro': return 'Profissional'
          case 'regular': return 'Regular'
          case 'new': return 'Novo'
          default: return 'Desconhecido'
        }
      },

      // Utilitários
      calculateReputationScore: (reviews) => {
        if (reviews.length === 0) return 0
        
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
        const avgRating = totalRating / reviews.length
        
        // Aplicar peso baseado no número de reviews
        const weightFactor = Math.min(reviews.length / 10, 1) // Max weight at 10+ reviews
        const baseScore = 3.0 // Base score for new users
        
        return Number((baseScore + (avgRating - baseScore) * weightFactor).toFixed(1))
      },

      resetStore: () => {
        console.log('🏪 ReputationStore: Resetando store')
        set(initialState)
      }
    }),
    {
      name: 'bazari-p2p-reputation',
      partialize: (state) => ({
        // Cachear reputações por tempo limitado
        userReputations: state.userReputations,
        myReputation: state.myReputation
      })
    }
  )
)