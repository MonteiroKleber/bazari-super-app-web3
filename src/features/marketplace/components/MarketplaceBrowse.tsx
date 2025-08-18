// src/features/marketplace/components/MarketplaceBrowse.tsx
// ✅ FILTRAGEM INSTANTÂNEA EM MEMÓRIA - SEM LOADING/FETCH A CADA FILTRO

import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { 
  Search, 
  Filter, 
  X, 
  SlidersHorizontal,
  ArrowUpDown,
  Star,
  MapPin,
  Package,
  Building2,
  ChevronDown,
  Grid,
  List
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
import categories from '@app/data/categories.json'

const MarketplaceBrowse: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useI18n()
  const [searchParams, setSearchParams] = useSearchParams()
  
  const { 
    listings, 
    filters: marketplaceFilters,
    isLoading: marketplaceLoading,
    searchListings,
    fetchListings,
    setFilters: setMarketplaceFilters
  } = useMarketplaceStore()
  
  const { 
    enterprises, 
    filters: enterpriseFilters,
    isLoading: enterpriseLoading,
    fetchEnterprises,
    setFilters: setEnterpriseFilters
  } = useEnterpriseStore()

  // Estados locais
  const [activeTab, setActiveTab] = React.useState<'products' | 'enterprises'>('products')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [showFilters, setShowFilters] = React.useState(false)
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid')
  const [currentPage, setCurrentPage] = React.useState(1)

  // Estados para dados completos (carregados uma vez)
  const [allListings, setAllListings] = React.useState<any[]>([])
  const [allEnterprises, setAllEnterprises] = React.useState<any[]>([])
  const [initialLoading, setInitialLoading] = React.useState(true)

  // Filtros para produtos
  const [productFilters, setProductFilters] = React.useState({
    category: '',
    subcategory: '',
    subsubcategory: '',
    priceMin: '',
    priceMax: '',
    condition: '',
    tags: [] as string[],
    location: { city: '', state: '', radius: 50 },
    sortBy: 'relevance' as const
  })

  // Filtros para empreendimentos 
  const [enterpriseLocalFilters, setEnterpriseLocalFilters] = React.useState({
    category: '',
    subcategory: '',
    verified: undefined as boolean | undefined,
    minRating: undefined as number | undefined,
    location: { city: '', state: '' },
    sortBy: 'relevance' as const
  })

  // Inicialização com query params
  React.useEffect(() => {
    const tab = searchParams.get('tab')
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const subcategory = searchParams.get('subcategory')
    const priceMin = searchParams.get('priceMin')
    const priceMax = searchParams.get('priceMax')
    const condition = searchParams.get('condition')

    if (tab === 'enterprises') {
      setActiveTab('enterprises')
    } else {
      setActiveTab('products')
    }

    if (search) {
      setSearchQuery(search)
    }

    if (activeTab === 'products') {
      setProductFilters(prev => ({
        ...prev,
        category: category || '',
        subcategory: subcategory || '',
        priceMin: priceMin || '',
        priceMax: priceMax || '',
        condition: condition || ''
      }))
    }

    // Foca no campo de busca ao carregar
    setTimeout(() => {
      const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement
      if (searchInput) searchInput.focus()
    }, 100)
  }, [searchParams, activeTab])

  // Carrega dados iniciais UMA VEZ
  React.useEffect(() => {
    const loadInitialData = async () => {
      setInitialLoading(true)
      try {
        // Carrega listings se ainda não foram carregados
        if (listings.length === 0) {
          await fetchListings()
        }
        // Carrega enterprises se ainda não foram carregados  
        if (enterprises.length === 0) {
          await fetchEnterprises()
        }
        
        // Salva dados completos localmente
        setAllListings(listings.length > 0 ? listings : [])
        setAllEnterprises(enterprises.length > 0 ? enterprises : [])
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setInitialLoading(false)
      }
    }
    
    loadInitialData()
  }, [])

  // Atualiza dados locais quando store muda
  React.useEffect(() => {
    if (listings.length > 0) {
      setAllListings(listings)
    }
  }, [listings])

  React.useEffect(() => {
    if (enterprises.length > 0) {
      setAllEnterprises(enterprises)
    }
  }, [enterprises])

  // FILTRAGEM LOCAL INSTANTÂNEA - Produtos
  const filteredListings = React.useMemo(() => {
    let filtered = [...allListings]
    
    // Filtro por busca
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(listing =>
        listing.title?.toLowerCase().includes(query) ||
        listing.description?.toLowerCase().includes(query) ||
        listing.sellerName?.toLowerCase().includes(query)
      )
    }
    
    // Filtro por categoria
    if (productFilters.category) {
      filtered = filtered.filter(l => l.category === productFilters.category)
    }
    
    // Filtro por subcategoria
    if (productFilters.subcategory) {
      filtered = filtered.filter(l => l.subcategory === productFilters.subcategory)
    }
    
    // Filtro por preço
    if (productFilters.priceMin) {
      const minPrice = Number(productFilters.priceMin)
      filtered = filtered.filter(l => l.price >= minPrice)
    }
    if (productFilters.priceMax) {
      const maxPrice = Number(productFilters.priceMax)
      filtered = filtered.filter(l => l.price <= maxPrice)
    }
    
    // Filtro por condição
    if (productFilters.condition) {
      filtered = filtered.filter(l => l.metadata?.condition === productFilters.condition)
    }
    
    // Filtro por localização
    if (productFilters.location.city) {
      filtered = filtered.filter(l => 
        l.metadata?.location?.city?.toLowerCase().includes(productFilters.location.city.toLowerCase())
      )
    }
    if (productFilters.location.state) {
      filtered = filtered.filter(l => 
        l.metadata?.location?.state?.toLowerCase().includes(productFilters.location.state.toLowerCase())
      )
    }
    
    // Ordenação
    switch (productFilters.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'rating_desc':
        filtered.sort((a, b) => b.sellerRating - a.sellerRating)
        break
      case 'views_desc':
        filtered.sort((a, b) => b.views - a.views)
        break
      case 'relevance':
      default:
        // Relevância: combina rating e views
        filtered.sort((a, b) => {
          const aScore = a.sellerRating * 100 + a.views
          const bScore = b.sellerRating * 100 + b.views
          return bScore - aScore
        })
        break
    }
    
    return filtered.filter(l => l.status === 'active')
  }, [allListings, searchQuery, productFilters])

  // FILTRAGEM LOCAL INSTANTÂNEA - Empreendimentos
  const filteredEnterprises = React.useMemo(() => {
    let filtered = [...allEnterprises]
    
    // Filtro por busca
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(enterprise =>
        enterprise.name?.toLowerCase().includes(query) ||
        enterprise.description?.toLowerCase().includes(query)
      )
    }
    
    // Filtro por categoria
    if (enterpriseLocalFilters.category) {
      filtered = filtered.filter(e => 
        e.categories?.includes(enterpriseLocalFilters.category)
      )
    }
    
    // Filtro por verificado
    if (enterpriseLocalFilters.verified === true) {
      filtered = filtered.filter(e => e.verification?.verified === true)
    }
    
    // Filtro por rating mínimo
    if (enterpriseLocalFilters.minRating) {
      filtered = filtered.filter(e => 
        e.reputation?.rating >= enterpriseLocalFilters.minRating!
      )
    }
    
    // Filtro por localização
    if (enterpriseLocalFilters.location.city) {
      filtered = filtered.filter(e =>
        e.address?.city?.toLowerCase().includes(enterpriseLocalFilters.location.city.toLowerCase())
      )
    }
    if (enterpriseLocalFilters.location.state) {
      filtered = filtered.filter(e => 
        e.address?.state === enterpriseLocalFilters.location.state
      )
    }
    
    // Ordenação
    switch (enterpriseLocalFilters.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'rating':
        filtered.sort((a, b) => (b.reputation?.rating || 0) - (a.reputation?.rating || 0))
        break
      case 'sales':
        filtered.sort((a, b) => (b.reputation?.totalSales || 0) - (a.reputation?.totalSales || 0))
        break
      case 'relevance':
      default:
        // Relevância: prioriza verificados e com melhor rating
        filtered.sort((a, b) => {
          const aScore = (a.verification?.verified ? 1 : 0) + (a.reputation?.rating || 0)
          const bScore = (b.verification?.verified ? 1 : 0) + (b.reputation?.rating || 0)
          return bScore - aScore
        })
        break
    }
    
    return filtered.filter(e => e.status === 'active')
  }, [allEnterprises, searchQuery, enterpriseLocalFilters])

  // Busca instantânea - SEM DEBOUNCE
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    // Filtragem acontece automaticamente via useMemo - instantâneo!
  }

  // Limpa filtros
  const clearFilters = () => {
    setSearchQuery('')
    if (activeTab === 'products') {
      setProductFilters({
        category: '',
        subcategory: '',
        subsubcategory: '',
        priceMin: '',
        priceMax: '',
        condition: '',
        tags: [],
        location: { city: '', state: '', radius: 50 },
        sortBy: 'relevance'
      })
    } else {
      setEnterpriseLocalFilters({
        category: '',
        subcategory: '',
        verified: undefined,
        minRating: undefined,
        location: { city: '', state: '' },
        sortBy: 'relevance'
      })
    }
    setCurrentPage(1)
    
    // Limpa query params
    setSearchParams({})
  }

  // Atualiza query params
  const updateQueryParams = (updates: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value)
      } else {
        newParams.delete(key)
      }
    })
    setSearchParams(newParams)
  }

  // Scroll to top ao trocar aba ou aplicar filtros
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [activeTab, currentPage])

  const renderProductCard = (listing: any) => (
    <motion.div
      key={listing.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 h-full">
        <div 
          onClick={() => navigate(`/marketplace/listing/${listing.id}`)}
          className="p-0"
        >
          <div className="aspect-video bg-sand-100 rounded-t-2xl relative overflow-hidden">
            {listing.images?.[0] && (
              <img 
                src={listing.images[0]} 
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute top-3 right-3">
              <Badge variant="secondary" className="bg-white/90">
                {listing.currency} {listing.price?.toLocaleString()}
              </Badge>
            </div>
          </div>
          
          <div className="p-4">
            <h3 className="font-semibold text-matte-black-900 mb-2 line-clamp-2">
              {listing.title}
            </h3>
            <p className="text-sm text-matte-black-600 mb-3 line-clamp-2">
              {listing.description}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Avatar size="sm" />
                <div>
                  <p className="text-sm font-medium">{listing.sellerName}</p>
                  <div className="flex items-center">
                    <Star className="w-3 h-3 text-bazari-gold fill-current" />
                    <span className="text-xs text-matte-black-600 ml-1">
                      {listing.sellerRating}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-xs text-matte-black-500">
                  {listing.views} {t('marketplace.views') || 'visualizações'}
                </p>
                {listing.metadata?.location && (
                  <p className="text-xs text-matte-black-500 flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {listing.metadata.location.city}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )

  const renderEnterpriseCard = (enterprise: any) => (
    <motion.div
      key={enterprise.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 h-full">
        <div 
          onClick={() => navigate(`/marketplace/enterprises/${enterprise.id}`)}
          className="p-0"
        >
          <div className="h-32 bg-gradient-to-r from-bazari-red to-bazari-gold rounded-t-2xl relative">
            {enterprise.banner && (
              <img 
                src={enterprise.banner} 
                alt={enterprise.name}
                className="w-full h-full object-cover rounded-t-2xl"
              />
            )}
            <div className="absolute -bottom-6 left-4">
              <Avatar 
                size="lg" 
                src={enterprise.logo}
                className="border-4 border-white shadow-md"
              />
            </div>
            {enterprise.verification?.verified && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-green-500 text-white">
                  <Building2 className="w-3 h-3 mr-1" />
                  {t('marketplace.verified') || 'Verificado'}
                </Badge>
              </div>
            )}
          </div>
          
          <div className="p-4 pt-8">
            <h3 className="font-semibold text-matte-black-900 mb-2">
              {enterprise.name}
            </h3>
            <p className="text-sm text-matte-black-600 mb-3 line-clamp-2">
              {enterprise.description}
            </p>
            
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-bazari-gold fill-current" />
                <span className="text-sm font-medium ml-1">
                  {enterprise.reputation?.rating || 0}
                </span>
                <span className="text-xs text-matte-black-500 ml-1">
                  ({enterprise.reputation?.reviewCount || 0})
                </span>
              </div>
              
              <div className="text-right">
                <p className="text-xs text-matte-black-500">
                  {enterprise.stats?.totalSales || 0} {t('marketplace.sales') || 'vendas'}
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1">
              {enterprise.categories?.slice(0, 2).map((cat: string) => (
                <Badge key={cat} variant="outline" className="text-xs">
                  {cat}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )

  const isLoading = initialLoading
  const data = activeTab === 'products' ? filteredListings : filteredEnterprises
  const hasFilters = activeTab === 'products' 
    ? Object.values(productFilters).some(v => v !== '' && v !== 50 && v?.length !== 0) || searchQuery.trim() !== ''
    : Object.values(enterpriseLocalFilters).some(v => v !== '' && v !== undefined) || searchQuery.trim() !== ''

  return (
    <div className="min-h-screen bg-sand-50">
      {/* Header */}
      <div className="bg-white border-b border-sand-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-matte-black-900">
              {t('marketplace.browse_title') || 'Explorar Marketplace'}
            </h1>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
              </Button>
              
              <Button
                variant="outline" 
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                {t('marketplace.filters') || 'Filtros'}
              </Button>
            </div>
          </div>

          {/* Abas */}
          <div className="flex space-x-1 bg-sand-100 rounded-xl p-1 mb-4">
            <button
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'products'
                  ? 'bg-white text-bazari-red shadow-sm'
                  : 'text-matte-black-600 hover:text-matte-black-900'
              }`}
              onClick={() => {
                setActiveTab('products')
                updateQueryParams({ tab: 'products' })
              }}
            >
              <Package className="w-4 h-4 mr-2 inline" />
              {t('marketplace.products_services') || 'Produtos & Serviços'}
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'enterprises'
                  ? 'bg-white text-bazari-red shadow-sm'
                  : 'text-matte-black-600 hover:text-matte-black-900'
              }`}
              onClick={() => {
                setActiveTab('enterprises')
                updateQueryParams({ tab: 'enterprises' })
              }}
            >
              <Building2 className="w-4 h-4 mr-2 inline" />
              {t('marketplace.enterprises') || 'Empreendimentos'}
            </button>
          </div>

          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-matte-black-400 w-4 h-4" />
            <Input
              type="text"
              placeholder={activeTab === 'products' 
                ? (t('marketplace.search_products') || 'Buscar produtos e serviços...') 
                : (t('marketplace.search_enterprises') || 'Buscar empreendimentos...')
              }
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 pr-10"
              aria-label={t('marketplace.search_placeholder') || 'Buscar'}
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-matte-black-400 hover:text-matte-black-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar de Filtros */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-80 flex-shrink-0"
            >
              <Card className="p-6 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-matte-black-900">
                    {t('marketplace.filters') || 'Filtros'}
                  </h3>
                  {hasFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                    >
                      {t('marketplace.clear_filters') || 'Limpar'}
                    </Button>
                  )}
                </div>

                {activeTab === 'products' ? (
                  <div className="space-y-4">
                    {/* Categoria */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t('marketplace.category') || 'Categoria'}
                      </label>
                      <select
                        value={productFilters.category}
                        onChange={(e) => setProductFilters(prev => ({ 
                          ...prev, 
                          category: e.target.value,
                          subcategory: '',
                          subsubcategory: ''
                        }))}
                        className="w-full p-2 border border-sand-300 rounded-lg"
                      >
                        <option value="">{t('marketplace.all_categories') || 'Todas as Categorias'}</option>
                        {categories.categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name.pt}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Subcategoria */}
                    {productFilters.category && (
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {t('marketplace.subcategory') || 'Subcategoria'}
                        </label>
                        <select
                          value={productFilters.subcategory}
                          onChange={(e) => setProductFilters(prev => ({ 
                            ...prev, 
                            subcategory: e.target.value,
                            subsubcategory: ''
                          }))}
                          className="w-full p-2 border border-sand-300 rounded-lg"
                        >
                          <option value="">{t('marketplace.all_subcategories') || 'Todas as Subcategorias'}</option>
                          {categories.categories
                            .find(c => c.id === productFilters.category)
                            ?.subcategories?.map((sub) => (
                              <option key={sub.id} value={sub.id}>
                                {sub.name.pt}
                              </option>
                            ))}
                        </select>
                      </div>
                    )}

                    {/* Faixa de Preço */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t('marketplace.price_range') || 'Faixa de Preço'}
                      </label>
                      <div className="flex space-x-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={productFilters.priceMin}
                          onChange={(e) => setProductFilters(prev => ({ 
                            ...prev, 
                            priceMin: e.target.value 
                          }))}
                        />
                        <Input
                          type="number"
                          placeholder="Max"
                          value={productFilters.priceMax}
                          onChange={(e) => setProductFilters(prev => ({ 
                            ...prev, 
                            priceMax: e.target.value 
                          }))}
                        />
                      </div>
                    </div>

                    {/* Condição */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t('marketplace.condition') || 'Condição'}
                      </label>
                      <select
                        value={productFilters.condition}
                        onChange={(e) => setProductFilters(prev => ({ 
                          ...prev, 
                          condition: e.target.value 
                        }))}
                        className="w-full p-2 border border-sand-300 rounded-lg"
                      >
                        <option value="">{t('marketplace.all_conditions') || 'Todas as Condições'}</option>
                        <option value="new">{t('marketplace.new') || 'Novo'}</option>
                        <option value="used">{t('marketplace.used') || 'Usado'}</option>
                        <option value="refurbished">{t('marketplace.refurbished') || 'Recondicionado'}</option>
                      </select>
                    </div>

                    {/* Localização */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t('marketplace.location') || 'Localização'}
                      </label>
                      <div className="space-y-2">
                        <Input
                          placeholder={t('marketplace.city') || 'Cidade'}
                          value={productFilters.location.city}
                          onChange={(e) => setProductFilters(prev => ({ 
                            ...prev, 
                            location: { ...prev.location, city: e.target.value }
                          }))}
                        />
                        <Input
                          placeholder={t('marketplace.state') || 'Estado'}
                          value={productFilters.location.state}
                          onChange={(e) => setProductFilters(prev => ({ 
                            ...prev, 
                            location: { ...prev.location, state: e.target.value }
                          }))}
                        />
                      </div>
                    </div>

                    {/* Ordenação */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t('marketplace.sort_by') || 'Ordenar por'}
                      </label>
                      <select
                        value={productFilters.sortBy}
                        onChange={(e) => setProductFilters(prev => ({ 
                          ...prev, 
                          sortBy: e.target.value as any
                        }))}
                        className="w-full p-2 border border-sand-300 rounded-lg"
                      >
                        <option value="relevance">{t('marketplace.relevance') || 'Relevância'}</option>
                        <option value="newest">{t('marketplace.newest') || 'Mais Recentes'}</option>
                        <option value="price_asc">{t('marketplace.price_asc') || 'Menor Preço'}</option>
                        <option value="price_desc">{t('marketplace.price_desc') || 'Maior Preço'}</option>
                        <option value="rating_desc">{t('marketplace.rating_desc') || 'Melhor Avaliação'}</option>
                        <option value="views_desc">{t('marketplace.views_desc') || 'Mais Visualizados'}</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Filtros para Empreendimentos */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t('marketplace.category') || 'Categoria'}
                      </label>
                      <select
                        value={enterpriseLocalFilters.category}
                        onChange={(e) => setEnterpriseLocalFilters(prev => ({ 
                          ...prev, 
                          category: e.target.value,
                          subcategory: ''
                        }))}
                        className="w-full p-2 border border-sand-300 rounded-lg"
                      >
                        <option value="">{t('marketplace.all_categories') || 'Todas as Categorias'}</option>
                        {categories.categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name.pt}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Verificado */}
                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={enterpriseLocalFilters.verified === true}
                          onChange={(e) => setEnterpriseLocalFilters(prev => ({ 
                            ...prev, 
                            verified: e.target.checked ? true : undefined
                          }))}
                          className="rounded border-sand-300"
                        />
                        <span className="text-sm">{t('marketplace.verified_only') || 'Apenas Verificados'}</span>
                      </label>
                    </div>

                    {/* Rating Mínimo */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t('marketplace.min_rating') || 'Avaliação Mínima'}
                      </label>
                      <select
                        value={enterpriseLocalFilters.minRating || ''}
                        onChange={(e) => setEnterpriseLocalFilters(prev => ({ 
                          ...prev, 
                          minRating: e.target.value ? Number(e.target.value) : undefined
                        }))}
                        className="w-full p-2 border border-sand-300 rounded-lg"
                      >
                        <option value="">{t('marketplace.any_rating') || 'Qualquer Avaliação'}</option>
                        <option value="4">4+ {t('marketplace.stars') || 'estrelas'}</option>
                        <option value="4.5">4.5+ {t('marketplace.stars') || 'estrelas'}</option>
                      </select>
                    </div>

                    {/* Ordenação */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t('marketplace.sort_by') || 'Ordenar por'}
                      </label>
                      <select
                        value={enterpriseLocalFilters.sortBy}
                        onChange={(e) => setEnterpriseLocalFilters(prev => ({ 
                          ...prev, 
                          sortBy: e.target.value as any
                        }))}
                        className="w-full p-2 border border-sand-300 rounded-lg"
                      >
                        <option value="relevance">{t('marketplace.relevance') || 'Relevância'}</option>
                        <option value="newest">{t('marketplace.newest') || 'Mais Recentes'}</option>
                        <option value="rating">{t('marketplace.rating_desc') || 'Melhor Avaliação'}</option>
                        <option value="sales">{t('marketplace.sales_desc') || 'Mais Vendidos'}</option>
                      </select>
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          )}

          {/* Conteúdo Principal */}
          <div className="flex-1">
            {/* Resultados Header */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-matte-black-600">
                {data.length} {t('marketplace.results_found') || 'resultados encontrados'}
                {searchQuery && (
                  <span> {t('marketplace.for') || 'para'} "{searchQuery}"</span>
                )}
              </p>
              
              {hasFilters && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-matte-black-600">
                    {t('marketplace.filters_applied') || 'Filtros aplicados'}:
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                  >
                    <X className="w-3 h-3 mr-1" />
                    {t('marketplace.clear_all') || 'Limpar Tudo'}
                  </Button>
                </div>
              )}
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            )}

            {/* Empty State */}
            {!isLoading && data.length === 0 && (
              <EmptyState
                icon={activeTab === 'products' ? <Package className="w-12 h-12" /> : <Building2 className="w-12 h-12" />}
                title={t('marketplace.no_results_title') || 'Nenhum resultado encontrado'}
                description={t('marketplace.no_results_description') || 'Tente ajustar seus filtros ou termos de busca'}
                action={
                  hasFilters ? (
                    <Button onClick={clearFilters}>
                      {t('marketplace.clear_filters') || 'Limpar Filtros'}
                    </Button>
                  ) : undefined
                }
              />
            )}

            {/* Grid de Resultados */}
            {!isLoading && data.length > 0 && (
              <div 
                className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                    : 'grid-cols-1'
                }`}
              >
                {data.map((item) => 
                  activeTab === 'products' 
                    ? renderProductCard(item)
                    : renderEnterpriseCard(item)
                )}
              </div>
            )}

            {/* Paginação Simples (Carregar Mais) */}
            {!isLoading && data.length > 0 && data.length >= 20 && (
              <div className="flex justify-center mt-8">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentPage(prev => prev + 1)
                    // Aqui implementaria o carregamento de mais itens
                  }}
                >
                  {t('marketplace.load_more') || 'Carregar Mais'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MarketplaceBrowse