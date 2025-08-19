
import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  ArrowUpDown, 
  Send, 
  Download, 
  Filter, 
  Calendar,
  Search,
  Copy,
  ExternalLink,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { Input } from '@shared/ui/Input'
import { Badge } from '@shared/ui/Badge'
import { EmptyState } from '@shared/ui/EmptyState'
import { LoadingSpinner } from '@shared/ui/LoadingSpinner'
import { useI18n } from '@app/providers/I18nProvider'
import { useActiveAccount } from '../hooks/useActiveAccount'
import { useTokens } from '../hooks/useTokens'
import { useWalletStore } from '../store/walletStore'
import { Tx } from '../types/wallet.types'
import { toast } from '@features/notifications/components/NotificationToastHost'

type FilterType = 'all' | 'send' | 'receive' | 'mint' | 'burn'
type SortOption = 'newest' | 'oldest' | 'amount_desc' | 'amount_asc'

export const History: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useI18n()
  const { activeAccount, formatAddress } = useActiveAccount()
  const { tokens, getAllTokens } = useTokens()
  const { getAccountHistory } = useWalletStore()
  
  const [searchQuery, setSearchQuery] = React.useState('')
  const [filterType, setFilterType] = React.useState<FilterType>('all')
  const [sortBy, setSortBy] = React.useState<SortOption>('newest')
  const [dateRange, setDateRange] = React.useState({ start: '', end: '' })
  const [showFilters, setShowFilters] = React.useState(false)
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  const transactions = activeAccount ? getAccountHistory(activeAccount.id) : []
  const allTokens = getAllTokens()

  // Filter and sort transactions
  const filteredTransactions = React.useMemo(() => {
    let filtered = transactions.filter(tx => {
      // Filter by type
      if (filterType !== 'all' && tx.kind !== filterType) {
        return false
      }
      
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          tx.hash.toLowerCase().includes(query) ||
          tx.from?.toLowerCase().includes(query) ||
          tx.to?.toLowerCase().includes(query) ||
          tx.assetKey.toLowerCase().includes(query)
        )
      }
      
      // Filter by date range
      if (dateRange.start) {
        const txDate = new Date(tx.time)
        const startDate = new Date(dateRange.start)
        if (txDate < startDate) return false
      }
      
      if (dateRange.end) {
        const txDate = new Date(tx.time)
        const endDate = new Date(dateRange.end)
        endDate.setHours(23, 59, 59, 999) // End of day
        if (txDate > endDate) return false
      }
      
      return true
    })

    // Sort transactions
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.time - a.time
        case 'oldest':
          return a.time - b.time
        case 'amount_desc':
          return parseFloat(b.amount || '0') - parseFloat(a.amount || '0')
        case 'amount_asc':
          return parseFloat(a.amount || '0') - parseFloat(b.amount || '0')
        default:
          return b.time - a.time
      }
    })

    return filtered
  }, [transactions, filterType, searchQuery, sortBy, dateRange])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // In a real implementation, this would refetch transactions from the blockchain
    toast.success(t('wallet.history.refreshed') || 'Histórico atualizado!')
    setIsRefreshing(false)
  }

  const handleCopyHash = async (hash: string) => {
    try {
      await navigator.clipboard.writeText(hash)
      toast.success(t('wallet.hash_copied') || 'Hash copiado!')
    } catch (error) {
      toast.error(t('wallet.copy_failed') || 'Erro ao copiar')
    }
  }

  const getTransactionIcon = (tx: Tx) => {
    switch (tx.kind) {
      case 'send':
        return <Send size={20} className="text-danger" />
      case 'receive':
        return <Download size={20} className="text-success" />
      case 'mint':
        return <ArrowUpDown size={20} className="text-bazari-gold" />
      case 'burn':
        return <ArrowUpDown size={20} className="text-matte-black-600" />
      default:
        return <ArrowUpDown size={20} className="text-matte-black-600" />
    }
  }

  const getStatusIcon = (status: Tx['status']) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} className="text-warning" />
      case 'included':
        return <AlertCircle size={16} className="text-bazari-gold" />
      case 'finalized':
        return <CheckCircle size={16} className="text-success" />
      case 'failed':
        return <XCircle size={16} className="text-danger" />
      default:
        return <Clock size={16} className="text-matte-black-400" />
    }
  }

  const getStatusText = (status: Tx['status']) => {
    switch (status) {
      case 'pending':
        return t('wallet.status.pending') || 'Pendente'
      case 'included':
        return t('wallet.status.included') || 'Incluída'
      case 'finalized':
        return t('wallet.status.finalized') || 'Finalizada'
      case 'failed':
        return t('wallet.status.failed') || 'Falhou'
      default:
        return status
    }
  }

  const formatTransactionAmount = (tx: Tx) => {
    if (!tx.amount) return ''
    
    const token = allTokens.find(t => t.key === tx.assetKey)
    if (!token) return `${tx.amount} ${tx.assetKey}`
    
    const amount = parseFloat(tx.amount) / Math.pow(10, token.decimals)
    const sign = tx.kind === 'send' ? '-' : '+'
    
    return `${sign}${amount.toFixed(6)} ${token.symbol}`
  }

  const getTransactionTitle = (tx: Tx) => {
    switch (tx.kind) {
      case 'send':
        return t('wallet.history.sent') || 'Enviado'
      case 'receive':
        return t('wallet.history.received') || 'Recebido'
      case 'mint':
        return t('wallet.history.minted') || 'Criado'
      case 'burn':
        return t('wallet.history.burned') || 'Queimado'
      default:
        return tx.kind
    }
  }

  if (!activeAccount) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center">
        <EmptyState
          icon={<ArrowUpDown size={48} />}
          title={t('wallet.no_account_title') || 'Nenhuma conta encontrada'}
          description={t('wallet.no_account_description') || 'Selecione uma conta para ver o histórico.'}
          action={
            <Button onClick={() => navigate('/wallet')} variant="primary">
              {t('wallet.back_to_wallet') || 'Voltar à Carteira'}
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-sand-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
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
              {t('wallet.history.title') || 'Histórico de Transações'}
            </h1>
          </div>
          
          <p className="text-matte-black-600">
            {t('wallet.history.description') || 'Veja todas as suas transações de'} {activeAccount.name}
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
              <div className="flex-1">
                <Input
                  placeholder={t('wallet.history.search_placeholder') || 'Buscar por hash, endereço ou ativo...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search size={20} />}
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter size={16} className="mr-2" />
                  {t('wallet.filters') || 'Filtros'}
                  {(filterType !== 'all' || dateRange.start || dateRange.end) && (
                    <Badge variant="primary" size="sm" className="ml-2">
                      !
                    </Badge>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                </Button>
              </div>
            </div>
            
            {/* Quick Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: t('wallet.history.all') || 'Todas', icon: ArrowUpDown },
                { key: 'send', label: t('wallet.history.sent') || 'Enviadas', icon: Send },
                { key: 'receive', label: t('wallet.history.received') || 'Recebidas', icon: Download }
              ].map(filter => (
                <Button
                  key={filter.key}
                  variant={filterType === filter.key ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType(filter.key as FilterType)}
                >
                  <filter.icon size={14} className="mr-2" />
                  {filter.label}
                </Button>
              ))}
            </div>
            
            {/* Advanced Filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-sand-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-matte-black-700 mb-2">
                      {t('wallet.history.date_from') || 'Data Inicial'}
                    </label>
                    <Input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-matte-black-700 mb-2">
                      {t('wallet.history.date_to') || 'Data Final'}
                    </label>
                    <Input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-matte-black-700 mb-2">
                      {t('wallet.history.sort_by') || 'Ordenar por'}
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-sand-300 rounded-lg focus:ring-2 focus:ring-bazari-red focus:border-transparent"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                    >
                      <option value="newest">{t('wallet.history.newest_first') || 'Mais recentes'}</option>
                      <option value="oldest">{t('wallet.history.oldest_first') || 'Mais antigas'}</option>
                      <option value="amount_desc">{t('wallet.history.highest_amount') || 'Maior valor'}</option>
                      <option value="amount_asc">{t('wallet.history.lowest_amount') || 'Menor valor'}</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFilterType('all')
                      setDateRange({ start: '', end: '' })
                      setSearchQuery('')
                    }}
                  >
                    {t('wallet.clear_filters') || 'Limpar Filtros'}
                  </Button>
                </div>
              </motion.div>
            )}
          </Card>
        </motion.div>

        {/* Transactions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-matte-black-900">
                {t('wallet.history.transactions') || 'Transações'}
              </h2>
              
              <span className="text-sm text-matte-black-600">
                {filteredTransactions.length === transactions.length 
                  ? `${transactions.length} ${t('wallet.history.total') || 'transações'}`
                  : `${filteredTransactions.length} ${t('wallet.history.of') || 'de'} ${transactions.length}`
                }
              </span>
            </div>
            
            {isRefreshing ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : filteredTransactions.length === 0 ? (
              <EmptyState
                icon={<ArrowUpDown size={48} />}
                title={
                  transactions.length === 0 
                    ? t('wallet.history.no_transactions') || 'Nenhuma transação'
                    : t('wallet.history.no_results') || 'Nenhum resultado encontrado'
                }
                description={
                  transactions.length === 0
                    ? t('wallet.history.no_transactions_desc') || 'Suas transações aparecerão aqui.'
                    : t('wallet.history.try_different_filters') || 'Tente filtros diferentes.'
                }
                action={
                  transactions.length === 0 ? (
                    <Button onClick={() => navigate('/wallet/send')} variant="primary">
                      {t('wallet.send_first_transaction') || 'Enviar Primeira Transação'}
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <div className="space-y-3">
                {filteredTransactions.map((tx, index) => (
                  <TransactionRow
                    key={tx.hash}
                    transaction={tx}
                    index={index}
                    activeAccount={activeAccount}
                    formatAddress={formatAddress}
                    onCopyHash={handleCopyHash}
                    getTransactionIcon={getTransactionIcon}
                    getStatusIcon={getStatusIcon}
                    getStatusText={getStatusText}
                    formatTransactionAmount={formatTransactionAmount}
                    getTransactionTitle={getTransactionTitle}
                  />
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

interface TransactionRowProps {
  transaction: Tx
  index: number
  activeAccount: any
  formatAddress: (address: string, length?: number) => string
  onCopyHash: (hash: string) => void
  getTransactionIcon: (tx: Tx) => JSX.Element
  getStatusIcon: (status: Tx['status']) => JSX.Element
  getStatusText: (status: Tx['status']) => string
  formatTransactionAmount: (tx: Tx) => string
  getTransactionTitle: (tx: Tx) => string
}

const TransactionRow: React.FC<TransactionRowProps> = ({
  transaction,
  index,
  activeAccount,
  formatAddress,
  onCopyHash,
  getTransactionIcon,
  getStatusIcon,
  getStatusText,
  formatTransactionAmount,
  getTransactionTitle
}) => {
  const { t } = useI18n()
  const [expanded, setExpanded] = React.useState(false)

  const isOutgoing = transaction.kind === 'send'
  const otherAddress = isOutgoing ? transaction.to : transaction.from
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white border border-sand-200 rounded-xl p-4 hover:shadow-soft transition-shadow"
    >
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-4">
          {/* Icon */}
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            transaction.kind === 'send' ? 'bg-danger-100' : 'bg-success-100'
          }`}>
            {getTransactionIcon(transaction)}
          </div>
          
          {/* Info */}
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-matte-black-900">
                {getTransactionTitle(transaction)}
              </h3>
              
              <div className="flex items-center space-x-1">
                {getStatusIcon(transaction.status)}
                <span className="text-xs text-matte-black-600">
                  {getStatusText(transaction.status)}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-matte-black-600">
              <span>
                {new Date(transaction.time).toLocaleString('pt-BR')}
              </span>
              
              {otherAddress && (
                <>
                  <span>•</span>
                  <span className="font-mono">
                    {isOutgoing ? t('wallet.history.to') || 'Para' : t('wallet.history.from') || 'De'}: {formatAddress(otherAddress, 6)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Amount */}
        <div className="text-right">
          <p className={`text-lg font-semibold ${
            transaction.kind === 'send' ? 'text-danger' : 'text-success'
          }`}>
            {formatTransactionAmount(transaction)}
          </p>
          
          <p className="text-xs text-matte-black-500 font-mono">
            #{transaction.hash.slice(0, 8)}...
          </p>
        </div>
      </div>
      
      {/* Expanded Details */}
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 pt-4 border-t border-sand-200"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {/* Transaction Hash */}
            <div>
              <label className="block text-matte-black-600 mb-1">
                {t('wallet.history.transaction_hash') || 'Hash da Transação'}:
              </label>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-matte-black-900 break-all">
                  {transaction.hash}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-auto flex-shrink-0"
                  onClick={() => onCopyHash(transaction.hash)}
                >
                  <Copy size={14} />
                </Button>
              </div>
            </div>
            
            {/* Block Explorer Link */}
            <div>
              <label className="block text-matte-black-600 mb-1">
                {t('wallet.history.explorer') || 'Explorer'}:
              </label>
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-auto text-bazari-red hover:text-bazari-red-600"
                onClick={() => {
                  // In a real implementation, this would open the block explorer
                  window.open(`https://polkadot.js.org/apps/#/explorer/query/${transaction.hash}`, '_blank')
                }}
              >
                <ExternalLink size={14} className="mr-1" />
                {t('wallet.history.view_on_chain') || 'Ver na Chain'}
              </Button>
            </div>
            
            {/* From Address */}
            {transaction.from && (
              <div>
                <label className="block text-matte-black-600 mb-1">
                  {t('wallet.history.from_address') || 'Endereço de Origem'}:
                </label>
                <span className="font-mono text-matte-black-900 break-all text-sm">
                  {transaction.from}
                </span>
              </div>
            )}
            
            {/* To Address */}
            {transaction.to && (
              <div>
                <label className="block text-matte-black-600 mb-1">
                  {t('wallet.history.to_address') || 'Endereço de Destino'}:
                </label>
                <span className="font-mono text-matte-black-900 break-all text-sm">
                  {transaction.to}
                </span>
              </div>
            )}
          </div>
          
          {/* Error Message */}
          {transaction.status === 'failed' && transaction.error && (
            <div className="mt-4 p-3 bg-danger-50 border border-danger-200 rounded-lg">
              <p className="text-sm text-danger-800">
                <strong>{t('wallet.history.error') || 'Erro'}:</strong> {transaction.error}
              </p>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}