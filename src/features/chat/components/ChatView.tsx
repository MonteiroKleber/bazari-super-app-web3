import React from 'react'
import { motion } from 'framer-motion'
import { Send, Paperclip, Image, Smile, ArrowLeft, MoreVertical } from 'lucide-react'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { Avatar } from '@shared/ui/Avatar'
import { Badge } from '@shared/ui/Badge'
import { useI18n } from '@app/providers/I18nProvider'
import { useAuthStore } from '@features/auth/store/authStore'
import { useP2PStore } from '@features/p2p/store/p2pStore'
import { toast } from '@features/notifications/components/NotificationToastHost'

interface ChatViewProps {
  userId: string
  context?: 'p2p' | null
  adId?: string
}

export const ChatView: React.FC<ChatViewProps> = ({ userId, context, adId }) => {
  const { t } = useI18n()
  const { user } = useAuthStore()
  const { addMessage, trades } = useP2PStore()
  
  const [message, setMessage] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  // Mock chat data
  const [chatUser] = React.useState({
    id: userId,
    name: 'Maria Silva',
    avatar: undefined,
    isOnline: true,
    lastSeen: new Date().toISOString()
  })

  // Get relevant trade if this is a P2P chat
  const relatedTrade = React.useMemo(() => {
    if (context === 'p2p' && adId) {
      return trades.find(t => t.orderId === adId && 
        (t.buyerId === userId || t.sellerId === userId))
    }
    return null
  }, [context, adId, trades, userId])

  // Mock messages
  const [messages] = React.useState([
    {
      id: '1',
      senderId: userId,
      senderName: chatUser.name,
      text: 'Olá! Vi seu anúncio e tenho interesse.',
      timestamp: '2024-08-17T10:30:00Z',
      type: 'text' as const
    },
    {
      id: '2',
      senderId: user!.id,
      senderName: user!.name,
      text: 'Oi! Claro, que quantidade você gostaria?',
      timestamp: '2024-08-17T10:32:00Z',
      type: 'text' as const
    },
    {
      id: '3',
      senderId: userId,
      senderName: chatUser.name,
      text: 'Estou pensando em 1000 BZR. O preço é negociável?',
      timestamp: '2024-08-17T10:35:00Z',
      type: 'text' as const
    }
  ])

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!message.trim()) return

    setIsLoading(true)
    
    try {
      // Add message to P2P trade if in context
      if (relatedTrade) {
        addMessage(relatedTrade.id, {
          tradeId: relatedTrade.id,
          senderId: user!.id,
          senderName: user!.name,
          text: message.trim()
        })
      }

      // Mock sending message
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setMessage('')
      toast.success('Mensagem enviada!')
    } catch (error) {
      toast.error('Erro ao enviar mensagem')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col h-[600px]">
        {/* Header */}
        <Card className="p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                <ArrowLeft size={16} />
              </Button>
              
              <Avatar src={chatUser.avatar} fallback={chatUser.name} />
              
              <div>
                <h2 className="font-semibold text-matte-black-900">
                  {chatUser.name}
                </h2>
                <div className="flex items-center space-x-2">
                  {chatUser.isOnline ? (
                    <Badge variant="success" size="sm">Online</Badge>
                  ) : (
                    <span className="text-sm text-matte-black-500">
                      Visto por último: {formatMessageTime(chatUser.lastSeen)}
                    </span>
                  )}
                  
                  {context === 'p2p' && (
                    <Badge variant="primary" size="sm">
                      P2P Trading
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <Button variant="ghost" size="sm">
              <MoreVertical size={16} />
            </Button>
          </div>

          {/* P2P Trade Info */}
          {relatedTrade && (
            <div className="mt-4 p-4 bg-bazari-red-50 rounded-xl border border-bazari-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-bazari-red-800">
                    Negociação P2P Ativa
                  </h3>
                  <p className="text-sm text-bazari-red-700">
                    {relatedTrade.amount} BZR por {new Intl.NumberFormat('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    }).format(relatedTrade.totalBRL)}
                  </p>
                </div>
                
                <Badge 
                  variant={
                    relatedTrade.status === 'completed' ? 'success' :
                    relatedTrade.status === 'cancelled' ? 'danger' : 'warning'
                  }
                  size="sm"
                >
                  {relatedTrade.status === 'initiated' && 'Iniciado'}
                  {relatedTrade.status === 'payment_pending' && 'Pagamento Pendente'}
                  {relatedTrade.status === 'payment_confirmed' && 'Pag. Confirmado'}
                  {relatedTrade.status === 'completed' && 'Concluído'}
                  {relatedTrade.status === 'cancelled' && 'Cancelado'}
                </Badge>
              </div>
            </div>
          )}
        </Card>

        {/* Messages */}
        <Card className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-4">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${
                  msg.senderId === user?.id ? 'justify-end' : 'justify-start'
                }`}
              >
                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                  msg.senderId === user?.id
                    ? 'bg-bazari-red text-white'
                    : 'bg-sand-100 text-matte-black-900'
                }`}>
                  <p className="text-sm">{msg.text}</p>
                  <p className={`text-xs mt-1 ${
                    msg.senderId === user?.id
                      ? 'text-white/70'
                      : 'text-matte-black-500'
                  }`}>
                    {formatMessageTime(msg.timestamp)}
                  </p>
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </Card>

        {/* Input */}
        <Card className="p-4 mt-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm">
              <Paperclip size={16} />
            </Button>
            
            <Button variant="ghost" size="sm">
              <Image size={16} />
            </Button>
            
            <div className="flex-1 relative">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                className="w-full px-4 py-3 rounded-xl border border-sand-300 focus:border-bazari-red focus:ring-1 focus:ring-bazari-red resize-none"
                rows={1}
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
              
              <Button variant="ghost" size="sm" className="absolute right-2 top-2">
                <Smile size={16} />
              </Button>
            </div>
            
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || isLoading}
              loading={isLoading}
            >
              <Send size={16} />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
