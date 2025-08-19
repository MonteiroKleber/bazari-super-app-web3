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
  const { createEnterprise, addOrMerge } = useEnterpriseStore() // ✅ Adicionado addOrMerge
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

  // ✅ CORRIGIDO: Fluxo conforme especificado no documento
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

      // ✅ 1. Criar o empreendimento e obter o ID
      const enterpriseId = await createEnterprise(enterpriseData)
      
      // ✅ 2. O createEnterprise já faz addOrMerge internamente,
      // mas garantimos que o store está atualizado antes de navegar
      
      // ✅ 3. Só navegar APÓS o store estar atualizado
      toast.success('Empreendimento criado com sucesso!')
      
      if (returnToMarketplace) {
        // ✅ CORREÇÃO: Navegar com enterpriseId para pré-seleção
        navigate(`/marketplace/create?enterpriseId=${enterpriseId}`)
      } else {
        navigate(`/marketplace/enterprises/${enterpriseId}`)
      }
    } catch (error) {
      toast.error('Erro ao criar empreendimento')
      console.error('Error creating enterprise:', error)
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
                    <div className="font-medium text-sm">{category.name.pt}</div>
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
                placeholder="12345-678"
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
              placeholder="https://www.empresa.com"
              value={formData.contact.website}
              onChange={(e) => setFormData({
                ...formData,
                contact: { ...formData.contact, website: e.target.value }
              })}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              
              <Input
                label="Facebook"
                placeholder="empresa"
                value={formData.contact.socialMedia.facebook}
                onChange={(e) => setFormData({
                  ...formData,
                  contact: {
                    ...formData.contact,
                    socialMedia: { ...formData.contact.socialMedia, facebook: e.target.value }
                  }
                })}
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Auto-aceitar pedidos</h3>
                <p className="text-sm text-matte-black-600">
                  Aceitar automaticamente pedidos sem revisão manual
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.settings.autoAcceptOrders}
                onChange={(e) => setFormData({
                  ...formData,
                  settings: { ...formData.settings, autoAcceptOrders: e.target.checked }
                })}
                className="toggle"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Valor mínimo do pedido"
                type="number"
                placeholder="0"
                value={formData.settings.minOrderValue}
                onChange={(e) => setFormData({
                  ...formData,
                  settings: { ...formData.settings, minOrderValue: parseFloat(e.target.value) || 0 }
                })}
              />
              
              <Input
                label="Valor máximo do pedido"
                type="number"
                placeholder="0 (sem limite)"
                value={formData.settings.maxOrderValue}
                onChange={(e) => setFormData({
                  ...formData,
                  settings: { ...formData.settings, maxOrderValue: parseFloat(e.target.value) || 0 }
                })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-matte-black-900 mb-3">
                Moedas aceitas
              </label>
              <div className="flex gap-4">
                {['BZR', 'BRL'].map((currency) => (
                  <label key={currency} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.settings.acceptedCurrencies.includes(currency as any)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            settings: {
                              ...formData.settings,
                              acceptedCurrencies: [...formData.settings.acceptedCurrencies, currency as any]
                            }
                          })
                        } else {
                          setFormData({
                            ...formData,
                            settings: {
                              ...formData.settings,
                              acceptedCurrencies: formData.settings.acceptedCurrencies.filter(c => c !== currency)
                            }
                          })
                        }
                      }}
                      className="mr-2"
                    />
                    {currency}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-matte-black-900 mb-3">
                Métodos de entrega
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {deliveryOptions.map((method) => (
                  <label key={method} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.settings.deliveryMethods.includes(method)}
                      onChange={() => handleDeliveryMethodToggle(method)}
                      className="mr-2"
                    />
                    {method}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium flex items-center">
                  <Coins className="mr-2" size={20} />
                  Empreendimento Tokenizável
                </h3>
                <p className="text-sm text-matte-black-600">
                  Permitir que investidores comprem tokens do seu empreendimento
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.tokenizable}
                onChange={(e) => setFormData({
                  ...formData,
                  tokenizable: e.target.checked,
                  tokenization: e.target.checked ? formData.tokenization : {
                    enabled: false,
                    totalSupply: 10000,
                    royaltyPercentage: 5,
                    transferable: true,
                    mintPrice: 100,
                    mintCurrency: 'BZR' as 'BZR' | 'BRL'
                  }
                })}
                className="toggle"
              />
            </div>

            {formData.tokenizable && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4 border-t pt-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Supply total de tokens"
                    type="number"
                    placeholder="10000"
                    value={formData.tokenization.totalSupply}
                    onChange={(e) => setFormData({
                      ...formData,
                      tokenization: { ...formData.tokenization, totalSupply: parseInt(e.target.value) || 10000 }
                    })}
                  />
                  
                  <Input
                    label="% de royalty"
                    type="number"
                    placeholder="5"
                    min="0"
                    max="100"
                    value={formData.tokenization.royaltyPercentage}
                    onChange={(e) => setFormData({
                      ...formData,
                      tokenization: { ...formData.tokenization, royaltyPercentage: parseInt(e.target.value) || 5 }
                    })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Preço por token"
                    type="number"
                    placeholder="100"
                    value={formData.tokenization.mintPrice}
                    onChange={(e) => setFormData({
                      ...formData,
                      tokenization: { ...formData.tokenization, mintPrice: parseInt(e.target.value) || 100 }
                    })}
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-matte-black-900 mb-1">
                      Moeda do token
                    </label>
                    <select
                      value={formData.tokenization.mintCurrency}
                      onChange={(e) => setFormData({
                        ...formData,
                        tokenization: { ...formData.tokenization, mintCurrency: e.target.value as 'BZR' | 'BRL' }
                      })}
                      className="w-full px-3 py-2 border border-sand-200 rounded-lg"
                    >
                      <option value="BZR">BZR</option>
                      <option value="BRL">BRL</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Tokens transferíveis</h4>
                    <p className="text-xs text-matte-black-600">
                      Permitir que investidores transfiram tokens entre si
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.tokenization.transferable}
                    onChange={(e) => setFormData({
                      ...formData,
                      tokenization: { ...formData.tokenization, transferable: e.target.checked }
                    })}
                    className="toggle"
                  />
                </div>
              </motion.div>
            )}
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">Revisão dos dados</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-matte-black-600">Nome:</span>
                <span className="font-medium">{formData.name}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-matte-black-600">Categorias:</span>
                <span className="font-medium">{formData.categories.length} selecionadas</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-matte-black-600">Endereço:</span>
                <span className="font-medium">
                  {formData.address.street ? 'Preenchido' : 'Não informado'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-matte-black-600">Contato:</span>
                <span className="font-medium">
                  {formData.contact.email || formData.contact.phone ? 'Preenchido' : 'Não informado'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-matte-black-600">Tokenizável:</span>
                <span className="font-medium">{formData.tokenizable ? 'Sim' : 'Não'}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-matte-black-600">Métodos de entrega:</span>
                <span className="font-medium">{formData.settings.deliveryMethods.length}</span>
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
          Configure seu empreendimento no marketplace
        </p>
      </motion.div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === step.id 
                  ? 'bg-bazari-red text-white' 
                  : currentStep > step.id 
                    ? 'bg-green-500 text-white' 
                    : 'bg-sand-200 text-matte-black-600'
              }`}>
                {currentStep > step.id ? <Check size={16} /> : step.id}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-full h-1 mx-4 ${
                  currentStep > step.id ? 'bg-green-500' : 'bg-sand-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="mt-4">
          <h2 className="text-lg font-semibold">{steps[currentStep - 1].title}</h2>
          <p className="text-sm text-matte-black-600">{steps[currentStep - 1].description}</p>
        </div>
      </div>

      <Card className="p-8">
        {renderStepContent()}

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            Anterior
          </Button>
          
          <div className="space-x-3">
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
                loading={isLoading}
                disabled={!canProceed()}
              >
                Criar Empreendimento
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}