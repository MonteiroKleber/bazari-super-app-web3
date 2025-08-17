// src/features/marketplace/components/p2p/P2PList.tsx

import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, Plus, TrendingUp, ArrowUpDown, MapPin } from 'lucide-react'
import { Card } from '@shared/ui/Card'
import { Input } from '@shared/ui/Input'
import { Button } from '@shared/ui/Button'
import { Badge } from '@shared/ui/Badge'
import { EmptyState } from '@shared/ui/EmptyState'
import { LoadingSpinner } from '@shared/ui/LoadingSpinner'
import { useI18n } from '@app/providers/I18nProvider'
import { useP2P } from '../../hooks/useP2P'
import { useAuthStore } from '@features/auth/store/authStore'
import { P2PFilters } from './P2PFilters'
import { P2PCard } from './P2PCard'
import { P2PFilters as P2PFiltersType } from '../../types/p2p.types'

export const P2PList: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useI18n()
  const { user } = useAuthStore()
  
  const {
    orders,
    loading,
    marketData,
    formatCurrency,
    initiateTrade,
    fetchOrders,
    setFilters
  } = useP2P(user?.id)

  const [searchQuery, setSearchQuery] = React.useState('')
  const [showFilters, setShowFilters] = React.useState(false)
  const [filters, setLocalFilters] = React.useState<P2PFiltersType>({
    direction: 'all',
    sortBy: 'newest'
  })

  React.useEffect(() => {
    fetchOrders(filters)
  }, [fetchOrders])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    const newFilters = { ...filters, search: query }
    setLocalFilters(newFilters)
    setFilters(newFilters)
  }

  const handleFiltersChange = (newFilters: P2PFiltersType) => {
    setLocalFilters(newFilters)
    setFilters(newFilters)
    setShowFilters(false)
  }

  const handleTrade = async (orderId: string) => {
    try {
      const tradeId = await initiateTrade(orderId, 1000) // Mock amount - should open modal
      navigate(`/marketplace/p2p/${orderId}?trade=${tradeId}`)
    } catch (error) {
      console.error('Error initiating trade:', error)
    }
  }

  const handleViewProfile = (userId: string) => {
    navigate(`/profile/${userId}?from=p2p`)
  }

  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== undefined && value !== 'all' && value !== ''
  ).length

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-matte-black-900 mb-2">
              Anúncios P2P
            </h1>
            <p className="text-matte-black-600">
              Compre e venda BZR diretamente com outros usuários
            </p>
          </div>
          
          <Button onClick={() => navigate('/marketplace/p2p/create')}>
            <Plus size={16} className="mr-2" />
            Criar Anúncio P2P
          </Button>
        </div>

        {/* Market Stats */}
        {marketData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-matte-black-600 mb-1">Volume 24h</p>
                  <p className="text-xl font-bold text-matte-black-900">
                    {formatCurrency(marketData.volume24h.BRL)}
                  </p>
                  <p className="text-xs text-matte-black-500">
                    {marketData.volume24h.BZR.toLocaleString()} BZR
                  </p>
                </div>
                <TrendingUp className="text-success" size={24} />
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-matte-black-600 mb-1">Preço Médio</p>
                  <p className="text-xl font-bold text-matte-black-900">
                    {formatCurrency(marketData.averagePrice)}
                  </p>
                  <p className="text-xs text-matte-black-500">por BZR</p>
                </div>
                <div className="w-6 h-6 bg-bazari-gold-100 rounded-full flex items-center justify-center">
                  <span className="text-bazari-gold-600 text-xs font-bold">₽</span>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-matte-black-600 mb-1">Comprando</p>
                  <p className="text-xl font-bold text-success">
                    {marketData.activeOrders.buy}
                  </p>
                  <p className="text-xs text-matte-black-500">anúncios ativos</p>
                </div>
                <div className="w-6 h-6 bg-success-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="text-success" size={14} />
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-matte-black-600 mb-1">Vendendo</p>
                  <p className="text-xl font-bold text-bazari-red">
                    {marketData.activeOrders.sell}
                  </p>
                  <p className="text-xs text-matte-black-500">anúncios ativos</p>
                </div>
                <div className="w-6 h-6 bg-bazari-red-100 rounded-full flex items-center justify-center">
                  <ArrowUpDown className="text-bazari-red" size={14} />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Buscar por usuário, localização ou método de pagamento..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              leftIcon={<Search size={20} />}
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} className="mr-2" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge variant="primary" size="sm" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
            
            <div className="flex border border-sand-200 rounded-lg">
              <Button
                variant={filters.direction === 'buy' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => handleFiltersChange({ ...filters, direction: 'buy' })}
                className="rounded-r-none"
              >
                Comprando
              </Button>
              <Button
                variant={filters.direction === 'sell' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => handleFiltersChange({ ...filters, direction: 'sell' })}
                className="rounded-l-none rounded-r-none border-x-0"
              >
                Vendendo
              </Button>
              <Button
                variant={filters.direction === 'all' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => handleFiltersChange({ ...filters, direction: 'all' })}
                className="rounded-l-none"
              >
                Todos
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { label: 'PIX', filter: { paymentMethod: 'PIX' } },
            { label: 'Com Escrow', filter: { escrowOnly: true } },
            { label: 'Melhor Avaliação', filter: { minReputationRating: 4.5 } },
            { label: 'Menor Preço', filter: { sortBy: 'price_asc' as const } },
            { label: 'Maior Preço', filter: { sortBy: 'price_desc' as const } }
          ].map((quickFilter) => (
            <Button
              key={quickFilter.label}
              variant="outline"
              size="sm"
              onClick={() => handleFiltersChange({ ...filters, ...quickFilter.filter })}
            >
              {quickFilter.label}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mb-8">
          <P2PFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClose={() => setShowFilters(false)}
            isOpen={showFilters}
          />
        </div>
      )}

      {/* Orders List */}
      {orders.length === 0 ? (
        <EmptyState
          title="Nenhum anúncio P2P encontrado"
          description="Ajuste os filtros ou seja o primeiro a criar um anúncio P2P."
          action={
            <Button onClick={() => navigate('/marketplace/p2p/create')}>
              <Plus size={16} className="mr-2" />
              Criar Primeiro Anúncio P2P
            </Button>
          }
        />
      ) : (
        <>
          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-matte-black-600">
              {orders.length} {orders.length === 1 ? 'anúncio encontrado' : 'anúncios encontrados'}
            </p>
            
            <select
              value={filters.sortBy || 'newest'}
              onChange={(e) => handleFiltersChange({ ...filters, sortBy: e.target.value as any })}
              className="text-sm px-3 py-1 border border-sand-200 rounded-lg focus:ring-2 focus:ring-bazari-red-500 focus:border-transparent"
            >
              <option value="newest">Mais Recentes</option>
              <option value="price_asc">Menor Preço</option>
              <option value="price_desc">Maior Preço</option>
              <option value="amount_asc">Menor Quantidade</option>
              <option value="amount_desc">Maior Quantidade</option>
              <option value="rating_desc">Melhor Avaliação</option>
            </select>
          </div>

          {/* Orders Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {orders.map((order) => (
              <P2PCard
                key={order.id}
                order={order}
                onTrade={handleTrade}
                onViewProfile={handleViewProfile}
                currentUserId={user?.id}
              />
            ))}
          </div>

          {/* Load More */}
          {orders.length >= 20 && (
            <div className="text-center mt-8">
              <Button 
                variant="outline" 
                onClick={() => fetchOrders(filters)}
                loading={loading}
              >
                Carregar Mais Anúncios
              </Button>
            </div>
          )}
        </>
      )}

      {/* Help Card */}
      <Card className="mt-12 p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <ArrowUpDown className="text-blue-600" size={24} />
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-2">
              Como funciona o P2P?
            </h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p>
                • <strong>Segurança:</strong> Use escrow para proteger suas negociações
              </p>
              <p>
                • <strong>Reputação:</strong> Verifique sempre a avaliação do usuário
              </p>
              <p>
                • <strong>Pagamento:</strong> Prefira métodos rastreáveis como PIX
              </p>
              <p>
                • <strong>Comunicação:</strong> Use sempre o chat da plataforma
              </p>
            </div>
            
            <div className="flex space-x-3 mt-4">
              <Button size="sm" variant="outline">
                Saiba Mais
              </Button>
              <Button size="sm" onClick={() => navigate('/marketplace/p2p/create')}>
                Criar Meu Anúncio
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}