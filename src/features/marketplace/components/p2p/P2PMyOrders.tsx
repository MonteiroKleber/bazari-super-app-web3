// src/features/marketplace/components/p2p/P2PMyOrders.tsx

import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  Plus, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  MessageCircle,
  Eye,
  Edit,
  Pause,
  Play,
  Archive
} from 'lucide-react'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { Badge } from '@shared/ui/Badge'
import { Tabs } from '@shared/ui/Tabs'
import { EmptyState } from '@shared/ui/EmptyState'
import { LoadingSpinner } from '@shared/ui/LoadingSpinner'
import { useI18n } from '@app/providers/I18nProvider'
import { useP2P } from '../../hooks/useP2P'
import { useAuthStore } from '@features/auth/store/authStore'
import { EscrowTimeline } from './EscrowTimeline'
import { P2POrder, P2PTrade } from '../../types/p2p.types'

export const P2PMyOrders: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useI18n()
  const { user } = useAuthStore()
  
  const {
    myTrades,
    loading,
    userMetrics,
    userLimits,
    formatCurrency,
    releaseEscrow,
    cancelTrade
  } = useP2P(user?.id)

  const [activeTab, setActiveTab] = React.useState('orders')
  const [selectedTrade, setSelectedTrade] = React.useState<P2PTrade | null>(null)

  // Mock data for orders (would come from store)
  const mockMyOrders: P2POrder[] = [
    {
      id: 'order_1',
      ownerId: user?.id || 'user_1',
      ownerName: user?.name || 'Usuário',
      ownerRating: user?.reputation.rating || 4.5,
      orderType: 'sell',
      asset: 'BZR',
      unitPriceBRL: 0.85,
      minAmount: 1000,
      maxAmount: 50000,
      paymentMethods: ['PIX', 'TED'],
      escrowEnabled: true,
      escrowTimeLimitMinutes: 60,
      status: 'active',
      createdAt: '2024-08-15T10:00:00.000Z',
      updatedAt: '2024-08-15T10:00:00.000Z',
      description: 'Vendo BZR com pagamento rápido via PIX',
      location: {
        city: 'São Paulo',
        state: 'SP',
        country: 'Brasil'
      }
    },
    {
      id: 'order_2',
      ownerId: user?.id || 'user_1',
      ownerName: user?.name || 'Usuário',
      ownerRating: user?.reputation.rating || 4.5,
      orderType: 'buy',
      asset: 'BZR',
      unitPriceBRL: 0.82,
      minAmount: 500,
      maxAmount: 20000,
      paymentMethods: ['PIX'],
      escrowEnabled: true,
      escrowTimeLimitMinutes: 45,
      status: 'locked',
      createdAt: '2024-08-14T15:00:00.000Z',
      updatedAt: '2024-08-14T15:00:00.000Z',
      description: 'Compro BZR para investimento'
    }
  ]

  const handleTradeAction = async (action: string, tradeId: string) => {
    try {
      switch (action) {
        case 'release_escrow':
          await releaseEscrow(tradeId)
          break
        case 'cancel':
          await cancelTrade(tradeId, 'Cancelado pelo usuário')
          break
        default:
          console.log(`Action ${action} for trade ${tradeId}`)
      }
    } catch (error) {
      console.error('Error performing trade action:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="text-success" size={16} />
      case 'locked':
        return <Clock className="text-warning" size={16} />
      case 'completed':
        return <CheckCircle className="text-success" size={16} />
      case 'cancelled':
        return <XCircle className="text-danger" size={16} />
      default:
        return <AlertTriangle className="text-warning" size={16} />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo'
      case 'locked':
        return 'Em Negociação'
      case 'completed':
        return 'Concluído'
      case 'cancelled':
        return 'Cancelado'
      default:
        return status
    }
  }

  const timeAgo = (date: string) => {
    const now = new Date()
    const created = new Date(date)
    const diffMs = now.getTime() - created.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffHours < 24) return `${diffHours}h atrás`
    return `${diffDays}d atrás`
  }

  const tabsData = [
    {
      id: 'orders',
      label: 'Meus Anúncios',
      content: (
        <div className="space-y-6">
          {mockMyOrders.length === 0 ? (
            <EmptyState
              title="Nenhum anúncio P2P criado"
              description="Crie seu primeiro anúncio para começar a negociar BZR."
              action={
                <Button onClick={() => navigate('/marketplace/p2p/create')}>
                  <Plus size={16} className="mr-2" />
                  Criar Primeiro Anúncio
                </Button>
              }
            />
          ) : (
            <div className="space-y-4">
              {mockMyOrders.map((order) => (
                <Card key={order.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      {/* Order Type Icon */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        order.orderType === 'buy' 
                          ? 'bg-success-100 text-success-700' 
                          : 'bg-bazari-red-100 text-bazari-red-700'
                      }`}>
                        {order.orderType === 'buy' ? (
                          <TrendingUp size={20} />
                        ) : (
                          <TrendingDown size={20} />
                        )}
                      </div>

                      {/* Order Details */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-matte-black-900">
                            {order.orderType === 'buy' ? 'Comprando BZR' : 'Vendendo BZR'}
                          </h3>
                          <Badge variant={order.status === 'active' ? 'success' : 'warning'}>
                            {getStatusLabel(order.status)}
                          </Badge>
                          {order.escrowEnabled && (
                            <Badge variant="outline" size="sm">Escrow</Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                          <div>
                            <p className="text-sm text-matte-black-600">Preço por BZR</p>
                            <p className="text-lg font-bold text-bazari-red">
                              {formatCurrency(order.unitPriceBRL)}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-matte-black-600">Quantidade</p>
                            <p className="font-medium text-matte-black-900">
                              {order.minAmount.toLocaleString()} - {order.maxAmount.toLocaleString()} BZR
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-matte-black-600">Métodos de Pagamento</p>
                            <div className="flex flex-wrap gap-1">
                              {order.paymentMethods.slice(0, 2).map(method => (
                                <Badge key={method} variant="outline" size="sm">
                                  {method}
                                </Badge>
                              ))}
                              {order.paymentMethods.length > 2 && (
                                <Badge variant="outline" size="sm">
                                  +{order.paymentMethods.length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {order.description && (
                          <p className="text-sm text-matte-black-700 mb-3">
                            {order.description}
                          </p>
                        )}

                        <div className="flex items-center text-sm text-matte-black-600">
                          <span>Criado {timeAgo(order.createdAt)}</span>
                          {order.location && (
                            <>
                              <span className="mx-2">•</span>
                              <span>{order.location.city}, {order.location.state}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/marketplace/p2p/${order.id}`)}
                      >
                        <Eye size={16} />
                      </Button>
                      
                      <Button variant="ghost" size="sm">
                        <Edit size={16} />
                      </Button>
                      
                      {order.status === 'active' ? (
                        <Button variant="ghost" size="sm">
                          <Pause size={16} />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm">
                          <Play size={16} />
                        </Button>
                      )}
                      
                      <Button variant="ghost" size="sm">
                        <Archive size={16} />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )
    },
    {
      id: 'trades',
      label: 'Negociações',
      content: (
        <div className="space-y-6">
          {myTrades.length === 0 ? (
            <EmptyState
              title="Nenhuma negociação encontrada"
              description="Suas negociações P2P aparecerão aqui."
              action={
                <Button onClick={() => navigate('/marketplace/p2p')}>
                  Buscar Anúncios P2P
                </Button>
              }
            />
          ) : (
            <div className="space-y-4">
              {myTrades.map((trade) => (
                <Card key={trade.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-matte-black-900">
                          Negociação #{trade.id.slice(-6)}
                        </h3>
                        <Badge variant={
                          trade.status === 'completed' ? 'success' :
                          trade.status === 'disputed' || trade.status === 'cancelled' ? 'danger' :
                          'warning'
                        }>
                          {trade.status === 'initiated' && 'Iniciada'}
                          {trade.status === 'payment_pending' && 'Aguardando Pagamento'}
                          {trade.status === 'payment_confirmed' && 'Pagamento Confirmado'}
                          {trade.status === 'completed' && 'Concluída'}
                          {trade.status === 'cancelled' && 'Cancelada'}
                          {trade.status === 'disputed' && 'Em Disputa'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-matte-black-600">Contraparte:</p>
                          <p className="font-medium text-matte-black-900">
                            {user?.id === trade.buyerId ? trade.sellerName : trade.buyerName}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-matte-black-600">Quantidade:</p>
                          <p className="font-medium text-matte-black-900">
                            {trade.amount.toLocaleString()} BZR
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-matte-black-600">Valor Total:</p>
                          <p className="font-bold text-bazari-red">
                            {formatCurrency(trade.totalBRL)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/chat/${
                          user?.id === trade.buyerId ? trade.sellerId : trade.buyerId
                        }?context=p2p&trade=${trade.id}`)}
                      >
                        <MessageCircle size={16} className="mr-2" />
                        Chat
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedTrade(trade)}
                      >
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>

                  {/* Quick Timeline */}
                  <div className="bg-sand-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-matte-black-600">Status:</span>
                      <span className="font-medium text-matte-black-900">
                        {trade.status === 'payment_pending' && 'Aguardando confirmação de pagamento'}
                        {trade.status === 'payment_confirmed' && 'Aguardando liberação do escrow'}
                        {trade.status === 'completed' && 'Negociação concluída com sucesso'}
                        {trade.status === 'cancelled' && 'Negociação cancelada'}
                        {trade.status === 'disputed' && 'Em processo de disputa'}
                      </span>
                    </div>
                    
                    {trade.escrowStatus !== 'none' && (
                      <div className="flex items-center justify-between text-sm mt-2">
                        <span className="text-matte-black-600">Escrow:</span>
                        <span className="font-medium text-matte-black-900">
                          {trade.escrowStatus === 'locked' && 'Tokens bloqueados'}
                          {trade.escrowStatus === 'released' && 'Tokens liberados'}
                          {trade.escrowStatus === 'dispute' && 'Em disputa'}
                        </span>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )
    },
    {
      id: 'metrics',
      label: 'Estatísticas',
      content: (
        <div className="space-y-6">
          {/* User Metrics */}
          {userMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-matte-black-900 mb-1">
                  {userMetrics.userTradesCount}
                </div>
                <p className="text-sm text-matte-black-600">Negociações</p>
              </Card>
              
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-success mb-1">
                  {userMetrics.completionRate.toFixed(1)}%
                </div>
                <p className="text-sm text-matte-black-600">Taxa de Conclusão</p>
              </Card>
              
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-bazari-gold-600 mb-1">
                  {userMetrics.avgRating.toFixed(1)}
                </div>
                <p className="text-sm text-matte-black-600">Avaliação Média</p>
              </Card>
              
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {userMetrics.responseTime}min
                </div>
                <p className="text-sm text-matte-black-600">Tempo de Resposta</p>
              </Card>
            </div>
          )}

          {/* Daily Limits */}
          {userLimits && (
            <Card className="p-6">
              <h3 className="font-semibold text-matte-black-900 mb-4">
                Limites Diários
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Anúncios Criados</span>
                    <span>{userLimits.currentUsage.ordersToday} / {userLimits.dailyOrdersLimit}</span>
                  </div>
                  <div className="w-full bg-sand-200 rounded-full h-2">
                    <div 
                      className="bg-bazari-red h-2 rounded-full" 
                      style={{ 
                        width: `${(userLimits.currentUsage.ordersToday / userLimits.dailyOrdersLimit) * 100}%` 
                      }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Volume Negociado (BRL)</span>
                    <span>
                      {formatCurrency(userLimits.currentUsage.volumeToday.BRL)} / {formatCurrency(userLimits.dailyVolumeLimit.BRL)}
                    </span>
                  </div>
                  <div className="w-full bg-sand-200 rounded-full h-2">
                    <div 
                      className="bg-success h-2 rounded-full" 
                      style={{ 
                        width: `${(userLimits.currentUsage.volumeToday.BRL / userLimits.dailyVolumeLimit.BRL) * 100}%` 
                      }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Negociações Realizadas</span>
                    <span>{userLimits.currentUsage.tradesToday} / {userLimits.maxTradesPerDay}</span>
                  </div>
                  <div className="w-full bg-sand-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ 
                        width: `${(userLimits.currentUsage.tradesToday / userLimits.maxTradesPerDay) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Volume Chart Placeholder */}
          <Card className="p-6">
            <h3 className="font-semibold text-matte-black-900 mb-4">
              Volume dos Últimos 7 Dias
            </h3>
            <div className="h-48 bg-sand-100 rounded-lg flex items-center justify-center">
              <p className="text-matte-black-500">Gráfico de volume seria exibido aqui</p>
            </div>
          </Card>
        </div>
      )
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-matte-black-900 mb-2">
              Meus P2P
            </h1>
            <p className="text-matte-black-600">
              Gerencie seus anúncios e negociações P2P
            </p>
          </div>
          
          <Button onClick={() => navigate('/marketplace/p2p/create')}>
            <Plus size={16} className="mr-2" />
            Novo Anúncio P2P
          </Button>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs
        tabs={tabsData}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Trade Detail Modal */}
      {selectedTrade && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-matte-black-900">
                  Detalhes da Negociação
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTrade(null)}
                >
                  <XCircle size={16} />
                </Button>
              </div>
              
              <EscrowTimeline
                trade={selectedTrade}
                currentUserId={user?.id}
                onAction={handleTradeAction}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}