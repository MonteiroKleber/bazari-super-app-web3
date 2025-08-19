// src/features/marketplace/components/enterprise/EnterpriseListingFilters.tsx

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, X, SlidersHorizontal, ArrowUpDown, Search } from 'lucide-react'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { Input } from '@shared/ui/Input'
import { Select } from '@shared/ui/Select'
import { Badge } from '@shared/ui/Badge'
import { useI18n } from '@app/providers/I18nProvider'

export interface EnterpriseListingFilters {
  category: string
  subcategory: string
  priceMin: string
  priceMax: string
  condition: string
  sortBy: 'newest' | 'price_asc' | 'price_desc' | 'rating_desc' | 'views_desc'
}

interface EnterpriseListingFiltersProps {
  filters: EnterpriseListingFilters
  onFiltersChange: (filters: EnterpriseListingFilters) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  isVisible: boolean
  onToggleVisibility: () => void
  onClearFilters: () => void
  listingsCount: number
  className?: string
}

export const EnterpriseListingFilters: React.FC<EnterpriseListingFiltersProps> = ({
  filters,
  onFiltersChange,
  searchQuery,
  onSearchChange,
  isVisible,
  onToggleVisibility,
  onClearFilters,
  listingsCount,
  className = ''
}) => {
  const { t } = useI18n()

  const hasActiveFilters = Object.values(filters).some(value => value && value !== 'newest')
  const activeFilterCount = Object.values(filters).filter(value => value && value !== 'newest').length

  const categoryOptions = [
    { value: '', label: t('marketplace.all_categories') || 'Todas' },
    { value: 'electronics', label: 'Eletrônicos' },
    { value: 'clothing', label: 'Roupas & Acessórios' },
    { value: 'home', label: 'Casa & Jardim' },
    { value: 'books', label: 'Livros & Mídia' },
    { value: 'technology', label: 'Tecnologia' },
    { value: 'handcraft', label: 'Artesanato' },
    { value: 'sustainability', label: 'Sustentabilidade' },
    { value: 'sports', label: 'Esportes' },
    { value: 'beauty', label: 'Beleza & Cuidados' }
  ]

  const conditionOptions = [
    { value: '', label: t('marketplace.all_conditions') || 'Todas' },
    { value: 'new', label: t('marketplace.condition_new') || 'Novo' },
    { value: 'used', label: t('marketplace.condition_used') || 'Usado' },
    { value: 'refurbished', label: t('marketplace.condition_refurbished') || 'Recondicionado' }
  ]

  const sortOptions = [
    { value: 'newest', label: t('marketplace.sort_newest') || 'Mais Recentes' },
    { value: 'price_asc', label: t('marketplace.sort_price_asc') || 'Menor Preço' },
    { value: 'price_desc', label: t('marketplace.sort_price_desc') || 'Maior Preço' },
    { value: 'rating_desc', label: t('marketplace.sort_rating') || 'Melhor Avaliação' },
    { value: 'views_desc', label: t('marketplace.sort_popular') || 'Mais Visualizados' }
  ]

  const handleFilterChange = (key: keyof EnterpriseListingFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
      // Limpar subcategoria ao mudar categoria
      ...(key === 'category' && { subcategory: '' })
    })
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Cabeçalho com busca e controles */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Busca */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-matte-black-400" />
            <Input
              type="text"
              placeholder={t('enterpriseDetail.listings.searchPlaceholder') || 'Busque por título, categoria...'}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-10"
              aria-label="Buscar produtos"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-matte-black-400 hover:text-matte-black-600 transition-colors"
                aria-label="Limpar busca"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Controles */}
        <div className="flex items-center gap-2">
          {/* Contador de resultados */}
          <span className="text-sm text-matte-black-600 whitespace-nowrap">
            {listingsCount} {listingsCount === 1 ? 'produto' : 'produtos'}
          </span>

          {/* Botão de filtros */}
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleVisibility}
            className="flex items-center"
            aria-expanded={isVisible}
            aria-controls="enterprise-listing-filters"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            {t('marketplace.filters') || 'Filtros'}
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>

          {/* Ordenação rápida */}
          <Select
            value={filters.sortBy}
            onChange={(value) => handleFilterChange('sortBy', value as any)}
            options={sortOptions}
            className="min-w-[140px]"
            size="sm"
            aria-label="Ordenar por"
          />
        </div>
      </div>

      {/* Painel de filtros expansível */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            id="enterprise-listing-filters"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <Card className="p-4 bg-sand-50 border border-sand-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-matte-black-900">
                  {t('marketplace.filters') || 'Filtros'}
                </h3>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearFilters}
                    className="text-sm"
                  >
                    <X className="w-3 h-3 mr-1" />
                    {t('marketplace.clear_all') || 'Limpar'}
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {/* Categoria */}
                <div>
                  <Select
                    label={t('enterpriseDetail.listings.filters.category') || 'Categoria'}
                    value={filters.category}
                    onChange={(value) => handleFilterChange('category', value)}
                    options={categoryOptions}
                    size="sm"
                  />
                </div>

                {/* Preço Mínimo */}
                <div>
                  <Input
                    label={t('enterpriseDetail.listings.filters.priceMin') || 'Preço mín.'}
                    type="number"
                    placeholder="0"
                    value={filters.priceMin}
                    onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                    size="sm"
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* Preço Máximo */}
                <div>
                  <Input
                    label={t('enterpriseDetail.listings.filters.priceMax') || 'Preço máx.'}
                    type="number"
                    placeholder="999999"
                    value={filters.priceMax}
                    onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                    size="sm"
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* Condição */}
                <div>
                  <Select
                    label={t('enterpriseDetail.listings.filters.condition') || 'Condição'}
                    value={filters.condition}
                    onChange={(value) => handleFilterChange('condition', value)}
                    options={conditionOptions}
                    size="sm"
                  />
                </div>

                {/* Ordenação (repetida para mobile) */}
                <div className="sm:hidden">
                  <Select
                    label={t('enterpriseDetail.listings.filters.sortBy') || 'Ordenar por'}
                    value={filters.sortBy}
                    onChange={(value) => handleFilterChange('sortBy', value as any)}
                    options={sortOptions}
                    size="sm"
                  />
                </div>
              </div>

              {/* Resumo dos filtros ativos */}
              {hasActiveFilters && (
                <div className="mt-4 pt-4 border-t border-sand-200">
                  <p className="text-xs text-matte-black-600 mb-2">
                    {t('marketplace.active_filters') || 'Filtros ativos'}:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {filters.category && (
                      <Badge variant="secondary" className="text-xs">
                        {categoryOptions.find(opt => opt.value === filters.category)?.label}
                        <button
                          onClick={() => handleFilterChange('category', '')}
                          className="ml-1 hover:text-danger"
                          aria-label="Remover filtro de categoria"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    
                    {filters.priceMin && (
                      <Badge variant="secondary" className="text-xs">
                        Min: R$ {filters.priceMin}
                        <button
                          onClick={() => handleFilterChange('priceMin', '')}
                          className="ml-1 hover:text-danger"
                          aria-label="Remover filtro de preço mínimo"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    
                    {filters.priceMax && (
                      <Badge variant="secondary" className="text-xs">
                        Max: R$ {filters.priceMax}
                        <button
                          onClick={() => handleFilterChange('priceMax', '')}
                          className="ml-1 hover:text-danger"
                          aria-label="Remover filtro de preço máximo"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    
                    {filters.condition && (
                      <Badge variant="secondary" className="text-xs">
                        {conditionOptions.find(opt => opt.value === filters.condition)?.label}
                        <button
                          onClick={() => handleFilterChange('condition', '')}
                          className="ml-1 hover:text-danger"
                          aria-label="Remover filtro de condição"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default EnterpriseListingFilters