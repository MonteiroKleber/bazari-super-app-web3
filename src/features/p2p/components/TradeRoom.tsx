// src/features/p2p/components/TradeRoom.tsx

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  ArrowLeft,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Copy,
  Upload,
  MessageCircle,
  RefreshCw,
  CreditCard,
  AlertCircle
} from 'lucide-react'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { Input } from '@shared/ui/Input'
import { Badge } from '@shared/ui/Badge'
import { LoadingSpinner } from '@shared/ui/LoadingSpinner'
import { useI18n } from '@app/providers/I18nProvider'
import { useAuthStore } from '@features/auth/store/authStore'
import { useTradesStore } from '../store/tradesStore'
import { useOffersStore } from '../store/offersStore'
import { useEscrow } from '../hooks/useEscrow'
import { buildProfileRoute } from '../utils/profileRoute'
import { getPaymentMethodInfo } from '../services/payments'
import { toast } from '@features/notifications/components/NotificationToastHost'
import type { P2PTrade } from '../types/p2p.types'

export const TradeRoom: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useI18n()
  const { user } = useAuthStore()
  
  const { 
    trades, 
    getTradeById, 
    createTrade, 
    markPayment, 
    lockEscrow: lockEscrowInStore,
    releaseFunds,
    cancelTrade
  } = useTradesStore()
  
  const { lockEscrow, releaseEscrow, loading: escrowLoading } = useEscrow()
  
  const [loading, setLoading] = useState(true)
  const [paymentProof, setPaymentProof] = useState('')
  const [trade, setTrade] = useState<P2PTrade | undefined>(undefined)

  // Mock payment info (em produção viria do perfil do vendedor)
  const mockPaymentInfo = {
    PIX: {
      key: 'maria@email.com',
      keyType: 'E-mail',
      name: 'Maria Silva Santos',
      cpf: '123.456.789-00'
    },
    TED: {
      bank: 'Banco do Brasil',
      agency: '1234-5',
      account: '67890-1',
      name: 'Maria Silva Santos',
      cpf: '123.456.789-00'
    }
  }

  useEffect(() => {
    const initializeTrade = async () => {
      if (!id) {
        navigate('/p2p/offers')
        return
      }

      let foundTrade = getTradeById(id)
      
      // Create mock trade if none exists
      if (!foundTrade) {
        try {
          // Create trade with ESCROW_LOCKED status (BZR já bloqueado)
          foundTrade = await createTrade({
            offerId: 'mock_offer_' + Date.now(),
            buyerId: user?.id || 'buyer_123',
            sellerId: 'seller_456',
            amountBZR: '100.00',
            paymentMethod: 'PIX',
            priceBZR: 5.12
          })
          
          // Simulate that seller already locked the escrow
          if (foundTrade) {
            foundTrade.status = 'ESCROW_LOCKED'
            foundTrade.escrow = {
              escrowId: 'escrow_' + Date.now(),
              from: foundTrade.sellerId,
              to: foundTrade.buyerId,
              amountBZR: foundTrade.amountBZR,
              createdAt: Date.now() - 300000, // 5 minutes ago
              expiresAt: Date.now() + 86400000 // 24 hours from now
            }
            foundTrade.timeline.push({
              ts: Date.now() - 300000,
              type: 'ESCROW_LOCKED',
              payload: { escrowId: foundTrade.escrow.escrowId }
            })
          }
        } catch (error) {
          console.error('Failed to create mock trade:', error)
          navigate('/p2p/offers')
          return
        }
      }

      setTrade(foundTrade)
      setLoading(false)
    }

    initializeTrade()
  }, [id, getTradeById, createTrade, user, navigate])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
        <span className="ml-2">Carregando negociação...</span>
      </div>
    )
  }

  if (!trade) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-matte-black-900 mb-2">
            Negociação não encontrada
          </h2>
          <Button onClick={() => navigate('/p2p/offers')}>
            Ver Ofertas Disponíveis
          </Button>
        </Card>
      </div>
    )
  }

  const userRole = trade.buyerId === user?.id ? 'buyer' : 
                   trade.sellerId === user?.id ? 'seller' : 'observer'
  
  const counterpartId = userRole === 'buyer' ? trade.sellerId : trade.buyerId
  const counterpartName = userRole === 'buyer' ? 'Vendedor' : 'Comprador'
  
  const paymentInfo = mockPaymentInfo[trade.paymentMethod as keyof typeof mockPaymentInfo]
  const totalFiat = (parseFloat(trade.amountBZR) * trade.priceBZR).toFixed(2)

  const handleLockEscrow = async () => {
    try {
      await lockEscrow(
        {
          from: trade.sellerId,
          to: trade.buyerId,
          amount: trade.amountBZR
        },
        trade.id
      )
      
      // Update local trade state
      setTrade(prev => prev ? { ...prev, status: 'ESCROW_LOCKED' } : prev)
      toast.success('BZR bloqueado em escrow!')
    } catch (error) {
      toast.error('Erro ao bloquear escrow')
    }
  }

  const handleMarkAsPaid = () => {
    markPayment(trade.id, paymentProof)
    setTrade(prev => prev ? { ...prev, status: 'PAYMENT_MARKED' } : prev)
    toast.success('Pagamento marcado como realizado!')
    setPaymentProof('')
  }

  const handleRelease = async () => {
    try {
      if (trade.escrow?.escrowId) {
        await releaseEscrow(trade.escrow.escrowId, trade.id)
      }
      releaseFunds(trade.id)
      setTrade(prev => prev ? { ...prev, status: 'RELEASED' } : prev)
      toast.success('BZR liberado para o comprador!')
    } catch (error) {
      toast.error('Erro ao liberar BZR')
    }
  }

  const handleCancel = () => {
    cancelTrade(trade.id, 'Cancelado pelo usuário')
    setTrade(prev => prev ? { ...prev, status: 'CANCELLED' } : prev)
    toast.success('Negociação cancelada')
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copiado!')
  }

  const getStatusInfo = (status: P2PTrade['status']) => {
    const statusConfig = {
      CREATED: { 
        color: 'bg-blue-100 text-blue-800', 
        label: 'Aguardando Escrow',
        instruction: userRole === 'seller' ? 'Você deve bloquear o BZR' : 'Aguardando vendedor bloquear BZR'
      },
      ESCROW_LOCKED: { 
        color: 'bg-yellow-100 text-yellow-800', 
        label: 'Aguardando Pagamento',
        instruction: userRole === 'buyer' ? 'Você deve fazer o pagamento' : 'Aguardando comprador pagar'
      },
      PAYMENT_MARKED: { 
        color: 'bg-purple-100 text-purple-800', 
        label: 'Pagamento Informado',
        instruction: userRole === 'seller' ? 'Confira o pagamento e libere o BZR' : 'Aguardando vendedor confirmar'
      },
      RELEASED: { 
        color: 'bg-green-100 text-green-800', 
        label: 'Concluído',
        instruction: 'Negociação finalizada com sucesso!'
      },
      CANCELLED: { 
        color: 'bg-gray-100 text-gray-800', 
        label: 'Cancelado',
        instruction: 'Esta negociação foi cancelada'
      },
      DISPUTE: { 
        color: 'bg-red-100 text-red-800', 
        label: 'Em Disputa',
        instruction: 'Aguardando resolução da equipe'
      },
      REFUNDED: { 
        color: 'bg-gray-100 text-gray-800', 
        label: 'Reembolsado',
        instruction: 'BZR foi devolvido ao vendedor'
      }
    }
    
    return statusConfig[status] || statusConfig.CREATED
  }

  const statusInfo = getStatusInfo(trade.status)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold text-matte-black-900">
              Negociação #{trade.id.slice(-8)}
            </h1>
            <div className="flex items-center mt-2">
              <Badge className={`${statusInfo.color} px-3 py-1`}>
                {statusInfo.label}
              </Badge>
              <span className="text-sm text-matte-black-600 ml-3">
                Você é o {userRole === 'buyer' ? 'Comprador' : 'Vendedor'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      <Card className={`p-4 ${statusInfo.color.replace('text-', 'border-').replace('100', '200')}`}>
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 mr-3" />
          <div>
            <div className="font-semibold">{statusInfo.label}</div>
            <div className="text-sm">{statusInfo.instruction}</div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Trade Summary */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-matte-black-900 mb-4">
              Resumo da Negociação
            </h2>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <div className="text-sm text-matte-black-600">Quantidade</div>
                <div className="text-xl font-bold">{trade.amountBZR} BZR</div>
              </div>
              
              <div>
                <div className="text-sm text-matte-black-600">Preço Unitário</div>
                <div className="text-xl font-bold">R$ {trade.priceBZR.toFixed(2)}</div>
              </div>
              
              <div>
                <div className="text-sm text-matte-black-600">Método de Pagamento</div>
                <div className="font-semibold">
                  {getPaymentMethodInfo(trade.paymentMethod).name}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-matte-black-600">Total a Pagar</div>
                <div className="text-xl font-bold text-bazari-red">
                  R$ {totalFiat}
                </div>
              </div>
            </div>

            {/* Participants */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <div className="text-sm text-matte-black-600 mb-2">Comprador</div>
                <Link
                  to={buildProfileRoute(trade.buyerId)}
                  className="flex items-center hover:text-bazari-red transition-colors"
                >
                  <User className="h-8 w-8 bg-green-100 text-green-600 rounded-full p-2 mr-2" />
                  <span className="font-medium">
                    {trade.buyerId === user?.id ? 'Você' : 'Comprador'}
                  </span>
                </Link>
              </div>

              <div>
                <div className="text-sm text-matte-black-600 mb-2">Vendedor</div>
                <Link
                  to={buildProfileRoute(trade.sellerId)}
                  className="flex items-center hover:text-bazari-red transition-colors"
                >
                  <User className="h-8 w-8 bg-blue-100 text-blue-600 rounded-full p-2 mr-2" />
                  <span className="font-medium">
                    {trade.sellerId === user?.id ? 'Você' : 'Vendedor'}
                  </span>
                </Link>
              </div>
            </div>
          </Card>

          {/* Payment Information */}
          {trade.status === 'ESCROW_LOCKED' && userRole === 'buyer' && paymentInfo && (
            <Card className="p-6 bg-blue-50 border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Dados para Pagamento - {getPaymentMethodInfo(trade.paymentMethod).name}
              </h3>

              {trade.paymentMethod === 'PIX' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-blue-700">Chave PIX</div>
                      <div className="flex items-center">
                        <code className="bg-white px-2 py-1 rounded text-sm">
                          {paymentInfo.key}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(paymentInfo.key)}
                          className="ml-2 p-1"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-blue-700">Tipo</div>
                      <div className="text-sm">{paymentInfo.keyType}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-blue-700">Nome</div>
                      <div className="text-sm">{paymentInfo.name}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-blue-700">CPF</div>
                      <div className="text-sm">{paymentInfo.cpf}</div>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-100 rounded-lg">
                    <div className="text-sm font-semibold text-blue-900 mb-1">
                      ⚠️ Importante:
                    </div>
                    <div className="text-sm text-blue-800">
                      • Faça o PIX exatamente no valor de <strong>R$ {totalFiat}</strong><br/>
                      • Guarde o comprovante para anexar<br/>
                      • Após enviar, clique em "Marquei como Pago"
                    </div>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Mark as Paid */}
          {trade.status === 'ESCROW_LOCKED' && userRole === 'buyer' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-matte-black-900 mb-4">
                Marcar Pagamento
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-matte-black-700 mb-2">
                    Comprovante do Pagamento (opcional)
                  </label>
                  <Input
                    placeholder="Cole aqui o código/ID do PIX ou descreva o pagamento"
                    value={paymentProof}
                    onChange={(e) => setPaymentProof(e.target.value)}
                  />
                </div>
                
                <Button 
                  onClick={handleMarkAsPaid}
                  className="w-full"
                  size="lg"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  ✅ Marquei como Pago - R$ {totalFiat}
                </Button>

                <div className="text-xs text-matte-black-500">
                  Ao clicar você confirma que fez o pagamento no valor correto
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-6">
          {/* Main Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-matte-black-900 mb-4">
              Ações Disponíveis
            </h3>

            <div className="space-y-3">
              {/* Seller: Lock Escrow */}
              {trade.status === 'CREATED' && userRole === 'seller' && (
                <Button
                  onClick={handleLockEscrow}
                  disabled={escrowLoading}
                  className="w-full"
                  size="lg"
                >
                  {escrowLoading ? (
                    <LoadingSpinner className="h-4 w-4 mr-2" />
                  ) : (
                    <Shield className="h-4 w-4 mr-2" />
                  )}
                  Bloquear {trade.amountBZR} BZR
                </Button>
              )}

              {/* Seller: Release */}
              {trade.status === 'PAYMENT_MARKED' && userRole === 'seller' && (
                <Button
                  onClick={handleRelease}
                  disabled={escrowLoading}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  {escrowLoading ? (
                    <LoadingSpinner className="h-4 w-4 mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Liberar BZR (Recebi o PIX)
                </Button>
              )}

              {/* Cancel */}
              {['CREATED', 'ESCROW_LOCKED'].includes(trade.status) && (
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="w-full"
                >
                  Cancelar Negociação
                </Button>
              )}

              {/* Chat */}
              <Button
                onClick={() => navigate(`/chat/${counterpartId}`)}
                variant="outline"
                className="w-full"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Conversar com {counterpartName}
              </Button>
            </div>
          </Card>

          {/* Help */}
          <Card className="p-6 bg-info-50 border-info-200">
            <h3 className="text-lg font-semibold text-matte-black-900 mb-3">
              Como funciona?
            </h3>
            <div className="space-y-2 text-sm text-matte-black-700">
              <p><strong>1.</strong> Vendedor bloqueia BZR no escrow</p>
              <p><strong>2.</strong> Comprador faz PIX/TED</p>
              <p><strong>3.</strong> Comprador marca como pago</p>
              <p><strong>4.</strong> Vendedor confirma e libera BZR</p>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}