import React from 'react'
import { motion } from 'framer-motion'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { MessageCircle, Star, Shield, Calendar, Award, TrendingUp } from 'lucide-react'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { Badge } from '@shared/ui/Badge'
import { Avatar } from '@shared/ui/Avatar'
import { Tabs } from '@shared/ui/Tabs'
import { useI18n } from '@app/providers/I18nProvider'
import { useAuthStore } from '@features/auth/store/authStore'

interface ProfileViewProps {
  profileId: string
}

export const ProfileView: React.FC<ProfileViewProps> = ({ profileId }) => {
  const navigate = useNavigate()
  const { t } = useI18n()
  const { user } = useAuthStore()
  const [searchParams] = useSearchParams()
  
  const fromContext = searchParams.get('from') // 'marketplace', 'p2p', etc.
  const adId = searchParams.get('ad') || searchParams.get('listing')

  // Mock profile data - in real app, fetch from API
  const profile = {
    id: profileId,
    name: 'Maria Silva',
    avatar: undefined,
    joinedAt: '2023-06-15T00:00:00.000Z',
    lastActive: '2024-08-15T12:30:00.000Z',
    reputation: {
      rating: 4.7,
      reviewCount: 38,
      badges: ['verified', 'trusted_seller', 'fast_responder']
    },
    stats: {
      totalTrades: 156,
      completionRate: 98.5,
      avgResponseTime: '2 min',
      totalVolume: 450000
    },
    listings: {
      active: 12,
      sold: 89,
      categories: ['Electronics', 'Fashion', 'Digital']
    },
    bio: 'Vendedora experiente no marketplace. Especializada em eletrônicos e produtos digitais. Resposta rápida garantida!',
    preferences: {
      languages: ['pt', 'en'],
      timezone: 'America/Sao_Paulo',
      notifications: true
    }
  }

  const handleStartChat = () => {
    const chatUrl = fromContext && adId 
      ? `/chat/${profileId}?context=${fromContext}&ad=${adId}`
      : `/chat/${profileId}`
    navigate(chatUrl)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const badgeConfig = {
    verified: { label: 'Verificado', color: 'success' as const, icon: Shield },
    trusted_seller: { label: 'Vendedor Confiável', color: 'primary' as const, icon: Star },
    fast_responder: { label: 'Resposta Rápida', color: 'secondary' as const, icon: TrendingUp }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Card className="p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            <Avatar 
              src={profile.avatar} 
              fallback={profile.name}
              size="xl"
              className="w-24 h-24"
            />
            
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <h1 className="text-3xl font-bold text-matte-black-900">
                  {profile.name}
                </h1>
                
                {/* Badges */}
                <div className="flex space-x-2">
                  {profile.reputation.badges.map((badge) => {
                    const config = badgeConfig[badge as keyof typeof badgeConfig]
                    if (!config) return null
                    
                    return (
                      <Badge key={badge} variant={config.color} size="sm">
                        <config.icon size={12} className="mr-1" />
                        {config.label}
                      </Badge>
                    )
                  })}
                </div>
              </div>
              
              {/* Reputation */}
              <div className="flex items-center space-x-6 mb-4">
                <div className="flex items-center">
                  <div className="flex items-center mr-2">
                    {[1,2,3,4,5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className={`${
                          star <= Math.round(profile.reputation.rating)
                            ? 'text-bazari-gold-600 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-matte-black-900">
                    {profile.reputation.rating.toFixed(1)}
                  </span>
                  <span className="text-sm text-matte-black-600 ml-1">
                    ({profile.reputation.reviewCount} {t('dashboard.reputation.reviews')})
                  </span>
                </div>
                
                <div className="flex items-center text-sm text-matte-black-600">
                  <Calendar size={14} className="mr-1" />
                  Membro desde {formatDate(profile.joinedAt)}
                </div>
              </div>
              
              {/* Bio */}
              {profile.bio && (
                <p className="text-matte-black-700 mb-6 max-w-2xl">
                  {profile.bio}
                </p>
              )}
              
              {/* Actions */}
              <div className="flex space-x-3">
                <Button onClick={handleStartChat}>
                  <MessageCircle size={16} className="mr-2" />
                  {t('profile.chat')}
                </Button>
                
                <Button variant="outline">
                  Ver Anúncios
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-bazari-red mb-1">
            {profile.stats.totalTrades}
          </p>
          <p className="text-sm text-matte-black-600">
            Negociações
          </p>
        </Card>
        
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-success mb-1">
            {profile.stats.completionRate}%
          </p>
          <p className="text-sm text-matte-black-600">
            Taxa de Sucesso
          </p>
        </Card>
        
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-bazari-gold-600 mb-1">
            {profile.stats.avgResponseTime}
          </p>
          <p className="text-sm text-matte-black-600">
            Tempo Resposta
          </p>
        </Card>
        
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-matte-black-900 mb-1">
            {formatCurrency(profile.stats.totalVolume)}
          </p>
          <p className="text-sm text-matte-black-600">
            Volume Total
          </p>
        </Card>
      </motion.div>

      {/* Detailed Sections */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs defaultValue="reviews">
          <Tabs.List className="mb-6">
            <Tabs.Trigger value="reviews">
              Avaliações ({profile.reputation.reviewCount})
            </Tabs.Trigger>
            <Tabs.Trigger value="listings">
              Anúncios ({profile.listings.active})
            </Tabs.Trigger>
            <Tabs.Trigger value="activity">
              Atividades
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="reviews">
            <Card className="p-6">
              <div className="space-y-6">
                {/* Mock reviews */}
                {[
                  {
                    id: '1',
                    reviewer: 'João Santos',
                    rating: 5,
                    comment: 'Excelente vendedor! Produto conforme descrito e entrega rápida.',
                    date: '2024-08-10',
                    context: 'Compra de iPhone 14'
                  },
                  {
                    id: '2', 
                    reviewer: 'Ana Costa',
                    rating: 5,
                    comment: 'Muito confiável. Comunicação clara durante todo o processo.',
                    date: '2024-08-05',
                    context: 'Troca P2P BZR/BRL'
                  },
                  {
                    id: '3',
                    reviewer: 'Carlos Silva',
                    rating: 4,
                    comment: 'Boa experiência. Produto em bom estado.',
                    date: '2024-07-28',
                    context: 'Compra de curso online'
                  }
                ].map((review) => (
                  <div key={review.id} className="border-b border-sand-200 last:border-b-0 pb-6 last:pb-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Avatar size="sm" fallback={review.reviewer} />
                        <div>
                          <p className="font-medium text-matte-black-900">
                            {review.reviewer}
                          </p>
                          <div className="flex items-center">
                            {[1,2,3,4,5].map((star) => (
                              <Star
                                key={star}
                                size={12}
                                className={`${
                                  star <= review.rating
                                    ? 'text-bazari-gold-600 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm text-matte-black-500">
                          {new Date(review.date).toLocaleDateString('pt-BR')}
                        </p>
                        <Badge variant="neutral" size="sm">
                          {review.context}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-matte-black-700">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </Tabs.Content>

          <Tabs.Content value="listings">
            <Card className="p-6">
              <p className="text-matte-black-600 text-center py-8">
                Lista de anúncios ativos apareceria aqui
              </p>
            </Card>
          </Tabs.Content>

          <Tabs.Content value="activity">
            <Card className="p-6">
              <p className="text-matte-black-600 text-center py-8">
                Atividades recentes apareceriam aqui
              </p>
            </Card>
          </Tabs.Content>
        </Tabs>
      </motion.div>
    </div>
  )
}
