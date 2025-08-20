
import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle,
  Search,
  Filter,
  FileText,
  Calendar,
  User,
  MessageCircle
} from 'lucide-react'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { Input } from '@shared/ui/Input'
import { Badge } from '@shared/ui/Badge'
import { Tabs } from '@shared/ui/Tabs'
import { LoadingSpinner } from '@shared/ui/LoadingSpinner'
import { EmptyState } from '@shared/ui/EmptyState'
import { useI18n } from '@app/providers/I18nProvider'
import { useAuthStore } from '@features/auth/store/authStore'
import { useTradesStore } from '../store/tradesStore'
import type { P2PDispute } from '../types/p2p.types'

// Mock disputes data (in production, would come from API/store)
const mockDisputes: P2PDispute[] = [
  {
    id: 'dispute_1',
    tradeId: 'trade_123',
    openedBy: 'user_456',
    reason: 'payment_not_received',
    status: 'OPEN',
    createdAt: Date.now() - 86400000 * 2, // 2 days ago
    attachments: ['receipt.jpg']
  },
  {
    id: 'dispute_2',
    tradeId: 'trade_789',
    openedBy: 'user_789',
    reason: 'wrong_amount',
    status: 'UNDER_REVIEW',
    createdAt: Date.now() - 86400000 * 5, // 5 days ago
    resolvedAt: Date.now() - 86400000 * 1, // 1 day ago
    resolution: 'Disputa resolvida em favor do comprador'
  },
  {
    id: 'dispute_3',
    tradeId: 'trade_456',
    openedBy: 'user_123',
    reason: 'fake_proof',
    status: 'RESOLVED',
    createdAt: Date.now() - 86400000 * 10, // 10 days ago
    resolvedAt: Date.now() - 86400000 * 3, // 3 days ago
    resolution: 'Comprovante validado. Disputa arquivada.'
  }
]

export const DisputesCenter: React.FC = () => {
  const { t } = useI18n()
  const { user } = useAuthStore()
  const { trades } = useTradesStore()
  
  const [disputes] = useState<P2PDispute[]>(mockDisputes)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | P2PDispute['status']>('all')

  // Filter disputes
  const filteredDisputes = disputes.filter(dispute => {
    const matchesSearch = !searchQuery || 
      dispute.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.tradeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.reason.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || dispute.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp))
  }

  const getStatusBadge = (status: P2PDispute['status']) => {
    const variants: Record<P2PDispute['status'], { variant: any; label: string; icon: React.ReactNode }> = {
      OPEN: { variant: 'danger', label: t('p2p.dispute.status.open'), icon: <AlertTriangle className="h-3 w-3" /> },
      UNDER_REVIEW: { variant: 'warning', label: t('p2p.dispute.status.underReview'), icon: <Clock className="h-3 w-3" /> },
      RESOLVED: { variant: 'success', label: t('p2p.dispute.status.resolved'), icon: <CheckCircle className="h-3 w-3" /> },
      CLOSED: { variant: 'secondary', label: t('p2p.dispute.status.closed'), icon: <XCircle className="h-3 w-3" /> }
    }

    const config = variants[status]
    return (
      <Badge variant={config.variant} className="flex items-center">
        {config.icon}
        <span className="ml-1">{config.label}</span>
      </Badge>
    )
  }

  const getReasonLabel = (reason: string) => {
    const reasons: Record<string, string> = {
      payment_not_received: t('p2p.dispute.paymentNotReceived'),
      wrong_amount: t('p2p.dispute.wrongAmount'),
      fake_proof: t('p2p.dispute.fakeProof'),
      no_response: t('p2p.dispute.noResponse'),
      other: t('p2p.dispute.other')
    }
    return reasons[reason] || reason
  }

  const disputesByStatus = {
    all: filteredDisputes.length,
    open: filteredDisputes.filter(d => d.status === 'OPEN').length,
    underReview: filteredDisputes.filter(d => d.status === 'UNDER_REVIEW').length,
    resolved: filteredDisputes.filter(d => d.status === 'RESOLVED').length,
    closed: filteredDisputes.filter(d => d.status === 'CLOSED').length
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-matte-black-900">
            {t('p2p.disputes.title')}
          </h1>
          <p className="text-matte-black-600 mt-1">
            {t('p2p.disputes.subtitle')}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Badge variant="secondary">
            {filteredDisputes.length} {t('p2p.disputes.total')}
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-matte-black-900 mb-1">
            {disputesByStatus.all}
          </div>
          <div className="text-sm text-matte-black-600">
            {t('p2p.disputes.stats.total')}
          </div>
        </Card>

        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-danger mb-1">
            {disputesByStatus.open}
          </div>
          <div className="text-sm text-matte-black-600">
            {t('p2p.disputes.stats.open')}
          </div>
        </Card>

        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-warning mb-1">
            {disputesByStatus.underReview}
          </div>
          <div className="text-sm text-matte-black-600">
            {t('p2p.disputes.stats.underReview')}
          </div>
        </Card>

        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-success mb-1">
            {disputesByStatus.resolved}
          </div>
          <div className="text-sm text-matte-black-600">
            {t('p2p.disputes.stats.resolved')}
          </div>
        </Card>

        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-matte-black-500 mb-1">
            {disputesByStatus.closed}
          </div>
          <div className="text-sm text-matte-black-600">
            {t('p2p.disputes.stats.closed')}
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-matte-black-400" />
              <Input
                placeholder={t('p2p.disputes.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-sand-300 rounded-lg focus:ring-2 focus:ring-bazari-red focus:border-transparent"
            >
              <option value="all">{t('p2p.disputes.filter.all')}</option>
              <option value="OPEN">{t('p2p.dispute.status.open')}</option>
              <option value="UNDER_REVIEW">{t('p2p.dispute.status.underReview')}</option>
              <option value="RESOLVED">{t('p2p.dispute.status.resolved')}</option>
              <option value="CLOSED">{t('p2p.dispute.status.closed')}</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Disputes List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : filteredDisputes.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-12 w-12 text-matte-black-400" />}
          title={t('p2p.disputes.empty.title')}
          description={t('p2p.disputes.empty.description')}
        />
      ) : (
        <div className="space-y-4">
          {filteredDisputes.map((dispute, index) => (
            <motion.div
              key={dispute.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-danger-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-danger" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-matte-black-900">
                        {t('p2p.disputes.dispute')} #{dispute.id.slice(-8)}
                      </h3>
                      <p className="text-sm text-matte-black-600">
                        {t('p2p.disputes.trade')} #{dispute.tradeId.slice(-8)}
                      </p>
                    </div>
                  </div>

                  {getStatusBadge(dispute.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-matte-black-600">
                      {t('p2p.disputes.reason')}
                    </div>
                    <div className="font-medium">
                      {getReasonLabel(dispute.reason)}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-matte-black-600">
                      {t('p2p.disputes.openedAt')}
                    </div>
                    <div className="font-medium">
                      {formatDate(dispute.createdAt)}
                    </div>
                  </div>

                  {dispute.resolvedAt && (
                    <div>
                      <div className="text-sm text-matte-black-600">
                        {t('p2p.disputes.resolvedAt')}
                      </div>
                      <div className="font-medium">
                        {formatDate(dispute.resolvedAt)}
                      </div>
                    </div>
                  )}
                </div>

                {dispute.attachments && dispute.attachments.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm text-matte-black-600 mb-2">
                      {t('p2p.disputes.attachments')}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {dispute.attachments.map((attachment, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          📎 {attachment}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {dispute.resolution && (
                  <div className="mb-4 p-3 bg-success-50 rounded-lg border border-success-200">
                    <div className="text-sm font-medium text-success-800 mb-1">
                      {t('p2p.disputes.resolution')}
                    </div>
                    <p className="text-sm text-success-700">
                      {dispute.resolution}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-matte-black-600">
                    <User className="h-4 w-4 mr-1" />
                    {t('p2p.disputes.openedBy')} User #{dispute.openedBy.slice(-6)}
                  </div>

                  <div className="flex space-x-2">
                    <Link to={`/p2p/trade/${dispute.tradeId}`}>
                      <Button variant="outline" size="sm">
                        {t('p2p.disputes.viewTrade')}
                      </Button>
                    </Link>

                    {dispute.status === 'OPEN' && (
                      <Button size="sm">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        {t('p2p.disputes.respond')}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Help Section */}
      <Card className="p-6 bg-info-50 border-info-200">
        <h3 className="text-lg font-semibold text-matte-black-900 mb-3 flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          {t('p2p.disputes.help.title')}
        </h3>
        <div className="space-y-2 text-sm text-matte-black-700">
          <p>• {t('p2p.disputes.help.tip1')}</p>
          <p>• {t('p2p.disputes.help.tip2')}</p>
          <p>• {t('p2p.disputes.help.tip3')}</p>
          <p>• {t('p2p.disputes.help.tip4')}</p>
        </div>
      </Card>
    </motion.div>
  )
}