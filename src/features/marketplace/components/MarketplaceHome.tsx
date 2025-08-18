// src/features/marketplace/components/MarketplaceHome.tsx

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Plus, 
  Building, 
  Package, 
  Star,
  ArrowUpDown,
  Verified,
  ArrowRight,
  X
} from 'lucide-react'
import { Card } from '@shared/ui/Card'
import { Input } from '@shared/ui/Input'
import { Button } from '@shared/ui/Button'
import { Badge } from '@shared/ui/Badge'
import { Avatar } from '@shared/ui/Avatar'
import { EmptyState } from '@shared/ui/EmptyState'
import { LoadingSpinner } from '@shared/ui/LoadingSpinner'
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
    isLoading,
    getPopularListings,
    getRecentListings,
    fetchListings
  } = useMarketplaceStore()
  const { 
    enterprises, 
    fetchEnterprises,
    isLoading: enterprisesLoading 
  } = useEnterpriseStore()

  // ✅ Estados locais para filtros
  const [searchQuery, setSearchQuery] = React.useState('')
  const [activeTab, setActiveTab] = React.useState('products')
  const [productCategoryFilter, setProductCategoryFilter] = React.useState('')
  const [enterpriseCategoryFilter, setEnterpriseCategoryFilter] = React.useState('')

  // ✅ Carrega dados iniciais
  React.useEffect(() => {
    const loadData = async () => {
      await fetchEnterprises()
      await fetchListings() // Isso carregará os dados mock
    }
    loadData()
  }, [fetchEnterprises, fetchListings])

  // ✅ DEBUG ESPECÍFICO PARA CATEGORIAS
  React.useEffect(() => {
    if (listings.length > 0) {
      console.log('🔍 DEBUG CATEGORIAS:')
      console.log('📋 Categorias disponíveis no categories.json:', 
        categories.map(c => c.id))
      console.log('🛍️ Categorias únicas nos produtos:', 
        [...new Set(listings.map(l => l.category))])
      
      // Debug do PlayStation especificamente
      const playstation = listings.find(l => l.title.includes('PlayStation'))
      if (playstation) {
        console.log('🎮 PlayStation encontrado:', {
          title: playstation.title,
          category: playstation.category,
          subcategory: playstation.subcategory
        })
      }
      
      // Debug das empresas
      console.log('🏢 Categorias das empresas:', 
        enterprises.map(e => ({
          name: e.name,
          categories: e.categories
        })))
    }
  }, [listings, enterprises, categories])

  const formatPrice = (price: number, currency: 'BZR' | 'BRL') => {
    if (currency === 'BRL') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(price)
    }
    return `${price.toLocaleString('pt-BR')} BZR`
  }

  // ✅ FILTROS LOCAIS CORRIGIDOS

  // Filtro de produtos
  const filteredListings = React.useMemo(() => {
    let filtered = [...listings]
    
    // Filtro por categoria
    if (productCategoryFilter) {
      filtered = filtered.filter(listing => listing.category === productCategoryFilter)
    }
    
    // Filtro por busca (só na aba produtos)
    if (searchQuery && activeTab === 'products') {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(listing =>
        listing.title.toLowerCase().includes(query) ||
        listing.description.toLowerCase().includes(query) ||
        listing.sellerName.toLowerCase().includes(query)
      )
    }
    
    return filtered
  }, [listings, productCategoryFilter, searchQuery, activeTab])

  // Filtro de empreendimentos
  const filteredEnterprises = React.useMemo(() => {
    let filtered = [...enterprises]
    
    // Filtro por categoria
    if (enterpriseCategoryFilter) {
      filtered = filtered.filter(enterprise =>
        enterprise.categories?.includes(enterpriseCategoryFilter)
      )
    }
    
    // Filtro por busca (só na aba empresas)
    if (searchQuery && activeTab === 'enterprises') {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(enterprise =>
        enterprise.name.toLowerCase().includes(query) ||
        enterprise.description.toLowerCase().includes(query)
      )
    }
    
    return filtered
  }, [enterprises, enterpriseCategoryFilter, searchQuery, activeTab])

  // ✅ Dados processados para exibição
  const popularListings = React.useMemo(() => {
    const popular = getPopularListings(6)
    
    // Aplica os mesmos filtros dos produtos
    let filtered = [...popular]
    
    if (productCategoryFilter) {
      filtered = filtered.filter(listing => listing.category === productCategoryFilter)
    }
    
    if (searchQuery && activeTab === 'products') {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(listing =>
        listing.title.toLowerCase().includes(query) ||
        listing.description.toLowerCase().includes(query) ||
        listing.sellerName.toLowerCase().includes(query)
      )
    }
    
    return filtered
  }, [getPopularListings, productCategoryFilter, searchQuery, activeTab])

  const recentListings = React.useMemo(() => {
    const recent = getRecentListings(8)
    
    // Aplica os mesmos filtros dos produtos
    let filtered = [...recent]
    
    if (productCategoryFilter) {
      filtered = filtered.filter(listing => listing.category === productCategoryFilter)
    }
    
    if (searchQuery && activeTab === 'products') {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(listing =>
        listing.title.toLowerCase().includes(query) ||
        listing.description.toLowerCase().includes(query) ||
        listing.sellerName.toLowerCase().includes(query)
      )
    }
    
    return filtered
  }, [getRecentListings, productCategoryFilter, searchQuery, activeTab])

  const featuredEnterprises = React.useMemo(() => {
    return filteredEnterprises.slice(0, 4)
  }, [filteredEnterprises])

  // ✅ HANDLERS SEM FETCH - APENAS ATUALIZAM ESTADO LOCAL

  const handleCategoryClick = (categoryId: string) => {
    if (activeTab === 'products') {
      setProductCategoryFilter(categoryId)
    } else {
      setEnterpriseCategoryFilter(categoryId)
    }
  }

  const handleClearCategoryFilter = () => {
    if (activeTab === 'products') {
      setProductCategoryFilter('')
    } else {
      setEnterpriseCategoryFilter('')
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    setSearchQuery('') // Limpa busca ao trocar de aba
  }

  // Pega o filtro ativo baseado na aba
  const activeCategoryFilter = activeTab === 'products' 
    ? productCategoryFilter 
    : enterpriseCategoryFilter

  // Loading state
  if (isLoading && listings.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-matte-black-900 mb-2">
            Marketplace Bazari
          </h1>
          <p className="text-matte-black-600">
            Descubra produtos, serviços e empreendimentos únicos na plataforma
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => navigate('/marketplace/create')}
          >
            <Plus size={16} className="mr-2" />
            Criar Anúncio
          </Button>
          
          <Button
            variant="outline"
            onClick={() => navigate('/marketplace/enterprises/create')}
          >
            <Building size={16} className="mr-2" />
            Criar Empreendimento
          </Button>
        </div>
      </motion.div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-matte-black-400" size={20} />
          <Input
            placeholder={
              activeTab === 'products' 
                ? "Buscar produtos e serviços..." 
                : "Buscar empreendimentos..."
            }
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 pr-4"
          />
        </div>
      </Card>

      {/* ✅ Category Filters CORRIGIDOS */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-matte-black-700">
          Categorias Populares 
          <span className="text-matte-black-500">
            {activeTab === 'products' ? '(Produtos)' : '(Empreendimentos)'}
          </span>
        </h3>
        <div className="flex flex-wrap gap-2">
          {/* Botão "Todas Categorias" */}
          <Button
            variant={activeCategoryFilter === '' ? 'primary' : 'outline'}
            size="sm"
            onClick={handleClearCategoryFilter}
          >
            {activeCategoryFilter !== '' && (
              <X size={14} className="mr-1" />
            )}
            Todas Categorias
          </Button>
          
          {/* ✅ BOTÕES DE CATEGORIA CORRIGIDOS */}
          {categories.slice(0, 6).map((category) => (
            <Button
              key={category.id}
              variant={activeCategoryFilter === category.id ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleCategoryClick(category.id)}
            >
              {category.name.pt}
              {activeCategoryFilter === category.id && (
                <X 
                  size={14} 
                  className="ml-1" 
                  onClick={(e) => {
                    e.stopPropagation()
                    handleClearCategoryFilter()
                  }}
                />
              )}
            </Button>
          ))}
        </div>
      </div>



      {/* Main Content Tabs */}
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-sand-100 rounded-xl p-1">
          <button
            onClick={() => handleTabChange('products')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'products'
                ? 'bg-white text-bazari-red shadow-sm'
                : 'text-matte-black-600 hover:text-matte-black-900'
            }`}
          >
            🛍️ Produtos & Serviços ({popularListings.length + recentListings.length})
          </button>
          <button
            onClick={() => handleTabChange('enterprises')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'enterprises'
                ? 'bg-white text-bazari-red shadow-sm'
                : 'text-matte-black-600 hover:text-matte-black-900'
            }`}
          >
            🏢 Empreendimentos ({featuredEnterprises.length})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Featured/Popular Products */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-matte-black-900">
                  Produtos Populares
                  {productCategoryFilter && (
                    <Badge variant="outline" size="sm" className="ml-2">
                      {categories.find(c => c.id === productCategoryFilter)?.name.pt}
                    </Badge>
                  )}
                  {searchQuery && (
                    <Badge variant="secondary" size="sm" className="ml-2">
                      "{searchQuery}"
                    </Badge>
                  )}
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/marketplace')}
                >
                  Ver Todos
                  <ArrowRight size={14} className="ml-1" />
                </Button>
              </div>
              
              {popularListings.length === 0 ? (
                <EmptyState
                  title="Nenhum produto encontrado"
                  description={
                    productCategoryFilter || searchQuery
                      ? "Nenhum produto encontrado com os filtros aplicados."
                      : "Seja o primeiro a criar um anúncio."
                  }
                  action={
                    productCategoryFilter || searchQuery ? (
                      <div className="space-x-2">
                        {productCategoryFilter && (
                          <Button variant="outline" onClick={handleClearCategoryFilter}>
                            <X size={16} className="mr-2" />
                            Limpar Categoria
                          </Button>
                        )}
                        {searchQuery && (
                          <Button variant="outline" onClick={() => setSearchQuery('')}>
                            <X size={16} className="mr-2" />
                            Limpar Busca
                          </Button>
                        )}
                      </div>
                    ) : (
                      <Button onClick={() => navigate('/marketplace/create')}>
                        <Plus size={16} className="mr-2" />
                        Criar Primeiro Produto
                      </Button>
                    )
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
                          
                          {/* Badge */}
                          <div className="absolute top-2 right-2">
                            <Badge 
                              variant={listing.status === 'active' ? 'success' : 'secondary'} 
                              size="sm"
                            >
                              {listing.status === 'active' ? 'Disponível' : listing.status}
                            </Badge>
                          </div>
                        </div>
                        
                        {/* Content */}
                        <div className="p-4">
                          <h4 className="font-medium text-matte-black-900 mb-2 line-clamp-2">
                            {listing.title}
                          </h4>
                          <p className="text-bazari-red font-semibold text-lg mb-2">
                            {formatPrice(listing.price, listing.currency)}
                          </p>
                          
                          <div className="flex items-center justify-between text-sm text-matte-black-600">
                            <span>{listing.sellerName}</span>
                            <div className="flex items-center space-x-1">
                              <Star size={12} className="text-bazari-gold-500 fill-current" />
                              <span>{listing.sellerRating.toFixed(1)}</span>
                            </div>
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
                  onClick={() => navigate('/marketplace')}
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
        )}

        {/* Enterprises Tab Content */}
        {activeTab === 'enterprises' && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-matte-black-900">
                  Empreendimentos em Destaque
                  {enterpriseCategoryFilter && (
                    <Badge variant="outline" size="sm" className="ml-2">
                      {categories.find(c => c.id === enterpriseCategoryFilter)?.name.pt}
                    </Badge>
                  )}
                  {searchQuery && (
                    <Badge variant="secondary" size="sm" className="ml-2">
                      "{searchQuery}"
                    </Badge>
                  )}
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
              
              {featuredEnterprises.length === 0 || enterprisesLoading ? (
                <EmptyState
                  title="Nenhum empreendimento encontrado"
                  description={
                    enterpriseCategoryFilter || searchQuery
                      ? "Nenhum empreendimento encontrado com os filtros aplicados."
                      : "Seja o primeiro a criar um empreendimento."
                  }
                  action={
                    enterpriseCategoryFilter || searchQuery ? (
                      <div className="space-x-2">
                        {enterpriseCategoryFilter && (
                          <Button variant="outline" onClick={handleClearCategoryFilter}>
                            <X size={16} className="mr-2" />
                            Limpar Categoria
                          </Button>
                        )}
                        {searchQuery && (
                          <Button variant="outline" onClick={() => setSearchQuery('')}>
                            <X size={16} className="mr-2" />
                            Limpar Busca
                          </Button>
                        )}
                      </div>
                    ) : (
                      <Button onClick={() => navigate('/marketplace/enterprises/create')}>
                        <Plus size={16} className="mr-2" />
                        Criar Primeiro Empreendimento
                      </Button>
                    )
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
                        {/* Cover Image */}
                        <div className="h-32 bg-gradient-to-r from-bazari-red-500 to-bazari-gold-500 relative">
                          {enterprise.banner ? (
                            <img 
                              src={enterprise.banner} 
                              alt={enterprise.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Building className="text-white/60" size={32} />
                            </div>
                          )}
                          
                          {/* Verification Badge */}
                          {enterprise.verification?.verified && (
                            <div className="absolute top-2 right-2">
                              <Badge variant="success" size="sm">
                                <Verified size={12} className="mr-1" />
                                Verificado
                              </Badge>
                            </div>
                          )}
                        </div>
                        
                        {/* Content */}
                        <div className="p-4">
                          <div className="flex items-start space-x-3 mb-3">
                            <Avatar
                              src={enterprise.logo}
                              alt={enterprise.name}
                              size="md"
                              fallback={enterprise.name.charAt(0)}
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-matte-black-900 mb-1">
                                {enterprise.name}
                              </h4>
                              <p className="text-sm text-matte-black-600 line-clamp-2">
                                {enterprise.description}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-1 text-matte-black-600">
                              <Star size={12} className="text-bazari-gold-500 fill-current" />
                              <span>{enterprise.reputation?.rating?.toFixed(1) || '0.0'}</span>
                              <span>({enterprise.reputation?.reviewCount || 0})</span>
                            </div>
                            
                            <Badge variant="outline" size="sm">
                              {enterprise.categories?.[0] || 'Categoria'}
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

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
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              size="lg"
              onClick={() => navigate('/marketplace/enterprises/create')}
            >
              <Building size={20} className="mr-2" />
              Criar Empreendimento
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/marketplace/create')}
            >
              <Plus size={20} className="mr-2" />
              Criar Anúncio
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/marketplace/p2p/list')}>
              <ArrowUpDown size={16} className="mr-2" />
              Compre/Venda BZR
            </Button>

          </div>
        </div>
      </Card>
    </div>
  )
}