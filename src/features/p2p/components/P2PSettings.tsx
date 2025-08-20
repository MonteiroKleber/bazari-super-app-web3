
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings, 
  MapPin, 
  CreditCard, 
  DollarSign, 
  Clock, 
  Bell,
  Shield,
  Save,
  RotateCcw
} from 'lucide-react'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { Input } from '@shared/ui/Input'
import { Badge } from '@shared/ui/Badge'
import { LoadingSpinner } from '@shared/ui/LoadingSpinner'
import { useI18n } from '@app/providers/I18nProvider'
import { getEnabledPaymentMethods } from '../services/payments'
import { toast } from '@features/notifications/components/NotificationToastHost'
import type { P2PSettings, PaymentMethod } from '../types/p2p.types'

// Mock settings store - in production, use Zustand store
const useP2PSettingsStore = () => {
  const [settings, setSettings] = useState<P2PSettings>({
    defaultCurrency: 'BRL',
    defaultLocation: {
      country: 'Brasil',
      state: 'SP',
      city: 'São Paulo'
    },
    defaultPaymentMethods: ['PIX'],
    defaultLimits: {
      minAmount: '10.00',
      maxAmount: '1000.00'
    },
    autoCancel: {
      enabled: true,
      timeoutMinutes: 30
    }
  })

  const [loading, setLoading] = useState(false)

  const updateSettings = async (newSettings: Partial<P2PSettings>) => {
    setLoading(true)
    
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setSettings(prev => ({ ...prev, ...newSettings }))
      toast.success('Configurações salvas com sucesso!')
    } catch (error) {
      toast.error('Erro ao salvar configurações')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const resetSettings = async () => {
    setLoading(true)
    
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 300))
      
      setSettings({
        defaultCurrency: 'BRL',
        defaultLocation: {
          country: 'Brasil',
          state: '',
          city: ''
        },
        defaultPaymentMethods: ['PIX'],
        defaultLimits: {
          minAmount: '1.00',
          maxAmount: '10000.00'
        },
        autoCancel: {
          enabled: false,
          timeoutMinutes: 30
        }
      })
      
      toast.success('Configurações restauradas!')
    } catch (error) {
      toast.error('Erro ao restaurar configurações')
      throw error
    } finally {
      setLoading(false)
    }
  }

  return { settings, updateSettings, resetSettings, loading }
}

export const P2PSettings: React.FC = () => {
  const { t } = useI18n()
  const { settings, updateSettings, resetSettings, loading } = useP2PSettingsStore()

  const [formData, setFormData] = useState<P2PSettings>(settings)
  const [hasChanges, setHasChanges] = useState(false)

  const availablePaymentMethods = getEnabledPaymentMethods()

  useEffect(() => {
    setFormData(settings)
  }, [settings])

  useEffect(() => {
    const changed = JSON.stringify(formData) !== JSON.stringify(settings)
    setHasChanges(changed)
  }, [formData, settings])

  const handleLocationChange = (field: keyof P2PSettings['defaultLocation'], value: string) => {
    setFormData(prev => ({
      ...prev,
      defaultLocation: {
        ...prev.defaultLocation!,
        [field]: value
      }
    }))
  }

  const handleLimitsChange = (field: keyof P2PSettings['defaultLimits'], value: string) => {
    setFormData(prev => ({
      ...prev,
      defaultLimits: {
        ...prev.defaultLimits,
        [field]: value
      }
    }))
  }

  const handleAutoCancelChange = (field: keyof P2PSettings['autoCancel'], value: any) => {
    setFormData(prev => ({
      ...prev,
      autoCancel: {
        ...prev.autoCancel,
        [field]: value
      }
    }))
  }

  const togglePaymentMethod = (method: PaymentMethod) => {
    setFormData(prev => ({
      ...prev,
      defaultPaymentMethods: prev.defaultPaymentMethods.includes(method)
        ? prev.defaultPaymentMethods.filter(m => m !== method)
        : [...prev.defaultPaymentMethods, method]
    }))
  }

  const handleSave = async () => {
    try {
      await updateSettings(formData)
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }

  const handleReset = async () => {
    try {
      await resetSettings()
    } catch (error) {
      console.error('Failed to reset settings:', error)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-matte-black-900 flex items-center">
            <Settings className="h-6 w-6 mr-3" />
            {t('p2p.settings.title')}
          </h1>
          <p className="text-matte-black-600 mt-1">
            {t('p2p.settings.subtitle')}
          </p>
        </div>

        {hasChanges && (
          <Badge variant="warning">
            {t('p2p.settings.unsavedChanges')}
          </Badge>
        )}
      </div>

      {/* Default Location */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-matte-black-900 mb-4 flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          {t('p2p.settings.defaultLocation')}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-matte-black-700 mb-2">
              {t('p2p.settings.country')}
            </label>
            <Input
              value={formData.defaultLocation?.country || ''}
              onChange={(e) => handleLocationChange('country', e.target.value)}
              placeholder="Brasil"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-matte-black-700 mb-2">
              {t('p2p.settings.state')}
            </label>
            <Input
              value={formData.defaultLocation?.state || ''}
              onChange={(e) => handleLocationChange('state', e.target.value)}
              placeholder="SP, RJ, MG..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-matte-black-700 mb-2">
              {t('p2p.settings.city')}
            </label>
            <Input
              value={formData.defaultLocation?.city || ''}
              onChange={(e) => handleLocationChange('city', e.target.value)}
              placeholder="São Paulo, Rio de Janeiro..."
            />
          </div>
        </div>

        <p className="text-sm text-matte-black-600 mt-3">
          {t('p2p.settings.locationNote')}
        </p>
      </Card>

      {/* Default Payment Methods */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-matte-black-900 mb-4 flex items-center">
          <CreditCard className="h-5 w-5 mr-2" />
          {t('p2p.settings.defaultPayment')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {availablePaymentMethods.map((method) => (
            <button
              key={method.id}
              type="button"
              onClick={() => togglePaymentMethod(method.id)}
              className={`p-3 rounded-lg border-2 transition-colors text-left ${
                formData.defaultPaymentMethods.includes(method.id)
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
                {formData.defaultPaymentMethods.includes(method.id) && (
                  <div className="w-5 h-5 bg-bazari-red rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        <p className="text-sm text-matte-black-600 mt-3">
          {t('p2p.settings.paymentNote')}
        </p>
      </Card>

      {/* Default Limits */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-matte-black-900 mb-4 flex items-center">
          <DollarSign className="h-5 w-5 mr-2" />
          {t('p2p.settings.defaultLimits')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-matte-black-700 mb-2">
              {t('p2p.settings.minAmount')}
            </label>
            <div className="relative">
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.defaultLimits.minAmount}
                onChange={(e) => handleLimitsChange('minAmount', e.target.value)}
                placeholder="1.00"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-matte-black-500">
                BZR
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-matte-black-700 mb-2">
              {t('p2p.settings.maxAmount')}
            </label>
            <div className="relative">
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.defaultLimits.maxAmount}
                onChange={(e) => handleLimitsChange('maxAmount', e.target.value)}
                placeholder="10000.00"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-matte-black-500">
                BZR
              </span>
            </div>
          </div>
        </div>

        <p className="text-sm text-matte-black-600 mt-3">
          {t('p2p.settings.limitsNote')}
        </p>
      </Card>

      {/* Auto Cancel */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-matte-black-900 mb-4 flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          {t('p2p.settings.autoCancel')}
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-matte-black-900">
                {t('p2p.settings.autoCancelEnabled')}
              </div>
              <div className="text-sm text-matte-black-600">
                {t('p2p.settings.autoCancelEnabledDesc')}
              </div>
            </div>
            
            <button
              type="button"
              onClick={() => handleAutoCancelChange('enabled', !formData.autoCancel.enabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-bazari-red focus:ring-offset-2 ${
                formData.autoCancel.enabled ? 'bg-bazari-red' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.autoCancel.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {formData.autoCancel.enabled && (
            <div>
              <label className="block text-sm font-medium text-matte-black-700 mb-2">
                {t('p2p.settings.timeoutMinutes')}
              </label>
              <div className="relative max-w-xs">
                <Input
                  type="number"
                  min="5"
                  max="120"
                  step="5"
                  value={formData.autoCancel.timeoutMinutes}
                  onChange={(e) => handleAutoCancelChange('timeoutMinutes', Number(e.target.value))}
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-matte-black-500">
                  min
                </span>
              </div>
            </div>
          )}
        </div>

        <p className="text-sm text-matte-black-600 mt-3">
          {t('p2p.settings.autoCancelNote')}
        </p>
      </Card>

      {/* Notifications (Future) */}
      <Card className="p-6 bg-sand-50 border-sand-200">
        <h2 className="text-lg font-semibold text-matte-black-900 mb-4 flex items-center">
          <Bell className="h-5 w-5 mr-2" />
          {t('p2p.settings.notifications')}
        </h2>

        <div className="text-center py-8">
          <div className="text-matte-black-500 mb-4">
            {t('p2p.settings.notificationsComingSoon')}
          </div>
          <Badge variant="secondary">
            {t('p2p.settings.comingSoon')}
          </Badge>
        </div>
      </Card>

      {/* Security Tips */}
      <Card className="p-6 bg-info-50 border-info-200">
        <h2 className="text-lg font-semibold text-matte-black-900 mb-4 flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          {t('p2p.settings.securityTips')}
        </h2>

        <div className="space-y-2 text-sm text-matte-black-700">
          <p>• {t('p2p.settings.tip1')}</p>
          <p>• {t('p2p.settings.tip2')}</p>
          <p>• {t('p2p.settings.tip3')}</p>
          <p>• {t('p2p.settings.tip4')}</p>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={loading}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          {t('p2p.settings.reset')}
        </Button>

        <Button
          onClick={handleSave}
          disabled={loading || !hasChanges}
          className="min-w-32"
        >
          {loading ? (
            <>
              <LoadingSpinner className="h-4 w-4 mr-2" />
              {t('p2p.settings.saving')}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {t('p2p.settings.save')}
            </>
          )}
        </Button>
      </div>
    </motion.div>
  )
}