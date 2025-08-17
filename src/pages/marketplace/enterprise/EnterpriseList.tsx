// src/pages/marketplace/enterprise/EnterpriseList.tsx

import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, Plus, Star, Verified, MapPin, TrendingUp } from 'lucide-react'
import { Card } from '@shared/ui/Card'
import { Input } from '@shared/ui/Input'
import { Button } from '@shared/ui/Button'
import { Badge } from '@shared/ui/Badge'
import { Avatar } from '@shared/ui/Avatar'
import { EmptyState } from '@shared/ui/EmptyState'
import { LoadingSpinner } from '@shared/ui/LoadingSpinner'
import { useI18n } from '@app/providers/I18nProvider'
import { useEnterpriseStore } from '@features/marketplace/store/enterpriseStore'
import { Enterprise, EnterpriseFilters } from '@features/marketplace/types/enterprise.types'

export const EnterpriseList: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useI18n()
  const { 
    enterprises, 
    filters, 
    isLoading, 
    metrics,
    setFilters, 
    fetchEnterprises 
  } = useEnterpriseStore()

  const [searchQuery, setSearchQuery] = React.useState('')
  const [showFilters, setShowFilters] = React.useState(false)

  React.useEffect(() => {
    fetchEnterprises()
  }, [fetchEnterprises])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setFilters({ ...filters, search: query })
  }

  const handleCategoryFilter = (category: string) => {
    const newFilters = filters.category === category 
      ? { ...filters, category: undefined }
      : { ...filters, category }
    setFilters(newFilters)
  }

  const handleSortChange = (sortBy: EnterpriseFilters['sortBy']) => {
    setFilters({ ...filters, sortBy })
  }

  const formatCurrency = (amount: number, currency: 'BZR' | 'BRL') => {
    if (currency === 'BRL') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(amount)
    }
    return `${amount.toLocaleString('pt-BR')} BZR`
  }

  if (isLoading && enterprises.length === 0) {
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
              Empreendimentos
            </h1>
            <p className="text-matte-black-600">
              Descubra negócios únicos e inovadores na plataforma
            </p>
          </div>
          
          <Button onClick={() => navigate('/marketplace/enterprises/create')}>
            <Plus size={16} className="mr-2" />
            Criar Empreendimento
          </Button>
        </div>

        {/* Stats Cards */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-matte-black-600">Total</p>
                  <p className="text-2xl font-bold text-matte-black-900">
                    {metrics.totalEnterprises}
                  </p>
                </div>
                <TrendingUp className="text-bazari-red" size={24} />
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-matte-black-600">Verificados</p>
                  <p className="text-2xl font-bold text-success">
                    {metrics.verifiedEnterprises}
                  </p>
                </div>
                <Verified className="text-success" size={24} />
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-matte-black-600">Avaliação Média</p>
                  <p className="text-2xl font-bold text-bazari-gold-600">
                    {metrics.avgRating.toFixed(1)}
                  </p>
                </div>
                <Star className="text-bazari-gold-600" size={24} />
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-matte-black-600">Tokenizados</p>
                  <p className="text-2xl font-bold text-bazari-red">
                    {metrics.totalTokenizedEnterprises}
                  </p>
                </div>
                <div className="w-6 h-6 bg-bazari-red-100 rounded-full flex items-center justify-center">
                  <span className="text-bazari-red text-xs font-bold">T</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Buscar empreendimentos..."
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
            </Button>
            
            <select 
              className="px-3 py-2 border border-sand-200 rounded-lg text-sm"
              value={filters.sortBy || 'relevance'}
              onChange={(e) => handleSortChange(e.target.value as any)}
            >
              <option value="relevance">Relevância</option>
              <option value="newest">Mais Recente</option>
              <option value="rating">Melhor Avaliado</option>
              <option value="sales">Mais Vendas</option>
            </select>
          </div>
        </div>

        {/* Category Quick Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['digital', 'services', 'fashion', 'electronics', 'sports'].map((category) => (
            <Button
              key={category}
              variant={filters.category === category ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleCategoryFilter(category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Enterprises Grid */}
      {enterprises.length === 0 ? (
        <EmptyState
          title="Nenhum empreendimento encontrado"
          description="Seja o primeiro a criar um empreendimento na plataforma."
          action={
            <Button onClick={() => navigate('/marketplace/enterprises/create')}>
              <Plus size={16} className="mr-2" />
              Criar Primeiro Empreendimento
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {enterprises.map((enterprise) => (
            <motion.div
              key={enterprise.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
            >
              <Card
                className="overflow-hidden cursor-pointer h-full"
                onClick={() => navigate(`/marketplace/enterprises/${enterprise.id}`)}
              >
                {/* Banner */}
                <div className="aspect-video bg-gradient-to-br from-bazari-red-100 to-bazari-gold-100 relative">
                  {enterprise.banner ? (
                    <img 
                      src={enterprise.banner} 
                      alt={enterprise.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-6xl font-bold text-bazari-red-300">
                        {enterprise.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  )}
                  
                  {/* Verification Badge */}
                  {enterprise.verification.verified && (
                    <div className="absolute top-3 right-3">
                      <Badge variant="success" size="sm" className="flex items-center">
                        <Verified size={12} className="mr-1" />
                        Verificado
                      </Badge>
                    </div>
                  )}
                  
                  {/* Tokenization Badge */}
                  {enterprise.tokenizable && enterprise.tokenization?.enabled && (
                    <div className="absolute top-3 left-3">
                      <Badge variant="primary" size="sm">
                        Tokenizado
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Avatar
                        src={enterprise.logo}
                        alt={enterprise.name}
                        fallback={enterprise.name.charAt(0)}
                        size="sm"
                      />
                      <div>
                        <h3 className="font-semibold text-matte-black-900 line-clamp-1">
                          {enterprise.name}
                        </h3>
                        <p className="text-sm text-matte-black-600">
                          por {enterprise.ownerName}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-matte-black-700 mb-4 line-clamp-3">
                    {enterprise.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4 text-sm text-matte-black-600">
                      <div className="flex items-center">
                        <Star size={14} className="text-bazari-gold-600 mr-1" />
                        {enterprise.reputation.rating.toFixed(1)}
                        <span className="ml-1">({enterprise.reputation.reviewCount})</span>
                      </div>
                      
                      <div className="flex items-center">
                        <TrendingUp size={14} className="mr-1" />
                        {enterprise.stats.totalListings} produtos
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  {enterprise.address && (
                    <div className="flex items-center text-sm text-matte-black-600 mb-4">
                      <MapPin size={14} className="mr-1" />
                      {enterprise.address.city}, {enterprise.address.state}
                    </div>
                  )}

                  {/* Revenue */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-matte-black-600">Faturamento Total:</span>
                    <div className="flex space-x-2">
                      <span className="font-medium text-success">
                        {formatCurrency(enterprise.stats.totalRevenue.BRL, 'BRL')}
                      </span>
                      <span className="text-matte-black-400">+</span>
                      <span className="font-medium text-bazari-red">
                        {formatCurrency(enterprise.stats.totalRevenue.BZR, 'BZR')}
                      </span>
                    </div>
                  </div>

                  {/* Tokenization Info */}
                  {enterprise.tokenization?.enabled && (
                    <div className="mt-4 p-3 bg-bazari-red-50 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-bazari-red-700 font-medium">
                          Tokens Disponíveis:
                        </span>
                        <span className="text-bazari-red-900 font-bold">
                          {enterprise.tokenization.totalSupply! - enterprise.tokenization.currentSupply!}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-bazari-red-600">
                          Preço por Token:
                        </span>
                        <span className="text-bazari-red-800 font-medium">
                          {formatCurrency(enterprise.tokenization.mintPrice!, enterprise.tokenization.mintCurrency!)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Load More */}
      {enterprises.length > 0 && enterprises.length % 20 === 0 && (
        <div className="text-center mt-8">
          <Button variant="outline" onClick={() => fetchEnterprises(filters)}>
            Carregar Mais
          </Button>
        </div>
      )}
    </div>
  )
}