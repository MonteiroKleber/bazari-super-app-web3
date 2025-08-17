// src/pages/marketplace/enterprise/EnterpriseCreate.tsx

import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
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
  const { t } = useI18n()
  const { createEnterprise } = useEnterpriseStore()
  const { user } = useAuthStore()
  
  const [currentStep, setCurrentStep] = React.useState(1)
  const [isLoading, setIsLoading] = React.useState(false)
  
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
      navigate(`/marketplace/enterprises/${enterpriseId}`)
    } catch (error) {
      toast.error('Erro ao criar empreendimento')
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep = () => {
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
                        : 'border-sand-200 hover:border-sand-300 text-matte-black-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {category.name.pt}
                      </span>
                      {formData.categories.includes(category.id) && (
                        <Check size={16} className="text-bazari-red" />
                      )}
                    </div>
                    {category.digital && (
                      <Badge variant="secondary" size="sm" className="mt-1">
                        Digital
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-matte-black-900 mb-4">
                Endereço (Opcional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Rua e Número"
                  placeholder="Ex: Rua das Flores, 123"
                  value={formData.address.street}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address, street: e.target.value }
                  })}
                />
                
                <Input
                  label="CEP"
                  placeholder="Ex: 01234-567"
                  value={formData.address.zipCode}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address, zipCode: e.target.value }
                  })}
                />
                
                <Input
                  label="Cidade"
                  placeholder="Ex: São Paulo"
                  value={formData.address.city}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address, city: e.target.value }
                  })}
                />
                
                <Input
                  label="Estado"
                  placeholder="Ex: SP"
                  value={formData.address.state}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address, state: e.target.value }
                  })}
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-matte-black-900 mb-4">
                Informações de Contato
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="E-mail"
                  type="email"
                  placeholder="contato@empresa.com"
                  value={formData.contact.email}
                  onChange={(e) => setFormData({
                    ...formData,
                    contact: { ...formData.contact, email: e.target.value }
                  })}
                />
                
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
                  label="Website"
                  placeholder="https://empresa.com"
                  value={formData.contact.website}
                  onChange={(e) => setFormData({
                    ...formData,
                    contact: { ...formData.contact, website: e.target.value }
                  })}
                />
                
                <Input
                  label="Instagram"
                  placeholder="@empresa"
                  value={formData.contact.socialMedia.instagram}
                  onChange={(e) => setFormData({
                    ...formData,
                    contact: {
                      ...formData.contact,
                      socialMedia: { ...formData.contact.socialMedia, instagram: e.target.value }
                    }
                  })}
                />
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-matte-black-900 mb-4">
                Configurações de Pedidos
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="autoAccept"
                    checked={formData.settings.autoAcceptOrders}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: { ...formData.settings, autoAcceptOrders: e.target.checked }
                    })}
                    className="w-4 h-4 text-bazari-red border-gray-300 rounded focus:ring-bazari-red"
                  />
                  <label htmlFor="autoAccept" className="text-sm text-matte-black-700">
                    Aceitar pedidos automaticamente
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Valor Mínimo de Pedido"
                    type="number"
                    placeholder="0"
                    value={formData.settings.minOrderValue || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: { ...formData.settings, minOrderValue: parseFloat(e.target.value) || 0 }
                    })}
                  />
                  
                  <Input
                    label="Valor Máximo de Pedido"
                    type="number"
                    placeholder="0 (ilimitado)"
                    value={formData.settings.maxOrderValue || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: { ...formData.settings, maxOrderValue: parseFloat(e.target.value) || 0 }
                    })}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-matte-black-900 mb-4">
                Métodos de Entrega
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {deliveryOptions.map((method) => (
                  <button
                    key={method}
                    onClick={() => handleDeliveryMethodToggle(method)}
                    className={`p-3 rounded-xl border-2 text-left transition-colors ${
                      formData.settings.deliveryMethods.includes(method)
                        ? 'border-bazari-red bg-bazari-red-50 text-bazari-red'
                        : 'border-sand-200 hover:border-sand-300 text-matte-black-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{method}</span>
                      {formData.settings.deliveryMethods.includes(method) && (
                        <Check size={16} className="text-bazari-red" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-bazari-gold-50 p-6 rounded-xl border border-bazari-gold-200">
              <div className="flex items-center mb-4">
                <Coins className="text-bazari-gold-600 mr-3" size={24} />
                <h3 className="text-lg font-semibold text-matte-black-900">
                  Tokenização do Empreendimento
                </h3>
              </div>
              <p className="text-sm text-matte-black-700 mb-4">
                Transforme seu empreendimento em tokens negociáveis, permitindo que investidores 
                participem do crescimento do seu negócio.
              </p>
              
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="tokenizable"
                  checked={formData.tokenizable}
                  onChange={(e) => setFormData({ ...formData, tokenizable: e.target.checked })}
                  className="w-4 h-4 text-bazari-red border-gray-300 rounded focus:ring-bazari-red"
                />
                <label htmlFor="tokenizable" className="text-sm font-medium text-matte-black-900">
                  Habilitar tokenização para este empreendimento
                </label>
              </div>
            </div>

            {formData.tokenizable && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Total de Tokens"
                    type="number"
                    value={formData.tokenization.totalSupply}
                    onChange={(e) => setFormData({
                      ...formData,
                      tokenization: { ...formData.tokenization, totalSupply: parseInt(e.target.value) || 10000 }
                    })}
                  />
                  
                  <Input
                    label="Royalty (%)"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.tokenization.royaltyPercentage}
                    onChange={(e) => setFormData({
                      ...formData,
                      tokenization: { ...formData.tokenization, royaltyPercentage: parseFloat(e.target.value) || 5 }
                    })}
                  />
                  
                  <Input
                    label="Preço por Token"
                    type="number"
                    value={formData.tokenization.mintPrice}
                    onChange={(e) => setFormData({
                      ...formData,
                      tokenization: { ...formData.tokenization, mintPrice: parseFloat(e.target.value) || 100 }
                    })}
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-matte-black-900 mb-2">
                      Moeda do Token
                    </label>
                    <select
                      value={formData.tokenization.mintCurrency}
                      onChange={(e) => setFormData({
                        ...formData,
                        tokenization: { ...formData.tokenization, mintCurrency: e.target.value as 'BZR' | 'BRL' }
                      })}
                      className="w-full px-3 py-2 border border-sand-200 rounded-lg focus:ring-2 focus:ring-bazari-red-500 focus:border-transparent"
                    >
                      <option value="BZR">BZR</option>
                      <option value="BRL">BRL</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="transferable"
                    checked={formData.tokenization.transferable}
                    onChange={(e) => setFormData({
                      ...formData,
                      tokenization: { ...formData.tokenization, transferable: e.target.checked }
                    })}
                    className="w-4 h-4 text-bazari-red border-gray-300 rounded focus:ring-bazari-red"
                  />
                  <label htmlFor="transferable" className="text-sm text-matte-black-700">
                    Permitir transferência entre usuários
                  </label>
                </div>
              </div>
            )}
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-sand-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-matte-black-900 mb-4">
                Revisão Final
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-matte-black-900">Nome:</h4>
                  <p className="text-matte-black-700">{formData.name}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-matte-black-900">Descrição:</h4>
                  <p className="text-matte-black-700">{formData.description}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-matte-black-900">Categorias:</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {formData.categories.map(categoryId => {
                      const category = categories.categories.find(c => c.id === categoryId)
                      return category ? (
                        <Badge key={categoryId} variant="outline" size="sm">
                          {category.name.pt}
                        </Badge>
                      ) : null
                    })}
                  </div>
                </div>
                
                {formData.tokenizable && (
                  <div>
                    <h4 className="font-medium text-matte-black-900">Tokenização:</h4>
                    <p className="text-matte-black-700">
                      {formData.tokenization.totalSupply} tokens a {formData.tokenization.mintPrice} {formData.tokenization.mintCurrency} cada
                    </p>
                  </div>
                )}
              </div>
            </div>
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
          Configure seu negócio na plataforma Bazari
        </p>
      </motion.div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
            >
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step.id
                  ? 'border-bazari-red bg-bazari-red text-white'
                  : 'border-sand-300 bg-white text-matte-black-400'
              }`}>
                {currentStep > step.id ? <Check size={16} /> : step.id}
              </div>
              
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  currentStep > step.id ? 'bg-bazari-red' : 'bg-sand-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-4">
          <h2 className="text-xl font-semibold text-matte-black-900">
            {steps[currentStep - 1].title}
          </h2>
          <p className="text-matte-black-600">
            {steps[currentStep - 1].description}
          </p>
        </div>
      </div>

      {/* Form Content */}
      <Card className="p-8 mb-8">
        {renderStep()}
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : navigate('/marketplace/enterprises')}
        >
          {currentStep > 1 ? 'Anterior' : 'Cancelar'}
        </Button>
        
        <div className="flex space-x-3">
          {currentStep < steps.length ? (
            <Button onClick={() => setCurrentStep(currentStep + 1)}>
              Próximo
            </Button>
          ) : (
            <Button onClick={handleSubmit} loading={isLoading}>
              Criar Empreendimento
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}