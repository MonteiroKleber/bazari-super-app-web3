import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { Input } from '@shared/ui/Input'
import { Textarea } from '@shared/ui/Textarea'
import { toast } from '@features/notifications/components/NotificationToastHost'

export const WorkCreate: React.FC = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = React.useState({
    title: '',
    company: '',
    location: '',
    type: '',
    salary: '',
    currency: 'BZR',
    description: '',
    requirements: '',
    skills: ''
  })
  const [isLoading, setIsLoading] = React.useState(false)

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('Vaga publicada com sucesso!')
      navigate('/work')
    } catch (error) {
      toast.error('Erro ao publicar vaga')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-matte-black-900 mb-2">
          Publicar Vaga
        </h1>
        <p className="text-matte-black-600">
          Encontre os melhores profissionais para seu projeto
        </p>
      </motion.div>

      <Card className="p-8">
        <div className="space-y-6">
          <Input
            label="Título da Vaga"
            placeholder="Ex: Desenvolvedor React Senior"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Empresa"
              placeholder="Nome da empresa"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            />
            
            <Input
              label="Localização"
              placeholder="São Paulo, SP ou Remoto"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="form-label">Tipo</label>
              <select
                className="form-input"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="">Selecione</option>
                <option value="CLT">CLT</option>
                <option value="PJ">PJ</option>
                <option value="Freelance">Freelance</option>
                <option value="Remoto">Remoto</option>
              </select>
            </div>
            
            <Input
              label="Salário"
              placeholder="5000-8000"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
            />
            
            <div>
              <label className="form-label">Moeda</label>
              <select
                className="form-input"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              >
                <option value="BZR">BZR</option>
                <option value="BRL">BRL</option>
              </select>
            </div>
          </div>

          <Textarea
            label="Descrição da Vaga"
            placeholder="Descreva a vaga, responsabilidades e o que procura no candidato..."
            rows={6}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />

          <Textarea
            label="Requisitos"
            placeholder="Liste os requisitos necessários..."
            rows={4}
            value={formData.requirements}
            onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
          />

          <Input
            label="Habilidades (separadas por vírgula)"
            placeholder="React, TypeScript, Node.js"
            value={formData.skills}
            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
          />

          <div className="flex space-x-4 pt-6">
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              loading={isLoading}
              className="flex-1"
              size="lg"
            >
              Publicar Vaga
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate('/work')}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}