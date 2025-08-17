import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeftRight, Shield, Clock } from 'lucide-react'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { Input } from '@shared/ui/Input'
import { Textarea } from '@shared/ui/Textarea'
import { useI18n } from '@app/providers/I18nProvider'
import { useP2PStore } from '../../../p2p/store/p2pStore'
import { useAuthStore } from '@features/auth/store/authStore'
import { toast } from '@features/notifications/components/NotificationToastHost'

export const P2PCreate: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useI18n()
  const { createOrder } = useP2PStore()
  const { user } = useAuthStore()
  
  const [formData, setFormData] = React.useState({
    orderType: 'sell' as 'buy' | 'sell',
    unitPriceBRL: '',
    minAmount: '',
    maxAmount: '',
    paymentMethods: [] as string[],
    escrowEnabled: true,
    escrowTimeLimitMinutes: 60
  })
  
  const [isLoading, setIsLoading] = React.useState(false)

  const paymentMethodOptions = [
    'PIX', 'TED', 'DOC', 'Dinheiro', 'PicPay', 'PayPal', 'Wise'
  ]

  const handlePaymentMethodToggle = (method: string) => {
    setFormData(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.includes(method)
        ? prev.paymentMethods.filter(m => m !== method)
        : [...prev.paymentMethods, method]
    }))
  }

  const handleSubmit = async () => {
    if (!formData.unitPriceBRL || !formData.minAmount || !formData.maxAmount) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    if (formData.paymentMethods.length === 0) {
      toast.error('Selecione pelo menos um método de pagamento')
      return
    }

    const minAmount = parseFloat(formData.minAmount)
    const maxAmount = parseFloat(formData.maxAmount)
    
    if (minAmount >= maxAmount) {
      toast.error('Valor máximo deve ser maior que o mínimo')
      return
    }

    setIsLoading(true)
    
    try {
      await createOrder({
        ownerId: user!.id,
        ownerName: user!.name,
        ownerRating: user!.reputation.rating,
        orderType: formData.orderType,
        unitPriceBRL: parseFloat(formData.unitPriceBRL),
        minAmount,
        maxAmount,
        paymentMethods: formData.paymentMethods,
        escrowEnabled: formData.escrowEnabled,
        escrowTimeLimitMinutes: formData.escrowTimeLimitMinutes,
        status: 'active'
      })

      toast.success('Anúncio P2P criado com sucesso!')
      navigate('/marketplace/p2p')
    } catch (error) {
      toast.error('Erro ao criar anúncio P2P')
    } finally {
      setIsLoading(false)
    }
  }

  const estimatedTotal = formData.unitPriceBRL && formData.maxAmount
    ? parseFloat(formData.unitPriceBRL) * parseFloat(formData.maxAmount)
    : 0

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-matte-black-900 mb-2">
          Criar Anúncio P2P
        </h1>
        <p className="text-matte-black-600">
          Configure seu anúncio para trocar BZR por BRL
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Type */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-matte-black-900 mb-4">
              Tipo de Anúncio
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setFormData({ ...formData, orderType: 'sell' })}
                className={`p-6 rounded-xl border-2 text-center transition-colors ${
                  formData.orderType === 'sell'
                    ? 'border-bazari-red bg-bazari-red-50'
                    : 'border-sand-200 hover:border-bazari-red-200'
                }`}
              >
                <ArrowLeftRight className="mx-auto mb-3 text-bazari-red" size={32} />
                <h3 className="font-semibold text-matte-black-900 mb-2">
                  Vender BZR
                </h3>
                <p className="text-sm text-matte-black-600">
                  Receba BRL em troca dos seus BZR
                </p>
              </button>
              
              <button
                onClick={() => setFormData({ ...formData, orderType: 'buy' })}
                className={`p-6 rounded-xl border-2 text-center transition-colors ${
                  formData.orderType === 'buy'
                    ? 'border-success bg-success-50'
                    : 'border-sand-200 hover:border-success-200'
                }`}
              >
                <ArrowLeftRight className="mx-auto mb-3 text-success" size={32} />
                <h3 className="font-semibold text-matte-black-900 mb-2">
                  Comprar BZR
                </h3>
                <p className="text-sm text-matte-black-600">
                  Pague BRL para receber BZR
                </p>
              </button>
            </div>
          </Card>

          {/* Pricing */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-matte-black-900 mb-4">
              Preço e Limites
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Preço por BZR (BRL)"
                type="number"
                step="0.01"
                placeholder="0.85"
                value={formData.unitPriceBRL}
                onChange={(e) => setFormData({ ...formData, unitPriceBRL: e.target.value })}
                required
              />
              
              <Input
                label="Mínimo (BZR)"
                type="number"
                placeholder="100"
                value={formData.minAmount}
                onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
                required
              />
              
              <Input
                label="Máximo (BZR)"
                type="number"
                placeholder="10000"
                value={formData.maxAmount}
                onChange={(e) => setFormData({ ...formData, maxAmount: e.target.value })}
                required
              />
            </div>
            
            {estimatedTotal > 0 && (
              <div className="mt-4 p-4 bg-sand-50 rounded-xl">
                <p className="text-sm text-matte-black-600">
                  Valor total máximo: <span className="font-semibold">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(estimatedTotal)}
                  </span>
                </p>
              </div>
            )}
          </Card>

          {/* Payment Methods */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-matte-black-900 mb-4">
              Métodos de Pagamento
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {paymentMethodOptions.map((method) => (
                <button
                  key={method}
                  onClick={() => handlePaymentMethodToggle(method)}
                  className={`p-3 rounded-xl border-2 text-center transition-colors ${
                    formData.paymentMethods.includes(method)
                      ? 'border-bazari-gold bg-bazari-gold-50 text-bazari-gold-800'
                      : 'border-sand-200 hover:border-bazari-gold-200 text-matte-black-700'
                  }`}
                >
                  <span className="text-sm font-medium">{method}</span>
                </button>
              ))}
            </div>
          </Card>

          {/* Security */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-matte-black-900 mb-4">
              Configurações de Segurança
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-success-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <Shield className="text-success" size={24} />
                  <div>
                    <h3 className="font-medium text-success-800">
                      Escrow Automático
                    </h3>
                    <p className="text-sm text-success-700">
                      Fundos ficam protegidos até confirmação
                    </p>
                  </div>
                </div>
                
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.escrowEnabled}
                    onChange={(e) => setFormData({ ...formData, escrowEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
                </label>
              </div>

              {formData.escrowEnabled && (
                <div className="flex items-center space-x-4 p-4 bg-warning-50 rounded-xl">
                  <Clock className="text-warning-600" size={20} />
                  <div className="flex-1">
                    <label className="text-sm font-medium text-warning-800">
                      Tempo limite do escrow (minutos)
                    </label>
                    <select
                      value={formData.escrowTimeLimitMinutes}
                      onChange={(e) => setFormData({ ...formData, escrowTimeLimitMinutes: parseInt(e.target.value) })}
                      className="mt-1 block w-full rounded-lg border-warning-300 bg-white text-sm focus:border-warning-500 focus:ring-warning-500"
                    >
                      <option value={30}>30 minutos</option>
                      <option value={60}>1 hora</option>
                      <option value={120}>2 horas</option>
                      <option value={240}>4 horas</option>
                      <option value={480}>8 horas</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Preview */}
          <Card className="p-6">
            <h3 className="font-semibold text-matte-black-900 mb-4">
              Preview do Anúncio
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-matte-black-600">Tipo:</span>
                <span className="font-medium">
                  {formData.orderType === 'sell' ? 'Vendendo BZR' : 'Comprando BZR'}
                </span>
              </div>
              
              {formData.unitPriceBRL && (
                <div className="flex justify-between">
                  <span className="text-matte-black-600">Preço:</span>
                  <span className="font-medium">
                    R$ {parseFloat(formData.unitPriceBRL).toFixed(2)} / BZR
                  </span>
                </div>
              )}
              
              {formData.minAmount && formData.maxAmount && (
                <div className="flex justify-between">
                  <span className="text-matte-black-600">Limite:</span>
                  <span className="font-medium">
                    {formData.minAmount} - {formData.maxAmount} BZR
                  </span>
                </div>
              )}
              
              {formData.paymentMethods.length > 0 && (
                <div>
                  <span className="text-matte-black-600">Pagamento:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.paymentMethods.map((method) => (
                      <span
                        key={method}
                        className="inline-block px-2 py-1 bg-bazari-gold-100 text-bazari-gold-800 text-xs rounded"
                      >
                        {method}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Actions */}
          <Card className="p-6">
            <div className="space-y-3">
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                loading={isLoading}
                className="w-full"
                size="lg"
              >
                Publicar Anúncio P2P
              </Button>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/marketplace/p2p')}
              >
                Cancelar
              </Button>
            </div>
          </Card>

          {/* Info */}
          <Card className="p-6 bg-bazari-red-50 border-bazari-red-200">
            <h3 className="font-semibold text-bazari-red-800 mb-3">
              Dicas Importantes
            </h3>
            
            <ul className="text-sm text-bazari-red-700 space-y-2">
              <li>• Defina preços competitivos</li>
              <li>• Use escrow para maior segurança</li>
              <li>• Responda rapidamente às mensagens</li>
              <li>• Mantenha sua reputação alta</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}
