import React from 'react'
import { motion } from 'framer-motion'
import { Send, Scan } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { Input } from '@shared/ui/Input'
import { useI18n } from '@app/providers/I18nProvider'
import { useWalletStore } from '../store/walletStore'
import { toast } from '@features/notifications/components/NotificationToastHost'

export const WalletSend: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useI18n()
  const { balance, sendMoney } = useWalletStore()
  const [recipient, setRecipient] = React.useState('')
  const [amount, setAmount] = React.useState('')
  const [currency, setCurrency] = React.useState<'BZR' | 'BRL'>('BZR')
  const [isLoading, setIsLoading] = React.useState(false)

  const handleSend = async () => {
    if (!recipient || !amount) {
      toast.error('Preencha todos os campos')
      return
    }

    const amountValue = parseFloat(amount)
    if (isNaN(amountValue) || amountValue <= 0) {
      toast.error('Valor inválido')
      return
    }

    if (amountValue > balance[currency]) {
      toast.error('Saldo insuficiente')
      return
    }

    setIsLoading(true)
    try {
      await sendMoney(recipient, amountValue, currency)
      toast.success('Transação enviada com sucesso!')
      navigate('/wallet')
    } catch (error) {
      toast.error('Erro ao enviar transação')
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number, currency: 'BZR' | 'BRL') => {
    if (currency === 'BRL') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(amount)
    }
    return `${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} BZR`
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-matte-black-900 mb-2">
          {t('wallet.send_money')}
        </h1>
        <p className="text-matte-black-600">
          Envie BZR ou BRL para outro usuário
        </p>
      </motion.div>

      <Card className="p-6">
        <div className="space-y-6">
          {/* Currency Selection */}
          <div>
            <label className="form-label">Moeda</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setCurrency('BZR')}
                className={`p-4 rounded-xl border-2 text-left transition-colors ${
                  currency === 'BZR'
                    ? 'border-bazari-red bg-bazari-red-50'
                    : 'border-sand-200 hover:border-bazari-red-200'
                }`}
              >
                <div className="font-semibold text-matte-black-900">BZR</div>
                <div className="text-sm text-matte-black-600">
                  Saldo: {formatCurrency(balance.BZR, 'BZR')}
                </div>
              </button>
              <button
                onClick={() => setCurrency('BRL')}
                className={`p-4 rounded-xl border-2 text-left transition-colors ${
                  currency === 'BRL'
                    ? 'border-success bg-success-50'
                    : 'border-sand-200 hover:border-success-200'
                }`}
              >
                <div className="font-semibold text-matte-black-900">BRL</div>
                <div className="text-sm text-matte-black-600">
                  Saldo: {formatCurrency(balance.BRL, 'BRL')}
                </div>
              </button>
            </div>
          </div>

          {/* Recipient */}
          <Input
            label="Destinatário"
            placeholder="Endereço da carteira ou username"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            rightIcon={
              <Button variant="ghost" size="sm" className="p-1">
                <Scan size={16} />
              </Button>
            }
          />

          {/* Amount */}
          <Input
            label="Valor"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            helperText={`Disponível: ${formatCurrency(balance[currency], currency)}`}
          />

          {/* Send Button */}
          <Button
            onClick={handleSend}
            disabled={!recipient || !amount || isLoading}
            loading={isLoading}
            className="w-full"
            size="lg"
          >
            <Send size={20} className="mr-2" />
            Enviar {currency}
          </Button>
        </div>
      </Card>
    </div>
  )
}
