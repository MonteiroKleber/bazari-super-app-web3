
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
  CreditCard
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
import type { PaymentMethod } from '../types/p2p.types'

interface TradeFormData {
  amountBZR: string
  paymentMethod: PaymentMethod | ''
}

export const OfferDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useI18n()
  const { user } = useAuthStore()
  const { offers, fetchOffers } = useOffersStore()
  const { createTrade, loading: tradeLoading } = useTradesStore()
  const { fetchUserReputation, getUserReputation } = useReputationStore()

  const [tradeForm, setTradeForm] = useState<TradeFormData>({
    amountBZR: '',
    paymentMethod: ''
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const offer = offers.find(o => o.id === id)
  const ownerReputation = offer ? getUserReputation(offer.ownerId) : undefined
  const isOwnOffer = offer?.ownerId === user?.id

  useEffect(() => {
    if (!offer) {
      fetchOffers().catch(console.error)
    }
  }, [offer, fetchOffers])

  useEffect(() => {
    if (offer && !ownerReputation) {
      fetchUserReputation(offer.ownerId).catch(console.error)
    }
  }, [offer, ownerReputation, fetchUserReputation])

  const handleTradeFormChange = (field: keyof TradeFormData, value: string) => {
    setTradeForm(prev => ({ ...prev, [field]: value }))
    
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateTradeForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    const amount = parseFloat(tradeForm.amountBZR)
    const minAmount = parseFloat(offer?.minAmount || '0')
    const maxAmount = parseFloat(offer?.maxAmount || '0')

    if (!tradeForm.amountBZR || isNaN(amount) || amount <= 0) {
      errors.amountBZR = t('p2p.validation.amountRequired')
    } else if (amount < minAmount) {
      errors.amountBZR = t('p2p.validation.amountTooLow', { min: minAmount })
    } else if (amount > maxAmount) {
      errors.amountBZR = t('p2p.validation.amountTooHigh', { max: maxAmount })
    } else if (offer?.side === 'SELL' && amount > parseFloat(offer.availableAmount)) {
      errors.amountBZR = t('p2p.validation.insufficientAmount')
    }

    if (!tradeForm.paymentMethod) {
      errors.paymentMethod = t('p2p.validation.paymentMethodRequired')
    } else if (offer && !offer.paymentMethods.includes(tradeForm.paymentMethod as PaymentMethod)) {
      errors.paymentMethod = t('p2p.validation.paymentMethodNotSupported')
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleStartTrade = async () => {
    if (!offer || !user || !validateTradeForm()) {
      return
    }

    try {
      const trade = await createTrade({
        offerId: offer.id,
        buyerId: offer.side === 'BUY' ? offer.ownerId : user.id,
        sellerId: offer.side === 'SELL' ? offer.ownerId : user.id,
        amountBZR: tradeForm.amountBZR,
        paymentMethod: tradeForm.paymentMethod as PaymentMethod,
        priceBZR: offer.priceBZR
      })

      toast.success(t('p2p.toasts.tradeCreated'))
      navigate(`/p2p/trade/${trade.id}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : t('p2p.errors.tradeCreationFailed')
      toast.error(message)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(timestamp))
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}min`
    const hours = Math.floor(minutes / 60)
    return `${hours}h${minutes % 60}min`
  }

  if (!offer) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('app.actions.back')}
        </Button>
        
        <div>
          <h1 className="text-2xl font-bold text-matte-black-900">
            {t('p2p.offer.detail.title')}
          </h1>
          <div className="flex items-center mt-1">
            <Badge variant={offer.side === 'BUY' ? 'success' : 'secondary'} className="mr-2">
              {t(`p2p.side.${offer.side.toLowerCase()}`)}
            </Badge>
            <span className="text-matte-black-600 text-sm">
              {t('p2p.offer.detail.createdAt')} {formatDate(offer.createdAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Offer Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Price & Amounts */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-matte-black-900">
                {t('p2p.offer.detail.pricing')}
              </h2>
              <div className="text-3xl font-bold text-bazari-red">
                R$ {offer.priceBZR.toFixed(2)} / BZR
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-matte-black-600">
                  {t('p2p.offer.detail.minAmount')}
                </div>
                <div className="text-lg font-semibold">
                  {offer.minAmount} BZR
                </div>
              </div>
              
              <div>
                <div className="text-sm text-matte-black-600">
                  {t('p2p.offer.detail.maxAmount')}
                </div>
                <div className="text-lg font-semibold">
                  {offer.maxAmount} BZR
                </div>
              </div>

              {offer.side === 'SELL' && (
                <div className="col-span-2">
                  <div className="text-sm text-matte-black-600">
                    {t('p2p.offer.detail.available')}
                  </div>
                  <div className="text-lg font-semibold text-success">
                    {offer.availableAmount} BZR
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Payment Methods */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-matte-black-900 mb-4">
              {t('p2p.offer.detail.paymentMethods')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {offer.paymentMethods.map((method) => {
                const methodInfo = getPaymentMethodInfo(method)
                return (
                  <div key={method} className="flex items-center p-3 border border-sand-300 rounded-lg">
                    <div className="text-2xl mr-3">{methodInfo.icon}</div>
                    <div>
                      <div className="font-medium">{methodInfo.name}</div>
                      <div className="text-sm text-matte-black-600">
                        {methodInfo.description}
                      </div>
                      <div className="text-xs text-matte-black-500">
                        {t('p2p.offer.detail.processingTime')}: {methodInfo.processingTime}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Terms */}
          {offer.terms && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-matte-black-900 mb-4">
                {t('p2p.offer.detail.terms')}
              </h2>
              <p className="text-matte-black-700 whitespace-pre-wrap">
                {offer.terms}
              </p>
            </Card>
          )}

          {/* Location */}
          {offer.location && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-matte-black-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                {t('p2p.offer.detail.location')}
              </h2>
              <p className="text-matte-black-700">
                {offer.location.city}, {offer.location.state}
                {offer.location.country && `, ${offer.location.country}`}
              </p>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Owner Profile */}
          <Card className="p-6">
            <div className="text-center mb-4">
              <Link
                to={buildProfileRoute(offer.ownerId)}
                className="inline-block hover:opacity-80 transition-opacity"
              >
                <Avatar 
                  src={offer.ownerAvatarUrl} 
                  fallback={offer.ownerName}
                  size="lg"
                  className="mx-auto mb-3"
                />
                <h3 className="font-semibold text-matte-black-900 hover:text-bazari-red">
                  {offer.ownerName}
                </h3>
              </Link>
              
              {ownerReputation && (
                <div className="flex items-center justify-center mt-2">
                  <div className="flex items-center mr-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(ownerReputation.score)
                            ? 'text-bazari-gold-600 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold">
                    {ownerReputation.score.toFixed(1)}
                  </span>
                  <span className="text-sm text-matte-black-600 ml-1">
                    ({ownerReputation.completed})
                  </span>
                </div>
              )}
            </div>

            {/* Stats */}
            {offer.stats && (
              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-matte-black-600">{t('p2p.stats.completed')}</span>
                  <span className="font-medium">{offer.stats.completed}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-matte-black-600">{t('p2p.stats.cancelRate')}</span>
                  <span className="font-medium">{offer.stats.cancelRatePct.toFixed(1)}%</span>
                </div>
                
                {offer.stats.avgReleaseTimeSec && (
                  <div className="flex justify-between text-sm">
                    <span className="text-matte-black-600">{t('p2p.stats.avgReleaseTime')}</span>
                    <span className="font-medium">{formatTime(offer.stats.avgReleaseTimeSec)}</span>
                  </div>
                )}
              </div>
            )}

            <div className="mt-4">
              <Link to={buildProfileRoute(offer.ownerId)}>
                <Button variant="outline" className="w-full">
                  <User className="h-4 w-4 mr-2" />
                  {t('p2p.offer.detail.viewProfile')}
                </Button>
              </Link>
            </div>
          </Card>

          {/* Trade Form */}
          {!isOwnOffer && user && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-matte-black-900 mb-4">
                {t('p2p.offer.detail.startTrade')}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-matte-black-700 mb-2">
                    {t('p2p.trade.amount')} *
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.01"
                      min={offer.minAmount}
                      max={offer.maxAmount}
                      value={tradeForm.amountBZR}
                      onChange={(e) => handleTradeFormChange('amountBZR', e.target.value)}
                      className={formErrors.amountBZR ? 'border-danger' : ''}
                      placeholder={`${offer.minAmount} - ${offer.maxAmount}`}
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-matte-black-500">
                      BZR
                    </span>
                  </div>
                  {formErrors.amountBZR && (
                    <p className="text-danger text-sm mt-1">{formErrors.amountBZR}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-matte-black-700 mb-2">
                    {t('p2p.trade.method')} *
                  </label>
                  <select
                    value={tradeForm.paymentMethod}
                    onChange={(e) => handleTradeFormChange('paymentMethod', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-bazari-red focus:border-transparent ${
                      formErrors.paymentMethod ? 'border-danger' : 'border-sand-300'
                    }`}
                  >
                    <option value="">{t('p2p.trade.selectMethod')}</option>
                    {offer.paymentMethods.map((method) => (
                      <option key={method} value={method}>
                        {getPaymentMethodInfo(method).name}
                      </option>
                    ))}
                  </select>
                  {formErrors.paymentMethod && (
                    <p className="text-danger text-sm mt-1">{formErrors.paymentMethod}</p>
                  )}
                </div>

                {/* Total Calculation */}
                {tradeForm.amountBZR && !isNaN(parseFloat(tradeForm.amountBZR)) && (
                  <div className="p-3 bg-sand-50 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span>{t('p2p.trade.amount')}</span>
                      <span>{tradeForm.amountBZR} BZR</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>{t('p2p.trade.price')}</span>
                      <span>R$ {offer.priceBZR.toFixed(2)} / BZR</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                      <span>{t('p2p.trade.total')}</span>
                      <span>R$ {(parseFloat(tradeForm.amountBZR) * offer.priceBZR).toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleStartTrade}
                  disabled={tradeLoading}
                  className="w-full"
                >
                  {tradeLoading ? (
                    <>
                      <LoadingSpinner className="h-4 w-4 mr-2" />
                      {t('p2p.trade.starting')}
                    </>
                  ) : (
                    t('p2p.offer.detail.startTrade')
                  )}
                </Button>
              </div>
            </Card>
          )}

          {isOwnOffer && (
            <Card className="p-6 bg-info-50 border-info-200">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-info mr-3" />
                <span className="text-info text-sm">
                  {t('p2p.offer.detail.ownOffer')}
                </span>
              </div>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  )
}