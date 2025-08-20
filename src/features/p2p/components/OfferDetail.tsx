// ==========================================
// src/features/p2p/components/OfferDetail.tsx - COMPLETO
// ==========================================

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  Star, 
  Shield, 
  MapPin, 
  Clock, 
  TrendingUp,
  AlertTriangle,
  MessageCircle,
  User,
  Calendar,
  Award,
  CreditCard,
  CheckCircle,
  Info
} from 'lucide-react'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { Input } from '@shared/ui/Input'
import { Badge } from '@shared/ui/Badge'
import { Avatar } from '@shared/ui/Avatar'
import { LoadingSpinner } from '@shared/ui/LoadingSpinner'
import { EmptyState } from '@shared/ui/EmptyState'
import { useI18n } from '@app/providers/I18nProvider'
import { useAuthStore } from '@features/auth/store/authStore'
import { useOffersStore } from '../store/offersStore'
import { useTradesStore } from '../store/tradesStore'
import { useReputationStore } from '../store/reputationStore'
import { buildProfileRoute } from '../utils/profileRoute'
import { getPaymentMethodInfo } from '../services/payments'
import { toast } from '@features/notifications/components/NotificationToastHost'
import type { PaymentMethod, P2POffer } from '../types/p2p.types'

interface TradeFormData {
  amountBZR: string
  paymentMethod: PaymentMethod | ''
}

export const OfferDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useI18n()
  const { user } = useAuthStore()
  const { offers, fetchOffers, fetchOfferById, loading } = useOffersStore()
  const { createTrade, loading: tradeLoading } = useTradesStore()
  const { fetchUserReputation, getUserReputation } = useReputationStore()

  // ✅ CORREÇÃO: Estado local para oferta específica
  const [offer, setOffer] = useState<P2POffer | null>(null)
  const [isLoadingOffer, setIsLoadingOffer] = useState(true)
  const [tradeForm, setTradeForm] = useState<TradeFormData>({
    amountBZR: '',
    paymentMethod: ''
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // ✅ CORREÇÃO: Effect para buscar oferta específica
  useEffect(() => {
    const loadOffer = async () => {
      if (!id) {
        setIsLoadingOffer(false)
        return
      }

      console.log(`🔍 OfferDetail: Carregando oferta ${id}`)
      setIsLoadingOffer(true)

      try {
        // Primeiro verificar estado local
        const localOffer = offers.find(o => o.id === id)
        if (localOffer) {
          console.log(`📋 OfferDetail: Oferta encontrada no estado local`)
          setOffer(localOffer)
          setIsLoadingOffer(false)
          return
        }

        // Se não encontrou, buscar via store
        console.log(`🔄 OfferDetail: Buscando via fetchOfferById`)
        const fetchedOffer = await fetchOfferById(id)
        
        if (fetchedOffer) {
          console.log(`✅ OfferDetail: Oferta carregada com sucesso`)
          setOffer(fetchedOffer)
        } else {
          console.log(`❌ OfferDetail: Oferta não encontrada`)
          setOffer(null)
        }
      } catch (error) {
        console.error('❌ OfferDetail: Erro ao carregar oferta:', error)
        setOffer(null)
      } finally {
        setIsLoadingOffer(false)
      }
    }

    loadOffer()
  }, [id, offers, fetchOfferById])

  // Effect para buscar reputação do proprietário
  useEffect(() => {
    if (offer?.ownerId) {
      fetchUserReputation(offer.ownerId).catch(console.error)
    }
  }, [offer?.ownerId, fetchUserReputation])

  const ownerReputation = offer ? getUserReputation(offer.ownerId) : null

  // ✅ CORREÇÃO: Loading e error states melhorados
  if (isLoadingOffer || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/p2p/offers')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para ofertas
          </Button>
        </div>
        
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-matte-black-600">
              Carregando detalhes da oferta...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!offer) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/p2p/offers')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para ofertas
          </Button>
        </div>
        
        <EmptyState
          icon={AlertTriangle}
          title="Oferta não encontrada"
          description={`A oferta com ID "${id}" não existe ou foi removida.`}
          action={
            <Button onClick={() => navigate('/p2p/offers')}>
              Ver todas as ofertas
            </Button>
          }
        />
      </div>
    )
  }

  const isOwnOffer = offer.ownerId === user?.id
  const totalMin = (parseFloat(offer.minAmount) * offer.priceBZR).toFixed(0)
  const totalMax = (parseFloat(offer.maxAmount) * offer.priceBZR).toFixed(0)

  // Validação do formulário
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!tradeForm.amountBZR || parseFloat(tradeForm.amountBZR) <= 0) {
      errors.amountBZR = 'Quantidade deve ser maior que zero'
    } else {
      const amount = parseFloat(tradeForm.amountBZR)
      const min = parseFloat(offer.minAmount)
      const max = parseFloat(offer.maxAmount)
      
      if (amount < min) {
        errors.amountBZR = `Quantidade mínima: ${min} BZR`
      } else if (amount > max) {
        errors.amountBZR = `Quantidade máxima: ${max} BZR`
      }
      
      // Verificar disponibilidade para ofertas SELL
      if (offer.side === 'SELL') {
        const available = parseFloat(offer.availableAmount)
        if (amount > available) {
          errors.amountBZR = `Quantidade disponível: ${available} BZR`
        }
      }
    }

    if (!tradeForm.paymentMethod) {
      errors.paymentMethod = 'Selecione um método de pagamento'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Iniciar negociação
  const handleStartTrade = async () => {
    if (!validateForm() || !user) return

    try {
      const trade = await createTrade({
        offerId: offer.id,
        buyerId: offer.side === 'SELL' ? user.id : offer.ownerId,
        sellerId: offer.side === 'SELL' ? offer.ownerId : user.id,
        amountBZR: tradeForm.amountBZR,
        paymentMethod: tradeForm.paymentMethod as PaymentMethod,
        priceBZR: offer.priceBZR
      })

      toast({
        title: 'Negociação iniciada!',
        description: 'Você foi redirecionado para a sala de negociação.',
        type: 'success'
      })

      navigate(`/p2p/trade/${trade.id}`)
    } catch (error) {
      toast({
        title: 'Erro ao iniciar negociação',
        description: error instanceof Error ? error.message : 'Tente novamente.',
        type: 'error'
      })
    }
  }

  // Utilitários de formatação
  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (days > 0) return `${days} dias atrás`
    if (hours > 0) return `${hours} horas atrás`
    return 'Há pouco tempo'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const formatMinutes = (seconds: number) => {
    return Math.round(seconds / 60)
  }

  const getReputationColor = (level?: string) => {
    switch (level) {
      case 'trusted': return 'text-green-600 bg-green-50 border-green-200'
      case 'pro': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'new': return 'text-gray-600 bg-gray-50 border-gray-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getReputationLabel = (level?: string) => {
    switch (level) {
      case 'trusted': return 'Confiável'
      case 'pro': return 'Profissional'
      case 'new': return 'Novo'
      default: return 'Regular'
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header com Navegação */}
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => navigate('/p2p/offers')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para ofertas
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna Principal - Detalhes da Oferta */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card Principal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-6">
              {/* Header da Oferta */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Badge 
                      variant={offer.side === 'BUY' ? 'destructive' : 'default'}
                      className="text-sm font-medium"
                    >
                      {offer.side === 'BUY' ? 'COMPRA' : 'VENDA'}
                    </Badge>
                    
                    {offer.reputation?.level && (
                      <Badge 
                        variant="outline" 
                        className={`flex items-center gap-1 ${getReputationColor(offer.reputation.level)}`}
                      >
                        {offer.reputation.level === 'trusted' && <Shield className="h-3 w-3" />}
                        {offer.reputation.level === 'pro' && <Award className="h-3 w-3" />}
                        {offer.reputation.level === 'new' && <User className="h-3 w-3" />}
                        {getReputationLabel(offer.reputation.level)}
                      </Badge>
                    )}
                    
                    {isOwnOffer && (
                      <Badge variant="outline" className="text-bazari-red border-bazari-red">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Sua Oferta
                      </Badge>
                    )}
                  </div>
                  
                  <h1 className="text-2xl font-bold text-matte-black-900">
                    {offer.side === 'BUY' ? 'Comprar' : 'Vender'} BZR por BRL
                  </h1>
                  
                  <div className="flex items-center gap-4 mt-2 text-sm text-matte-black-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Publicado {formatTimeAgo(offer.createdAt)}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {offer.location?.city}, {offer.location?.state}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-3xl font-bold text-bazari-red">
                    {formatCurrency(offer.priceBZR)}
                  </div>
                  <div className="text-sm text-matte-black-600">
                    por BZR
                  </div>
                </div>
              </div>

              {/* Informações da Oferta */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-matte-black-700 mb-1">
                      Quantidade
                    </h3>
                    <p className="text-lg font-semibold">
                      {offer.minAmount} - {offer.maxAmount} BZR
                    </p>
                    <p className="text-sm text-matte-black-600">
                      {formatCurrency(parseFloat(totalMin))} - {formatCurrency(parseFloat(totalMax))}
                    </p>
                  </div>

                  {offer.side === 'SELL' && (
                    <div>
                      <h3 className="text-sm font-medium text-matte-black-700 mb-1">
                        Disponível
                      </h3>
                      <p className="text-lg font-medium text-green-600">
                        {offer.availableAmount} BZR
                      </p>
                      <p className="text-sm text-matte-black-600">
                        {formatCurrency(parseFloat(offer.availableAmount) * offer.priceBZR)}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-matte-black-700 mb-1">
                      Métodos de Pagamento
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {offer.paymentMethods.map(method => {
                        const info = getPaymentMethodInfo(method)
                        return (
                          <Badge key={method} variant="outline" className="flex items-center gap-1">
                            <CreditCard className="h-3 w-3" />
                            {info.label}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-matte-black-700 mb-1">
                      Estatísticas
                    </h3>
                    <div className="space-y-1 text-sm text-matte-black-600">
                      <div className="flex items-center justify-between">
                        <span>Tempo médio:</span>
                        <span>{formatMinutes(offer.stats.avgReleaseTimeSec)} min</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Taxa cancelamento:</span>
                        <span>{offer.stats.cancelRatePct.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Termos */}
              {offer.terms && (
                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium text-matte-black-700 mb-2">
                    Termos da Oferta
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-matte-black-600 leading-relaxed">
                      {offer.terms}
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Card do Proprietário */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-matte-black-900 mb-4">
                Informações do {offer.side === 'SELL' ? 'Vendedor' : 'Comprador'}
              </h3>
              
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <Avatar 
                    size="lg" 
                    fallback={offer.ownerName} 
                    src={offer.ownerAvatarUrl}
                  />
                  
                  <div>
                    <h4 className="text-lg font-semibold text-matte-black-900">
                      {offer.ownerName}
                    </h4>
                    
                    {offer.reputation && (
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="font-medium">
                            {offer.reputation.score.toFixed(1)}
                          </span>
                        </div>
                        <span className="text-matte-black-600">
                          ({offer.stats.completed} negociações)
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-4 mt-3 text-sm text-matte-black-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Média {formatMinutes(offer.stats.avgReleaseTimeSec)} min
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        {offer.stats.cancelRatePct.toFixed(1)}% cancelamento
                      </div>
                    </div>

                    {ownerReputation && (
                      <div className="mt-3">
                        <Badge 
                          variant="outline" 
                          className={getReputationColor(ownerReputation.level)}
                        >
                          {getReputationLabel(ownerReputation.level)}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link to={buildProfileRoute(offer.ownerId)}>
                    <Button variant="outline" size="sm">
                      <User className="h-4 w-4 mr-1" />
                      Perfil
                    </Button>
                  </Link>
                  
                  <Button variant="outline" size="sm">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Chat
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Sidebar - Formulário de Negociação */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="sticky top-8"
          >
            <Card className="p-6">
              {isOwnOffer ? (
                <div className="text-center py-8">
                  <Award className="h-12 w-12 text-bazari-red mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-matte-black-900 mb-2">
                    Sua Oferta
                  </h3>
                  <p className="text-matte-black-600 mb-4">
                    Esta é sua oferta P2P. Aguarde contatos de interessados.
                  </p>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate('/p2p/my-trades')}
                    >
                      Ver Minhas Negociações
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full"
                      onClick={() => navigate(`/p2p/offers/edit/${offer.id}`)}
                    >
                      Editar Oferta
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-matte-black-900">
                    {offer.side === 'SELL' ? 'Comprar BZR' : 'Vender BZR'}
                  </h3>

                  {/* Campo Quantidade */}
                  <div>
                    <label className="block text-sm font-medium text-matte-black-700 mb-1">
                      Quantidade (BZR) *
                    </label>
                    <Input
                      type="number"
                      placeholder={`${offer.minAmount} - ${offer.maxAmount}`}
                      value={tradeForm.amountBZR}
                      onChange={(e) => setTradeForm(prev => ({ 
                        ...prev, 
                        amountBZR: e.target.value 
                      }))}
                      error={formErrors.amountBZR}
                    />
                    {tradeForm.amountBZR && (
                      <p className="text-sm text-matte-black-600 mt-1">
                        Total: {formatCurrency(parseFloat(tradeForm.amountBZR) * offer.priceBZR)}
                      </p>
                    )}
                  </div>

                  {/* Seleção de Método de Pagamento */}
                  <div>
                    <label className="block text-sm font-medium text-matte-black-700 mb-1">
                      Método de Pagamento *
                    </label>
                    <select
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bazari-red"
                      value={tradeForm.paymentMethod}
                      onChange={(e) => setTradeForm(prev => ({ 
                        ...prev, 
                        paymentMethod: e.target.value as PaymentMethod 
                      }))}
                    >
                      <option value="">Selecione...</option>
                      {offer.paymentMethods.map(method => {
                        const info = getPaymentMethodInfo(method)
                        return (
                          <option key={method} value={method}>
                            {info.label}
                          </option>
                        )
                      })}
                    </select>
                    {formErrors.paymentMethod && (
                      <p className="text-sm text-red-600 mt-1">
                        {formErrors.paymentMethod}
                      </p>
                    )}
                  </div>

                  {/* Resumo da Transação */}
                  {tradeForm.amountBZR && tradeForm.paymentMethod && (
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Quantidade:</span>
                        <span className="font-medium">{tradeForm.amountBZR} BZR</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Preço unitário:</span>
                        <span className="font-medium">{formatCurrency(offer.priceBZR)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Método:</span>
                        <span className="font-medium">
                          {getPaymentMethodInfo(tradeForm.paymentMethod).label}
                        </span>
                      </div>
                      <hr className="my-2" />
                      <div className="flex justify-between text-base font-semibold">
                        <span>Total:</span>
                        <span className="text-bazari-red">
                          {formatCurrency(parseFloat(tradeForm.amountBZR) * offer.priceBZR)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Botão de Ação */}
                  <Button 
                    className="w-full"
                    onClick={handleStartTrade}
                    disabled={tradeLoading || !tradeForm.amountBZR || !tradeForm.paymentMethod}
                  >
                    {tradeLoading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      `${offer.side === 'SELL' ? 'Comprar' : 'Vender'} BZR`
                    )}
                  </Button>

                  {/* Aviso de Segurança */}
                  <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <Shield className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-yellow-800 mb-1">
                        Transação Protegida
                      </p>
                      <p className="text-yellow-700">
                        Seus fundos ficam em escrow até a confirmação da transferência.
                      </p>
                    </div>
                  </div>

                  {/* Informações Adicionais */}
                  <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-800 mb-1">
                        Como funciona?
                      </p>
                      <ul className="text-blue-700 space-y-1">
                        <li>• Inicie a negociação</li>
                        <li>• Converse no chat privado</li>
                        <li>• Fundos ficam em escrow</li>
                        <li>• Confirme o pagamento</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}