import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Image, Smile } from 'lucide-react'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { Avatar } from '@shared/ui/Avatar'
import { useAuthStore } from '@features/auth/store/authStore'
import { toast } from '@features/notifications/components/NotificationToastHost'

export const SocialCreate: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [content, setContent] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)

  const handlePost = async () => {
    if (!content.trim()) {
      toast.error('Escreva algo para publicar')
      return
    }

    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Post publicado com sucesso!')
      navigate('/social')
    } catch (error) {
      toast.error('Erro ao publicar post')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-matte-black-900 mb-2">
          Criar Post
        </h1>
        <p className="text-matte-black-600">
          Compartilhe algo com a comunidade
        </p>
      </motion.div>

      <Card className="p-6">
        <div className="flex items-start space-x-4 mb-6">
          <Avatar src={user?.avatar} fallback={user?.name} />
          <div className="flex-1">
            <h3 className="font-semibold text-matte-black-900 mb-2">
              {user?.name}
            </h3>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="No que você está pensando?"
              className="w-full p-4 border border-sand-300 rounded-xl focus:border-bazari-red focus:ring-1 focus:ring-bazari-red resize-none"
              rows={6}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm">
              <Image size={16} className="mr-2" />
              Foto
            </Button>
            
            <Button variant="ghost" size="sm">
              <Smile size={16} className="mr-2" />
              Emoji
            </Button>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => navigate('/social')}
            >
              Cancelar
            </Button>
            
            <Button
              onClick={handlePost}
              disabled={!content.trim() || isLoading}
              loading={isLoading}
            >
              Publicar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
