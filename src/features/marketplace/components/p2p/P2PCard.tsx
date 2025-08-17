// src/features/marketplace/components/p2p/P2PCard.tsx

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Star, 
  Shield, 
  Clock, 
  MapPin, 
  TrendingUp, 
  TrendingDown,
  MessageCircle,
  ArrowRight,
  Verified,
  AlertTriangle
} from 'lucide-react'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { Badge } from '@shared/ui/Badge'
import { Avatar } from '@shared/ui/Avatar'
import { useI18n } from '@app/providers/I18nProvider'
import { P2POrder } from '../../types/p2p.types'

interface P2PCardProps {
  order: P2POrder
  onTrade: (orderId: string) => void
  onViewProfile: (userId: string) => void
  currentUserId?: string
  compact?: boolean
}

export const P2PCard: React.FC<P2PCardProps> = ({
  order,
  onTrade,
  onViewProfile,
  currentUserId,
  compact = false
}) => {
  const { t } = useI18n()
  
  const isOwnOrder = currentUserId === order.ownerId
  const isBuyOrder = order.orderType === 'buy'
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const formatBZR = (amount: number) => {
    return `${amount.toLocaleString('pt-BR')} BZR`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'locked':
        return 'warning'
      case 'completed':
        return 'secondary'
      case 'cancelled':
        return 'danger'
      default:
        return 'secondary'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo'
      case 'locked':
        return 'Em Negociação'
      case 'completed':
        return 'Concluído'
      case 'cancelled':
        return 'Cancelado'
      default:
        return status
    }
  }

  const calculateRange = () => {
    const minTotal = order.minAmount * order.unitPriceBRL
    const maxTotal = order.maxAmount * order.unitPriceBRL
    return { minTotal, maxTotal }
  }

  const { minTotal, maxTotal } = calculateRange()

  const getReputationColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600'
    if (rating >= 4.0) return 'text-bazari-gold-600'
    if (rating >= 3.5) return 'text-yellow-600'
    if (rating >= 3.0) return 'text-orange-600'
    return 'text-red-600'
  }

  const timeAgo = (date: string) => {
    const now = new Date()
    const created = new Date(date)
    const diffMs = now.getTime() - created.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) return `${diffMins}m atrás`
    if (diffHours < 24) return `${diffHours}h atrás`
    return `${diffDays}d atrás`
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`overflow-hidden hover:shadow-lg transition-shadow ${
        compact ? 'p-4' : 'p-6'
      } ${isOwnOrder ? 'border-bazari-red-200 bg-bazari-red-25' : ''}`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {/* Order Type Icon */}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isBuyOrder 
                ? 'bg-success-100 text-success-700' 
                : 'bg-bazari-red-100 text-bazari-red-700'
            }`}>
              {isBuyOrder ? (
                <TrendingUp size={20} />
              ) : (
                <TrendingDown size={20} />
              )}
            </div>

            {/* User Info */}
            <div>
              <div className="flex items-center space-x-2">
                <Avatar
                  size="sm"
                  fallback={order.ownerName.charAt(0)}
                  className="cursor-pointer"
                  onClick={() => onViewProfile(order.ownerId)}
                />
                <button
                  onClick={() => onViewProfile(order.ownerId)}
                  className="font-medium text-matte-black-900 hover:text-bazari-red"
                >
                  {order.ownerName}
                </button>
                {order.reputationSnapshot && order.reputationSnapshot.rating >= 4.5 && (
                  <Verified size={16} className="text-success" />
                )}
              </div>
              
              {/* Reputation */}
              <div className="flex items-center space-x-2 mt-1">
                <div className="flex items-center">
                  <Star 
                    size={14} 
                    className={`mr-1 ${getReputationColor(order.ownerRating)} fill-current`}
                  />
                  <span className={`text-sm font-medium ${getReputationColor(order.ownerRating)}`}>
                    {order.ownerRating.toFixed(1)}
                  </span>
                </div>
                
                {order.reputationSnapshot && (
                  <>
                    <span className="text-matte-black-400">•</span>
                    <span className="text-sm text-matte-black-600">
                      {order.reputationSnapshot.reviewCount} avaliações
                    </span>
                    <span className="text-matte-black-400">•</span>
                    <span className="text-sm text-matte-black-600">
                      {order.reputationSnapshot.completionRate.toFixed(1)}% conclusão
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Status & Time */}
          <div className="text-right">
            <Badge variant={getStatusColor(order.status)} size="sm">
              {getStatusLabel(order.status)}
            </Badge>
            <p className="text-xs text-matte-black-500 mt-1">
              {timeAgo(order.createdAt)}
            </p>
          </div>
        </div>

        {/* Order Details */}
        <div className="space-y-3">
          {/* Action & Price */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-matte-black-900">
                {isBuyOrder ? 'Comprando BZR' : 'Vendendo BZR'}
              </h3>
              <p className="text-2xl font-bold text-bazari-red">
                {formatCurrency(order.unitPriceBRL)}
                <span className="text-sm font-normal text-matte-black-600 ml-1">
                  por BZR
                </span>
              </p>
            </div>

            {/* Quick Stats */}
            <div className="text-right">
              <p className="text-sm text-matte-black-600">Quantidade</p>
              <p className="font-semibold text-matte-black-900">
                {formatBZR(order.minAmount)} - {formatBZR(order.maxAmount)}
              </p>
              <p className="text-xs text-success">
                {formatCurrency(minTotal)} - {formatCurrency(maxTotal)}
              </p>
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <p className="text-sm text-matte-black-600 mb-2">Métodos de Pagamento:</p>
            <div className="flex flex-wrap gap-1">
              {order.paymentMethods.slice(0, 3).map((method) => (
                <Badge key={method} variant="outline" size="sm">
                  {method}
                </Badge>
              ))}
              {order.paymentMethods.length > 3 && (
                <Badge variant="outline" size="sm">
                  +{order.paymentMethods.length - 3}
                </Badge>
              )}
            </div>
          </div>

          {/* Security Features */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              {order.escrowEnabled && (
                <div className="flex items-center text-success">
                  <Shield size={14} className="mr-1" />
                  <span>Escrow</span>
                  <span className="text-matte-black-500 ml-1">
                    ({order.escrowTimeLimitMinutes}min)
                  </span>
                </div>
              )}
              
              {order.reputationSnapshot?.avgReleaseTime && (
                <div className="flex items-center text-matte-black-600">
                  <Clock size={14} className="mr-1" />
                  <span>~{order.reputationSnapshot.avgReleaseTime}min</span>
                </div>
              )}
            </div>

            {/* Location */}
            {order.location && (
              <div className="flex items-center text-matte-black-600">
                <MapPin size={14} className="mr-1" />
                <span>{order.location.city}, {order.location.state}</span>
              </div>
            )}
          </div>

          {/* Description */}
          {order.description && !compact && (
            <div className="bg-sand-50 p-3 rounded-lg">
              <p className="text-sm text-matte-black-700 line-clamp-2">
                {order.description}
              </p>
            </div>
          )}

          {/* Risk Warnings */}
          {(!order.escrowEnabled || order.reputationSnapshot?.completionRate < 90) && (
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <div className="flex items-start">
                <AlertTriangle size={16} className="text-yellow-600 mr-2 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  {!order.escrowEnabled && (
                    <p>• Sem proteção de escrow - maior risco</p>
                  )}
                  {order.reputationSnapshot?.completionRate < 90 && (
                    <p>• Taxa de conclusão abaixo de 90%</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-sand-200">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewProfile(order.ownerId)}
          >
            <MessageCircle size={16} className="mr-2" />
            Ver Perfil
          </Button>

          {isOwnOrder ? (
            <Badge variant="secondary" size="sm">
              Seu Anúncio
            </Badge>
          ) : (
            <Button
              size="sm"
              onClick={() => onTrade(order.id)}
              disabled={order.status !== 'active'}
              className={isBuyOrder ? 'bg-success hover:bg-success-600' : ''}
            >
              {isBuyOrder ? 'Vender para' : 'Comprar de'} {order.ownerName.split(' ')[0]}
              <ArrowRight size={16} className="ml-2" />
            </Button>
          )}
        </div>

        {/* Terms Preview */}
        {order.termsAndConditions && !compact && (
          <div className="mt-4 pt-4 border-t border-sand-200">
            <details className="text-sm">
              <summary className="cursor-pointer text-matte-black-600 hover:text-matte-black-900">
                Ver termos e condições
              </summary>
              <p className="mt-2 text-matte-black-700 bg-sand-50 p-3 rounded-lg">
                {order.termsAndConditions}
              </p>
            </details>
          </div>
        )}
      </Card>
    </motion.div>
  )
}