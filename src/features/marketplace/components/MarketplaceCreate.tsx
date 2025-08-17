// src/features/marketplace/components/MarketplaceCreate.tsx

import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Plus, Upload, X, Package, Building, Coins, Check, AlertTriangle } from 'lucide-react'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { Input } from '@shared/ui/Input'
import { Textarea } from '@shared/ui/Textarea'
import { Badge } from '@shared/ui/Badge'
import { useI18n } from '@app/providers/I18nProvider'
import { useMarketplaceStore } from '../store/marketplaceStore'
import { useEnterpriseStore } from '../store/enterpriseStore'
import { useAuthStore } from '@features/auth/store/authStore'
import { toast } from '@features/notifications/components/NotificationToastHost'
import categories from '@app/data/categories.json'

export const MarketplaceCreate: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useI18n()
  const { addListing } = useMarketplaceStore()
  const { myEnterprises } = useEnterpriseStore()
  const { user } = useAuthStore()
  
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    price: '',
    currency: 'BRL' as 'BZR' | 'BRL',
    enterpriseId: '',
    category: '',
    subcategory: '',
    subsubcategory: '',
    subsubsubcategory: '',
    digital: false,
    digitalType: '',
    deliveryInstructions: '',
    tokenizable: false,
    tokenization: {
      enabled: false,
      quantity: 1,
      royaltyPercentage: 5,
      sellDuration: 30,
      transferable: true
    },
    delivery: {
      methods: [] as string[],
      estimatedDays: 0,
      freeShipping: false,
      shippingCost: 0,
      pickupAvailable: false
    },
    condition: 'new' as 'new' | 'used' | 'refurbished',
    brand: '',
    model: '',
    warranty: ''
  })
  
  const [images, setImages] = React.useState<string[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [showAdvancedOptions, setShowAdvancedOptions] = React.useState(false)

  const deliveryMethods = [
    'Retirada no Local',
    'Entrega Rápida (até 2h)',
    'Entrega Municipal (cidade)',
    'Entrega Estadual',
    'Entrega Nacional',
    'Entrega Internacional',
    'Digital/Download'
  ]

  const digitalTypes = [
    { value: 'course', label: 'Curso Online' },
    { value: 'ebook', label: 'E-book' },
    { value: 'software', label: 'Software' },
    { value: 'media', label: 'Mídia Digital' },
    { value: 'template', label: 'Template' },
    { value: 'other', label: 'Outro' }
  ]

  // Get category hierarchy
  const selectedCategory = categories.categories.find(c => c.id === formData.category)
  const selectedSubcategory = selectedCategory?.subcategories?.find(s => s.id === formData.subcategory)
  const selectedSubsubcategory = selectedSubcategory?.subcategories?.find(s => s.id === formData.subsubcategory)
  
  const isDigitalCategory = selectedCategory?.digital
  const isTokenizableCategory = isDigitalCategory || formData.digital

  const handleCategoryChange = (level: number, value: string) => {
    switch (level) {
      case 1:
        setFormData({
          ...formData,
          category: value,
          subcategory: '',
          subsubcategory: '',
          subsubsubcategory: '',
          digital: categories.categories.find(c => c.id === value)?.digital || false
        })
        break
      case 2:
        setFormData({
          ...formData,
          subcategory: value,
          subsubcategory: '',
          subsubsubcategory: ''
        })
        break
      case 3:
        setFormData({
          ...formData,
          subsubcategory: value,
          subsubsubcategory: ''
        })
        break
      case 4:
        setFormData({
          ...formData,
          subsubsubcategory: value
        })
        break
    }
  }

  const handleDeliveryMethodToggle = (method: string) => {
    setFormData(prev => ({
      ...prev,
      delivery: {
        ...prev.delivery,
        methods: prev.delivery.methods.includes(method)
          ? prev.delivery.methods.filter(m => m !== method)
          : [...prev.delivery.methods, method]
      }
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    // Mock image upload - in real app, upload to cloud storage
    const mockUrls = files.map(file => URL.createObjectURL(file))
    setImages(prev => [...prev, ...mockUrls].slice(0, 8)) // Max 8 images
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.price || !formData.category) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    if (!formData.enterpriseId && myEnterprises.length > 0) {
      toast.error('Selecione um empreendimento ou crie um novo')
      return
    }

    if (formData.delivery.methods.length === 0) {
      toast.error('Selecione pelo menos um método de entrega')
      return
    }

    setIsLoading(true)
    
    try {
      const newListing = {
        id: crypto.randomUUID(),
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        currency: formData.currency,
        category: formData.category,
        subcategory: formData.subcategory,
        images,
        sellerId: user!.id,
        sellerName: user!.name,
        sellerRating: user!.reputation.rating,
        enterpriseId: formData.enterpriseId || undefined,
        enterpriseName: formData.enterpriseId 
          ? myEnterprises.find(e => e.id === formData.enterpriseId)?.name 
          : undefined,
        status: 'active' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 0,
        digital: isDigitalCategory || formData.digital ? {
          type: formData.digitalType as any,
          deliveryInstructions: formData.deliveryInstructions,
          tokenizable: formData.tokenizable,
          tokenization: formData.tokenizable ? formData.tokenization : undefined
        } : undefined,
        metadata: {
          condition: formData.condition,
          brand: formData.brand || undefined,
          model: formData.model || undefined,
          warranty: formData.warranty || undefined,
          shipping: {
            free: formData.delivery.freeShipping,
            methods: formData.delivery.methods,
            estimatedDays: formData.delivery.estimatedDays,
            cost: formData.delivery.shippingCost
          }
        }
      }

      addListing(newListing)
      toast.success('Anúncio criado com sucesso!')
      navigate('/marketplace/my-listings')
    } catch (error) {
      toast.error('Erro ao criar anúncio')
    } finally {
      setIsLoading(false)
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
          Criar Anúncio
        </h1>
        <p className="text-matte-black-600">
          Publique seu produto ou serviço no marketplace
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Enterprise Selection */}
          {myEnterprises.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-matte-black-900 mb-4 flex items-center">
                <Building className="mr-2" size={20} />
                Empreendimento
              </h2>
              
              <div className="space-y-3">
                <select
                  value={formData.enterpriseId}
                  onChange={(e) => setFormData({ ...formData, enterpriseId: e.target.value })}
                  className="w-full px-3 py-2 border border-sand-200 rounded-lg focus:ring-2 focus:ring-bazari-red-500 focus:border-transparent"
                >
                  <option value="">Selecione um empreendimento</option>
                  {myEnterprises.map((enterprise) => (
                    <option key={enterprise.id} value={enterprise.id}>
                      {enterprise.name}
                    </option>
                  ))}
                </select>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/marketplace/enterprises/create')}
                >
                  <Plus size={16} className="mr-2" />
                  Criar Novo Empreendimento
                </Button>
              </div>
            </Card>
          )}

          {/* Basic Info */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-matte-black-900 mb-4">
              Informações Básicas
            </h2>
            
            <div className="space-y-4">
              <Input
                label="Título do anúncio"
                placeholder="Ex: iPhone 15 Pro Max 256GB"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              
              <Textarea
                label="Descrição"
                placeholder="Descreva seu produto ou serviço em detalhes..."
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Preço"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
                
                <div>
                  <label className="block text-sm font-medium text-matte-black-900 mb-2">
                    Moeda
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value as 'BZR' | 'BRL' })}
                    className="w-full px-3 py-2 border border-sand-200 rounded-lg focus:ring-2 focus:ring-bazari-red-500 focus:border-transparent"
                  >
                    <option value="BRL">Real (BRL)</option>
                    <option value="BZR">Bazari (BZR)</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Category Selection (4 levels) */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-matte-black-900 mb-4">
              Categoria
            </h2>
            
            <div className="space-y-4">
              {/* Level 1 - Main Categories */}
              <div>
                <label className="block text-sm font-medium text-matte-black-900 mb-2">
                  Categoria Principal *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categories.categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(1, category.id)}
                      className={`p-3 rounded-xl border-2 text-left transition-colors ${
                        formData.category === category.id
                          ? 'border-bazari-red bg-bazari-red-50 text-bazari-red'
                          : 'border-sand-200 hover:border-sand-300 text-matte-black-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {category.name.pt}
                        </span>
                        {formData.category === category.id && (
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

              {/* Level 2 - Subcategories */}
              {selectedCategory?.subcategories && (
                <div>
                  <label className="block text-sm font-medium text-matte-black-900 mb-2">
                    Subcategoria
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {selectedCategory.subcategories.map((subcategory) => (
                      <button
                        key={subcategory.id}
                        onClick={() => handleCategoryChange(2, subcategory.id)}
                        className={`p-2 rounded-lg border text-center transition-colors ${
                          formData.subcategory === subcategory.id
                            ? 'border-bazari-red bg-bazari-red-50 text-bazari-red'
                            : 'border-sand-200 hover:border-sand-300 text-matte-black-700'
                        }`}
                      >
                        <span className="text-sm">{subcategory.name.pt}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Level 3 - Sub-subcategories */}
              {selectedSubcategory?.subcategories && (
                <div>
                  <label className="block text-sm font-medium text-matte-black-900 mb-2">
                    Sub-subcategoria
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {selectedSubcategory.subcategories.map((subsubcategory) => (
                      <button
                        key={subsubcategory.id}
                        onClick={() => handleCategoryChange(3, subsubcategory.id)}
                        className={`p-2 rounded-lg border text-center transition-colors ${
                          formData.subsubcategory === subsubcategory.id
                            ? 'border-bazari-red bg-bazari-red-50 text-bazari-red'
                            : 'border-sand-200 hover:border-sand-300 text-matte-black-700'
                        }`}
                      >
                        <span className="text-sm">{subsubcategory.name.pt}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Level 4 - Sub-sub-subcategories */}
              {selectedSubsubcategory?.subcategories && (
                <div>
                  <label className="block text-sm font-medium text-matte-black-900 mb-2">
                    Categoria Específica
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {selectedSubsubcategory.subcategories.map((subsubsubcategory) => (
                      <button
                        key={subsubsubcategory.id}
                        onClick={() => handleCategoryChange(4, subsubsubcategory.id)}
                        className={`p-2 rounded-lg border text-center transition-colors ${
                          formData.subsubsubcategory === subsubsubcategory.id
                            ? 'border-bazari-red bg-bazari-red-50 text-bazari-red'
                            : 'border-sand-200 hover:border-sand-300 text-matte-black-700'
                        }`}
                      >
                        <span className="text-sm">{subsubsubcategory.name.pt}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Digital Product Options */}
          {(isDigitalCategory || formData.digital) && (
            <Card className="p-6 border-blue-200 bg-blue-50">
              <h2 className="text-xl font-semibold text-matte-black-900 mb-4 flex items-center">
                <Package className="mr-2" size={20} />
                Produto Digital
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-matte-black-900 mb-2">
                    Tipo de Produto Digital
                  </label>
                  <select
                    value={formData.digitalType}
                    onChange={(e) => setFormData({ ...formData, digitalType: e.target.value })}
                    className="w-full px-3 py-2 border border-sand-200 rounded-lg focus:ring-2 focus:ring-bazari-red-500 focus:border-transparent"
                  >
                    <option value="">Selecione o tipo</option>
                    {digitalTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <Textarea
                  label="Instruções de Entrega"
                  placeholder="Como o cliente receberá o produto digital..."
                  rows={3}
                  value={formData.deliveryInstructions}
                  onChange={(e) => setFormData({ ...formData, deliveryInstructions: e.target.value })}
                />

                {/* Tokenization Options */}
                <div className="bg-bazari-gold-50 p-4 rounded-lg border border-bazari-gold-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <input
                      type="checkbox"
                      id="tokenizable"
                      checked={formData.tokenizable}
                      onChange={(e) => setFormData({ ...formData, tokenizable: e.target.checked })}
                      className="w-4 h-4 text-bazari-red border-gray-300 rounded focus:ring-bazari-red"
                    />
                    <label htmlFor="tokenizable" className="font-medium text-matte-black-900">
                      <Coins className="inline mr-1" size={16} />
                      Produto Tokenizável
                    </label>
                  </div>
                  
                  {formData.tokenizable && (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <Input
                        label="Quantidade de Tokens"
                        type="number"
                        min="1"
                        value={formData.tokenization.quantity}
                        onChange={(e) => setFormData({
                          ...formData,
                          tokenization: { ...formData.tokenization, quantity: parseInt(e.target.value) || 1 }
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
                        label="Duração da Venda (dias)"
                        type="number"
                        min="1"
                        value={formData.tokenization.sellDuration}
                        onChange={(e) => setFormData({
                          ...formData,
                          tokenization: { ...formData.tokenization, sellDuration: parseInt(e.target.value) || 30 }
                        })}
                      />
                      
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
                          Permitir transferência
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Delivery Methods */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-matte-black-900 mb-4">
              Métodos de Entrega
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {deliveryMethods.map((method) => (
                  <button
                    key={method}
                    onClick={() => handleDeliveryMethodToggle(method)}
                    className={`p-3 rounded-xl border-2 text-left transition-colors ${
                      formData.delivery.methods.includes(method)
                        ? 'border-bazari-red bg-bazari-red-50 text-bazari-red'
                        : 'border-sand-200 hover:border-sand-300 text-matte-black-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{method}</span>
                      {formData.delivery.methods.includes(method) && (
                        <Check size={16} className="text-bazari-red" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {formData.delivery.methods.length > 0 && !formData.delivery.methods.includes('Digital/Download') && (
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Prazo de Entrega (dias)"
                    type="number"
                    min="0"
                    value={formData.delivery.estimatedDays}
                    onChange={(e) => setFormData({
                      ...formData,
                      delivery: { ...formData.delivery, estimatedDays: parseInt(e.target.value) || 0 }
                    })}
                  />
                  
                  <Input
                    label="Custo de Envio (R$)"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.delivery.shippingCost}
                    onChange={(e) => setFormData({
                      ...formData,
                      delivery: { ...formData.delivery, shippingCost: parseFloat(e.target.value) || 0 }
                    })}
                    disabled={formData.delivery.freeShipping}
                  />
                </div>
              )}

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="freeShipping"
                  checked={formData.delivery.freeShipping}
                  onChange={(e) => setFormData({
                    ...formData,
                    delivery: { ...formData.delivery, freeShipping: e.target.checked, shippingCost: e.target.checked ? 0 : formData.delivery.shippingCost }
                  })}
                  className="w-4 h-4 text-bazari-red border-gray-300 rounded focus:ring-bazari-red"
                />
                <label htmlFor="freeShipping" className="text-sm text-matte-black-700">
                  Frete grátis
                </label>
              </div>
            </div>
          </Card>

          {/* Advanced Options */}
          <Card className="p-6">
            <button
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="flex items-center justify-between w-full text-left"
            >
              <h2 className="text-xl font-semibold text-matte-black-900">
                Opções Avançadas
              </h2>
              <div className={`transform transition-transform ${showAdvancedOptions ? 'rotate-180' : ''}`}>
                ↓
              </div>
            </button>
            
            {showAdvancedOptions && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-matte-black-900 mb-2">
                      Condição
                    </label>
                    <select
                      value={formData.condition}
                      onChange={(e) => setFormData({ ...formData, condition: e.target.value as 'new' | 'used' | 'refurbished' })}
                      className="w-full px-3 py-2 border border-sand-200 rounded-lg focus:ring-2 focus:ring-bazari-red-500 focus:border-transparent"
                    >
                      <option value="new">Novo</option>
                      <option value="used">Usado</option>
                      <option value="refurbished">Recondicionado</option>
                    </select>
                  </div>
                  
                  <Input
                    label="Marca"
                    placeholder="Ex: Apple"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  />
                  
                  <Input
                    label="Modelo"
                    placeholder="Ex: iPhone 15"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  />
                </div>
                
                <Input
                  label="Garantia"
                  placeholder="Ex: 12 meses"
                  value={formData.warranty}
                  onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                />
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Images */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-matte-black-900 mb-4">
              Imagens
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                
                {images.length < 8 && (
                  <label className="w-full h-24 border-2 border-dashed border-sand-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-bazari-red">
                    <Upload size={20} className="text-matte-black-400 mb-1" />
                    <span className="text-xs text-matte-black-600">Adicionar</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              
              <p className="text-xs text-matte-black-500">
                Máximo 8 imagens. Primeira imagem será a capa.
              </p>
            </div>
          </Card>

          {/* Summary */}
          <Card className="p-6 bg-sand-50">
            <h3 className="text-lg font-semibold text-matte-black-900 mb-4">
              Resumo
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-matte-black-600">Preço:</span>
                <span className="font-medium text-matte-black-900">
                  {formData.price ? `${formData.currency} ${formData.price}` : '-'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-matte-black-600">Categoria:</span>
                <span className="font-medium text-matte-black-900">
                  {selectedCategory?.name.pt || '-'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-matte-black-600">Entrega:</span>
                <span className="font-medium text-matte-black-900">
                  {formData.delivery.methods.length} método(s)
                </span>
              </div>
              
              {formData.tokenizable && (
                <div className="flex justify-between">
                  <span className="text-matte-black-600">Tokens:</span>
                  <span className="font-medium text-bazari-gold-600">
                    {formData.tokenization.quantity}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={handleSubmit}
              loading={isLoading}
              disabled={!formData.title || !formData.price || !formData.category}
              className="w-full"
            >
              Publicar Anúncio
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate('/marketplace')}
              className="w-full"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}