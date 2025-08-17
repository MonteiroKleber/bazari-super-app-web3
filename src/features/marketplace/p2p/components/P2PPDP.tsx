import React from 'react'
import { motion } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { MessageCircle, Shield, Clock, Star, AlertTriangle } from 'lucide-react'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { Badge } from '@shared/ui/Badge'
import { Avatar } from '@shared/ui/Avatar'
import { Input } from '@shared/ui/Input'
import { Modal } from '@shared/ui/Modal'
import { useI18n } from '@app/providers/I18nProvider'
import { useP2PStore } from '../../../p2p/store/p2pStore'
import { useAuthStore } from '@features/auth/store/authStore'
import { toast } from '@features/notifications/components/NotificationToastHost'

export const P2PPDP: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useI18n()
  const { orders, initiateTrade } = useP2PStore()
  const { user } = useAuthStore()
  
  const [showTradeModal, setShowTradeModal] = React.useState(false)
  const [tradeAmount, setTradeAmount] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  
  const order = orders.find(o => o.id === id)

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p>Anúncio P2P não encontrado</p>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const tradeAmountValue = parseFloat(tradeAmount) || 0
  const totalValue = tradeAmountValue * order.unitPriceBRL

  const handleInitiateTrade = async () => {
    if (!tradeAmount || tradeAmountValue < order.minAmount || tradeAmountValue > order.maxAmount) {
      toast.error('Valor inválido para esta negociação')
      return
    }

    setIsLoading(true)
    
    try {
      const tradeId = await initiateTrade(order.id, tradeAmountValue)
      toast.success('Negociação iniciada!')
      navigate(`/chat/${order.ownerId}?context=p2p&ad=${order.id}&trade=${tradeId}`)
    } catch (error) {
      toast.error('Erro ao iniciar negociação')
    } finally {
      setIsLoading(false)
      setShowTradeModal(false)
    }
  }

  const handleContactSeller = () => {
    navigate(`/profile/${order.ownerId}?from=p2p&ad=${order.id}`)
  }

  const canTrade = user?.id !== order.ownerId && order.status === 'active'

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center space-x-4 mb-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
            order.orderType === 'buy' ? 'bg-success-100' : 'bg-bazari-red-100'
          }`}>
            {order.orderType === 'buy' ? (
              <span className="text-success font-bold text-xl">C</span>
            ) : (
              <span className="text-bazari-red font-bold text-xl">V</span>
            )}
          </div>
          
          <div>
            <h1 className="text-3xl font-bold text-matte-black-900">
              {order.orderType === 'buy' ? 'Comprando' : 'Vendendo'} BZR
            </h1>
            <p className="text-matte-black-600">
              Anúncio P2P de {order.ownerName}
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Details */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-matte-black-900 mb-6">
              Detalhes da Oferta
            </h2>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-matte-black-600 mb-2">
                  Preço Unitário
                </h3>
                <p className="text-2xl font-bold text-bazari-red">
                  {formatCurrency(order.unitPriceBRL)}
                </p>
                <p className="text-sm text-matte-black-500">por BZR</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-matte-black-600 mb-2">
                  Limites de Negociação
                </h3>
                <p className="text-lg font-semibold text-matte-black-900">
                  {order.minAmount} - {order.maxAmount} BZR
                </p>
                <p className="text-sm text-matte-black-500">
                  {formatCurrency(order.minAmount * order.unitPriceBRL)} - {formatCurrency(order.maxAmount * order.unitPriceBRL)}
                </p>
              </div>
            </div>
          </Card>

          {/* Payment Methods */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-matte-black-900 mb-4">
              Métodos de Pagamento Aceitos
            </h2>
            
            <div className="flex flex-wrap gap-3">
              {order.paymentMethods.map((method) => (
                <Badge key={method} variant="primary" size="md">
                  {method}
                </Badge>
              ))}
            </div>
          </Card>

          {/* Security Features */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-matte-black-900 mb-4">
              Recursos de Segurança
            </h2>
            
            <div className="space-y-4">
              {order.escrowEnabled ? (
                <div className="flex items-start space-x-3 p-4 bg-success-50 rounded-xl">
                  <Shield className="text-success flex-shrink-0 mt-1" size={20} />
                  <div>
                    <h3 className="font-medium text-success-800 mb-1">
                      Escrow Habilitado
                    </h3>
                    <p className="text-sm text-success-700">
                      Fundos ficam protegidos até confirmação mútua da transação.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start space-x-3 p-4 bg-warning-50 rounded-xl">
                  <AlertTriangle className="text-warning flex-shrink-0 mt-1" size={20} />
                  <div>
                    <h3 className="font-medium text-warning-800 mb-1">
                      Sem Escrow
                    </h3>
                    <p className="text-sm text-warning-700">
                      Transação sem proteção automática. Negocie com cuidado.
                    </p>
                  </div>
                </div>
              )}
              
              {order.escrowEnabled && (
                <div className="flex items-center space-x-3 p-4 bg-sand-50 rounded-xl">
                  <Clock className="text-matte-black-600" size={20} />
                  <div>
                    <h3 className="font-medium text-matte-black-900 mb-1">
                      Tempo Limite do Escrow
                    </h3>
                    <p className="text-sm text-matte-black-600">
                      {order.escrowTimeLimitMinutes} minutos para completar o pagamento
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Trader Info */}
          <Card className="p-6">
            <h3 className="font-semibold text-matte-black-900 mb-4">
              {order.orderType === 'buy' ? 'Comprador' : 'Vendedor'}
            </h3>
            
            <div className="flex items-center space-x-3 mb-4">
              <Avatar size="lg" fallback={order.ownerName} />
              <div>
                <p className="font-medium text-matte-black-900">
                  {order.ownerName}
                </p>
                <div className="flex items-center">
                  <Star size={14} className="text-bazari-gold-600 mr-1" />
                  <span className="text-sm text-matte-black-600">
                    {order.ownerRating.toFixed(1)} (42 avaliações)
                  </span>
                </div>
                <p className="text-xs text-matte-black-500">
                  Membro desde 2023
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleContactSeller}
              >
                Ver Perfil Completo
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => navigate(`/chat/${order.ownerId}`)}
              >
                <MessageCircle size={16} className="mr-2" />
                Enviar Mensagem
              </Button>
            </div>
          </Card>

          {/* Trade Action */}
          {canTrade && (
            <Card className="p-6">
              <h3 className="font-semibold text-matte-black-900 mb-4">
                Iniciar Negociação
              </h3>
              
              <Button
                onClick={() => setShowTradeModal(true)}
                className="w-full"
                size="lg"
              >
                {order.orderType === 'buy' ? 'Vender BZR' : 'Comprar BZR'}
              </Button>
              
              <p className="text-xs text-matte-black-500 mt-3 text-center">
                Inicie uma negociação segura com {order.ownerName}
              </p>
            </Card>
          )}

          {/* Warning for own order */}
          {user?.id === order.ownerId && (
            <Card className="p-6 bg-bazari-gold-50 border-bazari-gold-200">
              <h3 className="font-semibold text-bazari-gold-800 mb-2">
                Seu Anúncio
              </h3>
              <p className="text-sm text-bazari-gold-700">
                Este é o seu anúncio P2P. Você não pode negociar consigo mesmo.
              </p>
            </Card>
          )}

          {/* Stats */}
          <Card className="p-6">
            <h3 className="font-semibold text-matte-black-900 mb-4">
              Estatísticas
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-matte-black-600">Criado em:</span>
                <span>{new Date(order.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-matte-black-600">Status:</span>
                <Badge 
                  variant={order.status === 'active' ? 'success' : 'neutral'}
                  size="sm"
                >
                  {order.status === 'active' ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              
              <div className="flex justify-between">
                <span className="text-matte-black-600">Negociações:</span>
                <span>12 completadas</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Trade Modal */}
      <Modal
        isOpen={showTradeModal}
        onClose={() => setShowTradeModal(false)}
        title="Iniciar Negociação"
        size="md"
      >
        <div className="space-y-6">
          <div>
            <p className="text-matte-black-600 mb-4">
              {order.orderType === 'buy' 
                ? `${order.ownerName} quer comprar BZR por ${formatCurrency(order.unitPriceBRL)} cada.`
                : `${order.ownerName} está vendendo BZR por ${formatCurrency(order.unitPriceBRL)} cada.`
              }
            </p>
          </div>

          <Input
            label="Quantidade (BZR)"
            type="number"
            placeholder={`Entre ${order.minAmount} e ${order.maxAmount}`}
            value={tradeAmount}
            onChange={(e) => setTradeAmount(e.target.value)}
            helperText={`Mín: ${order.minAmount} BZR • Máx: ${order.maxAmount} BZR`}
          />

          {tradeAmountValue > 0 && (
            <div className="p-4 bg-sand-50 rounded-xl">
              <div className="flex justify-between items-center">
                <span className="text-matte-black-600">Total:</span>
                <span className="text-xl font-bold text-matte-black-900">
                  {formatCurrency(totalValue)}
                </span>
              </div>
              <p className="text-sm text-matte-black-500 mt-1">
                {tradeAmountValue} BZR × {formatCurrency(order.unitPriceBRL)}
              </p>
            </div>
          )}

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowTradeModal(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            
            <Button
              onClick={handleInitiateTrade}
              disabled={!tradeAmount || tradeAmountValue < order.minAmount || tradeAmountValue > order.maxAmount || isLoading}
              loading={isLoading}
              className="flex-1"
            >
              Iniciar Negociação
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}