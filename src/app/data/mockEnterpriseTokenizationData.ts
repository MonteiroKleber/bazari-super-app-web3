// src/app/data/mockMarketplaceDataExtended.ts
// ✅ Dados mock estendidos que vinculam enterprises e listings

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
    logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400',
    banner: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=1200&h=400&fit=crop',
    categories: ['technology', 'software'],
    subcategories: ['blockchain', 'web-development'],
    address: {
      street: 'Rua das Inovações, 123',
      city: 'São Paulo',
      state: 'SP',
      country: 'Brasil',
      zipCode: '01310-100',
      coordinates: {
        lat: -23.5505,
        lng: -46.6333
      }
    },
    contact: {
      phone: '+55 11 99999-0001',
      email: 'contato@bazaritech.com',
      website: 'https://bazaritech.com',
      socialMedia: {
        instagram: 'bazaritech',
        linkedin: 'bazari-tech-solutions',
        twitter: 'bazaritech'
      }
    },
    tokenizable: true,
    tokenization: {
      enabled: true,
      totalSupply: 100000,
      currentSupply: 75000,
      royaltyPercentage: 8,
      transferable: true,
      mintPrice: 50,
      mintCurrency: 'BZR'
    },
    // ✅ CAMPOS ESTENDIDOS DE TOKENIZAÇÃO
    tokenized: true,
    tokenSymbol: 'BZRT',
    totalSupply: 100000,
    circulatingSupply: 75000,
    holdersCount: 342,
    treasuryBalanceBZR: 125000,
    revenueLast30dBZR: 45000,
    revenueLast12mBZR: 520000,
    profitMarginPct: 12.5,
    dividendPolicy: 'quarterly',
    lastPayoutDate: '2024-12-31T00:00:00Z',
    priceBZR: 52.75,
    priceChange24hPct: 2.3,
    onChainAddress: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    reputation: {
      rating: 4.8,
      reviewCount: 127,
      totalSales: 89,
      completionRate: 98.5
    },
    verification: {
      verified: true,
      verifiedAt: '2024-01-15T10:00:00Z',
      documents: ['cnpj', 'address_proof', 'bank_account']
    },
    settings: {
      autoAcceptOrders: false,
      minOrderValue: 100,
      maxOrderValue: 50000,
      acceptedCurrencies: ['BZR', 'BRL'],
      deliveryMethods: ['digital', 'consulting']
    },
    stats: {
      totalListings: 12,
      activeListings: 10,
      soldListings: 89,
      totalViews: 5420,
      totalRevenue: {
        BZR: 156000,
        BRL: 89000
      },
      avgResponseTime: 45
    },
    status: 'active',
    createdAt: '2023-08-15T09:00:00Z',
    updatedAt: '2025-01-15T14:30:00Z'
  },
  {
    id: 'enterprise_2',
    ownerId: 'user_2',
    ownerName: 'Maria Santos',
    name: 'Verde Sustentável',
    description: 'Empresa focada em soluções sustentáveis e produtos ecológicos. Desenvolvemos projetos de energia renovável, consultoria ambiental e comercializamos produtos orgânicos certificados.',
    logo: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400',
    banner: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=400&fit=crop',
    categories: ['sustainability', 'environment'],
    subcategories: ['renewable-energy', 'organic-products'],
    address: {
      street: 'Av. das Árvores, 456',
      city: 'Curitiba',
      state: 'PR',
      country: 'Brasil',
      zipCode: '80010-000'
    },
    contact: {
      phone: '+55 41 98888-0002',
      email: 'contato@verdesustentavel.com',
      website: 'https://verdesustentavel.com',
      socialMedia: {
        instagram: 'verdesustentavel',
        facebook: 'VerdeS ustentavel'
      }
    },
    tokenizable: true,
    tokenization: {
      enabled: true,
      totalSupply: 50000,
      currentSupply: 32000,
      royaltyPercentage: 6,
      transferable: true,
      mintPrice: 80,
      mintCurrency: 'BZR'
    },
    // ✅ CAMPOS ESTENDIDOS DE TOKENIZAÇÃO
    tokenized: true,
    tokenSymbol: 'VERDE',
    totalSupply: 50000,
    circulatingSupply: 32000,
    holdersCount: 187,
    treasuryBalanceBZR: 95000,
    revenueLast30dBZR: 28000,
    revenueLast12mBZR: 340000,
    profitMarginPct: 9.8,
    dividendPolicy: 'monthly',
    lastPayoutDate: '2025-01-31T00:00:00Z',
    priceBZR: 85.20,
    priceChange24hPct: -1.2,
    onChainAddress: '5FvwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    reputation: {
      rating: 4.6,
      reviewCount: 89,
      totalSales: 67,
      completionRate: 95.2
    },
    verification: {
      verified: true,
      verifiedAt: '2024-03-20T15:30:00Z',
      documents: ['cnpj', 'environmental_license']
    },
    settings: {
      autoAcceptOrders: true,
      minOrderValue: 50,
      acceptedCurrencies: ['BZR', 'BRL'],
      deliveryMethods: ['shipping', 'pickup']
    },
    stats: {
      totalListings: 18,
      activeListings: 15,
      soldListings: 67,
      totalViews: 3890,
      totalRevenue: {
        BZR: 89000,
        BRL: 124000
      },
      avgResponseTime: 120
    },
    status: 'active',
    createdAt: '2023-11-10T11:20:00Z',
    updatedAt: '2025-01-20T16:45:00Z'
  },
  {
    id: 'enterprise_3',
    ownerId: 'user_3',
    ownerName: 'Carlos Oliveira',
    name: 'Artesãos Unidos',
    description: 'Cooperativa de artesãos especializados em produtos únicos feitos à mão. Valorizamos técnicas tradicionais e materiais sustentáveis para criar peças exclusivas de decoração, utensílios e arte.',
    logo: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    banner: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=400&fit=crop',
    categories: ['handcraft', 'art'],
    subcategories: ['decoration', 'traditional'],
    address: {
      street: 'Rua dos Artistas, 789',
      city: 'Ouro Preto',
      state: 'MG',
      country: 'Brasil',
      zipCode: '35400-000'
    },
    contact: {
      phone: '+55 31 97777-0003',
      email: 'contato@artesaosunidos.com',
      socialMedia: {
        instagram: 'artesaosunidos'
      }
    },
    tokenizable: true,
    tokenization: {
      enabled: false, // Suporta mas não ativou ainda
      totalSupply: 25000,
      currentSupply: 0,
      royaltyPercentage: 5,
      transferable: true,
      mintPrice: 25,
      mintCurrency: 'BZR'
    },
    // ✅ NÃO TOKENIZADO AINDA
    tokenized: false,
    tokenSymbol: 'ARTE',
    totalSupply: 25000,
    circulatingSupply: 0,
    holdersCount: 0,
    treasuryBalanceBZR: 0,
    revenueLast30dBZR: 15000, // Ainda tem receita normal
    revenueLast12mBZR: 180000,
    profitMarginPct: 15.2,
    dividendPolicy: 'none',
    reputation: {
      rating: 4.4,
      reviewCount: 52,
      totalSales: 34,
      completionRate: 92.8
    },
    verification: {
      verified: false,
      documents: []
    },
    settings: {
      autoAcceptOrders: false,
      minOrderValue: 30,
      acceptedCurrencies: ['BZR', 'BRL'],
      deliveryMethods: ['shipping']
    },
    stats: {
      totalListings: 8,
      activeListings: 6,
      soldListings: 34,
      totalViews: 1240,
      totalRevenue: {
        BZR: 45000,
        BRL: 67000
      },
      avgResponseTime: 180
    },
    status: 'active',
    createdAt: '2024-02-05T14:15:00Z',
    updatedAt: '2025-01-18T10:20:00Z'
  }
]

// ✅ LISTINGS MOCK vinculados aos enterprises
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
    enterpriseId: 'enterprise_1', // ✅ VINCULAÇÃO
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
    enterpriseId: 'enterprise_1', // ✅ VINCULAÇÃO
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
    subcategory: 'web-development',
    images: [
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600'
    ],
    sellerId: 'user_1',
    sellerName: 'João Silva',
    sellerRating: 4.8,
    enterpriseId: 'enterprise_1', // ✅ VINCULAÇÃO
    enterpriseName: 'Bazari Tech Solutions',
    status: 'active',
    createdAt: '2025-01-05T15:30:00Z',
    updatedAt: '2025-01-10T09:15:00Z',
    views: 234
  },

  // Listings da Verde Sustentável (enterprise_2)
  {
    id: 'listing_4',
    title: 'Kit Solar Residencial 5kW',
    description: 'Sistema completo de energia solar para residências. Inclui painéis, inversor, estrutura de fixação e instalação. Economia de até 90% na conta de luz.',
    price: 18000,
    currency: 'BRL',
    category: 'sustainability',
    subcategory: 'renewable-energy',
    images: [
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600'
    ],
    sellerId: 'user_2',
    sellerName: 'Maria Santos',
    sellerRating: 4.6,
    enterpriseId: 'enterprise_2', // ✅ VINCULAÇÃO
    enterpriseName: 'Verde Sustentável',
    status: 'active',
    createdAt: '2025-01-12T10:45:00Z',
    updatedAt: '2025-01-15T13:20:00Z',
    views: 178,
    metadata: {
      condition: 'new',
      warranty: '25 anos nos painéis, 10 anos no inversor',
      shipping: {
        free: true,
        methods: ['Entrega e instalação incluída'],
        estimatedDays: 30
      }
    }
  },
  {
    id: 'listing_5',
    title: 'Cesta Orgânica Semanal - Grande',
    description: 'Cesta com variedade de frutas, verduras e legumes orgânicos certificados. Produtos frescos, direto do produtor para sua mesa.',
    price: 120,
    currency: 'BRL',
    category: 'sustainability',
    subcategory: 'organic-products',
    images: [
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600'
    ],
    sellerId: 'user_2',
    sellerName: 'Maria Santos',
    sellerRating: 4.6,
    enterpriseId: 'enterprise_2', // ✅ VINCULAÇÃO
    enterpriseName: 'Verde Sustentável',
    status: 'active',
    createdAt: '2025-01-14T08:00:00Z',
    updatedAt: '2025-01-16T12:30:00Z',
    views: 267,
    metadata: {
      condition: 'new',
      shipping: {
        free: false,
        methods: ['Entrega semanal'],
        estimatedDays: 1,
        cost: 15
      }
    }
  },
  {
    id: 'listing_6',
    title: 'Consultoria em Sustentabilidade Empresarial',
    description: 'Análise completa dos processos da sua empresa para implementação de práticas sustentáveis. Relatório detalhado e plano de ação.',
    price: 3500,
    currency: 'BZR',
    category: 'sustainability',
    subcategory: 'consulting',
    images: [
      'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=600'
    ],
    sellerId: 'user_2',
    sellerName: 'Maria Santos',
    sellerRating: 4.6,
    enterpriseId: 'enterprise_2', // ✅ VINCULAÇÃO
    enterpriseName: 'Verde Sustentável',
    status: 'active',
    createdAt: '2025-01-09T14:20:00Z',
    updatedAt: '2025-01-13T11:45:00Z',
    views: 92,
    digital: {
      type: 'other',
      deliveryInstructions: 'Relatório digital + apresentação presencial ou online.'
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
    enterpriseId: 'enterprise_3', // ✅ VINCULAÇÃO
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
    enterpriseId: 'enterprise_3', // ✅ VINCULAÇÃO
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

// ✅ DADOS de séries temporais para gráficos
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
    { month: '2024-12', revenue: 52500, profit: 6562, profitMarginPct: 12.5, holders: 341, tokenPrice: 53.80 },
    { month: '2025-01', revenue: 45000, profit: 5625, profitMarginPct: 12.5, holders: 342, tokenPrice: 52.75 }
  ],
  'enterprise_2': [
    { month: '2024-02', revenue: 22000, profit: 2156, profitMarginPct: 9.8, holders: 145, tokenPrice: 75.30 },
    { month: '2024-03', revenue: 24500, profit: 2401, profitMarginPct: 9.8, holders: 152, tokenPrice: 78.20 },
    { month: '2024-04', revenue: 26000, profit: 2548, profitMarginPct: 9.8, holders: 158, tokenPrice: 80.40 },
    { month: '2024-05', revenue: 28500, profit: 2793, profitMarginPct: 9.8, holders: 165, tokenPrice: 82.10 },
    { month: '2024-06', revenue: 30000, profit: 2940, profitMarginPct: 9.8, holders: 171, tokenPrice: 84.50 },
    { month: '2024-07', revenue: 31200, profit: 3057, profitMarginPct: 9.8, holders: 176, tokenPrice: 86.30 },
    { month: '2024-08', revenue: 29800, profit: 2920, profitMarginPct: 9.8, holders: 179, tokenPrice: 85.90 },
    { month: '2024-09', revenue: 32100, profit: 3145, profitMarginPct: 9.8, holders: 182, tokenPrice: 87.60 },
    { month: '2024-10', revenue: 33000, profit: 3234, profitMarginPct: 9.8, holders: 184, tokenPrice: 88.40 },
    { month: '2024-11', revenue: 31500, profit: 3087, profitMarginPct: 9.8, holders: 186, tokenPrice: 86.70 },
    { month: '2024-12', revenue: 34200, profit: 3351, profitMarginPct: 9.8, holders: 187, tokenPrice: 89.10 },
    { month: '2025-01', revenue: 28000, profit: 2744, profitMarginPct: 9.8, holders: 187, tokenPrice: 85.20 }
  ]
}