import React from 'react'
import { motion } from 'framer-motion'
import { 
  Wallet, 
  ShoppingBag, 
  MessageCircle, 
  Star, 
  TrendingUp,
  Plus,
  Eye,
  ArrowRight
} from 'lucide-react'
import { AppShell } from '@shared/layout/AppShell'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { Badge } from '@shared/ui/Badge'
import { EmptyState } from '@shared/ui/EmptyState'
import { useI18n } from '@app/providers/I18nProvider'
import { useAuthStore } from '@features/auth/store/authStore'
import { useWalletStore } from '@features/wallet/store/walletStore'
import { useNotificationsStore } from '@features/notifications/store/notificationsStore'
import { useMarketplaceStore } from '@features/marketplace/store/marketplaceStore'
import { useP2PStore } from '@features/p2p/store/p2pStore'

const DashboardPage: React.FC = () => {
  const { t } = useI18n()
  const { user } = useAuthStore()
  const { balance } = useWalletStore()
  const { notifications } = useNotificationsStore()
  const { myListings } = useMarketplaceStore()
  const { myTrades } = useP2PStore()

  const recentNotifications = notifications.slice(0, 5)
  const activeTrades = myTrades.filter(trade => 
    ['initiated', 'payment_pending', 'payment_confirmed'].includes(trade.status)
  )
  const activeListings = myListings.filter(listing => listing.status === 'active')

  React.useEffect(() => {
    // Load initial data
    // In a real app, these would be API calls
  }, [])

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
    <AppShell showReturnButton={false}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-matte-black-900 mb-2">
            {t('dashboard.welcome')}, {user?.name}! 👋
          </h1>
          <p className="text-matte-black-600">
            Aqui está um resumo da sua atividade no Bazari
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Cards */}
          <div className="lg:col-span-2 space-y-6">
            {/* Wallet Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-matte-black-900 flex items-center">
                    <Wallet size={24} className="mr-3 text-bazari-red" />
                    {t('dashboard.my_wallet.title')}
                  </h2>
                  <Button variant="outline" size="sm">
                    <Eye size={16} className="mr-2" />
                    {t('dashboard.my_wallet.history')}
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-bazari-red-50 rounded-xl p-4">
                    <p className="text-sm text-bazari-red-600 mb-1">
                      {t('dashboard.my_wallet.balance')} BZR
                    </p>
                    <p className="text-2xl font-bold text-bazari-red">
                      {formatCurrency(balance.BZR, 'BZR')}
                    </p>
                  </div>
                  <div className="bg-success-50 rounded-xl p-4">
                    <p className="text-sm text-success-600 mb-1">
                      {t('dashboard.my_wallet.balance')} BRL
                    </p>
                    <p className="text-2xl font-bold text-success">
                      {formatCurrency(balance.BRL, 'BRL')}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button size="sm" className="flex-1">
                    {t('dashboard.my_wallet.send')}
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    {t('dashboard.my_wallet.receive')}
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* P2P Trades */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-matte-black-900 flex items-center">
                    <MessageCircle size={24} className="mr-3 text-bazari-gold-600" />
                    {t('dashboard.p2p_trades.title')}
                  </h2>
                  <Button variant="outline" size="sm">
                    Ver todos
                  </Button>
                </div>

                {activeTrades.length === 0 ? (
                  <EmptyState
                    title={t('dashboard.p2p_trades.no_trades')}
                    description="Você não tem negociações P2P ativas no momento."
                  />
                ) : (
                  <div className="space-y-3">
                    {activeTrades.slice(0, 3).map((trade) => (
                      <div key={trade.id} className="border border-sand-200 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-matte-black-900">
                              {trade.amount} BZR → {formatCurrency(trade.totalBRL, 'BRL')}
                            </p>
                            <p className="text-sm text-matte-black-600">
                              {trade.status === 'initiated' && 'Aguardando pagamento'}
                              {trade.status === 'payment_pending' && 'Pagamento pendente'}
                              {trade.status === 'payment_confirmed' && 'Pagamento confirmado'}
                            </p>
                          </div>
                          <Badge 
                            variant={trade.status === 'payment_confirmed' ? 'success' : 'warning'}
                            size="sm"
                          >
                            {trade.status === 'initiated' && 'Iniciado'}
                            {trade.status === 'payment_pending' && 'Pendente'}
                            {trade.status === 'payment_confirmed' && 'Confirmado'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>

            {/* My Listings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-matte-black-900 flex items-center">
                    <ShoppingBag size={24} className="mr-3 text-success" />
                    {t('dashboard.my_listings.title')}
                  </h2>
                  <Button variant="outline" size="sm">
                    Gerenciar
                  </Button>
                </div>

                {activeListings.length === 0 ? (
                  <EmptyState
                    title="Nenhum anúncio ativo"
                    description="Crie seu primeiro anúncio no marketplace."
                    action={
                      <Button>
                        <Plus size={16} className="mr-2" />
                        Criar Anúncio
                      </Button>
                    }
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {activeListings.slice(0, 4).map((listing) => (
                      <div key={listing.id} className="border border-sand-200 rounded-xl p-4">
                        <h3 className="font-medium text-matte-black-900 mb-2 truncate">
                          {listing.title}
                        </h3>
                        <p className="text-bazari-red font-semibold mb-2">
                          {formatCurrency(listing.price, listing.currency)}
                        </p>
                        <div className="flex items-center justify-between text-sm text-matte-black-600">
                          <span>{listing.views} visualizações</span>
                          <Badge variant="success" size="sm">
                            {t('dashboard.my_listings.active')}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Reputation */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-matte-black-900 mb-4 flex items-center">
                  <Star size={20} className="mr-2 text-bazari-gold-600" />
                  {t('dashboard.reputation.title')}
                </h2>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-bazari-gold-600 mb-2">
                    {user?.reputation.rating.toFixed(1)}
                  </div>
                  <div className="flex justify-center mb-2">
                    {[1,2,3,4,5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className={`${
                          star <= Math.round(user?.reputation.rating || 0)
                            ? 'text-bazari-gold-600 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-matte-black-600">
                    {user?.reputation.reviewCount} {t('dashboard.reputation.reviews')}
                  </p>
                </div>
              </Card>
            </motion.div>

            {/* Recent Notifications */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-matte-black-900">
                    {t('dashboard.notifications.title')}
                  </h2>
                  <Button variant="ghost" size="sm">
                    {t('dashboard.notifications.view_all')}
                  </Button>
                </div>

                {recentNotifications.length === 0 ? (
                  <p className="text-center text-matte-black-500 py-4">
                    {t('notifications.no_notifications')}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentNotifications.map((notification) => (
                      <div key={notification.id} className="text-sm">
                        <p className="font-medium text-matte-black-900 mb-1">
                          {notification.title}
                        </p>
                        <p className="text-matte-black-600 text-xs">
                          {new Date(notification.timestamp).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-matte-black-900 mb-4">
                  {t('dashboard.quick_actions.title')}
                </h2>
                
                <div className="space-y-3">
                  <Button variant="outline" size="sm" className="w-full justify-between">
                    {t('dashboard.quick_actions.create_p2p')}
                    <ArrowRight size={16} />
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-between">
                    {t('dashboard.quick_actions.create_listing')}
                    <ArrowRight size={16} />
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-between">
                    {t('dashboard.quick_actions.browse_p2p')}
                    <ArrowRight size={16} />
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-between">
                    {t('dashboard.quick_actions.browse_marketplace')}
                    <ArrowRight size={16} />
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

export default DashboardPage