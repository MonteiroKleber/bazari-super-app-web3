import React from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Plus, TrendingUp, ArrowUpDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@shared/ui/Card'
import { Input } from '@shared/ui/Input'
import { Button } from '@shared/ui/Button'
import { Badge } from '@shared/ui/Badge'
import { EmptyState } from '@shared/ui/EmptyState'
import { useI18n } from '@app/providers/I18nProvider'
import { useP2PStore } from '../../../p2p/store/p2pStore'

export const P2PHome: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useI18n()
  const { orders, isLoading } = useP2PStore()
  const [orderType, setOrderType] = React.useState<'all' | 'buy' | 'sell'>('all')
  const [searchQuery, setSearchQuery] = React.useState('')

  React.useEffect(() => {
    // Load orders on mount
  }, [])

  const filteredOrders = orders.filter(order => {
    const matchesType = orderType === 'all' || order.orderType === orderType
    const matchesSearch = !searchQuery || 
      order.ownerName.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesType && matchesSearch && order.status === 'active'
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-matte-black-900 mb-2">
              P2P Trading
            </h1>
            <p className="text-matte-black-600">
              Troque BZR por BRL diretamente com outros usuários
            </p>
          </div>
          
          <Button onClick={() => navigate('/marketplace/p2p/create')}>
            <Plus size={16} className="mr-2" />
            Criar Anúncio P2P
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-matte-black-600 mb-1">Volume 24h</p>
                <p className="text-2xl font-bold text-matte-black-900">
                  {formatCurrency(125000)}
                </p>
              </div>
              <TrendingUp className="text-success" size={32} />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-matte-black-600 mb-1">Preço Médio</p>
                <p className="text-2xl font-bold text-matte-black-900">
                  {formatCurrency(0.85)}
                </p>
                <p className="text-xs text-matte-black-500">por BZR</p>
              </div>
              <ArrowUpDown className="text-bazari-gold-600" size={32} />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-matte-black-600 mb-1">Anúncios Ativos</p>
                <p className="text-2xl font-bold text-matte-black-900">
                  {orders.filter(o => o.status === 'active').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-bazari-red-100 rounded-full flex items-center justify-center">
                <span className="text-bazari-red font-bold">P</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Buscar por usuário..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={20} />}
            />
          </div>
          
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'Todos' },
              { key: 'buy', label: 'Comprando BZR' },
              { key: 'sell', label: 'Vendendo BZR' }
            ].map((filter) => (
              <Button
                key={filter.key}
                variant={orderType === filter.key ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setOrderType(filter.key as any)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
          
          <Button variant="outline" size="sm">
            <Filter size={16} className="mr-2" />
            Mais Filtros
          </Button>
        </div>
      </motion.div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          title="Nenhum anúncio P2P encontrado"
          description="Seja o primeiro a criar um anúncio de troca P2P."
          action={
            <Button onClick={() => navigate('/marketplace/p2p/create')}>
              <Plus size={16} className="mr-2" />
              Criar Primeiro Anúncio
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card 
                className="p-6 cursor-pointer hover:shadow-soft-lg transition-shadow"
                onClick={() => navigate(`/marketplace/p2p/order/${order.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      order.orderType === 'buy' ? 'bg-success-100' : 'bg-bazari-red-100'
                    }`}>
                      {order.orderType === 'buy' ? (
                        <span className="text-success font-bold">C</span>
                      ) : (
                        <span className="text-bazari-red font-bold">V</span>
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-semibold text-matte-black-900">
                          {order.ownerName}
                        </p>
                        <div className="flex items-center">
                          <span className="text-sm text-bazari-gold-600">★</span>
                          <span className="text-sm text-matte-black-600 ml-1">
                            {order.ownerRating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-matte-black-600">
                        {order.orderType === 'buy' ? 'Quer comprar' : 'Está vendendo'} BZR
                      </p>
                      
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-xs text-matte-black-500">
                          Limite: {order.minAmount} - {order.maxAmount} BZR
                        </span>
                        
                        <div className="flex items-center space-x-1">
                          {order.paymentMethods.slice(0, 2).map((method, index) => (
                            <Badge key={index} variant="neutral" size="sm">
                              {method}
                            </Badge>
                          ))}
                          {order.paymentMethods.length > 2 && (
                            <span className="text-xs text-matte-black-500">
                              +{order.paymentMethods.length - 2}
                            </span>
                          )}
                        </div>
                        
                        {order.escrowEnabled && (
                          <Badge variant="success" size="sm">
                            Escrow
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-2xl font-bold text-matte-black-900">
                      {formatCurrency(order.unitPriceBRL)}
                    </p>
                    <p className="text-sm text-matte-black-600">por BZR</p>
                    
                    <Button
                      size="sm"
                      className="mt-3"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/marketplace/p2p/order/${order.id}`)
                      }}
                    >
                      {order.orderType === 'buy' ? 'Vender para' : 'Comprar de'} {order.ownerName.split(' ')[0]}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
