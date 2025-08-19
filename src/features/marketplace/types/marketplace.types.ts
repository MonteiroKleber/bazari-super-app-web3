// src/features/marketplace/types/marketplace.types.ts

export interface Listing {
  id: string
  title: string
  description: string
  price: number
  currency: 'BZR' | 'BRL'
  category: string
  subcategory: string
  subsubcategory?: string
  subsubsubcategory?: string
  images: string[]
  sellerId: string
  sellerName: string
  sellerRating: number
  enterpriseId?: string // ✅ ADICIONADO: ID do empreendimento (obrigatório para novos anúncios)
  enterpriseName?: string
  status: 'active' | 'paused' | 'sold' | 'expired'
  createdAt: string
  updatedAt: string
  views: number
  digital?: {
    type: 'course' | 'ebook' | 'software' | 'media' | 'template' | 'other'
    deliveryInstructions: string
    downloadUrl?: string
    accessKey?: string
    tokenizable?: boolean
    tokenization?: {
      quantity: number
      royaltyPercentage: number
      sellDuration: number // days
      transferable: boolean
      currentSupply?: number
      pricePerToken?: number
    }
  }
  metadata?: {
    condition?: 'new' | 'used' | 'refurbished'
    brand?: string
    model?: string
    warranty?: string
    shipping?: {
      free: boolean
      methods: string[]
      estimatedDays: number
      cost?: number
    }
    location?: {
      city?: string
      state?: string
      country?: string
    }
  }
}

// ✅ ADICIONADO: Interface para criação de anúncio
export interface ListingCreateInput {
  title: string
  description: string
  price: number
  currency: 'BZR' | 'BRL'
  category: string
  subcategory?: string
  subsubcategory?: string
  subsubsubcategory?: string
  images: string[]
  enterpriseId: string // ✅ OBRIGATÓRIO para novos anúncios
  digital?: {
    type: 'course' | 'ebook' | 'software' | 'media' | 'template' | 'other'
    deliveryInstructions: string
    tokenizable?: boolean
    tokenization?: {
      quantity: number
      royaltyPercentage: number
      sellDuration: number
      transferable: boolean
    }
  }
  metadata?: {
    condition?: 'new' | 'used' | 'refurbished'
    brand?: string
    model?: string
    warranty?: string
    shipping?: {
      free: boolean
      methods: string[]
      estimatedDays: number
      cost?: number
    }
    location?: {
      city?: string
      state?: string
      country?: string
    }
  }
}

export interface MarketplaceFilters {
  category?: string
  subcategory?: string
  subsubcategory?: string
  subsubsubcategory?: string
  minPrice?: number
  maxPrice?: number
  currency?: 'BZR' | 'BRL'
  digitalOnly?: boolean
  tokenizableOnly?: boolean
  freeShippingOnly?: boolean
  condition?: 'new' | 'used' | 'refurbished'
  enterpriseId?: string // ✅ ADICIONADO: Filtrar por empreendimento
  location?: {
    city?: string
    state?: string
    radius?: number // km
  }
  search?: string
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'rating_desc' | 'views_desc' | 'relevance'
}