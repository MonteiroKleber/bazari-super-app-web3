import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ShoppingBag,
  Wallet as WalletIcon,
  ArrowLeftRight,
  Briefcase,
  Landmark,
  Users2,
  ArrowRight,
  User,
  Copy,
  Calendar,
  LogOut,
  Coins
} from 'lucide-react'

import { AppShell } from '@shared/layout/AppShell'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { Badge } from '@shared/ui/Badge'
import { useI18n } from '@app/providers/I18nProvider'
import { useMarketplaceStore } from '@features/marketplace/store/marketplaceStore'
import { useP2PStore } from '@features/p2p/store/p2pStore'
import { useAuthStore } from '@features/auth/store/authStore'
import { useChain } from '@app/providers/ChainProvider'

import { formatBalance } from '@polkadot/util'
import { decodeAddress } from '@polkadot/util-crypto'

const tileVariants = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.05 * i } }),
}

const DashboardPage: React.FC = () => {
  const { t } = useI18n()
  const { myListings } = useMarketplaceStore()
  const { myTrades } = useP2PStore()
  const { user, logout } = useAuthStore()
  const { api, isReady, chainName, symbol, decimals } = useChain()

  const activeListings = (myListings || []).filter((l: any) => l.status === 'active').length
  const activeTrades = (myTrades || []).filter((tr: any) =>
    ['initiated', 'payment_pending', 'payment_confirmed'].includes(tr.status)
  ).length

  const shortAddr = (addr?: string) => (addr ? `${addr.slice(0, 6)}…${addr.slice(-6)}` : '—')
  const fmtDate = (iso?: string) => {
    if (!iso) return '—'
    try {
      const d = new Date(iso)
      return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(d)
    } catch { return iso }
  }

  // -------- Saldo on-chain (live) --------
  const [free, setFree] = React.useState<any>(null)

  React.useEffect(() => {
    if (!api || !isReady || !user?.walletAddress) return
    let unsub: any
    ;(async () => {
      try {
        const accountId = (() => {
          try { return decodeAddress(user.walletAddress) } catch { return user.walletAddress }
        })()
        unsub = await api.query.system.account(accountId, (acc: any) => {
          setFree(acc.data.free) // BN
        })
      } catch (e) {
        console.error('DashboardPage: saldo on-chain', e)
      }
    })()
    return () => { if (unsub) unsub() }
  }, [api, isReady, user?.walletAddress])

  const formattedFree = React.useMemo(() => {
    if (!free) return '—'
    return formatBalance(free, { decimals, withSi: false, withUnit: symbol })
  }, [free, decimals, symbol])

  const handleCopy = async () => {
    if (!user?.walletAddress) return
    try { await navigator.clipboard.writeText(user.walletAddress) } catch {}
  }

  const tiles = [
    {
      key: 'marketplace',
      to: '/marketplace',
      icon: <ShoppingBag className="h-6 w-6 text-success" />,
      title: t('hub.module.marketplace.title', 'Marketplace'),
      desc: t('hub.module.marketplace.desc', 'Compre e venda produtos e serviços.'),
      stats: (
        <Badge variant="success" size="sm">
          {activeListings} {t('dashboard.my_listings.active', 'ativos')}
        </Badge>
      ),
      actions: [
        { label: t('hub.cta.enter', 'Entrar'), to: '/marketplace' },
        { label: t('hub.cta.createListing', 'Criar anúncio'), to: '/marketplace/create' },
      ],
      accent: 'from-success/10 to-sand-50',
    },
    {
      key: 'wallet',
      to: '/wallet',
      icon: <WalletIcon className="h-6 w-6 text-bazari-red" />,
      title: t('hub.module.wallet.title', 'Wallet'),
      desc: t('hub.module.wallet.desc', 'Envie e receba BZR; veja seu saldo.'),
      stats: (
        <div className="flex items-center gap-2 text-sm">
          <Badge variant="secondary" size="sm">{formattedFree}</Badge>
        </div>
      ),
      actions: [
        { label: t('hub.cta.enter', 'Entrar'), to: '/wallet' },
        { label: t('hub.cta.send', 'Enviar'), to: '/wallet/send' },
      ],
      accent: 'from-bazari-red/10 to-sand-50',
    },
    {
      key: 'p2p',
      to: '/p2p',
      icon: <ArrowLeftRight className="h-6 w-6 text-bazari-gold-600" />,
      title: t('hub.module.p2p.title', 'P2P'),
      desc: t('hub.module.p2p.desc', 'Negocie BZR direto com pessoas.'),
      stats: (
        <Badge variant={activeTrades ? 'warning' : 'outline'} size="sm">
          {activeTrades} {t('dashboard.p2p_trades.title', 'trades')}
        </Badge>
      ),
      actions: [
        { label: t('hub.cta.enter', 'Entrar'), to: '/p2p' },
        { label: t('hub.cta.browseOffers', 'Ver ofertas'), to: '/p2p/offers' },
      ],
      accent: 'from-bazari-gold-600/10 to-sand-50',
    },
    {
      key: 'work',
      to: '/work',
      icon: <Briefcase className="h-6 w-6 text-matte-black-900" />,
      title: t('hub.module.work.title', 'Work'),
      desc: t('hub.module.work.desc', 'Encontre trabalho e oportunidades.'),
      stats: null,
      actions: [{ label: t('hub.cta.enter', 'Entrar'), to: '/work' }],
      accent: 'from-matte-black-900/5 to-sand-50',
    },
    {
      key: 'dao',
      to: '/dao',
      icon: <Landmark className="h-6 w-6 text-bazari-gold-600" />,
      title: t('hub.module.dao.title', 'DAO'),
      desc: t('hub.module.dao.desc', 'Participe da governança da Bazari.'),
      stats: null,
      actions: [{ label: t('hub.cta.enter', 'Entrar'), to: '/dao' }],
      accent: 'from-bazari-gold-600/10 to-sand-50',
    },
    {
      key: 'social',
      to: '/social',
      icon: <Users2 className="h-6 w-6 text-success" />,
      title: t('hub.module.social.title', 'Social'),
      desc: t('hub.module.social.desc', 'Conecte-se com a comunidade.'),
      stats: null,
      actions: [{ label: t('hub.cta.enter', 'Entrar'), to: '/social' }],
      accent: 'from-success/10 to-sand-50',
    },
  ]

  return (
    <AppShell showReturnButton={false}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-3xl font-bold text-matte-black-900">
            {t('hub.title', 'Escolha um módulo')}
          </h1>
          <p className="text-matte-black-600">
            {t('hub.subtitle', 'Acesse rapidamente as áreas do super app Bazari')}
          </p>
        </motion.div>

        {/* Minha conta + saldo on-chain */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Card className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl bg-sand-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-matte-black-700" />
                </div>
                <div>
                  <div className="text-sm text-matte-black-600">
                    {chainName ? `Conectado à ${chainName}` : 'Conta BazariChain'}
                  </div>
                  <div className="text-xl font-semibold text-matte-black-900 leading-6">
                    {user?.name || 'Usuário'}
                  </div>

                  <div className="mt-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-matte-black-600">Endereço:</span>
                      <code className="text-matte-black-900">{shortAddr(user?.walletAddress)}</code>
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="inline-flex items-center gap-1 text-matte-black-700 hover:text-bazari-red transition"
                        title="Copiar endereço"
                      >
                        <Copy className="h-4 w-4" />
                        <span className="hidden sm:inline">Copiar</span>
                      </button>
                    </div>

                    <div className="mt-1 flex flex-wrap gap-4 text-matte-black-700">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Criado: {fmtDate(user?.createdAt)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Último acesso: {fmtDate(user?.lastLoginAt)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        Reputação:
                        <strong className="text-matte-black-900">
                          {(user?.reputation?.rating ?? 0).toFixed(1)}
                        </strong>
                        ({user?.reputation?.reviewCount ?? 0})
                      </span>
                    </div>

                    {/* Saldo on-chain */}
                    <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-sand-100 px-3 py-1.5">
                      <Coins className="h-4 w-4 text-bazari-red" />
                      <span className="text-matte-black-700">Saldo on-chain:</span>
                      <strong className="text-matte-black-900">{formattedFree}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 sm:self-start">
                <a
                  href={`https://polkadot.js.org/apps/?rpc=${encodeURIComponent(import.meta.env.VITE_BAZARICHAIN_WS || 'ws://127.0.0.1:9944')}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button variant="secondary">Abrir Polkadot.js Apps</Button>
                </a>
                <Button variant="ghost" onClick={logout} className="inline-flex gap-2">
                  <LogOut className="h-4 w-4" /> Sair
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {tiles.map((m, i) => (
            <motion.div key={m.key} variants={tileVariants} initial="hidden" animate="show" custom={i}>
              <Card className="p-5 h-full">
                <div className={`rounded-xl bg-gradient-to-br ${m.accent} p-3 inline-flex mb-4`}>
                  {m.icon}
                </div>

                <h2 className="text-xl font-semibold text-matte-black-900">{m.title}</h2>
                <p className="text-sm text-matte-black-600 mt-1">{m.desc}</p>

                <div className="mt-3">{m.stats}</div>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {m.actions.map((a) => (
                    <Link to={a.to} key={a.to}>
                      <Button className="w-full justify-between">
                        {a.label}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </AppShell>
  )
}

export default DashboardPage
