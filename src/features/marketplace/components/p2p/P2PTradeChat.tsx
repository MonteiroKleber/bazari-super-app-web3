// src/features/marketplace/components/p2p/P2PTradeChat.tsx

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Send, 
  Image, 
  Paperclip, 
  Shield, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { Input } from '@shared/ui/Input'
import { Badge } from '@shared/ui/Badge'
import { Avatar } from '@shared/ui/Avatar'
import { useI18n } from '@app/providers/I18nProvider'
import { P2PTrade, P2PChatMessage } from '../../types/p2p.types'

interface P2PTradeChatProps {
  trade: P2PTrade
  messages: P2PChatMessage[]
  currentUserId: string
  onSendMessage: (text: string) => void
  onSendImage?: (file: File) => void
  onSendPaymentProof?: (file: File) => void
  isLoading?: boolean
}

export const P2PTradeChat: React.FC<P2PTradeChatProps> = ({
  trade,
  messages,
  currentUserId,
  onSendMessage,
  onSendImage,
  onSendPaymentProof,
  isLoading = false
}) => {
  const { t } = useI18n()
  const [messageText, setMessageText] = React.useState('')
  const [isTyping, setIsTyping] = React.useState(false)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const proofInputRef = React.useRef<HTMLInputElement>(null)

  const isBuyer = currentUserId === trade.buyerId
  const otherParty = isBuyer ? trade.sellerName : trade.buyerName
  const otherPartyRole = isBuyer ? 'Vendedor' : 'Comprador'

  // Auto scroll to bottom when new messages arrive
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = () => {
    if (!messageText.trim()) return
    
    onSendMessage(messageText.trim())
    setMessageText('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onSendImage) {
      onSendImage(file)
    }
  }

  const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onSendPaymentProof) {
      onSendPaymentProof(file)
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image size={14} />
      case 'payment_proof':
        return <CheckCircle size={14} />
      case 'system':
        return <Shield size={14} />
      default:
        return null
    }
  }

  const renderMessage = (message: P2PChatMessage, index: number) => {
    const isOwnMessage = message.senderId === currentUserId
    const isSystemMessage = message.type === 'system'
    const prevMessage = index > 0 ? messages[index - 1] : null
    const showAvatar = !prevMessage || prevMessage.senderId !== message.senderId
    
    if (isSystemMessage) {
      return (
        <div key={message.id} className="flex justify-center my-4">
          <div className="bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
            <div className="flex items-center text-blue-800">
              <Info size={14} className="mr-2" />
              <span className="text-sm">{message.text}</span>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`flex ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2 max-w-xs lg:max-w-md`}>
          {/* Avatar */}
          {showAvatar && !isOwnMessage && (
            <Avatar
              size="sm"
              fallback={message.senderName.charAt(0)}
              className="flex-shrink-0"
            />
          )}
          {showAvatar && isOwnMessage && (
            <div className="w-8 h-8" /> // Spacer for alignment
          )}

          {/* Message Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className={`relative p-3 rounded-2xl ${
              isOwnMessage
                ? 'bg-bazari-red text-white rounded-br-sm'
                : 'bg-sand-100 text-matte-black-900 rounded-bl-sm'
            }`}
          >
            {/* Sender Name */}
            {!isOwnMessage && showAvatar && (
              <p className="text-xs text-matte-black-600 mb-1 font-medium">
                {message.senderName}
              </p>
            )}

            {/* Message Type Icon */}
            {message.type !== 'text' && (
              <div className="flex items-center mb-2">
                {getMessageIcon(message.type)}
                <span className="text-xs ml-1 opacity-75">
                  {message.type === 'image' && 'Imagem'}
                  {message.type === 'payment_proof' && 'Comprovante de Pagamento'}
                </span>
              </div>
            )}

            {/* Message Text */}
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.text}
            </p>

            {/* Image Content */}
            {message.type === 'image' && message.metadata?.imageUrl && (
              <div className="mt-2">
                <img
                  src={message.metadata.imageUrl}
                  alt="Shared image"
                  className="max-w-full h-auto rounded-lg"
                />
              </div>
            )}

            {/* Payment Proof */}
            {message.type === 'payment_proof' && (
              <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center text-green-800">
                  <CheckCircle size={14} className="mr-2" />
                  <span className="text-xs font-medium">
                    Comprovante de Pagamento Enviado
                  </span>
                </div>
                {message.metadata?.fileName && (
                  <p className="text-xs text-green-700 mt-1">
                    📎 {message.metadata.fileName}
                  </p>
                )}
              </div>
            )}

            {/* Timestamp */}
            <p className={`text-xs mt-1 ${
              isOwnMessage ? 'text-white opacity-75' : 'text-matte-black-500'
            }`}>
              {formatTime(message.createdAt)}
            </p>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <Card className="flex flex-col h-96">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-sand-200">
        <div className="flex items-center space-x-3">
          <Avatar
            size="sm"
            fallback={otherParty.charAt(0)}
          />
          <div>
            <h3 className="font-medium text-matte-black-900">{otherParty}</h3>
            <p className="text-sm text-matte-black-600">{otherPartyRole}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Trade Status */}
          <Badge variant={
            trade.status === 'completed' ? 'success' :
            trade.status === 'disputed' || trade.status === 'cancelled' ? 'danger' :
            'warning'
          } size="sm">
            {trade.status === 'initiated' && 'Iniciada'}
            {trade.status === 'payment_pending' && 'Aguardando Pagamento'}
            {trade.status === 'payment_confirmed' && 'Pagamento Confirmado'}
            {trade.status === 'completed' && 'Concluída'}
            {trade.status === 'cancelled' && 'Cancelada'}
            {trade.status === 'disputed' && 'Em Disputa'}
          </Badge>

          {/* Escrow Status */}
          {trade.escrowStatus !== 'none' && (
            <Badge variant="outline" size="sm">
              <Shield size={12} className="mr-1" />
              Escrow
            </Badge>
          )}
        </div>
      </div>

      {/* Trade Summary */}
      <div className="px-4 py-3 bg-sand-50 border-b border-sand-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-matte-black-600">
            {trade.amount.toLocaleString()} BZR por {formatCurrency(trade.totalBRL)}
          </span>
          <span className="text-matte-black-600">
            Método: {trade.paymentMethod}
          </span>
        </div>
        
        {/* Deadline Warning */}
        {trade.status === 'payment_pending' && trade.deadlines.paymentDeadline && (
          <div className="mt-2 flex items-center text-yellow-700">
            <Clock size={14} className="mr-1" />
            <span className="text-xs">
              Pagamento deve ser feito até {new Date(trade.deadlines.paymentDeadline).toLocaleString('pt-BR')}
            </span>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-matte-black-500">
              <p className="text-sm">Nenhuma mensagem ainda</p>
              <p className="text-xs mt-1">Inicie a conversa!</p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => renderMessage(message, index))
        )}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-sand-100 px-4 py-2 rounded-2xl">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-matte-black-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-matte-black-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-matte-black-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {trade.status === 'payment_pending' && isBuyer && (
        <div className="px-4 py-2 bg-yellow-50 border-t border-yellow-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-yellow-800">
              <AlertTriangle size={16} className="mr-2" />
              <span className="text-sm">Envie o comprovante de pagamento</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => proofInputRef.current?.click()}
            >
              <Paperclip size={14} className="mr-2" />
              Enviar Comprovante
            </Button>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 border-t border-sand-200">
        <div className="flex items-center space-x-2">
          {/* File Attachments */}
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              <Image size={16} />
            </Button>
            
            {trade.status === 'payment_pending' && isBuyer && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => proofInputRef.current?.click()}
                disabled={isLoading}
              >
                <Paperclip size={16} />
              </Button>
            )}
          </div>

          {/* Message Input */}
          <div className="flex-1">
            <Input
              placeholder="Digite sua mensagem..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading || trade.status === 'completed' || trade.status === 'cancelled'}
            />
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSendMessage}
            disabled={!messageText.trim() || isLoading || trade.status === 'completed' || trade.status === 'cancelled'}
            size="sm"
          >
            <Send size={16} />
          </Button>
        </div>

        {/* Character Limit */}
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-matte-black-500">
            {trade.status === 'completed' && 'Negociação concluída'}
            {trade.status === 'cancelled' && 'Negociação cancelada'}
            {trade.status === 'disputed' && 'Em disputa - aguarde resolução'}
          </p>
          
          {messageText.length > 0 && (
            <p className="text-xs text-matte-black-500">
              {messageText.length}/500
            </p>
          )}
        </div>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
      
      <input
        ref={proofInputRef}
        type="file"
        accept="image/*,.pdf"
        onChange={handleProofUpload}
        className="hidden"
      />
    </Card>
  )
}