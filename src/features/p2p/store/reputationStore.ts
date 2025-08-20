
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface UserReputation {
  score: number                    // 0-5 estrelas
  completed: number               // Trades completados
  cancelRatePct: number          // % de cancelamentos
  lastUpdated: number            // Timestamp da última atualização
  level?: 'new' | 'trusted' | 'pro'
  badges?: string[]              // Badges conquistados
  reviews?: UserReview[]         // Reviews recebidos
}

export interface UserReview {
  id: string
  fromUserId: string
  fromUserName: string
  tradeId: string
  rating: number                 // 1-5 estrelas
  comment?: string
  createdAt: number
  type: 'positive' | 'neutral' | 'negative'
}

interface ReputationState {
  // State
  scores: Record<string, UserReputation>
  loading: boolean
  error?: string
  
  // Actions
  fetchUserReputation: (userId: string) => Promise<UserReputation>
  rate: (userId: string, deltaScore: number, completedInc: number, cancelled?: boolean) => void
  addReview: (userId: string, review: Omit<UserReview, 'id' | 'createdAt'>) => void
  calculateLevel: (reputation: UserReputation) => 'new' | 'trusted' | 'pro'
  
  // Getters
  getUserReputation: (userId: string) => UserReputation | undefined
  getUserLevel: (userId: string) => 'new' | 'trusted' | 'pro'
  getTopTraders: (limit?: number) => Array<{ userId: string; reputation: UserReputation }>
}

export const useReputationStore = create<ReputationState>()(
  persist(
    (set, get) => ({
      // Initial state
      scores: {},
      loading: false,
      error: undefined,

      // Actions
      fetchUserReputation: async (userId) => {
        const existing = get().scores[userId]
        if (existing && Date.now() - existing.lastUpdated < 300000) { // 5min cache
          return existing
        }

        set({ loading: true, error: undefined })
        
        try {
          // Mock - em produção, buscar da API/blockchain
          await new Promise(resolve => setTimeout(resolve, 200))
          
          const mockReputation: UserReputation = {
            score: 3.8 + Math.random() * 1.2,
            completed: Math.floor(Math.random() * 100),
            cancelRatePct: Math.random() * 15,
            lastUpdated: Date.now(),
            badges: Math.random() > 0.7 ? ['verified', 'fast_trader'] : undefined,
            reviews: []
          }
          
          mockReputation.level = get().calculateLevel(mockReputation)
          
          set(state => ({
            scores: {
              ...state.scores,
              [userId]: mockReputation
            },
            loading: false
          }))
          
          return mockReputation
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro ao buscar reputação'
          set({ loading: false, error: message })
          throw error
        }
      },

      rate: (userId, deltaScore, completedInc, cancelled = false) => {
        set(state => {
          const current = state.scores[userId] || {
            score: 5.0,
            completed: 0,
            cancelRatePct: 0,
            lastUpdated: Date.now(),
            reviews: []
          }
          
          // Calcular nova pontuação (média ponderada)
          const totalTrades = current.completed + completedInc
          const newScore = totalTrades > 0 
            ? ((current.score * current.completed) + deltaScore) / totalTrades
            : deltaScore
          
          // Calcular nova taxa de cancelamento
          const totalCancellations = Math.round((current.cancelRatePct / 100) * current.completed) + (cancelled ? 1 : 0)
          const newCancelRate = totalTrades > 0 ? (totalCancellations / totalTrades) * 100 : 0
          
          const updated: UserReputation = {
            ...current,
            score: Math.max(0, Math.min(5, newScore)),
            completed: totalTrades,
            cancelRatePct: newCancelRate,
            lastUpdated: Date.now()
          }
          
          updated.level = get().calculateLevel(updated)
          
          return {
            scores: {
              ...state.scores,
              [userId]: updated
            }
          }
        })
      },

      addReview: (userId, reviewData) => {
        set(state => {
          const current = state.scores[userId] || {
            score: 5.0,
            completed: 0,
            cancelRatePct: 0,
            lastUpdated: Date.now(),
            reviews: []
          }
          
          const review: UserReview = {
            ...reviewData,
            id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: Date.now(),
            type: reviewData.rating >= 4 ? 'positive' : reviewData.rating >= 3 ? 'neutral' : 'negative'
          }
          
          const updated: UserReputation = {
            ...current,
            reviews: [...(current.reviews || []), review],
            lastUpdated: Date.now()
          }
          
          return {
            scores: {
              ...state.scores,
              [userId]: updated
            }
          }
        })
      },

      calculateLevel: (reputation) => {
        const { score, completed, cancelRatePct } = reputation
        
        if (completed >= 50 && score >= 4.5 && cancelRatePct <= 5) {
          return 'pro'
        } else if (completed >= 10 && score >= 4.0 && cancelRatePct <= 10) {
          return 'trusted'
        } else {
          return 'new'
        }
      },

      // Getters
      getUserReputation: (userId) => {
        return get().scores[userId]
      },

      getUserLevel: (userId) => {
        const reputation = get().scores[userId]
        return reputation?.level || 'new'
      },

      getTopTraders: (limit = 10) => {
        const { scores } = get()
        
        return Object.entries(scores)
          .map(([userId, reputation]) => ({ userId, reputation }))
          .filter(({ reputation }) => reputation.completed >= 5)
          .sort((a, b) => {
            // Ordenar por score, depois por trades completados
            if (a.reputation.score !== b.reputation.score) {
              return b.reputation.score - a.reputation.score
            }
            return b.reputation.completed - a.reputation.completed
          })
          .slice(0, limit)
      }
    }),
    {
      name: 'bazari-p2p-reputation',
      partialize: (state) => ({
        scores: state.scores
      })
    }
  )
)