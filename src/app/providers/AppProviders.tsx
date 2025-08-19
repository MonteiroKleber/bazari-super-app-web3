// src/app/providers/AppProviders.tsx
// ✅ VERSÃO MÍNIMA: Provider principal com inicialização automática dos dados mock

import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { I18nProvider } from './I18nProvider'
import { NotificationProvider } from './NotificationProvider'
import { useMarketplaceStore } from '@features/marketplace/store/marketplaceStore'
import { useEnterpriseStore } from '@features/marketplace/store/enterpriseStore'

interface AppProvidersProps {
  children: React.ReactNode
}

// ✅ Componente para inicialização automática dos dados mock
const MockDataInitializer: React.FC = () => {
  const marketplaceStore = useMarketplaceStore()
  const enterpriseStore = useEnterpriseStore()
  
  React.useEffect(() => {
    const initializeData = async () => {
      console.log('🚀 AppProviders: Verificando inicialização dos dados mock...')
      
      // Inicializar marketplace se necessário
      if (!marketplaceStore.isInitialized || marketplaceStore.listings.length === 0) {
        console.log('📦 Inicializando marketplace data...')
        if (marketplaceStore.initializeMockData) {
          marketplaceStore.initializeMockData()
        }
      }
      
      // Inicializar enterprises se necessário
      if (!enterpriseStore.isInitialized || enterpriseStore.enterprises.length === 0) {
        console.log('🏢 Inicializando enterprises data...')
        if (enterpriseStore.initializeMockData) {
          enterpriseStore.initializeMockData()
        }
      }
      
      // Verificar se dados foram carregados corretamente
      setTimeout(() => {
        const marketplaceState = useMarketplaceStore.getState()
        const enterpriseState = useEnterpriseStore.getState()
        
        console.log('✅ Status da inicialização:')
        console.log(`   - Marketplace: ${marketplaceState.listings.length} listings`)
        console.log(`   - Enterprises: ${enterpriseState.enterprises.length} enterprises`)
        
        // Debug das vinculações
        if (marketplaceState.listings.length > 0 && enterpriseState.enterprises.length > 0) {
          console.log('🔗 Verificando vinculações:')
          enterpriseState.enterprises.forEach(enterprise => {
            const enterpriseListings = marketplaceState.listings.filter(l => l.enterpriseId === enterprise.id)
            if (enterpriseListings.length > 0) {
              console.log(`   - ${enterprise.name}: ${enterpriseListings.length} produtos`)
            }
          })
        }
      }, 100)
    }
    
    initializeData()
  }, [marketplaceStore, enterpriseStore])
  
  return null
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <BrowserRouter>
      <I18nProvider>
        <NotificationProvider>
          {/* ✅ Inicialização automática dos dados mock */}
          <MockDataInitializer />
          
          {children}
        </NotificationProvider>
      </I18nProvider>
    </BrowserRouter>
  )
}