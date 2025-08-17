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