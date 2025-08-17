import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { Textarea } from '@shared/ui/Textarea'
import { useI18n } from '@app/providers/I18nProvider'
import { useAuthStore } from '../store/authStore'
import { toast } from '@features/notifications/components/NotificationToastHost'

interface ImportSeedProps {
  onBack: () => void
}

export const ImportSeed: React.FC<ImportSeedProps> = ({ onBack }) => {
  const navigate = useNavigate()
  const { t } = useI18n()
  const { login } = useAuthStore()
  const [seedPhrase, setSeedPhrase] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)

  const handleImport = async () => {
    const words = seedPhrase.trim().split(/\s+/)
    
    if (words.length !== 12 && words.length !== 24) {
      toast.error('Seed phrase deve conter 12 ou 24 palavras')
      return
    }

    setIsLoading(true)
    
    try {
      // Mock validation and account restoration
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Create restored user
      const restoredUser = {
        id: crypto.randomUUID(),
        name: 'Usuário Restaurado',
        walletAddress: `0x${Array.from(crypto.getRandomValues(new Uint8Array(20)), b => b.toString(16).padStart(2, '0')).join('')}`,
        reputation: {
          rating: 4.5,
          reviewCount: 15
        },
        createdAt: '2024-01-01T00:00:00.000Z',
        lastLoginAt: new Date().toISOString()
      }

      login(restoredUser)
      toast.success('Conta restaurada com sucesso!')
      navigate('/dashboard')
    } catch (error) {
      toast.error('Erro ao restaurar conta. Verifique sua seed phrase.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={onBack} className="mr-4">
          <ArrowLeft size={16} />
        </Button>
        <h2 className="text-2xl font-bold text-matte-black-900">
          {t('auth.import.seed_title')}
        </h2>
      </div>

      <div className="mb-6">
        <Textarea
          label="Seed Phrase"
          placeholder={t('auth.import.seed_placeholder')}
          value={seedPhrase}
          onChange={(e) => setSeedPhrase(e.target.value)}
          rows={4}
          className="font-mono"
          helperText="Digite suas 12 ou 24 palavras separadas por espaços"
        />
      </div>

      <Button
        onClick={handleImport}
        disabled={!seedPhrase.trim() || isLoading}
        loading={isLoading}
        className="w-full"
        size="lg"
      >
        Restaurar Conta
      </Button>
    </Card>
  )
}
