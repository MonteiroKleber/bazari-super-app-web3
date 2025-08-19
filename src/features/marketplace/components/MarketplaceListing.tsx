// src/features/marketplace/components/MarketplaceListing.tsx

import React from 'react'
import { motion } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Share2, 
  Heart, 
  MessageCircle, 
  Star, 
  Shield, 
  Truck, 
  Package, 
  Building,
  Coins,
  Download,
  ExternalLink,
  Clock,
  MapPin,
  Phone,
  Mail,
  Verified,
  AlertTriangle,
  Check // ✅ ADICIONADO: Import do ícone Check que estava faltando
} from 'lucide-react'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { Badge } from '@shared/ui/Badge'
import { Avatar } from '@shared/ui/Avatar'
import { Tabs } from '@shared/ui/Tabs'
import { useI18n } from '@app/providers/I18nProvider'
import { useMarketplaceStore } from '../store/marketplaceStore'
import { useEnterpriseStore } from '../store/enterpriseStore'

export const MarketplaceListing: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useI18n()
  const { listings } = useMarketplaceStore()
  const { enterprises } = useEnterpriseStore()
  
  const [activeImageIndex, setActiveImageIndex] = React.useState(0)
  const [activeTab, setActiveTab] = React.useState('description')
  
  const listing = listings.find(l => l.id === id)
  const enterprise = listing?.enterpriseId 
    ? enterprises.find(e => e.id === listing.enterpriseId)
    : null

  if (!listing) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p>Anúncio não encontrado</p>
      </div>
    )
  }

  const formatPrice = (price: number, currency: 'BZR' | 'BRL') => {
    if (currency === 'BRL') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(price)
    }
    return `${price.toLocaleString('pt-BR')} BZR`
  }

  const handleContactSeller = () => {
    navigate(`/profile/${listing.sellerId}?from=marketplace&listing=${listing.id}`)
  }

  const handleViewEnterprise = () => {
    if (enterprise) {
      navigate(`/marketplace/enterprises/${enterprise.id}`)
    }
  }

  const tabsData = [
    {
      id: 'description',
      label: 'Descrição',
      content: (
        <div className="space-y-4">
          <div className="prose prose-sm max-w-none">
            <p className="text-matte-black-700 leading-relaxed whitespace-pre-wrap">
              {listing.description}
            </p>
          </div>

          {/* Digital Product Info */}
          {listing.digital && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                <Download size={16} className="mr-2" />
                Produto Digital
              </h4>
              <p className="text-blue-800 text-sm mb-3">
                Tipo: {listing.digital.type === 'course' ? 'Curso Online' :
                       listing.digital.type === 'ebook' ? 'E-book' :
                       listing.digital.type === 'software' ? 'Software' :
                       listing.digital.type === 'media' ? 'Mídia' :
                       listing.digital.type === 'template' ? 'Template' : 'Outro'}
              </p>
              
              {listing.digital.tokenizable && listing.digital.tokenization && (
                <div className="bg-bazari-red-50 p-3 rounded border border-bazari-red-200 mt-3">
                  <h5 className="font-medium text-bazari-red-900 mb-2 flex items-center">
                    <Coins size={14} className="mr-1" />
                    Produto Tokenizado
                  </h5>
                  <div className="grid grid-cols-2 gap-2 text-xs text-bazari-red-800">
                    <div>Tokens disponíveis: {listing.digital.tokenization.currentSupply || 0}/{listing.digital.tokenization.quantity}</div>
                    <div>Royalty: {listing.digital.tokenization.royaltyPercentage}%</div>
                    <div>Preço por token: {formatPrice(listing.digital.tokenization.pricePerToken || 0, listing.currency)}</div>
                    <div>Transferível: {listing.digital.tokenization.transferable ? 'Sim' : 'Não'}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Product Metadata */}
          {listing.metadata && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {listing.metadata.condition && (
                <div className="bg-sand-50 p-4 rounded-lg">
                  <h5 className="font-medium text-matte-black-900 mb-2">Condição</h5>
                  <p className="text-sm text-matte-black-700 capitalize">
                    {listing.metadata.condition === 'new' ? 'Novo' :
                     listing.metadata.condition === 'used' ? 'Usado' : 'Recondicionado'}
                  </p>
                </div>
              )}
              
              {listing.metadata.brand && (
                <div className="bg-sand-50 p-4 rounded-lg">
                  <h5 className="font-medium text-matte-black-900 mb-2">Marca</h5>
                  <p className="text-sm text-matte-black-700">{listing.metadata.brand}</p>
                </div>
              )}
              
              {listing.metadata.warranty && (
                <div className="bg-sand-50 p-4 rounded-lg">
                  <h5 className="font-medium text-matte-black-900 mb-2">Garantia</h5>
                  <p className="text-sm text-matte-black-700">{listing.metadata.warranty}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )
    },
    {
      id: 'shipping',
      label: 'Entrega',
      content: (
        <div className="space-y-4">
          {listing.metadata?.shipping ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Truck size={20} className="text-success mr-2" />
                  <span className="font-medium">
                    {listing.metadata.shipping.free ? 'Frete Grátis' : 'Frete Pago'}
                  </span>
                </div>
                {!listing.metadata.shipping.free && listing.metadata.shipping.cost && (
                  <span className="text-matte-black-600">
                    {formatPrice(listing.metadata.shipping.cost, 'BRL')}
                  </span>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <Clock size={16} className="text-matte-black-500 mr-2" />
                  <span className="text-sm text-matte-black-700">
                    Entrega em até {listing.metadata.shipping.estimatedDays} dias úteis
                  </span>
                </div>
                
                {listing.metadata.shipping.methods?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-matte-black-900 mb-2">Métodos disponíveis:</p>
                    <div className="flex flex-wrap gap-2">
                      {listing.metadata.shipping.methods.map((method, index) => (
                        <Badge key={index} variant="secondary" size="sm">
                          {method}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {listing.metadata.location && (
                <div className="bg-sand-50 p-4 rounded-lg">
                  <h5 className="font-medium text-matte-black-900 mb-2 flex items-center">
                    <MapPin size={16} className="mr-2" />
                    Localização
                  </h5>
                  <p className="text-sm text-matte-black-700">
                    {listing.metadata.location.city && `${listing.metadata.location.city}, `}
                    {listing.metadata.location.state}
                    {listing.metadata.location.country && ` - ${listing.metadata.location.country}`}
                  </p>
                </div>
              )}
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-start">
                  <Shield size={20} className="text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h5 className="font-medium text-green-900 mb-1">Proteção na Entrega</h5>
                    <p className="text-sm text-green-800">
                      Receba o produto ou seu dinheiro de volta.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Truck className="mx-auto text-matte-black-400 mb-4" size={48} />
              <p className="text-matte-black-600">
                Informações de entrega não disponíveis.
              </p>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'seller',
      label: 'Vendedor',
      content: (
        <div className="space-y-6">
          {/* Seller Info */}
          <div className="flex items-start space-x-4">
            <Avatar
              size="lg"
              fallback={listing.sellerName.charAt(0)}
              className="border-2 border-white shadow-lg"
            />
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-xl font-semibold text-matte-black-900">
                  {listing.sellerName}
                </h3>
                {listing.sellerRating >= 4.5 && (
                  <Verified className="text-success" size={20} />
                )}
              </div>
              
              <div className="flex items-center space-x-4 mb-3">
                <div className="flex items-center">
                  <Star className="text-bazari-gold-600 mr-1" size={16} fill="currentColor" />
                  <span className="font-medium text-matte-black-900">
                    {listing.sellerRating.toFixed(1)}
                  </span>
                </div>
                
                <div className="flex items-center text-matte-black-600">
                  <Clock className="mr-1" size={16} />
                  <span className="text-sm">Responde em ~2h</span>
                </div>
              </div>
              
              <Button
                onClick={handleContactSeller}
                className="mb-4"
              >
                <MessageCircle size={16} className="mr-2" />
                Entrar em Contato
              </Button>
            </div>
          </div>

          {/* Enterprise Info */}
          {enterprise && (
            <Card className="p-4 border border-bazari-red-200 bg-bazari-red-50">
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 bg-bazari-red-100 rounded-full flex items-center justify-center">
                  <Building className="text-bazari-red" size={20} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-semibold text-matte-black-900">
                      {enterprise.name}
                    </h4>
                    {enterprise.verification.verified && (
                      <Verified className="text-success" size={16} />
                    )}
                    {enterprise.tokenizable && enterprise.tokenization?.enabled && (
                      <Badge variant="primary" size="sm">Tokenizado</Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-matte-black-700 mb-3 line-clamp-2">
                    {enterprise.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-matte-black-600">
                      <div className="flex items-center">
                        <Star className="text-bazari-gold-600 mr-1" size={14} />
                        {enterprise.reputation.rating.toFixed(1)}
                      </div>
                      
                      <div>
                        {enterprise.reputation.totalSales} vendas
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleViewEnterprise}
                    >
                      Ver Empresa
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Contact Options */}
          <Card className="p-4">
            <h4 className="font-semibold text-matte-black-900 mb-3">Formas de Contato</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <MessageCircle size={16} className="text-matte-black-500 mr-2" />
                  <span className="text-sm">Chat da plataforma</span>
                </div>
                <Badge variant="success" size="sm">Disponível</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Phone size={16} className="text-matte-black-500 mr-2" />
                  <span className="text-sm">Telefone</span>
                </div>
                <Badge variant="secondary" size="sm">Após contato</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Mail size={16} className="text-matte-black-500 mr-2" />
                  <span className="text-sm">Email</span>
                </div>
                <Badge variant="secondary" size="sm">Após contato</Badge>
              </div>
            </div>
          </Card>
        </div>
      )
    }
  ]

  return (
    <div className="min-h-screen bg-sand">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <Card className="p-0 overflow-hidden">
              <div className="aspect-video bg-sand-200 relative">
                {listing.images[activeImageIndex] && (
                  <img
                    src={listing.images[activeImageIndex]}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                )}
                
                {/* Image Navigation */}
                {listing.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    <div className="flex space-x-2">
                      {listing.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === activeImageIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Thumbnails */}
              {listing.images.length > 1 && (
                <div className="p-4 flex space-x-2 overflow-x-auto">
                  {listing.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                        index === activeImageIndex ? 'border-bazari-red' : 'border-transparent'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${listing.title} - ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </Card>

            {/* Details */}
            <Card className="p-6">
              <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 mr-4">
                    <h1 className="text-2xl font-bold text-matte-black-900 mb-2">
                      {listing.title}
                    </h1>
                    
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="text-3xl font-bold text-bazari-red">
                        {formatPrice(listing.price, listing.currency)}
                      </div>
                      
                      <div className="flex items-center text-sm text-matte-black-600">
                        <Star className="text-bazari-gold mr-1" size={14} />
                        {listing.sellerRating.toFixed(1)} • {listing.views} visualizações
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm">
                      <Heart size={16} />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share2 size={16} />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 mb-4">
                  <Badge variant="secondary">
                    {listing.category}
                  </Badge>
                  {listing.subcategory && (
                    <Badge variant="outline">
                      {listing.subcategory}
                    </Badge>
                  )}
                  {listing.digital && (
                    <Badge variant="primary">
                      Digital
                    </Badge>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <Tabs
                tabs={tabsData}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Card */}
            <Card className="p-6">
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-bazari-red mb-2">
                    {formatPrice(listing.price, listing.currency)}
                  </div>
                  
                  <Badge 
                    variant={listing.status === 'active' ? 'success' : 'secondary'} 
                    size="sm"
                  >
                    {listing.status === 'active' ? 'Disponível' : 'Indisponível'}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <Button className="w-full" size="lg">
                    Comprar Agora
                  </Button>
                  
                  <Button variant="outline" className="w-full">
                    <MessageCircle size={16} className="mr-2" />
                    Conversar
                  </Button>
                </div>
              </div>
            </Card>

            {/* Security Info */}
            <Card className="p-6">
              <h3 className="font-semibold text-matte-black-900 mb-4 flex items-center">
                <Shield className="mr-2 text-success" size={20} />
                Compra Protegida
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center text-success">
                  <Check className="mr-2" size={16} />
                  <span>Proteção do comprador</span>
                </div>
                
                <div className="flex items-center text-success">
                  <Check className="mr-2" size={16} />
                  <span>Dados pessoais seguros</span>
                </div>
                
                <div className="flex items-center text-success">
                  <Check className="mr-2" size={16} />
                  <span>Chat dentro da plataforma</span>
                </div>
              </div>
            </Card>

            {/* Similar Products */}
            <Card className="p-6">
              <h3 className="font-semibold text-matte-black-900 mb-4">
                Produtos Similares
              </h3>
              
              <div className="space-y-3">
                {listings
                  .filter(l => l.id !== listing.id && l.category === listing.category)
                  .slice(0, 3)
                  .map((similarListing) => (
                    <button
                      key={similarListing.id}
                      onClick={() => navigate(`/marketplace/listing/${similarListing.id}`)}
                      className="flex space-x-3 p-2 rounded-lg hover:bg-sand-50 w-full text-left"
                    >
                      <div className="w-12 h-12 bg-sand-200 rounded-lg flex-shrink-0">
                        {similarListing.images[0] ? (
                          <img 
                            src={similarListing.images[0]} 
                            alt={similarListing.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Package className="text-matte-black-400" size={16} />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-matte-black-900 line-clamp-2">
                          {similarListing.title}
                        </p>
                        <p className="text-sm text-bazari-red font-semibold">
                          {formatPrice(similarListing.price, similarListing.currency)}
                        </p>
                      </div>
                    </button>
                  ))
                }
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}