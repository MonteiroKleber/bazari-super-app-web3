import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Search, SortAsc, Send, Download, RefreshCw } from 'lucide-react'

import { Input } from '@shared/ui/Input'
import { Button } from '@shared/ui/Button'
import { Badge } from '@shared/ui/Badge'
import { EmptyState } from '@shared/ui/EmptyState'
import { LoadingSpinner } from '@shared/ui/LoadingSpinner'

import { useI18n } from '@app/providers/I18nProvider'
import { useTokens, TokenWithBalance } from '../hooks/useTokens'
import { usePreferencesStore } from '../store/preferencesStore'
import { useActiveAccount } from '../hooks/useActiveAccount'

type SortOption = 'name' | 'balance' | 'value'

export const TokensTab: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useI18n()

  const {
    tokens,
    nativeToken,
    isLoading,
    refreshBalances,
    // se seu hook expõe error, ele será usado abaixo opcionalmente
    // error,
  } = useTokens()

  // ✅ Reagir à troca de conta ativa (mesma fonte do Auth)
  const { activeAccount } = useActiveAccount()
  React.useEffect(() => {
    if (activeAccount?.address) {
      void refreshBalances()
    }
  }, [activeAccount?.address, refreshBalances])

  const { ui, setUiPreference } = usePreferencesStore()

  const [searchQuery, setSearchQuery] = React.useState('')
  const [sortBy, setSortBy] = React.useState<SortOption>('name')
  const [sortAsc, setSortAsc] = React.useState(true)

  const filteredTokens = React.useMemo(() => {
    let list = tokens

    // Filtro por busca
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter(token =>
        token.name?.toLowerCase().includes(q) ||
        token.symbol.toLowerCase().includes(q)
      )
    }

    // Filtro por saldo zero (quando ocultar)
    if (!ui.showZeroBalances) {
      list = list.filter(t => {
        const n = parseFloat(t.formattedBalance || '0')
        return Number.isFinite(n) && n > 0
      })
    }

    // Ordenação
    const sorted = [...list].sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortBy) {
        case 'name':
          aValue = (a.name || a.symbol).toLowerCase()
          bValue = (b.name || b.symbol).toLowerCase()
          return sortAsc
            ? String(aValue).localeCompare(String(bValue))
            : String(bValue).localeCompare(String(aValue))

        case 'balance': {
          const av = parseFloat(a.formattedBalance || '0') || 0
          const bv = parseFloat(b.formattedBalance || '0') || 0
          return sortAsc ? av - bv : bv - av
        }

        case 'value': {
          const av = a.balanceInFiat ?? 0
          const bv = b.balanceInFiat ?? 0
          return sortAsc ? av - bv : bv - av
        }

        default:
          return 0
      }
    })

    // Mantém o token nativo (se existir) sempre no topo
    if (nativeToken) {
      return [nativeToken, ...sorted.filter(t => t.key !== nativeToken.key)]
    }

    return sorted
  }, [tokens, searchQuery, sortBy, sortAsc, ui.showZeroBalances, nativeToken])

  const handleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortAsc(!sortAsc)
    } else {
      setSortBy(option)
      setSortAsc(true)
    }
  }

  const handleSend = (token: TokenWithBalance) => {
    navigate(`/wallet/send?token=${encodeURIComponent(token.key)}`)
  }

  const handleReceive = () => {
    navigate('/wallet/receive')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Se quiser exibir erro do hook (caso exista), descomente:
  // if (error) {
  //   return (
  //     <EmptyState
  //       icon={<RefreshCw size={48} />}
  //       title={t('wallet.load_error') || 'Erro ao carregar saldos'}
  //       description={String(error)}
  //       action={
  //         <Button onClick={refreshBalances} variant="primary">
  //           {t('wallet.refresh_balances') || 'Atualizar Saldos'}
  //         </Button>
  //       }
  //     />
  //   )
  // }

  if (tokens.length === 0) {
    return (
      <EmptyState
        icon={<RefreshCw size={48} />}
        title={t('wallet.no_tokens_title') || 'Nenhum token encontrado'}
        description={t('wallet.no_tokens_description') || 'Seus tokens aparecerão aqui quando você tiver saldo.'}
        action={
          <Button onClick={refreshBalances} variant="primary">
            {t('wallet.refresh_balances') || 'Atualizar Saldos'}
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Controles superiores */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder={t('wallet.search_tokens') || 'Buscar tokens...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search size={20} />}
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSort('name')}
            className={sortBy === 'name' ? 'bg-sand-100' : ''}
          >
            <SortAsc size={16} className="mr-2" />
            {t('wallet.sort_name') || 'Nome'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSort('balance')}
            className={sortBy === 'balance' ? 'bg-sand-100' : ''}
          >
            <SortAsc size={16} className="mr-2" />
            {t('wallet.sort_balance') || 'Saldo'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={refreshBalances}
            title={t('wallet.refresh_balances') || 'Atualizar Saldos'}
          >
            <RefreshCw size={16} />
          </Button>
        </div>
      </div>

      {/* Toggle de saldos zerados */}
      <div className="flex items-center justify-between p-3 bg-sand-50 rounded-lg">
        <span className="text-sm text-matte-black-700">
          {t('wallet.show_zero_balances') || 'Mostrar saldos zerados'}
        </span>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={ui.showZeroBalances}
            onChange={(e) => setUiPreference('showZeroBalances', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-bazari-red"></div>
        </label>
      </div>

      {/* Lista de tokens */}
      {filteredTokens.length === 0 ? (
        <EmptyState
          icon={<Search size={48} />}
          title={t('wallet.no_results') || 'Nenhum resultado encontrado'}
          description={t('wallet.try_different_search') || 'Tente uma busca diferente ou ajuste os filtros.'}
        />
      ) : (
        <div className="space-y-3">
          {filteredTokens.map((token, index) => (
            <TokenRow
              key={token.key}
              token={token}
              index={index}
              onSend={() => handleSend(token)}
              onReceive={handleReceive}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface TokenRowProps {
  token: TokenWithBalance
  index: number
  onSend: () => void
  onReceive: () => void
}

const TokenRow: React.FC<TokenRowProps> = ({ token, index, onSend, onReceive }) => {
  const { t } = useI18n()

  const balanceNum = React.useMemo(() => {
    const n = parseFloat(token.formattedBalance || '0')
    return Number.isFinite(n) ? n : 0
  }, [token.formattedBalance])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="p-4 bg-white rounded-xl border border-sand-200 hover:shadow-soft transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-bazari-red to-bazari-gold rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">{token.symbol.charAt(0)}</span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-matte-black-900">
                {token.name || token.symbol}
              </h3>
              <Badge variant="outline" size="sm">{token.symbol}</Badge>
              {token.type === 'native' && (
                <Badge variant="success" size="sm">
                  {t('wallet.native') || 'Nativo'}
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-4 text-sm text-matte-black-600">
              <span>{balanceNum.toFixed(6)} {token.symbol}</span>
              {typeof token.balanceInFiat === 'number' && (
                <span>≈ {token.balanceInFiat.toFixed(2)} BZR</span>
              )}
              {typeof token.priceUSD === 'number' && (
                <span>${token.priceUSD.toFixed(4)}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            onClick={onSend}
            variant="outline"
            size="sm"
            disabled={balanceNum === 0}
          >
            <Send size={14} className="mr-1" />
            {t('wallet.send') || 'Enviar'}
          </Button>

          <Button
            onClick={onReceive}
            variant="outline"
            size="sm"
          >
            <Download size={14} className="mr-1" />
            {t('wallet.receive') || 'Receber'}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
