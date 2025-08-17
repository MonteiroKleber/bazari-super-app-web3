import React from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Filter, MapPin, Clock, DollarSign } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { Badge } from '@shared/ui/Badge'
import { Input } from '@shared/ui/Input'
import { Avatar } from '@shared/ui/Avatar'
import { EmptyState } from '@shared/ui/EmptyState'

export const WorkHome: React.FC = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = React.useState('')

  // Mock jobs data
  const jobs = [
    {
      id: '1',
      title: 'Desenvolvedor React Senior',
      company: 'TechStart',
      location: 'São Paulo, SP',
      type: 'Remoto',
      salary: { min: 8000, max: 12000, currency: 'BRL' },
      description: 'Procuramos desenvolvedor React experiente para liderar projetos...',
      skills: ['React', 'TypeScript', 'Node.js'],
      postedBy: {
        name: 'Carlos Silva',
        avatar: undefined,
        verified: true
      },
      postedAt: '2024-08-16T10:00:00Z',
      applicants: 12
    },
    {
      id: '2',
      title: 'Designer UI/UX',
      company: 'Creative Agency',
      location: 'Rio de Janeiro, RJ',
      type: 'Freelance',
      salary: { min: 150, max: 300, currency: 'BZR' },
      description: 'Buscamos designer criativo para projetos de curto prazo...',
      skills: ['Figma', 'Adobe XD', 'Prototyping'],
      postedBy: {
        name: 'Ana Costa',
        avatar: undefined,
        verified: false
      },
      postedAt: '2024-08-15T14:30:00Z',
      applicants: 8
    }
  ]

  const formatSalary = (salary: any) => {
    const formatter = salary.currency === 'BRL' 
      ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
      : (amount: number) => `${amount} BZR`
    
    return `${formatter.format ? formatter.format(salary.min) : formatter(salary.min)} - ${formatter.format ? formatter.format(salary.max) : formatter(salary.max)}`
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const postTime = new Date(timestamp)
    const diffMs = now.getTime() - postTime.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    
    if (diffHours < 24) return `${diffHours}h atrás`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d atrás`
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-matte-black-900 mb-2">
              Bazari Work
            </h1>
            <p className="text-matte-black-600">
              Encontre trabalhos pagos em BZR
            </p>
          </div>
          
          <Button onClick={() => navigate('/work/create')}>
            <Plus size={16} className="mr-2" />
            Publicar Vaga
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Buscar vagas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={20} />}
            />
          </div>
          
          <Button variant="outline" size="sm">
            <Filter size={16} className="mr-2" />
            Filtros
          </Button>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-3 mb-8">
          {[
            'Desenvolvimento', 'Design', 'Marketing', 'Vendas', 
            'Redação', 'Tradução', 'Consultoria', 'Outros'
          ].map((category) => (
            <Button
              key={category}
              variant="outline"
              size="sm"
              className="rounded-full"
            >
              {category}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <EmptyState
          title="Nenhuma vaga encontrada"
          description="Seja o primeiro a publicar uma vaga de trabalho!"
          action={
            <Button onClick={() => navigate('/work/create')}>
              <Plus size={16} className="mr-2" />
              Publicar Primeira Vaga
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {jobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className="p-6 cursor-pointer hover:shadow-soft-lg transition-shadow"
                onClick={() => navigate(`/work/job/${job.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-matte-black-900">
                        {job.title}
                      </h3>
                      <Badge variant="primary" size="sm">
                        {job.type}
                      </Badge>
                    </div>
                    
                    <p className="text-lg text-matte-black-700 mb-2">
                      {job.company}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-matte-black-600 mb-3">
                      <div className="flex items-center">
                        <MapPin size={14} className="mr-1" />
                        <span>{job.location}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <DollarSign size={14} className="mr-1" />
                        <span>{formatSalary(job.salary)}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <Clock size={14} className="mr-1" />
                        <span>{formatTimeAgo(job.postedAt)}</span>
                      </div>
                    </div>
                    
                    <p className="text-matte-black-600 mb-4 line-clamp-2">
                      {job.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.skills.map((skill) => (
                        <Badge key={skill} variant="neutral" size="sm">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Avatar 
                          src={job.postedBy.avatar} 
                          fallback={job.postedBy.name}
                          size="sm" 
                        />
                        <span className="text-sm text-matte-black-600">
                          Por {job.postedBy.name}
                        </span>
                        {job.postedBy.verified && (
                          <span className="text-bazari-red text-sm">✓</span>
                        )}
                      </div>
                      
                      <span className="text-sm text-matte-black-500">
                        {job.applicants} candidatos
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
