// src/pages/marketplace/enterprise/EnterpriseDetail.tsx
// ✅ VERSÃO FINAL LIMPA - Sem debug, funcionando perfeitamente

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
  ArrowUpDown,
  Building2
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
import { toast } from '@features/notifications/components/NotificationToastHost'

export const EnterpriseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useI18n()
  const { user } = useAuthStore()
  const { 
    currentEnterprise, 
    fetchEnterpriseById, 
    isLoading: enterpriseLoading,
    toggleEnterpriseTokenization 
  } = useEnterpriseStore()
  const { 
    listings, 
    fetchListings,
    getListingsByEnterprise,
    initializeMockData,
    isInitialized
  } = useMarketplaceStore()
  
  const [activeTab, setActiveTab] = React.useState('overview')
  const [showFilters, setShowFilters] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [filters, setFilters] = React.useState({
    category: '',
    priceMin: '',
    priceMax: '',
    condition: '',
    sortBy: 'newest' as const
  })

  // ✅ Inicialização forçada dos dados
  React.useEffect(() => {
    const initializeData = async () => {
      if (id) {
        // Primeiro garantir que os dados mock estão carregados
        if (!isInitialized) {
          initializeMockData()
        }
        
        // Depois carregar o empreendimento
        await fetchEnterpriseById(id)
        
        // E garantir que os listings estão carregados
        await fetchListings()
      }
    }
    
    initializeData()
  }, [id, fetchEnterpriseById, fetchListings, initializeMockData, isInitialized])

  // ✅ Buscar produtos diretamente do store (bypass do hook problemático)
  const enterpriseListings = React.useMemo(() => {
    if (!id) return []
    return getListingsByEnterprise(id)
  }, [id, listings, getListingsByEnterprise])

  // ✅ Aplicar filtros e busca manualmente
  const filteredListings = React.useMemo(() => {
    let result = [...enterpriseListings]

    // Aplicar busca
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(listing =>
        listing.title.toLowerCase().includes(query) ||
        listing.description.toLowerCase().includes(query) ||
        listing.category.toLowerCase().includes(query)
      )
    }

    // Aplicar filtros
    if (filters.category) {
      result = result.filter(l => l.category === filters.category)
    }

    if (filters.priceMin) {
      const minPrice = parseFloat(filters.priceMin)
      if (!isNaN(minPrice)) {
        result = result.filter(l => l.price >= minPrice)
      }
    }

    if (filters.priceMax) {
      const maxPrice = parseFloat(filters.priceMax)
      if (!isNaN(maxPrice)) {
        result = result.filter(l => l.price <= maxPrice)
      }
    }

    if (filters.condition) {
      result = result.filter(l => l.metadata?.condition === filters.condition)
    }

    // Aplicar ordenação
    switch (filters.sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price_desc':
        result.sort((a, b) => b.price - a.price)
        break
      case 'rating_desc':
        result.sort((a, b) => b.sellerRating - a.sellerRating)
        break
      case 'views_desc':
        result.sort((a, b) => b.views - a.views)
        break
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
    }

    return result
  }, [enterpriseListings, searchQuery, filters])

  const isOwner = user?.id === currentEnterprise?.ownerId

  // Handlers
  const handleShare = async () => {
    try {
      await navigator.share({
        title: currentEnterprise?.name,
        text: currentEnterprise?.description,
        url: window.location.href,
      })
    } catch {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Link copiado para a área de transferência!')
    }
  }

  const handleContact = () => {
    if (currentEnterprise?.ownerId) {
      navigate(`/profile/${currentEnterprise.ownerId}`)
    }
  }

  const handleCreateListing = () => {
    navigate(`/marketplace/create?enterpriseId=${id}`)
  }

  const handleCopyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address)
      toast.success('Endereço copiado!')
    } catch {
      toast.error('Erro ao copiar endereço')
    }
  }

  const clearFilters = () => {
    setFilters({
      category: '',
      priceMin: '',
      priceMax: '',
      condition: '',
      sortBy: 'newest'
    })
    setSearchQuery('')
  }

  const hasActiveFilters = React.useMemo(() => {
    return Object.entries(filters).some(([key, value]) => {
      if (key === 'sortBy') return value !== 'newest'
      return value !== ''
    }) || searchQuery.trim() !== ''
  }, [filters, searchQuery])

  // Loading state
  if (enterpriseLoading || !currentEnterprise) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sand-50 to-sage-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Enterprise not found
  if (!currentEnterprise) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sand-50 to-sage-50 flex items-center justify-center">
        <EmptyState
          icon={Building2}
          title={t('enterpriseDetail.notFound') || 'Empreendimento não encontrado'}
          description="Verifique se o link está correto ou tente novamente."
          action={
            <Button onClick={() => navigate('/marketplace')}>
              Voltar ao Marketplace
            </Button>
          }
        />
      </div>
    )
  }

  const enterprise = currentEnterprise

  const tabs = [
    {
      id: 'overview',
      label: t('enterpriseDetail.tabs.overview') || 'Visão Geral',
      content: (
        <div className="space-y-6">
          {/* Resumo tokenização se aplicável */}
          {enterprise.tokenized && (
            <Card className="p-6 border-l-4 border-l-success">
              <div className="flex items-center gap-3 mb-4">
                <Coins className="h-6 w-6 text-success" />
                <h3 className="text-lg font-semibold text-matte-black-900">
                  Token {enterprise.tokenSymbol}
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="text-center">
                  <p className="text-sm text-matte-black-600">Preço (BZR)</p>
                  <p className="text-xl font-bold text-success">
                    {enterprise.priceBZR?.toFixed(2) || '---'}
                  </p>
                  {enterprise.priceChange24hPct && (
                    <p className={`text-sm ${enterprise.priceChange24hPct >= 0 ? 
                      'text-green-600' : 'text-red-600'}`}>
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
          {/* Header com busca e filtros */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-matte-black-400" />
                <Input
                  type="text"
                  placeholder={t('enterpriseDetail.listings.searchPlaceholder') || 'Busque por título, tags...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                Filtros
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1">
                    {Object.values(filters).filter(v => v && v !== 'newest').length + (searchQuery ? 1 : 0)}
                  </Badge>
                )}
              </Button>
              
              {isOwner && (
                <Button size="sm" onClick={handleCreateListing} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Criar Anúncio
                </Button>
              )}
            </div>
          </div>

          {/* Filtros expandidos */}
          {showFilters && (
            <Card className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-matte-black-700 mb-1">
                    Categoria
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="w-full px-3 py-2 border border-matte-black-200 rounded-md"
                  >
                    <option value="">Todas</option>
                    <option value="technology">Tecnologia</option>
                    <option value="handcraft">Artesanato</option>
                    <option value="education">Educação</option>
                    <option value="food">Alimentação</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-matte-black-700 mb-1">
                    Preço mín.
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.priceMin}
                    onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-matte-black-700 mb-1">
                    Preço máx.
                  </label>
                  <Input
                    type="number"
                    placeholder="∞"
                    value={filters.priceMax}
                    onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-matte-black-700 mb-1">
                    Condição
                  </label>
                  <select
                    value={filters.condition}
                    onChange={(e) => setFilters({ ...filters, condition: e.target.value })}
                    className="w-full px-3 py-2 border border-matte-black-200 rounded-md"
                  >
                    <option value="">Todas</option>
                    <option value="new">Novo</option>
                    <option value="used">Usado</option>
                    <option value="refurbished">Reformado</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-matte-black-700 mb-1">
                    Ordenar por
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                    className="w-full px-3 py-2 border border-matte-black-200 rounded-md"
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
                <div className="flex justify-end mt-4">
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-2" />
                    Limpar Filtros
                  </Button>
                </div>
              )}
            </Card>
          )}

          {/* Empty state */}
          {filteredListings.length === 0 && (
            <EmptyState
              icon={Package}
              title={hasActiveFilters ? 
                'Nenhum produto encontrado com esses filtros' : 
                'Nenhum produto cadastrado'
              }
              description={hasActiveFilters ? 
                'Tente ajustar os filtros para encontrar mais produtos.' :
                'Este empreendimento ainda não possui produtos ou serviços cadastrados.'
              }
              action={hasActiveFilters ? (
                <Button variant="outline" onClick={clearFilters}>
                  Limpar Filtros
                </Button>
              ) : isOwner ? (
                <Button onClick={handleCreateListing}>
                  Criar Primeiro Anúncio
                </Button>
              ) : undefined}
            />
          )}

          {/* Grid de produtos */}
          {filteredListings.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredListings.map((listing) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4 }}
                  className="cursor-pointer"
                  onClick={() => navigate(`/marketplace/listing/${listing.id}`)}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                    <div className="aspect-video bg-matte-black-100 relative overflow-hidden">
                      {listing.images && listing.images[0] ? (
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-8 w-8 text-matte-black-400" />
                        </div>
                      )}
                      {listing.digital && (
                        <Badge 
                          variant="secondary" 
                          className="absolute top-2 right-2 bg-purple-100 text-purple-700"
                        >
                          Digital
                        </Badge>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-matte-black-900 mb-1 line-clamp-2">
                        {listing.title}
                      </h3>
                      
                      <p className="text-sm text-matte-black-600 mb-3 line-clamp-2">
                        {listing.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg font-bold text-success">
                            {listing.price.toLocaleString('pt-BR')} {listing.currency}
                          </p>
                          <div className="flex items-center gap-1 text-sm text-matte-black-500">
                            <Star className="h-3 w-3 fill-current text-amber-400" />
                            {listing.sellerRating.toFixed(1)}
                          </div>
                        </div>
                        
                        <Badge variant="secondary" className="text-xs">
                          {listing.category}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )
    }
  ]

  // Adicionar aba economia se tokenizado
  if (enterprise.tokenized) {
    tabs.splice(2, 0, {
      id: 'economy',
      label: t('enterpriseDetail.tabs.economy') || 'Economia / Token',
      content: (
        <div className="space-y-6">
          {/* KPIs principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Coins className="h-6 w-6 text-success" />
                <h3 className="font-semibold">Preço do Token</h3>
              </div>
              <p className="text-2xl font-bold text-success">
                {enterprise.priceBZR?.toFixed(2) || '---'} BZR
              </p>
              {enterprise.priceChange24hPct && (
                <p className={`text-sm ${enterprise.priceChange24hPct >= 0 ? 
                  'text-green-600' : 'text-red-600'}`}>
                  {enterprise.priceChange24hPct >= 0 ? '+' : ''}{enterprise.priceChange24hPct.toFixed(2)}% (24h)
                </p>
              )}
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-6 w-6 text-blue-600" />
                <h3 className="font-semibold">Holders</h3>
              </div>
              <p className="text-2xl font-bold text-matte-black-900">
                {enterprise.holdersCount?.toLocaleString() || '---'}
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="h-6 w-6 text-purple-600" />
                <h3 className="font-semibold">Receita (30d)</h3>
              </div>
              <p className="text-2xl font-bold text-success">
                {enterprise.revenueLast30dBZR?.toLocaleString() || '---'} BZR
              </p>
            </Card>
          </div>

          {/* Endereço on-chain */}
          {enterprise.onChainAddress && (
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Endereço On-Chain
              </h3>
              <div className="flex items-center gap-2 bg-matte-black-50 p-3 rounded-lg">
                <code className="flex-1 text-sm font-mono break-all">
                  {enterprise.onChainAddress}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopyAddress(enterprise.onChainAddress!)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          )}

          {/* Disclaimer */}
          <Card className="p-4 bg-amber-50 border-amber-200">
            <p className="text-sm text-amber-800">
              <Shield className="h-4 w-4 inline mr-2" />
              {t('enterpriseDetail.economy.disclaimer') || 
               'Informações meramente ilustrativas e não constituem recomendação de investimento.'}
            </p>
          </Card>
        </div>
      )
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sand-50 to-sage-50">
      {/* Header com capa */}
      <div className="relative">
        {/* Banner */}
        <div className="h-64 bg-gradient-to-r from-success to-success-dark relative overflow-hidden">
          {enterprise.banner && (
            <img
              src={enterprise.banner}
              alt={`Banner ${enterprise.name}`}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black bg-opacity-20" />
        </div>

        {/* Info principal */}
        <div className="relative -mt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-6">
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              {/* Logo e info básica */}
              <div className="flex gap-4 items-start">
                <Avatar
                  src={enterprise.logo}
                  alt={enterprise.name}
                  size="xl"
                  className="border-4 border-white shadow-lg"
                />
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-2xl font-bold text-matte-black-900">
                      {enterprise.name}
                    </h1>
                    {enterprise.verification?.verified && (
                      <Verified className="h-6 w-6 text-blue-500" />
                    )}
                    {enterprise.tokenized && (
                      <Badge variant="secondary" className="bg-success text-white">
                        <Coins className="h-3 w-3 mr-1" />
                        {enterprise.tokenSymbol}
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-matte-black-600 mb-2">
                    Por <span className="font-medium">{enterprise.ownerName}</span>
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-matte-black-500">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-current text-amber-400" />
                      <span>{enterprise.reputation?.rating.toFixed(1)}</span>
                      <span>({enterprise.reputation?.reviewCount} avaliações)</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{enterprise.address?.city}, {enterprise.address?.state}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-3 ml-auto">
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartilhar
                </Button>
                
                <Button size="sm" onClick={handleContact}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Entrar em contato
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Conteúdo das abas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
    </div>
  )
}