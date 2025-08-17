export interface Listing {
  id: string
  title: string
  description: string
  price: number
  currency: 'BZR' | 'BRL'
  category: string
  subcategory: string
  images: string[]
  sellerId: string
  sellerName: string
  sellerRating: number
  status: 'active' | 'paused' | 'sold' | 'expired'
  createdAt: string
  updatedAt: string
  views: number
  digital?: {
    type: 'course' | 'ebook' | 'software' | 'media' | 'template' | 'other'
    deliveryInstructions: string
    downloadUrl?: string
    accessKey?: string
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
    }
  }
}
