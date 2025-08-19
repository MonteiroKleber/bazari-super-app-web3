// src/app/data/initMockData.ts
// ✅ Inicializador central para garantir que todos os dados mock sejam carregados

import { useMarketplaceStore } from '@features/marketplace/store/marketplaceStore'
import { useEnterpriseStore } from '@features/marketplace/store/enterpriseStore'
import { mockListings } from './mockMarketplaceData'
import { mockListingsExtended, mockEnterprisesExtended } from './mockEnterpriseTokenizationData'

/**
 * Função para inicializar todos os dados mock do aplicativo
 */
export const initializeMockData = () => {
  console.log('🚀 Inicializando dados mock...')
  
  // Verificar se já foi inicializado
  const marketplaceStore = useMarketplaceStore.getState()
  const enterpriseStore = useEnterpriseStore.getState()
  
  if (marketplaceStore.isInitialized && marketplaceStore.listings.length > 0) {
    console.log('✅ Dados marketplace já inicializados')
    return
  }
  
  // Combinar todos os listings
  const allListings = [
    ...mockListings,
    ...mockListingsExtended
  ]
  
  // Remover duplicados
  const uniqueListings = allListings.reduce((acc, listing) => {
    const existingIndex = acc.findIndex(l => l.id === listing.id)
    if (existingIndex >= 0) {
      acc[existingIndex] = listing // Usar a versão mais recente
    } else {
      acc.push(listing)
    }
    return acc
  }, [] as typeof allListings)
  
  // Combinar todos os enterprises
  const allEnterprises = [
    ...enterpriseStore.enterprises,
    ...mockEnterprisesExtended
  ]
  
  // Remover duplicados
  const uniqueEnterprises = allEnterprises.reduce((acc, enterprise) => {
    const existingIndex = acc.findIndex(e => e.id === enterprise.id)
    if (existingIndex >= 0) {
      acc[existingIndex] = enterprise // Usar a versão mais recente
    } else {
      acc.push(enterprise)
    }
    return acc
  }, [] as typeof allEnterprises)
  
  // Inicializar stores
  marketplaceStore.setListings(uniqueListings)
  useMarketplaceStore.setState({ isInitialized: true })
  
  enterpriseStore.setEnterprises(uniqueEnterprises)
  
  console.log(`✅ Dados inicializados:`)
  console.log(`   - ${uniqueListings.length} listings`)
  console.log(`   - ${uniqueEnterprises.length} enterprises`)
  
  // Debug: Verificar vinculações
  console.log('🔗 Verificando vinculações enterprise -> listings:')
  uniqueEnterprises.forEach(enterprise => {
    const enterpriseListings = uniqueListings.filter(l => l.enterpriseId === enterprise.id)
    if (enterpriseListings.length > 0) {
      console.log(`   - ${enterprise.name} (${enterprise.id}): ${enterpriseListings.length} listings`)
      enterpriseListings.forEach(listing => {
        console.log(`     * ${listing.title} (${listing.id})`)
      })
    }
  })
}

/**
 * Hook React para inicializar dados mock
 */
export const useInitializeMockData = () => {
  const marketplaceStore = useMarketplaceStore()
  const enterpriseStore = useEnterpriseStore()
  
  React.useEffect(() => {
    if (!marketplaceStore.isInitialized || marketplaceStore.listings.length === 0) {
      initializeMockData()
    }
  }, [marketplaceStore.isInitialized, marketplaceStore.listings.length])
  
  return {
    isInitialized: marketplaceStore.isInitialized,
    listingsCount: marketplaceStore.listings.length,
    enterprisesCount: enterpriseStore.enterprises.length
  }
}

// ✅ Função para forçar reinicialização (útil para desenvolvimento)
export const reinitializeMockData = () => {
  console.log('🔄 Forçando reinicialização dos dados mock...')
  
  // Limpar stores
  useMarketplaceStore.setState({ 
    listings: [], 
    isInitialized: false 
  })
  
  useEnterpriseStore.setState({ 
    enterprises: [],
    currentEnterprise: null
  })
  
  // Reinicializar
  initializeMockData()
}

// ✅ Utilitário para verificar se dados estão carregados
export const checkMockDataStatus = () => {
  const marketplaceStore = useMarketplaceStore.getState()
  const enterpriseStore = useEnterpriseStore.getState()
  
  return {
    marketplace: {
      isInitialized: marketplaceStore.isInitialized,
      listingsCount: marketplaceStore.listings.length,
      enterprises: marketplaceStore.listings.reduce((acc, listing) => {
        if (listing.enterpriseId && !acc.includes(listing.enterpriseId)) {
          acc.push(listing.enterpriseId)
        }
        return acc
      }, [] as string[])
    },
    enterprises: {
      enterprisesCount: enterpriseStore.enterprises.length,
      tokenizedCount: enterpriseStore.enterprises.filter(e => e.tokenized).length
    }
  }
}