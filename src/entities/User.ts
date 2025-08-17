export interface User {
  id: string
  name: string
  email?: string
  avatar?: string
  walletAddress: string
  reputation: {
    rating: number
    reviewCount: number
  }
  createdAt: string
  lastLoginAt: string
  preferences?: {
    language: 'pt' | 'en' | 'es'
    notifications: {
      email: boolean
      push: boolean
      sms: boolean
    }
    privacy: {
      showEmail: boolean
      showPhone: boolean
      showLocation: boolean
    }
  }
}
