import React from 'react'
import { motion } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { Share2, Heart, MessageCircle, Star, Shield } from 'lucide-react'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { Badge } from '@shared/ui/Badge'
import { Avatar } from '@shared/ui/Avatar'
import { useI18n } from '@app/providers/I18nProvider'
import { useMarketplaceStore } from '../store/marketplaceStore'

export const MarketplaceListing: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useI18n()
  const { listings } = useMarketplaceStore()
  
  const listing = listings.find(l => l.id === id)

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
              <div className="aspect-video bg-sand-200 rounded-xl mb-4">
                {listing.images[0] ? (
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center rounded-xl">
                    <span className="text-matte-black-400">Sem imagem</span>
                  </div>
                )}
              </div>
              
              {listing.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {listing.images.slice(1, 5).map((image, index) => (
                    <div key={index} className="aspect-square bg-sand-200 rounded-lg overflow-hidden">
                      <img src={image} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Description */}
            <Card className="p-6">
              <h1 className="text-3xl font-bold text-matte-black-900 mb-4">
                {listing.title}
              </h1>
              
              <div className="flex items-center gap-2 mb-6">
                {listing.digital && (
                  <Badge variant="primary">Digital</Badge>
                )}
                <Badge variant="secondary">{listing.status}</Badge>
              </div>
              
              <div className="prose max-w-none">
                <p className="text-matte-black-700 leading-relaxed">
                  {listing.description}
                </p>
              </div>

              {listing.digital && (
                <div className="mt-6 p-4 bg-bazari-red-50 rounded-xl">
                  <h3 className="font-semibold text-bazari-red-800 mb-2">
                    Produto Digital
                  </h3>
                  <p className="text-sm text-bazari-red-700">
                    {listing.digital.deliveryInstructions}
                  </p>
                </div>
              )}
            </Card>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 space-y-6">
            {/* Price & Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-bazari-red mb-2">
                    {formatPrice(listing.price, listing.currency)}
                  </div>
                  <p className="text-sm text-matte-black-600">
                    {listing.digital ? 'Download imediato' : 'Produto físico'}
                  </p>
                </div>

                <div className="space-y-3">
                  <Button className="w-full" size="lg">
                    Comprar Agora
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleContactSeller}
                  >
                    <MessageCircle size={16} className="mr-2" />
                    {t('profile.chat')}
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="flex-1">
                      <Heart size={16} className="mr-2" />
                      Favoritar
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1">
                      <Share2 size={16} className="mr-2" />
                      Compartilhar
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Seller Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6">
                <h3 className="font-semibold text-matte-black-900 mb-4">
                  Vendedor
                </h3>
                
                <div className="flex items-center space-x-3 mb-4">
                  <Avatar size="lg" fallback={listing.sellerName} />
                  <div>
                    <p className="font-medium text-matte-black-900">
                      {listing.sellerName}
                    </p>
                    <div className="flex items-center">
                      <Star size={14} className="text-bazari-gold-600 mr-1" />
                      <span className="text-sm text-matte-black-600">
                        {listing.sellerRating.toFixed(1)} (25 avaliações)
                      </span>
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate(`/profile/${listing.sellerId}`)}
                >
                  Ver Perfil Completo
                </Button>
              </Card>
            </motion.div>

            {/* Security */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6">
                <div className="flex items-center mb-3">
                  <Shield size={20} className="text-success mr-2" />
                  <h3 className="font-semibold text-matte-black-900">
                    Compra Protegida
                  </h3>
                </div>
                
                <ul className="text-sm text-matte-black-600 space-y-2">
                  <li>• Escrow automático</li>
                  <li>• Garantia de entrega</li>
                  <li>• Suporte 24/7</li>
                  <li>• Reputação verificada</li>
                </ul>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
