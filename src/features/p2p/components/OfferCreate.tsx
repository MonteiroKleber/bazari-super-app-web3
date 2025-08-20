
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  AlertTriangle, 
  Check, 
  MapPin, 
  DollarSign,
  CreditCard,
  FileText,
  Plus,
  X
} from 'lucide-react'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { Input } from '@shared/ui/Input'
import { Badge } from '@shared/ui/Badge'
import { LoadingSpinner } from '@shared/ui/LoadingSpinner'
import { useI18n } from '@app/providers/I18nProvider'
import { useOffersStore } from '../store/offersStore'
import { getPaymentMethodInfo, getEnabledPaymentMethods } from '../services/payments'
import { toast } from '@features/notifications/components/NotificationToastHost'
import type { PaymentMethod } from '../types/p2p.types'

interface FormData {
  side: 'BUY' | 'SELL'
  priceBZR: string
  minAmount: string
  maxAmount: string
  paymentMethods: PaymentMethod[]
  terms: string
  location: {
    country: string
    state: string
    city: string
  }
}

interface FormErrors {
  priceBZR?: string
  minAmount?: string
  maxAmount?: string
  paymentMethods?: string
  general?: string
}

export const OfferCreate: React.FC = () => {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { createOffer, loading } = useOffersStore()

  const [formData, setFormData] = useState<FormData>({
    side: 'SELL',
    priceBZR: '',
    minAmount: '',
    maxAmount: '',
    paymentMethods: [],
    terms: '',
    location: {
      country: 'Brasil',
      state: '',
      city: ''
    }
  })

  const [errors, setErrors] = useState<FormErrors>({})

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleLocationChange = (field: keyof FormData['location'], value: string) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value
      }
    }))
  }

  const togglePaymentMethod = (method: PaymentMethod) => {
    setFormData(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.includes(method)
        ? prev.paymentMethods.filter(m => m !== method)
        : [...prev.paymentMethods, method]
    }))
    
    if (errors.paymentMethods) {
      setErrors(prev => ({ ...prev, paymentMethods: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Price validation
    const price = parseFloat(formData.priceBZR)
    if (!formData.priceBZR || isNaN(price) || price <= 0) {
      newErrors.priceBZR = t('p2p.validation.priceRequired')
    } else if (price < 0.01 || price > 1000) {
      newErrors.priceBZR = t('p2p.validation.priceRange')
    }

    // Min amount validation
    const minAmount = parseFloat(formData.minAmount)
    if (!formData.minAmount || isNaN(minAmount) || minAmount <= 0) {
      newErrors.minAmount = t('p2p.validation.minAmountRequired')
    }

    // Max amount validation
    const maxAmount = parseFloat(formData.maxAmount)
    if (!formData.maxAmount || isNaN(maxAmount) || maxAmount <= 0) {
      newErrors.maxAmount = t('p2p.validation.maxAmountRequired')
    }

    // Min <= Max validation
    if (minAmount && maxAmount && minAmount > maxAmount) {
      newErrors.maxAmount = t('p2p.validation.maxAmountGreater')
    }

    // Payment methods validation
    if (formData.paymentMethods.length === 0) {
      newErrors.paymentMethods = t('p2p.validation.paymentMethodRequired')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      await createOffer({
        side: formData.side,
        priceBZR: parseFloat(formData.priceBZR),
        minAmount: formData.minAmount,
        maxAmount: formData.maxAmount,
        paymentMethods: formData.paymentMethods,
        terms: formData.terms.trim() || undefined,
        location: formData.location.city ? {
          country: formData.location.country,
          state: formData.location.state,
          city: formData.location.city
        } : undefined,
        fiatCurrency: 'BRL'
      })

      toast.success(t('p2p.toasts.offerCreated'))
      navigate('/p2p/offers')
    } catch (error) {
      const message = error instanceof Error ? error.message : t('p2p.errors.createFailed')
      setErrors({ general: message })
      toast.error(message)
    }
  }

  const availablePaymentMethods = getEnabledPaymentMethods()

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
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
              {t('p2p.offer.new.title')}
            </h1>
            <p className="text-matte-black-600">
              {t('p2p.offer.new.subtitle')}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Error */}
          {errors.general && (
            <Card className="p-4 bg-danger-50 border-danger-200">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-danger mr-3" />
                <span className="text-danger text-sm">{errors.general}</span>
              </div>
            </Card>
          )}

          {/* Side Selection */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-matte-black-900 mb-4">
              {t('p2p.offer.new.side')}
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleInputChange('side', 'BUY')}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  formData.side === 'BUY'
                    ? 'border-success bg-success-50 text-success'
                    : 'border-sand-300 hover:border-sand-400'
                }`}
              >
                <div className="text-center">
                  <div className="text-lg font-semibold mb-1">
                    {t('p2p.side.buy')}
                  </div>
                  <div className="text-sm opacity-75">
                    {t('p2p.offer.new.buyDesc')}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleInputChange('side', 'SELL')}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  formData.side === 'SELL'
                    ? 'border-bazari-red bg-bazari-red-50 text-bazari-red'
                    : 'border-sand-300 hover:border-sand-400'
                }`}
              >
                <div className="text-center">
                  <div className="text-lg font-semibold mb-1">
                    {t('p2p.side.sell')}
                  </div>
                  <div className="text-sm opacity-75">
                    {t('p2p.offer.new.sellDesc')}
                  </div>
                </div>
              </button>
            </div>
          </Card>

          {/* Price & Amounts */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-matte-black-900 mb-4 flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              {t('p2p.offer.new.pricing')}
            </h2>

            <div className="space-y-4">
              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-matte-black-700 mb-2">
                  {t('p2p.offer.new.priceBZR')} *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-matte-black-500">
                    R$
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="1000"
                    value={formData.priceBZR}
                    onChange={(e) => handleInputChange('priceBZR', e.target.value)}
                    className={`pl-8 ${errors.priceBZR ? 'border-danger' : ''}`}
                    placeholder="5.00"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-matte-black-500">
                    / BZR
                  </span>
                </div>
                {errors.priceBZR && (
                  <p className="text-danger text-sm mt-1">{errors.priceBZR}</p>
                )}
              </div>

              {/* Amounts */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-matte-black-700 mb-2">
                    {t('p2p.offer.new.minAmount')} *
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={formData.minAmount}
                      onChange={(e) => handleInputChange('minAmount', e.target.value)}
                      className={errors.minAmount ? 'border-danger' : ''}
                      placeholder="10.00"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-matte-black-500">
                      BZR
                    </span>
                  </div>
                  {errors.minAmount && (
                    <p className="text-danger text-sm mt-1">{errors.minAmount}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-matte-black-700 mb-2">
                    {t('p2p.offer.new.maxAmount')} *
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={formData.maxAmount}
                      onChange={(e) => handleInputChange('maxAmount', e.target.value)}
                      className={errors.maxAmount ? 'border-danger' : ''}
                      placeholder="1000.00"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-matte-black-500">
                      BZR
                    </span>
                  </div>
                  {errors.maxAmount && (
                    <p className="text-danger text-sm mt-1">{errors.maxAmount}</p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Payment Methods */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-matte-black-900 mb-4 flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              {t('p2p.offer.new.methods')} *
            </h2>

            <div className="grid grid-cols-2 gap-3">
              {availablePaymentMethods.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => togglePaymentMethod(method.id)}
                  className={`p-3 rounded-lg border-2 transition-colors text-left ${
                    formData.paymentMethods.includes(method.id)
                      ? 'border-bazari-red bg-bazari-red-50'
                      : 'border-sand-300 hover:border-sand-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{method.name}</div>
                      <div className="text-sm text-matte-black-600">
                        {method.description}
                      </div>
                    </div>
                    {formData.paymentMethods.includes(method.id) && (
                      <Check className="h-5 w-5 text-bazari-red" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {errors.paymentMethods && (
              <p className="text-danger text-sm mt-2">{errors.paymentMethods}</p>
            )}
          </Card>

          {/* Location */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-matte-black-900 mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              {t('p2p.offer.new.location')}
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-matte-black-700 mb-2">
                  {t('p2p.offer.new.state')}
                </label>
                <Input
                  value={formData.location.state}
                  onChange={(e) => handleLocationChange('state', e.target.value)}
                  placeholder="SP, RJ, MG..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-matte-black-700 mb-2">
                  {t('p2p.offer.new.city')}
                </label>
                <Input
                  value={formData.location.city}
                  onChange={(e) => handleLocationChange('city', e.target.value)}
                  placeholder="São Paulo, Rio de Janeiro..."
                />
              </div>
            </div>
          </Card>

          {/* Terms */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-matte-black-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              {t('p2p.offer.new.terms')}
            </h2>

            <textarea
              value={formData.terms}
              onChange={(e) => handleInputChange('terms', e.target.value)}
              placeholder={t('p2p.offer.new.termsPlaceholder')}
              rows={3}
              className="w-full px-3 py-2 border border-sand-300 rounded-lg focus:ring-2 focus:ring-bazari-red focus:border-transparent resize-none"
              maxLength={500}
            />
            
            <div className="text-right text-xs text-matte-black-500 mt-1">
              {formData.terms.length}/500
            </div>
          </Card>

          {/* Submit */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              {t('app.actions.cancel')}
            </Button>

            <Button
              type="submit"
              disabled={loading}
              className="min-w-32"
            >
              {loading ? (
                <>
                  <LoadingSpinner className="h-4 w-4 mr-2" />
                  {t('p2p.offer.new.creating')}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('p2p.offer.new.submit')}
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}