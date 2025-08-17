import React from 'react'
import { motion } from 'framer-motion'
import { useParams } from 'react-router-dom'
import { ThumbsUp, ThumbsDown, Clock, Users } from 'lucide-react'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { Badge } from '@shared/ui/Badge'
import { Avatar } from '@shared/ui/Avatar'
import { toast } from '@features/notifications/components/NotificationToastHost'

export const DAOProposal: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [hasVoted, setHasVoted] = React.useState(false)
  const [userVote, setUserVote] = React.useState<'for' | 'against' | null>(null)

  // Mock proposal data
  const proposal = {
    id: id!,
    title: 'Reduzir taxas de transação para 0.1%',
    description: `Esta proposta visa tornar o marketplace Bazari mais competitivo reduzindo as taxas de transação dos atuais 0.5% para 0.1%.

## Justificativa
- Maior competitividade com outros marketplaces
- Incentivo para mais transações
- Crescimento da base de usuários

## Impacto Esperado
- Aumento de 25% no volume de transações
- Redução da receita de taxas em curto prazo
- Crescimento sustentável em longo prazo

## Cronograma
Se aprovada, a implementação ocorrerá em 30 dias.`,
    proposer: {
      name: 'João Santos',
      avatar: undefined,
      reputation: 4.8
    },
    status: 'voting',
    createdAt: '2024-08-10T10:00:00.000Z',
    endsAt: '2024-08-22T23:59:59.000Z',
    votes: {
      for: 1250,
      against: 340,
      total: 1590
    },
    quorum: 2000,
    category: 'governance'
  }

  const handleVote = async (vote: 'for' | 'against') => {
    if (hasVoted) {
      toast.error('Você já votou nesta proposta')
      return
    }

    try {
      // Mock voting
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setHasVoted(true)
      setUserVote(vote)
      toast.success(`Voto ${vote === 'for' ? 'a favor' : 'contra'} registrado!`)
    } catch (error) {
      toast.error('Erro ao registrar voto')
    }
  }

  const timeLeft = React.useMemo(() => {
    const now = new Date()
    const endDate = new Date(proposal.endsAt)
    const diff = endDate.getTime() - now.getTime()
    
    if (diff <= 0) return 'Encerrada'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    return `${days}d ${hours}h restantes`
  }, [proposal.endsAt])

  const approvalPercentage = (proposal.votes.for / proposal.votes.total) * 100
  const quorumProgress = (proposal.votes.total / proposal.quorum) * 100

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center space-x-3 mb-4">
          <h1 className="text-3xl font-bold text-matte-black-900">
            {proposal.title}
          </h1>
          <Badge variant="warning" size="sm">
            Votação Ativa
          </Badge>
        </div>
        
        <div className="flex items-center space-x-6 text-sm text-matte-black-600">
          <div className="flex items-center">
            <Avatar src={proposal.proposer.avatar} fallback={proposal.proposer.name} size="sm" className="mr-2" />
            <span>Proposto por {proposal.proposer.name}</span>
          </div>
          
          <div className="flex items-center">
            <Clock size={14} className="mr-1" />
            <span>{timeLeft}</span>
          </div>
          
          <div className="flex items-center">
            <Users size={14} className="mr-1" />
            <span>{proposal.votes.total} votos</span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold text-matte-black-900 mb-4">
              Descrição da Proposta
            </h2>
            
            <div className="prose max-w-none">
              {proposal.description.split('\n\n').map((paragraph, index) => {
                if (paragraph.startsWith('## ')) {
                  return (
                    <h3 key={index} className="text-lg font-semibold text-matte-black-900 mt-6 mb-3">
                      {paragraph.replace('## ', '')}
                    </h3>
                  )
                }
                
                if (paragraph.startsWith('- ')) {
                  return (
                    <ul key={index} className="list-disc pl-6 mb-4">
                      {paragraph.split('\n').map((item, itemIndex) => (
                        <li key={itemIndex} className="text-matte-black-700">
                          {item.replace('- ', '')}
                        </li>
                      ))}
                    </ul>
                  )
                }
                
                return (
                  <p key={index} className="text-matte-black-700 mb-4">
                    {paragraph}
                  </p>
                )
              })}
            </div>
          </Card>
          
          {/* Comments section placeholder */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-matte-black-900 mb-4">
              Discussão da Comunidade
            </h3>
            <p className="text-matte-black-600 text-center py-8">
              Sistema de comentários será implementado em breve
            </p>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Voting */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-matte-black-900 mb-4">
              Votação
            </h3>
            
            {hasVoted ? (
              <div className="text-center py-4">
                <Badge 
                  variant={userVote === 'for' ? 'success' : 'danger'} 
                  size="lg"
                >
                  Você votou {userVote === 'for' ? 'A FAVOR' : 'CONTRA'}
                </Badge>
              </div>
            ) : (
              <div className="space-y-3">
                <Button
                  onClick={() => handleVote('for')}
                  className="w-full"
                  size="lg"
                >
                  <ThumbsUp size={16} className="mr-2" />
                  Votar A Favor
                </Button>
                
                <Button
                  onClick={() => handleVote('against')}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <ThumbsDown size={16} className="mr-2" />
                  Votar Contra
                </Button>
              </div>
            )}
          </Card>

          {/* Results */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-matte-black-900 mb-4">
              Resultados Atuais
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-matte-black-600">A Favor</span>
                  <span className="text-sm font-medium">
                    {proposal.votes.for} ({approvalPercentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-sand-200 rounded-full h-2">
                  <div 
                    className="bg-success h-2 rounded-full transition-all duration-300"
                    style={{ width: `${approvalPercentage}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-matte-black-600">Contra</span>
                  <span className="text-sm font-medium">
                    {proposal.votes.against} ({(100 - approvalPercentage).toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-sand-200 rounded-full h-2">
                  <div 
                    className="bg-danger h-2 rounded-full transition-all duration-300"
                    style={{ width: `${100 - approvalPercentage}%` }}
                  />
                </div>
              </div>
              
              <div className="pt-4 border-t border-sand-200">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-matte-black-600">Quórum</span>
                  <span className="text-sm font-medium">
                    {proposal.votes.total} / {proposal.quorum} ({quorumProgress.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-sand-200 rounded-full h-2">
                  <div 
                    className="bg-bazari-red h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(quorumProgress, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Details */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-matte-black-900 mb-4">
              Detalhes
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-matte-black-600">Categoria:</span>
                <Badge variant="neutral" size="sm">
                  Governança
                </Badge>
              </div>
              
              <div className="flex justify-between">
                <span className="text-matte-black-600">Criada em:</span>
                <span>{new Date(proposal.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-matte-black-600">Termina em:</span>
                <span>{new Date(proposal.endsAt).toLocaleDateString('pt-BR')}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-matte-black-600">Quórum mínimo:</span>
                <span>{proposal.quorum} votos</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
