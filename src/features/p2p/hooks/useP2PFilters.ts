// ==========================================
// src/features/p2p/hooks/useP2PFilters.ts - COMPLETO
// ==========================================

import { useEffect, useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useOffersStore } from '../store/offersStore'
import type { P2PFilters, PaymentMethod, P2PSide } from '../types/p2p.types'

/**
 * Hook para gerenciar filtros P2P com sincronização de URL e debounce
 */
export function useP2PFilters() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { 
    filters, 
    setFilters, 
    clearFilters, 
    fetchOffers,
    loading,
    stats 
  } = useOffersStore()

  /**
   * Parsear filtros da URL
   */
  const urlFilters = useMemo((): Partial<P2PFilters> => {
    const parsed: Partial<P2PFilters> = {}
    
    // Side (BUY/SELL)
    const side = searchParams.get('side')
    if (side === 'BUY' || side === 'SELL') {
      parsed.side = side
    }
    
    // Payment method
    const payment = searchParams.get('payment')
    if (payment && ['PIX', 'TED', 'DOC', 'DINHEIRO', 'CARTAO', 'OUTRO'].includes(payment)) {
      parsed.payment = payment as PaymentMethod
    }
    
    // Price range
    const priceMin = searchParams.get('priceMin')
    if (priceMin) {
      const value = parseFloat(priceMin)
      if (!isNaN(value) && value > 0) {
        parsed.priceMin = value
      }
    }
    
    const priceMax = searchParams.get('priceMax')
    if (priceMax) {
      const value = parseFloat(priceMax)
      if (!isNaN(value) && value > 0) {
        parsed.priceMax = value
      }
    }
    
    // Amount range
    const amountMin = searchParams.get('amountMin')
    if (amountMin) {
      const value = parseFloat(amountMin)
      if (!isNaN(value) && value > 0) {
        parsed.amountMin = value
      }
    }
    
    const amountMax = searchParams.get('amountMax')
    if (amountMax) {
      const value = parseFloat(amountMax)
      if (!isNaN(value) && value > 0) {
        parsed.amountMax = value
      }
    }
    
    // Reputation
    const reputationMin = searchParams.get('reputationMin')
    if (reputationMin) {
      const value = parseFloat(reputationMin)
      if (!isNaN(value) && value >= 0 && value <= 5) {
        parsed.reputationMin = value
      }
    }
    
    // Location
    const city = searchParams.get('city')
    if (city && city.trim()) {
      parsed.city = city.trim()
    }
    
    const state = searchParams.get('state')
    if (state && state.trim()) {
      parsed.state = state.trim()
    }
    
    // Owner
    const ownerId = searchParams.get('ownerId')
    if (ownerId && ownerId.trim()) {
      parsed.ownerId = ownerId.trim()
    }
    
    // Search query
    const q = searchParams.get('q')
    if (q && q.trim()) {
      parsed.q = q.trim()
    }
    
    // Sorting
    const sortBy = searchParams.get('sortBy')
    if (sortBy && ['newest', 'oldest', 'price_asc', 'price_desc', 'reputation_desc', 'amount_desc'].includes(sortBy)) {
      parsed.sortBy = sortBy as P2PFilters['sortBy']
    }
    
    // Pagination
    const page = searchParams.get('page')
    if (page) {
      const value = parseInt(page, 10)
      if (!isNaN(value) && value > 0) {
        parsed.page = value
      }
    }
    
    const limit = searchParams.get('limit')
    if (limit) {
      const value = parseInt(limit, 10)
      if (!isNaN(value) && value > 0 && value <= 100) {
        parsed.limit = value
      }
    }
    
    return parsed
  }, [searchParams])

  /**
   * Sincronizar filtros do store com URL
   */
  useEffect(() => {
    const hasUrlFilters = Object.keys(urlFilters).length > 0
    
    if (hasUrlFilters) {
      // Se há filtros na URL, aplicar no store
      console.log('🔗 useP2PFilters: Aplicando filtros da URL:', urlFilters)
      setFilters(urlFilters)
    }
  }, [urlFilters, setFilters])

  /**
   * Atualizar URL quando filtros do store mudarem
   */
  const updateURLFromFilters = useCallback((newFilters: P2PFilters) => {
    const params = new URLSearchParams()
    
    // Apenas adicionar parâmetros que têm valor
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value))
      }
    })
    
    // Atualizar URL sem recarregar página
    setSearchParams(params, { replace: true })
  }, [setSearchParams])

  /**
   * Debounced effect para buscar ofertas quando filtros mudarem
   */
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      console.log('🔍 useP2PFilters: Buscando ofertas com filtros:', filters)
      fetchOffers(filters).catch(console.error)
    }, 300) // 300ms de debounce
    
    return () => clearTimeout(timeoutId)
  }, [filters, fetchOffers])

  /**
   * Atualizar um filtro específico
   */
  const updateFilter = useCallback(<K extends keyof P2PFilters>(
    key: K, 
    value: P2PFilters[K]
  ) => {
    console.log('🎯 useP2PFilters: Atualizando filtro:', key, '=', value)
    
    const newFilters = { ...filters, [key]: value }
    
    // Remover propriedades undefined/null/empty
    Object.keys(newFilters).forEach(k => {
      const val = newFilters[k as keyof P2PFilters]
      if (val === undefined || val === null || val === '') {
        delete newFilters[k as keyof P2PFilters]
      }
    })
    
    setFilters({ [key]: value })
    updateURLFromFilters(newFilters)
  }, [filters, setFilters, updateURLFromFilters])

  /**
   * Atualizar múltiplos filtros de uma vez
   */
  const updateFilters = useCallback((newFilters: Partial<P2PFilters>) => {
    console.log('🎯 useP2PFilters: Atualizando múltiplos filtros:', newFilters)
    
    const mergedFilters = { ...filters, ...newFilters }
    
    // Remover propriedades undefined/null/empty
    Object.keys(mergedFilters).forEach(k => {
      const val = mergedFilters[k as keyof P2PFilters]
      if (val === undefined || val === null || val === '') {
        delete mergedFilters[k as keyof P2PFilters]
      }
    })
    
    setFilters(newFilters)
    updateURLFromFilters(mergedFilters)
  }, [filters, setFilters, updateURLFromFilters])

  /**
   * Limpar todos os filtros
   */
  const resetFilters = useCallback(() => {
    console.log('🧹 useP2PFilters: Limpando filtros')
    clearFilters()
    setSearchParams({}, { replace: true })
  }, [clearFilters, setSearchParams])

  /**
   * Toggle do side (BUY/SELL)
   */
  const toggleSide = useCallback(() => {
    const newSide: P2PSide = filters.side === 'BUY' ? 'SELL' : 'BUY'
    updateFilter('side', newSide)
  }, [filters.side, updateFilter])

  /**
   * Aplicar filtros rápidos predefinidos
   */
  const applyQuickFilter = useCallback((preset: string) => {
    console.log('⚡ useP2PFilters: Aplicando filtro rápido:', preset)
    
    switch (preset) {
      case 'pix_only':
        updateFilter('payment', 'PIX')
        break
        
      case 'instant_only':
        updateFilters({ 
          payment: 'PIX',
          sortBy: 'newest'
        })
        break
        
      case 'high_reputation':
        updateFilter('reputationMin', 4.5)
        break
        
      case 'low_price':
        updateFilter('sortBy', 'price_asc')
        break
        
      case 'high_price':
        updateFilter('sortBy', 'price_desc')
        break
        
      case 'large_amounts':
        updateFilters({
          amountMin: 1000,
          sortBy: 'amount_desc'
        })
        break
        
      default:
        console.warn('Preset de filtro desconhecido:', preset)
    }
  }, [updateFilter, updateFilters])

  /**
   * Verificar se há filtros ativos
   */
  const hasActiveFilters = useMemo(() => {
    const defaultFilters = { side: 'SELL' } // Filtro padrão
    
    return Object.keys(filters).some(key => {
      const value = filters[key as keyof P2PFilters]
      const defaultValue = defaultFilters[key as keyof typeof defaultFilters]
      
      return value !== undefined && 
             value !== null && 
             value !== '' && 
             value !== defaultValue
    })
  }, [filters])

  /**
   * Contar filtros ativos
   */
  const activeFiltersCount = useMemo(() => {
    let count = 0
    
    Object.values(filters).forEach(value => {
      if (value !== undefined && value !== null && value !== '') {
        count++
      }
    })
    
    // Subtrair 1 se side=SELL (filtro padrão)
    if (filters.side === 'SELL') {
      count = Math.max(0, count - 1)
    }
    
    return count
  }, [filters])

  /**
   * Obter label descritivo dos filtros ativos
   */
  const filtersDescription = useMemo(() => {
    const descriptions: string[] = []
    
    if (filters.side) {
      descriptions.push(filters.side === 'BUY' ? 'Compras' : 'Vendas')
    }
    
    if (filters.payment) {
      descriptions.push(`${filters.payment}`)
    }
    
    if (filters.priceMin || filters.priceMax) {
      const min = filters.priceMin ? `R$ ${filters.priceMin.toFixed(2)}` : ''
      const max = filters.priceMax ? `R$ ${filters.priceMax.toFixed(2)}` : ''
      
      if (min && max) {
        descriptions.push(`Preço: ${min} - ${max}`)
      } else if (min) {
        descriptions.push(`Preço mín: ${min}`)
      } else if (max) {
        descriptions.push(`Preço máx: ${max}`)
      }
    }
    
    if (filters.reputationMin) {
      descriptions.push(`Reputação: ${filters.reputationMin}+`)
    }
    
    if (filters.city) {
      descriptions.push(`${filters.city}`)
    }
    
    if (filters.q) {
      descriptions.push(`"${filters.q}"`)
    }
    
    return descriptions.join(' • ')
  }, [filters])

  return {
    // Estado
    filters,
    loading,
    stats,
    
    // Flags
    hasActiveFilters,
    activeFiltersCount,
    filtersDescription,
    
    // Actions
    updateFilter,
    updateFilters,
    resetFilters,
    toggleSide,
    applyQuickFilter,
    
    // Utilitários
    urlFilters
  }
}