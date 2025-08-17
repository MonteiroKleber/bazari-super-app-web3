import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { Input } from '@shared/ui/Input'
import { Textarea } from '@shared/ui/Textarea'
import { toast } from '@features/notifications/components/NotificationToastHost'

export const DAOCreate: React.FC = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = React.useState({
    title: '',
    category: '',
    description: '',
    implementation: '',
    timeline: ''
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
      toast.success('Proposta criada com sucesso!')
      navigate('/dao')
    } catch (error) {
      toast.error('Erro ao criar proposta')
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
          Nova Proposta DAO
        </h1>
        <p className="text-matte-black-600">
          Submeta uma proposta para votação da comunidade
        </p>
      </motion.div>

      <Card className="p-8">
        <div className="space-y-6">
          <Input
            label="Título da Proposta"
            placeholder="Ex: Reduzir taxas de transação para 0.1%"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div>
            <label className="form-label">Categoria</label>
            <select
              className="form-input"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="">Selecione uma categoria</option>
              <option value="governance">Governança</option>
              <option value="treasury">Tesouro</option>
              <option value="technical">Técnica</option>
              <option value="community">Comunidade</option>
              <option value="partnerships">Parcerias</option>
            </select>
          </div>

          <Textarea
            label="Descrição Detalhada"
            placeholder="Descreva sua proposta em detalhes, incluindo justificativa, impacto esperado e benefícios..."
            rows={8}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            helperText="Use Markdown para formatação. Seja claro e objetivo."
            required
          />

          <Textarea
            label="Plano de Implementação"
            placeholder="Como esta proposta será implementada? Quais recursos são necessários?"
            rows={4}
            value={formData.implementation}
            onChange={(e) => setFormData({ ...formData, implementation: e.target.value })}
          />

          <Input
            label="Cronograma Estimado"
            placeholder="Ex: 30 dias para implementação"
            value={formData.timeline}
            onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
          />

          <div className="flex space-x-4 pt-6">
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              loading={isLoading}
              className="flex-1"
              size="lg"
            >
              Submeter Proposta
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate('/dao')}
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
