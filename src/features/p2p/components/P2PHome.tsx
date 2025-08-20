// src/features/p2p/components/P2PHome.tsx

import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { 
  ArrowUpDown, 
  Shield, 
  Zap, 
  TrendingUp, 
  Users, 
  CreditCard,
  Clock,
  Star,
  ChevronRight,
  Plus
} from 'lucide-react'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { Badge } from '@shared/ui/Badge'
import { Avatar } from '@shared/ui/Avatar'
import { useI18n } from '@app/providers/I18nProvider'
import { useAuthStore } from '@features/auth/store/authStore'
import { useOffersStore } from '../store/offersStore'
import { useTradesStore } from '../store/tradesStore'
import { buildProfileRoute } from '../utils/profileRoute'
// Removed external import - using local function

export const P2PHome: React.FC = () => {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { offers, fetchOffers } = useOffersStore()
  const { getActiveTradesCount } = useTradesStore()

  // Local utility function
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  useEffect(() => {
    // Buscar ofertas em destaque
    fetchOffers({ side: 'SELL' }).catch(console.error)
  }, [fetchOffers])

  // Stats mockados
  const stats = {
    totalVolume: 2450000,
    activeTraders: 1247,
    avgPrice: 5.12,
    dailyTrades: 156
  }

  // Ofertas em destaque (confiáveis)
  const featuredOffers = offers
    .filter(offer => 
      offer.reputation?.level === 'trusted' || offer.reputation?.level === 'pro'
    )
    .slice(0, 3)

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-matte-black-900 mb-4">
          {t('p2p.title')}
        </h1>
        <p className="text-lg text-matte-black-600 max-w-2xl mx-auto">
          {t('p2p.subtitle')}
        </p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <Link to="/p2p/offers?side=SELL">
          <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer group">
            <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-success-200 transition-colors">
              <CreditCard className="h-6 w-6 text-success" />
              {/* Test Flow - Only in development */}
      {process.env.NODE_ENV === 'development' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6 bg-yellow-50 border-yellow-200">
            <h3 className="text-lg font-semibold text-yellow-800 mb-4">
              🚧 Desenvolvimento - Testar TradeRoom
            </h3>
            
            <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
              <div>
                <strong>Ofertas:</strong> {offers.length}
              </div>
              <div>
                <strong>Trades Ativos:</strong> {getActiveTradesCount()}
              </div>
              <div>
                <strong>Usuário:</strong> {user?.name || 'N/A'}
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={async () => {
                  try {
                    // Simular navegação direta para trade inexistente
                    navigate('/p2p/trade/test_trade_123')
                  } catch (error) {
                    console.error('Navigation error:', error)
                  }
                }}
                size="sm"
                className="w-full"
              >
                Ir para TradeRoom (ID inexistente)
              </Button>

              <Button 
                onClick={() => {
                  // Navegar para ofertas
                  navigate('/p2p/offers')
                }}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Ver Ofertas (criar trade real)
              </Button>
            </div>

            <div className="mt-4 p-3 bg-white rounded text-xs">
              <strong>Debug:</strong> A TradeRoom agora tem melhor tratamento de estados vazios 
              e criará automaticamente um trade mock se necessário.
            </div>
          </Card>
        </motion.div>
      )}
    </div>
            <h3 className="text-lg font-semibold text-matte-black-900 mb-2">
              {t('p2p.actions.buyWithPix')}
            </h3>
            <p className="text-sm text-matte-black-600">
              {t('p2p.actions.buyWithPixDesc')}
            </p>
          </Card>
        </Link>

        <Link to="/p2p/offers/new">
          <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer group">
            <div className="w-12 h-12 bg-bazari-red-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-bazari-red-200 transition-colors">
              <Plus className="h-6 w-6 text-bazari-red" />
            </div>
            <h3 className="text-lg font-semibold text-matte-black-900 mb-2">
              {t('p2p.actions.sellNow')}
            </h3>
            <p className="text-sm text-matte-black-600">
              {t('p2p.actions.sellNowDesc')}
            </p>
          </Card>
        </Link>

        <Link to="/p2p/my-trades">
          <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer group">
            <div className="w-12 h-12 bg-bazari-gold-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-bazari-gold-200 transition-colors">
              <ArrowUpDown className="h-6 w-6 text-bazari-gold-600" />
            </div>
            <h3 className="text-lg font-semibold text-matte-black-900 mb-2">
              {t('p2p.actions.myTrades')}
            </h3>
            <p className="text-sm text-matte-black-600">
              {getActiveTradesCount()} {t('p2p.actions.activeTrades')}
            </p>
          </Card>
        </Link>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-matte-black-900 mb-6">
            {t('p2p.stats.title')}
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-bazari-red mb-1">
                {formatCurrency(stats.totalVolume)}
              </div>
              <div className="text-sm text-matte-black-600">
                {t('p2p.stats.totalVolume')}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-success mb-1">
                {stats.activeTraders.toLocaleString()}
              </div>
              <div className="text-sm text-matte-black-600">
                {t('p2p.stats.activeTraders')}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-bazari-gold-600 mb-1">
                R$ {stats.avgPrice.toFixed(2)}
              </div>
              <div className="text-sm text-matte-black-600">
                {t('p2p.stats.avgPrice')}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-info mb-1">
                {stats.dailyTrades}
              </div>
              <div className="text-sm text-matte-black-600">
                {t('p2p.stats.dailyTrades')}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Featured Offers */}
      {featuredOffers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-matte-black-900">
              {t('p2p.featured.title')}
            </h2>
            <Link to="/p2p/offers">
              <Button variant="outline" size="sm">
                {t('p2p.featured.viewAll')}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredOffers.map((offer) => (
              <Card key={offer.id} className="p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <Badge 
                    variant={offer.side === 'BUY' ? 'success' : 'secondary'}
                    className="text-xs"
                  >
                    {t(`p2p.side.${offer.side.toLowerCase()}`)}
                  </Badge>
                  
                  {offer.reputation && (
                    <div className="flex items-center text-xs text-matte-black-600">
                      <Star className="h-3 w-3 text-bazari-gold-600 fill-current mr-1" />
                      {offer.reputation.score.toFixed(1)}
                    </div>
                  )}
                </div>

                <div className="text-lg font-semibold text-matte-black-900 mb-2">
                  R$ {offer.priceBZR.toFixed(2)} / BZR
                </div>

                <div className="text-sm text-matte-black-600 mb-3">
                  {t('p2p.offer.limits')}: {offer.minAmount} - {offer.maxAmount} BZR
                </div>

                <div className="flex items-center justify-between">
                  <Link
                    to={buildProfileRoute(offer.ownerId)}
                    className="flex items-center text-sm text-matte-black-700 hover:text-bazari-red transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Avatar 
                      src={offer.ownerAvatarUrl} 
                      fallback={offer.ownerName}
                      size="sm"
                      className="mr-2"
                    />
                    {offer.ownerName}
                  </Link>

                  <Link to={`/p2p/offers/${offer.id}`}>
                    <Button size="sm">
                      {t('p2p.offer.startTrade')}
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Security Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-6 bg-info-50 border-info-200">
          <div className="flex items-start">
            <Shield className="h-6 w-6 text-info mr-3 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-matte-black-900 mb-2">
                {t('p2p.security.title')}
              </h3>
              <ul className="space-y-1 text-sm text-matte-black-700">
                <li>• {t('p2p.security.tip1')}</li>
                <li>• {t('p2p.security.tip2')}</li>
                <li>• {t('p2p.security.tip3')}</li>
                <li>• {t('p2p.security.tip4')}</li>
              </ul>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}