// src/features/marketplace/components/MarketplaceHome.tsx

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Filter, 
  Plus, 
  Grid, 
  List, 
  TrendingUp, 
  Building, 
  Package, 
  ArrowUpDown,
  Star,
  Verified,
  ExternalLink,
  ArrowRight
} from 'lucide-react'
import { Card } from '@shared/ui/Card'
import { Input } from '@shared/ui/Input'
import { Button } from '@shared/ui/Button'
import { Badge } from '@shared/ui/Badge'
import { Avatar } from '@shared/ui/Avatar'
import { EmptyState } from '@shared/ui/EmptyState'
import { Tabs } from '@shared/ui/Tabs'
import { useI18n } from '@app/providers/I18nProvider'
import { useMarketplaceStore } from '../store/marketplaceStore'
import { useEnterpriseStore } from '../store/enterpriseStore'
import { useNavigate } from 'react-router-dom'

export const MarketplaceHome: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useI18n()
  const { 
    listings, 
    categories, 
    filters, 
    setFilters, 
    isLoading,
    getPopularListings,
    getRecentListings 
  } = useMarketplaceStore()
  const { 
    enterprises, 
    fetchEnterprises,
    isLoading: enterprisesLoading 
  } = useEnterpriseStore()

  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid')
  const [activeTab, setActiveTab] = React.useState('products')
  const [searchQuery, setSearchQuery] = React.useState('')

  React.useEffect(() => {
    fetchEnterprises()
  }, [fetchEnterprises])

  const formatPrice = (price: number, currency: 'BZR' | 'BRL') => {
    if (currency === 'BRL') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(price)
    }
    return `${price.toLocaleString('pt-BR')} BZR`
  }

  const handleCategoryClick = (categoryId: string) => {
    setFilters({ ...filters, category: categoryId })
    setActiveTab('products')
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setFilters({ ...filters, search: query })
  }

  const popularListings = getPopularListings(6)
  const recentListings = getRecentListings(8)
  const featuredEnterprises = enterprises.slice(0, 4)

  const tabsData = [
    {
      id: 'products',
      label: 'Produtos & Serviços',
      content: (
        <div className="space-y-6">
          {/* Featured/Popular Products */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-matte-black-900">
                Produtos Populares
              </h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setFilters({ sortBy: 'views_desc' })
                  navigate('/marketplace')
                }}
              >
                Ver Todos
                <ArrowRight size={14} className="ml-1" />
              </Button>
            </div>
            
            {popularListings.length === 0 ? (
              <EmptyState
                title="Nenhum produto encontrado"
                description="Seja o primeiro a criar um anúncio."
                action={
                  <Button onClick={() => navigate('/marketplace/create')}>
                    <Plus size={16} className="mr-2" />
                    Criar Primeiro Produto
                  </Button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {popularListings.map((listing) => (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -4 }}
                  >
                    <Card
                      className="overflow-hidden cursor-pointer"
                      onClick={() => navigate(`/marketplace/listing/${listing.id}`)}
                    >
                      {/* Image */}
                      <div className="aspect-video bg-sand-200 relative">
                        {listing.images[0] ? (
                          <img 
                            src={listing.images[0]} 
                            alt={listing.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Package className="text-matte-black-400" size={32} />
                          </div>
                        )}
                        
                        {/* Badges */}
                        <div className="absolute top-3 right-3 space-y-1">
                          {listing.digital && (
                            <Badge variant="primary" size="sm">Digital</Badge>
                          )}
                          {listing.digital?.tokenizable && (
                            <Badge variant="secondary" size="sm">Tokenizado</Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="p-4">
                        <h3 className="font-semibold text-matte-black-900 mb-2 line-clamp-2">
                          {listing.title}
                        </h3>
                        
                        <p className="text-bazari-red font-bold text-lg mb-2">
                          {formatPrice(listing.price, listing.currency)}
                        </p>
                        
                        {/* Enterprise Info */}
                        {listing.enterpriseName && (
                          <div className="flex items-center mb-2">
                            <Building size={14} className="text-matte-black-600 mr-1" />
                            <span className="text-sm text-matte-black-600">
                              {listing.enterpriseName}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-sm text-matte-black-600">
                          <div className="flex items-center">
                            <Star size={14} className="text-bazari-gold-600 mr-1" />
                            {listing.sellerRating.toFixed(1)}
                            <span className="ml-1">• {listing.views} views</span>
                          </div>
                          <Badge variant={listing.status === 'active' ? 'success' : 'secondary'} size="sm">
                            {listing.status === 'active' ? 'Disponível' : listing.status}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Products */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-matte-black-900">
                Adicionados Recentemente
              </h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setFilters({ sortBy: 'newest' })
                  navigate('/marketplace')
                }}
              >
                Ver Todos
                <ArrowRight size={14} className="ml-1" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {recentListings.map((listing) => (
                <Card
                  key={listing.id}
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/marketplace/listing/${listing.id}`)}
                >
                  <div className="flex space-x-3">
                    <div className="w-16 h-16 bg-sand-200 rounded-lg flex-shrink-0">
                      {listing.images[0] ? (
                        <img 
                          src={listing.images[0]} 
                          alt={listing.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Package className="text-matte-black-400" size={20} />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-matte-black-900 text-sm line-clamp-2 mb-1">
                        {listing.title}
                      </h4>
                      <p className="text-bazari-red font-semibold text-sm mb-1">
                        {formatPrice(listing.price, listing.currency)}
                      </p>
                      <p className="text-xs text-matte-black-600">
                        {listing.sellerName}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'enterprises',
      label: 'Empreendimentos',
      content: (
        <div className="space-y-6">
          {/* Featured Enterprises */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-matte-black-900">
                Empreendimentos em Destaque
              </h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/marketplace/enterprises')}
              >
                Ver Todos
                <ArrowRight size={14} className="ml-1" />
              </Button>
            </div>
            
            {featuredEnterprises.length === 0 ? (
              <EmptyState
                title="Nenhum empreendimento encontrado"
                description="Seja o primeiro a criar um empreendimento."
                action={
                  <Button onClick={() => navigate('/marketplace/enterprises/create')}>
                    <Plus size={16} className="mr-2" />
                    Criar Primeiro Empreendimento
                  </Button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featuredEnterprises.map((enterprise) => (
                  <motion.div
                    key={enterprise.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -4 }}
                  >
                    <Card
                      className="overflow-hidden cursor-pointer"
                      onClick={() => navigate(`/marketplace/enterprises/${enterprise.id}`)}
                    >
                      {/* Banner */}
                      <div className="h-32 bg-gradient-to-br from-bazari-red-100 to-bazari-gold-100 relative">
                        {enterprise.banner ? (
                          <img 
                            src={enterprise.banner} 
                            alt={enterprise.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <div className="text-3xl font-bold text-bazari-red-300">
                              {enterprise.name.charAt(0).toUpperCase()}
                            </div>
                          </div>
                        )}
                        
                        {/* Badges */}
                        <div className="absolute top-3 right-3 space-y-1">
                          {enterprise.verification.verified && (
                            <Badge variant="success" size="sm">
                              <Verified size={12} className="mr-1" />
                              Verificado
                            </Badge>
                          )}
                          {enterprise.tokenization?.enabled && (
                            <Badge variant="primary" size="sm">Tokenizado</Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="p-6">
                        <div className="flex items-start space-x-3 mb-3">
                          <Avatar
                            src={enterprise.logo}
                            alt={enterprise.name}
                            fallback={enterprise.name.charAt(0)}
                            size="sm"
                          />
                          
                          <div className="flex-1">
                            <h3 className="font-semibold text-matte-black-900 mb-1">
                              {enterprise.name}
                            </h3>
                            <p className="text-sm text-matte-black-600">
                              por {enterprise.ownerName}
                            </p>
                          </div>
                        </div>
                        
                        <p className="text-sm text-matte-black-700 mb-4 line-clamp-2">
                          {enterprise.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-3 text-matte-black-600">
                            <div className="flex items-center">
                              <Star size={14} className="text-bazari-gold-600 mr-1" />
                              {enterprise.reputation.rating.toFixed(1)}
                            </div>
                            
                            <div className="flex items-center">
                              <Package size={14} className="mr-1" />
                              {enterprise.stats.activeListings}
                            </div>
                          </div>
                          
                          <Button variant="ghost" size="sm">
                            <ExternalLink size={14} />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Enterprise Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 text-center">
              <Building className="mx-auto text-bazari-red mb-2" size={24} />
              <p className="text-2xl font-bold text-matte-black-900">
                {enterprises.length}
              </p>
              <p className="text-sm text-matte-black-600">Empreendimentos Ativos</p>
            </Card>
            
            <Card className="p-4 text-center">
              <Verified className="mx-auto text-success mb-2" size={24} />
              <p className="text-2xl font-bold text-success">
                {enterprises.filter(e => e.verification.verified).length}
              </p>
              <p className="text-sm text-matte-black-600">Verificados</p>
            </Card>
            
            <Card className="p-4 text-center">
              <TrendingUp className="mx-auto text-bazari-gold-600 mb-2" size={24} />
              <p className="text-2xl font-bold text-bazari-gold-600">
                {enterprises.filter(e => e.tokenization?.enabled).length}
              </p>
              <p className="text-sm text-matte-black-600">Tokenizados</p>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: 'p2p',
      label: 'P2P Trading',
      content: (
        <div className="space-y-6">
          {/* P2P Overview */}
          <div className="bg-gradient-to-r from-bazari-red-50 to-bazari-gold-50 p-6 rounded-xl border border-bazari-red-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-matte-black-900 mb-2">
                  Negocie BZR Diretamente
                </h3>
                <p className="text-matte-black-700 mb-4">
                  Compre e venda BZR com outros usuários usando métodos de pagamento locais como PIX, TED e muito mais.
                </p>
                <div className="flex space-x-3">
                  <Button onClick={() => navigate('/marketplace/p2p')}>
                    <ArrowUpDown size={16} className="mr-2" />
                    Ver Anúncios P2P
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/marketplace/p2p/create')}>
                    <Plus size={16} className="mr-2" />
                    Criar Anúncio
                  </Button>
                </div>
              </div>
              
              <div className="hidden md:block">
                <div className="w-24 h-24 bg-bazari-red-100 rounded-full flex items-center justify-center">
                  <ArrowUpDown className="text-bazari-red" size={40} />
                </div>
              </div>
            </div>
          </div>

          {/* P2P Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="text-success" size={24} />
              </div>
              <h4 className="font-semibold text-matte-black-900 mb-2">
                Escrow Automático
              </h4>
              <p className="text-sm text-matte-black-600">
                Suas negociações protegidas por sistema de escrow inteligente
              </p>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowUpDown className="text-blue-600" size={24} />
              </div>
              <h4 className="font-semibold text-matte-black-900 mb-2">
                Múltiplos Métodos
              </h4>
              <p className="text-sm text-matte-black-600">
                PIX, TED, DOC, dinheiro e outros métodos de pagamento
              </p>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-bazari-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="text-bazari-gold-600" size={24} />
              </div>
              <h4 className="font-semibold text-matte-black-900 mb-2">
                Sistema de Reputação
              </h4>
              <p className="text-sm text-matte-black-600">
                Negocie com confiança usando nosso sistema de avaliações
              </p>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="bg-sand-50 p-6 rounded-xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-success">15</p>
                <p className="text-sm text-matte-black-600">Comprando BZR</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-bazari-red">23</p>
                <p className="text-sm text-matte-black-600">Vendendo BZR</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-bazari-gold-600">R$ 0,85</p>
                <p className="text-sm text-matte-black-600">Preço Médio</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">47</p>
                <p className="text-sm text-matte-black-600">Trades Hoje</p>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ]

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
              {t('marketplace.title')}
            </h1>
            <p className="text-matte-black-600">
              Descubra produtos, serviços e empreendimentos únicos na plataforma
            </p>
          </div>
          
          <div className="flex space-x-3">
            <Button 
              variant="outline"
              onClick={() => navigate('/marketplace/enterprises/create')}
            >
              <Building size={16} className="mr-2" />
              Criar Empreendimento
            </Button>
            <Button onClick={() => navigate('/marketplace/create')}>
              <Plus size={16} className="mr-2" />
              Criar Anúncio
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <Input
            placeholder="Buscar produtos, serviços, empreendimentos..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            leftIcon={<Search size={20} />}
            size="lg"
            className="text-center"
          />
        </div>

        {/* Quick Category Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {categories.slice(0, 6).map((category) => (
            <Button
              key={category.id}
              variant="outline"
              size="sm"
              onClick={() => handleCategoryClick(category.id)}
              className={filters.category === category.id ? 'border-bazari-red bg-bazari-red-50 text-bazari-red' : ''}
            >
              {category.name.pt}
              {category.digital && (
                <Badge variant="secondary" size="sm" className="ml-2">
                  Digital
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Main Content Tabs */}
      <Tabs
        tabs={tabsData}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Bottom CTA */}
      <Card className="mt-12 p-8 bg-gradient-to-r from-bazari-red-50 to-bazari-gold-50 border-bazari-red-200">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-matte-black-900 mb-4">
            Pronto para começar?
          </h2>
          <p className="text-matte-black-700 mb-6 max-w-2xl mx-auto">
            Junte-se à comunidade Bazari e descubra um novo mundo de possibilidades. 
            Crie seu empreendimento, venda produtos digitais tokenizados ou negocie BZR diretamente.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/marketplace/enterprises/create')}>
              <Building size={16} className="mr-2" />
              Criar Meu Empreendimento
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/marketplace/create')}>
              <Package size={16} className="mr-2" />
              Vender Produto/Serviço
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/marketplace/p2p/create')}>
              <ArrowUpDown size={16} className="mr-2" />
              Anunciar P2P
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}