
import React, { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Link, useSearchParams } from 'react-router-dom'
import { 
  Search, 
  Filter, 
  Star, 
  MapPin, 
  Clock, 
  TrendingUp,
  Users,
  Plus,
  X,
  ChevronDown
} from 'lucide-react'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { Input } from '@shared/ui/Input'
import { Badge } from '@shared/ui/Badge'
import { Avatar } from '@shared/ui/Avatar'
import { Tabs } from '@shared/ui/Tabs'
import { LoadingSpinner } from '@shared/ui/LoadingSpinner'
import { EmptyState } from '@shared/ui/EmptyState'
import { useI18n } from '@app/providers/I18nProvider'
import { useOffersStore } from '../store/offersStore'
import { useP2PFilters } from '../hooks/useP2PFilters'
import { buildProfileRoute } from '../utils/profileRoute'
import { getPaymentMethodInfo } from '../services/payments'
import type { PaymentMethod } from '../types/p2p.types'

const ITEMS_PER_PAGE = 12

export const OffersBrowse: React.FC = () => {
  const { t } = useI18n()
  const [searchParams] = useSearchParams()
  const { offers, loading, error, fetchOffers } = useOffersStore()
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  // Initialize filters with URL sync
  const {
    filters,
    setFilters,
    clearFilters,
    setSide,
    setPaymentMethod,
    setPriceRange,
    setLocationFilter,
    setSearchQuery,
    setOwnerFilter
  } = useP2PFilters({
    syncWithUrl: true,
    debounceMs: 250,
    onFiltersChange: () => {
      setPage(1) // Reset page when filters change
    }
  })

  // Check for ownerId filter from URL
  useEffect(() => {
    const ownerId = searchParams.get('ownerId')
    if (ownerId && ownerId !== filters.ownerId) {
      setOwnerFilter(ownerId)
    }
  }, [searchParams, filters.ownerId, setOwnerFilter])

  // Fetch offers when filters change
  useEffect(() => {
    fetchOffers(filters).catch(console.error)
  }, [fetchOffers, filters])

  // Filter and paginate offers
  const { paginatedOffers, totalPages, hasMore } = useMemo(() => {
    const filtered = offers.filter(offer => {
      // Apply client-side filters if needed
      return true
    })

    const total = Math.ceil(filtered.length / ITEMS_PER_PAGE)
    const paginated = filtered.slice(0, page * ITEMS_PER_PAGE)
    const hasMore = page < total

    return {
      paginatedOffers: paginated,
      totalPages: total,
      hasMore
    }
  }, [offers, page])

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-matte-black-900">
            {t('p2p.offers.title')}
          </h1>
          <p className="text-matte-black-600 mt-1">
            {offers.length} {t('p2p.offers.available')}
          </p>
        </div>

        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden"
          >
            <Filter className="h-4 w-4 mr-2" />
            {t('p2p.filters.title')}
          </Button>

          <Link to="/p2p/offers/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('p2p.offers.create')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          {
            id: 'BUY',
            label: t('p2p.tabs.buy'),
            content: null
          },
          {
            id: 'SELL',
            label: t('p2p.tabs.sell'),
            content: null
          }
        ]}
        activeTab={filters.side}
        onTabChange={(side) => setSide(side as 'BUY' | 'SELL')}
        className="border-b border-sand-200"
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className={`lg:block ${showFilters ? 'block' : 'hidden'}`}>
          <Card className="p-4 sticky top-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-matte-black-900">
                {t('p2p.filters.title')}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs"
              >
                {t('p2p.filters.clear')}
              </Button>
            </div>

            <div className="space-y-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-matte-black-700 mb-2">
                  {t('p2p.filters.search')}
                </label>
                <Input
                  placeholder={t('p2p.filters.searchPlaceholder')}
                  value={filters.q || ''}
                  onChange={(e) => setSearchQuery(e.target.value || undefined)}
                  className="w-full"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-matte-black-700 mb-2">
                  {t('p2p.filters.payment')}
                </label>
                <select
                  value={filters.payment || ''}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod || undefined)}
                  className="w-full px-3 py-2 border border-sand-300 rounded-lg focus:ring-2 focus:ring-bazari-red focus:border-transparent"
                >
                  <option value="">{t('p2p.filters.allMethods')}</option>
                  <option value="PIX">PIX</option>
                  <option value="TED">TED</option>
                  <option value="DINHEIRO">{t('p2p.payment.cash')}</option>
                  <option value="OUTRO">{t('p2p.payment.other')}</option>
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-matte-black-700 mb-2">
                  {t('p2p.filters.priceRange')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder={t('p2p.filters.priceMin')}
                    value={filters.priceMin || ''}
                    onChange={(e) => setPriceRange(Number(e.target.value) || undefined, filters.priceMax)}
                    step="0.01"
                  />
                  <Input
                    type="number"
                    placeholder={t('p2p.filters.priceMax')}
                    value={filters.priceMax || ''}
                    onChange={(e) => setPriceRange(filters.priceMin, Number(e.target.value) || undefined)}
                    step="0.01"
                  />
                </div>
              </div>

              {/* Reputation */}
              <div>
                <label className="block text-sm font-medium text-matte-black-700 mb-2">
                  {t('p2p.filters.reputation')}
                </label>
                <select
                  value={filters.reputationMin || ''}
                  onChange={(e) => setFilters({ reputationMin: Number(e.target.value) || undefined })}
                  className="w-full px-3 py-2 border border-sand-300 rounded-lg focus:ring-2 focus:ring-bazari-red focus:border-transparent"
                >
                  <option value="">{t('p2p.filters.anyReputation')}</option>
                  <option value="3">3+ ⭐</option>
                  <option value="4">4+ ⭐</option>
                  <option value="4.5">4.5+ ⭐</option>
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-matte-black-700 mb-2">
                  {t('p2p.filters.location')}
                </label>
                <div className="space-y-2">
                  <Input
                    placeholder={t('p2p.filters.state')}
                    value={filters.state || ''}
                    onChange={(e) => setLocationFilter(filters.city, e.target.value || undefined)}
                  />
                  <Input
                    placeholder={t('p2p.filters.city')}
                    value={filters.city || ''}
                    onChange={(e) => setLocationFilter(e.target.value || undefined, filters.state)}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Offers List */}
        <div className="lg:col-span-3">
          {loading && paginatedOffers.length === 0 ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <Card className="p-8 text-center">
              <p className="text-danger mb-4">{error}</p>
              <Button onClick={() => fetchOffers(filters)}>
                {t('p2p.offers.retry')}
              </Button>
            </Card>
          ) : paginatedOffers.length === 0 ? (
            <EmptyState
              icon={<Users className="h-12 w-12 text-matte-black-400" />}
              title={t('p2p.empty.noOffers')}
              description={t('p2p.empty.noOffersDesc')}
              action={
                <Link to="/p2p/offers/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('p2p.offers.createFirst')}
                  </Button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-4">
              {/* Offers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paginatedOffers.map((offer, index) => (
                  <motion.div
                    key={offer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer group">
                      <div className="flex items-center justify-between mb-3">
                        <Badge 
                          variant={offer.side === 'BUY' ? 'success' : 'secondary'}
                        >
                          {t(`p2p.side.${offer.side.toLowerCase()}`)}
                        </Badge>
                        
                        {offer.reputation && (
                          <div className="flex items-center text-sm text-matte-black-600">
                            <Star className="h-4 w-4 text-bazari-gold-600 fill-current mr-1" />
                            {offer.reputation.score.toFixed(1)}
                            <span className="text-xs ml-1">
                              ({offer.stats?.completed || 0})
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="text-xl font-bold text-matte-black-900 mb-2">
                        R$ {offer.priceBZR.toFixed(2)} / BZR
                      </div>

                      <div className="text-sm text-matte-black-600 mb-3">
                        <div>{t('p2p.offer.limits')}: {offer.minAmount} - {offer.maxAmount} BZR</div>
                        {offer.side === 'SELL' && (
                          <div>{t('p2p.offer.available')}: {offer.availableAmount} BZR</div>
                        )}
                      </div>

                      {/* Payment Methods */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {offer.paymentMethods.map((method) => (
                          <Badge key={method} variant="outline" className="text-xs">
                            {getPaymentMethodInfo(method).name}
                          </Badge>
                        ))}
                      </div>

                      {/* Location */}
                      {offer.location && (
                        <div className="flex items-center text-xs text-matte-black-500 mb-3">
                          <MapPin className="h-3 w-3 mr-1" />
                          {offer.location.city}, {offer.location.state}
                        </div>
                      )}

                      {/* Owner & Action */}
                      <div className="flex items-center justify-between">
                        <Link
                          to={buildProfileRoute(offer.ownerId)}
                          className="flex items-center text-sm text-matte-black-700 hover:text-bazari-red transition-colors"
                          onClick={(e) => e.stopPropagation()}
                          aria-label={t('p2p.offer.card.viewProfileAria', { name: offer.ownerName })}
                        >
                          <Avatar 
                            src={offer.ownerAvatarUrl} 
                            fallback={offer.ownerName}
                            size="sm"
                            className="mr-2"
                          />
                          <span className="truncate max-w-24">
                            {offer.ownerName}
                          </span>
                        </Link>

                        <Link to={`/p2p/offers/${offer.id}`}>
                          <Button size="sm">
                            {t('p2p.offer.startTrade')}
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="text-center py-6">
                  <Button
                    variant="outline"
                    onClick={handleLoadMore}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner className="h-4 w-4 mr-2" />
                        {t('p2p.offers.loading')}
                      </>
                    ) : (
                      t('p2p.offers.loadMore')
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}