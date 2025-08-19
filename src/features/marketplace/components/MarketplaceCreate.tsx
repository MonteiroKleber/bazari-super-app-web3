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
    isLoading: loadingEnterprises, 
    fetchEnterprises,
    fetchEnterpriseById,
    addOrMerge
  } = useEnterpriseStore()
  const { user } = useAuthStore()
  
  // ✅ Estados para controle de inicialização
  const [initializing, setInitializing] = React.useState(true)
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

  // ✅ Normalização de tipos e filtro por owner
  const currentUserId = String(user?.id || '')
  const myEnterprises = enterprises.filter(e => {
    const enterpriseOwnerId = String(e.ownerId || '')
    return enterpriseOwnerId === currentUserId
  })

  // ✅ Inicialização robusta conforme especificado no documento
  React.useEffect(() => {
    const initializeComponent = async () => {
      if (!user?.id) {
        setInitializing(false)
        return
      }

      try {
        setErrorEnterprises(null)
        
        // 1. Ler enterpriseId da URL
        const queryEnterpriseId = searchParams.get('enterpriseId')
        
        // 2. Carregar empreendimentos se ainda não carregou
        if (enterprises.length === 0) {
          await fetchEnterprises()
        }
        
        // 3. Se há enterpriseId na URL, garantir que está no store
        if (queryEnterpriseId) {
          let targetEnterprise = enterprises.find(e => e.id === queryEnterpriseId)
          
          // Se não está no store, buscar por ID
          if (!targetEnterprise) {
            targetEnterprise = await fetchEnterpriseById(queryEnterpriseId)
          }
          
          // 4. Validação de posse + normalização
          if (targetEnterprise) {
            const belongs = targetEnterprise.ownerId && String(targetEnterprise.ownerId) === currentUserId
            
            if (belongs) {
              // ✅ Pré-selecionar se pertence ao usuário
              setSelectedEnterpriseId(targetEnterprise.id)
            } else {
              // ❌ Não pertence ao usuário
              toast.error(t('marketplace.enterprise_not_owned') || 'Este empreendimento não pertence a você')
              // Não pré-seleciona, mas continua o fluxo normal
            }
          }
          // Se não encontrou o empreendimento, apenas continua sem pré-seleção
        }
        
      } catch (error) {
        setErrorEnterprises('Erro ao carregar empreendimentos')
        console.error('Error initializing MarketplaceCreate:', error)
      } finally {
        // ✅ Só termina a inicialização quando todo o processo está completo
        setInitializing(false)
      }
    }

    initializeComponent()
  }, [user?.id, searchParams, fetchEnterprises, fetchEnterpriseById, currentUserId, t, enterprises.length])

  // ✅ Gate correto (sem piscar EmptyState)
  if (loadingEnterprises || initializing) {
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
            <Button onClick={() => {
              setErrorEnterprises(null)
              setInitializing(true)
              fetchEnterprises().finally(() => setInitializing(false))
            }}>
              Tentar novamente
            </Button>
          }
        />
      </div>
    )
  }

  // ✅ Gate principal: só mostra EmptyState se não há empreendimentos E não há selecionado
  const hasMine = myEnterprises.length > 0
  const hasSelected = Boolean(selectedEnterpriseId)

  if (!hasMine && !hasSelected) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <EmptyState
          title={t('marketplace.no_enterprise_title') || 'Nenhum empreendimento encontrado'}
          description={t('marketplace.no_enterprise_desc') || 'Você precisa ter pelo menos um empreendimento para criar anúncios.'}
          action={
            <Button 
              onClick={() => navigate('/marketplace/enterprises/create?returnTo=marketplace-create')}
              size="lg"
            >
              {t('marketplace.create_enterprise_cta') || 'Criar Primeiro Empreendimento'}
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

  // ✅ Payload com enterpriseId conforme especificado
  const handleSubmit = async () => {
    // Validações obrigatórias
    if (!formData.title || !formData.description || !formData.price || !formData.category) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    // ✅ Validação do empreendimento (obrigatório)
    if (!selectedEnterpriseId) {
      toast.error(t('marketplace.enterprise_required') || 'Selecione um empreendimento')
      return
    }

    if (formData.delivery.methods.length === 0) {
      toast.error('Selecione pelo menos um método de entrega')
      return
    }

    setIsSubmitting(true)
    
    try {
      const selectedEnterprise = myEnterprises.find(e => e.id === selectedEnterpriseId)
      
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
        enterpriseId: selectedEnterpriseId, // ✅ OBRIGATÓRIO: enterpriseId no payload
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
      console.error('Error creating listing:', error)
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
              {t('marketplace.enterprise_label') || 'Empreendimento'} <span className="text-red-500 ml-1">*</span>
            </h2>
            
            <div className="space-y-3">
              {/* ✅ Select controlado com value do selectedEnterpriseId */}
              <select
                value={selectedEnterpriseId || ''}
                onChange={(e) => setSelectedEnterpriseId(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-bazari-red-500 focus:border-transparent ${
                  !selectedEnterpriseId ? 'border-red-300' : 'border-sand-200'
                }`}
                required
              >
                <option value="">Selecione um empreendimento</option>
                {myEnterprises.map((enterprise) => (
                  <option key={enterprise.id} value={enterprise.id}>
                    {enterprise.name}
                  </option>
                ))}
              </select>
              
              {!selectedEnterpriseId && (
                <p className="text-red-500 text-sm">
                  É obrigatório selecionar um empreendimento para criar anúncios
                </p>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/marketplace/enterprises/create?returnTo=marketplace-create')}
              >
                <Plus className="mr-2" size={16} />
                Criar Novo Empreendimento
              </Button>
            </div>
          </Card>

          {/* Informações Básicas */}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Preço"
                  type="number"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
                
                <div>
                  <label className="block text-sm font-medium text-matte-black-700 mb-1">
                    Moeda
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value as 'BZR' | 'BRL' })}
                    className="w-full px-3 py-2 border border-sand-200 rounded-lg focus:ring-2 focus:ring-bazari-red-500 focus:border-transparent"
                  >
                    <option value="BRL">BRL (Real)</option>
                    <option value="BZR">BZR (Bazari)</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Categorias */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-matte-black-900 mb-4">
              Categorização
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-matte-black-700 mb-1">
                  Categoria <span className="text-red-500">*</span>
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
                      {category.name.pt}
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
                        {subcategory.name.pt}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedSubcategory?.subcategories && (
                <div>
                  <label className="block text-sm font-medium text-matte-black-700 mb-1">
                    Subsubcategoria
                  </label>
                  <select
                    value={formData.subsubcategory}
                    onChange={(e) => handleCategoryChange(3, e.target.value)}
                    className="w-full px-3 py-2 border border-sand-200 rounded-lg focus:ring-2 focus:ring-bazari-red-500 focus:border-transparent"
                  >
                    <option value="">Selecione uma subsubcategoria</option>
                    {selectedSubcategory.subcategories.map((subsubcategory) => (
                      <option key={subsubcategory.id} value={subsubcategory.id}>
                        {subsubcategory.name.pt}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedSubsubcategory?.subcategories && (
                <div>
                  <label className="block text-sm font-medium text-matte-black-700 mb-1">
                    Categoria Específica
                  </label>
                  <select
                    value={formData.subsubsubcategory}
                    onChange={(e) => handleCategoryChange(4, e.target.value)}
                    className="w-full px-3 py-2 border border-sand-200 rounded-lg focus:ring-2 focus:ring-bazari-red-500 focus:border-transparent"
                  >
                    <option value="">Selecione uma categoria específica</option>
                    {selectedSubsubcategory.subcategories.map((subsubsubcategory) => (
                      <option key={subsubsubcategory.id} value={subsubsubcategory.id}>
                        {subsubsubcategory.name.pt}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {isDigitalCategory && (
                <div className="border-t pt-4">
                  <Badge variant="secondary" className="mb-3">
                    Produto Digital
                  </Badge>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-matte-black-700 mb-1">
                        Tipo de produto digital
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
                      label="Instruções de entrega digital"
                      placeholder="Como o cliente receberá o produto após a compra..."
                      rows={3}
                      value={formData.deliveryInstructions}
                      onChange={(e) => setFormData({ ...formData, deliveryInstructions: e.target.value })}
                    />
                  </div>
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
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Imagem ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                
                {images.length < 8 && (
                  <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-sand-300 rounded-lg cursor-pointer hover:border-bazari-red transition-colors">
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
              
              <p className="text-sm text-matte-black-600">
                Adicione até 8 imagens. A primeira será a imagem principal.
              </p>
            </div>
          </Card>

          {/* Entrega */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-matte-black-900 mb-4">
              Métodos de Entrega <span className="text-red-500">*</span>
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {deliveryMethods.map((method) => (
                  <label key={method} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.delivery.methods.includes(method)}
                      onChange={() => handleDeliveryMethodToggle(method)}
                      className="text-bazari-red focus:ring-bazari-red"
                    />
                    <span className="text-sm">{method}</span>
                  </label>
                ))}
              </div>
              
              {formData.delivery.methods.length === 0 && (
                <p className="text-red-500 text-sm">
                  Selecione pelo menos um método de entrega
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Prazo de entrega (dias)"
                  type="number"
                  placeholder="0"
                  value={formData.delivery.estimatedDays}
                  onChange={(e) => setFormData({
                    ...formData,
                    delivery: { ...formData.delivery, estimatedDays: parseInt(e.target.value) || 0 }
                  })}
                />
                
                <Input
                  label="Custo de envio"
                  type="number"
                  placeholder="0.00"
                  value={formData.delivery.shippingCost}
                  onChange={(e) => setFormData({
                    ...formData,
                    delivery: { ...formData.delivery, shippingCost: parseFloat(e.target.value) || 0 }
                  })}
                />
              </div>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.delivery.freeShipping}
                  onChange={(e) => setFormData({
                    ...formData,
                    delivery: { ...formData.delivery, freeShipping: e.target.checked }
                  })}
                  className="text-bazari-red focus:ring-bazari-red"
                />
                <span className="text-sm">Frete grátis</span>
              </label>
            </div>
          </Card>

          {/* Opções Avançadas */}
          {showAdvancedOptions && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-matte-black-900 mb-4">
                Opções Avançadas
              </h2>
              
              <div className="space-y-4">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Marca"
                    placeholder="Ex: Apple, Samsung..."
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  />
                  
                  <Input
                    label="Modelo"
                    placeholder="Ex: iPhone 15 Pro Max"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  />
                </div>

                <Input
                  label="Garantia"
                  placeholder="Ex: 12 meses de garantia"
                  value={formData.warranty}
                  onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                />

                {isTokenizableCategory && (
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium flex items-center">
                          <Coins className="mr-2" size={20} />
                          Produto Tokenizável
                        </h3>
                        <p className="text-sm text-matte-black-600">
                          Permitir que investidores comprem tokens deste produto
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.tokenizable}
                        onChange={(e) => setFormData({ ...formData, tokenizable: e.target.checked })}
                        className="toggle"
                      />
                    </div>

                    {formData.tokenizable && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            label="Quantidade de tokens"
                            type="number"
                            placeholder="1"
                            value={formData.tokenization.quantity}
                            onChange={(e) => setFormData({
                              ...formData,
                              tokenization: { ...formData.tokenization, quantity: parseInt(e.target.value) || 1 }
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

                        <Input
                          label="Duração da venda (dias)"
                          type="number"
                          placeholder="30"
                          value={formData.tokenization.sellDuration}
                          onChange={(e) => setFormData({
                            ...formData,
                            tokenization: { ...formData.tokenization, sellDuration: parseInt(e.target.value) || 30 }
                          })}
                        />

                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.tokenization.transferable}
                            onChange={(e) => setFormData({
                              ...formData,
                              tokenization: { ...formData.tokenization, transferable: e.target.checked }
                            })}
                            className="text-bazari-red focus:ring-bazari-red"
                          />
                          <span className="text-sm">Tokens transferíveis</span>
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-matte-black-900 mb-4">
              Resumo
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-matte-black-600">Empreendimento:</span>
                <span className={`font-medium ${selectedEnterpriseId ? 'text-green-600' : 'text-red-500'}`}>
                  {selectedEnterpriseId 
                    ? myEnterprises.find(e => e.id === selectedEnterpriseId)?.name 
                    : 'Não selecionado'
                  }
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-matte-black-600">Categoria:</span>
                <span className="font-medium">
                  {formData.category ? selectedCategory?.name.pt : 'Não selecionada'}
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
            {/* ✅ Submit bloqueado se !selectedEnterpriseId */}
            <Button
              onClick={handleSubmit}
              disabled={
                isSubmitting || 
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