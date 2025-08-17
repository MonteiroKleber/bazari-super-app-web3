import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload } from 'lucide-react'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { Input } from '@shared/ui/Input'
import { useI18n } from '@app/providers/I18nProvider'
import { useAuthStore } from '../store/authStore'
import { toast } from '@features/notifications/components/NotificationToastHost'

interface ImportJsonProps {
  onBack: () => void
}

export const ImportJson: React.FC<ImportJsonProps> = ({ onBack }) => {
  const navigate = useNavigate()
  const { t } = useI18n()
  const { login } = useAuthStore()
  const [file, setFile] = React.useState<File | null>(null)
  const [password, setPassword] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile && selectedFile.type === 'application/json') {
      setFile(selectedFile)
    } else {
      toast.error('Por favor, selecione um arquivo JSON válido')
    }
  }

  const handleImport = async () => {
    if (!file || !password) {
      toast.error('Selecione um arquivo e digite a senha')
      return
    }

    setIsLoading(true)
    
    try {
      // Mock file reading and decryption
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Create restored user
      const restoredUser = {
        id: crypto.randomUUID(),
        name: 'Usuário JSON',
        walletAddress: `0x${Array.from(crypto.getRandomValues(new Uint8Array(20)), b => b.toString(16).padStart(2, '0')).join('')}`,
        reputation: {
          rating: 4.2,
          reviewCount: 8
        },
        createdAt: '2024-02-01T00:00:00.000Z',
        lastLoginAt: new Date().toISOString()
      }

      login(restoredUser)
      toast.success('Conta restaurada com sucesso!')
      navigate('/dashboard')
    } catch (error) {
      toast.error('Erro ao restaurar conta. Verifique o arquivo e senha.')
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
          {t('auth.import.json_title')}
        </h2>
      </div>

      <div className="space-y-6">
        <div>
          <label className="form-label">Arquivo JSON</label>
          <div 
            className="border-2 border-dashed border-sand-300 rounded-xl p-8 text-center cursor-pointer hover:border-bazari-red transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={48} className="text-matte-black-300 mx-auto mb-4" />
            {file ? (
              <p className="text-matte-black-900 font-medium">{file.name}</p>
            ) : (
              <p className="text-matte-black-600">
                Clique para selecionar um arquivo JSON
              </p>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        <Input
          type="password"
          label={t('auth.import.password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Digite a senha do arquivo"
        />

        <Button
          onClick={handleImport}
          disabled={!file || !password || isLoading}
          loading={isLoading}
          className="w-full"
          size="lg"
        >
          Restaurar Conta
        </Button>
      </div>
    </Card>
  )
}
