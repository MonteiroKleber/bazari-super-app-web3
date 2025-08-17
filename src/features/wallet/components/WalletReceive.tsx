import React from 'react'
import { motion } from 'framer-motion'
import { Copy, Share2, QrCode } from 'lucide-react'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { useI18n } from '@app/providers/I18nProvider'
import { useAuthStore } from '@features/auth/store/authStore'
import { toast } from '@features/notifications/components/NotificationToastHost'

export const WalletReceive: React.FC = () => {
  const { t } = useI18n()
  const { user } = useAuthStore()
  const [showQR, setShowQR] = React.useState(false)

  const walletAddress = user?.walletAddress || ''

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress)
      toast.success('Endereço copiado!')
    } catch (error) {
      toast.error('Erro ao copiar')
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Meu endereço Bazari',
          text: `Envie para meu endereço: ${walletAddress}`
        })
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      handleCopy()
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
          {t('wallet.receive_money')}
        </h1>
        <p className="text-matte-black-600">
          Compartilhe seu endereço para receber pagamentos
        </p>
      </motion.div>

      <div className="space-y-6">
        {/* QR Code */}
        <Card className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-matte-black-900 mb-4">
              QR Code do Endereço
            </h3>
            
            {showQR ? (
              <div className="bg-white p-6 rounded-xl border border-sand-200 mb-4">
                <div className="w-48 h-48 mx-auto bg-matte-black-100 rounded-xl flex items-center justify-center">
                  <QrCode size={64} className="text-matte-black-400" />
                  <div className="absolute text-xs text-matte-black-500">
                    QR Code
                  </div>
                </div>
              </div>
            ) : (
              <div 
                className="w-48 h-48 mx-auto bg-matte-black-100 rounded-xl flex items-center justify-center mb-4 cursor-pointer hover:bg-matte-black-200 transition-colors"
                onClick={() => setShowQR(true)}
              >
                <div className="text-center">
                  <QrCode size={48} className="text-matte-black-400 mx-auto mb-2" />
                  <p className="text-sm text-matte-black-600">
                    Clique para mostrar QR
                  </p>
                </div>
              </div>
            )}
            
            <p className="text-sm text-matte-black-600">
              Escaneie para enviar pagamento
            </p>
          </div>
        </Card>

        {/* Address */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-matte-black-900 mb-4">
            Endereço da Carteira
          </h3>
          
          <div className="bg-sand-50 rounded-xl p-4 mb-4">
            <p className="font-mono text-sm text-matte-black-900 break-all">
              {walletAddress}
            </p>
          </div>
          
          <div className="flex space-x-3">
            <Button
              onClick={handleCopy}
              variant="outline"
              className="flex-1"
            >
              <Copy size={16} className="mr-2" />
              Copiar
            </Button>
            <Button
              onClick={handleShare}
              variant="outline"
              className="flex-1"
            >
              <Share2 size={16} className="mr-2" />
              Compartilhar
            </Button>
          </div>
        </Card>

        {/* Instructions */}
        <Card className="p-6 bg-bazari-red-50 border-bazari-red-200">
          <h3 className="text-lg font-semibold text-bazari-red-800 mb-3">
            Instruções Importantes
          </h3>
          <ul className="text-sm text-bazari-red-700 space-y-2">
            <li>• Este endereço recebe tanto BZR quanto BRL</li>
            <li>• Verifique sempre o endereço antes de compartilhar</li>
            <li>• Transações na blockchain são irreversíveis</li>
            <li>• Use apenas em redes compatíveis</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
