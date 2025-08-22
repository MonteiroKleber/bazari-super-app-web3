import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Send, Download, History, Plus } from 'lucide-react'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { Tabs } from '@shared/ui/Tabs'
import { LoadingSpinner } from '@shared/ui/LoadingSpinner'
import { useI18n } from '@app/providers/I18nProvider'
import { useActiveAccount } from '../hooks/useActiveAccount'
import { useTokens } from '../hooks/useTokens'
import { AccountSwitcher } from './AccountSwitcher'
import { TokensTab } from './TokensTab'
import { NftsTab } from './NftsTab'
import { useAuthStore } from '@features/auth/store/authStore'

export const WalletHome: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useI18n()

  const listLocal = useAuthStore(s => (s as any).listLocal as (() => void) | undefined)
  const { activeAccount, accounts } = useActiveAccount()
  const { totalBalance, isLoading: loadingBalances } = useTokens()
  const [activeTab, setActiveTab] = React.useState<'tokens' | 'nfts'>('tokens')

  React.useEffect(() => { try { listLocal?.() } catch {} }, [listLocal])

  const hasAccounts = (accounts?.length ?? 0) > 0

  if (!hasAccounts) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-semibold text-matte-black-900 mb-4">
            {t('wallet.no_account_title') || 'Nenhuma conta encontrada'}
          </h2>
          <p className="text-matte-black-600 mb-6">
            {t('wallet.no_account_description') || 'Crie ou importe uma conta para começar a usar sua carteira.'}
          </p>
          <Button onClick={() => navigate('/wallet/accounts')} variant="primary">
            {t('wallet.manage_accounts') || 'Gerenciar Contas'}
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-sand-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-matte-black-900 mb-2">{t('wallet.title') || 'Carteira'}</h1>
          <AccountSwitcher />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
          <Card className="p-6">
            <div className="text-center">
              <p className="text-sm text-matte-black-600 mb-2">{t('wallet.total_balance') || 'Saldo Total Estimado'}</p>
              {loadingBalances ? (
                <div className="flex items-center justify-center py-4">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2 text-matte-black-600">{t('wallet.loading_balance') || 'Carregando saldo...'}</span>
                </div>
              ) : (
                <div className="text-3xl font-bold text-bazari-red mb-4">
                  {totalBalance.toFixed(2)} BZR
                </div>
              )}

              <div className="flex justify-center space-x-4">
                <Button onClick={() => navigate('/wallet/send')} variant="primary" size="sm" className="flex items-center" disabled={!activeAccount}>
                  <Send size={16} className="mr-2" />
                  {t('wallet.actions.send') || 'Enviar'}
                </Button>
                <Button onClick={() => navigate('/wallet/receive')} variant="outline" size="sm" className="flex items-center" disabled={!activeAccount}>
                  <Download size={16} className="mr-2" />
                  {t('wallet.actions.receive') || 'Receber'}
                </Button>
                <Button onClick={() => navigate('/wallet/history')} variant="outline" size="sm" className="flex items-center" disabled={!activeAccount}>
                  <History size={16} className="mr-2" />
                  {t('wallet.actions.history') || 'Histórico'}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                {/* Torne o Tabs controlado */}
                <Tabs
                  value={activeTab}
                  onValueChange={(v) => setActiveTab(v as 'tokens' | 'nfts')}
                >
                  <Tabs.List>
                    <Tabs.Trigger value="tokens">
                      {t('wallet.tabs.tokens') || 'Tokens'}
                    </Tabs.Trigger>
                    <Tabs.Trigger value="nfts">
                      {t('wallet.tabs.nfts') || 'NFTs'}
                    </Tabs.Trigger>
                  </Tabs.List>
                </Tabs>

                <div className="flex space-x-2">
                  {activeTab === 'tokens' ? (
                    <Button
                      onClick={() => navigate('/wallet/add-token')}
                      variant="outline"
                      size="sm"
                      disabled={!activeAccount}
                    >
                      <Plus size={16} className="mr-2" />
                      {t('wallet.actions.add_token') || 'Adicionar Token'}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => navigate('/wallet/add-nft')}
                      variant="outline"
                      size="sm"
                      disabled={!activeAccount}
                    >
                      <Plus size={16} className="mr-2" />
                      {t('wallet.actions.add_nft') || 'Adicionar NFT'}
                    </Button>
                  )}
                </div>
              </div>

              {/* Conteúdo controlado pela mesma fonte (activeTab) */}
              <div className="min-h-96">
                {activeTab === 'tokens' ? <TokensTab /> : <NftsTab />}
              </div>
            </Card>
        </motion.div>
      </div>
    </div>
  )
}
