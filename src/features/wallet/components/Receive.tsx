
import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Copy, 
  Share2, 
  QrCode as QrCodeIcon, 
  Eye, 
  EyeOff,
  AlertTriangle,
  ExternalLink
} from 'lucide-react'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { Input } from '@shared/ui/Input'
import { Badge } from '@shared/ui/Badge'
import { useI18n } from '@app/providers/I18nProvider'
import { useActiveAccount } from '../hooks/useActiveAccount'
import { useTokens } from '../hooks/useTokens'
import { qrService } from '../services/qr'
import { substrateService } from '../services/substrateService'
import { toast } from '@features/notifications/components/NotificationToastHost'

export const Receive: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useI18n()
  const { activeAccount, formatAddress } = useActiveAccount()
  const { tokens, nativeToken } = useTokens()
  
  const [showQR, setShowQR] = React.useState(false)
  const [showFullAddress, setShowFullAddress] = React.useState(false)
  const [selectedToken, setSelectedToken] = React.useState(nativeToken?.key || 'BZR')
  const [requestAmount, setRequestAmount] = React.useState('')
  const [requestMemo, setRequestMemo] = React.useState('')
  const [chainInfo, setChainInfo] = React.useState<any>(null)

  // Load chain info
  React.useEffect(() => {
    const loadChainInfo = async () => {
      try {
        const info = await substrateService.getChainInfo()
        setChainInfo(info)
      } catch (error) {
        console.error('Failed to load chain info:', error)
      }
    }
    
    loadChainInfo()
  }, [])

  const selectedTokenData = tokens.find(token => token.key === selectedToken)
  const address = activeAccount?.address || ''
  
  const displayAddress = showFullAddress 
    ? address 
    : formatAddress(address, 8)

  // Generate QR code with payment request
  const generateQRCode = () => {
    if (!address) return ''
    
    try {
      if (requestAmount && selectedTokenData) {
        return qrService.generatePaymentQR(
          address, 
          requestAmount, 
          selectedTokenData.symbol
        )
      } else {
        return qrService.generateQRCodeSVG(address, {
          size: 240,
          margin: 6
        })
      }
    } catch (error) {
      console.error('Failed to generate QR code:', error)
      return ''
    }
  }

  const qrCodeSVG = generateQRCode()

  const handleCopyAddress = async () => {
    if (!address) return
    
    try {
      await navigator.clipboard.writeText(address)
      toast.success(t('wallet.address_copied') || 'Endereço copiado!')
    } catch (error) {
      toast.error(t('wallet.copy_failed') || 'Erro ao copiar')
    }
  }

  const handleSharePaymentRequest = async () => {
    if (!address) return
    
    try {
      const paymentText = requestAmount && selectedTokenData 
        ? `Envie ${requestAmount} ${selectedTokenData.symbol} para: ${address}`
        : `Envie para meu endereço: ${address}`
      
      if (navigator.share) {
        await navigator.share({
          title: t('wallet.payment_request') || 'Solicitação de Pagamento',
          text: paymentText,
          url: `substrate:${address}${requestAmount ? `?amount=${requestAmount}&token=${selectedTokenData?.symbol}` : ''}`
        })
      } else {
        await navigator.clipboard.writeText(paymentText)
        toast.success(t('wallet.payment_request_copied') || 'Solicitação copiada!')
      }
    } catch (error) {
      // User cancelled sharing or clipboard failed
    }
  }

  const handleDownloadQR = () => {
    if (!qrCodeSVG) return
    
    try {
      const blob = new Blob([qrCodeSVG], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `wallet-qr-${address.slice(0, 8)}.svg`
      a.click()
      URL.revokeObjectURL(url)
      
      toast.success(t('wallet.qr_downloaded') || 'QR Code baixado!')
    } catch (error) {
      toast.error(t('wallet.download_failed') || 'Erro no download')
    }
  }

  if (!activeAccount) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-semibold text-matte-black-900 mb-4">
            {t('wallet.no_account_title') || 'Nenhuma conta encontrada'}
          </h2>
          <p className="text-matte-black-600 mb-6">
            {t('wallet.no_account_description') || 'Crie ou importe uma conta para receber pagamentos.'}
          </p>
          <Button
            onClick={() => navigate('/wallet/accounts')}
            variant="primary"
          >
            {t('wallet.manage_accounts') || 'Gerenciar Contas'}
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-sand-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4 mb-4">
            <Button
              onClick={() => navigate('/wallet')}
              variant="ghost"
              size="sm"
            >
              <ArrowLeft size={16} className="mr-2" />
              {t('common.back') || 'Voltar'}
            </Button>
            
            <h1 className="text-3xl font-bold text-matte-black-900">
              {t('wallet.receive.title') || 'Receber'}
            </h1>
          </div>
          
          <p className="text-matte-black-600">
            {t('wallet.receive.description') || 'Compartilhe seu endereço para receber pagamentos.'}
          </p>
        </motion.div>

        {/* Account Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-matte-black-900">
                  {activeAccount.name}
                </h3>
                <div className="flex items-center space-x-2">
                  <span 
                    className="text-sm text-matte-black-600 font-mono cursor-pointer hover:text-matte-black-900"
                    onClick={() => setShowFullAddress(!showFullAddress)}
                  >
                    {displayAddress}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-auto"
                    onClick={handleCopyAddress}
                  >
                    <Copy size={14} />
                  </Button>
                </div>
              </div>
              
              {chainInfo && (
                <Badge variant="outline">
                  {chainInfo.name}
                </Badge>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Payment Request Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-matte-black-900 mb-4">
              {t('wallet.receive.payment_request') || 'Solicitação de Pagamento (Opcional)'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-matte-black-700 mb-2">
                  {t('wallet.receive.select_token') || 'Selecionar Token'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {tokens.slice(0, 6).map(token => (
                    <button
                      key={token.key}
                      onClick={() => setSelectedToken(token.key)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        selectedToken === token.key
                          ? 'border-bazari-red bg-bazari-red-50'
                          : 'border-sand-200 hover:border-sand-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-bazari-red to-bazari-gold rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-xs">
                            {token.symbol.charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium text-sm">
                          {token.symbol}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={t('wallet.receive.amount') || 'Valor (Opcional)'}
                  type="number"
                  step="0.000001"
                  placeholder="0.000000"
                  value={requestAmount}
                  onChange={(e) => setRequestAmount(e.target.value)}
                  rightIcon={selectedTokenData && (
                    <span className="text-sm text-matte-black-600">
                      {selectedTokenData.symbol}
                    </span>
                  )}
                />
                
                <Input
                  label={t('wallet.receive.memo') || 'Memo (Opcional)'}
                  placeholder={t('wallet.receive.memo_placeholder') || 'Descrição do pagamento...'}
                  value={requestMemo}
                  onChange={(e) => setRequestMemo(e.target.value)}
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* QR Code */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <Card className="p-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-matte-black-900 mb-4">
                {t('wallet.receive.qr_code') || 'QR Code'}
              </h2>
              
              {showQR && qrCodeSVG ? (
                <div className="space-y-4">
                  <div 
                    className="w-60 h-60 mx-auto bg-white p-4 rounded-xl border border-sand-200"
                    dangerouslySetInnerHTML={{ __html: qrCodeSVG }}
                  />
                  
                  <div className="flex justify-center space-x-2">
                    <Button
                      onClick={() => setShowQR(false)}
                      variant="outline"
                      size="sm"
                    >
                      <EyeOff size={16} className="mr-2" />
                      {t('wallet.receive.hide_qr') || 'Ocultar'}
                    </Button>
                    
                    <Button
                      onClick={handleDownloadQR}
                      variant="outline"
                      size="sm"
                    >
                      <ExternalLink size={16} className="mr-2" />
                      {t('wallet.receive.download') || 'Baixar'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="w-60 h-60 mx-auto bg-sand-100 rounded-xl flex items-center justify-center border-2 border-dashed border-sand-300">
                  <Button
                    onClick={() => setShowQR(true)}
                    variant="outline"
                    size="sm"
                  >
                    <Eye size={16} className="mr-2" />
                    {t('wallet.receive.show_qr') || 'Mostrar QR Code'}
                  </Button>
                </div>
              )}
              
              <p className="text-sm text-matte-black-600 mt-4">
                {t('wallet.receive.qr_description') || 'Escaneie para enviar pagamento'}
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Share Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-matte-black-900 mb-4">
              {t('wallet.receive.share_options') || 'Opções de Compartilhamento'}
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                onClick={handleCopyAddress}
                variant="outline"
                className="flex items-center justify-center h-12"
              >
                <Copy size={20} className="mr-3" />
                <div className="text-left">
                  <p className="font-medium">{t('wallet.receive.copy_address') || 'Copiar Endereço'}</p>
                  <p className="text-xs text-matte-black-600">
                    {t('wallet.receive.copy_address_desc') || 'Endereço simples'}
                  </p>
                </div>
              </Button>
              
              <Button
                onClick={handleSharePaymentRequest}
                variant="outline"
                className="flex items-center justify-center h-12"
              >
                <Share2 size={20} className="mr-3" />
                <div className="text-left">
                  <p className="font-medium">{t('wallet.receive.share_request') || 'Compartilhar Solicitação'}</p>
                  <p className="text-xs text-matte-black-600">
                    {requestAmount 
                      ? t('wallet.receive.with_amount') || 'Com valor'
                      : t('wallet.receive.simple_share') || 'Compartilhamento simples'
                    }
                  </p>
                </div>
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Network Info & Warnings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6">
            <div className="space-y-4">
              {/* Network Info */}
              {chainInfo && (
                <div className="p-4 bg-sand-50 rounded-lg">
                  <h3 className="font-medium text-matte-black-900 mb-2">
                    {t('wallet.receive.network_info') || 'Informações da Rede'}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-matte-black-600">
                        {t('wallet.receive.network') || 'Rede'}:
                      </span>
                      <span className="ml-2 font-medium text-matte-black-900">
                        {chainInfo.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-matte-black-600">
                        {t('wallet.receive.prefix') || 'Prefixo'}:
                      </span>
                      <span className="ml-2 font-medium text-matte-black-900">
                        {chainInfo.ss58Prefix}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Warnings */}
              <div className="p-4 bg-bazari-red-50 border border-bazari-red-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertTriangle size={20} className="text-bazari-red mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-bazari-red-800 mb-2">
                      {t('wallet.receive.important_notes') || 'Notas Importantes'}
                    </h3>
                    <ul className="text-sm text-bazari-red-700 space-y-1">
                      <li>• {t('wallet.receive.note_1') || 'Este endereço recebe apenas tokens da rede Substrate'}</li>
                      <li>• {t('wallet.receive.note_2') || 'Verifique sempre a rede antes de enviar'}</li>
                      <li>• {t('wallet.receive.note_3') || 'Transações são irreversíveis'}</li>
                      <li>• {t('wallet.receive.note_4') || 'Guarde este endereço com segurança'}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}