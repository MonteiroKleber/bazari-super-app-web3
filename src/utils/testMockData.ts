// src/utils/testMockData.ts
// ✅ Utilitários para testar e verificar se os dados mock estão funcionando corretamente

import { useMarketplaceStore } from '@features/marketplace/store/marketplaceStore'
import { useEnterpriseStore } from '@features/marketplace/store/enterpriseStore'

export interface TestResult {
  success: boolean
  message: string
  details?: any
}

export interface TestSuite {
  name: string
  tests: TestResult[]
  overall: boolean
}

/**
 * Executa uma suíte completa de testes nos dados mock
 */
export const runMockDataTests = (): TestSuite[] => {
  console.log('🧪 Executando testes dos dados mock...')
  
  const suites: TestSuite[] = [
    testMarketplaceStore(),
    testEnterpriseStore(), 
    testDataIntegrity(),
    testEnterpriseListingsIntegration()
  ]
  
  // Log dos resultados
  suites.forEach(suite => {
    console.log(`\n📋 ${suite.name}: ${suite.overall ? '✅ PASSOU' : '❌ FALHOU'}`)
    suite.tests.forEach(test => {
      console.log(`   ${test.success ? '✅' : '❌'} ${test.message}`)
      if (test.details) {
        console.log(`      Detalhes:`, test.details)
      }
    })
  })
  
  const overallSuccess = suites.every(suite => suite.overall)
  console.log(`\n🎯 Resultado Geral: ${overallSuccess ? '✅ TODOS OS TESTES PASSARAM' : '❌ ALGUNS TESTES FALHARAM'}`)
  
  return suites
}

/**
 * Testa o MarketplaceStore
 */
function testMarketplaceStore(): TestSuite {
  const store = useMarketplaceStore.getState()
  const tests: TestResult[] = []
  
  // Teste 1: Store inicializado
  tests.push({
    success: store.isInitialized,
    message: 'Store inicializado',
    details: { isInitialized: store.isInitialized }
  })
  
  // Teste 2: Listings carregados
  tests.push({
    success: store.listings.length > 0,
    message: `Listings carregados (${store.listings.length})`,
    details: { count: store.listings.length }
  })
  
  // Teste 3: Listings têm enterpriseId
  const listingsWithEnterprise = store.listings.filter(l => l.enterpriseId)
  tests.push({
    success: listingsWithEnterprise.length > 0,
    message: `Listings com enterpriseId (${listingsWithEnterprise.length}/${store.listings.length})`,
    details: { 
      withEnterprise: listingsWithEnterprise.length,
      total: store.listings.length,
      percentage: Math.round((listingsWithEnterprise.length / store.listings.length) * 100)
    }
  })
  
  // Teste 4: Método getListingsByEnterprise funciona
  const testEnterpriseId = 'enterprise_1'
  const enterpriseListings = store.getListingsByEnterprise(testEnterpriseId)
  tests.push({
    success: enterpriseListings.length > 0,
    message: `getListingsByEnterprise funciona para ${testEnterpriseId}`,
    details: { 
      enterpriseId: testEnterpriseId,
      listingsFound: enterpriseListings.length,
      listingIds: enterpriseListings.map(l => l.id)
    }
  })
  
  return {
    name: 'MarketplaceStore',
    tests,
    overall: tests.every(t => t.success)
  }
}

/**
 * Testa o EnterpriseStore
 */
function testEnterpriseStore(): TestSuite {
  const store = useEnterpriseStore.getState()
  const tests: TestResult[] = []
  
  // Teste 1: Store inicializado
  tests.push({
    success: store.isInitialized,
    message: 'Store inicializado',
    details: { isInitialized: store.isInitialized }
  })
  
  // Teste 2: Enterprises carregados
  tests.push({
    success: store.enterprises.length > 0,
    message: `Enterprises carregados (${store.enterprises.length})`,
    details: { count: store.enterprises.length }
  })
  
  // Teste 3: Enterprises têm IDs únicos
  const uniqueIds = new Set(store.enterprises.map(e => e.id))
  tests.push({
    success: uniqueIds.size === store.enterprises.length,
    message: 'Enterprises têm IDs únicos',
    details: { 
      enterprises: store.enterprises.length,
      uniqueIds: uniqueIds.size
    }
  })
  
  // Teste 4: Pelo menos um enterprise tokenizado
  const tokenizedEnterprises = store.enterprises.filter(e => e.tokenized)
  tests.push({
    success: tokenizedEnterprises.length > 0,
    message: `Enterprises tokenizados encontrados (${tokenizedEnterprises.length})`,
    details: { 
      tokenized: tokenizedEnterprises.map(e => ({ id: e.id, name: e.name, symbol: e.tokenSymbol }))
    }
  })
  
  return {
    name: 'EnterpriseStore',
    tests,
    overall: tests.every(t => t.success)
  }
}

/**
 * Testa a integridade dos dados
 */
function testDataIntegrity(): TestSuite {
  const marketplaceStore = useMarketplaceStore.getState()
  const enterpriseStore = useEnterpriseStore.getState()
  const tests: TestResult[] = []
  
  // Teste 1: Todas as vinculações enterpriseId existem
  const enterpriseIds = new Set(enterpriseStore.enterprises.map(e => e.id))
  const listingsWithValidEnterprise = marketplaceStore.listings.filter(l => 
    l.enterpriseId && enterpriseIds.has(l.enterpriseId)
  )
  
  tests.push({
    success: listingsWithValidEnterprise.length > 0,
    message: `Listings com enterpriseId válido (${listingsWithValidEnterprise.length})`,
    details: {
      validListings: listingsWithValidEnterprise.length,
      totalListings: marketplaceStore.listings.length
    }
  })
  
  // Teste 2: Enterprises específicos têm listings
  const testCases = [
    { id: 'enterprise_1', expectedName: 'Bazari Tech Solutions' },
    { id: 'enterprise_2', expectedName: 'EcoVerde Sustentável' },
    { id: 'enterprise_3', expectedName: 'Artesãos Unidos' }
  ]
  
  testCases.forEach(testCase => {
    const enterprise = enterpriseStore.enterprises.find(e => e.id === testCase.id)
    const listings = marketplaceStore.listings.filter(l => l.enterpriseId === testCase.id)
    
    tests.push({
      success: enterprise !== undefined && listings.length > 0,
      message: `${testCase.expectedName} existe e tem listings`,
      details: {
        enterpriseFound: !!enterprise,
        enterpriseName: enterprise?.name,
        listingsCount: listings.length,
        listingTitles: listings.map(l => l.title)
      }
    })
  })
  
  return {
    name: 'Integridade dos Dados',
    tests,
    overall: tests.every(t => t.success)
  }
}

/**
 * Testa a integração Enterprise <-> Listings
 */
function testEnterpriseListingsIntegration(): TestSuite {
  const marketplaceStore = useMarketplaceStore.getState()
  const enterpriseStore = useEnterpriseStore.getState()
  const tests: TestResult[] = []
  
  // Para cada enterprise, testar se getListingsByEnterprise retorna resultados corretos
  enterpriseStore.enterprises.forEach(enterprise => {
    const expectedListings = marketplaceStore.listings.filter(l => 
      l.enterpriseId === enterprise.id && l.status === 'active'
    )
    const actualListings = marketplaceStore.getListingsByEnterprise(enterprise.id)
    
    tests.push({
      success: actualListings.length === expectedListings.length,
      message: `${enterprise.name}: getListingsByEnterprise correto`,
      details: {
        enterpriseId: enterprise.id,
        expected: expectedListings.length,
        actual: actualListings.length,
        expectedIds: expectedListings.map(l => l.id),
        actualIds: actualListings.map(l => l.id)
      }
    })
  })
  
  return {
    name: 'Integração Enterprise-Listings',
    tests,
    overall: tests.every(t => t.success)
  }
}

/**
 * Função para executar testes específicos de uma página
 */
export const testEnterpriseDetailPage = (enterpriseId: string) => {
  console.log(`🔍 Testando página EnterpriseDetail para ${enterpriseId}...`)
  
  const marketplaceStore = useMarketplaceStore.getState()
  const enterpriseStore = useEnterpriseStore.getState()
  
  const enterprise = enterpriseStore.enterprises.find(e => e.id === enterpriseId)
  const listings = marketplaceStore.getListingsByEnterprise(enterpriseId)
  
  const results = {
    enterpriseFound: !!enterprise,
    enterpriseName: enterprise?.name,
    listingsCount: listings.length,
    listings: listings.map(l => ({
      id: l.id,
      title: l.title,
      price: l.price,
      currency: l.currency
    })),
    tokenized: enterprise?.tokenized || false,
    tokenData: enterprise?.tokenized ? {
      symbol: enterprise.tokenSymbol,
      price: enterprise.priceBZR,
      holders: enterprise.holdersCount
    } : null
  }
  
  console.log('📊 Resultados do teste:', results)
  
  return results
}

/**
 * Função para resetar e reinicializar dados (útil para debug)
 */
export const resetAndReinitializeData = () => {
  console.log('🔄 Resetando e reinicializando dados...')
  
  // Limpar localStorage
  localStorage.removeItem('marketplace-storage')
  localStorage.removeItem('enterprise-storage')
  
  // Resetar stores
  useMarketplaceStore.setState({
    listings: [],
    myListings: [],
    isInitialized: false,
    filters: {}
  })
  
  useEnterpriseStore.setState({
    enterprises: [],
    myEnterprises: [],
    currentEnterprise: null,
    isInitialized: false,
    filters: {}
  })
  
  // Reinicializar
  setTimeout(() => {
    useMarketplaceStore.getState().initializeMockData()
    useEnterpriseStore.getState().initializeMockData()
    
    setTimeout(() => {
      console.log('✅ Dados reinicializados')
      runMockDataTests()
    }, 100)
  }, 100)
}

// ✅ Exportar para uso em componentes de debug
export const mockDataTestUtils = {
  runMockDataTests,
  testEnterpriseDetailPage,
  resetAndReinitializeData
}

// ✅ Função para adicionar ao window (útil para debug no console)
if (typeof window !== 'undefined') {
  (window as any).mockDataTests = mockDataTestUtils
  console.log('🛠️ Utilitários de teste disponíveis em: window.mockDataTests')
}