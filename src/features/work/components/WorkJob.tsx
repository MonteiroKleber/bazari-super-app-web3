import React from 'react'
import { useParams } from 'react-router-dom'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'

export const WorkJob: React.FC = () => {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Card className="p-6">
        <h1 className="text-2xl font-bold text-matte-black-900 mb-4">
          Detalhes da Vaga
        </h1>
        <p className="text-matte-black-600 mb-6">
          Detalhes da vaga {id} serão mostrados aqui.
        </p>
        
        <Button>
          Candidatar-se
        </Button>
      </Card>
    </div>
  )
}
