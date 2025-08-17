// src/features/marketplace/components/p2p/EscrowTimeline.tsx

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Check, 
  Clock, 
  Shield, 
  AlertTriangle, 
  XCircle, 
  ArrowRight,
  ExternalLink,
  Coins,
  User,
  Banknote
} from 'lucide-react'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { Badge } from '@shared/ui/Badge'
import { useI18n } from '@app/providers/I18nProvider'
import { P2PTrade, P2PTradeEvent } from '../../types/p2p.types'

interface EscrowTimelineProps {
  trade: P2PTrade
  currentUserId?: string
  onAction?: (action: 'confirm_payment' | 'release_escrow' | 'dispute' | 'cancel') => void
  compact?: boolean
}

export const EscrowTimeline: React.FC<EscrowTimelineProps> = ({
  trade,
  currentUserId,
  onAction,
  compact = false
}) => {
  const { t } = useI18n()
  
  const isBuyer = currentUserId === trade.buyerId
  const isSeller = currentUserId === trade.sellerId
  const isParticipant = isBuyer || isSeller

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const formatBZR = (amount: number) => {
    return `${amount.toLocaleString('pt-BR')} BZR`
  }

  const getStepStatus = (step: string) => {
    const currentStepIndex = getStepIndex(trade.status)
    const stepIndex = getStepIndex(step)
    
    if (stepIndex < currentStepIndex) return 'completed'
    if (stepIndex === currentStepIndex) {
      if (trade.status === 'disputed' || trade.status === 'cancelled') return 'error'
      return 'active'
    }
    return 'pending'
  }

  const getStepIndex = (status: string) => {
    const steps = ['initiated', 'payment_pending', 'payment_confirmed', 'completed']
    return steps.indexOf(status)
  }

  const getTimeRemaining = (deadline?: string) => {
    if (!deadline) return null
    
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const diffMs = deadlineDate.getTime() - now.getTime()
    
    if (diffMs <= 0) return 'Expirado'
    
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    
    if (diffHours > 24) {
      const diffDays = Math.floor(diffHours / 24)
      return `${diffDays}d ${diffHours % 24}h`
    }
    if (diffHours > 0) return `${diffHours}h ${diffMins % 60}m`
    return `${diffMins}m`
  }

  const steps = [
    {
      id: 'initiated',
      title: 'Negociação Iniciada',
      description: 'Trade foi criada entre as partes',
      icon: ArrowRight,
      color: 'blue'
    },
    {
      id: 'payment_pending',
      title: 'Aguardando Pagamento',
      description: `${trade.buyerName} deve efetuar o pagamento`,
      icon: Banknote,
      color: 'yellow'
    },
    {
      id: 'payment_confirmed',
      title: 'Pagamento Confirmado',
      description: 'Comprador confirmou o envio do pagamento',
      icon: Check,
      color: 'green'
    },
    {
      id: 'completed',
      title: 'Negociação Concluída',
      description: 'BZR liberado e trade finalizada',
      icon: Coins,
      color: 'green'
    }
  ]

  const getStepIcon = (step: any, status: string) => {
    const StepIcon = step.icon
    
    switch (status) {
      case 'completed':
        return <Check size={16} className="text-white" />
      case 'error':
        return <XCircle size={16} className="text-white" />
      case 'active':
        return <StepIcon size={16} className="text-white" />
      default:
        return <StepIcon size={16} className="text-matte-black-400" />
    }
  }

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success text-white'
      case 'error':
        return 'bg-red-500 text-white'
      case 'active':
        return 'bg-bazari-red text-white'
      default:
        return 'bg-sand-200 text-matte-black-400'
    }
  }

  const getConnectorColor = (status: string) => {
    return status === 'completed' ? 'bg-success' : 'bg-sand-200'
  }

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Shield className="text-bazari-red mr-2" size={20} />
          <h3 className="text-lg font-semibold text-matte-black-900">
            Status da Negociação
          </h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge 
            variant={
              trade.status === 'completed' ? 'success' :
              trade.status === 'disputed' || trade.status === 'cancelled' ? 'danger' :
              'warning'
            }
          >
            {trade.status === 'initiated' && 'Iniciada'}
            {trade.status === 'payment_pending' && 'Aguardando Pagamento'}
            {trade.status === 'payment_confirmed' && 'Pagamento Confirmado'}
            {trade.status === 'completed' && 'Concluída'}
            {trade.status === 'cancelled' && 'Cancelada'}
            {trade.status === 'disputed' && 'Em Disputa'}
          </Badge>
          
          {trade.escrowStatus !== 'none' && (
            <Badge variant="outline">
              Escrow: {
                trade.escrowStatus === 'locked' ? 'Bloqueado' :
                trade.escrowStatus === 'released' ? 'Liberado' :
                trade.escrowStatus === 'dispute' ? 'Em Disputa' : 'N/A'
              }
            </Badge>
          )}
        </div>
      </div>

      {/* Trade Summary */}
      <div className="bg-sand-50 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-matte-black-600">Quantidade</p>
            <p className="font-semibold text-matte-black-900">{formatBZR(trade.amount)}</p>
          </div>
          <div>
            <p className="text-sm text-matte-black-600">Preço Total</p>
            <p className="font-semibold text-bazari-red">{formatCurrency(trade.totalBRL)}</p>
          </div>
          <div>
            <p className="text-sm text-matte-black-600">Método de Pagamento</p>
            <p className="font-semibold text-matte-black-900">{trade.paymentMethod}</p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id)
          const isLast = index === steps.length - 1
          
          return (
            <div key={step.id} className="flex items-start">
              {/* Step Icon */}
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                  getStepColor(status)
                } ${status === 'pending' ? 'border-sand-300' : 'border-transparent'}`}>
                  {getStepIcon(step, status)}
                </div>
                
                {/* Connector */}
                {!isLast && (
                  <div className={`w-0.5 h-8 mt-2 ${getConnectorColor(status)}`} />
                )}
              </div>

              {/* Step Content */}
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className={`font-medium ${
                    status === 'active' ? 'text-bazari-red' : 'text-matte-black-900'
                  }`}>
                    {step.title}
                  </h4>
                  
                  {/* Timestamp */}
                  {trade.timeline.find(event => event.type === step.id) && (
                    <span className="text-sm text-matte-black-500">
                      {new Date(trade.timeline.find(event => event.type === step.id)!.timestamp)
                        .toLocaleString('pt-BR', { 
                          day: '2-digit', 
                          month: '2-digit', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-matte-black-600 mt-1">
                  {step.description}
                </p>

                {/* Active Step Details */}
                {status === 'active' && (
                  <div className="mt-3">
                    {step.id === 'payment_pending' && (
                      <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Clock size={16} className="text-yellow-600 mr-2" />
                            <span className="text-sm text-yellow-800">
                              {trade.deadlines.paymentDeadline ? (
                                <>
                                  Tempo restante: {getTimeRemaining(trade.deadlines.paymentDeadline)}
                                </>
                              ) : (
                                'Aguardando confirmação de pagamento'
                              )}
                            </span>
                          </div>
                          
                          {isBuyer && onAction && (
                            <Button size="sm" onClick={() => onAction('confirm_payment')}>
                              Confirmar Pagamento
                            </Button>
                          )}
                        </div>
                      </div>
                    )}

                    {step.id === 'payment_confirmed' && (
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Shield size={16} className="text-blue-600 mr-2" />
                            <span className="text-sm text-blue-800">
                              {trade.escrowStatus === 'locked' 
                                ? 'Aguardando liberação do escrow pelo vendedor'
                                : 'Aguardando confirmação final'
                              }
                            </span>
                          </div>
                          
                          {isSeller && onAction && trade.escrowStatus === 'locked' && (
                            <Button size="sm" onClick={() => onAction('release_escrow')}>
                              Liberar Escrow
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Error State */}
                {status === 'error' && (
                  <div className="mt-3 bg-red-50 p-3 rounded-lg border border-red-200">
                    <div className="flex items-center">
                      <AlertTriangle size={16} className="text-red-600 mr-2" />
                      <span className="text-sm text-red-800">
                        {trade.status === 'cancelled' 
                          ? `Negociação cancelada: ${trade.metadata?.cancelReason || 'Motivo não informado'}`
                          : `Em disputa: ${trade.metadata?.disputeReason || 'Aguardando resolução'}`
                        }
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Actions */}
      {isParticipant && onAction && trade.status !== 'completed' && trade.status !== 'cancelled' && (
        <div className="mt-6 pt-6 border-t border-sand-200">
          <div className="flex items-center justify-between">
            <div className="flex space-x-3">
              {trade.status === 'payment_pending' && isBuyer && (
                <Button onClick={() => onAction('confirm_payment')}>
                  Confirmar Pagamento Enviado
                </Button>
              )}
              
              {trade.status === 'payment_confirmed' && isSeller && trade.escrowStatus === 'locked' && (
                <Button onClick={() => onAction('release_escrow')}>
                  Liberar Escrow
                </Button>
              )}
            </div>
            
            <div className="flex space-x-2">
              {trade.status !== 'disputed' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onAction('dispute')}
                >
                  Abrir Disputa
                </Button>
              )}
              
              {(trade.status === 'initiated' || trade.status === 'payment_pending') && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onAction('cancel')}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Blockchain Links */}
      {trade.metadata?.escrowTxHash && (
        <div className="mt-6 pt-6 border-t border-sand-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-matte-black-600">Hash da Transação:</span>
            <Button variant="ghost" size="sm">
              <code className="mr-2 text-xs">{trade.metadata.escrowTxHash.slice(0, 16)}...</code>
              <ExternalLink size={14} />
            </Button>
          </div>
        </div>
      )}

      {/* Detailed Timeline */}
      {!compact && trade.timeline.length > 0 && (
        <details className="mt-6">
          <summary className="cursor-pointer text-sm font-medium text-matte-black-700 hover:text-matte-black-900">
            Ver histórico detalhado ({trade.timeline.length} eventos)
          </summary>
          
          <div className="mt-4 space-y-3">
            {trade.timeline
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .map((event, index) => (
                <div key={event.id || index} className="flex items-start space-x-3 p-3 bg-sand-50 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-bazari-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User size={12} className="text-bazari-red" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-matte-black-900">
                        {event.description}
                      </p>
                      <span className="text-xs text-matte-black-500 flex-shrink-0 ml-2">
                        {new Date(event.timestamp).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    
                    <p className="text-xs text-matte-black-600 mt-1">
                      por {event.actorName} ({event.actor === 'buyer' ? 'Comprador' : event.actor === 'seller' ? 'Vendedor' : 'Sistema'})
                    </p>
                    
                    {event.metadata?.txHash && (
                      <code className="text-xs text-matte-black-500 block mt-1">
                        TX: {event.metadata.txHash}
                      </code>
                    )}
                  </div>
                </div>
              ))
            }
          </div>
        </details>
      )}
    </Card>
  )
}