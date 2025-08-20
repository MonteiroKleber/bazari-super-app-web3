// src/features/p2p/components/OffersBrowse.tsx
// PÁGINA DEFINITIVA COMPLETA - Todos os filtros funcionando

import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
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
  ChevronDown,
  SlidersHorizontal,
  ArrowUpDown,
  Grid,
  List,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  CreditCard,
  Shield,
  Zap
} from 'lucide-react'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { Input } from '@shared/ui/Input'
import { Badge } from '@shared/ui/Badge'
import { Avatar } from '@shared/ui/Avatar'
import { LoadingSpinner } from '@shared/ui/LoadingSpinner'
import { EmptyState } from '@shared/ui/EmptyState'
import { useI18n } from '@app/providers/I18nProvider'
import { useAuthStore } from '@features/auth/store/authStore'
import type { PaymentMethod, P2POffer, P2PFilters } from '../types/p2p.types'

// ==========================================
// MOCK DATA COMPLETO E VARIADO
// ==========================================

const generateCompleteMockData = (): P2POffer[] => {
  const users = [
    { id: 'user_001', name: 'Ana Silva', rating: 4.9, trades: 147, avatar: null },
    { id: 'user_002', name: 'Carlos Mendes', rating: 4.7, trades: 89, avatar: null },
    { id: 'user_003', name: 'Lucia Santos', rating: 4.8, trades: 203, avatar: null },
    { id: 'user_004', name: 'Pedro Costa', rating: 4.5, trades: 45, avatar: null },
    { id: 'user_005', name: 'Maria Oliveira', rating: 4.6, trades: 76, avatar: null },
    { id: 'user_006', name: 'João Pereira', rating: 4.8, trades: 128, avatar: null },
    { id: 'user_007', name: 'Fernanda Lima', rating: 4.9, trades: 185, avatar: null },
    { id: 'user_008', name: 'Ricardo Santos', rating: 4.4, trades: 52, avatar: null },
    { id: 'user_009', name: 'Patrícia Rocha', rating: 4.7, trades: 94, avatar: null },
    { id: 'user_010', name: 'Roberto Silva', rating: 4.6, trades: 67, avatar: null }
  ]

  const cities = [
    { city: 'São Paulo', state: 'SP' },
    { city: 'Rio de Janeiro', state: 'RJ' },
    { city: 'Belo Horizonte', state: 'MG' },
    { city: 'Salvador', state: 'BA' },
    { city: 'Brasília', state: 'DF' },
    { city: 'Curitiba', state: 'PR' },
    { city: 'Porto Alegre', state: 'RS' },
    { city: 'Recife', state: 'PE' },
    { city: 'Fortaleza', state: 'CE' },
    { city: 'Goiânia', state: 'GO' }
  ]

  const paymentMethodCombos = [
    ['PIX'],
    ['TED'],
    ['DINHEIRO'],
    ['PIX', 'TED'],
    ['PIX', 'DINHEIRO'],
    ['PIX', 'TED', 'DINHEIRO'],
    ['TED', 'DINHEIRO'],
    ['PIX', 'OUTRO'],
    ['OUTRO']
  ]

  const terms = [
    'Pagamento em até 30 minutos. Somente pessoas verificadas.',
    'Aceito pagamento rápido. Boa reputação necessária.',
    'Transação segura e rápida. Escrow disponível.',
    'Negociação apenas com usuários verificados.',
    'Pagamento instantâneo. Sem burocracia.',
    null,
    'Aceito grandes volumes. Preços negociáveis.',
    'Transação rápida e segura.',
    null,
    'Experiência comprovada no mercado P2P.'
  ]

  const offers: P2POffer[] = []

  // Gerar ofertas SELL (vendas) - 15 ofertas
  users.forEach((user, index) => {
    if (index < 8) { // 8 ofertas de venda
      const location = cities[Math.floor(Math.random() * cities.length)]
      const paymentMethods = paymentMethodCombos[Math.floor(Math.random() * paymentMethodCombos.length)]
      
      offers.push({
        id: `sell_${user.id}_${Date.now()}_${index}`,
        side: 'SELL',
        priceBZR: Number((5.05 + Math.random() * 0.50).toFixed(2)), // 5.05 a 5.55
        minAmount: String(Math.floor(50 + Math.random() * 100)), // 50-150
        maxAmount: String(Math.floor(500 + Math.random() * 1500)), // 500-2000
        availableAmount: String(Math.floor(400 + Math.random() * 1100)), // 400-1500
        fiatCurrency: 'BRL',
        paymentMethods: paymentMethods as PaymentMethod[],
        location: {
          city: location.city,
          state: location.state,
          country: 'Brasil'
        },
        ownerId: user.id,
        ownerName: user.name,
        ownerAvatarUrl: user.avatar,
        terms: terms[Math.floor(Math.random() * terms.length)],
        createdAt: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000, // Última semana
        stats: {
          completed: user.trades,
          cancelRatePct: Math.random() * 5,
          avgReleaseTimeSec: 300 + Math.random() * 900
        },
        reputation: {
          score: user.rating,
          level: user.rating > 4.7 ? 'trusted' : user.rating > 4.5 ? 'pro' : 'new'
        }
      })
    }
  })

  // Gerar ofertas BUY (compras) - 12 ofertas
  users.forEach((user, index) => {
    if (index < 7) { // 7 ofertas de compra
      const location = cities[Math.floor(Math.random() * cities.length)]
      const paymentMethods = paymentMethodCombos[Math.floor(Math.random() * paymentMethodCombos.length)]
      
      offers.push({
        id: `buy_${user.id}_${Date.now()}_${index}`,
        side: 'BUY',
        priceBZR: Number((4.95 + Math.random() * 0.35).toFixed(2)), // 4.95 a 5.30
        minAmount: String(Math.floor(100 + Math.random() * 150)), // 100-250
        maxAmount: String(Math.floor(800 + Math.random() * 1200)), // 800-2000
        availableAmount: '0', // BUY offers não têm availableAmount
        fiatCurrency: 'BRL',
        paymentMethods: paymentMethods as PaymentMethod[],
        location: {
          city: location.city,
          state: location.state,
          country: 'Brasil'
        },
        ownerId: user.id,
        ownerName: user.name,
        ownerAvatarUrl: user.avatar,
        terms: terms[Math.floor(Math.random() * terms.length)],
        createdAt: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
        stats: {
          completed: user.trades,
          cancelRatePct: Math.random() * 5,
          avgReleaseTimeSec: 300 + Math.random() * 900
        },
        reputation: {
          score: user.rating,
          level: user.rating > 4.7 ? 'trusted' : user.rating > 4.5 ? 'pro' : 'new'
        }
      })
    }
  })

  console.log(`🎯 Generated ${offers.length} total offers`)
  console.log(`🔥 SELL offers: ${offers.filter(o => o.side === 'SELL').length}`)
  console.log(`🔥 BUY offers: ${offers.filter(o => o.side === 'BUY').length}`)
  console.log(`💳 Payment methods distribution:`, {
    PIX: offers.filter(o => o.paymentMethods.includes('PIX')).length,
    TED: offers.filter(o => o.paymentMethods.includes('TED')).length,
    DINHEIRO: offers.filter(o => o.paymentMethods.includes('DINHEIRO')).length,
    OUTRO: offers.filter(o => o.paymentMethods.includes('OUTRO')).length
  })

  return offers
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

const ITEMS_PER_PAGE = 8

export const OffersBrowse: React.FC = () => {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuthStore()

  // Estados principais
  const [allOffers] = useState<P2POffer[]>(() => generateCompleteMockData())
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(true)

  // Estados de interface
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [page, setPage] = useState(1)

  // Estados de filtros
  const [filters, setFilters] = useState<P2PFilters>({
    side: 'SELL'
  })

  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'rating_desc' | 'amount_asc' | 'amount_desc'>('newest')

  // Inicialização com URL params
  useEffect(() => {
    const urlSide = searchParams.get('side')
    const urlPayment = searchParams.get('payment')
    const urlCity = searchParams.get('city')
    const urlQ = searchParams.get('q')

    const urlFilters: Partial<P2PFilters> = {}
    
    if (urlSide === 'BUY' || urlSide === 'SELL') {
      urlFilters.side = urlSide
    }
    if (urlPayment && ['PIX', 'TED', 'DINHEIRO', 'OUTRO'].includes(urlPayment)) {
      urlFilters.payment = urlPayment as PaymentMethod
    }
    if (urlCity) urlFilters.city = urlCity
    if (urlQ) urlFilters.q = urlQ

    if (Object.keys(urlFilters).length > 0) {
      setFilters(prev => ({ ...prev, ...urlFilters }))
    }
  }, [searchParams])

  // Aplicar filtros em tempo real
  const filteredOffers = useMemo(() => {
    console.log('🔄 Applying filters to', allOffers.length, 'offers:', filters)
    let filtered = [...allOffers]

    // Filtro de side (BUY/SELL)
    if (filters.side) {
      filtered = filtered.filter(offer => offer.side === filters.side)
      console.log(`🎯 Side filter (${filters.side}): ${filtered.length} offers`)
    }

    // Filtro de método de pagamento
    if (filters.payment && filters.payment !== '') {
      filtered = filtered.filter(offer => offer.paymentMethods.includes(filters.payment!))
      console.log(`💳 Payment filter (${filters.payment}): ${filtered.length} offers`)
    }

    // Filtro de preço
    if (filters.priceMin && filters.priceMin > 0) {
      filtered = filtered.filter(offer => offer.priceBZR >= filters.priceMin!)
      console.log(`💰 Price min filter (${filters.priceMin}): ${filtered.length} offers`)
    }

    if (filters.priceMax && filters.priceMax > 0) {
      filtered = filtered.filter(offer => offer.priceBZR <= filters.priceMax!)
      console.log(`💰 Price max filter (${filters.priceMax}): ${filtered.length} offers`)
    }

    // Filtro de reputação
    if (filters.reputationMin && filters.reputationMin > 0) {
      filtered = filtered.filter(offer => 
        offer.reputation?.score && offer.reputation.score >= filters.reputationMin!
      )
      console.log(`⭐ Reputation filter (${filters.reputationMin}): ${filtered.length} offers`)
    }

    // Filtro de cidade
    if (filters.city && filters.city.trim() !== '') {
      const city = filters.city.toLowerCase().trim()
      filtered = filtered.filter(offer => 
        offer.location?.city?.toLowerCase().includes(city)
      )
      console.log(`📍 City filter (${filters.city}): ${filtered.length} offers`)
    }

    // Filtro de estado
    if (filters.state && filters.state.trim() !== '') {
      const state = filters.state.toLowerCase().trim()
      filtered = filtered.filter(offer => 
        offer.location?.state?.toLowerCase().includes(state)
      )
      console.log(`🗺️ State filter (${filters.state}): ${filtered.length} offers`)
    }

    // Filtro de busca
    if (filters.q && filters.q.trim() !== '') {
      const query = filters.q.toLowerCase().trim()
      filtered = filtered.filter(offer => 
        offer.ownerName?.toLowerCase().includes(query) ||
        offer.terms?.toLowerCase().includes(query) ||
        offer.location?.city?.toLowerCase().includes(query)
      )
      console.log(`🔍 Search filter (${filters.q}): ${filtered.length} offers`)
    }

    // Aplicar ordenação
    switch (sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => a.priceBZR - b.priceBZR)
        break
      case 'price_desc':
        filtered.sort((a, b) => b.priceBZR - a.priceBZR)
        break
      case 'rating_desc':
        filtered.sort((a, b) => (b.reputation?.score || 0) - (a.reputation?.score || 0))
        break
      case 'amount_asc':
        filtered.sort((a, b) => parseFloat(a.minAmount) - parseFloat(b.minAmount))
        break
      case 'amount_desc':
        filtered.sort((a, b) => parseFloat(b.maxAmount) - parseFloat(a.maxAmount))
        break
      case 'newest':
      default:
        filtered.sort((a, b) => b.createdAt - a.createdAt)
        break
    }

    console.log(`✅ Final filtered and sorted offers: ${filtered.length}`)
    return filtered
  }, [allOffers, filters, sortBy])

  // Paginação
  const { paginatedOffers, totalPages, hasMore } = useMemo(() => {
    const total = Math.ceil(filteredOffers.length / ITEMS_PER_PAGE)
    const paginated = filteredOffers.slice(0, page * ITEMS_PER_PAGE)
    const hasMore = page < total

    return {
      paginatedOffers: paginated,
      totalPages: total,
      hasMore
    }
  }, [filteredOffers, page])

  // Handlers de filtro
  const updateFilter = useCallback((patch: Partial<P2PFilters>) => {
    console.log('🔧 Updating filter:', patch)
    
    setFilters(prev => {
      const newFilters = { ...prev, ...patch }
      
      // Sync com URL
      const newSearchParams = new URLSearchParams(searchParams)
      Object.entries(patch).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
          newSearchParams.delete(key)
        } else {
          newSearchParams.set(key, String(value))
        }
      })
      setSearchParams(newSearchParams, { replace: true })
      
      return newFilters
    })
    setPage(1) // Reset pagination
  }, [searchParams, setSearchParams])

  const setSide = useCallback((side: 'BUY' | 'SELL') => {
    updateFilter({ side })
  }, [updateFilter])

  const setPaymentMethod = useCallback((payment?: PaymentMethod) => {
    const cleanPayment = (payment === '' || payment === null) ? undefined : payment
    updateFilter({ payment: cleanPayment })
  }, [updateFilter])

  const setPriceRange = useCallback((min?: number, max?: number) => {
    const cleanMin = (min && min > 0) ? min : undefined
    const cleanMax = (max && max > 0) ? max : undefined
    updateFilter({ priceMin: cleanMin, priceMax: cleanMax })
  }, [updateFilter])

  const setSearchQuery = useCallback((q?: string) => {
    const cleanQuery = (q && q.trim() !== '') ? q.trim() : undefined
    updateFilter({ q: cleanQuery })
  }, [updateFilter])

  const setLocationFilter = useCallback((city?: string, state?: string) => {
    const cleanCity = (city && city.trim() !== '') ? city.trim() : undefined
    const cleanState = (state && state.trim() !== '') ? state.trim() : undefined
    updateFilter({ city: cleanCity, state: cleanState })
  }, [updateFilter])

  const setReputationFilter = useCallback((rating?: number) => {
    const cleanRating = (rating && rating > 0) ? rating : undefined
    updateFilter({ reputationMin: cleanRating })
  }, [updateFilter])

  const clearAllFilters = useCallback(() => {
    console.log('🧹 Clearing all filters')
    setFilters({ side: 'SELL' })
    setPage(1)
    setSortBy('newest')
    setSearchParams(new URLSearchParams(), { replace: true })
  }, [setSearchParams])

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1)
    }
  }

  // Handler do payment select
  const handlePaymentSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    console.log('📝 Payment select changed to:', value, typeof value)
    setPaymentMethod(value === '' ? undefined : value as PaymentMethod)
  }

  // Stats para exibição
  const stats = useMemo(() => {
    return {
      total: allOffers.length,
      sell: allOffers.filter(o => o.side === 'SELL').length,
      buy: allOffers.filter(o => o.side === 'BUY').length,
      filtered: filteredOffers.length,
      avgPrice: filteredOffers.length > 0 ? 
        (filteredOffers.reduce((sum, o) => sum + o.priceBZR, 0) / filteredOffers.length).toFixed(2) : '0',
      paymentMethods: {
        PIX: allOffers.filter(o => o.paymentMethods.includes('PIX')).length,
        TED: allOffers.filter(o => o.paymentMethods.includes('TED')).length,
        DINHEIRO: allOffers.filter(o => o.paymentMethods.includes('DINHEIRO')).length,
        OUTRO: allOffers.filter(o => o.paymentMethods.includes('OUTRO')).length
      }
    }
  }, [allOffers, filteredOffers])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-matte-black-600">Carregando ofertas...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-matte-black-900">
                Cambio P2P
              </h1>
              <p className="text-matte-black-600 mt-1">
                {stats.filtered} de {stats.total} ofertas disponíveis
                {filters.payment && ` • Filtro: ${filters.payment}`}
                {filters.q && ` • Busca: "${filters.q}"`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
                {Object.keys(filters).filter(k => filters[k as keyof P2PFilters] && k !== 'side').length > 0 && (
                  <Badge variant="primary" size="sm" className="ml-2">
                    {Object.keys(filters).filter(k => filters[k as keyof P2PFilters] && k !== 'side').length}
                  </Badge>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
              </Button>

              <Link to="/p2p/offers/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Oferta
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-bazari-red">{stats.sell}</div>
              <div className="text-sm text-matte-black-600">Vendas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{stats.buy}</div>
              <div className="text-sm text-matte-black-600">Compras</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-bazari-red">R$ {stats.avgPrice}</div>
              <div className="text-sm text-matte-black-600">Preço Médio</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-matte-black-900">{stats.paymentMethods.PIX}</div>
              <div className="text-sm text-matte-black-600">Com PIX</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-matte-black-900">{stats.paymentMethods.TED}</div>
              <div className="text-sm text-matte-black-600">Com TED</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex space-x-1 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setSide('SELL')}
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filters.side === 'SELL'
                    ? 'bg-white text-bazari-red shadow-sm'
                    : 'text-matte-black-600 hover:text-matte-black-900'
                }`}
              >
                🔥 Vender BZR
                <span className="ml-2 text-xs opacity-70 bg-gray-200 px-2 py-1 rounded-full">
                  {filteredOffers.filter(o => o.side === 'SELL').length}
                </span>
              </button>
              <button
                onClick={() => setSide('BUY')}
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filters.side === 'BUY'
                    ? 'bg-white text-bazari-red shadow-sm'
                    : 'text-matte-black-600 hover:text-matte-black-900'
                }`}
              >
                💰 Comprar BZR
                <span className="ml-2 text-xs opacity-70 bg-gray-200 px-2 py-1 rounded-full">
                  {filteredOffers.filter(o => o.side === 'BUY').length}
                </span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-bazari-red focus:border-transparent"
              >
                <option value="newest">Mais Recentes</option>
                <option value="price_asc">Menor Preço</option>
                <option value="price_desc">Maior Preço</option>
                <option value="rating_desc">Melhor Avaliação</option>
                <option value="amount_asc">Menor Quantidade</option>
                <option value="amount_desc">Maior Quantidade</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Filters Sidebar */}
          <div className={`lg:block ${showFilters ? 'block' : 'hidden'}`}>
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-matte-black-900 flex items-center">
                  <SlidersHorizontal className="h-5 w-5 mr-2" />
                  Filtros
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-sm"
                >
                  Limpar Tudo
                </Button>
              </div>

              <div className="space-y-6">
                
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-matte-black-700 mb-3">
                    <Search className="h-4 w-4 inline mr-2" />
                    Buscar
                  </label>
                  <Input
                    placeholder="Buscar por usuário, cidade ou termos..."
                    value={filters.q || ''}
                    onChange={(e) => setSearchQuery(e.target.value || undefined)}
                    className="w-full"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-matte-black-700 mb-3">
                    <CreditCard className="h-4 w-4 inline mr-2" />
                    Método de Pagamento
                  </label>
                  <select
                    value={filters.payment || ''}
                    onChange={handlePaymentSelectChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bazari-red focus:border-transparent"
                  >
                    <option value="">🌐 Todos os métodos ({stats.total})</option>
                    <option value="PIX">💳 PIX ({stats.paymentMethods.PIX})</option>
                    <option value="TED">🏦 TED ({stats.paymentMethods.TED})</option>
                    <option value="DINHEIRO">💵 Dinheiro ({stats.paymentMethods.DINHEIRO})</option>
                    <option value="OUTRO">🔄 Outro ({stats.paymentMethods.OUTRO})</option>
                  </select>
                </div>

                {/* Quick Payment Filters */}
                <div>
                  <label className="block text-sm font-medium text-matte-black-700 mb-3">
                    Filtros Rápidos
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant={filters.payment === 'PIX' ? 'primary' : 'outline'}
                      onClick={() => setPaymentMethod(filters.payment === 'PIX' ? undefined : 'PIX')}
                      className="text-xs"
                    >
                      PIX ({stats.paymentMethods.PIX})
                    </Button>
                    <Button
                      size="sm"
                      variant={filters.payment === 'TED' ? 'primary' : 'outline'}
                      onClick={() => setPaymentMethod(filters.payment === 'TED' ? undefined : 'TED')}
                      className="text-xs"
                    >
                      TED ({stats.paymentMethods.TED})
                    </Button>
                    <Button
                      size="sm"
                      variant={filters.payment === 'DINHEIRO' ? 'primary' : 'outline'}
                      onClick={() => setPaymentMethod(filters.payment === 'DINHEIRO' ? undefined : 'DINHEIRO')}
                      className="text-xs"
                    >
                      Dinheiro ({stats.paymentMethods.DINHEIRO})
                    </Button>
                    <Button
                      size="sm"
                      variant={!filters.payment ? 'primary' : 'outline'}
                      onClick={() => setPaymentMethod(undefined)}
                      className="text-xs"
                    >
                      Todos ({stats.total})
                    </Button>
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-matte-black-700 mb-3">
                    💰 Faixa de Preço (BRL por BZR)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="number"
                      placeholder="Mín"
                      value={filters.priceMin || ''}
                      onChange={(e) => setPriceRange(e.target.value ? Number(e.target.value) : undefined, filters.priceMax)}
                      step="0.01"
                      min="0"
                    />
                    <Input
                      type="number"
                      placeholder="Máx"
                      value={filters.priceMax || ''}
                      onChange={(e) => setPriceRange(filters.priceMin, e.target.value ? Number(e.target.value) : undefined)}
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>

                {/* Reputation */}
                <div>
                  <label className="block text-sm font-medium text-matte-black-700 mb-3">
                    <Star className="h-4 w-4 inline mr-2" />
                    Reputação Mínima
                  </label>
                  <div className="grid grid-cols-5 gap-1">
                    {[0, 4.0, 4.3, 4.5, 4.7].map((rating) => (
                      <Button
                        key={rating}
                        size="sm"
                        variant={filters.reputationMin === rating ? 'primary' : 'outline'}
                        onClick={() => setReputationFilter(filters.reputationMin === rating ? undefined : rating)}
                        className="text-xs px-2"
                      >
                        {rating === 0 ? 'Todas' : `${rating}+`}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-matte-black-700 mb-3">
                    <MapPin className="h-4 w-4 inline mr-2" />
                    Localização
                  </label>
                  <div className="space-y-3">
                    <Input
                      placeholder="Cidade"
                      value={filters.city || ''}
                      onChange={(e) => setLocationFilter(e.target.value || undefined, filters.state)}
                    />
                    <Input
                      placeholder="Estado (SP, RJ, MG...)"
                      value={filters.state || ''}
                      onChange={(e) => setLocationFilter(filters.city, e.target.value || undefined)}
                      maxLength={2}
                    />
                  </div>
                </div>

                {/* Active Filters */}
                {Object.keys(filters).filter(k => filters[k as keyof P2PFilters] && k !== 'side').length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-matte-black-700 mb-3">
                      Filtros Ativos
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {filters.payment && (
                        <Badge variant="primary" className="flex items-center gap-1">
                          {filters.payment}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => setPaymentMethod(undefined)}
                          />
                        </Badge>
                      )}
                      {filters.q && (
                        <Badge variant="primary" className="flex items-center gap-1">
                          "{filters.q}"
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => setSearchQuery(undefined)}
                          />
                        </Badge>
                      )}
                      {filters.city && (
                        <Badge variant="primary" className="flex items-center gap-1">
                          {filters.city}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => setLocationFilter(undefined, filters.state)}
                          />
                        </Badge>
                      )}
                      {(filters.priceMin || filters.priceMax) && (
                        <Badge variant="primary" className="flex items-center gap-1">
                          R$ {filters.priceMin || '0'}-{filters.priceMax || '∞'}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => setPriceRange(undefined, undefined)}
                          />
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* Offers Grid */}
          <div className="lg:col-span-3">
            {filteredOffers.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12">
                <EmptyState
                  title={`Nenhuma oferta ${filters.side === 'BUY' ? 'de compra' : 'de venda'} encontrada`}
                  description="Ajuste os filtros ou seja o primeiro a criar uma oferta."
                  action={
                    <div className="space-y-3">
                      <Link to="/p2p/offers/new">
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Criar Primeira Oferta
                        </Button>
                      </Link>
                      <Button variant="outline" onClick={clearAllFilters}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Limpar Filtros
                      </Button>
                    </div>
                  }
                />
              </div>
            ) : (
              <>
                {/* Results Info */}
                <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-matte-black-600">
                      Mostrando <span className="font-semibold">{Math.min(paginatedOffers.length, ITEMS_PER_PAGE)}</span> de <span className="font-semibold">{filteredOffers.length}</span> ofertas
                      {filteredOffers.length !== stats.total && (
                        <span> (filtrado de {stats.total} total)</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-matte-black-600">
                      <Clock className="h-4 w-4" />
                      Atualizado agora
                    </div>
                  </div>
                </div>

                {/* Offers List */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${filters.side}-${filters.payment}-${sortBy}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className={viewMode === 'grid' 
                      ? 'grid grid-cols-1 xl:grid-cols-2 gap-6' 
                      : 'space-y-4'
                    }
                  >
                    {paginatedOffers.map((offer, index) => (
                      <OfferCard
                        key={offer.id}
                        offer={offer}
                        viewMode={viewMode}
                        index={index}
                      />
                    ))}
                  </motion.div>
                </AnimatePresence>

                {/* Load More */}
                {hasMore && (
                  <div className="text-center mt-8">
                    <Button 
                      variant="outline" 
                      onClick={handleLoadMore}
                      loading={loading}
                      size="lg"
                    >
                      Carregar Mais Ofertas ({filteredOffers.length - paginatedOffers.length} restantes)
                    </Button>
                  </div>
                )}

                {/* Pagination Info */}
                <div className="bg-white rounded-xl shadow-sm p-4 mt-6">
                  <div className="text-center text-sm text-matte-black-600">
                    Página {page} de {totalPages} • {filteredOffers.length} ofertas total
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Debug Panel - Apenas em desenvolvimento */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-blue-50 rounded-xl p-6 mt-6 border border-blue-200">
            <h4 className="font-semibold mb-4 text-blue-800 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Debug Panel (Desenvolvimento)
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <strong>Filtros Ativos:</strong>
                <pre className="mt-1 text-xs bg-white p-2 rounded border overflow-auto">
                  {JSON.stringify(filters, null, 2)}
                </pre>
              </div>
              <div>
                <strong>Estatísticas:</strong>
                <pre className="mt-1 text-xs bg-white p-2 rounded border overflow-auto">
                  {JSON.stringify(stats, null, 2)}
                </pre>
              </div>
              <div>
                <strong>Estado:</strong>
                <ul className="mt-1 text-xs space-y-1">
                  <li>Total offers: {allOffers.length}</li>
                  <li>Filtered: {filteredOffers.length}</li>
                  <li>Paginated: {paginatedOffers.length}</li>
                  <li>Current page: {page}</li>
                  <li>Total pages: {totalPages}</li>
                  <li>Has more: {hasMore ? 'Sim' : 'Não'}</li>
                  <li>Sort: {sortBy}</li>
                  <li>View mode: {viewMode}</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-4 space-x-2">
              <Button size="sm" onClick={() => console.log('Offers:', allOffers)}>
                Log All Offers
              </Button>
              <Button size="sm" onClick={() => console.log('Filtered:', filteredOffers)}>
                Log Filtered
              </Button>
              <Button size="sm" onClick={() => console.log('Current Filters:', filters)}>
                Log Filters
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

// ==========================================
// COMPONENTE OFFER CARD
// ==========================================

interface OfferCardProps {
  offer: P2POffer
  viewMode: 'grid' | 'list'
  index: number
}

const OfferCard: React.FC<OfferCardProps> = ({ offer, viewMode, index }) => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  
  const isOwnOffer = offer.ownerId === user?.id
  const totalBRL = (parseFloat(offer.minAmount) * offer.priceBZR).toFixed(0)
  const totalBRLMax = (parseFloat(offer.maxAmount) * offer.priceBZR).toFixed(0)

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor(diff / (1000 * 60))
    
    if (days > 0) return `${days}d atrás`
    if (hours > 0) return `${hours}h atrás`
    if (minutes > 0) return `${minutes}min atrás`
    return 'Agora'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className={`hover:shadow-lg transition-all duration-200 hover:-translate-y-1 ${
        viewMode === 'list' ? 'p-4' : 'p-6'
      } ${isOwnOffer ? 'ring-2 ring-bazari-red/20 bg-bazari-red/5' : ''}`}>
        
        {isOwnOffer && (
          <div className="flex items-center gap-2 mb-4 text-sm text-bazari-red font-medium">
            <CheckCircle className="h-4 w-4" />
            Sua Oferta
          </div>
        )}

        <div className={viewMode === 'list' 
          ? 'flex items-center justify-between' 
          : 'space-y-4'
        }>
          
          {/* Header */}
          <div className={viewMode === 'list' ? 'flex items-center gap-4' : 'flex items-start justify-between'}>
            <div className="flex items-center space-x-3">
              <Avatar 
                size={viewMode === 'list' ? 'sm' : 'md'} 
                fallback={offer.ownerName} 
                src={offer.ownerAvatarUrl}
              />
              <div>
                <h3 className={`font-semibold text-matte-black-900 ${viewMode === 'list' ? 'text-sm' : 'text-base'}`}>
                  {offer.ownerName}
                </h3>
                <div className="flex items-center text-sm text-matte-black-500">
                  <Star className="h-3 w-3 text-bazari-gold-500 mr-1" />
                  {offer.reputation?.score.toFixed(1)} ({offer.stats?.completed} trades)
                  <span className="mx-2">•</span>
                  {formatTimeAgo(offer.createdAt)}
                </div>
              </div>
            </div>
            
            {viewMode === 'grid' && (
              <div className="flex items-center gap-2">
                <Badge variant={offer.side === 'BUY' ? 'success' : 'warning'} size="sm">
                  {offer.side === 'BUY' ? 'COMPRA' : 'VENDA'}
                </Badge>
                {offer.reputation?.level === 'trusted' && (
                  <Badge variant="primary" size="sm">
                    <Shield className="h-3 w-3 mr-1" />
                    Confiável
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Details */}
          <div className={viewMode === 'list' 
            ? 'flex items-center gap-8' 
            : 'space-y-3'
          }>
            
            {/* Price */}
            <div className={viewMode === 'list' ? 'text-center' : 'flex justify-between items-center'}>
              <span className={`${viewMode === 'list' ? 'block text-xs' : 'text-sm'} text-matte-black-600`}>
                Preço:
              </span>
              <span className={`font-semibold text-bazari-red ${viewMode === 'list' ? 'text-lg' : 'text-base'}`}>
                R$ {offer.priceBZR.toFixed(2)}/BZR
              </span>
            </div>
            
            {/* Amount */}
            <div className={viewMode === 'list' ? 'text-center' : 'flex justify-between items-center'}>
              <span className={`${viewMode === 'list' ? 'block text-xs' : 'text-sm'} text-matte-black-600`}>
                Limites:
              </span>
              <span className={`${viewMode === 'list' ? 'text-sm' : 'text-sm'}`}>
                {offer.minAmount} - {offer.maxAmount} BZR
              </span>
            </div>

            {/* Total BRL */}
            <div className={viewMode === 'list' ? 'text-center' : 'flex justify-between items-center'}>
              <span className={`${viewMode === 'list' ? 'block text-xs' : 'text-sm'} text-matte-black-600`}>
                Total BRL:
              </span>
              <span className={`font-medium ${viewMode === 'list' ? 'text-sm' : 'text-sm'}`}>
                R$ {totalBRL} - R$ {totalBRLMax}
              </span>
            </div>
            
            {/* Payment Methods */}
            <div className={viewMode === 'list' ? '' : ''}>
              <div className="flex flex-wrap gap-1">
                {offer.paymentMethods.map((method) => (
                  <Badge key={method} variant="outline" size="sm">
                    {method === 'PIX' && '💳'}
                    {method === 'TED' && '🏦'}
                    {method === 'DINHEIRO' && '💵'}
                    {method === 'OUTRO' && '🔄'}
                    {' '}{method}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Location */}
            {offer.location?.city && viewMode === 'grid' && (
              <div className="flex items-center text-sm text-matte-black-500">
                <MapPin className="h-3 w-3 mr-1" />
                {offer.location.city}, {offer.location.state}
              </div>
            )}

            {/* Terms */}
            {offer.terms && viewMode === 'grid' && (
              <div className="text-sm text-matte-black-600 bg-gray-50 p-3 rounded-lg">
                {offer.terms}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className={viewMode === 'list' 
            ? 'flex items-center gap-2' 
            : 'pt-4 border-t border-sand-200'
          }>
            <Link 
              to={`/p2p/offers/${offer.id}`}
              className={viewMode === 'list' ? '' : 'block w-full'}
            >
              <Button 
                className={viewMode === 'list' ? '' : 'w-full'}
                disabled={isOwnOffer}
                size={viewMode === 'list' ? 'sm' : 'default'}
              >
                {isOwnOffer 
                  ? 'Sua Oferta' 
                  : offer.side === 'BUY' 
                    ? `Vender para ${offer.ownerName}` 
                    : `Comprar de ${offer.ownerName}`
                }
              </Button>
            </Link>
            
            {viewMode === 'list' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/profile/${offer.ownerId}`)}
              >
                Perfil
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

export default OffersBrowse