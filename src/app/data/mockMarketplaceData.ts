// src/app/data/mockMarketplaceData.ts

import { Enterprise } from '@features/marketplace/types/enterprise.types'
import { Listing } from '@features/marketplace/store/marketplaceStore'

export const mockListings = [
  // 📱 ELECTRONICS
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
  },
  {
    id: 'listing_9',
    title: 'Camisa Social Hugo Boss Slim Fit',
    description: 'Camisa social Hugo Boss slim fit, cor branca, tamanho M.',
    price: 380,
    currency: 'BRL' as const,
    category: 'fashion',
    subcategory: 'mens_clothing',
    images: ['https://picsum.photos/400/300?random=9'],
    sellerId: 'user_9',
    sellerName: 'Men Style',
    sellerRating: 4.6,
    status: 'active' as const,
    createdAt: '2024-08-09T14:20:00.000Z',
    updatedAt: '2024-08-09T14:20:00.000Z',
    views: 760
  },
  {
    id: 'listing_10',
    title: 'Bolsa Feminina Couro Legítimo Premium',
    description: 'Bolsa feminina em couro legítimo premium, cor caramelo.',
    price: 420,
    currency: 'BRL' as const,
    category: 'fashion',
    subcategory: 'accessories',
    images: ['https://picsum.photos/400/300?random=10'],
    sellerId: 'user_10',
    sellerName: 'Leather Boutique',
    sellerRating: 4.6,
    status: 'active' as const,
    createdAt: '2024-08-12T14:10:00.000Z',
    updatedAt: '2024-08-12T14:10:00.000Z',
    views: 850
  },
  {
    id: 'listing_11',
    title: 'Mochila Louis Vuitton Original',
    description: 'Mochila Louis Vuitton monogram, edição limitada.',
    price: 3800,
    currency: 'BRL' as const,
    category: 'fashion',
    subcategory: 'bags',
    images: ['https://picsum.photos/400/300?random=11'],
    sellerId: 'user_11',
    sellerName: 'Luxury Store',
    sellerRating: 4.9,
    status: 'active' as const,
    createdAt: '2024-08-08T10:15:00.000Z',
    updatedAt: '2024-08-08T10:15:00.000Z',
    views: 2340
  },

  // 🏠 HOME
  {
    id: 'listing_12',
    title: 'Sofá 3 Lugares Retrátil e Reclinável',
    description: 'Sofá 3 lugares com mecanismo retrátil e reclinável.',
    price: 1800,
    currency: 'BRL' as const,
    category: 'home',
    subcategory: 'furniture',
    images: ['https://picsum.photos/400/300?random=12'],
    sellerId: 'user_12',
    sellerName: 'Casa & Conforto',
    sellerRating: 4.4,
    status: 'active' as const,
    createdAt: '2024-08-09T08:15:00.000Z',
    updatedAt: '2024-08-09T08:15:00.000Z',
    views: 1450
  },
  {
    id: 'listing_13',
    title: 'Fogão Brastemp 5 Bocas com Forno',
    description: 'Fogão Brastemp 5 bocas com forno, mesa de vidro temperado.',
    price: 1200,
    currency: 'BRL' as const,
    category: 'home',
    subcategory: 'appliances',
    images: ['https://picsum.photos/400/300?random=13'],
    sellerId: 'user_13',
    sellerName: 'Eletro Casa',
    sellerRating: 4.3,
    status: 'active' as const,
    createdAt: '2024-08-07T15:45:00.000Z',
    updatedAt: '2024-08-07T15:45:00.000Z',
    views: 980
  },
  {
    id: 'listing_14',
    title: 'Kit Decoração Sala - Quadros + Vasos',
    description: 'Kit completo de decoração: 3 quadros + 2 vasos decorativos.',
    price: 320,
    currency: 'BRL' as const,
    category: 'home',
    subcategory: 'decoration',
    images: ['https://picsum.photos/400/300?random=14'],
    sellerId: 'user_14',
    sellerName: 'Decor Home',
    sellerRating: 4.7,
    status: 'active' as const,
    createdAt: '2024-08-06T13:20:00.000Z',
    updatedAt: '2024-08-06T13:20:00.000Z',
    views: 670
  },
  {
    id: 'listing_15',
    title: 'Kit Jardim Vertical + 10 Plantas',
    description: 'Kit jardim vertical completo com suporte e 10 plantas.',
    price: 280,
    currency: 'BRL' as const,
    category: 'home',
    subcategory: 'garden',
    images: ['https://picsum.photos/400/300?random=15'],
    sellerId: 'user_15',
    sellerName: 'Green Garden',
    sellerRating: 4.8,
    status: 'active' as const,
    createdAt: '2024-08-05T09:30:00.000Z',
    updatedAt: '2024-08-05T09:30:00.000Z',
    views: 1120
  },

  // 🚗 VEHICLES
  {
    id: 'listing_16',
    title: 'Honda Civic 2020 LX CVT',
    description: 'Honda Civic LX 2020, câmbio CVT, 2.0 Flex.',
    price: 85000,
    currency: 'BRL' as const,
    category: 'vehicles',
    subcategory: 'cars',
    images: ['https://picsum.photos/400/300?random=16'],
    sellerId: 'user_16',
    sellerName: 'AutoCenter Premium',
    sellerRating: 4.7,
    enterpriseId: 'ent_4',
    enterpriseName: 'Premium Veículos',
    status: 'active' as const,
    createdAt: '2024-08-11T08:00:00.000Z',
    updatedAt: '2024-08-11T08:00:00.000Z',
    views: 2340
  },
  {
    id: 'listing_17',
    title: 'Honda CBR 600RR 2023',
    description: 'Honda CBR 600RR 2023, moto esportiva, apenas 5.000km.',
    price: 45000,
    currency: 'BRL' as const,
    category: 'vehicles',
    subcategory: 'motorcycles',
    images: ['https://picsum.photos/400/300?random=17'],
    sellerId: 'user_17',
    sellerName: 'Moto Sport',
    sellerRating: 4.8,
    status: 'active' as const,
    createdAt: '2024-08-04T16:30:00.000Z',
    updatedAt: '2024-08-04T16:30:00.000Z',
    views: 1890
  },
  {
    id: 'listing_18',
    title: 'Kit Pneus Michelin 205/55 R16',
    description: 'Kit 4 pneus Michelin 205/55 R16, novos, sem uso.',
    price: 1800,
    currency: 'BRL' as const,
    category: 'vehicles',
    subcategory: 'parts',
    images: ['https://picsum.photos/400/300?random=18'],
    sellerId: 'user_18',
    sellerName: 'Auto Peças',
    sellerRating: 4.5,
    status: 'active' as const,
    createdAt: '2024-08-03T11:45:00.000Z',
    updatedAt: '2024-08-03T11:45:00.000Z',
    views: 1250
  },

  // 💻 DIGITAL
  {
    id: 'listing_19',
    title: 'Curso Completo: React.js do Zero ao Avançado',
    description: 'Curso completo de React.js com 40 horas de conteúdo.',
    price: 450,
    currency: 'BZR' as const,
    category: 'digital',
    subcategory: 'courses',
    images: ['https://picsum.photos/400/300?random=19'],
    sellerId: 'user_19',
    sellerName: 'Dev Academy',
    sellerRating: 4.9,
    enterpriseId: 'ent_2',
    enterpriseName: 'EduTech Online',
    status: 'active' as const,
    createdAt: '2024-08-15T13:00:00.000Z',
    updatedAt: '2024-08-15T13:00:00.000Z',
    views: 3450,
    digital: {
      type: 'course' as const,
      deliveryInstructions: 'Acesso liberado automaticamente após pagamento.',
      tokenizable: true
    }
  },
  {
    id: 'listing_20',
    title: 'E-book: Estratégias de Marketing Digital 2024',
    description: 'E-book completo com 150 páginas sobre marketing digital.',
    price: 80,
    currency: 'BZR' as const,
    category: 'digital',
    subcategory: 'ebooks',
    images: ['https://picsum.photos/400/300?random=20'],
    sellerId: 'user_20',
    sellerName: 'Marketing Pro',
    sellerRating: 4.7,
    status: 'active' as const,
    createdAt: '2024-08-14T10:20:00.000Z',
    updatedAt: '2024-08-14T10:20:00.000Z',
    views: 1890,
    digital: {
      type: 'ebook' as const,
      deliveryInstructions: 'Download do PDF será enviado por email.',
      tokenizable: false
    }
  },
  {
    id: 'listing_21',
    title: 'Software de Gestão Empresarial',
    description: 'Sistema completo de gestão empresarial com módulos integrados.',
    price: 1200,
    currency: 'BZR' as const,
    category: 'digital',
    subcategory: 'software',
    images: ['https://picsum.photos/400/300?random=21'],
    sellerId: 'user_21',
    sellerName: 'SoftDev Solutions',
    sellerRating: 4.8,
    status: 'active' as const,
    createdAt: '2024-08-02T14:15:00.000Z',
    updatedAt: '2024-08-02T14:15:00.000Z',
    views: 890,
    digital: {
      type: 'software' as const,
      deliveryInstructions: 'Licença enviada por email + suporte de instalação.',
      tokenizable: true
    }
  },
  {
    id: 'listing_22',
    title: 'Template WordPress Premium - Loja Virtual',
    description: 'Template WordPress responsivo para loja virtual.',
    price: 120,
    currency: 'BZR' as const,
    category: 'digital',
    subcategory: 'templates',
    images: ['https://picsum.photos/400/300?random=22'],
    sellerId: 'user_22',
    sellerName: 'WP Themes',
    sellerRating: 4.6,
    status: 'active' as const,
    createdAt: '2024-08-13T14:45:00.000Z',
    updatedAt: '2024-08-13T14:45:00.000Z',
    views: 760,
    digital: {
      type: 'template' as const,
      deliveryInstructions: 'Download do arquivo ZIP + documentação.',
      tokenizable: true
    }
  },
  {
    id: 'listing_23',
    title: 'Pack de 100 Músicas Royalty-Free',
    description: 'Coleção de 100 músicas sem direitos autorais para vídeos.',
    price: 200,
    currency: 'BZR' as const,
    category: 'digital',
    subcategory: 'media',
    images: ['https://picsum.photos/400/300?random=23'],
    sellerId: 'user_23',
    sellerName: 'Audio Creator',
    sellerRating: 4.7,
    status: 'active' as const,
    createdAt: '2024-08-01T16:20:00.000Z',
    updatedAt: '2024-08-01T16:20:00.000Z',
    views: 1340,
    digital: {
      type: 'media' as const,
      deliveryInstructions: 'Download via link seguro após pagamento.',
      tokenizable: false
    }
  },

  // 🎨 SERVICES
  {
    id: 'listing_24',
    title: 'Consultoria em Marketing Digital - 2h',
    description: 'Sessão de consultoria personalizada em marketing digital.',
    price: 200,
    currency: 'BZR' as const,
    category: 'services',
    subcategory: 'consulting',
    images: ['https://picsum.photos/400/300?random=24'],
    sellerId: 'user_24',
    sellerName: 'Consultora Digital',
    sellerRating: 4.9,
    enterpriseId: 'ent_3',
    enterpriseName: 'Digital Growth',
    status: 'active' as const,
    createdAt: '2024-08-15T11:00:00.000Z',
    updatedAt: '2024-08-15T11:00:00.000Z',
    views: 890,
    digital: {
      type: 'other' as const,
      deliveryInstructions: 'Agendamento via WhatsApp após confirmação.'
    }
  },
  {
    id: 'listing_25',
    title: 'Design de Logo + Identidade Visual',
    description: 'Criação de logo profissional + manual de identidade visual.',
    price: 350,
    currency: 'BZR' as const,
    category: 'services',
    subcategory: 'design_services',
    images: ['https://picsum.photos/400/300?random=25'],
    sellerId: 'user_25',
    sellerName: 'Design Studio',
    sellerRating: 4.8,
    status: 'active' as const,
    createdAt: '2024-08-14T16:20:00.000Z',
    updatedAt: '2024-08-14T16:20:00.000Z',
    views: 1560,
    digital: {
      type: 'other' as const,
      deliveryInstructions: 'Entrega em até 7 dias úteis via email.'
    }
  },
  {
    id: 'listing_26',
    title: 'Desenvolvimento de Site WordPress Completo',
    description: 'Criação de site profissional em WordPress.',
    price: 800,
    currency: 'BZR' as const,
    category: 'services',
    subcategory: 'development',
    images: ['https://picsum.photos/400/300?random=26'],
    sellerId: 'user_26',
    sellerName: 'WebDev Pro',
    sellerRating: 4.9,
    status: 'active' as const,
    createdAt: '2024-08-15T14:50:00.000Z',
    updatedAt: '2024-08-15T14:50:00.000Z',
    views: 1340,
    digital: {
      type: 'other' as const,
      deliveryInstructions: 'Projeto entregue em 14 dias úteis.'
    }
  },
  {
    id: 'listing_27',
    title: 'Gestão de Redes Sociais - Mensal',
    description: 'Gestão completa de redes sociais por 30 dias.',
    price: 600,
    currency: 'BZR' as const,
    category: 'services',
    subcategory: 'marketing_services',
    images: ['https://picsum.photos/400/300?random=27'],
    sellerId: 'user_27',
    sellerName: 'Social Media Pro',
    sellerRating: 4.6,
    status: 'active' as const,
    createdAt: '2024-08-12T10:30:00.000Z',
    updatedAt: '2024-08-12T10:30:00.000Z',
    views: 780,
    digital: {
      type: 'other' as const,
      deliveryInstructions: 'Início imediato após briefing.'
    }
  },

  // 🏃 SPORTS
  {
    id: 'listing_28',
    title: 'Bicicleta Mountain Bike Specialized',
    description: 'Bicicleta mountain bike Specialized Rockhopper aro 29.',
    price: 2200,
    currency: 'BRL' as const,
    category: 'sports',
    subcategory: 'fitness',
    images: ['https://picsum.photos/400/300?random=28'],
    sellerId: 'user_28',
    sellerName: 'Bike Shop',
    sellerRating: 4.8,
    status: 'active' as const,
    createdAt: '2024-08-12T09:30:00.000Z',
    updatedAt: '2024-08-12T09:30:00.000Z',
    views: 1240
  },
  {
    id: 'listing_29',
    title: 'Kit Camping Completo - 4 Pessoas',
    description: 'Kit camping: barraca 4 pessoas + sleeping bags + acessórios.',
    price: 850,
    currency: 'BRL' as const,
    category: 'sports',
    subcategory: 'outdoor',
    images: ['https://picsum.photos/400/300?random=29'],
    sellerId: 'user_29',
    sellerName: 'Adventure Gear',
    sellerRating: 4.7,
    status: 'active' as const,
    createdAt: '2024-08-10T13:45:00.000Z',
    updatedAt: '2024-08-10T13:45:00.000Z',
    views: 980
  },
  {
    id: 'listing_30',
    title: 'Bola de Futebol Nike Oficial + Chuteira',
    description: 'Kit futebol: bola Nike oficial + chuteira Mercurial.',
    price: 380,
    currency: 'BRL' as const,
    category: 'sports',
    subcategory: 'sports_equipment',
    images: ['https://picsum.photos/400/300?random=30'],
    sellerId: 'user_30',
    sellerName: 'Sports Store',
    sellerRating: 4.5,
    status: 'active' as const,
    createdAt: '2024-08-09T15:15:00.000Z',
    updatedAt: '2024-08-09T15:15:00.000Z',
    views: 670
  },
  {
    id: 'listing_31',
    title: 'Kit Whey Protein + Creatina + BCAA',
    description: 'Kit completo de suplementos para treino.',
    price: 320,
    currency: 'BRL' as const,
    category: 'sports',
    subcategory: 'fitness',
    images: ['https://picsum.photos/400/300?random=31'],
    sellerId: 'user_31',
    sellerName: 'Suplementos Brasil',
    sellerRating: 4.6,
    status: 'active' as const,
    createdAt: '2024-08-10T13:15:00.000Z',
    updatedAt: '2024-08-10T13:15:00.000Z',
    views: 1120
  },

  // 📚 BOOKS
  {
    id: 'listing_32',
    title: 'Coleção Harry Potter Completa',
    description: 'Coleção completa Harry Potter - 7 livros em português.',
    price: 180,
    currency: 'BRL' as const,
    category: 'books',
    subcategory: 'physical_books',
    images: ['https://picsum.photos/400/300?random=32'],
    sellerId: 'user_32',
    sellerName: 'Book Lover',
    sellerRating: 4.8,
    status: 'active' as const,
    createdAt: '2024-08-08T14:30:00.000Z',
    updatedAt: '2024-08-08T14:30:00.000Z',
    views: 1450
  },
  {
    id: 'listing_33',
    title: 'Kit Material Escolar Completo',
    description: 'Kit escolar: cadernos, canetas, lápis, réguas, etc.',
    price: 95,
    currency: 'BRL' as const,
    category: 'books',
    subcategory: 'educational_materials',
    images: ['https://picsum.photos/400/300?random=33'],
    sellerId: 'user_33',
    sellerName: 'Papelaria Central',
    sellerRating: 4.4,
    status: 'active' as const,
    createdAt: '2024-08-07T10:20:00.000Z',
    updatedAt: '2024-08-07T10:20:00.000Z',
    views: 890
  },
  {
    id: 'listing_34',
    title: 'Livros Universitários - Engenharia',
    description: 'Coleção livros de engenharia: cálculo, física, química.',
    price: 450,
    currency: 'BRL' as const,
    category: 'books',
    subcategory: 'physical_books',
    images: ['https://picsum.photos/400/300?random=34'],
    sellerId: 'user_34',
    sellerName: 'Estudante Graduado',
    sellerRating: 4.6,
    status: 'active' as const,
    createdAt: '2024-08-06T16:10:00.000Z',
    updatedAt: '2024-08-06T16:10:00.000Z',
    views: 760
  },
  {
    id: 'listing_35',
    title: 'Kit Escritório: Pastas + Organizadores',
    description: 'Kit organização escritório: pastas, organizadores, etiquetas.',
    price: 120,
    currency: 'BRL' as const,
    category: 'books',
    subcategory: 'educational_materials',
    images: ['https://picsum.photos/400/300?random=35'],
    sellerId: 'user_35',
    sellerName: 'Office Supply',
    sellerRating: 4.3,
    status: 'active' as const,
    createdAt: '2024-08-05T12:45:00.000Z',
    updatedAt: '2024-08-05T12:45:00.000Z',
    views: 540
  }
]

export const mockEnterprises = [


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
  },

  {
    id: 'ent_1',
    ownerId: 'user_2',
    ownerName: 'João Silva',
    name: 'Tech Solutions Pro',
    description: 'Especializada em soluções tecnológicas inovadoras.',
    logo: 'https://picsum.photos/100/100?random=101',
    banner: 'https://picsum.photos/800/200?random=201',
    categories: ['digital', 'services'],
    subcategories: ['software', 'consulting'],
    address: {
      street: 'Av. Paulista, 1500',
      city: 'São Paulo',
      state: 'SP',
      country: 'Brasil',
      zipCode: '01310-100'
    },
    contact: {
      phone: '+55 11 99999-9999',
      email: 'contato@techsolutions.com',
      website: 'https://techsolutions.com',
      socialMedia: {
        instagram: '@techsolutionspro'
      }
    },
    tokenizable: true,
    tokenization: {
      enabled: true,
      totalSupply: 10000,
      currentSupply: 2500,
      royaltyPercentage: 5,
      transferable: true,
      mintPrice: 100,
      mintCurrency: 'BZR' as const
    },
    reputation: {
      rating: 4.8,
      reviewCount: 156,
      totalSales: 1200,
      completionRate: 98.5
    },
    verification: {
      verified: true,
      verifiedAt: '2024-01-15T10:00:00.000Z',
      documents: ['cnpj', 'address']
    },
    settings: {
      autoAcceptOrders: false,
      minOrderValue: 50,
      acceptedCurrencies: ['BZR', 'BRL'] as const,
      deliveryMethods: ['digital', 'express']
    },
    stats: {
      totalListings: 45,
      activeListings: 32,
      soldListings: 13,
      totalViews: 15420,
      totalRevenue: { BZR: 50000, BRL: 120000 },
      avgResponseTime: 15
    },
    status: 'active' as const,
    createdAt: '2023-06-15T00:00:00.000Z',
    updatedAt: '2024-08-15T12:00:00.000Z'
  },
  {
    id: 'ent_2',
    ownerId: 'user_19',
    ownerName: 'Carlos Educador',
    name: 'EduTech Online',
    description: 'Plataforma de ensino online especializada em tecnologia.',
    logo: 'https://picsum.photos/100/100?random=102',
    banner: 'https://picsum.photos/800/200?random=202',
    categories: ['digital', 'services'],
    subcategories: ['courses', 'consulting'],
    address: {
      street: 'R. da Educação, 789',
      city: 'Florianópolis',
      state: 'SC',
      country: 'Brasil',
      zipCode: '88010-400'
    },
    contact: {
      phone: '+55 48 96666-6666',
      email: 'contato@edutech.com',
      website: 'https://edutech.online',
      socialMedia: {
        instagram: '@edutechonline'
      }
    },
    tokenizable: true,
    tokenization: {
      enabled: true,
      totalSupply: 20000,
      currentSupply: 8500,
      royaltyPercentage: 12,
      transferable: true,
      mintPrice: 80,
      mintCurrency: 'BZR' as const
    },
    reputation: {
      rating: 4.9,
      reviewCount: 234,
      totalSales: 1850,
      completionRate: 99.2
    },
    verification: {
      verified: true,
      verifiedAt: '2024-01-10T10:00:00.000Z',
      documents: ['cnpj', 'address', 'identity']
    },
    settings: {
      autoAcceptOrders: true,
      minOrderValue: 25,
      acceptedCurrencies: ['BZR', 'BRL'] as const,
      deliveryMethods: ['digital']
    },
    stats: {
      totalListings: 52,
      activeListings: 48,
      soldListings: 4,
      totalViews: 28900,
      totalRevenue: { BZR: 125000, BRL: 95000 },
      avgResponseTime: 5
    },
    status: 'active' as const,
    createdAt: '2023-07-20T00:00:00.000Z',
    updatedAt: '2024-08-15T11:15:00.000Z'
  },
  {
    id: 'ent_3',
    ownerId: 'user_24',
    ownerName: 'Mariana Marketing',
    name: 'Digital Growth',
    description: 'Agência de marketing digital focada em crescimento.',
    logo: 'https://picsum.photos/100/100?random=103',
    banner: 'https://picsum.photos/800/200?random=203',
    categories: ['services', 'digital'],
    subcategories: ['marketing_services', 'consulting'],
    address: {
      street: 'Av. Inovação, 321',
      city: 'Curitiba',
      state: 'PR',
      country: 'Brasil',
      zipCode: '80010-130'
    },
    contact: {
      phone: '+55 41 95555-5555',
      email: 'mariana@digitalgrowth.com',
      website: 'https://digitalgrowth.com.br',
      socialMedia: {
        instagram: '@digitalgrowthbr'
      }
    },
    tokenizable: false,
    reputation: {
      rating: 4.8,
      reviewCount: 143,
      totalSales: 890,
      completionRate: 98.9
    },
    verification: {
      verified: true,
      verifiedAt: '2024-03-15T10:00:00.000Z',
      documents: ['cnpj', 'address']
    },
    settings: {
      autoAcceptOrders: false,
      minOrderValue: 100,
      maxOrderValue: 10000,
      acceptedCurrencies: ['BZR', 'BRL'] as const,
      deliveryMethods: ['digital', 'consultation']
    },
    stats: {
      totalListings: 35,
      activeListings: 30,
      soldListings: 5,
      totalViews: 12400,
      totalRevenue: { BZR: 45000, BRL: 78000 },
      avgResponseTime: 12
    },
    status: 'active' as const,
    createdAt: '2023-08-12T00:00:00.000Z',
    updatedAt: '2024-08-15T09:20:00.000Z'
  },
  {
    id: 'ent_4',
    ownerId: 'user_16',
    ownerName: 'Roberto Auto',
    name: 'Premium Veículos',
    description: 'Concessionária multimarcas especializada em seminovos.',
    logo: 'https://picsum.photos/100/100?random=104',
    banner: 'https://picsum.photos/800/200?random=204',
    categories: ['vehicles'],
    subcategories: ['cars', 'motorcycles'],
    address: {
      street: 'Rod. Presidente Dutra, km 185',
      city: 'São José dos Campos',
      state: 'SP',
      country: 'Brasil',
      zipCode: '12240-420'
    },
    contact: {
      phone: '+55 12 94444-4444',
      email: 'roberto@premiumveiculos.com',
      website: 'https://premiumveiculos.com.br',
      socialMedia: {
        instagram: '@premiumveiculos'
      }
    },
    tokenizable: false,
    reputation: {
      rating: 4.5,
      reviewCount: 78,
      totalSales: 156,
      completionRate: 95.5
    },
    verification: {
      verified: true,
      verifiedAt: '2024-04-01T10:00:00.000Z',
      documents: ['cnpj', 'address']
    },
    settings: {
      autoAcceptOrders: false,
      minOrderValue: 5000,
      maxOrderValue: 500000,
      acceptedCurrencies: ['BRL'] as const,
      deliveryMethods: ['pickup', 'delivery']
    },
    stats: {
      totalListings: 24,
      activeListings: 20,
      soldListings: 4,
      totalViews: 18600,
      totalRevenue: { BZR: 0, BRL: 2450000 },
      avgResponseTime: 30
    },
    status: 'active' as const,
    createdAt: '2023-10-30T00:00:00.000Z',
    updatedAt: '2024-08-14T14:30:00.000Z'
  },
  {
    id: 'ent_5',
    ownerId: 'user_32',
    ownerName: 'Ana Books',
    name: 'Livraria & Educação',
    description: 'Especializada em livros acadêmicos e materiais educativos.',
    logo: 'https://picsum.photos/100/100?random=105',
    banner: 'https://picsum.photos/800/200?random=205',
    categories: ['books', 'education'],
    subcategories: ['physical_books', 'educational_materials'],
    address: {
      street: 'R. das Letras, 456',
      city: 'Belo Horizonte',
      state: 'MG',
      country: 'Brasil',
      zipCode: '30112-000'
    },
    contact: {
      phone: '+55 31 97777-7777',
      email: 'ana@livrariae.com',
      website: 'https://livrariae.com.br',
      socialMedia: {
        instagram: '@livrariae'
      }
    },
    tokenizable: false,
    reputation: {
      rating: 4.6,
      reviewCount: 89,
      totalSales: 340,
      completionRate: 97.2
    },
    verification: {
      verified: false,
      documents: ['cnpj']
    },
    settings: {
      autoAcceptOrders: true,
      minOrderValue: 30,
      maxOrderValue: 2000,
      acceptedCurrencies: ['BRL'] as const,
      deliveryMethods: ['standard', 'pickup']
    },
    stats: {
      totalListings: 28,
      activeListings: 25,
      soldListings: 3,
      totalViews: 8900,
      totalRevenue: { BZR: 0, BRL: 45000 },
      avgResponseTime: 20
    },
    status: 'active' as const,
    createdAt: '2023-09-15T00:00:00.000Z',
    updatedAt: '2024-08-14T11:30:00.000Z'
  }
]

// ✅ FUNÇÃO para mesclar com dados existentes
export const extendMockData = (existingEnterprises: Enterprise[], existingListings: Listing[]) => {
  // Combinar enterprises sem duplicar
  const combinedEnterprises = [...existingEnterprises]
  
  mockEnterprises.forEach(newEnterprise => {
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
  
  mockListings.forEach(newListing => {
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