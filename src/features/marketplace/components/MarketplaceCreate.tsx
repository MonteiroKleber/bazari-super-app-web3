import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Plus, Upload, X } from 'lucide-react'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { Input } from '@shared/ui/Input'
import { Textarea } from '@shared/ui/Textarea'
import { useI18n } from '@app/providers/I18nProvider'
import { useMarketplaceStore } from '../store/marketplaceStore'
import { useAuthStore } from '@features/auth/store/authStore'
import { toast } from '@features/notifications/components/NotificationToastHost'

export const MarketplaceCreate: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useI18n()
  const { categories, addListing } = useMarketplaceStore()
  const { user } = useAuthStore()
  
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    price: '',
    currency: 'BRL' as 'BZR' | 'BRL',
    category: '',
    subcategory: '',
    digital: false,
    digitalType: '',
    deliveryInstructions: ''
  })
  
  const [images, setImages] = React.useState<string[]>([])
  const [isLoading, setIsLoading] = React.useState(false)

  const selectedCategory = categories.find(c => c.id === formData.category)
  const isDigitalCategory = selectedCategory?.digital

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.price || !formData.category) {
      toast.error('Preencha todos os campos obrigatórios')
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
        status: 'active' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 0,
        digital: isDigitalCategory ? {
          type: formData.digitalType as any,
          deliveryInstructions: formData.deliveryInstructions
        } : undefined
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
            </div>
          </Card>

          {/* Category */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-matte-black-900 mb-4">
              Categoria
            </h2>
            
            <div className="grid grid-cols-2 gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setFormData({ 
                    ...formData, 
                    category: category.id,
                    subcategory: '',
                    digital: !!category.digital
                  })}
                  className={`p-3 rounded-xl border-2 text-left transition-colors ${
                    formData.category === category.id
                      ? 'border-bazari-red bg-bazari-red-50'
                      : 'border-sand-200 hover:border-bazari-red-200'
                  }`}
                >
                  <div className="text-sm font-medium">{category.name.pt}</div>
                  {category.digital && (
                    <div className="text-xs text-bazari-red mt-1">Digital</div>
                  )}
                </button>
              ))}
            </div>
          </Card>

          {/* Digital specific fields */}
          {isDigitalCategory && (
            <Card className="p-6 bg-bazari-red-50 border-bazari-red-200">
              <h2 className="text-xl font-semibold text-bazari-red-800 mb-4">
                Configurações Digitais
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="form-label">Tipo de produto digital</label>
                  <select
                    className="form-input"
                    value={formData.digitalType}
                    onChange={(e) => setFormData({ ...formData, digitalType: e.target.value })}
                  >
                    <option value="">Selecione...</option>
                    <option value="course">Curso Online</option>
                    <option value="ebook">E-book</option>
                    <option value="software">Software</option>
                    <option value="media">Mídia Digital</option>
                    <option value="template">Template</option>
                    <option value="other">Outro</option>
                  </select>
                </div>
                
                <Textarea
                  label="Instruções de entrega"
                  placeholder="Como o comprador receberá o produto digital? (ex: link por email, acesso a plataforma, etc.)"
                  rows={3}
                  value={formData.deliveryInstructions}
                  onChange={(e) => setFormData({ ...formData, deliveryInstructions: e.target.value })}
                />
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-matte-black-900 mb-4">
              Preço
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="form-label">Moeda</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFormData({ ...formData, currency: 'BRL' })}
                    className={`p-3 rounded-xl border-2 text-center transition-colors ${
                      formData.currency === 'BRL'
                        ? 'border-success bg-success-50'
                        : 'border-sand-200'
                    }`}
                  >
                    BRL
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, currency: 'BZR' })}
                    className={`p-3 rounded-xl border-2 text-center transition-colors ${
                      formData.currency === 'BZR'
                        ? 'border-bazari-red bg-bazari-red-50'
                        : 'border-sand-200'
                    }`}
                  >
                    BZR
                  </button>
                </div>
              </div>
              
              <Input
                label="Valor"
                type="number"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
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
                Publicar Anúncio
              </Button>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/marketplace')}
              >
                Cancelar
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
