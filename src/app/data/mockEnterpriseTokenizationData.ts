// src/app/data/mockEnterpriseTokenizationData.ts
// ✅ CORRIGIDO: Dados mock estendidos com vinculação correta entre enterprises e listings

import { Enterprise } from '@features/marketplace/types/enterprise.types'
import { Listing } from '@features/marketplace/store/marketplaceStore'

// ✅ ENTERPRISES MOCK com dados de tokenização completos
export const mockEnterprisesExtended: Enterprise[] = [
  {
    id: 'enterprise_1',
    ownerId: 'user_1',
    ownerName: 'João Silva',
    name: 'Bazari Tech Solutions',
    description: 'Especializada em soluções tecnológicas inovadoras para transformação digital de empresas. Oferecemos desenvolvimento de software, consultoria em blockchain e implementação de sistemas descentralizados.',
    logo: 'https://picsum.photos/100/100?random=101',
    banner: 'https://picsum.photos/800/200?random=201',
    categories: ['technology', 'blockchain'],
    subcategories: ['software_development', 'consulting'],
    address: {
      street: 'Av. Paulista, 1000',
      city: 'São Paulo',
      state: 'SP',
      country: 'Brasil',
      zipCode: '01310-100'
    },
    contact: {
      phone: '+55 11 99999-9999',
      email: 'contato@bazaritech.com',
      website: 'https://bazaritech.com',
      socialMedia: {
        instagram: '@bazaritech',
        linkedin: 'bazari-tech-solutions'
      }
    },
    // ✅ Dados de tokenização
    tokenizable: true,
    tokenized: true,
    tokenSymbol: 'BZRT',
    totalSupply: 1000000,
    circulatingSupply: 750000,
    holdersCount: 342,
    treasuryBalanceBZR: 125000,
    revenueLast30dBZR: 52000,
    revenueLast12mBZR: 580000,
    profitMarginPct: 12.5,
    dividendPolicy: 'quarterly',
    lastPayoutDate: '2024-12-15T00:00:00Z',
    priceBZR: 52.30,
    priceChange24hPct: 3.45,
    onChainAddress: '5F3fKFQG9MJNjzCfHmVGbBpfQvHnYz8mG9J4a2b3c4d5e6f7',
    reputation: {
      rating: 4.8,
      reviewCount: 156,
      totalSales: 89,
      completionRate: 98.9
    },
    verification: {
      verified: true,
      documents: ['cnpj', 'proof_of_address', 'bank_account']
    },
    settings: {
      autoAcceptOrders: false,
      minOrderValue: 1000,
      maxOrderValue: 50000,
      acceptedCurrencies: ['BZR', 'BRL'],
      deliveryMethods: ['digital', 'custom']
    },
    stats: {
      totalListings: 8,
      activeListings: 6,
      soldListings: 2,
      totalViews: 12450,
      totalRevenue: { BZR: 125000, BRL: 85000 },
      avgResponseTime: 15
    },
    status: 'active',
    createdAt: '2023-06-15T00:00:00.000Z',
    updatedAt: '2025-01-15T10:30:00.000Z'
  },
  {
    id: 'enterprise_2',
    ownerId: 'user_2',
    ownerName: 'Maria Santos',
    name: 'EcoVerde Sustentável',
    description: 'Produtos sustentáveis e ecológicos para um futuro mais verde. Especializados em soluções ambientalmente responsáveis para casa e empresa.',
    logo: 'https://picsum.photos/100/100?random=102',
    banner: 'https://picsum.photos/800/200?random=202',
    categories: ['sustainability', 'home'],
    subcategories: ['eco_products', 'cleaning'],
    address: {
      street: 'R. das Flores, 123',
      city: 'Curitiba',
      state: 'PR',
      country: 'Brasil',
      zipCode: '80020-100'
    },
    contact: {
      phone: '+55 41 98888-8888',
      email: 'maria@ecoverde.com.br',
      website: 'https://ecoverde.com.br',
      socialMedia: {
        instagram: '@ecoverde_sustentavel'
      }
    },
    tokenizable: false,
    tokenized: false,
    reputation: {
      rating: 4.5,
      reviewCount: 78,
      totalSales: 234,
      completionRate: 96.5
    },
    verification: {
      verified: true,
      documents: ['cnpj', 'proof_of_address']
    },
    settings: {
      autoAcceptOrders: true,
      minOrderValue: 25,
      maxOrderValue: 1000,
      acceptedCurrencies: ['BRL'],
      deliveryMethods: ['standard', 'express', 'pickup']
    },
    stats: {
      totalListings: 15,
      activeListings: 12,
      soldListings: 3,
      totalViews: 8950,
      totalRevenue: { BZR: 0, BRL: 25400 },
      avgResponseTime: 25
    },
    status: 'active',
    createdAt: '2023-08-20T00:00:00.000Z',
    updatedAt: '2025-01-12T14:20:00.000Z'
  },
  {
    id: 'enterprise_3',
    ownerId: 'user_3',
    ownerName: 'Carlos Oliveira',
    name: 'Artesãos Unidos',
    description: 'Cooperativa de artesãos que preserva técnicas tradicionais brasileiras. Cada peça é única e feita com carinho por mestres artesãos.',
    logo: 'https://picsum.photos/100/100?random=103',
    banner: 'https://picsum.photos/800/200?random=203',
    categories: ['handcraft', 'art'],
    subcategories: ['ceramics', 'furniture', 'decoration'],
    address: {
      street: 'Praça da Arte, 45',
      city: 'Ouro Preto',
      state: 'MG',
      country: 'Brasil',
      zipCode: '35400-000'
    },
    contact: {
      phone: '+55 31 97777-7777',
      email: 'carlos@artesaosunidos.com.br',
      socialMedia: {
        instagram: '@artesaos_unidos'
      }
    },
    tokenizable: true,
    tokenized: false, // Pode ser tokenizado mas ainda não foi
    reputation: {
      rating: 4.4,
      reviewCount: 45,
      totalSales: 67,
      completionRate: 94.2
    },
    verification: {
      verified: false,
      documents: ['cnpj']
    },
    settings: {
      autoAcceptOrders: false,
      minOrderValue: 50,
      maxOrderValue: 5000,
      acceptedCurrencies: ['BRL'],
      deliveryMethods: ['standard', 'pickup']
    },
    stats: {
      totalListings: 22,
      activeListings: 18,
      soldListings: 4,
      totalViews: 5670,
      totalRevenue: { BZR: 0, BRL: 18900 },
      avgResponseTime: 45
    },
    status: 'active',
    createdAt: '2023-11-10T00:00:00.000Z',
    updatedAt: '2025-01-10T16:15:00.000Z'
  }
]

// ✅ LISTINGS MOCK com vinculação correta aos enterprises
export const mockListingsExtended: Listing[] = [
  // Listings da Bazari Tech Solutions (enterprise_1)
  {
    id: 'listing_1',
    title: 'Desenvolvimento de DApp Personalizada',
    description: 'Criamos aplicações descentralizadas sob medida para seu negócio. Inclui smart contracts, interface web responsiva e integração com carteiras digitais.',
    price: 15000,
    currency: 'BZR',
    category: 'technology',
    subcategory: 'blockchain',
    images: [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600',
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600'
    ],
    sellerId: 'user_1',
    sellerName: 'João Silva',
    sellerRating: 4.8,
    enterpriseId: 'enterprise_1', // ✅ VINCULAÇÃO CORRETA
    enterpriseName: 'Bazari Tech Solutions',
    status: 'active',
    createdAt: '2025-01-10T09:00:00Z',
    updatedAt: '2025-01-15T14:30:00Z',
    views: 156,
    digital: {
      type: 'software',
      deliveryInstructions: 'Entrega em até 45 dias através de repositório Git privado.',
      tokenizable: true,
      tokenization: {
        quantity: 10,
        royaltyPercentage: 5,
        sellDuration: 365,
        transferable: true
      }
    }
  },
  {
    id: 'listing_2',
    title: 'Consultoria Blockchain - 10h',
    description: 'Pacote de consultoria especializada em blockchain e criptomoedas. Ideal para empresas que querem entender e implementar tecnologias descentralizadas.',
    price: 5000,
    currency: 'BZR',
    category: 'technology',
    subcategory: 'consulting',
    images: [
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600'
    ],
    sellerId: 'user_1',
    sellerName: 'João Silva',
    sellerRating: 4.8,
    enterpriseId: 'enterprise_1', // ✅ VINCULAÇÃO CORRETA
    enterpriseName: 'Bazari Tech Solutions',
    status: 'active',
    createdAt: '2025-01-08T11:20:00Z',
    updatedAt: '2025-01-12T16:45:00Z',
    views: 89,
    digital: {
      type: 'course',
      deliveryInstructions: 'Sessões online via videoconferência, materiais em PDF.'
    }
  },
  {
    id: 'listing_3',
    title: 'Sistema de Gestão Web Completo',
    description: 'Desenvolvimento de sistema web para gestão empresarial com módulos de vendas, estoque, financeiro e relatórios. Tecnologia moderna e escalável.',
    price: 25000,
    currency: 'BZR',
    category: 'technology',
    subcategory: 'software',
    images: [
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600'
    ],
    sellerId: 'user_1',
    sellerName: 'João Silva',
    sellerRating: 4.8,
    enterpriseId: 'enterprise_1', // ✅ VINCULAÇÃO CORRETA
    enterpriseName: 'Bazari Tech Solutions',
    status: 'active',
    createdAt: '2025-01-05T08:30:00Z',
    updatedAt: '2025-01-14T12:00:00Z',
    views: 234,
    digital: {
      type: 'software',
      deliveryInstructions: 'Entrega em até 60 dias. Inclui treinamento da equipe.'
    }
  },

  // Listings da EcoVerde Sustentável (enterprise_2)
  {
    id: 'listing_4',
    title: 'Kit Limpeza Ecológica Completo',
    description: 'Kit com 5 produtos de limpeza 100% naturais e biodegradáveis. Ideais para manter sua casa limpa respeitando o meio ambiente.',
    price: 85,
    currency: 'BRL',
    category: 'sustainability',
    subcategory: 'cleaning',
    images: [
      'https://images.unsplash.com/photo-1563453392212-326ad7d8dd8e?w=600'
    ],
    sellerId: 'user_2',
    sellerName: 'Maria Santos',
    sellerRating: 4.5,
    enterpriseId: 'enterprise_2', // ✅ VINCULAÇÃO CORRETA
    enterpriseName: 'EcoVerde Sustentável',
    status: 'active',
    createdAt: '2025-01-12T10:00:00Z',
    updatedAt: '2025-01-16T08:15:00Z',
    views: 67,
    metadata: {
      condition: 'new',
      shipping: {
        free: true,
        methods: ['Correios', 'Entrega local'],
        estimatedDays: 5
      }
    }
  },
  {
    id: 'listing_5',
    title: 'Sabonete Artesanal - Lavanda',
    description: 'Sabonete artesanal com óleo essencial de lavanda. Hidratante natural, sem parabenos nem sulfatos. Embalagem compostável.',
    price: 25,
    currency: 'BRL',
    category: 'sustainability',
    subcategory: 'personal_care',
    images: [
      'https://images.unsplash.com/photo-1556909411-f73e4ea421a8?w=600'
    ],
    sellerId: 'user_2',
    sellerName: 'Maria Santos',
    sellerRating: 4.5,
    enterpriseId: 'enterprise_2', // ✅ VINCULAÇÃO CORRETA
    enterpriseName: 'EcoVerde Sustentável',
    status: 'active',
    createdAt: '2025-01-14T15:30:00Z',
    updatedAt: '2025-01-16T10:45:00Z',
    views: 43,
    metadata: {
      condition: 'new',
      shipping: {
        free: false,
        methods: ['Correios'],
        estimatedDays: 7,
        cost: 12
      }
    }
  },
  {
    id: 'listing_6',
    title: 'Sacolas Reutilizáveis - Pack 3 unid.',
    description: 'Sacolas ecológicas feitas de algodão orgânico. Resistentes e laváveis. Substitua as sacolas plásticas de forma sustentável.',
    price: 45,
    currency: 'BRL',
    category: 'sustainability',
    subcategory: 'bags',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600'
    ],
    sellerId: 'user_2',
    sellerName: 'Maria Santos',
    sellerRating: 4.5,
    enterpriseId: 'enterprise_2', // ✅ VINCULAÇÃO CORRETA
    enterpriseName: 'EcoVerde Sustentável',
    status: 'active',
    createdAt: '2025-01-09T12:45:00Z',
    updatedAt: '2025-01-13T14:20:00Z',
    views: 78,
    metadata: {
      condition: 'new',
      shipping: {
        free: true,
        methods: ['Correios'],
        estimatedDays: 5
      }
    }
  },

  // Listings dos Artesãos Unidos (enterprise_3)
  {
    id: 'listing_7',
    title: 'Vaso Cerâmica Artesanal Grande',
    description: 'Vaso decorativo em cerâmica, feito inteiramente à mão por artesãos de Minas Gerais. Peça única com técnicas tradicionais centenárias.',
    price: 280,
    currency: 'BRL',
    category: 'handcraft',
    subcategory: 'decoration',
    images: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600'
    ],
    sellerId: 'user_3',
    sellerName: 'Carlos Oliveira',
    sellerRating: 4.4,
    enterpriseId: 'enterprise_3', // ✅ VINCULAÇÃO CORRETA
    enterpriseName: 'Artesãos Unidos',
    status: 'active',
    createdAt: '2025-01-11T16:00:00Z',
    updatedAt: '2025-01-14T09:30:00Z',
    views: 145,
    metadata: {
      condition: 'new',
      shipping: {
        free: false,
        methods: ['Correios', 'Transportadora'],
        estimatedDays: 10,
        cost: 35
      }
    }
  },
  {
    id: 'listing_8',
    title: 'Conjunto Mesa e Cadeiras Madeira Rústica',
    description: 'Mesa com 4 cadeiras em madeira de demolição recuperada. Cada peça é única, com design rústico e acabamento natural.',
    price: 1200,
    currency: 'BRL',
    category: 'handcraft',
    subcategory: 'furniture',
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600'
    ],
    sellerId: 'user_3',
    sellerName: 'Carlos Oliveira',
    sellerRating: 4.4,
    enterpriseId: 'enterprise_3', // ✅ VINCULAÇÃO CORRETA
    enterpriseName: 'Artesãos Unidos',
    status: 'active',
    createdAt: '2025-01-07T13:15:00Z',
    updatedAt: '2025-01-11T15:20:00Z',
    views: 89,
    metadata: {
      condition: 'new',
      shipping: {
        free: true,
        methods: ['Entrega local'],
        estimatedDays: 21
      }
    }
  },
  {
    id: 'listing_9',
    title: 'Quadro Pintura Paisagem - Ouro Preto',
    description: 'Pintura original retratando as belas paisagens de Ouro Preto. Técnica mista sobre tela, moldura em madeira. Arte autêntica mineira.',
    price: 450,
    currency: 'BRL',
    category: 'handcraft',
    subcategory: 'art',
    images: [
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600'
    ],
    sellerId: 'user_3',
    sellerName: 'Carlos Oliveira',
    sellerRating: 4.4,
    enterpriseId: 'enterprise_3', // ✅ VINCULAÇÃO CORRETA
    enterpriseName: 'Artesãos Unidos',
    status: 'active',
    createdAt: '2025-01-13T11:00:00Z',
    updatedAt: '2025-01-15T13:45:00Z',
    views: 92,
    metadata: {
      condition: 'new',
      shipping: {
        free: false,
        methods: ['Correios'],
        estimatedDays: 12,
        cost: 28
      }
    }
  }
]

// ✅ FUNÇÃO para mesclar com dados existentes
export const extendMockData = (existingEnterprises: Enterprise[], existingListings: Listing[]) => {
  // Combinar enterprises sem duplicar
  const combinedEnterprises = [...existingEnterprises]
  
  mockEnterprisesExtended.forEach(newEnterprise => {
    const existingIndex = combinedEnterprises.findIndex(e => e.id === newEnterprise.id)
    if (existingIndex >= 0) {
      // Atualizar existente com novos campos
      combinedEnterprises[existingIndex] = { ...combinedEnterprises[existingIndex], ...newEnterprise }
    } else {
      // Adicionar novo
      combinedEnterprises.push(newEnterprise)
    }
  })

  // Combinar listings sem duplicar
  const combinedListings = [...existingListings]
  
  mockListingsExtended.forEach(newListing => {
    const existingIndex = combinedListings.findIndex(l => l.id === newListing.id)
    if (existingIndex >= 0) {
      // Atualizar existente
      combinedListings[existingIndex] = { ...combinedListings[existingIndex], ...newListing }
    } else {
      // Adicionar novo
      combinedListings.push(newListing)
    }
  })

  return {
    enterprises: combinedEnterprises,
    listings: combinedListings
  }
}

// ✅ DADOS de séries temporais para gráficos econômicos
export const mockEconomicHistory = {
  'enterprise_1': [
    { month: '2024-02', revenue: 38000, profit: 4750, profitMarginPct: 12.5, holders: 245, tokenPrice: 45.20 },
    { month: '2024-03', revenue: 41000, profit: 5125, profitMarginPct: 12.5, holders: 267, tokenPrice: 47.80 },
    { month: '2024-04', revenue: 43500, profit: 5437, profitMarginPct: 12.5, holders: 289, tokenPrice: 49.30 },
    { month: '2024-05', revenue: 46000, profit: 5750, profitMarginPct: 12.5, holders: 298, tokenPrice: 51.10 },
    { month: '2024-06', revenue: 48200, profit: 6025, profitMarginPct: 12.5, holders: 312, tokenPrice: 52.00 },
    { month: '2024-07', revenue: 45800, profit: 5725, profitMarginPct: 12.5, holders: 318, tokenPrice: 50.75 },
    { month: '2024-08', revenue: 47900, profit: 5987, profitMarginPct: 12.5, holders: 325, tokenPrice: 51.60 },
    { month: '2024-09', revenue: 49100, profit: 6137, profitMarginPct: 12.5, holders: 331, tokenPrice: 52.20 },
    { month: '2024-10', revenue: 51000, profit: 6375, profitMarginPct: 12.5, holders: 336, tokenPrice: 53.10 },
    { month: '2024-11', revenue: 48700, profit: 6087, profitMarginPct: 12.5, holders: 339, tokenPrice: 52.40 },
    { month: '2024-12', revenue: 52000, profit: 6500, profitMarginPct: 12.5, holders: 342, tokenPrice: 52.30 }
  ]
}

// ✅ Logs para debug
console.log('mockEnterprisesExtended carregado:', mockEnterprisesExtended.length, 'enterprises')
console.log('mockListingsExtended carregado:', mockListingsExtended.length, 'listings')
console.log('Vinculações enterprise -> listings:')
mockEnterprisesExtended.forEach(enterprise => {
  const enterpriseListings = mockListingsExtended.filter(l => l.enterpriseId === enterprise.id)
  console.log(`- ${enterprise.name} (${enterprise.id}): ${enterpriseListings.length} listings`)
})