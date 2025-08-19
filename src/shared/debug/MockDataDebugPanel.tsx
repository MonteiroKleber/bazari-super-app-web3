// src/shared/debug/MockDataDebugPanel.tsx
// ✅ VERSÃO STANDALONE - Não interfere com o AppShell

import React from 'react'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { Badge } from '@shared/ui/Badge'
import { useMarketplaceStore } from '@features/marketplace/store/marketplaceStore'
import { useEnterpriseStore } from '@features/marketplace/store/enterpriseStore'
import { Database, RefreshCw, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'

interface MockDataDebugPanelProps {
  className?: string
  enterpriseId?: string // Para focar em um enterprise específico
}

export const MockDataDebugPanel: React.FC<MockDataDebugPanelProps> = ({ 
  className,
  enterpriseId 
}) => {
  const [isVisible, setIsVisible] = React.useState(false)
  
  const {
    listings,
    isInitialized: marketplaceInit,
    getListingsByEnterprise
  } = useMarketplaceStore()
  
  const {
    enterprises,
    isInitialized: enterprisesInit
  } = useEnterpriseStore()

  // Se não estiver em desenvolvimento, não renderizar
  const isDev = import.meta.env.DEV || process.env.NODE_ENV === 'development'
  if (!isDev) return null

  const getEnterpriseListingsCount = (enterpriseId: string) => {
    return getListingsByEnterprise(enterpriseId).length
  }

  const getStatusColor = (isInit: boolean, count: number) => {
    if (!isInit) return 'bg-red-100 text-red-700'
    if (count === 0) return 'bg-yellow-100 text-yellow-700'
    return 'bg-green-100 text-green-700'
  }

  const getStatusIcon = (isInit: boolean, count: number) => {
    if (!isInit) return <AlertCircle className="h-4 w-4" />
    if (count === 0) return <AlertCircle className="h-4 w-4" />
    return <CheckCircle className="h-4 w-4" />
  }

  if (!isVisible) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsVisible(true)}
          className="bg-white shadow-lg border-2 border-blue-200 hover:border-blue-300"
        >
          <Database className="h-4 w-4 mr-2" />
          Debug
        </Button>
      </div>
    )
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 w-80 ${className}`}>
      <Card className="p-4 bg-white shadow-lg border-2 border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-sm">Mock Data Debug</h3>
          </div>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsVisible(false)}
            className="p-1"
          >
            <EyeOff className="h-3 w-3" />
          </Button>
        </div>

        <div className="space-y-3">
          {/* Status Geral */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Marketplace</span>
            <Badge className={`text-xs ${getStatusColor(marketplaceInit, listings.length)}`}>
              {getStatusIcon(marketplaceInit, listings.length)}
              {listings.length} listings
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Enterprises</span>
            <Badge className={`text-xs ${getStatusColor(enterprisesInit, enterprises.length)}`}>
              {getStatusIcon(enterprisesInit, enterprises.length)}
              {enterprises.length} enterprises
            </Badge>
          </div>

          {/* Enterprise Específico (se fornecido) */}
          {enterpriseId && (
            <div className="border-t pt-3">
              <span className="text-xs font-medium text-gray-600 mb-2 block">
                Enterprise Atual:
              </span>
              {(() => {
                const enterprise = enterprises.find(e => e.id === enterpriseId)
                const listingsCount = getEnterpriseListingsCount(enterpriseId)
                return (
                  <div className="flex items-center justify-between text-xs">
                    <span className="truncate flex-1 mr-2" title={enterprise?.name}>
                      {enterprise?.name || 'Não encontrado'}
                    </span>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${listingsCount > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                    >
                      {listingsCount} produtos
                    </Badge>
                  </div>
                )
              })()}
            </div>
          )}

          {/* Vinculações Gerais */}
          {enterprises.length > 0 && !enterpriseId && (
            <div className="border-t pt-3">
              <span className="text-xs font-medium text-gray-600 mb-2 block">Vinculações:</span>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {enterprises.slice(0, 5).map(enterprise => {
                  const listingsCount = getEnterpriseListingsCount(enterprise.id)
                  return (
                    <div key={enterprise.id} className="flex items-center justify-between text-xs">
                      <span className="truncate flex-1 mr-2" title={enterprise.name}>
                        {enterprise.name}
                      </span>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${listingsCount > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                      >
                        {listingsCount}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Status Summary */}
          <div className="text-xs text-gray-500 border-t pt-2">
            {marketplaceInit && enterprisesInit && listings.length > 0 && enterprises.length > 0 ? (
              <span className="text-green-600">✅ Dados carregados</span>
            ) : (
              <span className="text-red-600">❌ Dados não carregados</span>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}