import React from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit3, Pause, Play, Trash2, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { Badge } from '@shared/ui/Badge'
import { EmptyState } from '@shared/ui/EmptyState'
import { useI18n } from '@app/providers/I18nProvider'
import { useMarketplaceStore } from '../store/marketplaceStore'

export const MarketplaceMyListings: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useI18n()
  const { myListings, updateListing, removeListing } = useMarketplaceStore()

  const formatPrice = (price: number, currency: 'BZR' | 'BRL') => {
    if (currency === 'BRL') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(price)
    }
    return `${price.toLocaleString('pt-BR')} BZR`
  }

  const handleToggleStatus = (listingId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active'
    updateListing(listingId, { status: newStatus as any })
  }

  const handleDelete = (listingId: string) => {
    if (confirm('Tem certeza que deseja excluir este anúncio?')) {
      removeListing(listingId)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-matte-black-900 mb-2">
              Meus Anúncios
            </h1>
            <p className="text-matte-black-600">
              Gerencie seus produtos no marketplace
            </p>
          </div>
          
          <Button onClick={() => navigate('/marketplace/create')}>
            <Plus size={16} className="mr-2" />
            Novo Anúncio
          </Button>
        </div>
      </motion.div>

      {myListings.length === 0 ? (
        <EmptyState
          title="Nenhum anúncio criado"
          description="Crie seu primeiro anúncio e comece a vender no marketplace."
          action={
            <Button onClick={() => navigate('/marketplace/create')}>
              <Plus size={16} className="mr-2" />
              Criar Primeiro Anúncio
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myListings.map((listing) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="overflow-hidden">
                {/* Image */}
                <div className="aspect-video bg-sand-200 relative">
                  {listing.images[0] ? (
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-matte-black-400">Sem imagem</span>
                    </div>
                  )}
                  
                  <Badge
                    variant={
                      listing.status === 'active' ? 'success' :
                      listing.status === 'paused' ? 'warning' : 'neutral'
                    }
                    className="absolute top-2 left-2"
                  >
                    {listing.status === 'active' && 'Ativo'}
                    {listing.status === 'paused' && 'Pausado'}
                    {listing.status === 'sold' && 'Vendido'}
                  </Badge>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-semibold text-matte-black-900 mb-2 line-clamp-2">
                    {listing.title}
                  </h3>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-lg font-bold text-bazari-red">
                      {formatPrice(listing.price, listing.currency)}
                    </div>
                    <div className="flex items-center text-sm text-matte-black-600">
                      <Eye size={14} className="mr-1" />
                      {listing.views}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/marketplace/listing/${listing.id}`)}
                      className="flex-1"
                    >
                      <Eye size={14} className="mr-1" />
                      Ver
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(listing.id, listing.status)}
                    >
                      {listing.status === 'active' ? (
                        <Pause size={14} />
                      ) : (
                        <Play size={14} />
                      )}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(listing.id)}
                      className="text-danger hover:text-danger"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}