// src/features/marketplace/components/p2p/P2PFilters.tsx

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, X, Star, MapPin, DollarSign, Layers } from 'lucide-react'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { Input } from '@shared/ui/Input'
import { Badge } from '@shared/ui/Badge'
import { useI18n } from '@app/providers/I18nProvider'
import { P2PFilters as P2PFiltersType } from '../../types/p2p.types'

interface P2PFiltersProps {
  filters: P2PFiltersType
  onFiltersChange: (filters: P2PFiltersType) => void
  onClose?: () => void
  isOpen?: boolean
}

export const P2PFilters: React.FC<P2PFiltersProps> = ({
  filters,
  onFiltersChange,
  onClose,
  isOpen = true
}) => {
  const { t } = useI18n()
  
  const [localFilters, setLocalFilters] = React.useState<P2PFiltersType>(filters)
  const [activeFiltersCount, setActiveFiltersCount] = React.useState(0)

  const paymentMethods = [
    'PIX', 'TED', 'DOC', 'Dinheiro', 'PicPay', 'PayPal', 'Wise'
  ]

  const sortOptions = [
    { value: 'newest', label: 'Mais Recentes' },
    { value: 'price_asc', label: 'Menor Preço' },
    { value: 'price_desc', label: 'Maior Preço' },
    { value: 'amount_asc', label: 'Menor Quantidade' },
    { value: 'amount_desc', label: 'Maior Quantidade' },
    { value: 'rating_desc', label: 'Melhor Avaliação' }
  ]

  // Count active filters
  React.useEffect(() => {
    let count = 0
    if (localFilters.direction && localFilters.direction !== 'all') count++
    if (localFilters.priceRange) count++
    if (localFilters.amountRange) count++
    if (localFilters.paymentMethod) count++
    if (localFilters.minReputationRating && localFilters.minReputationRating > 0) count++
    if (localFilters.location?.city) count++
    if (localFilters.escrowOnly) count++
    setActiveFiltersCount(count)
  }, [localFilters])

  const handleFilterChange = (key: keyof P2PFiltersType, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
  }

  const handlePriceRangeChange = (field: 'min' | 'max', value: string) => {
    const numValue = parseFloat(value) || undefined
    const newRange = { 
      ...localFilters.priceRange,
      [field]: numValue
    }
    
    // Remove range if both values are empty
    if (!newRange.min && !newRange.max) {
      handleFilterChange('priceRange', undefined)
    } else {
      handleFilterChange('priceRange', newRange)
    }
  }

  const handleAmountRangeChange = (field: 'min' | 'max', value: string) => {
    const numValue = parseFloat(value) || undefined
    const newRange = { 
      ...localFilters.amountRange,
      [field]: numValue
    }
    
    // Remove range if both values are empty
    if (!newRange.min && !newRange.max) {
      handleFilterChange('amountRange', undefined)
    } else {
      handleFilterChange('amountRange', newRange)
    }
  }

  const handleLocationChange = (field: 'city' | 'state' | 'radius', value: string | number) => {
    const newLocation = { 
      ...localFilters.location,
      [field]: value || undefined
    }
    
    // Remove location if all values are empty
    if (!newLocation.city && !newLocation.state && !newLocation.radius) {
      handleFilterChange('location', undefined)
    } else {
      handleFilterChange('location', newLocation)
    }
  }

  const handleApplyFilters = () => {
    onFiltersChange(localFilters)
    onClose?.()
  }

  const handleResetFilters = () => {
    const resetFilters: P2PFiltersType = {
      direction: 'all',
      sortBy: 'newest'
    }
    setLocalFilters(resetFilters)
    onFiltersChange(resetFilters)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Filter className="text-bazari-red mr-2" size={20} />
              <h3 className="text-lg font-semibold text-matte-black-900">
                Filtros P2P
              </h3>
              {activeFiltersCount > 0 && (
                <Badge variant="primary" size="sm" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </div>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X size={16} />
              </Button>
            )}
          </div>

          <div className="space-y-6">
            {/* Direction Filter */}
            <div>
              <label className="block text-sm font-medium text-matte-black-900 mb-3">
                Tipo de Operação
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'all', label: 'Todos', icon: '🔄' },
                  { value: 'buy', label: 'Comprando', icon: '💰' },
                  { value: 'sell', label: 'Vendendo', icon: '🪙' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleFilterChange('direction', option.value)}
                    className={`p-3 rounded-lg border text-center transition-colors ${
                      localFilters.direction === option.value
                        ? 'border-bazari-red bg-bazari-red-50 text-bazari-red'
                        : 'border-sand-200 hover:border-sand-300 text-matte-black-700'
                    }`}
                  >
                    <div className="text-lg mb-1">{option.icon}</div>
                    <div className="text-sm font-medium">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-matte-black-900 mb-3">
                <DollarSign className="inline mr-1" size={16} />
                Faixa de Preço (por BZR)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Mín (R$)"
                  type="number"
                  step="0.001"
                  value={localFilters.priceRange?.min || ''}
                  onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                />
                <Input
                  placeholder="Máx (R$)"
                  type="number"
                  step="0.001"
                  value={localFilters.priceRange?.max || ''}
                  onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                />
              </div>
              {localFilters.priceRange && (
                <div className="mt-2 text-sm text-matte-black-600">
                  {localFilters.priceRange.min && localFilters.priceRange.max
                    ? `${formatCurrency(localFilters.priceRange.min)} - ${formatCurrency(localFilters.priceRange.max)}`
                    : localFilters.priceRange.min
                    ? `A partir de ${formatCurrency(localFilters.priceRange.min)}`
                    : localFilters.priceRange.max
                    ? `Até ${formatCurrency(localFilters.priceRange.max)}`
                    : ''
                  }
                </div>
              )}
            </div>

            {/* Amount Range */}
            <div>
              <label className="block text-sm font-medium text-matte-black-900 mb-3">
                <Layers className="inline mr-1" size={16} />
                Quantidade (BZR)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Mín BZR"
                  type="number"
                  value={localFilters.amountRange?.min || ''}
                  onChange={(e) => handleAmountRangeChange('min', e.target.value)}
                />
                <Input
                  placeholder="Máx BZR"
                  type="number"
                  value={localFilters.amountRange?.max || ''}
                  onChange={(e) => handleAmountRangeChange('max', e.target.value)}
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-matte-black-900 mb-3">
                Método de Pagamento
              </label>
              <div className="grid grid-cols-2 gap-2">
                {paymentMethods.map((method) => (
                  <button
                    key={method}
                    onClick={() => handleFilterChange('paymentMethod', 
                      localFilters.paymentMethod === method ? undefined : method
                    )}
                    className={`p-2 rounded-lg border text-left transition-colors ${
                      localFilters.paymentMethod === method
                        ? 'border-bazari-red bg-bazari-red-50 text-bazari-red'
                        : 'border-sand-200 hover:border-sand-300 text-matte-black-700'
                    }`}
                  >
                    <div className="text-sm font-medium">{method}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Minimum Rating */}
            <div>
              <label className="block text-sm font-medium text-matte-black-900 mb-3">
                <Star className="inline mr-1" size={16} />
                Reputação Mínima
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[0, 3, 3.5, 4, 4.5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleFilterChange('minReputationRating',
                      localFilters.minReputationRating === rating ? undefined : rating
                    )}
                    className={`p-2 rounded-lg border text-center transition-colors ${
                      localFilters.minReputationRating === rating
                        ? 'border-bazari-gold-500 bg-bazari-gold-50 text-bazari-gold-700'
                        : 'border-sand-200 hover:border-sand-300 text-matte-black-700'
                    }`}
                  >
                    <div className="text-sm">
                      {rating === 0 ? 'Todas' : `${rating}+`}
                    </div>
                    {rating > 0 && (
                      <Star className="mx-auto mt-1" size={12} fill="currentColor" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-matte-black-900 mb-3">
                <MapPin className="inline mr-1" size={16} />
                Localização
              </label>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Cidade"
                    value={localFilters.location?.city || ''}
                    onChange={(e) => handleLocationChange('city', e.target.value)}
                  />
                  <Input
                    placeholder="Estado"
                    value={localFilters.location?.state || ''}
                    onChange={(e) => handleLocationChange('state', e.target.value)}
                  />
                </div>
                {(localFilters.location?.city || localFilters.location?.state) && (
                  <Input
                    placeholder="Raio (km)"
                    type="number"
                    value={localFilters.location?.radius || ''}
                    onChange={(e) => handleLocationChange('radius', parseInt(e.target.value) || 0)}
                  />
                )}
              </div>
            </div>

            {/* Escrow Only */}
            <div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="escrowOnly"
                  checked={localFilters.escrowOnly || false}
                  onChange={(e) => handleFilterChange('escrowOnly', e.target.checked || undefined)}
                  className="w-4 h-4 text-bazari-red border-gray-300 rounded focus:ring-bazari-red"
                />
                <label htmlFor="escrowOnly" className="text-sm font-medium text-matte-black-900">
                  Apenas anúncios com escrow
                </label>
              </div>
              <p className="text-xs text-matte-black-600 mt-1 ml-7">
                Mostar apenas negociações com proteção automática
              </p>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-matte-black-900 mb-3">
                Ordenar Por
              </label>
              <select
                value={localFilters.sortBy || 'newest'}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-sand-200 rounded-lg focus:ring-2 focus:ring-bazari-red-500 focus:border-transparent"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-sand-200">
            <Button variant="outline" onClick={handleResetFilters}>
              Limpar Filtros
            </Button>
            
            <div className="flex space-x-3">
              {onClose && (
                <Button variant="ghost" onClick={onClose}>
                  Cancelar
                </Button>
              )}
              <Button onClick={handleApplyFilters}>
                Aplicar Filtros
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" size="sm" className="ml-2">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}