import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ShoppingBag,
  Wallet as WalletIcon,
  ArrowLeftRight,   // <- usar no lugar de Handshake
  Briefcase,
  Landmark,
  Users2,
  ArrowRight,
} from 'lucide-react';

import { AppShell } from '@shared/layout/AppShell'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { Badge } from '@shared/ui/Badge'
import { useI18n } from '@app/providers/I18nProvider'
import { useWalletStore } from '@features/wallet/store/walletStore'
import { useMarketplaceStore } from '@features/marketplace/store/marketplaceStore'
import { useP2PStore } from '@features/p2p/store/p2pStore'

const tileVariants = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.05 * i } }),
}

const DashboardPage: React.FC = () => {
  const { t } = useI18n()
  const { balance } = useWalletStore()
  const { myListings } = useMarketplaceStore()
  const { myTrades } = useP2PStore()

  const activeListings = (myListings || []).filter((l: any) => l.status === 'active').length
  const activeTrades = (myTrades || []).filter((tr: any) =>
    ['initiated', 'payment_pending', 'payment_confirmed'].includes(tr.status)
  ).length

  const formatBRL = (n: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n || 0)

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
          <Badge variant="secondary" size="sm">{(balance?.BZR ?? 0).toLocaleString('pt-BR')} BZR</Badge>
          <Badge variant="secondary" size="sm">{formatBRL(balance?.BRL ?? 0)}</Badge>
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-matte-black-900">
            {t('hub.title', 'Escolha um módulo')}
          </h1>
          <p className="text-matte-black-600">
            {t('hub.subtitle', 'Acesse rapidamente as áreas do super app Bazari')}
          </p>
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
