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
  AlertTriangle
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
                       listing.digital.type === 'media' ? 'Mídia Digital' :
                       listing.digital.type === 'template' ? 'Template' : 'Outro'}
              </p>
              
              {listing.digital.deliveryInstructions && (
                <div>
                  <p className="text-sm font-medium text-blue-900 mb-1">
                    Instruções de Entrega:
                  </p>
                  <p className="text-sm text-blue-800">
                    {listing.digital.deliveryInstructions}
                  </p>
                </div>
              )}

              {/* Tokenization Info */}
              {listing.digital.tokenizable && listing.digital.tokenization && (
                <div className="mt-4 p-3 bg-bazari-gold-50 rounded-lg border border-bazari-gold-200">
                  <div className="flex items-center mb-2">
                    <Coins className="text-bazari-gold-600 mr-2" size={16} />
                    <span className="font-medium text-bazari-gold-900">Produto Tokenizado</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-bazari-gold-700">Tokens Disponíveis:</p>
                      <p className="font-bold text-bazari-gold-900">
                        {listing.digital.tokenization.quantity}
                      </p>
                    </div>
                    <div>
                      <p className="text-bazari-gold-700">Royalty:</p>
                      <p className="font-bold text-bazari-gold-900">
                        {listing.digital.tokenization.royaltyPercentage}%
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-bazari-gold-600 mt-2">
                    Transferível: {listing.digital.tokenization.transferable ? 'Sim' : 'Não'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Product Specifications */}
          {listing.metadata && (
            <div className="bg-sand-50 p-4 rounded-lg">
              <h4 className="font-semibold text-matte-black-900 mb-3">
                Especificações
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {listing.metadata.condition && (
                  <div>
                    <p className="text-matte-black-600">Condição:</p>
                    <p className="font-medium text-matte-black-900">
                      {listing.metadata.condition === 'new' ? 'Novo' :
                       listing.metadata.condition === 'used' ? 'Usado' : 'Recondicionado'}
                    </p>
                  </div>
                )}
                
                {listing.metadata.brand && (
                  <div>
                    <p className="text-matte-black-600">Marca:</p>
                    <p className="font-medium text-matte-black-900">{listing.metadata.brand}</p>
                  </div>
                )}
                
                {listing.metadata.model && (
                  <div>
                    <p className="text-matte-black-600">Modelo:</p>
                    <p className="font-medium text-matte-black-900">{listing.metadata.model}</p>
                  </div>
                )}
                
                {listing.metadata.warranty && (
                  <div>
                    <p className="text-matte-black-600">Garantia:</p>
                    <p className="font-medium text-matte-black-900">{listing.metadata.warranty}</p>
                  </div>
                )}
              </div>
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
              <div className="flex items-center space-x-2 mb-4">
                <Truck className="text-bazari-red" size={20} />
                <h4 className="font-semibold text-matte-black-900">
                  Opções de Entrega
                </h4>
                {listing.metadata.shipping.free && (
                  <Badge variant="success" size="sm">Frete Grátis</Badge>
                )}
              </div>

              <div className="space-y-3">
                {listing.metadata.shipping.methods.map((method, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-sand-50 rounded-lg">
                    <div className="flex items-center">
                      <Package size={16} className="text-matte-black-600 mr-3" />
                      <span className="font-medium text-matte-black-900">{method}</span>
                    </div>
                    <div className="text-right">
                      {listing.metadata.shipping.free ? (
                        <span className="text-success font-medium">Grátis</span>
                      ) : (
                        <span className="font-medium text-matte-black-900">
                          {formatPrice(listing.metadata.shipping.cost || 0, 'BRL')}
                        </span>
                      )}
                      {listing.metadata.shipping.estimatedDays > 0 && (
                        <p className="text-sm text-matte-black-600">
                          {listing.metadata.shipping.estimatedDays} dias úteis
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start">
                  <Shield className="text-blue-600 mr-2 mt-0.5" size={16} />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Proteção do Comprador</p>
                    <p>Sua compra está protegida. Receba o produto ou seu dinheiro de volta.</p>
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
                      
                      <div className="flex items-center">
                        <Package className="mr-1" size={14} />
                        {enterprise.stats.activeListings} produtos
                      </div>
                      
                      {enterprise.address && (
                        <div className="flex items-center">
                          <MapPin className="mr-1" size={14} />
                          {enterprise.address.city}
                        </div>
                      )}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleViewEnterprise}
                    >
                      Ver Empreendimento
                      <ExternalLink size={14} className="ml-1" />
                    </Button>
                  </div>

                  {/* Enterprise Contact */}
                  {(enterprise.contact.phone || enterprise.contact.email) && (
                    <div className="mt-3 pt-3 border-t border-bazari-red-200">
                      <div className="flex items-center space-x-4 text-sm">
                        {enterprise.contact.phone && (
                          <div className="flex items-center text-matte-black-600">
                            <Phone size={14} className="mr-1" />
                            {enterprise.contact.phone}
                          </div>
                        )}
                        
                        {enterprise.contact.email && (
                          <div className="flex items-center text-matte-black-600">
                            <Mail size={14} className="mr-1" />
                            {enterprise.contact.email}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Security Notice */}
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-start">
              <AlertTriangle className="text-yellow-600 mr-2 mt-0.5" size={16} />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Dicas de Segurança</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Prefira negociar através da plataforma</li>
                  <li>Não transfira dinheiro antes de receber o produto</li>
                  <li>Use meios de pagamento seguros (PIX, cartão)</li>
                  <li>Desconfie de preços muito abaixo do mercado</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Images */}
            <Card className="p-6 mb-6">
              <div className="aspect-video bg-sand-200 rounded-xl mb-4 relative overflow-hidden">
                {listing.images[activeImageIndex] ? (
                  <img 
                    src={listing.images[activeImageIndex]} 
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package className="text-matte-black-400" size={64} />
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                  <Badge variant={listing.status === 'active' ? 'success' : 'secondary'}>
                    {listing.status === 'active' ? 'Disponível' : listing.status}
                  </Badge>
                </div>

                {/* Digital/Tokenized Badges */}
                <div className="absolute top-4 right-4 space-y-2">
                  {listing.digital && (
                    <Badge variant="primary">Digital</Badge>
                  )}
                  {listing.digital?.tokenizable && (
                    <Badge variant="secondary">
                      <Coins size={12} className="mr-1" />
                      Tokenizado
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Thumbnail Navigation */}
              {listing.images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto">
                  {listing.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                        activeImageIndex === index 
                          ? 'border-bazari-red' 
                          : 'border-sand-200'
                      }`}
                    >
                      <img 
                        src={image} 
                        alt={`${listing.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </Card>

            {/* Product Info */}
            <Card className="p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-matte-black-900 mb-2">
                    {listing.title}
                  </h1>
                  
                  <div className="flex items-center space-x-4 text-sm text-matte-black-600 mb-4">
                    <span>{listing.views} visualizações</span>
                    <span>•</span>
                    <span>Categoria: {listing.category}</span>
                    {listing.subcategory && (
                      <>
                        <span>•</span>
                        <span>{listing.subcategory}</span>
                      </>
                    )}
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

              {/* Enterprise Link */}
              {enterprise && (
                <div className="flex items-center space-x-2 mb-4 p-3 bg-bazari-red-50 rounded-lg">
                  <Building className="text-bazari-red" size={16} />
                  <span className="text-sm text-matte-black-700">Vendido por</span>
                  <button
                    onClick={handleViewEnterprise}
                    className="font-medium text-bazari-red hover:text-bazari-red-700"
                  >
                    {enterprise.name}
                  </button>
                  {enterprise.verification.verified && (
                    <Verified className="text-success" size={14} />
                  )}
                </div>
              )}

              <div className="text-4xl font-bold text-bazari-red mb-6">
                {formatPrice(listing.price, listing.currency)}
              </div>
            </Card>

            {/* Tabs */}
            <Tabs
              tabs={tabsData}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Purchase Card */}
          <Card className="p-6 sticky top-8">
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-bazari-red mb-2">
                {formatPrice(listing.price, listing.currency)}
              </div>
              <p className="text-sm text-matte-black-600">
                {listing.currency === 'BZR' ? 'Aceita BZR' : 'Valor em reais'}
              </p>
            </div>

            <div className="space-y-3">
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleContactSeller}
              >
                <MessageCircle size={16} className="mr-2" />
                Entrar em Contato
              </Button>
              
              {listing.digital && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleContactSeller}
                >
                  <Download size={16} className="mr-2" />
                  Comprar Digital
                </Button>
              )}
            </div>

            {/* Quick Info */}
            <div className="mt-6 pt-6 border-t border-sand-200 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-matte-black-600">Vendedor:</span>
                <span className="font-medium text-matte-black-900">{listing.sellerName}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-matte-black-600">Avaliação:</span>
                <div className="flex items-center">
                  <Star className="text-bazari-gold-600 mr-1" size={14} fill="currentColor" />
                  <span className="font-medium text-matte-black-900">
                    {listing.sellerRating.toFixed(1)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-matte-black-600">Status:</span>
                <Badge variant={listing.status === 'active' ? 'success' : 'secondary'} size="sm">
                  {listing.status === 'active' ? 'Disponível' : 'Indisponível'}
                </Badge>
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
  )
}