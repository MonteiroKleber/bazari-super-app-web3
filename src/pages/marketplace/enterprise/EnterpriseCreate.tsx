// src/pages/marketplace/enterprise/EnterpriseCreate.tsx

import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Upload, X, Plus, Check, Coins } from 'lucide-react'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { Input } from '@shared/ui/Input'
import { Textarea } from '@shared/ui/Textarea'
import { Badge } from '@shared/ui/Badge'
import { useI18n } from '@app/providers/I18nProvider'
import { useEnterpriseStore } from '@features/marketplace/store/enterpriseStore'
import { useAuthStore } from '@features/auth/store/authStore'
import { toast } from '@features/notifications/components/NotificationToastHost'
import categories from '@app/data/categories.json'

export const EnterpriseCreate: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { t } = useI18n()
  const { createEnterprise } = useEnterpriseStore()
  const { user } = useAuthStore()
  
  const [currentStep, setCurrentStep] = React.useState(1)
  const [isLoading, setIsLoading] = React.useState(false)
  
  // Verificar se veio do MarketplaceCreate
  const returnToMarketplace = searchParams.get('returnTo') === 'marketplace-create'
  
  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
    categories: [] as string[],
    address: {
      street: '',
      city: '',
      state: '',
      country: 'Brasil',
      zipCode: ''
    },
    contact: {
      phone: '',
      email: '',
      website: '',
      socialMedia: {
        instagram: '',
        facebook: '',
        twitter: '',
        linkedin: ''
      }
    },
    tokenizable: false,
    tokenization: {
      enabled: false,
      totalSupply: 10000,
      royaltyPercentage: 5,
      transferable: true,
      mintPrice: 100,
      mintCurrency: 'BZR' as 'BZR' | 'BRL'
    },
    settings: {
      autoAcceptOrders: false,
      minOrderValue: 0,
      maxOrderValue: 0,
      acceptedCurrencies: ['BZR', 'BRL'] as ('BZR' | 'BRL')[],
      deliveryMethods: [] as string[]
    }
  })

  const steps = [
    { id: 1, title: 'Informações Básicas', description: 'Nome, descrição e categorias' },
    { id: 2, title: 'Localização & Contato', description: 'Endereço e informações de contato' },
    { id: 3, title: 'Configurações', description: 'Preferências de negócio' },
    { id: 4, title: 'Tokenização', description: 'Configurações de tokens (opcional)' },
    { id: 5, title: 'Revisão', description: 'Confirme os dados antes de criar' }
  ]

  const deliveryOptions = [
    'Retirada no Local',
    'Entrega Rápida (até 2h)',
    'Entrega Municipal (cidade)',
    'Entrega Estadual',
    'Entrega Nacional',
    'Entrega Internacional',
    'Digital/Download'
  ]

  const handleCategoryToggle = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId]
    }))
  }

  const handleDeliveryMethodToggle = (method: string) => {
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        deliveryMethods: prev.settings.deliveryMethods.includes(method)
          ? prev.settings.deliveryMethods.filter(m => m !== method)
          : [...prev.settings.deliveryMethods, method]
      }
    }))
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.description || formData.categories.length === 0) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    setIsLoading(true)
    
    try {
      const enterpriseData = {
        ownerId: user!.id,
        ownerName: user!.name,
        name: formData.name,
        description: formData.description,
        categories: formData.categories,
        subcategories: [], // Could be enhanced to support subcategories
        address: formData.address.street ? formData.address : undefined,
        contact: formData.contact,
        tokenizable: formData.tokenizable,
        tokenization: formData.tokenizable ? formData.tokenization : undefined,
        verification: {
          verified: false,
          documents: []
        },
        settings: formData.settings,
        status: 'active' as const
      }

      const enterpriseId = await createEnterprise(enterpriseData)
      toast.success('Empreendimento criado com sucesso!')
      
      // ✅ CORREÇÃO: Redirecionar para MarketplaceCreate se veio de lá
      if (returnToMarketplace) {
        navigate(`/marketplace/create?enterpriseId=${enterpriseId}`)
      } else {
        navigate(`/marketplace/enterprises/${enterpriseId}`)
      }
    } catch (error) {
      toast.error('Erro ao criar empreendimento')
    } finally {
      setIsLoading(false)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.name && formData.description && formData.categories.length > 0
      case 2:
        return true // Campos opcionais
      case 3:
        return true // Campos opcionais
      case 4:
        return true // Campos opcionais
      case 5:
        return true
      default:
        return false
    }
  }

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <Input
              label="Nome do Empreendimento"
              placeholder="Ex: Tech Solutions Pro"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            
            <Textarea
              label="Descrição"
              placeholder="Descreva seu empreendimento, produtos/serviços oferecidos..."
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />

            <div>
              <label className="block text-sm font-medium text-matte-black-900 mb-3">
                Categorias <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categories.categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryToggle(category.id)}
                    className={`p-3 rounded-xl border-2 text-left transition-colors ${
                      formData.categories.includes(category.id)
                        ? 'border-bazari-red bg-bazari-red-50 text-bazari-red'
                        : 'border-sand-200 hover:border-sand-300'
                    }`}
                  >
                    <div className="font-medium text-sm">{category.name}</div>
                    {category.digital && (
                      <Badge variant="secondary" size="sm" className="mt-1">
                        Digital
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
              {formData.categories.length === 0 && (
                <p className="text-red-500 text-sm mt-2">
                  Selecione pelo menos uma categoria
                </p>
              )}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Rua"
                placeholder="Rua das Flores, 123"
                value={formData.address.street}
                onChange={(e) => setFormData({
                  ...formData,
                  address: { ...formData.address, street: e.target.value }
                })}
              />
              
              <Input
                label="Cidade"
                placeholder="São Paulo"
                value={formData.address.city}
                onChange={(e) => setFormData({
                  ...formData,
                  address: { ...formData.address, city: e.target.value }
                })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Estado"
                placeholder="SP"
                value={formData.address.state}
                onChange={(e) => setFormData({
                  ...formData,
                  address: { ...formData.address, state: e.target.value }
                })}
              />
              
              <Input
                label="País"
                value={formData.address.country}
                onChange={(e) => setFormData({
                  ...formData,
                  address: { ...formData.address, country: e.target.value }
                })}
              />
              
              <Input
                label="CEP"
                placeholder="01234-567"
                value={formData.address.zipCode}
                onChange={(e) => setFormData({
                  ...formData,
                  address: { ...formData.address, zipCode: e.target.value }
                })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Telefone"
                placeholder="(11) 99999-9999"
                value={formData.contact.phone}
                onChange={(e) => setFormData({
                  ...formData,
                  contact: { ...formData.contact, phone: e.target.value }
                })}
              />
              
              <Input
                label="Email"
                type="email"
                placeholder="contato@empresa.com"
                value={formData.contact.email}
                onChange={(e) => setFormData({
                  ...formData,
                  contact: { ...formData.contact, email: e.target.value }
                })}
              />
            </div>

            <Input
              label="Website"
              placeholder="https://meusite.com"
              value={formData.contact.website}
              onChange={(e) => setFormData({
                ...formData,
                contact: { ...formData.contact, website: e.target.value }
              })}
            />
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-matte-black-900 mb-3">
                Métodos de Entrega
              </label>
              <div className="space-y-2">
                {deliveryOptions.map((method) => (
                  <label key={method} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.settings.deliveryMethods.includes(method)}
                      onChange={() => handleDeliveryMethodToggle(method)}
                      className="w-4 h-4 text-bazari-red border-sand-300 rounded focus:ring-bazari-red-500"
                    />
                    <span className="ml-2 text-sm text-matte-black-700">{method}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Valor Mínimo do Pedido"
                type="number"
                placeholder="0"
                value={formData.settings.minOrderValue}
                onChange={(e) => setFormData({
                  ...formData,
                  settings: { ...formData.settings, minOrderValue: Number(e.target.value) }
                })}
              />
              
              <Input
                label="Valor Máximo do Pedido"
                type="number"
                placeholder="0"
                value={formData.settings.maxOrderValue}
                onChange={(e) => setFormData({
                  ...formData,
                  settings: { ...formData.settings, maxOrderValue: Number(e.target.value) }
                })}
              />
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.settings.autoAcceptOrders}
                  onChange={(e) => setFormData({
                    ...formData,
                    settings: { ...formData.settings, autoAcceptOrders: e.target.checked }
                  })}
                  className="w-4 h-4 text-bazari-red border-sand-300 rounded focus:ring-bazari-red-500"
                />
                <span className="ml-2 text-sm text-matte-black-700">
                  Aceitar pedidos automaticamente
                </span>
              </label>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.tokenizable}
                  onChange={(e) => setFormData({ ...formData, tokenizable: e.target.checked })}
                  className="w-4 h-4 text-bazari-red border-sand-300 rounded focus:ring-bazari-red-500"
                />
                <span className="ml-2 text-sm text-matte-black-700">
                  Habilitar tokenização do empreendimento
                </span>
              </label>
              <p className="text-xs text-matte-black-500 mt-1 ml-6">
                Permite criar tokens representando participação no empreendimento
              </p>
            </div>

            {formData.tokenizable && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Supply Total de Tokens"
                    type="number"
                    value={formData.tokenization.totalSupply}
                    onChange={(e) => setFormData({
                      ...formData,
                      tokenization: { ...formData.tokenization, totalSupply: Number(e.target.value) }
                    })}
                  />
                  
                  <Input
                    label="Percentual de Royalty (%)"
                    type="number"
                    value={formData.tokenization.royaltyPercentage}
                    onChange={(e) => setFormData({
                      ...formData,
                      tokenization: { ...formData.tokenization, royaltyPercentage: Number(e.target.value) }
                    })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Preço do Mint"
                    type="number"
                    value={formData.tokenization.mintPrice}
                    onChange={(e) => setFormData({
                      ...formData,
                      tokenization: { ...formData.tokenization, mintPrice: Number(e.target.value) }
                    })}
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-matte-black-700 mb-1">
                      Moeda do Mint
                    </label>
                    <select
                      value={formData.tokenization.mintCurrency}
                      onChange={(e) => setFormData({
                        ...formData,
                        tokenization: { ...formData.tokenization, mintCurrency: e.target.value as 'BZR' | 'BRL' }
                      })}
                      className="w-full px-3 py-2 border border-sand-200 rounded-lg focus:ring-2 focus:ring-bazari-red-500 focus:border-transparent"
                    >
                      <option value="BZR">Bazari (BZR)</option>
                      <option value="BRL">Real (BRL)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.tokenization.transferable}
                      onChange={(e) => setFormData({
                        ...formData,
                        tokenization: { ...formData.tokenization, transferable: e.target.checked }
                      })}
                      className="w-4 h-4 text-bazari-red border-sand-300 rounded focus:ring-bazari-red-500"
                    />
                    <span className="ml-2 text-sm text-matte-black-700">
                      Tokens transferíveis
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-sand-50 p-6 rounded-lg">
              <h3 className="font-semibold text-matte-black-900 mb-4">
                Resumo do Empreendimento
              </h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium">Nome:</span> {formData.name}
                </div>
                <div>
                  <span className="font-medium">Descrição:</span> {formData.description}
                </div>
                <div>
                  <span className="font-medium">Categorias:</span> {formData.categories.length} selecionadas
                </div>
                <div>
                  <span className="font-medium">Tokenizável:</span> {formData.tokenizable ? 'Sim' : 'Não'}
                </div>
                <div>
                  <span className="font-medium">Métodos de Entrega:</span> {formData.settings.deliveryMethods.length} selecionados
                </div>
              </div>
            </div>

            {returnToMarketplace && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center">
                  <Coins className="text-blue-600 mr-2" size={20} />
                  <div>
                    <p className="font-medium text-blue-900">
                      Retornando ao Marketplace
                    </p>
                    <p className="text-sm text-blue-700">
                      Após criar o empreendimento, você será redirecionado para continuar criando seu anúncio.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-matte-black-900 mb-2">
          Criar Empreendimento
        </h1>
        <p className="text-matte-black-600">
          Configure seu empreendimento para começar a vender
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Progress Steps */}
        <div className="lg:col-span-1">
          <div className="space-y-4">
            {steps.map((step) => (
              <div key={step.id} className="flex items-start">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === step.id
                    ? 'bg-bazari-red text-white'
                    : currentStep > step.id
                    ? 'bg-success text-white'
                    : 'bg-sand-200 text-matte-black-600'
                }`}>
                  {currentStep > step.id ? (
                    <Check size={16} />
                  ) : (
                    step.id
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    currentStep === step.id ? 'text-bazari-red' : 'text-matte-black-900'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-matte-black-600">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="lg:col-span-3">
          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-matte-black-900 mb-2">
                {steps[currentStep - 1].title}
              </h2>
              <p className="text-matte-black-600">
                {steps[currentStep - 1].description}
              </p>
            </div>

            {renderStepContent()}

            <div className="flex justify-between mt-8 pt-6 border-t border-sand-200">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                Anterior
              </Button>

              <div className="flex space-x-3">
                {currentStep < 5 ? (
                  <Button
                    onClick={nextStep}
                    disabled={!canProceed()}
                  >
                    Próximo
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={!canProceed() || isLoading}
                    loading={isLoading}
                  >
                    Criar Empreendimento
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}