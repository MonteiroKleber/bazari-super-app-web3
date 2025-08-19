// src/features/marketplace/types/enterprise.types.ts

export interface Enterprise {
  id: string
  ownerId: string
  ownerName: string
  name: string
  description: string
  logo?: string
  banner?: string
  categories: string[] // Array of category IDs
  subcategories: string[] // Array of subcategory IDs
  address?: {
    street: string
    city: string
    state: string
    country: string
    zipCode: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  contact: {
    phone?: string
    email?: string
    website?: string
    socialMedia?: {
      instagram?: string
      facebook?: string
      twitter?: string
      linkedin?: string
    }
  }
  tokenizable: boolean
  tokenization?: {
    enabled: boolean
    totalSupply?: number
    currentSupply?: number
    royaltyPercentage?: number // 0-100
    transferable: boolean
    mintPrice?: number
    mintCurrency?: 'BZR' | 'BRL'
  }
  
  // ✅ NOVOS CAMPOS OPCIONAIS PARA TOKENIZAÇÃO AVANÇADA
  tokenized?: boolean // Alias para tokenization?.enabled (compatibilidade)
  tokenSymbol?: string // ex.: ZARI, BZR-enterprise
  totalSupply?: number // Oferta total de tokens
  circulatingSupply?: number // Tokens em circulação
  holdersCount?: number // Número de detentores
  treasuryBalanceBZR?: number // Saldo do tesouro em BZR
  revenueLast30dBZR?: number // Receita últimos 30 dias em BZR
  revenueLast12mBZR?: number // Receita últimos 12 meses em BZR
  profitMarginPct?: number // Margem de lucro em percentual
  dividendPolicy?: 'none' | 'monthly' | 'quarterly' | 'yearly' // Política de dividendos
  lastPayoutDate?: string // ISO date do último pagamento
  priceBZR?: number // Preço atual do token em BZR (se existir)
  priceChange24hPct?: number // Variação de preço em 24h
  onChainAddress?: string // Endereço do contrato/token na blockchain

  reputation: {
    rating: number
    reviewCount: number
    totalSales: number
    completionRate: number
  }
  verification: {
    verified: boolean
    verifiedAt?: string
    documents: string[] // Array of document types submitted
  }
  settings: {
    autoAcceptOrders: boolean
    minOrderValue?: number
    maxOrderValue?: number
    acceptedCurrencies: ('BZR' | 'BRL')[]
    deliveryMethods: string[]
    businessHours?: {
      [key: string]: { // day of week
        open: string // HH:mm
        close: string // HH:mm
        closed: boolean
      }
    }
  }
  stats: {
    totalListings: number
    activeListings: number
    soldListings: number
    totalViews: number
    totalRevenue: {
      BZR: number
      BRL: number
    }
    avgResponseTime: number // minutes
  }
  status: 'active' | 'paused' | 'suspended' | 'under_review'
  createdAt: string
  updatedAt: string
}

export interface EnterpriseFilters {
  category?: string
  subcategory?: string
  location?: {
    city?: string
    state?: string
    radius?: number // km
  }
  tokenizable?: boolean
  tokenized?: boolean // ✅ NOVO: filtrar por tokenizados
  verified?: boolean
  minRating?: number
  search?: string
  sortBy?: 'newest' | 'rating' | 'sales' | 'relevance'
}

export interface EnterpriseMetrics {
  totalEnterprises: number
  verifiedEnterprises: number
  avgRating: number
  totalTokenizedEnterprises: number
  categoriesWithMostEnterprises: {
    categoryId: string
    categoryName: string
    count: number
  }[]
}

// ✅ NOVO: Interface para dados econômicos históricos
export interface EnterpriseEconomicData {
  enterpriseId: string
  period: string // 'YYYY-MM' 
  revenue: number
  profit: number
  profitMarginPct: number
  holders: number
  tokenPrice?: number
  dividendsPaid?: number
}

// ✅ NOVO: Interface para holder de tokens
export interface TokenHolder {
  address: string
  balance: number
  percentage: number
  since: string // ISO date
}