// src/features/marketplace/components/MarketplaceCreate.tsx

import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, Upload, X, Package, Building, Coins, Check } from 'lucide-react'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { Input } from '@shared/ui/Input'
import { Textarea } from '@shared/ui/Textarea'
import { Badge } from '@shared/ui/Badge'
import { EmptyState } from '@shared/ui/EmptyState'
import { LoadingSpinner } from '@shared/ui/LoadingSpinner'
import { useI18n } from '@app/providers/I18nProvider'
import { useMarketplaceStore } from '../store/marketplaceStore'
import { useEnterpriseStore } from '../store/enterpriseStore'
import { useAuthStore } from '@features/auth/store/authStore'
import { toast } from '@features/notifications/components/NotificationToastHost'
import categories from '@app/data/categories.json'

export const MarketplaceCreate: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { t } = useI18n()
  const { addListing } = useMarketplaceStore()
  const { 
    enterprises, 
    myEnterprises, 
    isLoading: loadingEnterprises, 
    fetchEnterprises 
  } = useEnterpriseStore()
  const { user } = useAuthStore()
  
  // Estados locais para controle de carregamento e erro
  const [errorEnterprises, setErrorEnterprises] = React.useState<string | null>(null)
  const [selectedEnterpriseId, setSelectedEnterpriseId] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    price: '',
    currency: 'BRL' as 'BZR' | 'BRL',
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
  const [showAdvancedOptions, setShowAdvancedOptions] = React.useState(false)

  // Carregar empreendimentos do usuário
  React.useEffect(() => {
    const loadUserEnterprises = async () => {
      if (!user?.id) return
      
      try {
        setErrorEnterprises(null)
        // Primeiro carrega todos os empreendimentos, depois filtra por ownerId
        await fetchEnterprises()
      } catch (error) {
        setErrorEnterprises('Erro ao carregar empreendimentos')
        console.error('Error loading enterprises:', error)
      }
    }

    loadUserEnterprises()
  }, [user?.id, fetchEnterprises])

  // Filtrar empreendimentos do usuário atual
  const userEnterprises = enterprises.filter(e => e.ownerId === user?.id) || []

  // Tratar querystring enterpriseId
  React.useEffect(() => {
    const enterpriseIdFromQuery = searchParams.get('enterpriseId')
    
    if (enterpriseIdFromQuery && userEnterprises.length > 0) {
      // Verificar se o empreendimento pertence ao usuário
      const enterpriseExists = userEnterprises.find(e => e.id === enterpriseIdFromQuery)
      
      if (enterpriseExists) {
        setSelectedEnterpriseId(enterpriseIdFromQuery)
      } else {
        // Empreendimento não pertence ao usuário
        toast.error(t('marketplace.enterprise_not_owned'))
      }
    }
  }, [searchParams, userEnterprises, t])

  // Estados de loading/erro/empty
  if (loadingEnterprises) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  if (errorEnterprises) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <EmptyState
          title="Erro ao carregar empreendimentos"
          description={errorEnterprises}
          action={
            <Button onClick={() => window.location.reload()}>
              Tentar novamente
            </Button>
          }
        />
      </div>
    )
  }

  // Gate: usuário precisa ter pelo menos 1 empreendimento
  if (userEnterprises.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <EmptyState
          title={t('marketplace.no_enterprise_title')}
          description={t('marketplace.no_enterprise_desc')}
          action={
            <Button 
              onClick={() => navigate('/marketplace/enterprises/create?returnTo=marketplace-create')}
              size="lg"
            >
              {t('marketplace.create_enterprise_cta')}
            </Button>
          }
        />
      </div>
    )
  }

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
    // Validações obrigatórias
    if (!formData.title || !formData.description || !formData.price || !formData.category) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    // Validação do empreendimento (obrigatório)
    if (!selectedEnterpriseId) {
      toast.error(t('marketplace.enterprise_required'))
      return
    }

    if (formData.delivery.methods.length === 0) {
      toast.error('Selecione pelo menos um método de entrega')
      return
    }

    setIsSubmitting(true)
    
    try {
      const selectedEnterprise = userEnterprises.find(e => e.id === selectedEnterpriseId)
      
      const newListing = {
        id: crypto.randomUUID(),
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        currency: formData.currency,
        category: formData.category,
        subcategory: formData.subcategory,
        subsubcategory: formData.subsubcategory,
        subsubsubcategory: formData.subsubsubcategory,
        images,
        sellerId: user!.id,
        sellerName: user!.name,
        sellerRating: user!.reputation.rating,
        enterpriseId: selectedEnterpriseId, // ✅ Incluir enterpriseId no payload
        enterpriseName: selectedEnterprise?.name,
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
      setIsSubmitting(false)
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
          {/* Seleção de Empreendimento - OBRIGATÓRIO */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-matte-black-900 mb-4 flex items-center">
              <Building className="mr-2" size={20} />
              {t('marketplace.enterprise_label')} <span className="text-red-500 ml-1">*</span>
            </h2>
            
            <div className="space-y-3">
              <select
                value={selectedEnterpriseId}
                onChange={(e) => setSelectedEnterpriseId(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-bazari-red-500 focus:border-transparent ${
                  !selectedEnterpriseId ? 'border-red-300' : 'border-sand-200'
                }`}
                required
              >
                <option value="">{t('marketplace.enterprise_placeholder')}</option>
                {userEnterprises.map((enterprise) => (
                  <option key={enterprise.id} value={enterprise.id}>
                    {enterprise.name}
                  </option>
                ))}
              </select>
              
              {!selectedEnterpriseId && (
                <p className="text-red-500 text-sm">
                  {t('marketplace.enterprise_required')}
                </p>
              )}
              
              {selectedEnterpriseId && (
                <div className="flex items-center text-sm text-green-600">
                  <Check size={16} className="mr-1" />
                  Empreendimento selecionado
                </div>
              )}
            </div>
          </Card>

          {/* Informações Básicas */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-matte-black-900 mb-4 flex items-center">
              <Package className="mr-2" size={20} />
              Informações Básicas
            </h2>
            
            <div className="space-y-4">
              <Input
                label="Título do Anúncio *"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: iPhone 15 Pro Max 256GB Novo"
                required
              />
              
              <Textarea
                label="Descrição *"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva seu produto ou serviço em detalhes..."
                rows={4}
                required
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Preço *"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0,00"
                  required
                />
                
                <div>
                  <label className="block text-sm font-medium text-matte-black-700 mb-1">
                    Moeda *
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

          {/* Categoria */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-matte-black-900 mb-4">
              Categoria *
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-matte-black-700 mb-1">
                  Categoria Principal
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleCategoryChange(1, e.target.value)}
                  className="w-full px-3 py-2 border border-sand-200 rounded-lg focus:ring-2 focus:ring-bazari-red-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {}
                    </option>
                  ))}
                </select>
              </div>
              
              {selectedCategory?.subcategories && (
                <div>
                  <label className="block text-sm font-medium text-matte-black-700 mb-1">
                    Subcategoria
                  </label>
                  <select
                    value={formData.subcategory}
                    onChange={(e) => handleCategoryChange(2, e.target.value)}
                    className="w-full px-3 py-2 border border-sand-200 rounded-lg focus:ring-2 focus:ring-bazari-red-500 focus:border-transparent"
                  >
                    <option value="">Selecione uma subcategoria</option>
                    {selectedCategory.subcategories.map((subcategory) => (
                      <option key={subcategory.id} value={subcategory.id}>
                        {subcategory.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </Card>

          {/* Imagens */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-matte-black-900 mb-4">
              Imagens
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative aspect-square bg-sand-100 rounded-lg overflow-hidden">
                    <img
                      src={image}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                
                {images.length < 8 && (
                  <label className="aspect-square bg-sand-100 border-2 border-dashed border-sand-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-bazari-red transition-colors">
                    <Upload size={24} className="text-sand-500 mb-2" />
                    <span className="text-sm text-sand-600">Adicionar</span>
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
              
              <p className="text-sm text-matte-black-600">
                Adicione até 8 imagens. A primeira será a principal.
              </p>
            </div>
          </Card>

          {/* Métodos de Entrega */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-matte-black-900 mb-4">
              Métodos de Entrega *
            </h2>
            
            <div className="space-y-3">
              {deliveryMethods.map((method) => (
                <label key={method} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.delivery.methods.includes(method)}
                    onChange={() => handleDeliveryMethodToggle(method)}
                    className="w-4 h-4 text-bazari-red border-sand-300 rounded focus:ring-bazari-red-500"
                  />
                  <span className="ml-2 text-sm text-matte-black-700">{method}</span>
                </label>
              ))}
            </div>
            
            {formData.delivery.methods.length === 0 && (
              <p className="text-red-500 text-sm mt-2">
                Selecione pelo menos um método de entrega
              </p>
            )}
          </Card>

          {/* Opções Avançadas */}
          {showAdvancedOptions && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-matte-black-900 mb-4">
                Informações Adicionais
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-matte-black-700 mb-1">
                      Condição
                    </label>
                    <select
                      value={formData.condition}
                      onChange={(e) => setFormData({ ...formData, condition: e.target.value as any })}
                      className="w-full px-3 py-2 border border-sand-200 rounded-lg focus:ring-2 focus:ring-bazari-red-500 focus:border-transparent"
                    >
                      <option value="new">Novo</option>
                      <option value="used">Usado</option>
                      <option value="refurbished">Recondicionado</option>
                    </select>
                  </div>
                  
                  <Input
                    label="Marca"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Ex: Apple"
                  />
                  
                  <Input
                    label="Modelo"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="Ex: iPhone 15 Pro Max"
                  />
                </div>
                
                <Input
                  label="Garantia"
                  value={formData.warranty}
                  onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                  placeholder="Ex: 12 meses de garantia"
                />
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold text-matte-black-900 mb-4">Resumo</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-matte-black-600">Empreendimento:</span>
                <span className={`font-medium ${selectedEnterpriseId ? 'text-green-600' : 'text-red-500'}`}>
                  {selectedEnterpriseId 
                    ? userEnterprises.find(e => e.id === selectedEnterpriseId)?.name 
                    : 'Não selecionado'
                  }
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-matte-black-600">Categoria:</span>
                <span className="font-medium">
                  {formData.category ? selectedCategory?.name : 'Não selecionada'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-matte-black-600">Preço:</span>
                <span className="font-medium">
                  {formData.price ? `${formData.currency} ${formData.price}` : '-'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-matte-black-600">Imagens:</span>
                <span className="font-medium">{images.length}/8</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-matte-black-600">Entrega:</span>
                <span className="font-medium">{formData.delivery.methods.length} métodos</span>
              </div>
            </div>
          </Card>

          <div className="space-y-3">
            <Button
              onClick={handleSubmit}
              disabled={
                isSubmitting || 
                loadingEnterprises || 
                !selectedEnterpriseId || 
                !formData.title || 
                !formData.description || 
                !formData.price || 
                !formData.category ||
                formData.delivery.methods.length === 0
              }
              loading={isSubmitting}
              className="w-full"
              size="lg"
            >
              Publicar Anúncio
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="w-full"
            >
              {showAdvancedOptions ? 'Ocultar' : 'Mostrar'} Opções Avançadas
            </Button>
            
            <Button
              variant="ghost"
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