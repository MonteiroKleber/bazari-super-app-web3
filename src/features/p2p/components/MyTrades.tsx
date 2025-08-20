// src/features/p2p/components/MyTrades.tsx

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Shield,
  Eye,
  MessageCircle,
  RefreshCw
} from 'lucide-react'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { Input } from '@shared/ui/Input'
import { Badge } from '@shared/ui/Badge'
import { Tabs } from '@shared/ui/Tabs'
import { LoadingSpinner } from '@shared/ui/LoadingSpinner'
import { EmptyState } from '@shared/ui/EmptyState'
import { useI18n } from '@app/providers/I18nProvider'
import { useAuthStore } from '@features/auth/store/authStore'
import { useTradesStore } from '../store/tradesStore'
import { useOffersStore } from '../store/offersStore'
import { buildProfileRoute } from '../utils/profileRoute'
import { getPaymentMethodInfo } from '../services/payments'
import type { P2PTrade } from '../types/p2p.types'

export const MyTrades: React.FC = () => {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { trades, fetchTrades, createTrade } = useTradesStore()
  const { offers } = useOffersStore()

  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | P2PTrade['status']>('all')

  useEffect(() => {
    const loadTrades = async () => {
      try {
        await fetchTrades()
      } catch (error) {
        console.error('Failed to fetch trades:', error)
      } finally {
        setLoading(false)
      }
    }

    loadTrades()
  }, [fetchTrades])

  // Create mock trades if none exist (for development)
  const createMockTrades = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // Create a few mock trades with different statuses
      const mockTrades = [
        {
          offerId: 'mock_offer_1',
          buyerId: user.id,
          sellerId: 'seller_123',
          amountBZR: '50.00',
          paymentMethod: 'PIX' as const,
          priceBZR: 5.12
        },
        {
          offerId: 'mock_offer_2', 
          buyerId: 'buyer_456',
          sellerId: user.id,
          amountBZR: '200.00',
          paymentMethod: 'TED' as const,
          priceBZR: 5.05
        },
        {
          offerId: 'mock_offer_3',
          buyerId: user.id,
          sellerId: 'seller_789',
          amountBZR: '100.00',
          paymentMethod: 'PIX' as const,
          priceBZR: 5.20
        }
      ]

      for (const mockTrade of mockTrades) {
        await createTrade(mockTrade)
      }

      console.log('Mock trades created')
    } catch (error) {
      console.error('Failed to create mock trades:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter trades for current user
  const userTrades = trades.filter(trade => 
    trade.buyerId === user?.id || trade.sellerId === user?.id
  )

  // Apply filters
  const filteredTrades = userTrades.filter(trade => {
    const matchesStatus = statusFilter === 'all' || trade.status === statusFilter
    const matchesSearch = !searchQuery || 
      trade.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trade.offerId.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesStatus && matchesSearch
  })

  const getStatusBadge = (status: P2PTrade['status']) => {
    const variants: Record<P2PTrade['status'], { variant: any; label: string; icon: React.ReactNode }> = {
      CREATED: { variant: 'secondary', label: t('p2p.status.created'), icon: <Clock className="h-3 w-3" /> },
      ESCROW_LOCKED: { variant: 'warning', label: t('p2p.status.escrowLocked'), icon: <Shield className="h-3 w-3" /> },
      PAYMENT_MARKED: { variant: 'info', label: t('p2p.status.paymentMarked'), icon: <CheckCircle className="h-3 w-3" /> },
      RELEASED: { variant: 'success', label: t('p2p.status.released'), icon: <CheckCircle className="h-3 w-3" /> },
      REFUNDED: { variant: 'secondary', label: t('p2p.status.refunded'), icon: <RefreshCw className="h-3 w-3" /> },
      DISPUTE: { variant: 'danger', label: t('p2p.status.dispute'), icon: <AlertTriangle className="h-3 w-3" /> },
      CANCELLED: { variant: 'secondary', label: t('p2p.status.cancelled'), icon: <XCircle className="h-3 w-3" /> }
    }

    const config = variants[status]
    return (
      <Badge variant={config.variant} className="flex items-center">
        {config.icon}
        <span className="ml-1">{config.label}</span>
      </Badge>
    )
  }

  const getUserRole = (trade: P2PTrade) => {
    if (!user) return 'unknown'
    return trade.buyerId === user.id ? 'buyer' : 'seller'
  }

  const getCounterpartId = (trade: P2PTrade) => {
    const role = getUserRole(trade)
    return role === 'buyer' ? trade.sellerId : trade.buyerId
  }

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  // Stats
  const stats = {
    total: userTrades.length,
    active: userTrades.filter(t => ['CREATED', 'ESCROW_LOCKED', 'PAYMENT_MARKED'].includes(t.status)).length,
    completed: userTrades.filter(t => t.status === 'RELEASED').length,
    disputed: userTrades.filter(t => t.status === 'DISPUTE').length
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-matte-black-900">
            {t('p2p.myTrades.title')}
          </h1>
          <p className="text-matte-black-600 mt-1">
            {userTrades.length} {t('p2p.myTrades.total')}
          </p>
        </div>

        <Button onClick={() => navigate('/p2p/offers')}>
          {t('p2p.myTrades.findOffers')}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-matte-black-900 mb-1">
            {stats.total}
          </div>
          <div className="text-sm text-matte-black-600">
            {t('p2p.myTrades.stats.total')}
          </div>
        </Card>

        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-warning mb-1">
            {stats.active}
          </div>
          <div className="text-sm text-matte-black-600">
            {t('p2p.myTrades.stats.active')}
          </div>
        </Card>

        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-success mb-1">
            {stats.completed}
          </div>
          <div className="text-sm text-matte-black-600">
            {t('p2p.myTrades.stats.completed')}
          </div>
        </Card>

        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-danger mb-1">
            {stats.disputed}
          </div>
          <div className="text-sm text-matte-black-600">
            {t('p2p.myTrades.stats.disputed')}
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-matte-black-400" />
              <Input
                placeholder={t('p2p.myTrades.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-sand-300 rounded-lg focus:ring-2 focus:ring-bazari-red focus:border-transparent"
          >
            <option value="all">{t('p2p.myTrades.filter.all')}</option>
            <option value="CREATED">{t('p2p.status.created')}</option>
            <option value="ESCROW_LOCKED">{t('p2p.status.escrowLocked')}</option>
            <option value="PAYMENT_MARKED">{t('p2p.status.paymentMarked')}</option>
            <option value="RELEASED">{t('p2p.status.released')}</option>
            <option value="DISPUTE">{t('p2p.status.dispute')}</option>
            <option value="CANCELLED">{t('p2p.status.cancelled')}</option>
          </select>
        </div>
      </Card>

      {/* Trades List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : filteredTrades.length === 0 ? (
        <div>
          {userTrades.length === 0 ? (
            <EmptyState
              icon={<MessageCircle className="h-12 w-12 text-matte-black-400" />}
              title={t('p2p.empty.noTrades')}
              description={t('p2p.myTrades.empty.description')}
              action={
                <div className="space-y-3">
                  <Button onClick={() => navigate('/p2p/offers')}>
                    {t('p2p.myTrades.findOffers')}
                  </Button>
                  
                  {process.env.NODE_ENV === 'development' && (
                    <Button onClick={createMockTrades} variant="outline">
                      Criar Trades Mock (Dev)
                    </Button>
                  )}
                </div>
              }
            />
          ) : (
            <EmptyState
              icon={<Search className="h-12 w-12 text-matte-black-400" />}
              title={t('p2p.myTrades.empty.noResults')}
              description={t('p2p.myTrades.empty.tryDifferentFilter')}
            />
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTrades.map((trade, index) => (
            <motion.div
              key={trade.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-bazari-red-100 rounded-full flex items-center justify-center">
                      <MessageCircle className="h-5 w-5 text-bazari-red" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-matte-black-900">
                        {t('p2p.trade.title')} #{trade.id.slice(-8)}
                      </h3>
                      <p className="text-sm text-matte-black-600">
                        {t('p2p.myTrades.role')}: {t(`p2p.myTrades.${getUserRole(trade)}`)}
                      </p>
                    </div>
                  </div>

                  {getStatusBadge(trade.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-matte-black-600">
                      {t('p2p.trade.amount')}
                    </div>
                    <div className="font-semibold">
                      {trade.amountBZR} BZR
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-matte-black-600">
                      {t('p2p.trade.price')}
                    </div>
                    <div className="font-semibold">
                      {formatCurrency(trade.priceBZR)}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-matte-black-600">
                      {t('p2p.trade.method')}
                    </div>
                    <div className="font-semibold">
                      {getPaymentMethodInfo(trade.paymentMethod).name}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-matte-black-600">
                      {t('p2p.trade.total')}
                    </div>
                    <div className="font-semibold text-bazari-red">
                      {formatCurrency(parseFloat(trade.amountBZR) * trade.priceBZR)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Link
                      to={buildProfileRoute(getCounterpartId(trade))}
                      className="text-sm text-matte-black-600 hover:text-bazari-red transition-colors"
                    >
                      {t('p2p.myTrades.counterpart')}: {getUserRole(trade) === 'buyer' ? 'Vendedor' : 'Comprador'}
                    </Link>
                    
                    <span className="text-sm text-matte-black-500">
                      {formatDate(trade.timeline[0]?.ts || Date.now())}
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <Link to={`/p2p/trade/${trade.id}`}>
                      <Button size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        {t('p2p.myTrades.viewTrade')}
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}