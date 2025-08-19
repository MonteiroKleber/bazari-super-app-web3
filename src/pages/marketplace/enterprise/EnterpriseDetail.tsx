// src/pages/marketplace/enterprise/EnterpriseDetail.tsx

import React from 'react'
import { motion } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Star, 
  Verified, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Instagram,
  MessageCircle,
  TrendingUp,
  Package,
  Clock,
  Shield,
  Coins,
  ExternalLink,
  Share2,
  Search,
  Filter,
  Plus,
  Copy,
  BarChart3,
  Users,
  Wallet,
  Calendar,
  X,
  ChevronDown,
  ArrowUpDown
} from 'lucide-react'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { Badge } from '@shared/ui/Badge'
import { Avatar } from '@shared/ui/Avatar'
import { Tabs } from '@shared/ui/Tabs'
import { LoadingSpinner } from '@shared/ui/LoadingSpinner'
import { EmptyState } from '@shared/ui/EmptyState'
import { Input } from '@shared/ui/Input'
import { useI18n } from '@app/providers/I18nProvider'
import { useEnterpriseStore } from '@features/marketplace/store/enterpriseStore'
import { useMarketplaceStore } from '@features/marketplace/store/marketplaceStore'
import { useAuthStore } from '@features/auth/store/authStore'
import { useEnterpriseListings } from '@features/marketplace/hooks/useEnterpriseListings'
import { toast } from '@features/notifications/components/NotificationToastHost'

export const EnterpriseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useI18n()
  const { user } = useAuthStore()
  const { 
    currentEnterprise, 
    fetchEnterpriseById, 
    isLoading,
    toggleEnterpriseTokenization 
  } = useEnterpriseStore()
  const { 
    listings, 
    fetchListings
  } = useMarketplaceStore()
  
  const [activeTab, setActiveTab] = React.useState('overview')
  const [showFilters, setShowFilters] = React.useState(false)

  // ✅ Usar hook personalizado para gerenciar listings
  const {
    filteredListings,
    paginatedListings,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    clearFilters,
    hasActiveFilters,
    hasMorePages,
    loadMore,
    isLoading: listingsLoading
  } = useEnterpriseListings({
    enterpriseId: id || '',
    itemsPerPage: 12,
    debounceMs: 250
  })

  React.useEffect(() => {
    if (id) {
      fetchEnterpriseById(id)
      fetchListings()
    }
  }, [id, fetchEnterpriseById, fetchListings])

  if (isLoading || !currentEnterprise) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const enterprise = currentEnterprise
  const isOwner = user?.id === enterprise.ownerId
  const isTokenized = enterprise.tokenizable && enterprise.tokenization?.enabled

  const formatCurrency = (amount: number, currency: 'BZR' | 'BRL') => {
    if (currency === 'BRL') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(amount)
    }
    return `${amount.toLocaleString('pt-BR')} BZR`
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: enterprise.name,
          text: enterprise.description,
          url: window.location.href
        })
      } catch (error) {
        // Fallback to copy
        handleCopyLink()
      }
    } else {
      handleCopyLink()
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success(t('enterpriseDetail.actions.linkCopied') || 'Link copiado!')
  }

  const handleContactEnterprise = () => {
    navigate(`/profile/${enterprise.ownerId}?from=enterprise&id=${enterprise.id}`)
  }

  const handleCreateListing = () => {
    navigate(`/marketplace/create?enterpriseId=${enterprise.id}`)
  }

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    toast.success(t('enterpriseDetail.economy.copy') || 'Endereço copiado!')
  }

  // Renderizar mini gráfico SVG simples
  const renderMiniChart = (data: number[]) => {
    if (!data.length) return null
    
    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1
    
    return (
      <svg className="w-full h-12" viewBox="0 0 100 40">
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          points={data.map((value, index) => {
            const x = (index / (data.length - 1)) * 100
            const y = 35 - ((value - min) / range) * 30
            return `${x},${y}`
          }).join(' ')}
        />
      </svg>
    )
  }

  const tabsData = [
    {
      id: 'overview',
      label: t('enterpriseDetail.tabs.overview') || 'Visão Geral',
      content: (
        <div className="space-y-6">
          {/* Informações principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center mb-2">
                <Package className="w-5 h-5 text-bazari-red mr-2" />
                <span className="text-sm text-matte-black-600">
                  {t('enterpriseDetail.overview.listingsCount') || 'Anúncios'}
                </span>
              </div>
              <p className="text-2xl font-bold text-matte-black-900">
                {enterprise.stats.activeListings}
              </p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center mb-2">
                <Star className="w-5 h-5 text-amber-500 mr-2" />
                <span className="text-sm text-matte-black-600">
                  {t('enterpriseDetail.overview.rating') || 'Avaliação'}
                </span>
              </div>
              <p className="text-2xl font-bold text-matte-black-900">
                {enterprise.reputation.rating.toFixed(1)}
              </p>
              <p className="text-xs text-matte-black-500">
                {enterprise.reputation.reviewCount} avaliações
              </p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center mb-2">
                <MapPin className="w-5 h-5 text-blue-500 mr-2" />
                <span className="text-sm text-matte-black-600">
                  {t('enterpriseDetail.overview.location') || 'Localização'}
                </span>
              </div>
              <p className="text-lg font-semibold text-matte-black-900">
                {enterprise.address?.city || 'N/A'}
              </p>
              <p className="text-xs text-matte-black-500">
                {enterprise.address?.state}
              </p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center mb-2">
                <Calendar className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-sm text-matte-black-600">
                  {t('enterpriseDetail.overview.since') || 'Desde'}
                </span>
              </div>
              <p className="text-lg font-semibold text-matte-black-900">
                {new Date(enterprise.createdAt).getFullYear()}
              </p>
            </Card>
          </div>

          {/* Mini resumo de tokenização se aplicável */}
          {isTokenized && (
            <Card className="p-6 bg-gradient-to-r from-bazari-red-50 to-bazari-gold-50 border border-bazari-red-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-matte-black-900 flex items-center">
                  <Coins className="w-5 h-5 text-bazari-red mr-2" />
                  Token {enterprise.tokenSymbol || 'TOKEN'}
                </h3>
                <Badge variant="primary">Tokenizado</Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-matte-black-600">Preço (BZR)</p>
                  <p className="text-xl font-bold text-bazari-red">
                    {enterprise.priceBZR?.toLocaleString() || '---'}
                  </p>
                  {enterprise.priceChange24hPct && (
                    <p className={`text-sm ${enterprise.priceChange24hPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {enterprise.priceChange24hPct >= 0 ? '+' : ''}{enterprise.priceChange24hPct.toFixed(2)}%
                    </p>
                  )}
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-matte-black-600">Holders</p>
                  <p className="text-xl font-bold text-matte-black-900">
                    {enterprise.holdersCount?.toLocaleString() || '---'}
                  </p>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-matte-black-600">Receita 30d</p>
                  <p className="text-xl font-bold text-success">
                    {enterprise.revenueLast30dBZR?.toLocaleString() || '---'} BZR
                  </p>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-matte-black-600">Margem</p>
                  <p className="text-xl font-bold text-amber-600">
                    {enterprise.profitMarginPct?.toFixed(1) || '---'}%
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Descrição */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-matte-black-900 mb-4">
              Sobre o Empreendimento
            </h3>
            <p className="text-matte-black-700 leading-relaxed whitespace-pre-wrap">
              {enterprise.description}
            </p>
          </Card>
        </div>
      )
    },
    {
      id: 'listings',
      label: t('enterpriseDetail.tabs.listings') || 'Produtos & Serviços',
      content: (
        <div className="space-y-6">
          {/* Cabeçalho com busca e filtros */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-matte-black-400" />
                <Input
                  type="text"
                  placeholder={t('enterpriseDetail.listings.searchPlaceholder') || 'Busque por título, tags...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  aria-label="Buscar produtos"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              {isOwner && (
                <Button onClick={handleCreateListing} className="flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('enterpriseDetail.actions.createListing') || 'Criar Anúncio'}
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    ativo
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Painel de filtros */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-sand-50 p-4 rounded-lg border"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-matte-black-700 mb-1">
                    {t('enterpriseDetail.listings.filters.category') || 'Categoria'}
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value, subcategory: '' }))}
                    className="w-full px-3 py-2 border border-sand-200 rounded-lg text-sm"
                  >
                    <option value="">Todas</option>
                    <option value="electronics">Eletrônicos</option>
                    <option value="clothing">Roupas</option>
                    <option value="home">Casa</option>
                    <option value="books">Livros</option>
                    <option value="technology">Tecnologia</option>
                    <option value="handcraft">Artesanato</option>
                    <option value="sustainability">Sustentabilidade</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-matte-black-700 mb-1">
                    {t('enterpriseDetail.listings.filters.priceMin') || 'Preço mín.'}
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.priceMin}
                    onChange={(e) => setFilters(prev => ({ ...prev, priceMin: e.target.value }))}
                    className="text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-matte-black-700 mb-1">
                    {t('enterpriseDetail.listings.filters.priceMax') || 'Preço máx.'}
                  </label>
                  <Input
                    type="number"
                    placeholder="999999"
                    value={filters.priceMax}
                    onChange={(e) => setFilters(prev => ({ ...prev, priceMax: e.target.value }))}
                    className="text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-matte-black-700 mb-1">
                    {t('enterpriseDetail.listings.filters.condition') || 'Condição'}
                  </label>
                  <select
                    value={filters.condition}
                    onChange={(e) => setFilters(prev => ({ ...prev, condition: e.target.value }))}
                    className="w-full px-3 py-2 border border-sand-200 rounded-lg text-sm"
                  >
                    <option value="">Todas</option>
                    <option value="new">Novo</option>
                    <option value="used">Usado</option>
                    <option value="refurbished">Recondicionado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-matte-black-700 mb-1">
                    {t('enterpriseDetail.listings.filters.sortBy') || 'Ordenar por'}
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-sand-200 rounded-lg text-sm"
                  >
                    <option value="newest">Mais recentes</option>
                    <option value="price_asc">Menor preço</option>
                    <option value="price_desc">Maior preço</option>
                    <option value="rating_desc">Melhor avaliação</option>
                    <option value="views_desc">Mais visualizados</option>
                  </select>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="mt-4 flex justify-end">
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="w-4 h-4 mr-2" />
                    Limpar filtros
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {/* Lista de produtos */}
          {listingsLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : paginatedListings.length === 0 ? (
            <EmptyState
              icon={<Package className="w-12 h-12" />}
              title={t('enterpriseDetail.listings.empty') || 'Nenhum produto/serviço encontrado com esses filtros.'}
              description="Tente ajustar os filtros ou termos de busca."
              action={hasActiveFilters ? (
                <Button onClick={clearFilters}>
                  Limpar filtros
                </Button>
              ) : undefined}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedListings.map((listing) => (
                  <Card
                    key={listing.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/marketplace/listing/${listing.id}`)}
                  >
                    {listing.images[0] && (
                      <div className="aspect-square bg-sand-100 overflow-hidden">
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-matte-black-900 mb-2 line-clamp-2">
                        {listing.title}
                      </h3>
                      
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-bold text-bazari-red">
                          {formatCurrency(listing.price, listing.currency)}
                        </span>
                        
                        {listing.digital && (
                          <Badge variant="secondary" className="text-xs">
                            Digital
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-matte-black-600">
                        <div className="flex items-center">
                          <Star className="w-3 h-3 text-amber-400 mr-1" />
                          {listing.sellerRating.toFixed(1)}
                        </div>
                        
                        <span>{listing.views} visualizações</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Carregar mais */}
              {hasMorePages && (
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    onClick={loadMore}
                    disabled={listingsLoading}
                  >
                    {listingsLoading ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : null}
                    {t('enterpriseDetail.listings.loadMore') || 'Carregar mais'}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )
    }
  ]

  // Adicionar aba de economia se tokenizado
  if (isTokenized) {
    tabsData.splice(2, 0, {
      id: 'economy',
      label: t('enterpriseDetail.tabs.economy') || 'Economia / Token',
      content: (
        <div className="space-y-6">
          {/* KPIs principais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-matte-black-600">
                  {t('enterpriseDetail.economy.price') || 'Preço (BZR)'}
                </h4>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-matte-black-900">
                {enterprise.priceBZR?.toLocaleString() || '---'}
              </p>
              {enterprise.priceChange24hPct !== undefined && (
                <p className={`text-sm ${enterprise.priceChange24hPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {enterprise.priceChange24hPct >= 0 ? '+' : ''}{enterprise.priceChange24hPct.toFixed(2)}%
                  <span className="text-matte-black-500 ml-1">24h</span>
                </p>
              )}
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-matte-black-600">
                  {t('enterpriseDetail.economy.holders') || 'Holders'}
                </h4>
                <Users className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-matte-black-900">
                {enterprise.holdersCount?.toLocaleString() || '---'}
              </p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-matte-black-600">
                  {t('enterpriseDetail.economy.supply') || 'Oferta'}
                </h4>
                <Coins className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-lg font-bold text-matte-black-900">
                {enterprise.circulatingSupply?.toLocaleString() || '---'}
              </p>
              <p className="text-xs text-matte-black-500">
                de {enterprise.totalSupply?.toLocaleString() || '---'}
              </p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-matte-black-600">
                  {t('enterpriseDetail.economy.treasury') || 'Tesouro (BZR)'}
                </h4>
                <Wallet className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-matte-black-900">
                {enterprise.treasuryBalanceBZR?.toLocaleString() || '---'}
              </p>
            </Card>
          </div>

          {/* Métricas financeiras */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="p-4">
              <h4 className="text-sm font-medium text-matte-black-600 mb-2">
                {t('enterpriseDetail.economy.revenue30d') || 'Receita (30d)'}
              </h4>
              <p className="text-xl font-bold text-green-600">
                {enterprise.revenueLast30dBZR?.toLocaleString() || '---'} BZR
              </p>
            </Card>

            <Card className="p-4">
              <h4 className="text-sm font-medium text-matte-black-600 mb-2">
                {t('enterpriseDetail.economy.revenue12m') || 'Receita (12m)'}
              </h4>
              <p className="text-xl font-bold text-green-600">
                {enterprise.revenueLast12mBZR?.toLocaleString() || '---'} BZR
              </p>
            </Card>

            <Card className="p-4">
              <h4 className="text-sm font-medium text-matte-black-600 mb-2">
                {t('enterpriseDetail.economy.profitMargin') || 'Margem de Lucro'}
              </h4>
              <p className="text-xl font-bold text-amber-600">
                {enterprise.profitMarginPct?.toFixed(1) || '---'}%
              </p>
            </Card>
          </div>

          {/* Política de dividendos */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-matte-black-900 mb-4">
              {t('enterpriseDetail.economy.dividendPolicy') || 'Política de Dividendos'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-matte-black-600 mb-1">Frequência</p>
                <p className="font-semibold text-matte-black-900">
                  {enterprise.dividendPolicy === 'none' ? 'Não distribui' :
                   enterprise.dividendPolicy === 'monthly' ? 'Mensal' :
                   enterprise.dividendPolicy === 'quarterly' ? 'Trimestral' :
                   enterprise.dividendPolicy === 'yearly' ? 'Anual' : '---'}
                </p>
              </div>
              {enterprise.lastPayoutDate && (
                <div>
                  <p className="text-sm text-matte-black-600 mb-1">
                    {t('enterpriseDetail.economy.lastPayout') || 'Último Pagamento'}
                  </p>
                  <p className="font-semibold text-matte-black-900">
                    {new Date(enterprise.lastPayoutDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Histórico simplificado */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-matte-black-900 mb-4">
              Histórico de Performance
            </h3>
            
            {/* Mini gráfico com dados mock */}
            <div className="h-32 text-bazari-red">
              {renderMiniChart([100, 120, 115, 140, 135, 150, 145, 160, 155, 170, 165, 180])}
            </div>
            
            {/* Tabela simples últimos meses */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Mês</th>
                    <th className="text-right py-2">Receita (BZR)</th>
                    <th className="text-right py-2">Lucro (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { month: 'Jan/25', revenue: 15000, profit: 12.5 },
                    { month: 'Dez/24', revenue: 14200, profit: 11.8 },
                    { month: 'Nov/24', revenue: 13800, profit: 10.2 },
                    { month: 'Out/24', revenue: 12900, profit: 9.7 },
                    { month: 'Set/24', revenue: 11500, profit: 8.9 },
                    { month: 'Ago/24', revenue: 10800, profit: 7.6 }
                  ].map((row, index) => (
                    <tr key={index} className="border-b border-sand-100">
                      <td className="py-2">{row.month}</td>
                      <td className="text-right py-2 font-medium">
                        {row.revenue.toLocaleString()}
                      </td>
                      <td className="text-right py-2">
                        <span className={`font-medium ${
                          row.profit >= 10 ? 'text-green-600' : 'text-amber-600'
                        }`}>
                          {row.profit}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Endereço on-chain */}
          {enterprise.onChainAddress && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-matte-black-900 mb-4">
                {t('enterpriseDetail.economy.address') || 'Endereço on-chain'}
              </h3>
              <div className="flex items-center justify-between bg-sand-50 p-3 rounded-lg">
                <code className="text-sm font-mono text-matte-black-700 truncate">
                  {enterprise.onChainAddress}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyAddress(enterprise.onChainAddress!)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          )}

          {/* Aviso legal */}
          <Card className="p-4 bg-blue-50 border border-blue-200">
            <div className="flex items-start">
              <Shield className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Aviso Legal</p>
                <p>
                  {t('enterpriseDetail.economy.disclaimer') || 
                   'Informações meramente ilustrativas e não constituem recomendação de investimento.'}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )
    })
  }

  // Aba "Sobre"
  tabsData.push({
    id: 'about',
    label: t('enterpriseDetail.tabs.about') || 'Sobre',
    content: (
      <div className="space-y-6">
        {/* Descrição detalhada */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-matte-black-900 mb-4">
            {t('enterpriseDetail.about.description') || 'Descrição'}
          </h3>
          <div className="prose prose-sm max-w-none">
            <p className="text-matte-black-700 leading-relaxed whitespace-pre-wrap">
              {enterprise.description}
            </p>
          </div>
        </Card>

        {/* Contatos estendidos */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-matte-black-900 mb-4">
            {t('enterpriseDetail.about.contacts') || 'Contatos'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enterprise.contact.phone && (
              <div className="flex items-center">
                <Phone className="w-4 h-4 text-matte-black-400 mr-3" />
                <span className="text-matte-black-700">{enterprise.contact.phone}</span>
              </div>
            )}
            
            {enterprise.contact.email && (
              <div className="flex items-center">
                <Mail className="w-4 h-4 text-matte-black-400 mr-3" />
                <span className="text-matte-black-700">{enterprise.contact.email}</span>
              </div>
            )}
            
            {enterprise.contact.website && (
              <div className="flex items-center">
                <Globe className="w-4 h-4 text-matte-black-400 mr-3" />
                <a 
                  href={enterprise.contact.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-bazari-red hover:underline"
                >
                  {enterprise.contact.website}
                </a>
              </div>
            )}
            
            {enterprise.contact.socialMedia?.instagram && (
              <div className="flex items-center">
                <Instagram className="w-4 h-4 text-matte-black-400 mr-3" />
                <a 
                  href={`https://instagram.com/${enterprise.contact.socialMedia.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-bazari-red hover:underline"
                >
                  @{enterprise.contact.socialMedia.instagram}
                </a>
              </div>
            )}
          </div>
        </Card>

        {/* Verificação */}
        {enterprise.verification.verified && (
          <Card className="p-6 bg-green-50 border border-green-200">
            <div className="flex items-center">
              <Verified className="w-6 h-6 text-green-600 mr-3" />
              <div>
                <h4 className="font-semibold text-green-800 mb-1">
                  Empreendimento Verificado
                </h4>
                <p className="text-sm text-green-700">
                  Verificado em {new Date(enterprise.verification.verifiedAt!).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    )
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header com capa, logo, nome, etc. - MANTIDO COMO ESTÁ */}
      <div className="relative mb-8">
        {/* Imagem de capa */}
        {enterprise.banner && (
          <div className="h-48 md:h-64 bg-gradient-to-r from-bazari-red-100 to-bazari-gold-100 rounded-lg overflow-hidden">
            <img
              src={enterprise.banner}
              alt={`Capa de ${enterprise.name}`}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Ações no topo */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="bg-white/90 backdrop-blur-sm"
          >
            <Share2 className="w-4 h-4 mr-2" />
            {t('enterpriseDetail.actions.share') || 'Compartilhar'}
          </Button>
        </div>

        {/* Informações principais */}
        <Card className="relative -mt-16 mx-4 p-6 bg-white/95 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Avatar
                src={enterprise.logo}
                fallback={enterprise.name.substring(0, 2).toUpperCase()}
                size="xl"
                className="border-4 border-white shadow-lg"
              />
            </div>

            {/* Info e ações */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-matte-black-900">
                      {enterprise.name}
                    </h1>
                    {enterprise.verification.verified && (
                      <Verified className="w-6 h-6 text-blue-500" />
                    )}
                    {isTokenized && (
                      <Badge variant="primary" className="flex items-center">
                        <Coins className="w-3 h-3 mr-1" />
                        Tokenizado
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-matte-black-600 mb-3">
                    <span>por {enterprise.ownerName}</span>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-amber-400 mr-1" />
                      {enterprise.reputation.rating.toFixed(1)} ({enterprise.reputation.reviewCount})
                    </div>
                    {enterprise.address && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {enterprise.address.city}, {enterprise.address.state}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {enterprise.categories.map((category, index) => (
                      <Badge key={index} variant="secondary">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={handleContactEnterprise}
                    className="flex items-center"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {t('enterpriseDetail.actions.contact') || 'Entrar em contato'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={tabsData}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        className="w-full"
      />
    </div>
  )
}