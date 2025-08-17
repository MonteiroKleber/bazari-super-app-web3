import React from 'react'
import { motion } from 'framer-motion'
import { Camera, Save } from 'lucide-react'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { Input } from '@shared/ui/Input'
import { Textarea } from '@shared/ui/Textarea'
import { Avatar } from '@shared/ui/Avatar'
import { useI18n } from '@app/providers/I18nProvider'
import { useAuthStore } from '@features/auth/store/authStore'
import { toast } from '@features/notifications/components/NotificationToastHost'

export const ProfileEdit: React.FC = () => {
  const { t } = useI18n()
  const { user, setUser } = useAuthStore()
  
  const [formData, setFormData] = React.useState({
    name: user?.name || '',
    bio: '',
    email: user?.email || '',
    phone: '',
    location: '',
    website: '',
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    privacy: {
      showEmail: false,
      showPhone: false,
      showLocation: true
    }
  })
  
  const [isLoading, setIsLoading] = React.useState(false)

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório')
      return
    }

    setIsLoading(true)
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update user data
      if (user) {
        setUser({
          ...user,
          name: formData.name,
          email: formData.email || undefined
        })
      }
      
      toast.success('Perfil atualizado com sucesso!')
    } catch (error) {
      toast.error('Erro ao atualizar perfil')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-matte-black-900 mb-2">
          Editar Perfil
        </h1>
        <p className="text-matte-black-600">
          Mantenha suas informações atualizadas
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-matte-black-900 mb-6">
              Informações Básicas
            </h2>
            
            {/* Avatar */}
            <div className="flex items-center space-x-6 mb-6">
              <Avatar 
                src={user?.avatar} 
                fallback={user?.name}
                size="xl"
                className="w-20 h-20"
              />
              
              <div>
                <Button variant="outline" size="sm" className="mb-2">
                  <Camera size={16} className="mr-2" />
                  Alterar Foto
                </Button>
                <p className="text-sm text-matte-black-500">
                  Recomendado: 400x400px, máximo 2MB
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nome Completo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              
              <Input
                label="Telefone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              
              <Input
                label="Localização"
                placeholder="Cidade, Estado"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            
            <div className="mt-4">
              <Textarea
                label="Bio"
                placeholder="Conte um pouco sobre você e sua experiência..."
                rows={4}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                helperText="Máximo 500 caracteres"
              />
            </div>
          </Card>

          {/* Privacy Settings */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-matte-black-900 mb-6">
              Configurações de Privacidade
            </h2>
            
            <div className="space-y-4">
              {[
                { key: 'showEmail', label: 'Mostrar email no perfil público' },
                { key: 'showPhone', label: 'Mostrar telefone no perfil público' },
                { key: 'showLocation', label: 'Mostrar localização no perfil público' }
              ].map((setting) => (
                <div key={setting.key} className="flex items-center justify-between p-4 bg-sand-50 rounded-xl">
                  <span className="text-matte-black-700">{setting.label}</span>
                  
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.privacy[setting.key as keyof typeof formData.privacy]}
                      onChange={(e) => setFormData({
                        ...formData,
                        privacy: {
                          ...formData.privacy,
                          [setting.key]: e.target.checked
                        }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-bazari-red"></div>
                  </label>
                </div>
              ))}
            </div>
          </Card>

          {/* Notification Settings */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-matte-black-900 mb-6">
              Notificações
            </h2>
            
            <div className="space-y-4">
              {[
                { key: 'email', label: 'Notificações por email' },
                { key: 'push', label: 'Notificações push' },
                { key: 'sms', label: 'Notificações por SMS' }
              ].map((setting) => (
                <div key={setting.key} className="flex items-center justify-between p-4 bg-sand-50 rounded-xl">
                  <span className="text-matte-black-700">{setting.label}</span>
                  
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.notifications[setting.key as keyof typeof formData.notifications]}
                      onChange={(e) => setFormData({
                        ...formData,
                        notifications: {
                          ...formData.notifications,
                          [setting.key]: e.target.checked
                        }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
                  </label>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card className="p-6">
            <Button
              onClick={handleSave}
              disabled={isLoading}
              loading={isLoading}
              className="w-full mb-3"
              size="lg"
            >
              <Save size={16} className="mr-2" />
              {t('app.actions.save')}
            </Button>
            
            <Button variant="outline" className="w-full">
              Visualizar Perfil
            </Button>
          </Card>

          {/* Account Stats */}
          <Card className="p-6">
            <h3 className="font-semibold text-matte-black-900 mb-4">
              Estatísticas da Conta
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-matte-black-600">Membro desde:</span>
                <span>Jun 2024</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-matte-black-600">Último acesso:</span>
                <span>Agora</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-matte-black-600">Reputação:</span>
                <span className="text-bazari-gold-600">★ {user?.reputation.rating.toFixed(1)}</span>
              </div>
            </div>
          </Card>

          {/* Security */}
          <Card className="p-6">
            <h3 className="font-semibold text-matte-black-900 mb-4">
              Segurança
            </h3>
            
            <div className="space-y-3">
              <Button variant="outline" size="sm" className="w-full">
                Alterar Senha
              </Button>
              
              <Button variant="outline" size="sm" className="w-full">
                Backup da Wallet
              </Button>
              
              <Button variant="outline" size="sm" className="w-full">
                Autenticação 2FA
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
