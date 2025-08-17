import React from 'react'
import { motion } from 'framer-motion'
import { Plus, Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { Avatar } from '@shared/ui/Avatar'
import { EmptyState } from '@shared/ui/EmptyState'

export const SocialFeed: React.FC = () => {
  const navigate = useNavigate()

  // Mock posts data
  const posts = [
    {
      id: '1',
      author: {
        name: 'Maria Silva',
        avatar: undefined,
        verified: true
      },
      content: 'Acabei de finalizar mais uma negociação P2P no Bazari! A plataforma está cada vez melhor. 🚀',
      timestamp: '2024-08-17T10:30:00Z',
      likes: 24,
      comments: 8,
      shares: 3,
      hasLiked: false
    },
    {
      id: '2',
      author: {
        name: 'João Santos',
        avatar: undefined,
        verified: false
      },
      content: 'Dica para novatos: sempre verifiquem a reputação do vendedor antes de negociar. Segurança em primeiro lugar! 🔒',
      timestamp: '2024-08-17T09:15:00Z',
      likes: 45,
      comments: 12,
      shares: 8,
      hasLiked: true
    }
  ]

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const postTime = new Date(timestamp)
    const diffMs = now.getTime() - postTime.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    
    if (diffHours < 1) return 'Agora'
    if (diffHours < 24) return `${diffHours}h`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d`
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-matte-black-900">
            Feed Social
          </h1>
          
          <Button onClick={() => navigate('/social/create')}>
            <Plus size={16} className="mr-2" />
            Novo Post
          </Button>
        </div>
      </motion.div>

      {/* Create Post Quick */}
      <Card className="p-6 mb-6">
        <div 
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => navigate('/social/create')}
        >
          <Avatar size="md" fallback="Você" />
          <div className="flex-1 bg-sand-100 rounded-full px-4 py-3 text-matte-black-500">
            No que você está pensando?
          </div>
        </div>
      </Card>

      {/* Posts */}
      {posts.length === 0 ? (
        <EmptyState
          title="Nenhum post ainda"
          description="Seja o primeiro a compartilhar algo com a comunidade!"
          action={
            <Button onClick={() => navigate('/social/create')}>
              <Plus size={16} className="mr-2" />
              Criar Primeiro Post
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Avatar 
                      src={post.author.avatar} 
                      fallback={post.author.name} 
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-matte-black-900">
                          {post.author.name}
                        </h3>
                        {post.author.verified && (
                          <span className="text-bazari-red">✓</span>
                        )}
                      </div>
                      <p className="text-sm text-matte-black-500">
                        {formatTimeAgo(post.timestamp)}
                      </p>
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal size={16} />
                  </Button>
                </div>

                {/* Content */}
                <div className="mb-4">
                  <p className="text-matte-black-700 leading-relaxed">
                    {post.content}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-sand-200">
                  <div className="flex items-center space-x-6">
                    <button 
                      className={`flex items-center space-x-2 transition-colors ${
                        post.hasLiked 
                          ? 'text-bazari-red' 
                          : 'text-matte-black-500 hover:text-bazari-red'
                      }`}
                    >
                      <Heart size={18} className={post.hasLiked ? 'fill-current' : ''} />
                      <span className="text-sm">{post.likes}</span>
                    </button>
                    
                    <button 
                      className="flex items-center space-x-2 text-matte-black-500 hover:text-bazari-red transition-colors"
                      onClick={() => navigate(`/social/post/${post.id}`)}
                    >
                      <MessageCircle size={18} />
                      <span className="text-sm">{post.comments}</span>
                    </button>
                    
                    <button className="flex items-center space-x-2 text-matte-black-500 hover:text-bazari-red transition-colors">
                      <Share2 size={18} />
                      <span className="text-sm">{post.shares}</span>
                    </button>
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
