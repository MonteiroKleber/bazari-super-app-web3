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

  // ✅ Navegação para página Browse
  const handleViewAllProducts = () => {
    navigate('/marketplace/browse?tab=products')
  }

  const handleViewAllEnterprises = () => {
    navigate('/marketplace/browse?tab=enterprises')
  }

  const handleViewAllByCategory = (category: string) => {
    navigate(`/marketplace/browse?tab=products&category=${category}`)
  }

  // ✅ Busca rápida
  const handleQuickSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/marketplace/browse?tab=products&search=${encodeURIComponent(query)}`)
    }
  }

  // ✅ Dados processados
  const popularListings = getPopularListings(6)
  const recentListings = getRecentListings(8)
  const featuredEnterprises = enterprises.slice(0, 4)
  const topCategories = categories.slice(0, 8)

  return (
    <div className="min-h-screen bg-sand-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-bazari-red to-matte-black-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {t('marketplace.title') || 'Marketplace'}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              {t('marketplace.subtitle') || 'Compre, venda e descubra produtos incríveis na nossa plataforma descentralizada'}
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-matte-black-400 w-5 h-5" />
              <Input
                type="text"
                placeholder={t('marketplace.search_placeholder') || 'Buscar produtos...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleQuickSearch(searchQuery)
                  }
                }}
                className="w-full pl-12 pr-4 py-4 text-lg bg-white text-matte-black-900"
                size="lg"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuickSearch(searchQuery)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-bazari-red hover:text-bazari-red-700"
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/marketplace/create')}
                className="bg-bazari-gold text-matte-black-900 hover:bg-bazari-gold-600"
              >
                <Plus className="w-5 h-5 mr-2" />
                {t('marketplace.create_listing') || 'Criar Anúncio'}
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/marketplace/p2p')}
                className="border-white text-white hover:bg-white hover:text-matte-black-900"
              >
                <ArrowUpDown className="w-5 h-5 mr-2" />
                {t('marketplace.p2p_trading') || 'Negociação P2P'}
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={handleViewAllEnterprises}
                className="border-white text-white hover:bg-white hover:text-matte-black-900"
              >
                <Building className="w-5 h-5 mr-2" />
                {t('marketplace.enterprises') || 'Empreendimentos'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Categorias Principais */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-matte-black-900">
              {t('marketplace.categories') || 'Categorias'}
            </h2>
            <Button
              variant="ghost"
              onClick={handleViewAllProducts}
              className="text-bazari-red hover:text-bazari-red-700"
            >
              {t('marketplace.view_all') || 'Ver Todos'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {topCategories.map((category) => (
              <motion.div
                key={category.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card 
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 p-6 text-center h-full"
                  onClick={() => handleViewAllByCategory(category.id)}
                >
                  <div className="w-12 h-12 bg-bazari-red/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Package className="w-6 h-6 text-bazari-red" />
                  </div>
                  <h3 className="font-medium text-matte-black-900 text-sm">
                    {category.name.pt}
                  </h3>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Produtos Populares */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-matte-black-900">
              {t('marketplace.popular_products') || 'Produtos Populares'}
            </h2>
            <Button
              variant="ghost"
              onClick={handleViewAllProducts}
              className="text-bazari-red hover:text-bazari-red-700"
            >
              {t('marketplace.view_all')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : popularListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              {popularListings.map((listing) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card 
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 h-full"
                    onClick={() => navigate(`/marketplace/listing/${listing.id}`)}
                  >
                    <div className="aspect-square bg-sand-100 rounded-t-2xl relative overflow-hidden">
                      {listing.images?.[0] && (
                        <img 
                          src={listing.images[0]} 
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="bg-white/90 text-xs">
                          {listing.currency} {listing.price.toLocaleString()}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-matte-black-900 mb-1 line-clamp-2 text-sm">
                        {listing.title}
                      </h3>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Star className="w-3 h-3 text-bazari-gold fill-current" />
                          <span className="text-xs text-matte-black-600 ml-1">
                            {listing.sellerRating}
                          </span>
                        </div>
                        <span className="text-xs text-matte-black-500">
                          {listing.views} views
                        </span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Package className="w-12 h-12" />}
              title={t('marketplace.no_products_title') || 'Nenhum produto encontrado'}
              description={t('marketplace.no_products_description') || 'Seja o primeiro a criar um anúncio!'}
              action={
                <Button onClick={() => navigate('/marketplace/create')}>
                  {t('marketplace.create_first_listing') || 'Criar Primeiro Anúncio'}
                </Button>
              }
            />
          )}
        </section>

        {/* Produtos Recentes */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-matte-black-900">
              {t('marketplace.recent_products') || 'Produtos Recentes'}
            </h2>
            <Button
              variant="ghost"
              onClick={handleViewAllProducts}
              className="text-bazari-red hover:text-bazari-red-700"
            >
              {t('marketplace.view_all')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : recentListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentListings.map((listing) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card 
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 h-full"
                    onClick={() => navigate(`/marketplace/listing/${listing.id}`)}
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
                          {listing.currency} {listing.price.toLocaleString()}
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
                            <p className="text-xs font-medium">{listing.sellerName}</p>
                            <div className="flex items-center">
                              <Star className="w-3 h-3 text-bazari-gold fill-current" />
                              <span className="text-xs text-matte-black-600 ml-1">
                                {listing.sellerRating}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <span className="text-xs text-matte-black-500">
                          {listing.views} views
                        </span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Package className="w-12 h-12" />}
              title={t('marketplace.no_recent_products') || 'Nenhum produto recente'}
              description={t('marketplace.no_recent_products_description') || 'Novos produtos aparecerão aqui'}
            />
          )}
        </section>

        {/* Empreendimentos em Destaque */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-matte-black-900">
              {t('marketplace.featured_enterprises') || 'Empreendimentos em Destaque'}
            </h2>
            <Button
              variant="ghost"
              onClick={handleViewAllEnterprises}
              className="text-bazari-red hover:text-bazari-red-700"
            >
              {t('marketplace.view_all')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {enterprisesLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : featuredEnterprises.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredEnterprises.map((enterprise) => (
                <motion.div
                  key={enterprise.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card 
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 h-full"
                    onClick={() => navigate(`/marketplace/enterprises/${enterprise.id}`)}
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
                            <Verified className="w-3 h-3 mr-1" />
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
                        
                        <span className="text-xs text-matte-black-500">
                          {enterprise.stats?.totalSales || 0} vendas
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {enterprise.categories?.slice(0, 2).map((cat: string) => (
                          <Badge key={cat} variant="outline" className="text-xs">
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Building className="w-12 h-12" />}
              title={t('marketplace.no_enterprises_title') || 'Nenhum empreendimento encontrado'}
              description={t('marketplace.no_enterprises_description') || 'Cadastre seu negócio e comece a vender!'}
              action={
                <Button onClick={() => navigate('/marketplace/enterprises/create')}>
                  {t('marketplace.create_enterprise') || 'Criar Empreendimento'}
                </Button>
              }
            />
          )}
        </section>

        {/* Call to Action */}
        <section className="text-center py-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-matte-black-900 mb-4">
              {t('marketplace.cta_title')}
            </h2>
            <p className="text-xl text-matte-black-600 mb-8">
              {t('marketplace.cta_description')}
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                onClick={() => navigate('/marketplace/create')}
              >
                <Plus className="w-5 h-5 mr-2" />
                {t('marketplace.start_selling')}
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={handleViewAllProducts}
              >
                <Package className="w-5 h-5 mr-2" />
                {t('marketplace.explore_products')}
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default MarketplaceHome