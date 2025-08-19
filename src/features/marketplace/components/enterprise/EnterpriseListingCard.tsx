// src/features/marketplace/components/enterprise/EnterpriseListingCard.tsx

import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  Star, 
  Eye, 
  Package, 
  Clock, 
  Heart,
  Share2,
  ExternalLink,
  Download,
  Coins
} from 'lucide-react'
import { Card } from '@shared/ui/Card'
import { Badge } from '@shared/ui/Badge'
import { Button } from '@shared/ui/Button'
import { useI18n } from '@app/providers/I18nProvider'
import { Listing } from '@features/marketplace/store/marketplaceStore'

interface EnterpriseListingCardProps {
  listing: Listing
  onClick?: () => void
  showEnterpriseInfo?: boolean
  className?: string
}

export const EnterpriseListingCard: React.FC<EnterpriseListingCardProps> = ({
  listing,
  onClick,
  showEnterpriseInfo = false,
  className = ''
}) => {
  const navigate = useNavigate()
  const { t } = useI18n()

  const formatPrice = (price: number, currency: 'BZR' | 'BRL') => {
    if (currency === 'BRL') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(price)
    }
    return `${price.toLocaleString('pt-BR')} BZR`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (onClick) {
      onClick()
    } else {
      navigate(`/marketplace/listing/${listing.id}`)
    }
  }

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: listing.description,
        url: `${window.location.origin}/marketplace/listing/${listing.id}`
      })
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/marketplace/listing/${listing.id}`)
    }
  }

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    // Implementar funcionalidade de like/favorito
    console.log('Liked listing:', listing.id)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      <Card 
        className="group overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer bg-white"
        onClick={handleCardClick}
      >
        {/* Imagem do produto */}
        <div className="relative aspect-square bg-sand-100 overflow-hidden">
          {listing.images && listing.images[0] ? (
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-sand-200">
              <Package className="w-12 h-12 text-matte-black-400" />
            </div>
          )}

          {/* Badges sobrepostos */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {listing.digital && (
              <Badge variant="primary" className="text-xs bg-blue-600 text-white">
                <Download className="w-3 h-3 mr-1" />
                Digital
              </Badge>
            )}
            
            {listing.digital?.tokenizable && (
              <Badge variant="secondary" className="text-xs bg-bazari-gold text-white">
                <Coins className="w-3 h-3 mr-1" />
                Tokenizável
              </Badge>
            )}
            
            {listing.metadata?.condition && (
              <Badge 
                variant={listing.metadata.condition === 'new' ? 'success' : 'secondary'} 
                className="text-xs"
              >
                {listing.metadata.condition === 'new' ? 'Novo' :
                 listing.metadata.condition === 'used' ? 'Usado' : 'Recondicionado'}
              </Badge>
            )}
          </div>

          {/* Ações flutuantes */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className="w-8 h-8 p-0 bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm"
              aria-label="Adicionar aos favoritos"
            >
              <Heart className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="w-8 h-8 p-0 bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm"
              aria-label="Compartilhar"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Status overlay */}
          {listing.status !== 'active' && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="secondary" className="bg-white text-matte-black-900">
                {listing.status === 'sold' ? 'Vendido' : 
                 listing.status === 'paused' ? 'Pausado' : 'Expirado'}
              </Badge>
            </div>
          )}
        </div>

        {/* Conteúdo do card */}
        <div className="p-4">
          {/* Título */}
          <h3 className="font-semibold text-matte-black-900 mb-2 line-clamp-2 leading-snug group-hover:text-bazari-red transition-colors">
            {listing.title}
          </h3>

          {/* Preço e moeda */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xl font-bold text-bazari-red">
                {formatPrice(listing.price, listing.currency)}
              </span>
              {listing.currency === 'BZR' && (
                <span className="text-xs text-matte-black-500 ml-1">BZR</span>
              )}
            </div>
            
            {listing.metadata?.shipping?.free && (
              <Badge variant="success" className="text-xs">
                Frete Grátis
              </Badge>
            )}
          </div>

          {/* Informações do vendedor */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Star className="w-3 h-3 text-amber-400 mr-1" />
              <span className="text-sm font-medium text-matte-black-700">
                {listing.sellerRating.toFixed(1)}
              </span>
              <span className="text-sm text-matte-black-500 ml-1">
                • {listing.sellerName}
              </span>
            </div>
          </div>

          {/* Estatísticas e meta info */}
          <div className="flex items-center justify-between text-xs text-matte-black-500">
            <div className="flex items-center">
              <Eye className="w-3 h-3 mr-1" />
              {listing.views} visualizações
            </div>
            
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {formatDate(listing.createdAt)}
            </div>
          </div>

          {/* Informações específicas para produtos digitais */}
          {listing.digital && (
            <div className="mt-3 pt-3 border-t border-sand-100">
              <div className="flex items-center justify-between">
                <span className="text-xs text-blue-600 font-medium">
                  {listing.digital.type === 'course' ? 'Curso Online' :
                   listing.digital.type === 'ebook' ? 'E-book' :
                   listing.digital.type === 'software' ? 'Software' :
                   listing.digital.type === 'template' ? 'Template' :
                   listing.digital.type === 'media' ? 'Mídia' : 'Digital'}
                </span>
                
                {listing.digital.tokenization && (
                  <span className="text-xs text-bazari-gold-600">
                    {listing.digital.tokenization.quantity} tokens
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Informação do empreendimento (se solicitado) */}
          {showEnterpriseInfo && listing.enterpriseName && (
            <div className="mt-3 pt-3 border-t border-sand-100">
              <div className="flex items-center text-xs text-matte-black-600">
                <span>Empreendimento: </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(`/marketplace/enterprises/${listing.enterpriseId}`)
                  }}
                  className="ml-1 text-bazari-red hover:underline font-medium"
                >
                  {listing.enterpriseName}
                </button>
                <ExternalLink className="w-3 h-3 ml-1" />
              </div>
            </div>
          )}

          {/* Botão de ação (aparece no hover) */}
          <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={(e) => {
                e.stopPropagation()
                navigate(`/marketplace/listing/${listing.id}`)
              }}
            >
              Ver Detalhes
              <ExternalLink className="w-3 h-3 ml-2" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

export default EnterpriseListingCard