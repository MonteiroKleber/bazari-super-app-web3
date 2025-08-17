import React from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { Input } from '@shared/ui/Input'
import { useI18n } from '@app/providers/I18nProvider'
import { useAuthStore } from '../store/authStore'
import { toast } from '@features/notifications/components/NotificationToastHost'

export const ExistingAccountLogin: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useI18n()
  const { login } = useAuthStore()
  const [identifier, setIdentifier] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)

  const handleLogin = async () => {
    if (!identifier || !password) {
      toast.error('Preencha todos os campos')
      return
    }

    setIsLoading(true)
    
    try {
      // Mock authentication
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Create logged user
      const loggedUser = {
        id: 'existing-user-id',
        name: 'João Silva',
        email: identifier.includes('@') ? identifier : undefined,
        walletAddress: '0x742d35Cc6634C0532925a3b8D404d6B2E4a5bC4e',
        reputation: {
          rating: 4.8,
          reviewCount: 42
        },
        createdAt: '2023-08-15T00:00:00.000Z',
        lastLoginAt: new Date().toISOString()
      }

      login(loggedUser)
      toast.success('Login realizado com sucesso!')
      navigate('/dashboard')
    } catch (error) {
      toast.error('Credenciais inválidas')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="p-8 max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-bazari-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <LogIn size={32} className="text-bazari-red" />
        </div>
        <h2 className="text-2xl font-bold text-matte-black-900 mb-2">
          {t('auth.login.existing_account')}
        </h2>
        <p className="text-matte-black-600">
          Entre com suas credenciais
        </p>
      </div>

      <div className="space-y-4 mb-6">
        <Input
          type="text"
          label="Email ou Username"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="seu@email.com"
        />

        <Input
          type="password"
          label="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Sua senha"
        />
      </div>

      <Button
        onClick={handleLogin}
        disabled={!identifier || !password || isLoading}
        loading={isLoading}
        className="w-full mb-4"
        size="lg"
      >
        Entrar
      </Button>

      <div className="text-center">
        <Button variant="ghost" size="sm">
          Esqueci minha senha
        </Button>
      </div>
    </Card>
  )
}
