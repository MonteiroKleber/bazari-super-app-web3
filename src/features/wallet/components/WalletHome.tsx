import React from 'react'
import { motion } from 'framer-motion'
import { Send, Download, History, Eye, EyeOff, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { Badge } from '@shared/ui/Badge'
import { LoadingSpinner } from '@shared/ui/LoadingSpinner'
import { useI18n } from '@app/providers/I18nProvider'
import { useWalletStore } from '../store/walletStore'

export const WalletHome: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useI18n()
  const { balance, transactions, isLoading, refreshBalance } = useWalletStore()
  const [showBalance, setShowBalance] = React.useState(true)

  const formatCurrency = (amount: number, currency: 'BZR' | 'BRL') => {
    if (currency === 'BRL') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(amount)
    }
    return `${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} BZR`
  }

  const recentTransactions = transactions.slice(0, 5)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-matte-black-900 mb-2">
          {t('wallet.title')}
        </h1>
        <p className="text-matte-black-600">
          Gerencie seus fundos BZR e BRL
        </p>
      </motion.div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 bg-gradient-to-br from-bazari-red to-bazari-red-700 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Bazari Token (BZR)</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBalance(!showBalance)}
                className="text-white hover:bg-white/20 p-2"
              >
                {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
              </Button>
            </div>
            <div className="text-3xl font-bold mb-6">
              {showBalance ? formatCurrency(balance.BZR, 'BZR') : '••••••'}
            </div>
            <div className="flex space-x-3">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => navigate('/wallet/send')}
                className="flex-1"
              >
                <Send size={16} className="mr-2" />
                {t('wallet.send_money')}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/wallet/receive')}
                className="flex-1 text-white border-white hover:bg-white hover:text-bazari-red"
              >
                <Download size={16} className="mr-2" />
                {t('wallet.receive_money')}
              </Button>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 bg-gradient-to-br from-success to-success-700 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Real Brasileiro (BRL)</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshBalance}
                disabled={isLoading}
                className="text-white hover:bg-white/20 p-2"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" className="text-white" />
                ) : (
                  <RefreshCw size={16} />
                )}
              </Button>
            </div>
            <div className="text-3xl font-bold mb-6">
              {showBalance ? formatCurrency(balance.BRL, 'BRL') : '••••••'}
            </div>
            <div className="text-sm opacity-90">
              Disponível para P2P e saques
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-matte-black-900">
              {t('wallet.transaction_history')}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/wallet/history')}
            >
              <History size={16} className="mr-2" />
              Ver Todas
            </Button>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-matte-black-500">
                Nenhuma transação encontrada
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-sand-50 rounded-xl"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'send' ? 'bg-danger-100' : 'bg-success-100'
                    }`}>
                      {transaction.type === 'send' ? (
                        <Send size={16} className="text-danger" />
                      ) : (
                        <Download size={16} className="text-success" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-matte-black-900">
                        {transaction.type === 'send' ? 'Envio' : 'Recebimento'}
                      </p>
                      <p className="text-sm text-matte-black-600">
                        {new Date(transaction.timestamp).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'send' ? 'text-danger' : 'text-success'
                    }`}>
                      {transaction.type === 'send' ? '-' : '+'}
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </p>
                    <Badge
                      variant={
                        transaction.status === 'confirmed' ? 'success' :
                        transaction.status === 'pending' ? 'warning' : 'danger'
                      }
                      size="sm"
                    >
                      {transaction.status === 'confirmed' && 'Confirmado'}
                      {transaction.status === 'pending' && 'Pendente'}
                      {transaction.status === 'failed' && 'Falhou'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  )
}
