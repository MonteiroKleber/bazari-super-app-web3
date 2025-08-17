import React from 'react'
import { motion } from 'framer-motion'
import { Plus, Vote, Users, DollarSign, TrendingUp, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { Badge } from '@shared/ui/Badge'
import { Avatar } from '@shared/ui/Avatar'
import { useI18n } from '@app/providers/I18nProvider'

export const DAOHome: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useI18n()

  // Mock proposals data
  const proposals = [
    {
      id: '1',
      title: 'Reduzir taxas de transação para 0.1%',
      description: 'Proposta para tornar o marketplace mais competitivo reduzindo as taxas.',
      proposer: 'João Santos',
      status: 'active',
      votes: { for: 1250, against: 340 },
      timeLeft: '5 dias',
      category: 'governance'
    },
    {
      id: '2', 
      title: 'Implementar sistema de cashback em BZR',
      description: 'Usuários receberiam 1% de cashback em BZR nas compras.',
      proposer: 'Maria Silva',
      status: 'voting',
      votes: { for: 890, against: 456 },
      timeLeft: '2 dias',
      category: 'rewards'
    },
    {
      id: '3',
      title: 'Criar fundo de desenvolvimento',
      description: 'Alocar 5% das taxas para um fundo de desenvolvimento da plataforma.',
      proposer: 'Carlos Lima',
      status: 'passed',
      votes: { for: 2100, against: 200 },
      timeLeft: 'Aprovada',
      category: 'treasury'
    }
  ]

  const stats = {
    totalMembers: 3420,
    activeProposals: 12,
    treasuryValue: 2500000,
    monthlyGrowth: 15.2
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'primary'
      case 'voting': return 'warning'
      case 'passed': return 'success'
      case 'rejected': return 'danger'
      default: return 'neutral'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Em Discussão'
      case 'voting': return 'Votação'
      case 'passed': return 'Aprovada'
      case 'rejected': return 'Rejeitada'
      default: return status
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-matte-black-900 mb-2">
              DAO Bazari
            </h1>
            <p className="text-matte-black-600">
              Governança descentralizada da comunidade
            </p>
          </div>
          
          <Button onClick={() => navigate('/dao/create')}>
            <Plus size={16} className="mr-2" />
            Nova Proposta
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-matte-black-600 mb-1">Membros</p>
                <p className="text-2xl font-bold text-matte-black-900">
                  {stats.totalMembers.toLocaleString()}
                </p>
              </div>
              <Users className="text-bazari-red" size={32} />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-matte-black-600 mb-1">Propostas Ativas</p>
                <p className="text-2xl font-bold text-matte-black-900">
                  {stats.activeProposals}
                </p>
              </div>
              <Vote className="text-bazari-gold-600" size={32} />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-matte-black-600 mb-1">Tesouro</p>
                <p className="text-2xl font-bold text-matte-black-900">
                  {new Intl.NumberFormat('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(stats.treasuryValue)}
                </p>
              </div>
              <DollarSign className="text-success" size={32} />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-matte-black-600 mb-1">Crescimento</p>
                <p className="text-2xl font-bold text-matte-black-900">
                  +{stats.monthlyGrowth}%
                </p>
                <p className="text-xs text-matte-black-500">Este mês</p>
              </div>
              <TrendingUp className="text-success" size={32} />
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Proposals */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-matte-black-900">
          Propostas Recentes
        </h2>
        
        {proposals.map((proposal, index) => (
          <motion.div
            key={proposal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className="p-6 cursor-pointer hover:shadow-soft-lg transition-shadow"
              onClick={() => navigate(`/dao/proposal/${proposal.id}`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-matte-black-900">
                      {proposal.title}
                    </h3>
                    <Badge 
                      variant={getStatusColor(proposal.status) as any}
                      size="sm"
                    >
                      {getStatusLabel(proposal.status)}
                    </Badge>
                  </div>
                  
                  <p className="text-matte-black-600 mb-3">
                    {proposal.description}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-sm text-matte-black-500">
                    <div className="flex items-center">
                      <Avatar size="sm" fallback={proposal.proposer} className="mr-2" />
                      <span>Por {proposal.proposer}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Clock size={14} className="mr-1" />
                      <span>{proposal.timeLeft}</span>
                    </div>
                  </div>
                </div>
                
                {proposal.status !== 'passed' && proposal.status !== 'rejected' && (
                  <div className="text-right">
                    <div className="flex items-center space-x-4 mb-2">
                      <div className="text-center">
                        <p className="text-lg font-bold text-success">
                          {proposal.votes.for}
                        </p>
                        <p className="text-xs text-matte-black-500">Favor</p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-lg font-bold text-danger">
                          {proposal.votes.against}
                        </p>
                        <p className="text-xs text-matte-black-500">Contra</p>
                      </div>
                    </div>
                    
                    <Button size="sm" onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/dao/proposal/${proposal.id}`)
                    }}>
                      Votar
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Vote progress bar */}
              {proposal.status !== 'passed' && proposal.status !== 'rejected' && (
                <div className="w-full bg-sand-200 rounded-full h-2">
                  <div 
                    className="bg-success h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(proposal.votes.for / (proposal.votes.for + proposal.votes.against)) * 100}%` 
                    }}
                  />
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
