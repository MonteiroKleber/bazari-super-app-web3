import React from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Download, Send, ArrowUpDown } from 'lucide-react'
import { Card } from '@shared/ui/Card'
import { Input } from '@shared/ui/Input'
import { Button } from '@shared/ui/Button'
import { Badge } from '@shared/ui/Badge'
import { EmptyState } from '@shared/ui/EmptyState'
import { useI18n } from '@app/providers/I18nProvider'
import { useWalletStore } from '../store/walletStore'

export const WalletHistory: React.FC = () => {
  const { t } = useI18n()
  const { transactions } = useWalletStore()
  const [searchQuery, setSearchQuery] = React.useState('')
  const [filterType, setFilterType] = React.useState<'all' | 'send' | 'receive'>('all')

  const formatCurrency = (amount: number, currency: 'BZR' | 'BRL') => {
    if (currency === 'BRL') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(amount)
    }
    return `${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} BZR`
  }

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = !searchQuery || 
      tx.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.toAddress?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.fromAddress?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = filterType === 'all' || tx.type === filterType
    
    return matchesSearch && matchesFilter
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-matte-black-900 mb-2">
          {t('wallet.transaction_history')}
        </h1>
        <p className="text-matte-black-600">
          Histórico completo de transações
        </p>
      </motion.div>

      {/* Filters */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar transações..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={20} />}
            />
          </div>
          
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'Todas' },
              { key: 'send', label: 'Enviadas' },
              { key: 'receive', label: 'Recebidas' }
            ].map((filter) => (
              <Button
                key={filter.key}
                variant={filterType === filter.key ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilterType(filter.key as any)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
          
          <Button variant="outline" size="sm">
            <Filter size={16} className="mr-2" />
            Filtros
          </Button>
        </div>
      </Card>

      {/* Transactions List */}
      <Card className="p-6">
        {filteredTransactions.length === 0 ? (
          <EmptyState
            icon={<ArrowUpDown size={48} />}
            title="Nenhuma transação encontrada"
            description="Ajuste os filtros ou faça sua primeira transação."
          />
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 bg-sand-50 rounded-xl hover:bg-sand-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    transaction.type === 'send' ? 'bg-danger-100' : 'bg-success-100'
                  }`}>
                    {transaction.type === 'send' ? (
                      <Send size={20} className="text-danger" />
                    ) : (
                      <Download size={20} className="text-success" />
                    )}
                  </div>
                  
                  <div>
                    <p className="font-medium text-matte-black-900">
                      {transaction.description || 
                        (transaction.type === 'send' ? 'Envio de fundos' : 'Recebimento de fundos')
                      }
                    </p>
                    <p className="text-sm text-matte-black-600">
                      {new Date(transaction.timestamp).toLocaleString('pt-BR')}
                    </p>
                    {(transaction.toAddress || transaction.fromAddress) && (
                      <p className="text-xs text-matte-black-500 font-mono">
                        {transaction.type === 'send' 
                          ? `Para: ${transaction.toAddress?.slice(0, 10)}...`
                          : `De: ${transaction.fromAddress?.slice(0, 10)}...`
                        }
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <p className={`text-lg font-semibold ${
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
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
