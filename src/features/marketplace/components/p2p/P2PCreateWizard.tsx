// src/features/marketplace/components/p2p/P2PCreateWizard.tsx

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowLeftRight, Check, Shield, Clock, AlertTriangle } from 'lucide-react'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { Input } from '@shared/ui/Input'
import { Textarea } from '@shared/ui/Textarea'
import { Badge } from '@shared/ui/Badge'
import { useI18n } from '@app/providers/I18nProvider'

interface P2PCreateWizardProps {
  onSubmit: (data: P2POrderData) => void
  onCancel: () => void
  isLoading?: boolean
}

interface P2POrderData {
  orderType: 'buy' | 'sell'
  unitPriceBRL: number
  minAmount: number
  maxAmount: number
  paymentMethods: string[]
  escrowEnabled: boolean
  escrowTimeLimitMinutes: number
  description?: string
  termsAndConditions?: string
}

export const P2PCreateWizard: React.FC<P2PCreateWizardProps> = ({
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const { t } = useI18n()
  const [currentStep, setCurrentStep] = React.useState(1)
  const [formData, setFormData] = React.useState<P2POrderData>({
    orderType: 'sell',
    unitPriceBRL: 0,
    minAmount: 0,
    maxAmount: 0,
    paymentMethods: [],
    escrowEnabled: true,
    escrowTimeLimitMinutes: 60,
    description: '',
    termsAndConditions: ''
  })

  const steps = [
    { id: 1, title: 'Tipo de Oferta', description: 'Escolha se quer comprar ou vender BZR' },
    { id: 2, title: 'Preço', description: 'Defina o preço por BZR em reais' },
    { id: 3, title: 'Quantidade', description: 'Valores mínimo e máximo para negociação' },
    { id: 4, title: 'Pagamento', description: 'Métodos de pagamento aceitos' },
    { id: 5, title: 'Escrow & Termos', description: 'Configurações de segurança' },
    { id: 6, title: 'Resumo', description: 'Confirme os dados do anúncio' }
  ]

  const paymentMethods = [
    { id: 'PIX', name: 'PIX', icon: '🏦', instant: true },
    { id: 'TED', name: 'TED', icon: '💳', instant: false },
    { id: 'DOC', name: 'DOC', icon: '📄', instant: false },
    { id: 'Dinheiro', name: 'Dinheiro', icon: '💰', instant: true },
    { id: 'PicPay', name: 'PicPay', icon: '📱', instant: true },
    { id: 'PayPal', name: 'PayPal', icon: '🌐', instant: false },
    { id: 'Wise', name: 'Wise', icon: '🌍', instant: false }
  ]

  const handlePaymentMethodToggle = (methodId: string) => {
    setFormData(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.includes(methodId)
        ? prev.paymentMethods.filter(id => id !== methodId)
        : [...prev.paymentMethods, methodId]
    }))
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return true // Order type is always selected
      case 2:
        return formData.unitPriceBRL > 0
      case 3:
        return formData.minAmount > 0 && formData.maxAmount > formData.minAmount
      case 4:
        return formData.paymentMethods.length > 0
      case 5:
        return true // Escrow is optional
      default:
        return true
    }
  }

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    onSubmit(formData)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <ArrowLeftRight className="mx-auto text-bazari-red mb-4" size={48} />
              <h2 className="text-2xl font-bold text-matte-black-900 mb-2">
                Tipo de Oferta
              </h2>
              <p className="text-matte-black-600">
                Escolha se você quer comprar ou vender BZR
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => setFormData({ ...formData, orderType: 'buy' })}
                className={`p-6 rounded-2xl border-2 transition-all ${
                  formData.orderType === 'buy'
                    ? 'border-success bg-success-50 text-success-700'
                    : 'border-sand-200 hover:border-sand-300 text-matte-black-700'
                }`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-4">💰</div>
                  <h3 className="text-xl font-semibold mb-2">Comprar BZR</h3>
                  <p className="text-sm">
                    Crie um anúncio para comprar BZR com reais
                  </p>
                  {formData.orderType === 'buy' && (
                    <Check className="mx-auto mt-4 text-success" size={24} />
                  )}
                </div>
              </button>

              <button
                onClick={() => setFormData({ ...formData, orderType: 'sell' })}
                className={`p-6 rounded-2xl border-2 transition-all ${
                  formData.orderType === 'sell'
                    ? 'border-bazari-red bg-bazari-red-50 text-bazari-red-700'
                    : 'border-sand-200 hover:border-sand-300 text-matte-black-700'
                }`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-4">🪙</div>
                  <h3 className="text-xl font-semibold mb-2">Vender BZR</h3>
                  <p className="text-sm">
                    Crie um anúncio para vender seus BZR por reais
                  </p>
                  {formData.orderType === 'sell' && (
                    <Check className="mx-auto mt-4 text-bazari-red" size={24} />
                  )}
                </div>
              </button>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-matte-black-900 mb-2">
                Preço por BZR
              </h2>
              <p className="text-matte-black-600">
                {formData.orderType === 'buy' 
                  ? 'Quanto você está disposto a pagar por cada BZR?'
                  : 'Por quanto você quer vender cada BZR?'
                }
              </p>
            </div>

            <div className="max-w-md mx-auto">
              <Input
                label="Preço unitário (R$)"
                type="number"
                step="0.001"
                min="0"
                placeholder="0.850"
                value={formData.unitPriceBRL || ''}
                onChange={(e) => setFormData({ ...formData, unitPriceBRL: parseFloat(e.target.value) || 0 })}
                className="text-center text-2xl"
              />
              
              {formData.unitPriceBRL > 0 && (
                <div className="mt-4 p-4 bg-sand-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm text-matte-black-600 mb-2">Preço por BZR:</p>
                    <p className="text-3xl font-bold text-bazari-red">
                      {formatCurrency(formData.unitPriceBRL)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="text-blue-600 mr-2 mt-0.5" size={16} />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Dica:</p>
                  <p>
                    Verifique o preço médio do mercado para definir um valor competitivo. 
                    Preços muito acima ou abaixo da média podem reduzir as chances de negociação.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-matte-black-900 mb-2">
                Quantidade de BZR
              </h2>
              <p className="text-matte-black-600">
                Defina os valores mínimo e máximo para cada negociação
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <Input
                label="Quantidade Mínima (BZR)"
                type="number"
                min="1"
                placeholder="100"
                value={formData.minAmount || ''}
                onChange={(e) => setFormData({ ...formData, minAmount: parseFloat(e.target.value) || 0 })}
              />
              
              <Input
                label="Quantidade Máxima (BZR)"
                type="number"
                min="1"
                placeholder="10000"
                value={formData.maxAmount || ''}
                onChange={(e) => setFormData({ ...formData, maxAmount: parseFloat(e.target.value) || 0 })}
              />
            </div>

            {formData.minAmount > 0 && formData.maxAmount > 0 && formData.unitPriceBRL > 0 && (
              <div className="bg-sand-50 p-6 rounded-xl max-w-2xl mx-auto">
                <h3 className="font-semibold text-matte-black-900 mb-4">Resumo dos Valores:</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-matte-black-600">Negociação Mínima:</p>
                    <p className="text-lg font-bold text-matte-black-900">
                      {formData.minAmount.toLocaleString()} BZR
                    </p>
                    <p className="text-sm text-success">
                      ≈ {formatCurrency(formData.minAmount * formData.unitPriceBRL)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-matte-black-600">Negociação Máxima:</p>
                    <p className="text-lg font-bold text-matte-black-900">
                      {formData.maxAmount.toLocaleString()} BZR
                    </p>
                    <p className="text-sm text-success">
                      ≈ {formatCurrency(formData.maxAmount * formData.unitPriceBRL)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {formData.minAmount >= formData.maxAmount && formData.maxAmount > 0 && (
              <div className="bg-red-50 p-4 rounded-lg max-w-2xl mx-auto">
                <div className="flex items-center text-red-800">
                  <AlertTriangle className="mr-2" size={16} />
                  <p className="text-sm">
                    A quantidade máxima deve ser maior que a mínima.
                  </p>
                </div>
              </div>
            )}
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-matte-black-900 mb-2">
                Métodos de Pagamento
              </h2>
              <p className="text-matte-black-600">
                Selecione os métodos de pagamento que você aceita
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => handlePaymentMethodToggle(method.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.paymentMethods.includes(method.id)
                      ? 'border-bazari-red bg-bazari-red-50 text-bazari-red-700'
                      : 'border-sand-200 hover:border-sand-300 text-matte-black-700'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">{method.icon}</div>
                    <h3 className="font-medium text-sm mb-1">{method.name}</h3>
                    {method.instant && (
                      <Badge variant="success" size="sm">Instantâneo</Badge>
                    )}
                    {formData.paymentMethods.includes(method.id) && (
                      <Check className="mx-auto mt-2" size={16} />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {formData.paymentMethods.length === 0 && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center text-yellow-800">
                  <AlertTriangle className="mr-2" size={16} />
                  <p className="text-sm">
                    Selecione pelo menos um método de pagamento para continuar.
                  </p>
                </div>
              </div>
            )}
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Shield className="mx-auto text-bazari-red mb-4" size={48} />
              <h2 className="text-2xl font-bold text-matte-black-900 mb-2">
                Escrow e Termos
              </h2>
              <p className="text-matte-black-600">
                Configure as opções de segurança e termos da negociação
              </p>
            </div>

            <Card className="p-6">
              <div className="flex items-start space-x-4">
                <input
                  type="checkbox"
                  id="escrowEnabled"
                  checked={formData.escrowEnabled}
                  onChange={(e) => setFormData({ ...formData, escrowEnabled: e.target.checked })}
                  className="mt-1 w-4 h-4 text-bazari-red border-gray-300 rounded focus:ring-bazari-red"
                />
                <div className="flex-1">
                  <label htmlFor="escrowEnabled" className="font-medium text-matte-black-900 mb-2 block">
                    Usar Escrow (Recomendado)
                  </label>
                  <p className="text-sm text-matte-black-600 mb-4">
                    O escrow bloqueia os tokens automaticamente durante a negociação, 
                    liberando apenas após confirmação do pagamento. Mais seguro para ambas as partes.
                  </p>
                  
                  {formData.escrowEnabled && (
                    <div className="mt-4">
                      <Input
                        label="Tempo limite do escrow (minutos)"
                        type="number"
                        min="15"
                        max="1440"
                        value={formData.escrowTimeLimitMinutes}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          escrowTimeLimitMinutes: parseInt(e.target.value) || 60 
                        })}
                        className="max-w-48"
                      />
                      <p className="text-xs text-matte-black-500 mt-1">
                        Tempo que o comprador tem para efetuar o pagamento
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <div className="space-y-4">
              <Textarea
                label="Descrição (Opcional)"
                placeholder="Adicione informações extras sobre sua oferta..."
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              
              <Textarea
                label="Termos e Condições (Opcional)"
                placeholder="Ex: Pagamento deve ser feito em até 30 minutos..."
                rows={3}
                value={formData.termsAndConditions}
                onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
              />
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-matte-black-900 mb-2">
                Confirmar Anúncio P2P
              </h2>
              <p className="text-matte-black-600">
                Revise os dados antes de publicar seu anúncio
              </p>
            </div>

            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-matte-black-900 mb-4">Resumo da Oferta</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-matte-black-600">Tipo:</p>
                      <Badge variant={formData.orderType === 'buy' ? 'success' : 'primary'}>
                        {formData.orderType === 'buy' ? 'Comprando BZR' : 'Vendendo BZR'}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-matte-black-600">Preço por BZR:</p>
                      <p className="text-lg font-bold text-bazari-red">
                        {formatCurrency(formData.unitPriceBRL)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-matte-black-600">Quantidade:</p>
                      <p className="font-medium text-matte-black-900">
                        {formData.minAmount.toLocaleString()} - {formData.maxAmount.toLocaleString()} BZR
                      </p>
                      <p className="text-sm text-success">
                        {formatCurrency(formData.minAmount * formData.unitPriceBRL)} - {formatCurrency(formData.maxAmount * formData.unitPriceBRL)}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-matte-black-900 mb-4">Configurações</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-matte-black-600">Métodos de Pagamento:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {formData.paymentMethods.map(methodId => (
                          <Badge key={methodId} variant="outline" size="sm">
                            {paymentMethods.find(m => m.id === methodId)?.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-matte-black-600">Escrow:</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant={formData.escrowEnabled ? 'success' : 'secondary'} size="sm">
                          {formData.escrowEnabled ? 'Ativado' : 'Desativado'}
                        </Badge>
                        {formData.escrowEnabled && (
                          <span className="text-sm text-matte-black-600">
                            ({formData.escrowTimeLimitMinutes} min)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {(formData.description || formData.termsAndConditions) && (
                <div className="mt-6 pt-6 border-t border-sand-200">
                  {formData.description && (
                    <div className="mb-4">
                      <p className="text-sm text-matte-black-600 mb-2">Descrição:</p>
                      <p className="text-matte-black-700">{formData.description}</p>
                    </div>
                  )}
                  {formData.termsAndConditions && (
                    <div>
                      <p className="text-sm text-matte-black-600 mb-2">Termos e Condições:</p>
                      <p className="text-matte-black-700">{formData.termsAndConditions}</p>
                    </div>
                  )}
                </div>
              )}
            </Card>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="text-blue-600 mr-2 mt-0.5" size={16} />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Antes de confirmar:</p>
                  <ul className="mt-1 list-disc list-inside space-y-1">
                    <li>Certifique-se de que tem os fundos necessários para a negociação</li>
                    <li>Verifique se o preço está competitivo com o mercado</li>
                    <li>Confirme os métodos de pagamento que aceita</li>
                    <li>Lembre-se de responder rapidamente às solicitações de negociação</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                currentStep >= step.id
                  ? 'border-bazari-red bg-bazari-red text-white'
                  : 'border-sand-300 bg-white text-matte-black-400'
              }`}>
                {currentStep > step.id ? <Check size={16} /> : step.id}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-2 ${
                  currentStep > step.id ? 'bg-bazari-red' : 'bg-sand-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="text-center">
          <h2 className="text-lg font-semibold text-matte-black-900">
            {steps[currentStep - 1].title}
          </h2>
          <p className="text-sm text-matte-black-600">
            Passo {currentStep} de {steps.length}
          </p>
        </div>
      </div>

      {/* Step Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        {renderStep()}
      </motion.div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-sand-200">
        <Button variant="outline" onClick={currentStep === 1 ? onCancel : handlePrevious}>
          {currentStep === 1 ? 'Cancelar' : 'Anterior'}
        </Button>
        
        {currentStep < steps.length ? (
          <Button onClick={handleNext} disabled={!canProceed()}>
            Próximo
          </Button>
        ) : (
          <Button onClick={handleSubmit} loading={isLoading} disabled={!canProceed()}>
            Publicar Anúncio P2P
          </Button>
        )}
      </div>
    </div>
  )
}