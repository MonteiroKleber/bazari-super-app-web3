import React from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Plus, Grid, List } from 'lucide-react'
import { Card } from '@shared/ui/Card'
import { Input } from '@shared/ui/Input'
import { Button } from '@shared/ui/Button'
import { Badge } from '@shared/ui/Badge'
import { EmptyState } from '@shared/ui/EmptyState'
import { useI18n } from '@app/providers/I18nProvider'
import { useMarketplaceStore } from '../store/marketplaceStore'
import { useNavigate } from 'react-router-dom'

export const MarketplaceHome: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useI18n()
  const { listings, categories, filters, setFilters, isLoading } = useMarketplaceStore()
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid')

  React.useEffect(() => {
    // Load listings on mount
  }, [])

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
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-matte-black-900 mb-2">
              {t('marketplace.title')}
            </h1>
            <p className="text-matte-black-600">
              Descubra produtos e serviços únicos
            </p>
          </div>
          
          <Button onClick={() => navigate('/marketplace/create')}>
            <Plus size={16} className="mr-2" />
            Criar Anúncio
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder={t('marketplace.search_placeholder')}
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              leftIcon={<Search size={20} />}
            />
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter size={16} className="mr-2" />
              {t('marketplace.filters')}
            </Button>
            
            <div className="flex border border-sand-200 rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid size={16} />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List size={16} />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h3 className="font-semibold text-matte-black-900 mb-4">
              {t('marketplace.categories')}
            </h3>
            
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={`w-full text-left p-3 rounded-xl transition-colors ${
                    filters.category === category.id
                      ? 'bg-bazari-red-50 text-bazari-red border border-bazari-red-200'
                      : 'hover:bg-sand-50 text-matte-black-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {category.name.pt}
                    </span>
                    {category.digital && (
                      <Badge variant="secondary" size="sm">
                        Digital
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Listings */}
        <div className="lg:col-span-3">
          {listings.length === 0 ? (
            <EmptyState
              title="Nenhum produto encontrado"
              description="Ajuste os filtros ou seja o primeiro a criar um anúncio nesta categoria."
              action={
                <Button onClick={() => navigate('/marketplace/create')}>
                  <Plus size={16} className="mr-2" />
                  Criar Primeiro Anúncio
                </Button>
              }
            />
          ) : (
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                : 'space-y-4'
            }>
              {listings.map((listing) => (
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
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-matte-black-400">Sem imagem</span>
                        </div>
                      )}
                      
                      {listing.digital && (
                        <Badge
                          variant="primary"
                          size="sm"
                          className="absolute top-2 right-2"
                        >
                          Digital
                        </Badge>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="font-semibold text-matte-black-900 mb-2 line-clamp-2">
                        {listing.title}
                      </h3>
                      
                      <p className="text-sm text-matte-black-600 mb-4 line-clamp-2">
                        {listing.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg font-bold text-bazari-red">
                            {formatPrice(listing.price, listing.currency)}
                          </p>
                          <p className="text-xs text-matte-black-500">
                            {listing.sellerName}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center">
                            <span className="text-sm text-bazari-gold-600">
                              ★ {listing.sellerRating.toFixed(1)}
                            </span>
                          </div>
                          <p className="text-xs text-matte-black-500">
                            {listing.views} visualizações
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
